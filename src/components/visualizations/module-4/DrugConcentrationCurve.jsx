import { useState, useMemo } from 'react'
import { useD3 } from '@hooks/useD3'
import ChartContainer, { LegendItem } from '../shared/ChartContainer'
import * as d3 from 'd3'

export default function DrugConcentrationCurve() {
  const [initialConcentration, setInitialConcentration] = useState(100)
  const [halfLife, setHalfLife] = useState(4)
  const [timeRange, setTimeRange] = useState(24)
  const [useLogScale, setUseLogScale] = useState(false)

  const data = useMemo(() => {
    const points = []
    const k = Math.log(2) / halfLife // elimination rate constant

    for (let t = 0; t <= timeRange; t += 0.1) {
      points.push({
        t,
        C: initialConcentration * Math.exp(-k * t)
      })
    }
    return points
  }, [initialConcentration, halfLife, timeRange])

  // Calculate key time points
  const halfLifePoints = useMemo(() => {
    const points = []
    let C = initialConcentration
    let t = 0

    while (C > initialConcentration * 0.05 && points.length < 6) {
      points.push({ t, C })
      t += halfLife
      C = initialConcentration * Math.pow(0.5, t / halfLife)
    }
    return points
  }, [initialConcentration, halfLife])

  const svgRef = useD3((svg, { width, height }) => {
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 30, bottom: 50, left: 70 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const xScale = d3.scaleLinear()
      .domain([0, timeRange])
      .range([0, innerWidth])

    const yScale = useLogScale
      ? d3.scaleLog()
          .domain([initialConcentration * 0.01, initialConcentration])
          .range([innerHeight, 0])
      : d3.scaleLinear()
          .domain([0, initialConcentration * 1.1])
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
      .call(d3.axisBottom(xScale))

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(useLogScale ? 5 : 6))

    // Axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .text('Time (hours)')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -55)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .text('Drug Concentration (mg/L)')

    // Main curve
    const line = d3.line()
      .x(d => xScale(d.t))
      .y(d => yScale(Math.max(d.C, initialConcentration * 0.01)))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3)
      .attr('d', line)

    // Half-life markers
    halfLifePoints.forEach((point, i) => {
      if (i === 0) return

      const y = yScale(point.C)

      // Horizontal dashed line to y-axis
      g.append('line')
        .attr('x1', 0)
        .attr('x2', xScale(point.t))
        .attr('y1', y)
        .attr('y2', y)
        .attr('stroke', '#9ca3af')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,4')

      // Vertical dashed line to x-axis
      g.append('line')
        .attr('x1', xScale(point.t))
        .attr('x2', xScale(point.t))
        .attr('y1', y)
        .attr('y2', innerHeight)
        .attr('stroke', '#9ca3af')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,4')

      // Point marker
      g.append('circle')
        .attr('cx', xScale(point.t))
        .attr('cy', y)
        .attr('r', 6)
        .attr('fill', '#f59e0b')
        .attr('stroke', 'white')
        .attr('stroke-width', 2)

      // Label
      g.append('text')
        .attr('x', xScale(point.t))
        .attr('y', y - 12)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f59e0b')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text(`t½ × ${i}`)
    })

  }, [data, halfLifePoints, useLogScale, initialConcentration, timeRange])

  const eliminationConstant = Math.log(2) / halfLife

  return (
    <ChartContainer
      title="Drug Concentration Over Time"
      description="First-order elimination kinetics: concentration decreases exponentially"
    >
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-sand-700 mb-1">
            Initial Concentration: {initialConcentration} mg/L
          </label>
          <input
            type="range"
            min="50"
            max="200"
            step="10"
            value={initialConcentration}
            onChange={(e) => setInitialConcentration(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-sand-700 mb-1">
            Half-life: {halfLife} hours
          </label>
          <input
            type="range"
            min="1"
            max="12"
            step="0.5"
            value={halfLife}
            onChange={(e) => setHalfLife(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-sand-700 mb-1">
            Time Range: {timeRange} hours
          </label>
          <input
            type="range"
            min="12"
            max="48"
            step="6"
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={useLogScale}
            onChange={(e) => setUseLogScale(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-sand-700">Log scale (shows linear decay)</span>
        </label>
      </div>

      <svg ref={svgRef} className="w-full h-80" />

      <div className="mt-4 grid md:grid-cols-3 gap-4">
        <div className="bg-ocean-50 rounded-lg p-4 border border-ocean-200">
          <div className="text-sm text-ocean-600">Half-life (t½)</div>
          <div className="text-2xl font-bold text-ocean-800">{halfLife} hours</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <div className="text-sm text-amber-600">Elimination constant (k)</div>
          <div className="text-2xl font-bold text-amber-800">{eliminationConstant.toFixed(3)} /hr</div>
        </div>
        <div className="bg-forest-50 rounded-lg p-4 border border-forest-200">
          <div className="text-sm text-forest-600">After 5 half-lives</div>
          <div className="text-2xl font-bold text-forest-800">{(initialConcentration * 0.03125).toFixed(1)} mg/L</div>
          <div className="text-xs text-forest-500">(~3% remaining)</div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-sand-50 border border-sand-200 rounded-lg">
        <h4 className="font-semibold text-sand-800 mb-2">Key Equations</h4>
        <div className="grid md:grid-cols-2 gap-2 text-sm text-sand-700">
          <div>C(t) = C₀ × e^(-kt) = C₀ × (½)^(t/t½)</div>
          <div>k = ln(2)/t½ = 0.693/t½</div>
        </div>
      </div>
    </ChartContainer>
  )
}
