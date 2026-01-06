import { useState, useCallback, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { useD3 } from '@hooks/useD3'
import ChartContainer from '../shared/ChartContainer'
import InteractiveSlider from '../shared/InteractiveSlider'

/**
 * Interactive visualization showing linear vs logarithmic number lines
 * Demonstrates how logarithms compress large ranges
 */
export default function LogarithmicNumberLine() {
  const [selectedValue, setSelectedValue] = useState(100)
  const [showComparison, setShowComparison] = useState(true)
  const [dimensions, setDimensions] = useState({ width: 600, height: 300 })

  const renderChart = useCallback((svg, dims) => {
    if (!dims || dims.width <= 0 || dims.height <= 0) return

    const { width, height } = dims
    const margin = { top: 40, right: 40, bottom: 60, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Clear previous content
    svg.selectAll('*').remove()

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Data points: powers of 10
    const dataPoints = [1, 10, 100, 1000, 10000, 100000]
    const maxValue = 100000

    // Scales
    const linearScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([0, innerWidth])

    const logScale = d3.scaleLog()
      .domain([1, maxValue])
      .range([0, innerWidth])

    const linearY = innerHeight * 0.25
    const logY = innerHeight * 0.75

    // Colors
    const linearColor = '#3b82f6' // ocean
    const logColor = '#22c55e' // forest
    const highlightColor = '#f59e0b' // amber

    // Draw linear number line
    g.append('text')
      .attr('x', 0)
      .attr('y', linearY - 30)
      .attr('fill', linearColor)
      .attr('font-weight', 600)
      .attr('font-size', 14)
      .text('Linear Scale')

    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', linearY)
      .attr('y2', linearY)
      .attr('stroke', linearColor)
      .attr('stroke-width', 3)

    // Linear scale ticks
    dataPoints.forEach((d) => {
      const x = linearScale(d)
      g.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', linearY - 8)
        .attr('y2', linearY + 8)
        .attr('stroke', linearColor)
        .attr('stroke-width', 2)

      g.append('text')
        .attr('x', x)
        .attr('y', linearY + 25)
        .attr('text-anchor', 'middle')
        .attr('fill', '#57534e')
        .attr('font-size', 11)
        .attr('font-family', 'monospace')
        .text(d3.format(',')(d))
    })

    // Draw logarithmic number line
    g.append('text')
      .attr('x', 0)
      .attr('y', logY - 30)
      .attr('fill', logColor)
      .attr('font-weight', 600)
      .attr('font-size', 14)
      .text('Logarithmic Scale (base 10)')

    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', logY)
      .attr('y2', logY)
      .attr('stroke', logColor)
      .attr('stroke-width', 3)

    // Log scale ticks - evenly spaced!
    dataPoints.forEach((d) => {
      const x = logScale(d)
      g.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', logY - 8)
        .attr('y2', logY + 8)
        .attr('stroke', logColor)
        .attr('stroke-width', 2)

      g.append('text')
        .attr('x', x)
        .attr('y', logY + 25)
        .attr('text-anchor', 'middle')
        .attr('fill', '#57534e')
        .attr('font-size', 11)
        .attr('font-family', 'monospace')
        .text(d3.format(',')(d))

      // Show log value below
      g.append('text')
        .attr('x', x)
        .attr('y', logY + 42)
        .attr('text-anchor', 'middle')
        .attr('fill', logColor)
        .attr('font-size', 10)
        .attr('font-family', 'monospace')
        .text(`log=${Math.log10(d)}`)
    })

    // Highlight selected value
    if (selectedValue >= 1 && selectedValue <= maxValue) {
      const linearX = linearScale(selectedValue)
      const logX = logScale(Math.max(1, selectedValue))

      // Linear marker
      g.append('circle')
        .attr('cx', linearX)
        .attr('cy', linearY)
        .attr('r', 8)
        .attr('fill', highlightColor)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)

      // Log marker
      g.append('circle')
        .attr('cx', logX)
        .attr('cy', logY)
        .attr('r', 8)
        .attr('fill', highlightColor)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)

      // Connection line
      if (showComparison) {
        g.append('line')
          .attr('x1', linearX)
          .attr('y1', linearY)
          .attr('x2', logX)
          .attr('y2', logY)
          .attr('stroke', highlightColor)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,5')
          .attr('opacity', 0.6)
      }

      // Value label
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', highlightColor)
        .attr('font-size', 16)
        .attr('font-weight', 600)
        .text(`Value: ${d3.format(',')(selectedValue)} → log₁₀ = ${Math.log10(selectedValue).toFixed(2)}`)
    }

  }, [selectedValue, showComparison])

  const svgRef = useD3(renderChart, [selectedValue, showComparison], dimensions)

  return (
    <ChartContainer
      title="Linear vs Logarithmic Number Line"
      description="See how logarithmic scales compress large ranges into manageable distances. Values that span 5 orders of magnitude (1 to 100,000) are evenly spaced on the log scale."
      aspectRatio={2}
      minHeight={280}
      maxHeight={400}
      controls={
        <div className="space-y-4">
          <InteractiveSlider
            label="Select a value"
            value={selectedValue}
            onChange={setSelectedValue}
            min={1}
            max={100000}
            step={1}
            formatValue={(v) => d3.format(',')(v)}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showComparison"
              checked={showComparison}
              onChange={(e) => setShowComparison(e.target.checked)}
              className="w-4 h-4 rounded border-sand-300 text-forest-600 focus:ring-forest-500"
            />
            <label htmlFor="showComparison" className="text-sm text-sand-700">
              Show comparison line
            </label>
          </div>
        </div>
      }
    >
      {(containerDimensions) => {
        // Update dimensions when container reports new dimensions
        if (containerDimensions.width !== dimensions.width ||
            containerDimensions.height !== dimensions.height) {
          // Use setTimeout to avoid updating state during render
          setTimeout(() => setDimensions(containerDimensions), 0)
        }
        return (
          <svg
            ref={svgRef}
            width={containerDimensions.width}
            height={containerDimensions.height}
            style={{ display: 'block' }}
          />
        )
      }}
    </ChartContainer>
  )
}
