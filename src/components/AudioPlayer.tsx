import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Square, Download, Volume2, Loader as Loader2, AudioLines } from 'lucide-react'
import { api } from '../lib/api'
import type { LanguageCode } from '../lib/types'

interface Props {
  text: string
  lang: LanguageCode
}

type Status = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'error'

export default function AudioPlayer({ text, lang }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const base64Ref = useState<{ data: string | null }>({ data: null })[0]

  useEffect(() => {
    // Reset when inputs change
    setStatus('idle')
    setError(null)
    setProgress(0)
    base64Ref.data = null
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, lang])

  async function generate() {
    setStatus('loading')
    setError(null)
    try {
      const audio = await api.tts(text, lang)
      base64Ref.data = audio
      const blob = await (await fetch(`data:audio/mpeg;base64,${audio}`)).blob()
      const url = URL.createObjectURL(blob)
      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.onended = () => setStatus('ready')
        audioRef.current.ontimeupdate = () => {
          const a = audioRef.current
          if (a && a.duration) setProgress((a.currentTime / a.duration) * 100)
        }
      }
      setStatus('ready')
    } catch (e: any) {
      setError(e?.message || 'Failed to generate audio')
      setStatus('error')
    }
  }

  function play() {
    const a = audioRef.current
    if (!a) return
    a.play()
    setStatus('playing')
  }
  function pause() {
    audioRef.current?.pause()
    setStatus('paused')
  }
  function stop() {
    const a = audioRef.current
    if (!a) return
    a.pause()
    a.currentTime = 0
    setProgress(0)
    setStatus('ready')
  }
  function download() {
    if (!base64Ref.data) return
    const link = document.createElement('a')
    link.href = `data:audio/mpeg;base64,${base64Ref.data}`
    link.download = `narration-${lang}.mp3`
    link.click()
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Volume2 size={18} className="text-brand-600 dark:text-brand-400" />
        <h3 className="font-semibold text-slate-900 dark:text-white">Audio Narration</h3>
        <span className="ml-auto badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
          {lang}
        </span>
      </div>

      <audio ref={audioRef} className="hidden" />

      {/* Waveform visual */}
      <div className="flex items-end justify-center gap-1 h-16 mb-4 bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden px-3 py-2">
        {Array.from({ length: 40 }).map((_, i) => {
          const active = status === 'playing' && (i / 40) * 100 <= progress
          const h = 20 + Math.abs(Math.sin(i * 0.7)) * 60
          return (
            <span
              key={i}
              className={`w-1.5 rounded-full transition-all ${
                active ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              style={{ height: `${h}%` }}
            />
          )
        })}
      </div>

      {status === 'playing' || status === 'paused' ? (
        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-brand-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {status === 'idle' && (
          <button onClick={generate} className="btn-primary flex-1 sm:flex-none">
            <AudioLines size={16} /> Generate Audio
          </button>
        )}
        {status === 'loading' && (
          <button disabled className="btn-primary flex-1 sm:flex-none">
            <Loader2 size={16} className="animate-spin" /> Generating...
          </button>
        )}
        {(status === 'ready' || status === 'paused') && (
          <button onClick={play} className="btn-primary">
            <Play size={16} /> {status === 'paused' ? 'Resume' : 'Play'}
          </button>
        )}
        {status === 'playing' && (
          <button onClick={pause} className="btn-secondary">
            <Pause size={16} /> Pause
          </button>
        )}
        {(status === 'ready' || status === 'playing' || status === 'paused') && (
          <button onClick={stop} className="btn-secondary">
            <Square size={16} /> Stop
          </button>
        )}
        {status !== 'idle' && status !== 'loading' && base64Ref.data && (
          <button onClick={download} className="btn-ghost">
            <Download size={16} /> MP3
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
