import { useState } from 'react'
import { useD3 } from '@hooks/useD3'
import ChartContainer, { LegendItem } from '../shared/ChartContainer'
import * as d3 from 'd3'

// Historical and projected data
const oceanData = [
  { year: 1850, ph: 8.18, co2: 285 },
  { year: 1900, ph: 8.17, co2: 295 },
  { year: 1950, ph: 8.15, co2: 310 },
  { year: 1960, ph: 8.14, co2: 317 },
  { year: 1970, ph: 8.13, co2: 326 },
  { year: 1980, ph: 8.11, co2: 339 },
  { year: 1990, ph: 8.09, co2: 354 },
  { year: 2000, ph: 8.07, co2: 369 },
  { year: 2010, ph: 8.05, co2: 389 },
  { year: 2020, ph: 8.04, co2: 414 },
  // Projections (RCP 8.5 scenario)
  { year: 2030, ph: 8.02, co2: 450, projected: true },
  { year: 2050, ph: 7.95, co2: 550, projected: true },
  { year: 2070, ph: 7.88, co2: 680, projected: true },
  { year: 2100, ph: 7.75, co2: 930, projected: true }
]

const biologicalImpacts = [
  { ph: 8.1, impact: 'Current ocean conditions', severity: 'normal' },
  { ph: 8.0, impact: 'Coral calcification begins to slow', severity: 'warning' },
  { ph: 7.9, impact: 'Shell-forming organisms stressed', severity: 'warning' },
  { ph: 7.8, impact: 'Significant coral reef decline', severity: 'danger' },
  { ph: 7.7, impact: 'Many marine species endangered', severity: 'danger' }
]

