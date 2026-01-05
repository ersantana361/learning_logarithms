import { useParams, Link, Navigate } from 'react-router-dom'
import { useProgress } from '@contexts/ProgressContext'
import modulesData from '@assets/data/modules.json'

export default function ModuleDetail() {
  const { moduleId } = useParams()
  const { getModuleProgress, isModuleUnlocked, markLessonComplete } = useProgress()

  const module = modulesData.modules.find(m => m.id === moduleId)
  const progress = getModuleProgress(moduleId)
  const unlocked = isModuleUnlocked(moduleId, module?.prerequisites || [])

  if (!module) {
    return <Navigate to="/modules" replace />
  }

  if (!unlocked) {
    return (
      <div className="py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-sand-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-sand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-sand-900 mb-4">
            Module Locked
          </h1>
          <p className="text-sand-600 mb-6">
            Complete the prerequisite modules to unlock {module.title}.
          </p>
          <Link
            to="/modules"
            className="inline-flex items-center px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700"
          >
            View All Modules
          </Link>
        </div>
      </div>
    )
  }

  const completedLessons = Object.values(progress?.lessons || {}).filter(l => l.completed).length
  const totalLessons = module.lessons.length
  const progressPercentage = Math.round((completedLessons / totalLessons) * 100)

  const colorMap = {
    forest: { bg: 'bg-forest-500', light: 'bg-forest-100', text: 'text-forest-600' },
    ocean: { bg: 'bg-ocean-500', light: 'bg-ocean-100', text: 'text-ocean-600' },
    amber: { bg: 'bg-amber-500', light: 'bg-amber-100', text: 'text-amber-600' }
  }
  const colors = colorMap[module.color] || colorMap.forest

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link to="/modules" className="text-sand-500 hover:text-sand-700">
                Modules
              </Link>
            </li>
            <li className="text-sand-400">/</li>
            <li className="text-sand-900 font-medium">{module.title}</li>
          </ol>
        </nav>

        {/* Module Header */}
        <div className="bg-white rounded-2xl border border-sand-200 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className={`w-16 h-16 rounded-2xl ${colors.bg} flex items-center justify-center text-white shrink-0`}>
              <span className="text-2xl font-bold">{module.order}</span>
            </div>
            <div className="flex-1">
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-sand-900 mb-2">
                {module.title}
              </h1>
              <p className="text-lg text-sand-600 mb-4">{module.subtitle}</p>
              <p className="text-sand-600 leading-relaxed">{module.description}</p>

              {/* Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-sand-600">{completedLessons} of {totalLessons} lessons complete</span>
                  <span className="font-medium text-sand-900">{progressPercentage}%</span>
                </div>
                <div className="h-2 bg-sand-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors.bg} transition-all duration-500`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lessons List */}
          <div className="lg:col-span-2">
            <h2 className="font-serif text-xl font-semibold text-sand-900 mb-4">Lessons</h2>
            <div className="space-y-3">
              {module.lessons.map((lesson, index) => {
                const isComplete = progress?.lessons?.[lesson.id]?.completed
                const isFirst = index === 0
                const prevComplete = index === 0 || progress?.lessons?.[module.lessons[index - 1].id]?.completed

                return (
                  <Link
                    key={lesson.id}
                    to={`/modules/${moduleId}/lessons/${lesson.id}`}
                    className={`block bg-white rounded-xl border p-4 transition-all ${
                      isComplete
                        ? 'border-forest-200 bg-forest-50/50'
                        : prevComplete || isFirst
                          ? 'border-sand-200 hover:border-sand-300 hover:shadow-md'
                          : 'border-sand-100 opacity-60 pointer-events-none'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isComplete
                          ? 'bg-forest-500 text-white'
                          : 'bg-sand-100 text-sand-500'
                      }`}>
                        {isComplete ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sand-900 truncate">{lesson.title}</h3>
                        <p className="text-sm text-sand-500 truncate">{lesson.description}</p>
                      </div>
                      <svg className="w-5 h-5 text-sand-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Exercises Card */}
            <div className="bg-white rounded-xl border border-sand-200 p-6">
              <h3 className="font-serif text-lg font-semibold text-sand-900 mb-4">Practice Exercises</h3>
              <div className="space-y-3">
                {Object.entries(module.exerciseCounts).map(([type, count]) => (
                  <Link
                    key={type}
                    to={`/modules/${moduleId}/exercises/${type}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-sand-50 hover:bg-sand-100 transition-colors"
                  >
                    <span className="capitalize text-sand-700">{type}</span>
                    <span className="text-sm text-sand-500">{count} questions</span>
                  </Link>
                ))}
              </div>
              <Link
                to={`/modules/${moduleId}/exercises`}
                className="block mt-4 text-center py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors"
              >
                Start Exercises
              </Link>
            </div>

            {/* Visualizations Card */}
            <div className="bg-white rounded-xl border border-sand-200 p-6">
              <h3 className="font-serif text-lg font-semibold text-sand-900 mb-4">Key Visualizations</h3>
              <ul className="space-y-3">
                {module.keyVisualizations.map((viz) => (
                  <li key={viz.id} className="flex items-start gap-3">
                    <svg className={`w-5 h-5 ${colors.text} shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-sand-900">{viz.title}</p>
                      <p className="text-xs text-sand-500">{viz.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Meta Info */}
            <div className="bg-sand-50 rounded-xl p-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sand-500">Estimated Time</span>
                  <span className="font-medium text-sand-900">{module.estimatedTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sand-500">Lessons</span>
                  <span className="font-medium text-sand-900">{module.lessons.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sand-500">Total Exercises</span>
                  <span className="font-medium text-sand-900">
                    {Object.values(module.exerciseCounts).reduce((a, b) => a + b, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
