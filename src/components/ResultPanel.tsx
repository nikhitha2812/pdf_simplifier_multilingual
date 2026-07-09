import { useState } from 'react'
import { Copy, Check, Download, FileText } from 'lucide-react'
import jsPDF from 'jspdf'

interface Props {
  title: string
  text: string
  /** When set, downloads as PDF; otherwise TXT */
  asPdf?: boolean
}

export default function ResultPanel({ title, text, asPdf }: Props) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard not available */
    }
  }

  function download() {
    if (asPdf) {
      const doc = new jsPDF()
      const lines = doc.splitTextToSize(text, 180)
      let y = 20
      for (const line of lines) {
        if (y > 280) {
          doc.addPage()
          y = 20
        }
        doc.text(line, 15, y)
        y += 7
      }
      doc.save(`${title}.pdf`)
    } else {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}.txt`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="card p-5 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <FileText size={16} className="text-brand-600 dark:text-brand-400" />
        <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={copy} className="btn-ghost !px-2.5 !py-1.5 text-xs" title="Copy to clipboard">
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={download} className="btn-ghost !px-2.5 !py-1.5 text-xs" title={`Download ${asPdf ? 'PDF' : 'TXT'}`}>
            <Download size={14} /> {asPdf ? 'PDF' : 'TXT'}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[420px] whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        {text}
      </div>
    </div>
  )
}
