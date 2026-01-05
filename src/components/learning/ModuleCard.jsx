import { Link } from 'react-router-dom'

const iconMap = {
  foundation: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  flask: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  chart: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
  ),
  pill: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  scale: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  eye: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  enzyme: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.871 4A17.926 17.926 0 003 12c0 2.874.673 5.59 1.871 8m14.13 0a17.926 17.926 0 001.87-8c0-2.874-.673-5.59-1.87-8M9 9h1.246a1 1 0 01.961.725l1.586 5.55a1 1 0 00.961.725H15m1-7h-.08a2 2 0 00-1.519.698L9.6 15.302A2 2 0 018.08 16H8" />
    </svg>
  ),
  leaf: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}

const colorMap = {
  forest: {
    bg: 'bg-forest-100',
    iconBg: 'bg-forest-500',
    text: 'text-forest-600',
    border: 'border-forest-200',
    progress: 'bg-forest-500'
  },
  ocean: {
    bg: 'bg-ocean-100',
    iconBg: 'bg-ocean-500',
    text: 'text-ocean-600',
    border: 'border-ocean-200',
    progress: 'bg-ocean-500'
  },
  amber: {
    bg: 'bg-amber-100',
    iconBg: 'bg-amber-500',
    text: 'text-amber-600',
    border: 'border-amber-200',
    progress: 'bg-amber-500'
  }
}

export default function ModuleCard({ module, progress, unlocked }) {
  const colors = colorMap[module.color] || colorMap.forest
  const Icon = iconMap[module.icon]

  const isCompleted = progress?.status === 'completed'
  const isInProgress = progress?.status === 'in_progress'
  const lessonCount = module.lessons?.length || 0
  const completedLessons = Object.values(progress?.lessons || {}).filter(l => l.completed).length

  const progressPercentage = lessonCount > 0
    ? Math.round((completedLessons / lessonCount) * 100)
    : 0

  if (!unlocked) {
    return (
      <div className="bg-white rounded-xl border border-sand-200 p-6 opacity-60">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl bg-sand-200 flex items-center justify-center text-sand-400`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-sand-400 uppercase tracking-wide">
              Module {module.order}
            </span>
            <h3 className="font-serif text-lg font-semibold text-sand-400 mt-1 truncate">
              {module.title}
            </h3>
            <p className="text-sm text-sand-400 mt-1">
              Complete prerequisites to unlock
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Link
      to={`/modules/${module.id}`}
      className="group block bg-white rounded-xl border border-sand-200 p-6 hover:shadow-lg hover:border-sand-300 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center text-white shrink-0`}>
          {Icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${colors.text} uppercase tracking-wide`}>
              Module {module.order}
            </span>
            {isCompleted && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-forest-100 text-forest-700">
                Complete
              </span>
            )}
          </div>
          <h3 className="font-serif text-lg font-semibold text-sand-900 mt-1 group-hover:text-forest-700 transition-colors truncate">
            {module.title}
          </h3>
          <p className="text-sm text-sand-500 mt-1 line-clamp-2">
            {module.subtitle}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {(isInProgress || isCompleted) && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-sand-500 mb-1">
            <span>{completedLessons}/{lessonCount} lessons</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="h-1.5 bg-sand-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.progress} transition-all duration-300`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Meta info */}
      <div className="flex items-center gap-4 mt-4 text-sm text-sand-500">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {module.estimatedTime}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {lessonCount} lessons
        </span>
      </div>
    </Link>
  )
}
