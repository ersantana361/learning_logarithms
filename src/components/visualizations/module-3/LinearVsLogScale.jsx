import { useState, useMemo, useRef, useEffect } from 'react'
import { useD3 } from '@hooks/useD3'
import ChartContainer from '../shared/ChartContainer'
import * as d3 from 'd3'

export default function LinearVsLogScale() {
  const [growthRate, setGrowthRate] = useState(0.2)
  const [timeSteps, setTimeSteps] = useState(30)
  const [dimensions, setDimensions] = useState({ width: 300, height: 256 })
  const linearContainerRef = useRef(null)
  const logContainerRef = useRef(null)

  // Track container dimensions
  useEffect(() => {
    if (!linearContainerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        setDimensions({ width, height: 256 })
      }
    })
    resizeObserver.observe(linearContainerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const data = useMemo(() => {
    const points = []
    for (let t = 0; t <= timeSteps; t++) {
      points.push({
        t,
        N: 10 * Math.exp(growthRate * t)
      })
    }
    return points
  }, [growthRate, timeSteps])

  const linearRef = useD3((svg, dims) => {
    if (!dims || dims.width <= 0 || dims.height <= 0) return

    const { width, height } = dims
    svg.selectAll('*').remove()
    svg.attr('width', width).attr('height', height)

    const margin = { top: 20, right: 20, bottom: 40, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const xScale = d3.scaleLinear()
      .domain([0, timeSteps])
      .range([0, innerWidth])

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.N)])
      .range([innerHeight, 0])

    // Grid
    g.append('g')
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat('')
      )
      .selectAll('line')
      .attr('stroke', '#e5e7eb')

    g.selectAll('.domain').remove()

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d3.format('.0s')))

    // Title
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#374151')
      .attr('font-weight', '600')
      .text('Linear Scale')

    // Line
    const line = d3.line()
      .x(d => xScale(d.t))
      .y(d => yScale(d.N))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3)
      .attr('d', line)

    // Axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .attr('font-size', '12px')
      .text('Time')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .attr('font-size', '12px')
      .text('Population')

  }, [data, timeSteps], dimensions)

  const logRef = useD3((svg, dims) => {
    if (!dims || dims.width <= 0 || dims.height <= 0) return

    const { width, height } = dims
    svg.selectAll('*').remove()
    svg.attr('width', width).attr('height', height)

    const margin = { top: 20, right: 20, bottom: 40, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const xScale = d3.scaleLinear()
      .domain([0, timeSteps])
      .range([0, innerWidth])

    const yScale = d3.scaleLog()
      .domain([d3.min(data, d => d.N), d3.max(data, d => d.N)])
      .range([innerHeight, 0])

    // Grid
    g.append('g')
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat('')
      )
      .selectAll('line')
      .attr('stroke', '#e5e7eb')

    g.selectAll('.domain').remove()

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5, '.0s'))

    // Title
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#374151')
      .attr('font-weight', '600')
      .text('Logarithmic Scale')

    // Line
    const line = d3.line()
      .x(d => xScale(d.t))
      .y(d => yScale(d.N))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#22c55e')
      .attr('stroke-width', 3)
      .attr('d', line)

    // Calculate and display slope
    const slope = growthRate / Math.LN10
    g.append('text')
      .attr('x', innerWidth - 10)
      .attr('y', 30)
      .attr('text-anchor', 'end')
      .attr('fill', '#22c55e')
      .attr('font-size', '12px')
      .text(`slope = ${slope.toFixed(3)}`)

    // Axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .attr('font-size', '12px')
      .text('Time')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .attr('font-size', '12px')
      .text('log(Population)')

  }, [data, timeSteps, growthRate], dimensions)

  return (
    <ChartContainer
      title="Linear vs Logarithmic Scale"
      description="See how exponential growth appears differently on linear and log scales"
    >
      <div className="flex flex-wrap gap-6 mb-6">
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-sand-700 mb-1">
            Growth Rate (r): {growthRate.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.05"
            max="0.5"
            step="0.05"
            value={growthRate}
            onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-sand-700 mb-1">
            Time Steps: {timeSteps}
          </label>
          <input
            type="range"
            min="10"
            max="50"
            step="5"
            value={timeSteps}
            onChange={(e) => setTimeSteps(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div ref={linearContainerRef} className="border border-sand-200 rounded-lg p-2">
          <svg ref={linearRef} className="w-full h-64" />
        </div>
        <div ref={logContainerRef} className="border border-sand-200 rounded-lg p-2">
          <svg ref={logRef} className="w-full h-64" />
        </div>
      </div>

      <div className="mt-6 p-4 bg-forest-50 border border-forest-200 rounded-lg">
        <h4 className="font-semibold text-forest-800 mb-2">Key Insight</h4>
        <p className="text-forest-700 text-sm mb-2">
          <strong>Exponential growth appears as a straight line on a log scale.</strong>
        </p>
        <p className="text-forest-600 text-sm">
          Why? If N(t) = N₀e^(rt), then log(N) = log(N₀) + (r/ln10)×t. This is a linear equation
          with slope r/ln(10) ≈ {(growthRate / Math.LN10).toFixed(3)}. Scientists use this property
          to identify exponential growth and measure growth rates from experimental data.
        </p>
      </div>
    </ChartContainer>
  )
}
