import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Search, Trash2, FileText, Clock, SearchX, ArrowRight } from 'lucide-react'
import { listHistory, deleteHistory } from '../lib/api'
import { LANGUAGES, type HistoryRecord } from '../lib/types'

export default function History() {
  const navigate = useNavigate()
  const [items, setItems] = useState<HistoryRecord[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  async function load(s: string) {
    setLoading(true)
    const data = await listHistory(s)
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { load('') }, [])

  function reopen(item: HistoryRecord) {
    // Persist record in sessionStorage so Dashboard can restore it
    sessionStorage.setItem('reopenHistory', JSON.stringify(item))
    navigate('/dashboard')
  }

  async function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    await deleteHistory(id)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">History</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Revisit previously processed documents.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); load(e.target.value) }}
            placeholder="Search by file name..."
            className="input pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-center gap-3">
                <div className="skeleton h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-3 w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
            <SearchX size={28} />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">No documents found</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {search ? 'Try a different search term.' : 'Process a PDF to see it here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const lang = LANGUAGES.find((l) => l.code === item.language)
            return (
              <div
                key={item.id}
                className="card p-5 flex items-center gap-4 hover:shadow-md transition-all group"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
                  <FileText size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white truncate">
                    {item.file_name}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(item.created_at).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </span>
                    {item.page_count ? <span>{item.page_count} pages</span> : null}
                    {item.level && (
                      <span className="badge bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 capitalize">
                        {item.level}
                      </span>
                    )}
                    {lang && (
                      <span className="badge bg-accent-500/10 text-accent-600 dark:text-accent-400">
                        {lang.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => reopen(item)}
                    className="btn-secondary !px-3 !py-2 text-xs group-hover:bg-brand-50 dark:group-hover:bg-brand-950/30"
                  >
                    Reopen <ArrowRight size={12} />
                  </button>
                  <button
                    onClick={() => remove(item.id)}
                    className="btn-ghost !p-2 text-red-500 hover:text-red-700 dark:hover:text-red-300"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
