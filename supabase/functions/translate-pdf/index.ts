import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";

const NAMES: Record<string, string> = {
  en: "English", hi: "Hindi", te: "Telugu", ta: "Tamil",
  kn: "Kannada", ml: "Malayalam", bn: "Bengali",
};

async function callGemini(text: string, target: string): Promise<string> {
  const langName = NAMES[target] || target;
  const prompt = `Translate the following text into ${langName}. Keep the meaning and structure. Output only the translated text, no preamble.\n\n${text}`;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
      }),
    }
  );
  if (res.status === 429) throw Object.assign(new Error("rate_limited"), { rateLimited: true });
  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  const out = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
  if (!out.trim()) throw new Error("Empty translation from Gemini");
  return out.trim();
}

async function fallbackTranslate(text: string, target: string): Promise<string> {
  // Google Translate free public endpoint — no API key needed
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(
      target
    )}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Translation endpoint error ${res.status}`);
  const json = await res.json();
  const parts: string[] = Array.isArray(json?.[0])
    ? json[0].map((seg: any) => (seg && seg[0]) || "").filter(Boolean)
    : [];
  const out = parts.join("");
  if (!out.trim()) throw new Error("Empty translation result");
  return out.trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    const { text, target } = await req.json();
    if (!text || typeof text !== "string")
      return new Response(JSON.stringify({ error: "Missing text" }), {
        status: 400, headers: corsHeaders,
      });
    if (!NAMES[target])
      return new Response(JSON.stringify({ error: "Unsupported language" }), {
        status: 400, headers: corsHeaders,
      });

    // If target is English, no translation needed
    if (target === "en") {
      return new Response(JSON.stringify({ text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let out: string;
    if (GEMINI_KEY) {
      try {
        out = await callGemini(text, target);
      } catch (e: any) {
        if (e?.rateLimited) out = await fallbackTranslate(text, target);
        else throw e;
      }
    } else {
      out = await fallbackTranslate(text, target);
    }

    return new Response(JSON.stringify({ text: out }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: corsHeaders,
    });
  }
});
