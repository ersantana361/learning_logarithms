import { useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'

/**
 * Interactive visualization showing transformation from linear to log scale
 * Demonstrates how log scale compresses large values and expands small ones
 */
export default function LogScaleTransformer() {
  const [transformProgress, setTransformProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const animationRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 500, height: 280 })

  const dataPoints = [1, 10, 100, 1000, 10000, 100000]

  // Handle responsive sizing
  useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.min(entry.contentRect.width, 600)
        setDimensions({ width, height: 280 })
      }
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // Animation loop
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setTransformProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 100
          }
          return prev + 1
        })
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying])

  // D3 rendering
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { width, height } = dimensions
    const margin = { top: 40, right: 30, bottom: 30, left: 30 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = (height - margin.top - margin.bottom - 40) / 2

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Scales
    const linearScale = d3.scaleLinear()
      .domain([0, 100000])
      .range([0, chartWidth])

    const logScale = d3.scaleLog()
      .domain([1, 100000])
      .range([0, chartWidth])

    // Progress factor (0 = linear, 1 = log)
    const t = transformProgress / 100

    // Interpolate position for each point
    const getPosition = (value) => {
      const linearPos = linearScale(value)
      const logPos = logScale(value)
      return linearPos + (logPos - linearPos) * t
    }

    // Draw title
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#374151')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text(t < 0.5 ? 'Linear Scale' : t < 1 ? 'Transforming...' : 'Logarithmic Scale')

    // Draw axis line
    g.append('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', chartHeight / 2)
      .attr('y2', chartHeight / 2)
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 3)

    // Draw points and labels
    const colors = d3.scaleOrdinal()
      .domain(dataPoints)
      .range(['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'])

    dataPoints.forEach((value, i) => {
      const x = getPosition(value)

      // Point
      g.append('circle')
        .attr('cx', x)
        .attr('cy', chartHeight / 2)
        .attr('r', 8)
        .attr('fill', colors(value))
        .attr('stroke', 'white')
        .attr('stroke-width', 2)

      // Value label above
      g.append('text')
        .attr('x', x)
        .attr('y', chartHeight / 2 - 20)
        .attr('text-anchor', 'middle')
        .attr('fill', colors(value))
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text(value.toLocaleString())

      // Log value below (when transformed)
      if (t > 0.3) {
        g.append('text')
          .attr('x', x)
          .attr('y', chartHeight / 2 + 25)
          .attr('text-anchor', 'middle')
          .attr('fill', '#78716c')
          .attr('font-size', '10px')
          .attr('opacity', Math.min(1, (t - 0.3) / 0.3))
          .text(`log=${Math.log10(value).toFixed(0)}`)
      }
    })

    // Spacing indicators
    const spacingY = chartHeight + 60

    g.append('text')
      .attr('x', 0)
      .attr('y', spacingY)
      .attr('fill', '#78716c')
      .attr('font-size', '12px')
      .text('Spacing between values:')

    // Show spacing comparison
    const spacings = []
    for (let i = 1; i < dataPoints.length; i++) {
      const pos1 = getPosition(dataPoints[i - 1])
      const pos2 = getPosition(dataPoints[i])
      spacings.push({
        from: dataPoints[i - 1],
        to: dataPoints[i],
        distance: pos2 - pos1
      })
    }

    // Draw spacing bars
    spacings.forEach((s, i) => {
      const barY = spacingY + 15 + i * 18
      const maxBarWidth = chartWidth / 3

      g.append('rect')
        .attr('x', 0)
        .attr('y', barY)
        .attr('width', Math.min(s.distance, maxBarWidth))
        .attr('height', 12)
        .attr('fill', t < 0.5 ? '#ef4444' : '#22c55e')
        .attr('rx', 2)
        .attr('opacity', 0.7)

      g.append('text')
        .attr('x', Math.min(s.distance, maxBarWidth) + 8)
        .attr('y', barY + 10)
        .attr('fill', '#78716c')
        .attr('font-size', '10px')
        .text(`${s.from.toLocaleString()} → ${s.to.toLocaleString()}`)
    })

    // Insight text
    const insightY = spacingY + 15 + spacings.length * 18 + 15
    g.append('text')
      .attr('x', 0)
      .attr('y', insightY)
      .attr('fill', t < 0.5 ? '#ef4444' : '#22c55e')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text(t < 0.5
        ? 'Linear: Spacing varies wildly (1→10 tiny, 10000→100000 huge)'
        : 'Log: Equal ratios = equal spacing!')

  }, [transformProgress, dimensions])

  const handleSliderChange = (e) => {
    setIsPlaying(false)
    setTransformProgress(Number(e.target.value))
  }

  const handlePlayPause = () => {
    if (transformProgress >= 100) {
      setTransformProgress(0)
    }
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setTransformProgress(0)
  }

  return (
    <div className="bg-white rounded-xl border border-sand-200 p-6">
      <h3 className="font-serif text-lg font-semibold text-sand-900 mb-2">
        Linear vs Logarithmic Scale
      </h3>
      <p className="text-sm text-sand-600 mb-4">
        Drag the slider to transform from linear to log scale. Watch how the spacing changes!
      </p>

      {/* Progress slider */}
      <div className="mb-4">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-sm text-sand-600 w-16">Linear</span>
          <input
            type="range"
            min="0"
            max="100"
            value={transformProgress}
            onChange={handleSliderChange}
            className="flex-1 h-2 bg-sand-200 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-ocean-500
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <span className="text-sm text-sand-600 w-16 text-right">Log</span>
        </div>
        <div className="text-center text-sm text-sand-500">
          Transform: {transformProgress}%
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3 mb-4">
        <button
          onClick={handlePlayPause}
          className="px-4 py-2 rounded-lg font-medium transition-colors
            bg-ocean-500 text-white hover:bg-ocean-600"
        >
          {isPlaying ? 'Pause' : 'Animate'}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg font-medium transition-colors
            bg-sand-100 text-sand-700 hover:bg-sand-200"
        >
          Reset
        </button>
      </div>

      {/* Visualization */}
      <div ref={containerRef} className="w-full">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="mx-auto"
        />
      </div>

      {/* Key insight */}
      <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-start gap-3">
          <div className="text-xl">💡</div>
          <div className="text-sm text-amber-800">
            <strong>Why use log scale?</strong> On a log scale, <em>equal ratios</em> get <em>equal spacing</em>.
            <p className="mt-2">
              Going from 1→10 (×10) takes the same space as 10→100 (×10) or 10000→100000 (×10).
              This makes patterns in exponentially growing data visible!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
