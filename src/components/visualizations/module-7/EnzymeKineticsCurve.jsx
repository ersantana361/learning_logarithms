import { useState, useMemo } from 'react'
import { useD3 } from '@hooks/useD3'
import ChartContainer, { LegendItem } from '../shared/ChartContainer'
import * as d3 from 'd3'

export default function EnzymeKineticsCurve() {
  const [Vmax, setVmax] = useState(100)
  const [Km, setKm] = useState(10)
  const [showMarkers, setShowMarkers] = useState(true)

  const data = useMemo(() => {
    const points = []
    for (let S = 0; S <= 100; S += 0.5) {
      const V = (Vmax * S) / (Km + S)
      points.push({ S, V })
    }
    return points
  }, [Vmax, Km])

  const svgRef = useD3((svg, { width, height }) => {
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 30, bottom: 50, left: 70 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth])

    const yScale = d3.scaleLinear()
      .domain([0, Vmax * 1.1])
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
      .call(d3.axisLeft(yScale))

    // Axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .text('[Substrate] (mM)')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -55)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .text('Reaction Velocity (μmol/min)')

    // Vmax line
    if (showMarkers) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(Vmax))
        .attr('y2', yScale(Vmax))
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '8,4')

      g.append('text')
        .attr('x', innerWidth - 5)
        .attr('y', yScale(Vmax) - 5)
        .attr('text-anchor', 'end')
        .attr('fill', '#ef4444')
        .attr('font-size', '12px')
        .text(`Vmax = ${Vmax}`)

      // Vmax/2 and Km markers
      const halfVmax = Vmax / 2
      g.append('line')
        .attr('x1', 0)
        .attr('x2', xScale(Km))
        .attr('y1', yScale(halfVmax))
        .attr('y2', yScale(halfVmax))
        .attr('stroke', '#22c55e')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4')

      g.append('line')
        .attr('x1', xScale(Km))
        .attr('x2', xScale(Km))
        .attr('y1', yScale(halfVmax))
        .attr('y2', innerHeight)
        .attr('stroke', '#22c55e')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4')

      g.append('circle')
        .attr('cx', xScale(Km))
        .attr('cy', yScale(halfVmax))
        .attr('r', 6)
        .attr('fill', '#22c55e')
        .attr('stroke', 'white')
        .attr('stroke-width', 2)

      g.append('text')
        .attr('x', xScale(Km) + 5)
        .attr('y', innerHeight - 5)
        .attr('fill', '#22c55e')
        .attr('font-size', '12px')
        .text(`Km = ${Km}`)

      g.append('text')
        .attr('x', 5)
        .attr('y', yScale(halfVmax) - 5)
        .attr('fill', '#22c55e')
        .attr('font-size', '12px')
        .text(`Vmax/2 = ${halfVmax}`)
    }

    // Main curve
    const line = d3.line()
      .x(d => xScale(d.S))
      .y(d => yScale(d.V))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3)
      .attr('d', line)

  }, [data, Vmax, Km, showMarkers])

  return (
    <ChartContainer
      title="Michaelis-Menten Enzyme Kinetics"
      description="The classic hyperbolic relationship between substrate concentration and reaction velocity"
    >
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-sand-700 mb-1">
            Vmax: {Vmax} μmol/min
          </label>
          <input
            type="range"
            min="50"
            max="200"
            step="10"
            value={Vmax}
            onChange={(e) => setVmax(parseInt(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-sand-500 mt-1">Maximum velocity at saturating substrate</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-sand-700 mb-1">
            Km: {Km} mM
          </label>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={Km}
            onChange={(e) => setKm(parseInt(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-sand-500 mt-1">Substrate concentration at half-maximal velocity</p>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showMarkers}
            onChange={(e) => setShowMarkers(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-sand-700">Show Vmax and Km markers</span>
        </label>
      </div>

      <svg ref={svgRef} className="w-full h-80" />

      <div className="mt-4 p-4 bg-ocean-50 border border-ocean-200 rounded-lg">
        <h4 className="font-semibold text-ocean-800 mb-2">The Michaelis-Menten Equation</h4>
        <p className="text-ocean-700 font-mono text-center text-lg mb-2">
          V = Vmax × [S] / (Km + [S])
        </p>
        <p className="text-ocean-600 text-sm">
          This equation describes enzyme kinetics where reaction velocity increases with substrate
          concentration but saturates as all enzyme molecules become occupied. <strong>Km</strong> (the
          Michaelis constant) indicates enzyme-substrate affinity: lower Km = higher affinity.
        </p>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h4 className="font-semibold text-amber-800 mb-2">Logarithmic Transformation</h4>
        <p className="text-amber-700 text-sm">
          The Lineweaver-Burk plot uses 1/V vs 1/[S] to linearize this curve, making it easier to
          determine Vmax and Km from experimental data. This double-reciprocal plot demonstrates
          how logarithmic thinking converts curved relationships into straight lines.
        </p>
      </div>
    </ChartContainer>
  )
}
