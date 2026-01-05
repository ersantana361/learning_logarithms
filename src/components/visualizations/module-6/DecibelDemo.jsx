import { useState, useMemo } from 'react'
import { useD3 } from '@hooks/useD3'
import ChartContainer from '../shared/ChartContainer'
import * as d3 from 'd3'

const soundExamples = [
  { name: 'Threshold of hearing', dB: 0, intensity: 1e-12 },
  { name: 'Rustling leaves', dB: 10, intensity: 1e-11 },
  { name: 'Whisper', dB: 20, intensity: 1e-10 },
  { name: 'Quiet library', dB: 30, intensity: 1e-9 },
  { name: 'Quiet room', dB: 40, intensity: 1e-8 },
  { name: 'Normal conversation', dB: 60, intensity: 1e-6 },
  { name: 'Busy traffic', dB: 70, intensity: 1e-5 },
  { name: 'Vacuum cleaner', dB: 80, intensity: 1e-4 },
  { name: 'Lawn mower', dB: 90, intensity: 1e-3 },
  { name: 'Rock concert', dB: 110, intensity: 1e-1 },
  { name: 'Thunder', dB: 120, intensity: 1 },
  { name: 'Jet engine (nearby)', dB: 140, intensity: 100 }
]

export default function DecibelDemo() {
  const [dB1, setDB1] = useState(60)
  const [dB2, setDB2] = useState(80)

  const intensity1 = Math.pow(10, dB1 / 10) * 1e-12
  const intensity2 = Math.pow(10, dB2 / 10) * 1e-12
  const intensityRatio = intensity2 / intensity1
  const dBDifference = dB2 - dB1

  const svgRef = useD3((svg, { width, height }) => {
    svg.selectAll('*').remove()

    const margin = { top: 30, right: 30, bottom: 40, left: 50 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // dB scale
    const xScale = d3.scaleLinear()
      .domain([0, 140])
      .range([0, innerWidth])

    // Color gradient for danger levels
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'db-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%')

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#22c55e')
    gradient.append('stop').attr('offset', '43%').attr('stop-color', '#84cc16')
    gradient.append('stop').attr('offset', '57%').attr('stop-color', '#f59e0b')
    gradient.append('stop').attr('offset', '71%').attr('stop-color', '#ef4444')
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#991b1b')

    // dB bar
    const barHeight = 40
    g.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', innerWidth)
      .attr('height', barHeight)
      .attr('fill', 'url(#db-gradient)')
      .attr('rx', 8)

    // Danger threshold lines
    const thresholds = [
      { dB: 85, label: 'Hearing damage risk', color: '#f59e0b' },
      { dB: 120, label: 'Pain threshold', color: '#ef4444' }
    ]

    thresholds.forEach(t => {
      g.append('line')
        .attr('x1', xScale(t.dB))
        .attr('x2', xScale(t.dB))
        .attr('y1', 0)
        .attr('y2', barHeight)
        .attr('stroke', t.color)
        .attr('stroke-width', 2)
    })

    // dB axis
    g.append('g')
      .attr('transform', `translate(0,${barHeight})`)
      .call(d3.axisBottom(xScale).tickValues([0, 20, 40, 60, 80, 100, 120, 140]))

    // Selected levels
    const markers = [
      { dB: dB1, color: '#3b82f6', label: 'Sound 1' },
      { dB: dB2, color: '#8b5cf6', label: 'Sound 2' }
    ]

    markers.forEach(m => {
      g.append('line')
        .attr('x1', xScale(m.dB))
        .attr('x2', xScale(m.dB))
        .attr('y1', -10)
        .attr('y2', barHeight + 5)
        .attr('stroke', m.color)
        .attr('stroke-width', 3)

      g.append('circle')
        .attr('cx', xScale(m.dB))
        .attr('cy', -15)
        .attr('r', 8)
        .attr('fill', m.color)

      g.append('text')
        .attr('x', xScale(m.dB))
        .attr('y', -25)
        .attr('text-anchor', 'middle')
        .attr('fill', m.color)
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .text(`${m.dB} dB`)
    })

    // Labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', barHeight + 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .text('Decibels (dB)')

  }, [dB1, dB2])

  const getClosestExample = (dB) => {
    return soundExamples.reduce((closest, current) =>
      Math.abs(current.dB - dB) < Math.abs(closest.dB - dB) ? current : closest
    )
  }

  return (
    <ChartContainer
      title="Decibel Scale Comparison"
      description="The decibel scale compresses sound intensities spanning 12+ orders of magnitude"
    >
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-ocean-700 mb-1">
            Sound 1: {dB1} dB ({getClosestExample(dB1).name})
          </label>
          <input
            type="range"
            min="0"
            max="140"
            step="5"
            value={dB1}
            onChange={(e) => setDB1(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">
            Sound 2: {dB2} dB ({getClosestExample(dB2).name})
          </label>
          <input
            type="range"
            min="0"
            max="140"
            step="5"
            value={dB2}
            onChange={(e) => setDB2(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <svg ref={svgRef} className="w-full h-32" />

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="bg-ocean-50 rounded-lg p-4 border border-ocean-200">
          <div className="text-sm text-ocean-600">Difference</div>
          <div className="text-2xl font-bold text-ocean-800">{dBDifference} dB</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-sm text-purple-600">Intensity Ratio</div>
          <div className="text-2xl font-bold text-purple-800">{intensityRatio.toFixed(intensityRatio < 100 ? 1 : 0)}×</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <div className="text-sm text-amber-600">Power Relationship</div>
          <div className="text-2xl font-bold text-amber-800">10^{(dBDifference / 10).toFixed(1)}</div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-forest-50 border border-forest-200 rounded-lg">
        <h4 className="font-semibold text-forest-800 mb-2">The Decibel Formula</h4>
        <p className="text-forest-700 text-sm mb-2">
          dB = 10 × log₁₀(I/I₀), where I₀ = 10⁻¹² W/m² (threshold of hearing)
        </p>
        <p className="text-forest-600 text-sm">
          Every <strong>10 dB increase</strong> = 10× more intense.
          Every <strong>20 dB increase</strong> = 100× more intense.
          The {dBDifference} dB difference between your sounds means Sound 2 is {intensityRatio.toFixed(1)}× more intense than Sound 1.
        </p>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold text-sand-800 mb-2">Sound Level Reference</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {soundExamples.slice(0, 8).map(ex => (
            <div key={ex.name} className="bg-sand-50 rounded p-2">
              <span className="font-semibold text-sand-800">{ex.dB} dB:</span>
              <span className="text-sand-600 ml-1">{ex.name}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartContainer>
  )
}
