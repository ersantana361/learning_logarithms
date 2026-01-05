import { useState, useMemo } from 'react'
import { useD3 } from '@hooks/useD3'
import ChartContainer, { LegendItem } from '../shared/ChartContainer'
import * as d3 from 'd3'

// Sample allometric data: body mass (kg) vs metabolic rate (W)
const sampleData = [
  { name: 'Mouse', mass: 0.025, rate: 0.3 },
  { name: 'Rat', mass: 0.3, rate: 2.5 },
  { name: 'Rabbit', mass: 2, rate: 12 },
  { name: 'Cat', mass: 4, rate: 20 },
  { name: 'Dog', mass: 15, rate: 60 },
  { name: 'Human', mass: 70, rate: 80 },
  { name: 'Horse', mass: 500, rate: 400 },
  { name: 'Elephant', mass: 4000, rate: 2000 }
]

export default function LogLogPlotBuilder() {
  const [showRegression, setShowRegression] = useState(true)
  const [selectedSpecies, setSelectedSpecies] = useState(null)

  // Calculate regression on log-transformed data
  const regression = useMemo(() => {
    const n = sampleData.length
    const logMass = sampleData.map(d => Math.log10(d.mass))
    const logRate = sampleData.map(d => Math.log10(d.rate))

    const sumX = logMass.reduce((a, b) => a + b, 0)
    const sumY = logRate.reduce((a, b) => a + b, 0)
    const sumXY = logMass.reduce((sum, x, i) => sum + x * logRate[i], 0)
    const sumX2 = logMass.reduce((sum, x) => sum + x * x, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // R-squared
    const meanY = sumY / n
    const ssTotal = logRate.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0)
    const ssResidual = logRate.reduce((sum, y, i) => {
      const predicted = slope * logMass[i] + intercept
      return sum + Math.pow(y - predicted, 2)
    }, 0)
    const rSquared = 1 - ssResidual / ssTotal

    return { slope, intercept, rSquared, coefficient: Math.pow(10, intercept) }
  }, [])

  const svgRef = useD3((svg, { width, height }) => {
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 30, bottom: 60, left: 70 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Log scales
    const xScale = d3.scaleLog()
      .domain([0.01, 10000])
      .range([0, innerWidth])

    const yScale = d3.scaleLog()
      .domain([0.1, 5000])
      .range([innerHeight, 0])

    // Grid
    g.append('g')
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat('')
        .tickValues([0.1, 1, 10, 100, 1000])
      )
      .selectAll('line')
      .attr('stroke', '#e5e7eb')

    g.append('g')
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat('')
        .tickValues([0.01, 0.1, 1, 10, 100, 1000, 10000])
      )
      .attr('transform', `translate(0,${innerHeight})`)
      .selectAll('line')
      .attr('stroke', '#e5e7eb')

    g.selectAll('.domain').remove()

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickValues([0.01, 0.1, 1, 10, 100, 1000, 10000])
        .tickFormat(d3.format('.3~s'))
      )

    g.append('g')
      .call(d3.axisLeft(yScale)
        .tickValues([0.1, 1, 10, 100, 1000])
        .tickFormat(d3.format('.3~s'))
      )

    // Axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .text('Body Mass (kg) - log scale')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -55)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .text('Metabolic Rate (W) - log scale')

    // Regression line
    if (showRegression) {
      const x1 = 0.01
      const x2 = 10000
      const y1 = regression.coefficient * Math.pow(x1, regression.slope)
      const y2 = regression.coefficient * Math.pow(x2, regression.slope)

      g.append('line')
        .attr('x1', xScale(x1))
        .attr('x2', xScale(x2))
        .attr('y1', yScale(y1))
        .attr('y2', yScale(y2))
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '8,4')
    }

    // Data points
    sampleData.forEach(d => {
      const isSelected = selectedSpecies === d.name

      g.append('circle')
        .attr('cx', xScale(d.mass))
        .attr('cy', yScale(d.rate))
        .attr('r', isSelected ? 10 : 7)
        .attr('fill', isSelected ? '#3b82f6' : '#22c55e')
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer')
        .on('mouseenter', () => setSelectedSpecies(d.name))
        .on('mouseleave', () => setSelectedSpecies(null))

      if (isSelected) {
        g.append('text')
          .attr('x', xScale(d.mass))
          .attr('y', yScale(d.rate) - 15)
          .attr('text-anchor', 'middle')
          .attr('fill', '#1f2937')
          .attr('font-size', '12px')
          .attr('font-weight', '600')
          .text(d.name)
      }
    })

  }, [showRegression, selectedSpecies, regression])

  return (
    <ChartContainer
      title="Allometric Scaling: Log-Log Plot"
      description="Metabolic rate scales with body mass to the power of ~0.75 (Kleiber's Law)"
    >
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showRegression}
            onChange={(e) => setShowRegression(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-sand-700">Show regression line</span>
        </label>
        <div className="flex gap-2 items-center">
          <LegendItem color="#22c55e" label="Data points" />
          <LegendItem color="#ef4444" label="Best fit line" />
        </div>
      </div>

      <svg ref={svgRef} className="w-full h-80" />

      <div className="mt-4 grid md:grid-cols-4 gap-4">
        <div className="bg-forest-50 rounded-lg p-3 border border-forest-200">
          <div className="text-sm text-forest-600">Slope (exponent b)</div>
          <div className="text-xl font-bold text-forest-800">{regression.slope.toFixed(3)}</div>
          <div className="text-xs text-forest-500">≈ 0.75 (Kleiber's Law)</div>
        </div>
        <div className="bg-ocean-50 rounded-lg p-3 border border-ocean-200">
          <div className="text-sm text-ocean-600">Coefficient (a)</div>
          <div className="text-xl font-bold text-ocean-800">{regression.coefficient.toFixed(2)}</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <div className="text-sm text-amber-600">R² (fit quality)</div>
          <div className="text-xl font-bold text-amber-800">{regression.rSquared.toFixed(4)}</div>
        </div>
        <div className="bg-sand-100 rounded-lg p-3 border border-sand-200">
          <div className="text-sm text-sand-600">Equation</div>
          <div className="text-lg font-mono font-bold text-sand-800">
            Rate = {regression.coefficient.toFixed(1)} × M^{regression.slope.toFixed(2)}
          </div>
        </div>
      </div>

      {selectedSpecies && (
        <div className="mt-4 p-4 bg-sand-50 rounded-lg">
          {(() => {
            const species = sampleData.find(d => d.name === selectedSpecies)
            const predicted = regression.coefficient * Math.pow(species.mass, regression.slope)
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-sand-500">Species:</span> <strong>{species.name}</strong></div>
                <div><span className="text-sand-500">Mass:</span> <strong>{species.mass} kg</strong></div>
                <div><span className="text-sand-500">Actual Rate:</span> <strong>{species.rate} W</strong></div>
                <div><span className="text-sand-500">Predicted:</span> <strong>{predicted.toFixed(1)} W</strong></div>
              </div>
            )
          })()}
        </div>
      )}

      <div className="mt-4 p-4 bg-forest-50 border border-forest-200 rounded-lg">
        <h4 className="font-semibold text-forest-800 mb-2">Why Log-Log?</h4>
        <p className="text-forest-700 text-sm">
          A power law relationship (Y = a×X^b) appears as a <strong>straight line on a log-log plot</strong>.
          Taking log of both sides: log(Y) = log(a) + b×log(X). The slope gives the exponent b directly.
          This makes log-log plots essential for discovering and validating allometric relationships.
        </p>
      </div>
    </ChartContainer>
  )
}
