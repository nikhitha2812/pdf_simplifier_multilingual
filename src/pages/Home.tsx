import { Link } from 'react-router-dom'
import { CloudUpload as UploadCloud, Languages, AudioLines, Brain, ShieldCheck, History as HistoryIcon, ArrowRight, Sparkles, FileText, Zap, Globe as Globe2 } from 'lucide-react'

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Simplification',
    desc: 'Three reading levels turn dense academic or technical PDFs into plain understanding.',
  },
  {
    icon: Languages,
    title: '7 Languages',
    desc: 'English, Hindi, Telugu, Tamil, Kannada, Malayalam, and Bengali — instantly translated.',
  },
  {
    icon: AudioLines,
    title: 'Audio Narration',
    desc: 'Listen to explanations with play, pause, resume, stop, and MP3 download.',
  },
  {
    icon: HistoryIcon,
    title: 'Your History',
    desc: 'Every processed document is saved so you can revisit results anytime.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Private',
    desc: 'Row-level security on every record. Your uploads stay yours.',
  },
  {
    icon: Zap,
    title: 'Fast Edge Stack',
    desc: 'Simplification, translation, and TTS run as serverless edge functions.',
  },
]

const STEPS = [
  { icon: UploadCloud, title: 'Upload PDF', desc: 'Drag & drop up to 20 MB.' },
  { icon: Brain, title: 'Choose level', desc: 'Beginner, intermediate, or advanced.' },
  { icon: Globe2, title: 'Pick language', desc: 'Translate into 7 languages.' },
  { icon: AudioLines, title: 'Listen & download', desc: 'Audio narration as MP3.' },
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute top-20 right-1/4 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 dark:border-brand-900/50 bg-brand-50 dark:bg-brand-950/30 px-4 py-1.5 text-xs font-medium text-brand-700 dark:text-brand-300 animate-fade-in">
            <Sparkles size={14} /> AI-powered · Multilingual · Audio-ready
          </div>
          <h1 className="mt-6 text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white animate-slide-up">
            Read any PDF.
            <br />
            <span className="gradient-text">Understand it in your language.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300 animate-slide-up">
            Upload a document, pick how simple you want it, choose from seven Indian languages,
            and listen to a narrated explanation — all in seconds.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-slide-up">
            <Link to="/dashboard" className="btn-primary !px-7 !py-3 text-base">
              <UploadCloud size={18} /> Start Simplifying
            </Link>
            <Link to="/history" className="btn-secondary !px-7 !py-3 text-base">
              <HistoryIcon size={18} /> View History
            </Link>
          </div>

          {/* Floating preview card */}
          <div className="mt-16 mx-auto max-w-3xl animate-float">
            <div className="card p-1.5 shadow-2xl shadow-brand-600/10">
              <div className="rounded-xl bg-gradient-to-br from-slate-50 to-brand-50/50 dark:from-slate-900 dark:to-brand-950/30 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="ml-auto text-xs text-slate-400 font-mono">pdf-simplifier.app</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-left">
                  {STEPS.map((s, i) => {
                    const Icon = s.icon
                    return (
                      <div key={i} className="rounded-lg bg-white dark:bg-slate-950/60 p-3 border border-slate-200 dark:border-slate-800">
                        <Icon size={18} className="text-brand-500 mb-2" />
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{s.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{s.desc}</p>
                      </div>
                    )
                  })}
                  <div className="rounded-lg bg-brand-600 p-3 text-white flex flex-col justify-center">
                    <AudioLines size={18} className="mb-2" />
                    <p className="text-xs font-semibold">Narration ready</p>
                    <p className="text-[10px] opacity-80 mt-0.5 leading-tight">Download MP3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Everything you need to understand documents
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Built with a modern stack, security defaults, and thoughtful UX.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="card p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How it works</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">Four steps from PDF to audio.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="relative text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-lg shadow-brand-600/20">
                    <Icon size={26} />
                  </div>
                  <div className="mt-4 text-xs font-bold text-brand-600 dark:text-brand-400">
                    STEP {i + 1}
                  </div>
                  <h3 className="mt-1 font-semibold text-slate-900 dark:text-white">{s.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.desc}</p>
                  {i < STEPS.length - 1 && (
                    <ArrowRight
                      size={20}
                      className="hidden md:block absolute top-8 -right-3 text-slate-300 dark:text-slate-700"
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 p-10 sm:p-16 text-center shadow-2xl shadow-brand-600/30">
          <div className="absolute inset-0 -z-0 opacity-20">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-accent-300 blur-3xl" />
          </div>
          <div className="relative">
            <FileText className="mx-auto text-white" size={40} />
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
              Ready to simplify your first document?
            </h2>
            <p className="mt-3 text-brand-100 max-w-xl mx-auto">
              No signup needed for a first try. Upload, simplify, translate, and listen.
            </p>
            <Link
              to="/dashboard"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 font-semibold text-brand-700 hover:bg-brand-50 active:scale-[0.98] transition-all shadow-lg"
            >
              Open Dashboard <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
