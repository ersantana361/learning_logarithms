import { useState, useMemo, useRef, useEffect } from 'react'
import { useD3 } from '@hooks/useD3'
import ChartContainer, { LegendItem } from '../shared/ChartContainer'
import * as d3 from 'd3'

// Bacterial growth phases
const phases = [
  { id: 'lag', name: 'Lag Phase', color: '#f59e0b', description: 'Cells adapt to new environment, no growth' },
  { id: 'log', name: 'Log/Exponential Phase', color: '#22c55e', description: 'Rapid exponential growth, constant doubling' },
  { id: 'stationary', name: 'Stationary Phase', color: '#3b82f6', description: 'Growth rate equals death rate, nutrients depleted' },
  { id: 'death', name: 'Death Phase', color: '#ef4444', description: 'Population declines as cells die' }
]

export default function BacterialGrowthCurve() {
  const [lagDuration, setLagDuration] = useState(2)
  const [doublingTime, setDoublingTime] = useState(0.5)
  const [useLogScale, setUseLogScale] = useState(true)
  const [hoveredPhase, setHoveredPhase] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 600, height: 320 })
  const containerRef = useRef(null)

  // Track container dimensions
  useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        setDimensions({ width, height: 320 })
      }
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // Generate growth curve data
  const data = useMemo(() => {
    const points = []
    const initialN = 100
    const maxN = 1e9
    const growthRate = Math.log(2) / doublingTime

    // Lag phase (0 to lagDuration hours)
    for (let t = 0; t <= lagDuration; t += 0.1) {
      points.push({ t, N: initialN, phase: 'lag' })
    }

    // Log phase (lagDuration to when N approaches max)
    let currentN = initialN
    let t = lagDuration
    while (currentN < maxN * 0.9 && t < lagDuration + 15) {
      t += 0.1
      currentN = initialN * Math.exp(growthRate * (t - lagDuration))
      points.push({ t, N: Math.min(currentN, maxN), phase: 'log' })
    }

    const logEndTime = t
    const peakN = currentN

    // Stationary phase (plateau)
    for (let i = 0; i < 40; i++) {
      t += 0.1
      points.push({ t, N: peakN + (Math.random() - 0.5) * peakN * 0.02, phase: 'stationary' })
    }

    const stationaryEndTime = t

    // Death phase (exponential decline)
    const deathRate = growthRate * 0.3
    let deathN = peakN
    while (deathN > initialN && t < stationaryEndTime + 10) {
      t += 0.1
      deathN = peakN * Math.exp(-deathRate * (t - stationaryEndTime))
      points.push({ t, N: Math.max(deathN, initialN / 2), phase: 'death' })
    }

    return { points, phaseEnds: { lag: lagDuration, log: logEndTime, stationary: stationaryEndTime } }
  }, [lagDuration, doublingTime])

  const svgRef = useD3((svg, dims) => {
    if (!dims || dims.width <= 0 || dims.height <= 0) return

    const { width, height } = dims
    svg.selectAll('*').remove()
    svg.attr('width', width).attr('height', height)

    const margin = { top: 30, right: 30, bottom: 50, left: 70 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data.points, d => d.t)])
      .range([0, innerWidth])

    const yScale = useLogScale
      ? d3.scaleLog()
          .domain([d3.min(data.points, d => d.N), d3.max(data.points, d => d.N)])
          .range([innerHeight, 0])
      : d3.scaleLinear()
          .domain([0, d3.max(data.points, d => d.N)])
          .range([innerHeight, 0])

    // Phase background regions
    const phaseColors = {
      lag: '#fef3c7',
      log: '#dcfce7',
      stationary: '#dbeafe',
      death: '#fee2e2'
    }

    // Draw phase backgrounds
    let lastEnd = 0
    Object.entries(data.phaseEnds).forEach(([phase, end]) => {
      g.append('rect')
        .attr('x', xScale(lastEnd))
        .attr('y', 0)
        .attr('width', xScale(end) - xScale(lastEnd))
        .attr('height', innerHeight)
        .attr('fill', phaseColors[phase])
        .attr('opacity', hoveredPhase === phase ? 0.8 : 0.4)
      lastEnd = end
    })

    // Death phase
    g.append('rect')
      .attr('x', xScale(data.phaseEnds.stationary))
      .attr('y', 0)
      .attr('width', innerWidth - xScale(data.phaseEnds.stationary))
      .attr('height', innerHeight)
      .attr('fill', phaseColors.death)
      .attr('opacity', hoveredPhase === 'death' ? 0.8 : 0.4)

    // Grid
    g.append('g')
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat('')
      )
      .selectAll('line')
      .attr('stroke', '#d1d5db')

    g.selectAll('.domain').remove()

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(useLogScale ? 5 : 6, useLogScale ? '.0s' : '.0s'))

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
      .text(useLogScale ? 'Cell Count (log scale)' : 'Cell Count')

    // Draw curve with phase colors
    phases.forEach(phase => {
      const phaseData = data.points.filter(d => d.phase === phase.id)
      if (phaseData.length === 0) return

      const line = d3.line()
        .x(d => xScale(d.t))
        .y(d => yScale(d.N))
        .curve(d3.curveMonotoneX)

      g.append('path')
        .datum(phaseData)
        .attr('fill', 'none')
        .attr('stroke', phase.color)
        .attr('stroke-width', 3)
        .attr('d', line)
    })

    // Phase labels
    const labelPositions = [
      { phase: 'lag', x: data.phaseEnds.lag / 2 },
      { phase: 'log', x: (data.phaseEnds.lag + data.phaseEnds.log) / 2 },
      { phase: 'stationary', x: (data.phaseEnds.log + data.phaseEnds.stationary) / 2 },
      { phase: 'death', x: (data.phaseEnds.stationary + d3.max(data.points, d => d.t)) / 2 }
    ]

    labelPositions.forEach(({ phase, x }) => {
      const phaseInfo = phases.find(p => p.id === phase)
      g.append('text')
        .attr('x', xScale(x))
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('fill', phaseInfo.color)
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text(phaseInfo.name)
    })

  }, [data, useLogScale, hoveredPhase], dimensions)

  return (
    <ChartContainer
      title="Bacterial Growth Curve"
      description="The four phases of bacterial growth in batch culture"
    >
      <div className="flex flex-wrap gap-6 mb-6">
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-sand-700 mb-1">
            Lag Duration: {lagDuration.toFixed(1)} hours
          </label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.5"
            value={lagDuration}
            onChange={(e) => setLagDuration(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-sand-700 mb-1">
            Doubling Time: {doublingTime.toFixed(1)} hours
          </label>
          <input
            type="range"
            min="0.2"
            max="2"
            step="0.1"
            value={doublingTime}
            onChange={(e) => setDoublingTime(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={useLogScale}
            onChange={(e) => setUseLogScale(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-sand-700">Logarithmic scale</span>
        </label>
      </div>

      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} className="w-full h-80" />
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {phases.map(phase => (
          <div
            key={phase.id}
            className="p-3 rounded-lg border cursor-pointer transition-all"
            style={{
              borderColor: phase.color,
              backgroundColor: hoveredPhase === phase.id ? phase.color + '20' : 'white'
            }}
            onMouseEnter={() => setHoveredPhase(phase.id)}
            onMouseLeave={() => setHoveredPhase(null)}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: phase.color }}
              />
              <span className="font-semibold text-sm" style={{ color: phase.color }}>
                {phase.name}
              </span>
            </div>
            <p className="text-xs text-sand-600">{phase.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h4 className="font-semibold text-amber-800 mb-2">Why Log Scale?</h4>
        <p className="text-amber-700 text-sm">
          On a log scale, the exponential (log) phase appears as a <strong>straight line</strong>.
          The slope of this line equals the growth rate constant (k = ln2/doubling time = {(Math.log(2) / doublingTime).toFixed(2)} hr⁻¹).
          This makes it easy to compare growth rates between different conditions or species.
        </p>
      </div>
    </ChartContainer>
  )
}
