import { createContext, useContext, useMemo, useCallback } from 'react'
import { useLocalStorage } from '@hooks/useLocalStorage'

const ProgressContext = createContext(null)

const initialProgress = {
  startedAt: null,
  lastActiveAt: null,
  modules: {},
  achievements: [],
  statistics: {
    totalTimeSpent: 0,
    totalExercisesCompleted: 0,
    totalExercisesCorrect: 0,
    streakDays: 0,
    longestStreak: 0
  }
}

export function ProgressProvider({ children }) {
  const [progress, setProgress, clearProgress] = useLocalStorage(
    'logarithms-biology-progress',
    initialProgress
  )

  // Update last active timestamp
  const updateLastActive = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      lastActiveAt: new Date().toISOString(),
      startedAt: prev.startedAt || new Date().toISOString()
    }))
  }, [setProgress])

  // Get module progress
  const getModuleProgress = useCallback((moduleId) => {
    return progress.modules[moduleId] || {
      status: moduleId === 'module-1' ? 'unlocked' : 'locked',
      startedAt: null,
      completedAt: null,
      timeSpent: 0,
      lessons: {},
      exercises: {}
    }
  }, [progress.modules])

  // Mark a lesson as complete
  const markLessonComplete = useCallback((moduleId, lessonId) => {
    setProgress((prev) => {
      const moduleProgress = prev.modules[moduleId] || {
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        lessons: {},
        exercises: {}
      }

      return {
        ...prev,
        lastActiveAt: new Date().toISOString(),
        modules: {
          ...prev.modules,
          [moduleId]: {
            ...moduleProgress,
            status: moduleProgress.status === 'locked' ? 'in_progress' : moduleProgress.status,
            startedAt: moduleProgress.startedAt || new Date().toISOString(),
            lessons: {
              ...moduleProgress.lessons,
              [lessonId]: {
                completed: true,
                completedAt: new Date().toISOString()
              }
            }
          }
        }
      }
    })
  }, [setProgress])

  // Submit exercise score
  const submitExerciseScore = useCallback((moduleId, exerciseType, attempted, correct) => {
    setProgress((prev) => {
      const moduleProgress = prev.modules[moduleId] || {
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        lessons: {},
        exercises: {}
      }

      const existingExercises = moduleProgress.exercises[exerciseType] || {
        attempted: 0,
        correct: 0
      }

      return {
        ...prev,
        lastActiveAt: new Date().toISOString(),
        modules: {
          ...prev.modules,
          [moduleId]: {
            ...moduleProgress,
            exercises: {
              ...moduleProgress.exercises,
              [exerciseType]: {
                attempted: existingExercises.attempted + attempted,
                correct: existingExercises.correct + correct,
                score: (existingExercises.correct + correct) / (existingExercises.attempted + attempted)
              }
            }
          }
        },
        statistics: {
          ...prev.statistics,
          totalExercisesCompleted: prev.statistics.totalExercisesCompleted + attempted,
          totalExercisesCorrect: prev.statistics.totalExercisesCorrect + correct
        }
      }
    })
  }, [setProgress])

  // Mark module as complete
  const markModuleComplete = useCallback((moduleId) => {
    setProgress((prev) => {
      const moduleProgress = prev.modules[moduleId] || {}

      return {
        ...prev,
        lastActiveAt: new Date().toISOString(),
        modules: {
          ...prev.modules,
          [moduleId]: {
            ...moduleProgress,
            status: 'completed',
            completedAt: new Date().toISOString()
          }
        }
      }
    })
  }, [setProgress])

  // Unlock a module
  const unlockModule = useCallback((moduleId) => {
    setProgress((prev) => {
      const moduleProgress = prev.modules[moduleId] || {}

      if (moduleProgress.status === 'completed' || moduleProgress.status === 'unlocked') {
        return prev
      }

      return {
        ...prev,
        modules: {
          ...prev.modules,
          [moduleId]: {
            ...moduleProgress,
            status: 'unlocked'
          }
        }
      }
    })
  }, [setProgress])

  // Add achievement
  const addAchievement = useCallback((achievementId) => {
    setProgress((prev) => {
      const hasAchievement = prev.achievements.some((a) => a.id === achievementId)
      if (hasAchievement) return prev

      return {
        ...prev,
        achievements: [
          ...prev.achievements,
          {
            id: achievementId,
            earnedAt: new Date().toISOString()
          }
        ]
      }
    })
  }, [setProgress])

  // Calculate overall progress
  const getOverallProgress = useCallback(() => {
    const moduleIds = Object.keys(progress.modules)
    const completedModules = moduleIds.filter(
      (id) => progress.modules[id]?.status === 'completed'
    ).length
    const totalModules = 8 // Total modules in the course

    return {
      completedModules,
      totalModules,
      percentage: Math.round((completedModules / totalModules) * 100)
    }
  }, [progress.modules])

  // Check if module is unlocked
  const isModuleUnlocked = useCallback((moduleId, prerequisites = []) => {
    // Module 1 is always unlocked
    if (moduleId === 'module-1') return true

    const moduleProgress = progress.modules[moduleId]
    if (moduleProgress?.status === 'unlocked' || moduleProgress?.status === 'completed') {
      return true
    }

    // Check if all prerequisites are completed
    return prerequisites.every((prereqId) => {
      const prereqProgress = progress.modules[prereqId]
      return prereqProgress?.status === 'completed'
    })
  }, [progress.modules])

  const value = useMemo(() => ({
    progress,
    getModuleProgress,
    markLessonComplete,
    submitExerciseScore,
    markModuleComplete,
    unlockModule,
    addAchievement,
    getOverallProgress,
    isModuleUnlocked,
    updateLastActive,
    clearProgress
  }), [
    progress,
    getModuleProgress,
    markLessonComplete,
    submitExerciseScore,
    markModuleComplete,
    unlockModule,
    addAchievement,
    getOverallProgress,
    isModuleUnlocked,
    updateLastActive,
    clearProgress
  ])

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}

export default ProgressContext
