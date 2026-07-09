import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ELEVENLABS_KEY = Deno.env.get("ELEVENLABS_API_KEY") ?? "";
const ELEVENLABS_VOICE = Deno.env.get("ELEVENLABS_VOICE_ID") ?? "21m00Tcm4TlvDq8ikWAM";

// BCP-47 mapping for Google Translate TTS endpoint
const TTS_LANG: Record<string, string> = {
  en: "en-US", hi: "hi-IN", te: "te-IN", ta: "ta-IN",
  kn: "kn-IN", ml: "ml-IN", bn: "bn-IN",
};

async function elevenLabs(text: string): Promise<string> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_KEY,
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: { stability: 0.5, similarity_boost: 0.7 },
      }),
    }
  );
  // 402 = payment required, 429 = rate limit — mark as fallback-able
  if (!res.ok) throw Object.assign(new Error(`elevenlabs_${res.status}`), { useFallback: true });
  const buf = new Uint8Array(await res.arrayBuffer());
  return base64(buf);
}

/**
 * Fallback TTS: Google Translate's public text-to-speech endpoint returns an
 * MP3 stream directly. It needs no API key and supports our 7 languages.
 * The audio is base64-encoded so it can be returned as JSON.
 */
async function googleTts(text: string, lang: string): Promise<string> {
  const tlc = TTS_LANG[lang] || "en-US";
  // The endpoint is length-limited per chunk; split into ~180 char segments.
  const chunks = chunkText(text, 180);
  const parts: Uint8Array[] = [];
  for (const chunk of chunks) {
    const url =
      `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${encodeURIComponent(
        tlc
      )}&q=${encodeURIComponent(chunk)}`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`TTS endpoint error ${res.status}`);
    parts.push(new Uint8Array(await res.arrayBuffer()));
  }
  const total = parts.reduce((n, p) => n + p.length, 0);
  const merged = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    merged.set(p, off);
    off += p.length;
  }
  return base64(merged);
}

function chunkText(text: string, max: number): string[] {
  const out: string[] = [];
  let buf = "";
  for (const sentence of text.split(/(?<=[.!?।])\s+/)) {
    if ((buf + " " + sentence).length > max) {
      if (buf) out.push(buf.trim());
      buf = sentence;
      while (buf.length > max) {
        out.push(buf.slice(0, max));
        buf = buf.slice(max);
      }
    } else {
      buf = buf ? buf + " " + sentence : sentence;
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out.slice(0, 30);
}

function base64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    const { text, lang } = await req.json();
    if (!text || typeof text !== "string")
      return new Response(JSON.stringify({ error: "Missing text" }), {
        status: 400, headers: corsHeaders,
      });
    const l = TTS_LANG[lang] ? lang : "en";

    let audio: string;
    if (ELEVENLABS_KEY) {
      try {
        audio = await elevenLabs(text.slice(0, 2000));
      } catch (e: any) {
        if (e?.useFallback) audio = await googleTts(text, l);
        else throw e;
      }
    } else {
      audio = await googleTts(text, l);
    }

    return new Response(
      JSON.stringify({ audio, format: "mp3" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: corsHeaders,
    });
  }
});
