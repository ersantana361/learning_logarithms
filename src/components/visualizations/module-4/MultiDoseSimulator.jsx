import { useState, useMemo, useRef, useEffect } from 'react'
import { useD3 } from '@hooks/useD3'
import ChartContainer, { LegendItem } from '../shared/ChartContainer'
import * as d3 from 'd3'

export default function MultiDoseSimulator() {
  const [dose, setDose] = useState(100)
  const [halfLife, setHalfLife] = useState(6)
  const [dosingInterval, setDosingInterval] = useState(8)
  const [numDoses, setNumDoses] = useState(8)
  const [showSteadyState, setShowSteadyState] = useState(true)
  const [dimensions, setDimensions] = useState({ width: 600, height: 320 })
  const containerRef = useRef(null)

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

  const data = useMemo(() => {
    const points = []
    const k = Math.log(2) / halfLife
    const totalTime = numDoses * dosingInterval

    for (let t = 0; t <= totalTime; t += 0.1) {
      let concentration = 0

      // Sum contributions from each dose
      for (let doseNum = 0; doseNum < numDoses; doseNum++) {
        const doseTime = doseNum * dosingInterval
        if (t >= doseTime) {
          concentration += dose * Math.exp(-k * (t - doseTime))
        }
      }

      points.push({ t, C: concentration })
    }

    return points
  }, [dose, halfLife, dosingInterval, numDoses])

  // Calculate steady-state parameters
  const k = Math.log(2) / halfLife
  const steadyStatePeak = dose / (1 - Math.exp(-k * dosingInterval))
  const steadyStateTrough = steadyStatePeak * Math.exp(-k * dosingInterval)
  const fluctuation = ((steadyStatePeak - steadyStateTrough) / steadyStateTrough * 100)

  const svgRef = useD3((svg, dims) => {
    if (!dims || dims.width <= 0 || dims.height <= 0) return
    const { width, height } = dims
    svg.selectAll('*').remove()
    svg.attr('width', width).attr('height', height)

    const margin = { top: 20, right: 30, bottom: 50, left: 70 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const xScale = d3.scaleLinear()
      .domain([0, numDoses * dosingInterval])
      .range([0, innerWidth])

    const yScale = d3.scaleLinear()
      .domain([0, steadyStatePeak * 1.2])
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

    // Steady-state bands
    if (showSteadyState) {
      // Peak line
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(steadyStatePeak))
        .attr('y2', yScale(steadyStatePeak))
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '8,4')

      g.append('text')
        .attr('x', innerWidth - 5)
        .attr('y', yScale(steadyStatePeak) - 5)
        .attr('text-anchor', 'end')
        .attr('fill', '#ef4444')
        .attr('font-size', '11px')
        .text(`Css,max = ${steadyStatePeak.toFixed(0)}`)

      // Trough line
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(steadyStateTrough))
        .attr('y2', yScale(steadyStateTrough))
        .attr('stroke', '#22c55e')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '8,4')

      g.append('text')
        .attr('x', innerWidth - 5)
        .attr('y', yScale(steadyStateTrough) + 15)
        .attr('text-anchor', 'end')
        .attr('fill', '#22c55e')
        .attr('font-size', '11px')
        .text(`Css,min = ${steadyStateTrough.toFixed(0)}`)
    }

    // Dose markers
    for (let i = 0; i < numDoses; i++) {
      const doseTime = i * dosingInterval
      g.append('line')
        .attr('x1', xScale(doseTime))
        .attr('x2', xScale(doseTime))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#d1d5db')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2')
    }

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))

    g.append('g')
      .call(d3.axisLeft(yScale))

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

    // Concentration curve
    const line = d3.line()
      .x(d => xScale(d.t))
      .y(d => yScale(d.C))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', line)

  }, [data, numDoses, dosingInterval, steadyStatePeak, steadyStateTrough, showSteadyState], dimensions)

  return (
    <ChartContainer
      title="Multiple Dose Drug Accumulation"
      description="Watch drug concentration build up to steady state with repeated dosing"
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-sand-700 mb-1">
            Dose: {dose} mg
          </label>
          <input
            type="range"
            min="50"
            max="200"
            step="10"
            value={dose}
            onChange={(e) => setDose(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-sand-700 mb-1">
            Half-life: {halfLife} hours
          </label>
          <input
            type="range"
            min="2"
            max="24"
            step="1"
            value={halfLife}
            onChange={(e) => setHalfLife(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-sand-700 mb-1">
            Dosing Interval: {dosingInterval} hours
          </label>
          <input
            type="range"
            min="4"
            max="24"
            step="2"
            value={dosingInterval}
            onChange={(e) => setDosingInterval(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-sand-700 mb-1">
            Number of Doses: {numDoses}
          </label>
          <input
            type="range"
            min="4"
            max="12"
            step="1"
            value={numDoses}
            onChange={(e) => setNumDoses(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showSteadyState}
            onChange={(e) => setShowSteadyState(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-sand-700">Show steady-state levels</span>
        </label>
      </div>

      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} className="w-full h-80" />
      </div>

      <div className="mt-4 grid md:grid-cols-4 gap-4 text-sm">
        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
          <div className="text-red-600">Steady-state Peak</div>
          <div className="text-xl font-bold text-red-800">{steadyStatePeak.toFixed(0)} mg/L</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="text-green-600">Steady-state Trough</div>
          <div className="text-xl font-bold text-green-800">{steadyStateTrough.toFixed(0)} mg/L</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <div className="text-amber-600">Fluctuation</div>
          <div className="text-xl font-bold text-amber-800">{fluctuation.toFixed(0)}%</div>
        </div>
        <div className="bg-ocean-50 rounded-lg p-3 border border-ocean-200">
          <div className="text-ocean-600">Time to 90% SS</div>
          <div className="text-xl font-bold text-ocean-800">{(3.32 * halfLife).toFixed(0)} hours</div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-forest-50 border border-forest-200 rounded-lg">
        <h4 className="font-semibold text-forest-800 mb-2">Steady-State Principle</h4>
        <p className="text-forest-700 text-sm">
          Steady state is reached after approximately <strong>4-5 half-lives</strong>, regardless of dose or
          dosing interval. At steady state, the amount eliminated between doses equals the dose given.
          The accumulation factor = 1/(1 - e^(-k×τ)) where τ is the dosing interval.
        </p>
      </div>
    </ChartContainer>
  )
}
