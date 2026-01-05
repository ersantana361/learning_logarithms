import { Link } from 'react-router-dom'
import { useProgress } from '@contexts/ProgressContext'
import modulesData from '@assets/data/modules.json'

export default function Dashboard() {
  const { progress, getOverallProgress, getModuleProgress } = useProgress()
  const { percentage, completedModules, totalModules } = getOverallProgress()

  const achievements = [
    { id: 'first-steps', title: 'First Steps', description: 'Complete your first lesson', icon: '🌱', earned: progress.achievements?.some(a => a.id === 'first-steps') },
    { id: 'module-master', title: 'Module Master', description: 'Complete any module', icon: '🎓', earned: completedModules > 0 },
    { id: 'quick-learner', title: 'Quick Learner', description: 'Complete 3 lessons in one day', icon: '⚡', earned: false },
    { id: 'perfect-score', title: 'Perfect Score', description: 'Get 100% on any exercise set', icon: '🌟', earned: false },
    { id: 'halfway-there', title: 'Halfway There', description: 'Complete 4 modules', icon: '🏔️', earned: completedModules >= 4 },
    { id: 'biology-expert', title: 'Biology Expert', description: 'Complete all 8 modules', icon: '🧬', earned: completedModules >= 8 }
  ]

  const recentActivity = modulesData.modules
    .filter(m => {
      const mp = getModuleProgress(m.id)
      return mp.status === 'in_progress' || mp.status === 'completed'
    })
    .slice(0, 3)

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-sand-900 mb-2">
            Your Progress Dashboard
          </h1>
          <p className="text-sand-600">
            Track your learning journey through logarithms in biology.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Overall Progress */}
          <div className="bg-white rounded-xl border border-sand-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sand-600">Overall Progress</h3>
              <div className="w-12 h-12 rounded-full bg-forest-100 flex items-center justify-center">
                <span className="text-forest-600 font-bold">{percentage}%</span>
              </div>
            </div>
            <div className="h-3 bg-sand-100 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-forest-500 to-forest-600 transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-sm text-sand-500">
              {completedModules} of {totalModules} modules completed
            </p>
          </div>

          {/* Exercises Completed */}
          <div className="bg-white rounded-xl border border-sand-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sand-600">Exercises Completed</h3>
              <div className="w-12 h-12 rounded-full bg-ocean-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-sand-900 mb-1">
              {progress.statistics?.totalExercisesCompleted || 0}
            </p>
            <p className="text-sm text-sand-500">
              {progress.statistics?.totalExercisesCorrect || 0} correct answers
            </p>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl border border-sand-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sand-600">Achievements</h3>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-sand-900 mb-1">
              {achievements.filter(a => a.earned).length}
            </p>
            <p className="text-sm text-sand-500">
              of {achievements.length} achievements earned
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Module Progress */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-sand-200 p-6">
              <h2 className="font-serif text-xl font-semibold text-sand-900 mb-6">
                Module Progress
              </h2>
              <div className="space-y-4">
                {modulesData.modules.map((module) => {
                  const mp = getModuleProgress(module.id)
                  const lessonCount = module.lessons?.length || 0
                  const completedLessons = Object.values(mp?.lessons || {}).filter(l => l.completed).length
                  const modulePercentage = lessonCount > 0 ? Math.round((completedLessons / lessonCount) * 100) : 0

                  return (
                    <Link
                      key={module.id}
                      to={`/modules/${module.id}`}
                      className="block p-4 rounded-lg hover:bg-sand-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold ${
                            mp.status === 'completed'
                              ? 'bg-forest-500 text-white'
                              : mp.status === 'in_progress'
                                ? 'bg-ocean-100 text-ocean-600'
                                : 'bg-sand-100 text-sand-500'
                          }`}>
                            {mp.status === 'completed' ? '✓' : module.order}
                          </span>
                          <span className="font-medium text-sand-900">{module.title}</span>
                        </div>
                        <span className="text-sm text-sand-500">{modulePercentage}%</span>
                      </div>
                      <div className="ml-11 h-1.5 bg-sand-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            mp.status === 'completed'
                              ? 'bg-forest-500'
                              : mp.status === 'in_progress'
                                ? 'bg-ocean-500'
                                : 'bg-sand-300'
                          }`}
                          style={{ width: `${modulePercentage}%` }}
                        />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <div className="bg-white rounded-xl border border-sand-200 p-6">
              <h2 className="font-serif text-lg font-semibold text-sand-900 mb-4">
                Achievements
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`relative group p-3 rounded-lg text-center ${
                      achievement.earned
                        ? 'bg-amber-50'
                        : 'bg-sand-50 opacity-50'
                    }`}
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-sand-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      <p className="font-medium">{achievement.title}</p>
                      <p className="text-sand-300">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Learning */}
            {recentActivity.length > 0 && (
              <div className="bg-gradient-to-br from-forest-50 to-ocean-50 rounded-xl p-6">
                <h2 className="font-serif text-lg font-semibold text-sand-900 mb-4">
                  Continue Learning
                </h2>
                <div className="space-y-3">
                  {recentActivity.map((module) => (
                    <Link
                      key={module.id}
                      to={`/modules/${module.id}`}
                      className="block p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                    >
                      <p className="font-medium text-sand-900 text-sm">{module.title}</p>
                      <p className="text-xs text-sand-500">{module.subtitle}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-sand-200 p-6">
              <h2 className="font-serif text-lg font-semibold text-sand-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <Link
                  to="/modules"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-sand-50 transition-colors"
                >
                  <svg className="w-5 h-5 text-sand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-sand-700">Browse All Modules</span>
                </Link>
                <Link
                  to="/glossary"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-sand-50 transition-colors"
                >
                  <svg className="w-5 h-5 text-sand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                  <span className="text-sand-700">View Glossary</span>
                </Link>
                <Link
                  to="/resources"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-sand-50 transition-colors"
                >
                  <svg className="w-5 h-5 text-sand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sand-700">Download Resources</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
