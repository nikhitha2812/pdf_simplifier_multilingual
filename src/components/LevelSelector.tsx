import { LEVELS, type SimplificationLevel } from '../lib/types'
import { Sparkles, GraduationCap, BookOpen, Brain } from 'lucide-react'

const ICONS = [GraduationCap, BookOpen, Brain] as const

interface Props {
  value: SimplificationLevel
  onChange: (v: SimplificationLevel) => void
  disabled?: boolean
}

export default function LevelSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {LEVELS.map((lvl, i) => {
        const Icon = ICONS[i]
        const active = value === lvl.value
        return (
          <button
            key={lvl.value}
            disabled={disabled}
            onClick={() => onChange(lvl.value)}
            className={`card p-4 text-left transition-all ${
              active
                ? 'border-brand-500 ring-2 ring-brand-500/30 bg-brand-50/50 dark:bg-brand-950/30'
                : 'hover:border-brand-300 dark:hover:border-brand-700'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.01]'}`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Icon
                size={18}
                className={active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500'}
              />
              <span className="font-semibold text-slate-900 dark:text-white">{lvl.label}</span>
              {active && (
                <Sparkles size={14} className="ml-auto text-brand-500 animate-pulse" />
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lvl.desc}
            </p>
          </button>
        )
      })}
    </div>
  )
}
