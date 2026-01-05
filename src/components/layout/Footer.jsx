import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-sand-900 text-sand-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-forest-500 to-ocean-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">log</span>
              </div>
              <span className="font-serif font-semibold text-lg text-white">
                Logarithms in Biology
              </span>
            </div>
            <p className="text-sm text-sand-400 leading-relaxed">
              An interactive educational platform teaching logarithmic concepts
              through the lens of biological sciences.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/modules"
                  className="text-sm hover:text-white transition-colors"
                >
                  All Modules
                </Link>
              </li>
              <li>
                <Link
                  to="/glossary"
                  className="text-sm hover:text-white transition-colors"
                >
                  Glossary
                </Link>
              </li>
              <li>
                <Link
                  to="/resources"
                  className="text-sm hover:text-white transition-colors"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-sm hover:text-white transition-colors"
                >
                  My Progress
                </Link>
              </li>
            </ul>
          </div>

          {/* Learning Path */}
          <div>
            <h3 className="font-semibold text-white mb-4">Learning Path</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/modules/module-1"
                  className="hover:text-white transition-colors"
                >
                  1. Foundations of Logarithms
                </Link>
              </li>
              <li>
                <Link
                  to="/modules/module-2"
                  className="hover:text-white transition-colors"
                >
                  2. The pH Scale
                </Link>
              </li>
              <li>
                <Link
                  to="/modules/module-3"
                  className="hover:text-white transition-colors"
                >
                  3. Population Dynamics
                </Link>
              </li>
              <li>
                <Link
                  to="/modules/module-4"
                  className="hover:text-white transition-colors"
                >
                  4. Pharmacokinetics
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sand-800 mt-8 pt-8 text-center text-sm text-sand-500">
          <p>
            &copy; {new Date().getFullYear()} Logarithms in Biology.
            An interactive learning experience.
          </p>
        </div>
      </div>
    </footer>
  )
}
