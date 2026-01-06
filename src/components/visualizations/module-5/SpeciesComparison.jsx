import { useState, useMemo, useRef, useEffect } from 'react'
import { useD3 } from '@hooks/useD3'
import ChartContainer from '../shared/ChartContainer'
import * as d3 from 'd3'

// Extended species database
const speciesData = [
  { name: 'Shrew', mass: 0.003, lifespan: 1.5, heartRate: 600, group: 'small-mammal' },
  { name: 'Mouse', mass: 0.025, lifespan: 2, heartRate: 500, group: 'small-mammal' },
  { name: 'Hamster', mass: 0.03, lifespan: 2.5, heartRate: 450, group: 'small-mammal' },
  { name: 'Rat', mass: 0.3, lifespan: 3, heartRate: 350, group: 'small-mammal' },
  { name: 'Guinea Pig', mass: 0.8, lifespan: 5, heartRate: 280, group: 'small-mammal' },
  { name: 'Rabbit', mass: 2, lifespan: 9, heartRate: 200, group: 'medium-mammal' },
  { name: 'Cat', mass: 4, lifespan: 15, heartRate: 140, group: 'medium-mammal' },
  { name: 'Dog', mass: 15, lifespan: 12, heartRate: 90, group: 'medium-mammal' },
  { name: 'Sheep', mass: 50, lifespan: 12, heartRate: 75, group: 'large-mammal' },
  { name: 'Human', mass: 70, lifespan: 75, heartRate: 70, group: 'large-mammal' },
  { name: 'Cow', mass: 500, lifespan: 20, heartRate: 60, group: 'large-mammal' },
  { name: 'Horse', mass: 500, lifespan: 30, heartRate: 40, group: 'large-mammal' },
  { name: 'Elephant', mass: 4000, lifespan: 70, heartRate: 30, group: 'large-mammal' },
  { name: 'Whale', mass: 100000, lifespan: 80, heartRate: 20, group: 'large-mammal' }
]

const yAxisOptions = [
  { id: 'lifespan', label: 'Lifespan (years)', expected: 0.25 },
  { id: 'heartRate', label: 'Heart Rate (bpm)', expected: -0.25 }
]

const groupColors = {
  'small-mammal': '#ef4444',
  'medium-mammal': '#f59e0b',
  'large-mammal': '#22c55e'
}

