import { useProgress } from '@contexts/ProgressContext'
import ModuleCard from '@components/learning/ModuleCard'
import modulesData from '@assets/data/modules.json'

export default function ModuleOverview() {
  const { getModuleProgress, isModuleUnlocked } = useProgress()

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-sand-900 mb-4">
            Learning Modules
          </h1>
          <p className="text-lg text-sand-600 max-w-2xl mx-auto">
            Progress through 8 comprehensive modules, each connecting logarithmic
            concepts to real biological phenomena. Complete modules to unlock the next.
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modulesData.modules.map((module) => {
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

        {/* Learning Path Info */}
        <div className="mt-16 bg-gradient-to-br from-forest-50 to-ocean-50 rounded-2xl p-8">
          <h2 className="font-serif text-2xl font-semibold text-sand-900 mb-4">
            Recommended Learning Path
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-sand-800 mb-2">Core Track</h3>
              <p className="text-sm text-sand-600 mb-4">
                Start with Foundations, then explore pH and Population Dynamics
                to build a strong base before advanced topics.
              </p>
              <ol className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-forest-500 text-white flex items-center justify-center text-xs font-semibold">1</span>
                  <span>Foundations of Logarithms</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-ocean-500 text-white flex items-center justify-center text-xs font-semibold">2</span>
                  <span>The pH Scale</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-semibold">3</span>
                  <span>Population Dynamics</span>
                </li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-sand-800 mb-2">Advanced Topics</h3>
              <p className="text-sm text-sand-600 mb-4">
                After completing the core track, dive into specialized applications
                based on your interests.
              </p>
              <ul className="space-y-2 text-sm text-sand-600">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-forest-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Pharmacokinetics for medical applications</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-forest-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Allometric Scaling for comparative biology</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-forest-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Enzyme Kinetics for biochemistry</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-forest-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Ecological Applications for conservation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
