import { useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'

/**
 * Visualization showing how compound interest converges to e
 * Demonstrates why e ≈ 2.718 through the formula (1 + 1/n)^n
 */
export default function CompoundInterestConvergence() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 500, height: 300 })

  const frequencies = [
    { n: 1, label: 'Annual', shortLabel: '1×', value: Math.pow(1 + 1/1, 1), description: 'Once per year' },
    { n: 2, label: 'Semi-annual', shortLabel: '2×', value: Math.pow(1 + 1/2, 2), description: 'Twice per year' },
    { n: 4, label: 'Quarterly', shortLabel: '4×', value: Math.pow(1 + 1/4, 4), description: 'Four times per year' },
    { n: 12, label: 'Monthly', shortLabel: '12×', value: Math.pow(1 + 1/12, 12), description: '12 times per year' },
    { n: 365, label: 'Daily', shortLabel: '365×', value: Math.pow(1 + 1/365, 365), description: 'Every day' },
    { n: Infinity, label: 'Continuous', shortLabel: '∞', value: Math.E, description: 'Infinite times' }
  ]

  const visibleData = frequencies.slice(0, currentStep + 1)

  // Handle responsive sizing
  useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.min(entry.contentRect.width, 600)
        setDimensions({ width, height: 300 })
      }
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // D3 rendering
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { width, height } = dimensions
    const margin = { top: 30, right: 20, bottom: 50, left: 60 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Scales
    const xScale = d3.scaleBand()
      .domain(frequencies.map(d => d.shortLabel))
      .range([0, chartWidth])
      .padding(0.3)

    const yScale = d3.scaleLinear()
      .domain([1.5, 3])
      .range([chartHeight, 0])

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('font-size', '12px')

    // X axis label
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#78716c')
      .attr('font-size', '12px')
      .text('Compounding Frequency')

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `$${d.toFixed(2)}`))
      .selectAll('text')
      .attr('font-size', '12px')

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -chartHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#78716c')
      .attr('font-size', '12px')
      .text('Final Amount')

    // Reference line for e
    const eLine = g.append('g')
      .attr('class', 'e-line')

    eLine.append('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', yScale(Math.E))
      .attr('y2', yScale(Math.E))
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '8,4')

    eLine.append('text')
      .attr('x', chartWidth - 5)
      .attr('y', yScale(Math.E) - 8)
      .attr('text-anchor', 'end')
      .attr('fill', '#f59e0b')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(`e ≈ ${Math.E.toFixed(4)}`)

    // Bars
    g.selectAll('.bar')
      .data(visibleData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.shortLabel))
      .attr('width', xScale.bandwidth())
      .attr('y', chartHeight)
      .attr('height', 0)
      .attr('fill', (d, i) => d.n === Infinity ? '#f59e0b' : '#22c55e')
      .attr('rx', 4)
      .transition()
      .duration(isAnimating ? 600 : 0)
      .attr('y', d => yScale(d.value))
      .attr('height', d => chartHeight - yScale(d.value))

    // Value labels on bars
    g.selectAll('.value-label')
      .data(visibleData)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', d => xScale(d.shortLabel) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.value) - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', '#374151')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('opacity', 0)
      .text(d => `$${d.value.toFixed(3)}`)
      .transition()
      .duration(isAnimating ? 600 : 0)
      .attr('opacity', 1)

  }, [currentStep, dimensions, visibleData, isAnimating])

  const handleNextStep = () => {
    if (currentStep >= frequencies.length - 1 || isAnimating) return
    setIsAnimating(true)
    setCurrentStep(s => s + 1)
    setTimeout(() => setIsAnimating(false), 600)
  }

  const handlePrevStep = () => {
    if (currentStep <= 0) return
    setCurrentStep(s => s - 1)
  }

  const handleReset = () => {
    setCurrentStep(0)
  }

  const currentFreq = frequencies[currentStep]

  return (
    <div className="bg-white rounded-xl border border-sand-200 p-6">
      <h3 className="font-serif text-lg font-semibold text-sand-900 mb-2">
        Why is e ≈ 2.718?
      </h3>
      <p className="text-sm text-sand-600 mb-4">
        Invest $1 at 100% annual interest. Watch what happens as you compound more frequently.
      </p>

      {/* Current step info */}
      <div className="mb-4 p-4 bg-ocean-50 rounded-lg border border-ocean-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-ocean-600 font-medium">
              Compound {currentFreq.label}
            </div>
            <div className="text-xs text-ocean-500">
              {currentFreq.description}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-ocean-700">
              ${currentFreq.value.toFixed(4)}
            </div>
            <div className="text-xs text-ocean-500 font-mono">
              (1 + 1/{currentFreq.n === Infinity ? '∞' : currentFreq.n})<sup>{currentFreq.n === Infinity ? '∞' : currentFreq.n}</sup>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div ref={containerRef} className="w-full">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="mx-auto"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        <button
          onClick={handlePrevStep}
          disabled={currentStep === 0}
          className="px-4 py-2 rounded-lg font-medium transition-colors
            bg-sand-100 text-sand-700 hover:bg-sand-200
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <button
          onClick={handleNextStep}
          disabled={currentStep >= frequencies.length - 1 || isAnimating}
          className="px-4 py-2 rounded-lg font-medium transition-colors
            bg-ocean-500 text-white hover:bg-ocean-600
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Frequency →
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg font-medium transition-colors
            bg-sand-100 text-sand-700 hover:bg-sand-200"
        >
          Reset
        </button>
      </div>

      {/* Explanation when reaching the end */}
      {currentStep === frequencies.length - 1 && (
        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="text-sm text-amber-800">
              <strong>Key Insight:</strong> As we divide the interest into smaller and smaller pieces
              (compounding more frequently), the total approaches <strong>e ≈ 2.71828...</strong>
              <p className="mt-2">
                This is why <strong>e</strong> appears naturally in growth and decay problems—it's
                the base of "continuous" compounding!
              </p>
              <p className="mt-2 font-mono text-xs bg-white p-2 rounded">
                lim (1 + 1/n)<sup>n</sup> = e ≈ 2.71828...
                <br />
                n→∞
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div className="mt-4 flex justify-center gap-2">
        {frequencies.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i <= currentStep ? 'bg-ocean-500' : 'bg-sand-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
