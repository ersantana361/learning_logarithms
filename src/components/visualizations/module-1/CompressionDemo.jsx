import { useState, useCallback } from 'react'
import * as d3 from 'd3'
import { useD3 } from '@hooks/useD3'
import ChartContainer, { LegendItem } from '../shared/ChartContainer'

/**
 * Side-by-side comparison of linear and logarithmic bar representations
 * Shows how logarithmic scaling compresses large ranges
 */
export default function CompressionDemo() {
  const [selectedData, setSelectedData] = useState('powers')

  const dataSets = {
    powers: {
      label: 'Powers of 10',
      data: [1, 10, 100, 1000, 10000],
      description: 'Each value is 10× larger than the previous'
    },
    biology: {
      label: 'Biological Sizes',
      data: [0.001, 0.01, 1, 1000, 1000000],
      labels: ['Virus', 'Bacterium', 'Cell', 'Ant', 'Human'],
      unit: 'µm',
      description: 'Biological entities span enormous size ranges'
    },
    sound: {
      label: 'Sound Intensities',
      data: [1, 100, 10000, 1000000, 100000000],
      labels: ['Whisper', 'Conversation', 'Busy traffic', 'Rock concert', 'Jet engine'],
      unit: '×',
      description: 'Sound intensity varies by billions of times'
    }
  }

  const currentData = dataSets[selectedData]

  const renderChart = useCallback((svg, { width, height }) => {
    const margin = { top: 30, right: 30, bottom: 80, left: 60 }
    const innerWidth = (width - margin.left - margin.right - 40) / 2
    const innerHeight = height - margin.top - margin.bottom

    svg.selectAll('*').remove()

    const data = currentData.data
    const labels = currentData.labels || data.map(d => d.toLocaleString())
    const maxValue = Math.max(...data)

    // Linear scale
    const linearScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([0, innerHeight])

    // Log scale
    const logScale = d3.scaleLog()
      .domain([Math.min(...data.filter(d => d > 0)), maxValue])
      .range([0, innerHeight])

    const barWidth = Math.min(40, innerWidth / data.length - 10)

    // Left chart (Linear)
    const leftG = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    leftG.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#3b82f6')
      .attr('font-weight', 600)
      .attr('font-size', 14)
      .text('Linear Scale')

    // Linear bars
    data.forEach((d, i) => {
      const barHeight = linearScale(d)
      const x = (innerWidth / data.length) * i + (innerWidth / data.length - barWidth) / 2

      leftG.append('rect')
        .attr('x', x)
        .attr('y', innerHeight - barHeight)
        .attr('width', barWidth)
        .attr('height', Math.max(1, barHeight))
        .attr('fill', '#3b82f6')
        .attr('rx', 4)
        .attr('opacity', 0.8)

      // Label
      leftG.append('text')
        .attr('x', x + barWidth / 2)
        .attr('y', innerHeight + 15)
        .attr('text-anchor', 'middle')
        .attr('fill', '#57534e')
        .attr('font-size', 10)
        .text(labels[i])

      // Value on top (only if bar is visible)
      if (barHeight > 20) {
        leftG.append('text')
          .attr('x', x + barWidth / 2)
          .attr('y', innerHeight - barHeight - 5)
          .attr('text-anchor', 'middle')
          .attr('fill', '#3b82f6')
          .attr('font-size', 9)
          .attr('font-family', 'monospace')
          .text(d >= 1000 ? d.toExponential(0) : d)
      }
    })

    // Right chart (Logarithmic)
    const rightG = svg.append('g')
      .attr('transform', `translate(${margin.left + innerWidth + 40}, ${margin.top})`)

    rightG.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#22c55e')
      .attr('font-weight', 600)
      .attr('font-size', 14)
      .text('Logarithmic Scale')

    // Log bars
    data.forEach((d, i) => {
      const barHeight = d > 0 ? logScale(d) : 0
      const x = (innerWidth / data.length) * i + (innerWidth / data.length - barWidth) / 2

      rightG.append('rect')
        .attr('x', x)
        .attr('y', innerHeight - barHeight)
        .attr('width', barWidth)
        .attr('height', Math.max(1, barHeight))
        .attr('fill', '#22c55e')
        .attr('rx', 4)
        .attr('opacity', 0.8)

      // Label
      rightG.append('text')
        .attr('x', x + barWidth / 2)
        .attr('y', innerHeight + 15)
        .attr('text-anchor', 'middle')
        .attr('fill', '#57534e')
        .attr('font-size', 10)
        .text(labels[i])

      // Log value on top
      rightG.append('text')
        .attr('x', x + barWidth / 2)
        .attr('y', innerHeight - barHeight - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#22c55e')
        .attr('font-size', 9)
        .attr('font-family', 'monospace')
        .text(`log=${Math.log10(d).toFixed(1)}`)
    })

    // Y-axis labels
    leftG.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#78716c')
      .attr('font-size', 11)
      .text('Value')

    rightG.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#78716c')
      .attr('font-size', 11)
      .text('log₁₀(Value)')

  }, [currentData])

  return (
    <ChartContainer
      title="Linear vs Logarithmic Bar Comparison"
      description={currentData.description}
      aspectRatio={1.8}
      minHeight={320}
      maxHeight={450}
      controls={
        <div className="flex flex-wrap gap-2">
          {Object.entries(dataSets).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setSelectedData(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedData === key
                  ? 'bg-forest-600 text-white'
                  : 'bg-white text-sand-600 border border-sand-200 hover:bg-sand-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      }
      legend={
        <>
          <LegendItem color="#3b82f6" label="Linear scale - bars proportional to actual value" />
          <LegendItem color="#22c55e" label="Log scale - bars proportional to log of value" />
        </>
      }
    >
      {(dimensions) => (
        <svg
          width={dimensions.width}
          height={dimensions.height}
          style={{ display: 'block' }}
        >
          <g ref={(node) => {
            if (node) {
              renderChart(d3.select(node.parentNode), dimensions)
            }
          }} />
        </svg>
      )}
    </ChartContainer>
  )
}
