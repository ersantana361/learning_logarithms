import { useState, useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'

/**
 * Interactive visualization showing bacteria doubling every hour
 * Demonstrates the concept of exponential growth and introduces logarithms
 */
export default function BacteriaDoublingVisualization() {
  const [hour, setHour] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showQuestion, setShowQuestion] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 500, height: 350 })

  const maxHour = 7
  const bacteriaCount = Math.pow(2, hour)

  // Handle responsive sizing
  useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.min(entry.contentRect.width, 600)
        setDimensions({ width, height: Math.min(350, width * 0.7) })
      }
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // Generate cell positions using force simulation
  const generateCells = useCallback((count, width, height) => {
    const dishRadius = Math.min(width, height) * 0.35
    const cellSize = Math.max(8, Math.min(20, dishRadius / Math.sqrt(count) * 0.8))

    const cells = Array(count).fill(null).map((_, i) => ({
      id: i,
      x: width / 2 + (Math.random() - 0.5) * dishRadius,
      y: height / 2 + (Math.random() - 0.5) * dishRadius,
      size: cellSize
    }))

    // Run force simulation to prevent overlap
    const simulation = d3.forceSimulation(cells)
      .force('collision', d3.forceCollide(d => d.size * 0.7))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('boundary', () => {
        cells.forEach(cell => {
          const dx = cell.x - width / 2
          const dy = cell.y - height / 2
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxDist = dishRadius - cell.size
          if (dist > maxDist) {
            const scale = maxDist / dist
            cell.x = width / 2 + dx * scale
            cell.y = height / 2 + dy * scale
          }
        })
      })
      .stop()

    // Run simulation synchronously
    for (let i = 0; i < 100; i++) simulation.tick()

    return cells
  }, [])

  // D3 rendering
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { width, height } = dimensions
    const dishRadius = Math.min(width, height) * 0.35
    const cx = width / 2
    const cy = height / 2

    // Create gradient for petri dish
    const defs = svg.append('defs')

    const dishGradient = defs.append('radialGradient')
      .attr('id', 'dish-gradient')
      .attr('cx', '30%')
      .attr('cy', '30%')
    dishGradient.append('stop').attr('offset', '0%').attr('stop-color', '#f0fdf4')
    dishGradient.append('stop').attr('offset', '70%').attr('stop-color', '#dcfce7')
    dishGradient.append('stop').attr('offset', '100%').attr('stop-color', '#bbf7d0')

    // Cell gradient
    const cellGradient = defs.append('radialGradient')
      .attr('id', 'cell-gradient')
      .attr('cx', '30%')
      .attr('cy', '30%')
    cellGradient.append('stop').attr('offset', '0%').attr('stop-color', '#86efac')
    cellGradient.append('stop').attr('offset', '100%').attr('stop-color', '#22c55e')

    // Draw petri dish
    svg.append('circle')
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('r', dishRadius + 10)
      .attr('fill', 'none')
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 8)

    svg.append('circle')
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('r', dishRadius)
      .attr('fill', 'url(#dish-gradient)')
      .attr('stroke', '#86efac')
      .attr('stroke-width', 2)

    // Generate and draw cells
    const cells = generateCells(bacteriaCount, width, height)

    const cellGroup = svg.append('g').attr('class', 'cells')

    cellGroup.selectAll('ellipse')
      .data(cells)
      .enter()
      .append('ellipse')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('rx', d => d.size)
      .attr('ry', d => d.size * 0.7)
      .attr('fill', 'url(#cell-gradient)')
      .attr('stroke', '#16a34a')
      .attr('stroke-width', 1)
      .attr('transform', d => `rotate(${Math.random() * 360}, ${d.x}, ${d.y})`)
      .attr('opacity', 0)
      .transition()
      .duration(isAnimating ? 500 : 0)
      .attr('opacity', 1)

  }, [hour, dimensions, bacteriaCount, generateCells, isAnimating])

  const handleNextHour = () => {
    if (hour >= maxHour || isAnimating) return
    setIsAnimating(true)
    setTimeout(() => {
      setHour(h => h + 1)
      setTimeout(() => setIsAnimating(false), 500)
    }, 100)
  }

  const handlePrevHour = () => {
    if (hour <= 0 || isAnimating) return
    setHour(h => h - 1)
    setShowQuestion(false)
    setShowAnswer(false)
  }

  const handleReset = () => {
    setHour(0)
    setShowQuestion(false)
    setShowAnswer(false)
    setUserAnswer('')
  }

  const handleShowQuestion = () => {
    setShowQuestion(true)
  }

  const checkAnswer = () => {
    setShowAnswer(true)
  }

  return (
    <div className="bg-white rounded-xl border border-sand-200 p-6">
      <h3 className="font-serif text-lg font-semibold text-sand-900 mb-2">
        Bacteria Doubling Experiment
      </h3>
      <p className="text-sm text-sand-600 mb-4">
        Watch bacteria double every hour. Click "Next Hour" to see exponential growth in action.
      </p>

      {/* Visualization */}
      <div ref={containerRef} className="w-full">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {/* Petri Dish */}
          <div className="flex-1 min-w-0">
            <svg
              ref={svgRef}
              width={dimensions.width}
              height={dimensions.height}
              className="mx-auto"
            />
          </div>

          {/* Equation Panel */}
          <div className="w-full lg:w-48 space-y-4">
            <div className="bg-ocean-50 rounded-lg p-4 border border-ocean-200">
              <div className="text-sm text-ocean-600 font-medium mb-2">Time</div>
              <div className="text-3xl font-bold text-ocean-700">
                Hour {hour}
              </div>
            </div>

            <div className="bg-forest-50 rounded-lg p-4 border border-forest-200">
              <div className="text-sm text-forest-600 font-medium mb-2">Bacteria Count</div>
              <div className="text-3xl font-bold text-forest-700">
                {bacteriaCount.toLocaleString()}
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="text-sm text-amber-600 font-medium mb-2">Pattern</div>
              <div className="font-mono text-lg text-amber-700">
                2<sup>{hour}</sup> = {bacteriaCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button
          onClick={handlePrevHour}
          disabled={hour === 0 || isAnimating}
          className="px-4 py-2 rounded-lg font-medium transition-colors
            bg-sand-100 text-sand-700 hover:bg-sand-200
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous Hour
        </button>
        <button
          onClick={handleNextHour}
          disabled={hour >= maxHour || isAnimating}
          className="px-4 py-2 rounded-lg font-medium transition-colors
            bg-forest-500 text-white hover:bg-forest-600
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Hour →
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg font-medium transition-colors
            bg-sand-100 text-sand-700 hover:bg-sand-200"
        >
          Reset
        </button>
      </div>

      {/* Step-by-step explanation */}
      {hour > 0 && (
        <div className="mt-6 p-4 bg-sand-50 rounded-lg border border-sand-200">
          <div className="text-sm text-sand-700">
            <strong>Step by step:</strong>
            <div className="mt-2 flex flex-wrap gap-2">
              {Array(hour + 1).fill(null).map((_, i) => (
                <span key={i} className={`font-mono ${i === hour ? 'text-forest-600 font-bold' : 'text-sand-500'}`}>
                  {i === 0 ? '1' : `${Math.pow(2, i-1)}×2=${Math.pow(2, i)}`}
                  {i < hour && <span className="mx-1">→</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Question prompt after reaching hour 4 */}
      {hour >= 4 && !showQuestion && (
        <div className="mt-6">
          <button
            onClick={handleShowQuestion}
            className="w-full px-4 py-3 rounded-lg font-medium transition-colors
              bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300"
          >
            Ready to try the reverse question? →
          </button>
        </div>
      )}

      {/* The logarithm question */}
      {showQuestion && (
        <div className="mt-6 p-5 bg-ocean-50 rounded-xl border-2 border-ocean-300">
          <h4 className="font-serif text-lg font-semibold text-ocean-800 mb-3">
            The Reverse Question
          </h4>
          <p className="text-ocean-700 mb-4">
            Now imagine you count <strong className="text-xl">1,024</strong> bacteria.
            How many hours have passed?
          </p>
          <p className="text-sm text-ocean-600 mb-4">
            In other words: <span className="font-mono bg-white px-2 py-1 rounded">2<sup>x</sup> = 1024</span> — what is x?
          </p>

          <div className="flex gap-3 items-center">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Your answer"
              className="w-24 px-3 py-2 border-2 border-ocean-300 rounded-lg font-mono text-lg
                focus:border-ocean-500 focus:outline-none"
            />
            <span className="text-ocean-700">hours</span>
            <button
              onClick={checkAnswer}
              className="px-4 py-2 rounded-lg font-medium transition-colors
                bg-ocean-500 text-white hover:bg-ocean-600"
            >
              Check
            </button>
          </div>

          {showAnswer && (
            <div className={`mt-4 p-4 rounded-lg ${
              userAnswer === '10'
                ? 'bg-forest-100 border border-forest-300'
                : 'bg-amber-100 border border-amber-300'
            }`}>
              {userAnswer === '10' ? (
                <p className="text-forest-700">
                  <strong>Correct!</strong> 2<sup>10</sup> = 1,024
                </p>
              ) : (
                <p className="text-amber-700">
                  The answer is <strong>10</strong> hours, because 2<sup>10</sup> = 1,024
                </p>
              )}
              <p className="mt-3 text-sand-700">
                This is exactly what a <strong>logarithm</strong> answers:
              </p>
              <div className="mt-2 bg-white rounded-lg p-3 font-mono text-lg text-center">
                log<sub>2</sub>(1024) = 10
              </div>
              <p className="mt-3 text-sm text-sand-600">
                "The logarithm base 2 of 1024 is 10" means "2 raised to the power 10 gives 1024"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
