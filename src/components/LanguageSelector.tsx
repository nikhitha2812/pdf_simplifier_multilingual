import { LANGUAGES, type LanguageCode } from '../lib/types'
import { Globe } from 'lucide-react'

interface Props {
  value: LanguageCode
  onChange: (v: LanguageCode) => void
  disabled?: boolean
}

export default function LanguageSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="relative">
      <Globe
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as LanguageCode)}
        className="input appearance-none pl-9 pr-9 cursor-pointer disabled:cursor-not-allowed"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.name} — {l.nativeName}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
        viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
      >
        <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
