import { useState, useMemo } from 'react'
import { useD3 } from '@hooks/useD3'
import ChartContainer, { LegendItem } from '../shared/ChartContainer'
import * as d3 from 'd3'

export default function TherapeuticWindow() {
  const [dose, setDose] = useState(100)
  const [halfLife, setHalfLife] = useState(6)
  const [dosingInterval, setDosingInterval] = useState(8)
  const [toxicLevel, setToxicLevel] = useState(200)
  const [effectiveLevel, setEffectiveLevel] = useState(50)

  const k = Math.log(2) / halfLife
  const numDoses = 10
  const totalTime = numDoses * dosingInterval

  const data = useMemo(() => {
    const points = []

    for (let t = 0; t <= totalTime; t += 0.1) {
      let concentration = 0

      for (let doseNum = 0; doseNum < numDoses; doseNum++) {
        const doseTime = doseNum * dosingInterval
        if (t >= doseTime) {
          concentration += dose * Math.exp(-k * (t - doseTime))
        }
      }

      points.push({ t, C: concentration })
    }

    return points
  }, [dose, halfLife, dosingInterval, k, totalTime])

  // Analyze therapeutic window compliance
  const analysis = useMemo(() => {
    let timeInTherapeutic = 0
    let timeSubtherapeutic = 0
    let timeToxic = 0
    const dt = 0.1

    data.forEach(point => {
      if (point.C > toxicLevel) {
        timeToxic += dt
      } else if (point.C < effectiveLevel) {
        timeSubtherapeutic += dt
      } else {
        timeInTherapeutic += dt
      }
    })

    const total = timeInTherapeutic + timeSubtherapeutic + timeToxic
    return {
      therapeutic: (timeInTherapeutic / total * 100).toFixed(0),
      subtherapeutic: (timeSubtherapeutic / total * 100).toFixed(0),
      toxic: (timeToxic / total * 100).toFixed(0)
    }
  }, [data, toxicLevel, effectiveLevel])

  const svgRef = useD3((svg, { width, height }) => {
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 30, bottom: 50, left: 70 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const xScale = d3.scaleLinear()
      .domain([0, totalTime])
      .range([0, innerWidth])

    const maxY = Math.max(d3.max(data, d => d.C), toxicLevel) * 1.2

    const yScale = d3.scaleLinear()
      .domain([0, maxY])
      .range([innerHeight, 0])

    // Therapeutic window bands
    // Toxic zone
    g.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', innerWidth)
      .attr('height', yScale(toxicLevel))
      .attr('fill', '#fecaca')
      .attr('opacity', 0.5)

    // Therapeutic zone
    g.append('rect')
      .attr('x', 0)
      .attr('y', yScale(toxicLevel))
      .attr('width', innerWidth)
      .attr('height', yScale(effectiveLevel) - yScale(toxicLevel))
      .attr('fill', '#bbf7d0')
      .attr('opacity', 0.5)

    // Subtherapeutic zone
    g.append('rect')
      .attr('x', 0)
      .attr('y', yScale(effectiveLevel))
      .attr('width', innerWidth)
      .attr('height', innerHeight - yScale(effectiveLevel))
      .attr('fill', '#fef3c7')
      .attr('opacity', 0.5)

    // Zone labels
    g.append('text')
      .attr('x', 5)
      .attr('y', yScale(toxicLevel) / 2)
      .attr('fill', '#dc2626')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text('TOXIC')

    g.append('text')
      .attr('x', 5)
      .attr('y', (yScale(toxicLevel) + yScale(effectiveLevel)) / 2)
      .attr('fill', '#16a34a')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text('THERAPEUTIC')

    g.append('text')
      .attr('x', 5)
      .attr('y', (yScale(effectiveLevel) + innerHeight) / 2)
      .attr('fill', '#ca8a04')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text('SUBTHERAPEUTIC')

    // Threshold lines
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', yScale(toxicLevel))
      .attr('y2', yScale(toxicLevel))
      .attr('stroke', '#dc2626')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '8,4')

    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', yScale(effectiveLevel))
      .attr('y2', yScale(effectiveLevel))
      .attr('stroke', '#22c55e')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '8,4')

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
      .attr('stroke-width', 3)
      .attr('d', line)

  }, [data, toxicLevel, effectiveLevel, totalTime])

  const therapeuticIndex = toxicLevel / effectiveLevel

  return (
    <ChartContainer
      title="Therapeutic Window"
      description="Balance between efficacy and toxicity - the goal of dosing regimens"
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-sand-700 mb-1">
            Dose: {dose} mg
          </label>
          <input
            type="range"
            min="50"
            max="250"
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
            Toxic Level: {toxicLevel} mg/L
          </label>
          <input
            type="range"
            min="100"
            max="400"
            step="10"
            value={toxicLevel}
            onChange={(e) => setToxicLevel(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-sand-700 mb-1">
            Effective Level: {effectiveLevel} mg/L
          </label>
          <input
            type="range"
            min="20"
            max="150"
            step="10"
            value={effectiveLevel}
            onChange={(e) => setEffectiveLevel(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <svg ref={svgRef} className="w-full h-80" />

      <div className="mt-4 grid md:grid-cols-4 gap-4 text-sm">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="text-green-600">Time in Therapeutic</div>
          <div className="text-xl font-bold text-green-800">{analysis.therapeutic}%</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <div className="text-amber-600">Time Subtherapeutic</div>
          <div className="text-xl font-bold text-amber-800">{analysis.subtherapeutic}%</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
          <div className="text-red-600">Time Toxic</div>
          <div className="text-xl font-bold text-red-800">{analysis.toxic}%</div>
        </div>
        <div className="bg-ocean-50 rounded-lg p-3 border border-ocean-200">
          <div className="text-ocean-600">Therapeutic Index</div>
          <div className="text-xl font-bold text-ocean-800">{therapeuticIndex.toFixed(1)}</div>
          <div className="text-xs text-ocean-500">Toxic/Effective ratio</div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h4 className="font-semibold text-amber-800 mb-2">Clinical Significance</h4>
        <p className="text-amber-700 text-sm">
          A <strong>narrow therapeutic index</strong> (close to 1) means the drug requires careful monitoring—the
          toxic dose is close to the effective dose. Examples include warfarin, digoxin, and lithium.
          Drugs with wide therapeutic indices (like penicillin) are safer but may still need dosing
          adjustments for efficacy.
        </p>
      </div>
    </ChartContainer>
  )
}
