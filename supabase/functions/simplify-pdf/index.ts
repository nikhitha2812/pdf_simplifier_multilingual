import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";

const PROMPTS: Record<string, string> = {
  beginner:
    "Simplify this text for a beginner. Use everyday words, short sentences, and simple analogies. Remove all jargon or explain it plainly. Keep all key facts.",
  intermediate:
    "Rewrite this text at an intermediate reading level. Keep important technical terms but briefly explain them. Keep all key facts and structure.",
  advanced:
    "Summarize this text concisely at an advanced level. Preserve the technical vocabulary and the original structure. Keep all key facts.",
};

async function callGemini(text: string, level: string): Promise<string> {
  const prompt = `${PROMPTS[level] || PROMPTS.intermediate}\n\nText:\n${text}`;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
      }),
    }
  );
  if (res.status === 429) throw Object.assign(new Error("rate_limited"), { rateLimited: true });
  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  const out = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
  if (!out.trim()) throw new Error("Empty response from Gemini");
  return out.trim();
}

async function callOpenAI(text: string, level: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 2048,
      messages: [
        { role: "system", content: PROMPTS[level] || PROMPTS.intermediate },
        { role: "user", content: text },
      ],
    }),
  });
  if (res.status === 429) throw Object.assign(new Error("rate_limited"), { rateLimited: true });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
  const data = await res.json();
  const out = data?.choices?.[0]?.message?.content ?? "";
  if (!out.trim()) throw new Error("Empty response from OpenAI");
  return out.trim();
}

function fallbackSimplify(text: string, level: string): string {
  const sentences = text.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/).filter(Boolean);
  const maxWords = level === "beginner" ? 14 : level === "advanced" ? 30 : 22;
  const FILLER = /\b(moreover|furthermore|nevertheless|notwithstanding|heretofore|therein|thereof|aforementioned|henceforth|accordingly|consequently|thereby)\b/gi;
  const cleaned: string[] = [];
  for (const s of sentences.slice(0, 280)) {
    let out = s.trim()
      .replace(FILLER, (m) =>
        level === "beginner" ? "" : level === "intermediate" ? `[${m.toLowerCase()}]` : m
      )
      .replace(/\s{2,}/g, " ")
      .replace(/\s+([,.;:!?])/g, "$1");
    const words = out.split(" ");
    if (words.length > maxWords) {
      const chunks: string[] = [];
      for (let i = 0; i < words.length; i += maxWords) {
        const chunk = words.slice(i, i + maxWords).join(" ");
        chunks.push(chunk + (i + maxWords < words.length ? "." : ""));
      }
      out = chunks.join(" ");
    }
    cleaned.push(out);
  }
  const intro =
    level === "beginner"
      ? "Here is the explanation in simple words:\n\n"
      : level === "advanced"
      ? "Concise summary:\n\n"
      : "Summary:\n\n";
  return intro + cleaned.join(" ");
}

async function simplifyWithFallback(text: string, level: string): Promise<string> {
  // Try Gemini → OpenAI → local heuristic, falling back on any 429 or missing key
  if (GEMINI_KEY) {
    try { return await callGemini(text, level); } catch (e: any) {
      if (!e?.rateLimited) throw e;
    }
  }
  if (OPENAI_KEY) {
    try { return await callOpenAI(text, level); } catch (e: any) {
      if (!e?.rateLimited) throw e;
    }
  }
  return fallbackSimplify(text, level);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    const { text, level } = await req.json();
    if (!text || typeof text !== "string")
      return new Response(JSON.stringify({ error: "Missing text" }), {
        status: 400, headers: corsHeaders,
      });
    const lvl = ["beginner", "intermediate", "advanced"].includes(level)
      ? level
      : "intermediate";

    const out = await simplifyWithFallback(text, lvl);

    return new Response(JSON.stringify({ text: out }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: corsHeaders,
    });
  }
});
