import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-forest-100 to-ocean-100 flex items-center justify-center">
          <span className="font-serif text-4xl font-bold text-forest-600">404</span>
        </div>
        <h1 className="font-serif text-2xl font-bold text-sand-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-sand-600 mb-8">
          Looks like this page has gone logarithmically small—approaching zero but never quite there.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-forest-600 text-white font-medium rounded-lg hover:bg-forest-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
          <Link
            to="/modules"
            className="inline-flex items-center px-6 py-3 bg-white text-sand-700 font-medium rounded-lg border border-sand-200 hover:bg-sand-50 transition-colors"
          >
            View Modules
          </Link>
        </div>
      </div>
    </div>
  )
}
