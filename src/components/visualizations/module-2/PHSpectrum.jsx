import { useState } from 'react'
import { useD3 } from '@hooks/useD3'
import ChartContainer from '../shared/ChartContainer'
import * as d3 from 'd3'

const biologicalExamples = [
  { ph: 0, label: 'Battery acid', category: 'chemical' },
  { ph: 1, label: 'Gastric acid', category: 'human' },
  { ph: 2, label: 'Lemon juice', category: 'food' },
  { ph: 3, label: 'Vinegar', category: 'food' },
  { ph: 4, label: 'Tomato juice', category: 'food' },
  { ph: 5, label: 'Black coffee', category: 'food' },
  { ph: 6, label: 'Urine', category: 'human' },
  { ph: 6.5, label: 'Saliva', category: 'human' },
  { ph: 7, label: 'Pure water', category: 'neutral' },
  { ph: 7.4, label: 'Blood', category: 'human' },
  { ph: 8, label: 'Seawater', category: 'environment' },
  { ph: 8.4, label: 'Baking soda', category: 'food' },
  { ph: 9, label: 'Borax', category: 'chemical' },
  { ph: 10, label: 'Milk of magnesia', category: 'chemical' },
  { ph: 11, label: 'Ammonia', category: 'chemical' },
  { ph: 12, label: 'Soapy water', category: 'chemical' },
  { ph: 13, label: 'Bleach', category: 'chemical' },
  { ph: 14, label: 'Drain cleaner', category: 'chemical' }
]

const categoryColors = {
  human: '#ef4444',
  food: '#f59e0b',
  environment: '#3b82f6',
  chemical: '#8b5cf6',
  neutral: '#22c55e'
}