export default function SpeciesComparison() {
  const [yAxis, setYAxis] = useState('lifespan')
  const [showPrediction, setShowPrediction] = useState(true)
  const [hoveredSpecies, setHoveredSpecies] = useState(null)
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

  const yConfig = yAxisOptions.find(y => y.id === yAxis)

  // Calculate regression
  const regression = useMemo(() => {
    const n = speciesData.length
    const logMass = speciesData.map(d => Math.log10(d.mass))
    const logY = speciesData.map(d => Math.log10(d[yAxis]))

    const sumX = logMass.reduce((a, b) => a + b, 0)
    const sumY = logY.reduce((a, b) => a + b, 0)
    const sumXY = logMass.reduce((sum, x, i) => sum + x * logY[i], 0)
    const sumX2 = logMass.reduce((sum, x) => sum + x * x, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return { slope, intercept, coefficient: Math.pow(10, intercept) }
  }, [yAxis])

  const svgRef = useD3((svg, dims) => {
    if (!dims || dims.width <= 0 || dims.height <= 0) return
    const { width, height } = dims
    svg.selectAll('*').remove()
    svg.attr('width', width).attr('height', height)

    const margin = { top: 20, right: 30, bottom: 60, left: 70 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const xExtent = d3.extent(speciesData, d => d.mass)
    const yExtent = d3.extent(speciesData, d => d[yAxis])

    const xScale = d3.scaleLog()
      .domain([xExtent[0] * 0.5, xExtent[1] * 2])
      .range([0, innerWidth])

    const yScale = d3.scaleLog()
      .domain([yExtent[0] * 0.5, yExtent[1] * 2])
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
      .call(d3.axisBottom(xScale).tickFormat(d3.format('.2~s')))

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d3.format('.2~s')))

    // Axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .text('Body Mass (kg)')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -55)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .text(yConfig.label)

    // Regression line
    if (showPrediction) {
      const x1 = xExtent[0] * 0.5
      const x2 = xExtent[1] * 2
      const y1 = regression.coefficient * Math.pow(x1, regression.slope)
      const y2 = regression.coefficient * Math.pow(x2, regression.slope)

      g.append('line')
        .attr('x1', xScale(x1))
        .attr('x2', xScale(x2))
        .attr('y1', yScale(Math.max(y1, yExtent[0] * 0.5)))
        .attr('y2', yScale(Math.min(y2, yExtent[1] * 2)))
        .attr('stroke', '#6366f1')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '8,4')
    }

    // Data points
    speciesData.forEach(d => {
      const isHovered = hoveredSpecies === d.name

      g.append('circle')
        .attr('cx', xScale(d.mass))
        .attr('cy', yScale(d[yAxis]))
        .attr('r', isHovered ? 10 : 7)
        .attr('fill', groupColors[d.group])
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer')
        .on('mouseenter', () => setHoveredSpecies(d.name))
        .on('mouseleave', () => setHoveredSpecies(null))

      if (isHovered) {
        g.append('text')
          .attr('x', xScale(d.mass))
          .attr('y', yScale(d[yAxis]) - 15)
          .attr('text-anchor', 'middle')
          .attr('fill', '#1f2937')
          .attr('font-size', '12px')
          .attr('font-weight', '600')
          .text(d.name)
      }
    })

  }, [yAxis, showPrediction, hoveredSpecies, regression], dimensions)

  return (
    <ChartContainer
      title="Species Comparison Database"
      description="Explore how various biological parameters scale with body mass"
    >
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex gap-2">
          {yAxisOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setYAxis(option.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                yAxis === option.id
                  ? 'bg-ocean-500 text-white'
                  : 'bg-sand-100 text-sand-600 hover:bg-sand-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showPrediction}
            onChange={(e) => setShowPrediction(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-sand-700">Show regression line</span>
        </label>
      </div>

      <div className="flex gap-4 mb-2 text-sm">
        {Object.entries(groupColors).map(([group, color]) => (
          <div key={group} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-sand-600 capitalize">{group.replace('-', ' ')}</span>
          </div>
        ))}
      </div>

      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} className="w-full h-80" />
      </div>

      <div className="mt-4 grid md:grid-cols-3 gap-4">
        <div className="bg-ocean-50 rounded-lg p-3 border border-ocean-200">
          <div className="text-sm text-ocean-600">Observed Slope</div>
          <div className="text-xl font-bold text-ocean-800">{regression.slope.toFixed(3)}</div>
        </div>
        <div className="bg-forest-50 rounded-lg p-3 border border-forest-200">
          <div className="text-sm text-forest-600">Expected Slope</div>
          <div className="text-xl font-bold text-forest-800">{yConfig.expected}</div>
        </div>
        <div className="bg-sand-100 rounded-lg p-3 border border-sand-200">
          <div className="text-sm text-sand-600">Equation</div>
          <div className="text-lg font-mono font-bold text-sand-800">
            Y = {regression.coefficient.toFixed(2)} × M^{regression.slope.toFixed(2)}
          </div>
        </div>
      </div>

      {hoveredSpecies && (
        <div className="mt-4 p-4 bg-sand-50 rounded-lg">
          {(() => {
            const species = speciesData.find(d => d.name === hoveredSpecies)
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-sand-500">Species:</span> <strong>{species.name}</strong></div>
                <div><span className="text-sand-500">Mass:</span> <strong>{species.mass} kg</strong></div>
                <div><span className="text-sand-500">Lifespan:</span> <strong>{species.lifespan} years</strong></div>
                <div><span className="text-sand-500">Heart Rate:</span> <strong>{species.heartRate} bpm</strong></div>
              </div>
            )
          })()}
        </div>
      )}
    </ChartContainer>
  )
}
