import { useState, useEffect } from 'react'
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import { useProgress } from '@contexts/ProgressContext'
import LessonContent from '@components/learning/LessonContent'
import modulesData from '@assets/data/modules.json'

// Import lesson data for each module
import module1Lessons from '@assets/data/lessons/module-1-lessons.json'
import module2Lessons from '@assets/data/lessons/module-2-lessons.json'
import module3Lessons from '@assets/data/lessons/module-3-lessons.json'
import module4Lessons from '@assets/data/lessons/module-4-lessons.json'
import module5Lessons from '@assets/data/lessons/module-5-lessons.json'
import module6Lessons from '@assets/data/lessons/module-6-lessons.json'
import module7Lessons from '@assets/data/lessons/module-7-lessons.json'
import module8Lessons from '@assets/data/lessons/module-8-lessons.json'

const lessonDataMap = {
  'module-1': module1Lessons,
  'module-2': module2Lessons,
  'module-3': module3Lessons,
  'module-4': module4Lessons,
  'module-5': module5Lessons,
  'module-6': module6Lessons,
  'module-7': module7Lessons,
  'module-8': module8Lessons
}

export default function LessonView() {
  const { moduleId, lessonId } = useParams()
  const navigate = useNavigate()
  const { getModuleProgress, markLessonComplete, isModuleUnlocked } = useProgress()
  const [lessonData, setLessonData] = useState(null)

  const module = modulesData.modules.find(m => m.id === moduleId)
  const lessonIndex = module?.lessons.findIndex(l => l.id === lessonId) ?? -1
  const lesson = module?.lessons[lessonIndex]
  const progress = getModuleProgress(moduleId)
  const unlocked = isModuleUnlocked(moduleId, module?.prerequisites || [])

  // Load lesson content
  useEffect(() => {
    const moduleData = lessonDataMap[moduleId]
    if (moduleData) {
      const lessonContent = moduleData.lessons.find(l => l.id === lessonId)
      setLessonData(lessonContent)
    } else {
      setLessonData(null)
    }
  }, [moduleId, lessonId])

  if (!module || !lesson) {
    return <Navigate to="/modules" replace />
  }

  if (!unlocked) {
    return <Navigate to={`/modules/${moduleId}`} replace />
  }

  const prevLesson = lessonIndex > 0 ? module.lessons[lessonIndex - 1] : null
  const nextLesson = lessonIndex < module.lessons.length - 1 ? module.lessons[lessonIndex + 1] : null
  const isComplete = progress?.lessons?.[lessonId]?.completed

  const handleComplete = () => {
    markLessonComplete(moduleId, lessonId)
    if (nextLesson) {
      navigate(`/modules/${moduleId}/lessons/${nextLesson.id}`)
    } else {
      navigate(`/modules/${moduleId}/exercises`)
    }
  }

  const colorMap = {
    forest: { bg: 'bg-forest-500', light: 'bg-forest-100', text: 'text-forest-600', border: 'border-forest-500' },
    ocean: { bg: 'bg-ocean-500', light: 'bg-ocean-100', text: 'text-ocean-600', border: 'border-ocean-500' },
    amber: { bg: 'bg-amber-500', light: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-500' }
  }
  const colors = colorMap[module.color] || colorMap.forest

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm flex-wrap">
            <li>
              <Link to="/modules" className="text-sand-500 hover:text-sand-700">
                Modules
              </Link>
            </li>
            <li className="text-sand-400">/</li>
            <li>
              <Link to={`/modules/${moduleId}`} className="text-sand-500 hover:text-sand-700">
                {module.title}
              </Link>
            </li>
            <li className="text-sand-400">/</li>
            <li className="text-sand-900 font-medium">Lesson {lessonIndex + 1}</li>
          </ol>
        </nav>

        {/* Lesson Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.light} ${colors.text}`}>
              Lesson {lessonIndex + 1} of {module.lessons.length}
            </span>
            {isComplete && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-forest-100 text-forest-700">
                Completed
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-sand-900 mb-2">
            {lesson.title}
          </h1>
          <p className="text-lg text-sand-600">{lesson.description}</p>
        </div>

        {/* Lesson Content */}
        <div className="bg-white rounded-2xl border border-sand-200 p-6 md:p-8 mb-8">
          {lessonData?.sections ? (
            <LessonContent sections={lessonData.sections} />
          ) : (
            <div className="prose prose-sand max-w-none">
              <div className="bg-sand-50 rounded-xl p-8 text-center border-2 border-dashed border-sand-200">
                <svg className="w-12 h-12 mx-auto text-sand-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-sand-700 mb-2">Lesson Content</h3>
                <p className="text-sand-500">
                  This lesson covers: {lesson.concepts?.join(', ') || 'core concepts'}.
                  Content is being developed.
                </p>
              </div>
            </div>
          )}

          {/* Key Concepts */}
          {lesson.concepts && lesson.concepts.length > 0 && (
            <div className="mt-8 pt-8 border-t border-sand-100">
              <h3 className="font-serif text-lg font-semibold text-sand-900 mb-4">Key Concepts</h3>
              <div className="flex flex-wrap gap-2">
                {lesson.concepts.map((concept) => (
                  <Link
                    key={concept}
                    to={`/glossary?term=${concept}`}
                    className={`px-3 py-1.5 rounded-lg text-sm ${colors.light} ${colors.text} hover:opacity-80 transition-opacity`}
                  >
                    {concept.replace(/-/g, ' ')}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          {prevLesson ? (
            <Link
              to={`/modules/${moduleId}/lessons/${prevLesson.id}`}
              className="flex items-center gap-2 px-4 py-2 text-sand-600 hover:text-sand-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Previous: {prevLesson.title}</span>
              <span className="sm:hidden">Previous</span>
            </Link>
          ) : (
            <div />
          )}

          {!isComplete ? (
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 px-6 py-3 bg-forest-600 text-white font-semibold rounded-lg hover:bg-forest-700 transition-colors"
            >
              Mark Complete & Continue
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : nextLesson ? (
            <Link
              to={`/modules/${moduleId}/lessons/${nextLesson.id}`}
              className="flex items-center gap-2 px-6 py-3 bg-forest-600 text-white font-semibold rounded-lg hover:bg-forest-700 transition-colors"
            >
              Next: {nextLesson.title}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <Link
              to={`/modules/${moduleId}/exercises`}
              className="flex items-center gap-2 px-6 py-3 bg-forest-600 text-white font-semibold rounded-lg hover:bg-forest-700 transition-colors"
            >
              Start Exercises
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
