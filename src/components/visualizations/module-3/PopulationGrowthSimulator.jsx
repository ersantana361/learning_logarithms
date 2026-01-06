import { useState, useMemo, useRef, useEffect } from 'react'
import { useD3 } from '@hooks/useD3'
import ChartContainer, { LegendItem } from '../shared/ChartContainer'
import * as d3 from 'd3'

export default function PopulationGrowthSimulator() {
  const [growthRate, setGrowthRate] = useState(0.3) // r
  const [carryingCapacity, setCarryingCapacity] = useState(1000) // K
  const [initialPopulation, setInitialPopulation] = useState(10) // N0
  const [showLogistic, setShowLogistic] = useState(true)
  const [showExponential, setShowExponential] = useState(true)
  const [timeSteps, setTimeSteps] = useState(50)
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

  // Generate population data
  const data = useMemo(() => {
    const exponential = []
    const logistic = []

    for (let t = 0; t <= timeSteps; t++) {
      // Exponential: N(t) = N0 * e^(rt)
      const expN = initialPopulation * Math.exp(growthRate * t)
      exponential.push({ t, N: Math.min(expN, carryingCapacity * 10) })

      // Logistic: N(t) = K / (1 + ((K - N0) / N0) * e^(-rt))
      const logN = carryingCapacity / (1 + ((carryingCapacity - initialPopulation) / initialPopulation) * Math.exp(-growthRate * t))
      logistic.push({ t, N: logN })
    }

    return { exponential, logistic }
  }, [growthRate, carryingCapacity, initialPopulation, timeSteps])

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

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, timeSteps])
      .range([0, innerWidth])

    const maxY = Math.max(
      showExponential ? d3.max(data.exponential, d => d.N) : 0,
      showLogistic ? carryingCapacity * 1.1 : 0
    )

    const yScale = d3.scaleLinear()
      .domain([0, maxY])
      .range([innerHeight, 0])

    // Grid
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat('')
      )
      .selectAll('line')
      .attr('stroke', '#e5e7eb')

    g.selectAll('.grid .domain').remove()

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d3.format('.0s')))

    // Axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .text('Time (generations)')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -55)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .text('Population Size (N)')

    // Line generator
    const line = d3.line()
      .x(d => xScale(d.t))
      .y(d => yScale(d.N))
      .curve(d3.curveMonotoneX)

    // Carrying capacity line
    if (showLogistic) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(carryingCapacity))
        .attr('y2', yScale(carryingCapacity))
        .attr('stroke', '#9ca3af')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '8,4')

      g.append('text')
        .attr('x', innerWidth - 5)
        .attr('y', yScale(carryingCapacity) - 8)
        .attr('text-anchor', 'end')
        .attr('fill', '#6b7280')
        .attr('font-size', '12px')
        .text(`K = ${carryingCapacity}`)
    }

    // Exponential curve
    if (showExponential) {
      g.append('path')
        .datum(data.exponential)
        .attr('fill', 'none')
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 3)
        .attr('d', line)
    }

    // Logistic curve
    if (showLogistic) {
      g.append('path')
        .datum(data.logistic)
        .attr('fill', 'none')
        .attr('stroke', '#22c55e')
        .attr('stroke-width', 3)
        .attr('d', line)
    }

  }, [data, showExponential, showLogistic, carryingCapacity, timeSteps], dimensions)

  // Calculate doubling time
  const doublingTime = Math.log(2) / growthRate

  return (
    <ChartContainer
      title="Population Growth Simulator"
      description="Compare exponential and logistic growth models with adjustable parameters"
    >
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-sand-700 mb-1">
              Growth Rate (r): {growthRate.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={growthRate}
              onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-sand-500">
              Doubling time: {doublingTime.toFixed(1)} generations
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-sand-700 mb-1">
              Initial Population (N₀): {initialPopulation}
            </label>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={initialPopulation}
              onChange={(e) => setInitialPopulation(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-sand-700 mb-1">
              Carrying Capacity (K): {carryingCapacity}
            </label>
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={carryingCapacity}
              onChange={(e) => setCarryingCapacity(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sand-700 mb-1">
              Time Steps: {timeSteps}
            </label>
            <input
              type="range"
              min="20"
              max="100"
              step="10"
              value={timeSteps}
              onChange={(e) => setTimeSteps(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showExponential}
            onChange={(e) => setShowExponential(e.target.checked)}
            className="rounded"
          />
          <LegendItem color="#ef4444" label="Exponential (unlimited)" />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showLogistic}
            onChange={(e) => setShowLogistic(e.target.checked)}
            className="rounded"
          />
          <LegendItem color="#22c55e" label="Logistic (limited)" />
        </label>
      </div>

      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} className="w-full h-80" />
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <h4 className="font-semibold text-red-800 mb-2">Exponential Growth</h4>
          <p className="text-sm text-red-700 mb-2">N(t) = N₀ × e^(rt)</p>
          <p className="text-xs text-red-600">
            Assumes unlimited resources. Population grows without bound.
            On a log scale, this appears as a straight line.
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">Logistic Growth</h4>
          <p className="text-sm text-green-700 mb-2">N(t) = K / (1 + ((K-N₀)/N₀) × e^(-rt))</p>
          <p className="text-xs text-green-600">
            Accounts for resource limits. Population approaches carrying capacity K.
            S-shaped curve (sigmoid).
          </p>
        </div>
      </div>
    </ChartContainer>
  )
}
