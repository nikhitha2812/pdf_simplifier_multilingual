import { useEffect } from 'react'
import { CircleAlert as AlertCircle, X } from 'lucide-react'

interface Props {
  message: string | null
  onClose: () => void
}

export default function ErrorBanner({ message, onClose }: Props) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, 8000)
    return () => clearTimeout(t)
  }, [message, onClose])

  if (!message) return null
  return (
    <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4 animate-slide-up">
      <div className="flex items-start gap-3">
        <AlertCircle size={18} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
        <p className="flex-1 text-sm text-red-800 dark:text-red-200">{message}</p>
        <button onClick={onClose} className="text-red-500 hover:text-red-700 dark:hover:text-red-300">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
