import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { FileText, LayoutDashboard, History as HistoryIcon, Moon, Sun, AudioLines } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export default function Layout() {
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const isHome = location.pathname === '/'

  const navItem = (to: string, label: string, Icon: typeof FileText) => (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive
            ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`
      }
    >
      <Icon size={16} />
      {label}
    </NavLink>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className={`sticky top-0 z-50 backdrop-blur-md transition-colors ${
          isHome
            ? 'bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/70 dark:border-slate-800/70'
            : 'bg-white/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-lg shadow-brand-600/30 group-hover:scale-105 transition-transform">
              <AudioLines size={18} />
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-slate-900 dark:text-white">PDF Simplifier</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden sm:block">
                Read · Hear · Understand
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItem('/', 'Home', FileText)}
            {navItem('/dashboard', 'Dashboard', LayoutDashboard)}
            {navItem('/history', 'History', HistoryIcon)}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="btn-ghost !p-2 rounded-lg"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/dashboard" className="btn-primary !px-4 !py-2 text-xs hidden sm:inline-flex">
              Try Now
            </Link>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-1 px-4 pb-2">
          {navItem('/', 'Home', FileText)}
          {navItem('/dashboard', 'Dashboard', LayoutDashboard)}
          {navItem('/history', 'History', HistoryIcon)}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} PDF Simplifier. Built for multilingual understanding.</p>
          <p className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Powered by AI · Edge functions
          </p>
        </div>
      </footer>
    </div>
  )
}
