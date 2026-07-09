import { useCallback, useRef, useState, type DragEvent } from 'react'
import { CloudUpload as UploadCloud, FileText, X } from 'lucide-react'
import { validatePdf } from '../lib/pdf'

interface Props {
  onFile: (file: File) => void
  fileName?: string
  pageCount?: number
  onClear?: () => void
  disabled?: boolean
}

export default function Dropzone({ onFile, fileName, pageCount, onClear, disabled }: Props) {
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      setError(null)
      if (!files || files.length === 0) return
      const file = files[0]
      const err = validatePdf(file)
      if (err) {
        setError(err)
        return
      }
      onFile(file)
    },
    [onFile]
  )

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDrag(false)
    if (disabled) return
    handleFiles(e.dataTransfer.files)
  }

  if (fileName) {
    return (
      <div className="card p-5 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
            <FileText size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900 dark:text-white truncate">{fileName}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {pageCount ? `${pageCount} page${pageCount === 1 ? '' : 's'}` : 'Uploaded'}
            </p>
          </div>
          {!disabled && (
            <button onClick={onClear} className="btn-ghost !p-2" aria-label="Remove file">
              <X size={18} />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`relative card border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
          drag
            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500'
        } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-lg shadow-brand-600/30 animate-float">
          <UploadCloud size={28} />
        </div>
        <p className="mt-4 font-semibold text-slate-900 dark:text-white">
          Drag &amp; drop your PDF here
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          or click to browse · Max 20 MB
        </p>
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
          <X size={14} /> {error}
        </p>
      )}
    </div>
  )
}
