import { Link } from 'react-router-dom'
import { useProgress } from '@contexts/ProgressContext'
import ModuleCard from '@components/learning/ModuleCard'
import modulesData from '@assets/data/modules.json'

export default function Home() {
  const { getOverallProgress, getModuleProgress, isModuleUnlocked } = useProgress()
  const { percentage, completedModules, totalModules } = getOverallProgress()

  // Get first 4 modules for preview
  const previewModules = modulesData.modules.slice(0, 4)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-forest-600 via-forest-700 to-ocean-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Logarithms in Biology
            </h1>
            <p className="text-xl md:text-2xl text-forest-100 mb-4 font-light">
              An Interactive Learning Experience
            </p>
            <p className="text-lg text-forest-200 mb-8 leading-relaxed max-w-2xl">
              Discover how logarithms unlock the secrets of life—from the acidity of blood
              to the metabolism of elephants. Master mathematical concepts through real
              biological applications.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/modules/module-1"
                className="inline-flex items-center px-6 py-3 bg-white text-forest-700 font-semibold rounded-lg hover:bg-forest-50 transition-colors"
              >
                Start Learning
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/modules"
                className="inline-flex items-center px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                View All Modules
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-sand-50"
            />
          </svg>
        </div>
      </section>

      {/* Progress Section (if user has started) */}
      {percentage > 0 && (
        <section className="py-8 border-b border-sand-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-sand-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl font-semibold text-sand-900">Your Progress</h2>
                <Link
                  to="/dashboard"
                  className="text-sm text-forest-600 hover:text-forest-700 font-medium"
                >
                  View Dashboard
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-3 bg-sand-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-forest-500 to-forest-600 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-sand-700">
                  {completedModules}/{totalModules} modules
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Modules */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Learning Modules
            </h2>
            <p className="text-lg text-sand-600 max-w-2xl mx-auto">
              Progress through 8 comprehensive modules, each connecting logarithmic
              concepts to real biological phenomena.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {previewModules.map((module) => {
              const progress = getModuleProgress(module.id)
              const unlocked = isModuleUnlocked(module.id, module.prerequisites)

              return (
                <ModuleCard
                  key={module.id}
                  module={module}
                  progress={progress}
                  unlocked={unlocked}
                />
              )
            })}
          </div>

          <div className="text-center">
            <Link
              to="/modules"
              className="inline-flex items-center px-6 py-3 bg-forest-600 text-white font-semibold rounded-lg hover:bg-forest-700 transition-colors"
            >
              View All 8 Modules
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              How You'll Learn
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-forest-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-semibold text-sand-900 mb-3">
                Interactive Visualizations
              </h3>
              <p className="text-sand-600">
                Explore dynamic D3.js visualizations that bring abstract concepts to life.
                Adjust parameters and see results in real-time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-ocean-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-semibold text-sand-900 mb-3">
                Real Biological Context
              </h3>
              <p className="text-sand-600">
                Every concept connects to observable phenomena—pH scales, population growth,
                drug metabolism, and more.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-semibold text-sand-900 mb-3">
                Practice & Mastery
              </h3>
              <p className="text-sand-600">
                150+ exercises with progressive difficulty, hints, and detailed solutions.
                Track your progress and earn achievements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-ocean-50 to-forest-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="font-serif text-2xl md:text-3xl text-sand-800 leading-relaxed italic">
            "Nature speaks in logarithms—from the acidity of blood to the metabolism
            of elephants. Understanding this language unlocks deeper insight into
            how life works."
          </blockquote>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-sand-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
            Ready to Begin?
          </h2>
          <p className="text-lg text-sand-300 mb-8 max-w-2xl mx-auto">
            Start with the foundations and work your way through all 8 modules.
            No prior knowledge required—just curiosity about how math and biology connect.
          </p>
          <Link
            to="/modules/module-1"
            className="inline-flex items-center px-8 py-4 bg-forest-500 text-white font-semibold rounded-lg hover:bg-forest-400 transition-colors text-lg"
          >
            Start Module 1: Foundations
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