export default function OceanAcidificationChart() {
  const [showCO2, setShowCO2] = useState(true)
  const [showProjections, setShowProjections] = useState(true)
  const [hoveredPoint, setHoveredPoint] = useState(null)

  const svgRef = useD3((svg, { width, height }) => {
    svg.selectAll('*').remove()

    const margin = { top: 40, right: 80, bottom: 60, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const filteredData = showProjections
      ? oceanData
      : oceanData.filter(d => !d.projected)

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(filteredData, d => d.year))
      .range([0, innerWidth])

    const yScalePH = d3.scaleLinear()
      .domain([7.7, 8.25])
      .range([innerHeight, 0])

    const yScaleCO2 = d3.scaleLinear()
      .domain([250, 1000])
      .range([innerHeight, 0])

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScalePH)
        .tickSize(-innerWidth)
        .tickFormat('')
      )
      .selectAll('line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-dasharray', '3,3')

    g.selectAll('.grid .domain').remove()

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
      .attr('class', 'text-sand-600')

    g.append('g')
      .call(d3.axisLeft(yScalePH))
      .attr('class', 'text-ocean-600')

    if (showCO2) {
      g.append('g')
        .attr('transform', `translate(${innerWidth},0)`)
        .call(d3.axisRight(yScaleCO2))
        .attr('class', 'text-amber-600')
    }

    // Axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .text('Year')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#0ea5e9')
      .text('Ocean pH')

    if (showCO2) {
      g.append('text')
        .attr('transform', 'rotate(90)')
        .attr('x', innerHeight / 2)
        .attr('y', -innerWidth - 55)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f59e0b')
        .text('Atmospheric CO₂ (ppm)')
    }

    // Line generators
    const linePH = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScalePH(d.ph))
      .curve(d3.curveMonotoneX)

    const lineCO2 = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScaleCO2(d.co2))
      .curve(d3.curveMonotoneX)

    // Historical data
    const historicalData = filteredData.filter(d => !d.projected)
    const projectedData = filteredData.filter(d => d.projected)

    // pH line - historical
    g.append('path')
      .datum(historicalData)
      .attr('fill', 'none')
      .attr('stroke', '#0ea5e9')
      .attr('stroke-width', 3)
      .attr('d', linePH)

    // pH line - projected
    if (showProjections && projectedData.length > 0) {
      const transitionData = [historicalData[historicalData.length - 1], ...projectedData]
      g.append('path')
        .datum(transitionData)
        .attr('fill', 'none')
        .attr('stroke', '#0ea5e9')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '8,4')
        .attr('d', linePH)
    }

    // CO2 line
    if (showCO2) {
      g.append('path')
        .datum(historicalData)
        .attr('fill', 'none')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 2)
        .attr('d', lineCO2)

      if (showProjections && projectedData.length > 0) {
        const transitionData = [historicalData[historicalData.length - 1], ...projectedData]
        g.append('path')
          .datum(transitionData)
          .attr('fill', 'none')
          .attr('stroke', '#f59e0b')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '8,4')
          .attr('d', lineCO2)
      }
    }

    // Data points
    filteredData.forEach(d => {
      g.append('circle')
        .attr('cx', xScale(d.year))
        .attr('cy', yScalePH(d.ph))
        .attr('r', hoveredPoint?.year === d.year ? 8 : 5)
        .attr('fill', d.projected ? '#fff' : '#0ea5e9')
        .attr('stroke', '#0ea5e9')
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer')
        .on('mouseenter', () => setHoveredPoint(d))
        .on('mouseleave', () => setHoveredPoint(null))
    })

    // Biological impact zones
    const impactGradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'impact-gradient')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '100%')

    impactGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#22c55e')
      .attr('stop-opacity', 0.1)

    impactGradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', '#f59e0b')
      .attr('stop-opacity', 0.1)

    impactGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#ef4444')
      .attr('stop-opacity', 0.2)

    // Add horizontal lines for impact thresholds
    biologicalImpacts.forEach(impact => {
      const y = yScalePH(impact.ph)
      if (y >= 0 && y <= innerHeight) {
        g.append('line')
          .attr('x1', 0)
          .attr('x2', innerWidth)
          .attr('y1', y)
          .attr('y2', y)
          .attr('stroke', impact.severity === 'danger' ? '#ef4444' : impact.severity === 'warning' ? '#f59e0b' : '#22c55e')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '4,2')
          .attr('opacity', 0.6)
      }
    })

  }, [showCO2, showProjections, hoveredPoint])

  return (
    <ChartContainer
      title="Ocean Acidification Over Time"
      description="How rising CO₂ levels are lowering ocean pH - a logarithmic measure of acidity"
    >
      <div className="flex flex-wrap gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showCO2}
            onChange={(e) => setShowCO2(e.target.checked)}
            className="rounded border-sand-300"
          />
          <span className="text-sand-700">Show CO₂ levels</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showProjections}
            onChange={(e) => setShowProjections(e.target.checked)}
            className="rounded border-sand-300"
          />
          <span className="text-sand-700">Show projections (2030-2100)</span>
        </label>
      </div>

      <div className="flex gap-4 mb-2">
        <LegendItem color="#0ea5e9" label="Ocean pH" />
        {showCO2 && <LegendItem color="#f59e0b" label="CO₂ (ppm)" />}
        <span className="text-sm text-sand-500">— Historical | - - Projected</span>
      </div>

      <svg ref={svgRef} className="w-full h-80" />

      {hoveredPoint && (
        <div className="mt-4 p-4 bg-sand-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-sand-500">Year</span>
              <div className="font-semibold">{hoveredPoint.year}{hoveredPoint.projected && ' (projected)'}</div>
            </div>
            <div>
              <span className="text-sand-500">Ocean pH</span>
              <div className="font-semibold text-ocean-600">{hoveredPoint.ph.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-sand-500">CO₂ Level</span>
              <div className="font-semibold text-amber-600">{hoveredPoint.co2} ppm</div>
            </div>
            <div>
              <span className="text-sand-500">[H⁺] Change</span>
              <div className="font-semibold text-red-600">
                +{((Math.pow(10, -hoveredPoint.ph) / Math.pow(10, -8.18) - 1) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <h4 className="font-semibold text-sand-800">Biological Impact Thresholds</h4>
        {biologicalImpacts.map((impact, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 text-sm p-2 rounded ${
              impact.severity === 'danger'
                ? 'bg-red-50 text-red-700'
                : impact.severity === 'warning'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-green-50 text-green-700'
            }`}
          >
            <span className="font-mono font-semibold w-12">pH {impact.ph}</span>
            <span>{impact.impact}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-ocean-50 border border-ocean-200 rounded-lg">
        <h4 className="font-semibold text-ocean-800 mb-2">The Logarithmic Connection</h4>
        <p className="text-ocean-700 text-sm">
          Since pH = -log₁₀[H⁺], a drop of just 0.1 pH units represents a <strong>26% increase</strong> in
          hydrogen ion concentration. The ocean has already become about 30% more acidic since
          pre-industrial times (pH dropped from 8.18 to 8.04).
        </p>
      </div>
    </ChartContainer>
  )
}
