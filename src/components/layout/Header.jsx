import { Link, NavLink } from 'react-router-dom'
import { useProgress } from '@contexts/ProgressContext'

export default function Header() {
  const { getOverallProgress } = useProgress()
  const { percentage } = getOverallProgress()

  return (
    <header className="bg-white border-b border-sand-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-forest-500 to-ocean-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">log</span>
            </div>
            <span className="font-serif font-semibold text-lg text-sand-900 group-hover:text-forest-700 transition-colors">
              Logarithms in Biology
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              to="/modules"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-forest-600'
                    : 'text-sand-600 hover:text-sand-900'
                }`
              }
            >
              Modules
            </NavLink>
            <NavLink
              to="/glossary"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-forest-600'
                    : 'text-sand-600 hover:text-sand-900'
                }`
              }
            >
              Glossary
            </NavLink>
            <NavLink
              to="/resources"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-forest-600'
                    : 'text-sand-600 hover:text-sand-900'
                }`
              }
            >
              Resources
            </NavLink>
          </nav>

          {/* Progress & Dashboard */}
          <div className="flex items-center gap-4">
            {/* Progress indicator */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 h-2 bg-sand-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-forest-500 to-forest-600 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-sand-500 font-medium">{percentage}%</span>
            </div>

            {/* Dashboard link */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-forest-50 text-forest-700'
                    : 'text-sand-600 hover:bg-sand-100'
                }`
              }
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="hidden sm:inline">Dashboard</span>
            </NavLink>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-sand-500 hover:bg-sand-100"
              aria-label="Open menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
