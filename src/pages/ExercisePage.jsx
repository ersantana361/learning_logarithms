import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useProgress } from '@contexts/ProgressContext'
import MathDisplay from '@components/learning/MathDisplay'
import modulesData from '@assets/data/modules.json'

// Import exercise data for each module
import module1Exercises from '@assets/data/exercises/module-1-exercises.json'
import module2Exercises from '@assets/data/exercises/module-2-exercises.json'
import module3Exercises from '@assets/data/exercises/module-3-exercises.json'
import module4Exercises from '@assets/data/exercises/module-4-exercises.json'
import module5Exercises from '@assets/data/exercises/module-5-exercises.json'
import module6Exercises from '@assets/data/exercises/module-6-exercises.json'
import module7Exercises from '@assets/data/exercises/module-7-exercises.json'
import module8Exercises from '@assets/data/exercises/module-8-exercises.json'

const exerciseDataMap = {
  'module-1': module1Exercises,
  'module-2': module2Exercises,
  'module-3': module3Exercises,
  'module-4': module4Exercises,
  'module-5': module5Exercises,
  'module-6': module6Exercises,
  'module-7': module7Exercises,
  'module-8': module8Exercises
}

export default function ExercisePage() {
  const { moduleId, exerciseType } = useParams()
  const { getModuleProgress, isModuleUnlocked, submitExerciseScore } = useProgress()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [numericalAnswer, setNumericalAnswer] = useState('')
  const [freeResponseAnswer, setFreeResponseAnswer] = useState('')
  const [showHint, setShowHint] = useState(0) // 0 = no hint, 1 = first hint, etc.
  const [showSolution, setShowSolution] = useState(false)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const module = modulesData.modules.find(m => m.id === moduleId)
  const progress = getModuleProgress(moduleId)
  const unlocked = isModuleUnlocked(moduleId, module?.prerequisites || [])

  // Get exercise data
  const exerciseData = exerciseDataMap[moduleId]
  const exerciseTypes = ['conceptual', 'computational', 'applied', 'challenge']
  const activeType = exerciseType || 'conceptual'

  const questions = useMemo(() => {
    if (!exerciseData?.exercises?.[activeType]) {
      return []
    }
    return exerciseData.exercises[activeType]
  }, [exerciseData, activeType])

  const currentQ = questions[currentQuestion]
  const totalQuestions = questions.length

  // Reset state when changing questions or exercise type
  useEffect(() => {
    setSelectedAnswer(null)
    setNumericalAnswer('')
    setFreeResponseAnswer('')
    setShowHint(0)
    setShowSolution(false)
    setIsAnswered(false)
  }, [currentQuestion, activeType])

  // Reset to first question when changing exercise type
  useEffect(() => {
    setCurrentQuestion(0)
    setScore({ correct: 0, total: 0 })
  }, [activeType])

  if (!module) {
    return <Navigate to="/modules" replace />
  }

  if (!unlocked) {
    return <Navigate to={`/modules/${moduleId}`} replace />
  }

  if (questions.length === 0) {
    return (
      <div className="py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="font-serif text-2xl font-semibold text-sand-900 mb-4">
            Exercises Coming Soon
          </h1>
          <p className="text-sand-600 mb-6">
            Exercise content for this module is being developed.
          </p>
          <Link
            to={`/modules/${moduleId}`}
            className="inline-flex items-center px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700"
          >
            Back to Module
          </Link>
        </div>
      </div>
    )
  }

  const handleCheckAnswer = () => {
    setIsAnswered(true)
    let isCorrect = false

    if (currentQ.type === 'multiple-choice') {
      const correctOption = currentQ.options.find(o => o.correct)
      isCorrect = selectedAnswer === correctOption?.id
    } else if (currentQ.type === 'numerical') {
      const answer = parseFloat(numericalAnswer)
      const correct = currentQ.answer
      const tolerance = currentQ.tolerance || 0
      isCorrect = Math.abs(answer - correct) <= tolerance
    }

    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }))
  }

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleFinish = () => {
    submitExerciseScore(moduleId, activeType, score.total, score.correct)
  }

  const colorMap = {
    forest: { bg: 'bg-forest-500', light: 'bg-forest-100', text: 'text-forest-600' },
    ocean: { bg: 'bg-ocean-500', light: 'bg-ocean-100', text: 'text-ocean-600' },
    amber: { bg: 'bg-amber-500', light: 'bg-amber-100', text: 'text-amber-600' }
  }
  const colors = colorMap[module.color] || colorMap.forest

  const getAnswerStatus = (optionId) => {
    if (!isAnswered) return null
    const correctOption = currentQ.options?.find(o => o.correct)
    if (optionId === correctOption?.id) return 'correct'
    if (optionId === selectedAnswer) return 'incorrect'
    return null
  }

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
            <li className="text-sand-900 font-medium capitalize">{activeType} Exercises</li>
          </ol>
        </nav>

        {/* Exercise Type Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {exerciseTypes.map((type) => (
              <Link
                key={type}
                to={`/modules/${moduleId}/exercises/${type}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  type === activeType
                    ? `${colors.bg} text-white`
                    : 'bg-sand-100 text-sand-600 hover:bg-sand-200'
                }`}
              >
                {type} ({module.exerciseCounts?.[type] || 0})
              </Link>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-sand-600">Question {currentQuestion + 1} of {totalQuestions}</span>
            <span className="font-medium text-sand-900">
              Score: {score.correct}/{score.total}
            </span>
          </div>
          <div className="h-2 bg-sand-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.bg} transition-all duration-300`}
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl border border-sand-200 p-6 md:p-8 mb-6">
          <div className="mb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colors.light} ${colors.text} uppercase tracking-wide mb-4`}>
              {currentQ.type.replace('-', ' ')}
            </span>
            <h2 className="font-serif text-xl md:text-2xl text-sand-900 leading-relaxed">
              {currentQ.question}
            </h2>
          </div>

          {/* Answer Input */}
          <div className="mb-6">
            {currentQ.type === 'multiple-choice' && (
              <div className="space-y-3">
                {currentQ.options.map((option) => {
                  const status = getAnswerStatus(option.id)
                  return (
                    <button
                      key={option.id}
                      onClick={() => !isAnswered && setSelectedAnswer(option.id)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        status === 'correct'
                          ? 'border-forest-500 bg-forest-50'
                          : status === 'incorrect'
                            ? 'border-red-500 bg-red-50'
                            : selectedAnswer === option.id
                              ? `${colors.light} border-current`
                              : 'border-sand-200 hover:border-sand-300'
                      } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                          status === 'correct'
                            ? 'bg-forest-500 text-white'
                            : status === 'incorrect'
                              ? 'bg-red-500 text-white'
                              : selectedAnswer === option.id
                                ? `${colors.bg} text-white`
                                : 'bg-sand-100 text-sand-600'
                        }`}>
                          {status === 'correct' ? '✓' : status === 'incorrect' ? '✗' : option.id.toUpperCase()}
                        </span>
                        <span className="text-sand-900">{option.text}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {currentQ.type === 'numerical' && (
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={numericalAnswer}
                  onChange={(e) => !isAnswered && setNumericalAnswer(e.target.value)}
                  disabled={isAnswered}
                  placeholder="Enter your answer"
                  className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none text-lg ${
                    isAnswered
                      ? Math.abs(parseFloat(numericalAnswer) - currentQ.answer) <= (currentQ.tolerance || 0)
                        ? 'border-forest-500 bg-forest-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-sand-200 focus:border-forest-500'
                  }`}
                />
                {currentQ.unit && (
                  <span className="text-sand-600">{currentQ.unit}</span>
                )}
              </div>
            )}

            {currentQ.type === 'free-response' && (
              <textarea
                value={freeResponseAnswer}
                onChange={(e) => setFreeResponseAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-sand-200 rounded-lg focus:border-forest-500 focus:outline-none resize-none"
              />
            )}
          </div>

          {/* Hint Section */}
          {currentQ.hints && currentQ.hints.length > 0 && (
            <div className="mb-6">
              {showHint === 0 ? (
                <button
                  onClick={() => setShowHint(1)}
                  className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Need a hint?
                </button>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-800 mb-2 flex items-center justify-between">
                    <span>Hint {showHint} of {currentQ.hints.length}</span>
                    {showHint < currentQ.hints.length && (
                      <button
                        onClick={() => setShowHint(prev => prev + 1)}
                        className="text-sm text-amber-600 hover:text-amber-700"
                      >
                        Show more
                      </button>
                    )}
                  </h4>
                  <ul className="space-y-2">
                    {currentQ.hints.slice(0, showHint).map((hint, i) => (
                      <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                        <span className="text-amber-500 font-bold">{i + 1}.</span>
                        {hint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Solution Section */}
          {showSolution && currentQ.solution && (
            <div className="bg-forest-50 border border-forest-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-forest-800 mb-2">Solution</h4>
              <p className="text-forest-700 font-medium mb-2">{currentQ.solution.summary}</p>
              <p className="text-sm text-forest-600">{currentQ.solution.detailed}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-sand-100">
            <button
              onClick={() => setShowSolution(true)}
              disabled={showSolution}
              className="text-sand-500 hover:text-sand-700 text-sm font-medium disabled:opacity-50"
            >
              Show Solution
            </button>

            {!isAnswered ? (
              <button
                onClick={handleCheckAnswer}
                disabled={currentQ.type === 'multiple-choice' ? !selectedAnswer : currentQ.type === 'numerical' ? !numericalAnswer : false}
                className="px-6 py-2 bg-forest-600 text-white font-medium rounded-lg hover:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Check Answer
              </button>
            ) : currentQuestion < totalQuestions - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-forest-600 text-white font-medium rounded-lg hover:bg-forest-700 transition-colors"
              >
                Next Question
              </button>
            ) : (
              <Link
                to={`/modules/${moduleId}`}
                onClick={handleFinish}
                className="px-6 py-2 bg-forest-600 text-white font-medium rounded-lg hover:bg-forest-700 transition-colors"
              >
                Finish ({score.correct}/{score.total})
              </Link>
            )}
          </div>
        </div>

        {/* Question Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 text-sand-500 hover:text-sand-700 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="flex gap-2 flex-wrap justify-center">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  i === currentQuestion
                    ? `${colors.bg} text-white`
                    : 'bg-sand-100 text-sand-600 hover:bg-sand-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentQuestion === totalQuestions - 1}
            className="flex items-center gap-2 text-sand-500 hover:text-sand-700 disabled:opacity-50"
          >
            Next
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
