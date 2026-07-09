import { useEffect, useState } from 'react'
import { Wand as Wand2, Languages as LangIcon, Loader as Loader2, RotateCcw, Save } from 'lucide-react'
import Dropzone from '../components/Dropzone'
import LevelSelector from '../components/LevelSelector'
import LanguageSelector from '../components/LanguageSelector'
import ResultPanel from '../components/ResultPanel'
import AudioPlayer from '../components/AudioPlayer'
import ProgressSteps from '../components/ProgressSteps'
import ErrorBanner from '../components/ErrorBanner'
import { extractPdfText } from '../lib/pdf'
import { api, saveHistory } from '../lib/api'
import { LANGUAGES, type LanguageCode, type SimplificationLevel } from '../lib/types'

type Phase = 'idle' | 'extracting' | 'simplifying' | 'translating' | 'done'

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [pageCount, setPageCount] = useState<number | undefined>()
  const [level, setLevel] = useState<SimplificationLevel>('intermediate')
  const [lang, setLang] = useState<LanguageCode>('en')
  const [extractedText, setExtractedText] = useState('')
  const [simplified, setSimplified] = useState('')
  const [translated, setTranslated] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Restore a previously saved record when reopened from History
  useEffect(() => {
    const raw = sessionStorage.getItem('reopenHistory')
    if (!raw) return
    sessionStorage.removeItem('reopenHistory')
    try {
      const h = JSON.parse(raw) as {
        file_name: string
        page_count: number
        level: SimplificationLevel
        language: LanguageCode
        simplified_text: string
        translated_text: string
      }
      setFileName(h.file_name)
      setPageCount(h.page_count)
      setLevel(h.level)
      setLang(h.language)
      setSimplified(h.simplified_text || '')
      setTranslated(h.translated_text || '')
      setPhase(h.translated_text ? 'done' : 'idle')
      setSaved(true)
    } catch { /* ignore malformed */ }
  }, [])

  async function onFileSelected(f: File) {
    setFile(f)
    setFileName(f.name)
    setPageCount(undefined)
    setExtractedText('')
    setSimplified('')
    setTranslated('')
    setSaved(false)
    setError(null)
    try {
      setPhase('extracting')
      const out = await extractPdfText(f)
      setExtractedText(out.text)
      setPageCount(out.pageCount)
      setPhase('idle')
    } catch (e: any) {
      setError(e?.message || 'Failed to read this PDF. It may be corrupted or image-only.')
      setPhase('idle')
      setFile(null)
      setFileName('')
    }
  }

  function reset() {
    setFile(null)
    setFileName('')
    setPageCount(undefined)
    setExtractedText('')
    setSimplified('')
    setTranslated('')
    setPhase('idle')
    setError(null)
    setSaved(false)
  }

  async function simplify() {
    if (!extractedText) return
    setError(null)
    setSimplified('')
    setTranslated('')
    setSaved(false)
    try {
      setPhase('simplifying')
      const out = await api.simplify(extractedText, level)
      setSimplified(out)
      setPhase('idle')
    } catch (e: any) {
      setError(e?.message || 'Failed to simplify. Please try again.')
      setPhase('idle')
    }
  }

  async function translate() {
    if (!simplified) return
    setError(null)
    setTranslated('')
    setSaved(false)
    try {
      setPhase('translating')
      const out = await api.translate(simplified, level, lang)
      setTranslated(out)
      setPhase('done')
    } catch (e: any) {
      setError(e?.message || 'Failed to translate. Please try again.')
      setPhase('idle')
    }
  }

  async function save() {
    if (!file || !simplified || !translated) return
    await saveHistory({
      file_name: file.name,
      page_count: pageCount || 0,
      level,
      language: lang,
      simplified_text: simplified,
      translated_text: translated,
    })
    setSaved(true)
  }

  const steps = [
    { label: 'Extract', done: !!extractedText, active: phase === 'extracting' },
    { label: 'Simplify', done: !!simplified, active: phase === 'simplifying' },
    { label: 'Translate', done: !!translated, active: phase === 'translating' },
    { label: 'Listen', done: phase === 'done', active: phase === 'done' },
  ]

  const busy = phase === 'extracting' || phase === 'simplifying' || phase === 'translating'

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Upload a PDF, simplify it, translate it, and listen to the narration.
        </p>
      </div>

      <ErrorBanner message={error} onClose={() => setError(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* LEFT: controls */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              1. Upload PDF
            </label>
            <Dropzone
              onFile={onFileSelected}
              fileName={fileName}
              pageCount={pageCount}
              onClear={reset}
              disabled={busy}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              2. Simplification level
            </label>
            <LevelSelector value={level} onChange={setLevel} disabled={busy || !extractedText} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              3. Target language
            </label>
            <LanguageSelector
              value={lang}
              onChange={(v) => {
                setLang(v)
                // Clear prior translation so user re-runs translate for the new language
                setTranslated('')
                if (phase === 'done') setPhase('idle')
              }}
              disabled={busy}
            />
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={simplify}
              disabled={!extractedText || busy}
              className="btn-primary w-full"
            >
              {phase === 'simplifying' ? (
                <><Loader2 size={16} className="animate-spin" /> Simplifying...</>
              ) : (
                <><Wand2 size={16} /> Simplify Content</>
              )}
            </button>
            <button
              onClick={translate}
              disabled={!simplified || busy}
              className="btn-secondary w-full"
            >
              {phase === 'translating' ? (
                <><Loader2 size={16} className="animate-spin" /> Translating...</>
              ) : (
                <><LangIcon size={16} /> Translate to {LANGUAGES.find((l) => l.code === lang)?.name}</>
              )}
            </button>
            {file && (
              <button onClick={reset} className="btn-ghost w-full">
                <RotateCcw size={14} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: results */}
        <div className="lg:col-span-2 space-y-6">
          {busy && <ProgressSteps steps={steps} />}

          {!busy && !extractedText && (
            <div className="card p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
                <Wand2 size={28} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Nothing here yet</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                Upload a PDF on the left, then simplify and translate to see results here.
              </p>
            </div>
          )}

          {simplified && !busy && (
            <div className="grid grid-cols-1 gap-6">
              <ResultPanel title="Simplified (English)" text={simplified} asPdf />
              {translated && (
                <>
                  <ResultPanel
                    title={`Translated — ${LANGUAGES.find((l) => l.code === lang)?.name}`}
                    text={translated}
                  />
                  <AudioPlayer text={translated} lang={lang} />
                  <div className="flex justify-end">
                    <button onClick={save} disabled={saved} className="btn-secondary text-sm">
                      <Save size={14} /> {saved ? 'Saved to history' : 'Save to history'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {simplified && !translated && !busy && (
            <div className="card p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Select a language above and click <strong>Translate</strong> to continue.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
