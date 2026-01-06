import { useState, useEffect, useRef } from 'react'
import { useD3 } from '@hooks/useD3'
import ChartContainer from '../shared/ChartContainer'
import * as d3 from 'd3'

export default function HydrogenIonCalculator() {
  const [mode, setMode] = useState('ph-to-h') // 'ph-to-h' or 'h-to-ph'
  const [phValue, setPHValue] = useState(7)
  const [hConcentration, setHConcentration] = useState(1e-7)
  const [exponent, setExponent] = useState(-7)
  const [dimensions, setDimensions] = useState({ width: 600, height: 192 })
  const containerRef = useRef(null)

  // Track container dimensions
  useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        setDimensions({ width, height: 192 })
      }
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // Sync values when mode or inputs change
  useEffect(() => {
    if (mode === 'ph-to-h') {
      setHConcentration(Math.pow(10, -phValue))
      setExponent(-phValue)
    }
  }, [phValue, mode])

  useEffect(() => {
    if (mode === 'h-to-ph') {
      setPHValue(-Math.log10(hConcentration))
    }
  }, [hConcentration, mode])

  const handleExponentChange = (newExp) => {
    setExponent(newExp)
    setHConcentration(Math.pow(10, newExp))
  }

  const svgRef = useD3((svg, dims) => {
    if (!dims || dims.width <= 0 || dims.height <= 0) return

    const { width, height } = dims
    svg.selectAll('*').remove()

    svg.attr('width', width).attr('height', height)

    const margin = { top: 30, right: 30, bottom: 30, left: 30 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const centerY = innerHeight / 2

    // Left side: pH
    const phBoxWidth = innerWidth * 0.35
    const phBoxHeight = 80

    g.append('rect')
      .attr('x', 0)
      .attr('y', centerY - phBoxHeight / 2)
      .attr('width', phBoxWidth)
      .attr('height', phBoxHeight)
      .attr('fill', mode === 'ph-to-h' ? '#dbeafe' : '#f3f4f6')
      .attr('stroke', mode === 'ph-to-h' ? '#3b82f6' : '#d1d5db')
      .attr('stroke-width', 2)
      .attr('rx', 8)

    g.append('text')
      .attr('x', phBoxWidth / 2)
      .attr('y', centerY - 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .attr('font-size', '14px')
      .text('pH')

    g.append('text')
      .attr('x', phBoxWidth / 2)
      .attr('y', centerY + 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1f2937')
      .attr('font-size', '24px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'monospace')
      .text(phValue.toFixed(2))

    // Right side: [H+]
    const hBoxX = innerWidth - phBoxWidth

    g.append('rect')
      .attr('x', hBoxX)
      .attr('y', centerY - phBoxHeight / 2)
      .attr('width', phBoxWidth)
      .attr('height', phBoxHeight)
      .attr('fill', mode === 'h-to-ph' ? '#dcfce7' : '#f3f4f6')
      .attr('stroke', mode === 'h-to-ph' ? '#22c55e' : '#d1d5db')
      .attr('stroke-width', 2)
      .attr('rx', 8)

    g.append('text')
      .attr('x', hBoxX + phBoxWidth / 2)
      .attr('y', centerY - 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .attr('font-size', '14px')
      .text('[H⁺] (M)')

    g.append('text')
      .attr('x', hBoxX + phBoxWidth / 2)
      .attr('y', centerY + 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1f2937')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'monospace')
      .text(hConcentration.toExponential(2))

    // Center arrows
    const arrowCenterX = innerWidth / 2

    // Arrow from pH to [H+]
    const arrow1Y = centerY - 20
    g.append('line')
      .attr('x1', phBoxWidth + 10)
      .attr('x2', hBoxX - 10)
      .attr('y1', arrow1Y)
      .attr('y2', arrow1Y)
      .attr('stroke', mode === 'ph-to-h' ? '#3b82f6' : '#d1d5db')
      .attr('stroke-width', mode === 'ph-to-h' ? 3 : 2)
      .attr('marker-end', `url(#arrow-${mode === 'ph-to-h' ? 'blue' : 'gray'})`)

    // Arrow from [H+] to pH
    const arrow2Y = centerY + 20
    g.append('line')
      .attr('x1', hBoxX - 10)
      .attr('x2', phBoxWidth + 10)
      .attr('y1', arrow2Y)
      .attr('y2', arrow2Y)
      .attr('stroke', mode === 'h-to-ph' ? '#22c55e' : '#d1d5db')
      .attr('stroke-width', mode === 'h-to-ph' ? 3 : 2)
      .attr('marker-end', `url(#arrow-${mode === 'h-to-ph' ? 'green' : 'gray'})`)

    // Formula labels
    g.append('text')
      .attr('x', arrowCenterX)
      .attr('y', arrow1Y - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', mode === 'ph-to-h' ? '#3b82f6' : '#9ca3af')
      .attr('font-size', '12px')
      .text('[H⁺] = 10⁻ᵖᴴ')

    g.append('text')
      .attr('x', arrowCenterX)
      .attr('y', arrow2Y + 18)
      .attr('text-anchor', 'middle')
      .attr('fill', mode === 'h-to-ph' ? '#22c55e' : '#9ca3af')
      .attr('font-size', '12px')
      .text('pH = -log₁₀[H⁺]')

    // Arrow markers
    const defs = svg.append('defs')

    const createMarker = (id, color) => {
      defs.append('marker')
        .attr('id', `arrow-${id}`)
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 9)
        .attr('refY', 5)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 0 0 L 10 5 L 0 10 z')
        .attr('fill', color)
    }

    createMarker('blue', '#3b82f6')
    createMarker('green', '#22c55e')
    createMarker('gray', '#d1d5db')

  }, [phValue, hConcentration, mode], dimensions)

  return (
    <ChartContainer
      title="pH ↔ [H⁺] Converter"
      description="Convert between pH values and hydrogen ion concentrations"
    >
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setMode('ph-to-h')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'ph-to-h'
              ? 'bg-ocean-500 text-white'
              : 'bg-sand-100 text-sand-600 hover:bg-sand-200'
          }`}
        >
          pH → [H⁺]
        </button>
        <button
          onClick={() => setMode('h-to-ph')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'h-to-ph'
              ? 'bg-forest-500 text-white'
              : 'bg-sand-100 text-sand-600 hover:bg-sand-200'
          }`}
        >
          [H⁺] → pH
        </button>
      </div>

      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} className="w-full h-48" />
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        {/* pH Input */}
        <div className={`p-4 rounded-lg border-2 ${
          mode === 'ph-to-h' ? 'border-ocean-300 bg-ocean-50' : 'border-sand-200 bg-sand-50'
        }`}>
          <label className="block text-sm font-medium text-sand-700 mb-2">
            pH Value {mode === 'ph-to-h' && <span className="text-ocean-500">(Input)</span>}
          </label>
          <input
            type="range"
            min="0"
            max="14"
            step="0.1"
            value={phValue}
            onChange={(e) => {
              setMode('ph-to-h')
              setPHValue(parseFloat(e.target.value))
            }}
            className="w-full mb-2"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="14"
              step="0.1"
              value={phValue.toFixed(2)}
              onChange={(e) => {
                setMode('ph-to-h')
                const val = parseFloat(e.target.value)
                if (!isNaN(val) && val >= 0 && val <= 14) {
                  setPHValue(val)
                }
              }}
              className="w-24 px-3 py-2 border rounded-lg font-mono text-lg"
            />
            <span className="text-sand-500">
              {phValue < 7 ? '(Acidic)' : phValue > 7 ? '(Basic)' : '(Neutral)'}
            </span>
          </div>
        </div>

        {/* [H+] Input */}
        <div className={`p-4 rounded-lg border-2 ${
          mode === 'h-to-ph' ? 'border-forest-300 bg-forest-50' : 'border-sand-200 bg-sand-50'
        }`}>
          <label className="block text-sm font-medium text-sand-700 mb-2">
            [H⁺] Concentration {mode === 'h-to-ph' && <span className="text-forest-500">(Input)</span>}
          </label>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sand-600">10^</span>
            <input
              type="range"
              min="-14"
              max="0"
              step="0.1"
              value={exponent}
              onChange={(e) => {
                setMode('h-to-ph')
                handleExponentChange(parseFloat(e.target.value))
              }}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sand-600">10</span>
            <input
              type="number"
              min="-14"
              max="0"
              step="0.1"
              value={exponent.toFixed(1)}
              onChange={(e) => {
                setMode('h-to-ph')
                const val = parseFloat(e.target.value)
                if (!isNaN(val) && val >= -14 && val <= 0) {
                  handleExponentChange(val)
                }
              }}
              className="w-20 px-3 py-2 border rounded-lg font-mono"
            />
            <span className="text-sand-600">M = </span>
            <span className="font-mono text-sand-800">{hConcentration.toExponential(2)} M</span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h4 className="font-semibold text-amber-800 mb-2">Key Relationship</h4>
        <p className="text-amber-700 text-sm">
          Each pH unit represents a <strong>10-fold change</strong> in hydrogen ion concentration.
          For example, pH 6 has 10× more H⁺ ions than pH 7, and pH 5 has 100× more than pH 7.
        </p>
      </div>
    </ChartContainer>
  )
}
