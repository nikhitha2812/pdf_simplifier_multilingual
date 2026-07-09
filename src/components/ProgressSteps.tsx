interface Step { label: string; active: boolean; done: boolean }

export default function ProgressSteps({ steps }: { steps: Step[] }) {
  return (
    <div className="flex items-center justify-center gap-2 py-6">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                s.done
                  ? 'bg-emerald-500 text-white'
                  : s.active
                  ? 'bg-brand-600 text-white animate-pulse'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
              }`}
            >
              {s.done ? '✓' : i + 1}
            </div>
            <span
              className={`text-[10px] font-medium ${
                s.active || s.done
                  ? 'text-slate-700 dark:text-slate-200'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 w-8 sm:w-16 ${
                s.done ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