export default function PHSpectrum() {
  const [selectedPH, setSelectedPH] = useState(7)
  const [showExamples, setShowExamples] = useState(true)

  const svgRef = useD3((svg, { width, height }) => {
    svg.selectAll('*').remove()

    const margin = { top: 40, right: 30, bottom: 80, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // pH scale
    const xScale = d3.scaleLinear()
      .domain([0, 14])
      .range([0, innerWidth])

    // Create gradient for pH spectrum
    const defs = svg.append('defs')
    const gradient = defs.append('linearGradient')
      .attr('id', 'ph-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%')

    // pH color stops (red -> orange -> yellow -> green -> cyan -> blue -> purple)
    const colorStops = [
      { offset: '0%', color: '#dc2626' },
      { offset: '14%', color: '#ea580c' },
      { offset: '28%', color: '#f59e0b' },
      { offset: '42%', color: '#84cc16' },
      { offset: '50%', color: '#22c55e' },
      { offset: '58%', color: '#14b8a6' },
      { offset: '72%', color: '#0ea5e9' },
      { offset: '86%', color: '#6366f1' },
      { offset: '100%', color: '#7c3aed' }
    ]

    colorStops.forEach(stop => {
      gradient.append('stop')
        .attr('offset', stop.offset)
        .attr('stop-color', stop.color)
    })

    // Draw pH bar
    const barHeight = 60
    g.append('rect')
      .attr('x', 0)
      .attr('y', innerHeight / 2 - barHeight / 2)
      .attr('width', innerWidth)
      .attr('height', barHeight)
      .attr('fill', 'url(#ph-gradient)')
      .attr('rx', 8)

    // pH axis
    const xAxis = d3.axisBottom(xScale)
      .tickValues(d3.range(0, 15))
      .tickSize(10)

    g.append('g')
      .attr('transform', `translate(0,${innerHeight / 2 + barHeight / 2})`)
      .call(xAxis)
      .attr('class', 'text-sand-600')
      .selectAll('text')
      .attr('font-size', '12px')

    // Labels
    g.append('text')
      .attr('x', 0)
      .attr('y', innerHeight / 2 + barHeight / 2 + 50)
      .attr('text-anchor', 'start')
      .attr('fill', '#dc2626')
      .attr('font-weight', '600')
      .text('Acidic')

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight / 2 + barHeight / 2 + 50)
      .attr('text-anchor', 'middle')
      .attr('fill', '#22c55e')
      .attr('font-weight', '600')
      .text('Neutral')

    g.append('text')
      .attr('x', innerWidth)
      .attr('y', innerHeight / 2 + barHeight / 2 + 50)
      .attr('text-anchor', 'end')
      .attr('fill', '#7c3aed')
      .attr('font-weight', '600')
      .text('Basic/Alkaline')

    // Selected pH indicator
    const indicatorX = xScale(selectedPH)

    g.append('line')
      .attr('x1', indicatorX)
      .attr('x2', indicatorX)
      .attr('y1', innerHeight / 2 - barHeight / 2 - 20)
      .attr('y2', innerHeight / 2 + barHeight / 2 + 5)
      .attr('stroke', '#1f2937')
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round')

    g.append('circle')
      .attr('cx', indicatorX)
      .attr('cy', innerHeight / 2 - barHeight / 2 - 25)
      .attr('r', 8)
      .attr('fill', '#1f2937')

    // H+ concentration display
    const hConcentration = Math.pow(10, -selectedPH)
    g.append('text')
      .attr('x', indicatorX)
      .attr('y', innerHeight / 2 - barHeight / 2 - 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1f2937')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .text(`[H⁺] = ${hConcentration.toExponential(1)} M`)

    // Show biological examples
    if (showExamples) {
      const visibleExamples = biologicalExamples.filter(ex =>
        Math.abs(ex.ph - selectedPH) <= 2
      )

      visibleExamples.forEach((example, i) => {
        const x = xScale(example.ph)
        const yOffset = i % 2 === 0 ? -barHeight - 70 : -barHeight - 90

        g.append('circle')
          .attr('cx', x)
          .attr('cy', innerHeight / 2 + yOffset + 50)
          .attr('r', 5)
          .attr('fill', categoryColors[example.category])

        g.append('text')
          .attr('x', x)
          .attr('y', innerHeight / 2 + yOffset + 40)
          .attr('text-anchor', 'middle')
          .attr('fill', categoryColors[example.category])
          .attr('font-size', '11px')
          .attr('font-weight', '500')
          .text(example.label)
      })
    }

    // Interactive overlay
    g.append('rect')
      .attr('x', 0)
      .attr('y', innerHeight / 2 - barHeight / 2)
      .attr('width', innerWidth)
      .attr('height', barHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'pointer')
      .on('click', (event) => {
        const [mouseX] = d3.pointer(event)
        const newPH = Math.round(xScale.invert(mouseX) * 10) / 10
        setSelectedPH(Math.max(0, Math.min(14, newPH)))
      })

  }, [selectedPH, showExamples])

  const getClosestExample = () => {
    return biologicalExamples.reduce((closest, current) =>
      Math.abs(current.ph - selectedPH) < Math.abs(closest.ph - selectedPH) ? current : closest
    )
  }

  const closestExample = getClosestExample()

  return (
    <ChartContainer
      title="pH Spectrum Explorer"
      description="Explore the logarithmic pH scale and discover where common substances fall"
    >
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-sand-700">pH Value:</label>
          <input
            type="range"
            min="0"
            max="14"
            step="0.1"
            value={selectedPH}
            onChange={(e) => setSelectedPH(parseFloat(e.target.value))}
            className="w-48"
          />
          <span className="font-mono text-lg font-semibold text-sand-900 w-12">
            {selectedPH.toFixed(1)}
          </span>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showExamples}
            onChange={(e) => setShowExamples(e.target.checked)}
            className="rounded border-sand-300"
          />
          <span className="text-sand-700">Show examples</span>
        </label>
      </div>

      <svg ref={svgRef} className="w-full h-64" />

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-sand-50 rounded-lg p-3">
          <div className="text-sand-500 mb-1">pH Value</div>
          <div className="font-mono text-xl font-bold text-sand-900">{selectedPH.toFixed(1)}</div>
        </div>
        <div className="bg-sand-50 rounded-lg p-3">
          <div className="text-sand-500 mb-1">[H⁺] Concentration</div>
          <div className="font-mono text-lg font-bold text-sand-900">
            10<sup>-{selectedPH.toFixed(1)}</sup> M
          </div>
        </div>
        <div className="bg-sand-50 rounded-lg p-3">
          <div className="text-sand-500 mb-1">Classification</div>
          <div className="font-semibold text-sand-900">
            {selectedPH < 7 ? 'Acidic' : selectedPH > 7 ? 'Basic' : 'Neutral'}
          </div>
        </div>
        <div className="bg-sand-50 rounded-lg p-3">
          <div className="text-sand-500 mb-1">Similar to</div>
          <div className="font-semibold text-sand-900">{closestExample.label}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {Object.entries(categoryColors).map(([category, color]) => (
          <div key={category} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="capitalize text-sand-600">{category}</span>
          </div>
        ))}
      </div>
    </ChartContainer>
  )
}
