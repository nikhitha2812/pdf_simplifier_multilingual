# Multi-Language PDF Simplifier with Audio

An AI-powered web app that turns any PDF into a simplified, multilingual explanation you can listen to. Upload a document, choose how simple you want it (Beginner / Intermediate / Advanced), translate into one of 7 Indian languages, and generate audio narration — all in your browser.

![stack](https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20Supabase-1551de)

## Features

- **PDF upload** — drag & drop up to 20 MB, with file-name and page-count display.
- **Client-side text extraction** — uses `pdfjs-dist`; preserves paragraph structure and handles multi-page documents.
- **AI simplification** — three reading levels, with an LLM (Gemini/OpenAI) when a key is configured or a deterministic heuristic fallback otherwise.
- **7 languages** — English, Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali.
- **Audio narration** — play, pause, resume, stop, and download as MP3.
- **History** — every processed PDF is stored and searchable; reopen prior results directly.
- **Light/Dark mode** with system-preference detection.
- **Copy-to-clipboard, download simplified text as PDF, download translated text as TXT.**
- **Secure handling** — RLS-enabled table, edge functions with mandatory CORS.

## Architecture

This project ships as a **single deployable Vite + React frontend** with **Supabase edge functions** as the serverless backend (equivalent to the FastAPI routes in the original spec). PDF extraction happens in-browser so files never leave the client unless the user saves a result to history.

```
project/
├── src/
│   ├── components/        # Dropzone, LevelSelector, AudioPlayer, …
│   ├── hooks/            # useTheme (dark/light)
│   ├── lib/              # supabase client, api wrapper, pdf extraction, types
│   ├── pages/            # Home, Dashboard, History
│   ├── App / Layout / main.tsx
│   └── index.css         # Tailwind design system
├── supabase/functions/
│   ├── simplify-pdf/     # POST { text, level } → { text }
│   ├── translate-pdf/    # POST { text, target } → { text }
│   └── tts-pdf/          # POST { text, lang } → { audio, format }
├── tailwind.config.js, vite.config.ts, package.json
└── README.md
```

The Supabase project is pre-provisioned; `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are in `.env`. The database has one table:

- **`pdf_history`** (`id`, `file_name`, `page_count`, `level`, `language`, `simplified_text`, `translated_text`, `created_at`) with RLS enabled and four CRUD policies scoped to `anon, authenticated` (single-tenant, intentionally shared data — no signup flow).

## Edge functions

| Function        | Input                              | Fallback when no API key                   |
|-----------------|------------------------------------|--------------------------------------------|
| `simplify-pdf`  | `{ text, level }`                  | Heuristic sentence-lightening + chunking   |
| `translate-pdf` | `{ text, target }`                 | Google Translate public endpoint           |
| `tts-pdf`        | `{ text, lang }`                   | Google Translate TTS endpoint (MP3)        |

If you add `GEMINI_API_KEY` (simplify + translate) and `ELEVENLABS_API_KEY`/`ELEVENLABS_VOICE_ID` (tts) as Supabase edge-function secrets, the functions automatically use them. Without them, the documented fallbacks keep the app fully functional.

## Local development

```bash
npm install
npm run dev      # Vite dev server (auto-started by the Bolt harness)
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Deployment

### Frontend — Vercel

1. Push this repository to GitHub.
2. In Vercel, **New Project** → import the repo.
3. Framework preset: **Vite**. Build command `npm run build`, output dir `dist`.
4. Add the two environment variables from your local `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. Vercel serves the SPA with client-side routing out of the box.

### Backend — Render

The backend consists of Supabase edge functions (serverless, no separate host needed), plus optional `supabase/functions/` files. To mirror the original FastAPI-style deployment on Render, either:

- **Option A (recommended):** keep using the deployed Supabase edge functions — no Render service required.
- **Option B (custom Python service):** create a `backend/` folder with a FastAPI app that proxies the same providers, then deploy as a Render **Web Service** (`pip install -r requirements.txt` → `uvicorn main:app --host 0.0.0.0 --port $PORT`), adding `GEMINI_API_KEY` / `ELEVENLABS_API_KEY` as Render env vars and pointing the frontend's `api.ts` at that service's base URL.

## Security notes

- All edge functions include mandatory CORS headers on every response (preflight, success, error).
- The history table has RLS enabled; policies are intentionally permissive (`anon, authenticated`) because the app is single-tenant with no account flow. If you add auth, switch the policies to `auth.uid()` ownership checks.
- PDFs are parsed entirely in the browser; the uploaded file is never sent over the network. Only extracted text (truncated to 18k chars) is sent to the simplify/translate functions.

## Tech stack

React 18 · TypeScript · Vite · Tailwind CSS · React Router · `pdfjs-dist` · `@supabase/supabase-js` · `jspdf` · `lucide-react` · Supabase (Postgres + Edge Functions / Deno).
