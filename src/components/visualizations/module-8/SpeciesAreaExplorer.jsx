import { useState, useMemo, useRef, useEffect } from 'react'
import { useD3 } from '@hooks/useD3'
import ChartContainer, { LegendItem } from '../shared/ChartContainer'
import * as d3 from 'd3'

// Sample island data
const islandData = [
  { name: 'Redonda', area: 1.6, species: 5 },
  { name: 'Saba', area: 13, species: 18 },
  { name: 'Montserrat', area: 102, species: 32 },
  { name: 'Antigua', area: 280, species: 45 },
  { name: 'St. Lucia', area: 617, species: 55 },
  { name: 'Martinique', area: 1128, species: 62 },
  { name: 'Guadeloupe', area: 1628, species: 70 },
  { name: 'Puerto Rico', area: 8870, species: 98 },
  { name: 'Jamaica', area: 10991, species: 112 },
  { name: 'Hispaniola', area: 76192, species: 136 },
  { name: 'Cuba', area: 109884, species: 155 }
]

export default function SpeciesAreaExplorer() {
  const [showRegression, setShowRegression] = useState(true)
  const [hoveredIsland, setHoveredIsland] = useState(null)
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

  // Calculate regression on log-transformed data
  const regression = useMemo(() => {
    const n = islandData.length
    const logArea = islandData.map(d => Math.log10(d.area))
    const logSpecies = islandData.map(d => Math.log10(d.species))

    const sumX = logArea.reduce((a, b) => a + b, 0)
    const sumY = logSpecies.reduce((a, b) => a + b, 0)
    const sumXY = logArea.reduce((sum, x, i) => sum + x * logSpecies[i], 0)
    const sumX2 = logArea.reduce((sum, x) => sum + x * x, 0)

    const z = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const c = Math.pow(10, (sumY - z * sumX) / n)

    // R-squared
    const meanY = sumY / n
    const ssTotal = logSpecies.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0)
    const ssResidual = logSpecies.reduce((sum, y, i) => {
      const predicted = z * logArea[i] + Math.log10(c)
      return sum + Math.pow(y - predicted, 2)
    }, 0)
    const rSquared = 1 - ssResidual / ssTotal

    return { z, c, rSquared }
  }, [])

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

    const xScale = d3.scaleLog()
      .domain([1, 200000])
      .range([0, innerWidth])

    const yScale = d3.scaleLog()
      .domain([3, 200])
      .range([innerHeight, 0])

    // Grid
    g.append('g')
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat('')
        .tickValues([5, 10, 20, 50, 100, 200])
      )
      .selectAll('line')
      .attr('stroke', '#e5e7eb')

    g.selectAll('.domain').remove()

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickValues([1, 10, 100, 1000, 10000, 100000])
        .tickFormat(d3.format('.0s'))
      )

    g.append('g')
      .call(d3.axisLeft(yScale)
        .tickValues([5, 10, 20, 50, 100, 200])
      )

    // Axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .text('Island Area (km²)')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -55)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .text('Number of Species')

    // Regression line
    if (showRegression) {
      const x1 = 1
      const x2 = 200000
      const y1 = regression.c * Math.pow(x1, regression.z)
      const y2 = regression.c * Math.pow(x2, regression.z)

      g.append('line')
        .attr('x1', xScale(x1))
        .attr('x2', xScale(x2))
        .attr('y1', yScale(Math.max(y1, 3)))
        .attr('y2', yScale(Math.min(y2, 200)))
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '8,4')
    }

    // Data points
    islandData.forEach(d => {
      const isHovered = hoveredIsland === d.name

      g.append('circle')
        .attr('cx', xScale(d.area))
        .attr('cy', yScale(d.species))
        .attr('r', isHovered ? 10 : 7)
        .attr('fill', '#22c55e')
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer')
        .on('mouseenter', () => setHoveredIsland(d.name))
        .on('mouseleave', () => setHoveredIsland(null))

      if (isHovered) {
        g.append('text')
          .attr('x', xScale(d.area))
          .attr('y', yScale(d.species) - 15)
          .attr('text-anchor', 'middle')
          .attr('fill', '#1f2937')
          .attr('font-size', '12px')
          .attr('font-weight', '600')
          .text(d.name)
      }
    })

  }, [showRegression, hoveredIsland, regression], dimensions)

  return (
    <ChartContainer
      title="Species-Area Relationship"
      description="Larger islands support more species - a fundamental pattern in ecology"
    >
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showRegression}
            onChange={(e) => setShowRegression(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-sand-700">Show power law fit</span>
        </label>
        <LegendItem color="#22c55e" label="Caribbean Islands" />
        <LegendItem color="#ef4444" label="S = cA^z" />
      </div>

      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} className="w-full h-80" />
      </div>

      <div className="mt-4 grid md:grid-cols-4 gap-4">
        <div className="bg-forest-50 rounded-lg p-3 border border-forest-200">
          <div className="text-sm text-forest-600">Exponent (z)</div>
          <div className="text-xl font-bold text-forest-800">{regression.z.toFixed(3)}</div>
          <div className="text-xs text-forest-500">Typically 0.2-0.35</div>
        </div>
        <div className="bg-ocean-50 rounded-lg p-3 border border-ocean-200">
          <div className="text-sm text-ocean-600">Coefficient (c)</div>
          <div className="text-xl font-bold text-ocean-800">{regression.c.toFixed(2)}</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <div className="text-sm text-amber-600">R² (fit)</div>
          <div className="text-xl font-bold text-amber-800">{regression.rSquared.toFixed(3)}</div>
        </div>
        <div className="bg-sand-100 rounded-lg p-3 border border-sand-200">
          <div className="text-sm text-sand-600">Equation</div>
          <div className="text-lg font-mono font-bold text-sand-800">
            S = {regression.c.toFixed(1)}A^{regression.z.toFixed(2)}
          </div>
        </div>
      </div>

      {hoveredIsland && (
        <div className="mt-4 p-4 bg-sand-50 rounded-lg">
          {(() => {
            const island = islandData.find(d => d.name === hoveredIsland)
            const predicted = regression.c * Math.pow(island.area, regression.z)
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-sand-500">Island:</span> <strong>{island.name}</strong></div>
                <div><span className="text-sand-500">Area:</span> <strong>{island.area.toLocaleString()} km²</strong></div>
                <div><span className="text-sand-500">Actual Species:</span> <strong>{island.species}</strong></div>
                <div><span className="text-sand-500">Predicted:</span> <strong>{predicted.toFixed(0)}</strong></div>
              </div>
            )
          })()}
        </div>
      )}

      <div className="mt-4 p-4 bg-forest-50 border border-forest-200 rounded-lg">
        <h4 className="font-semibold text-forest-800 mb-2">The Species-Area Relationship</h4>
        <p className="text-forest-700 text-sm">
          <strong>S = cA^z</strong> describes how species richness (S) increases with area (A).
          On a log-log plot, this power law appears as a straight line with slope z.
          The z value (~0.25) means that <strong>doubling island area increases species by ~19%</strong>
          (2^0.25 ≈ 1.19). This relationship is crucial for conservation and predicting extinction rates.
        </p>
      </div>
    </ChartContainer>
  )
}
