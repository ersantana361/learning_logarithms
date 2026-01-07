import { useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'

/**
 * Visual demonstration of WHY logarithm properties work
 * Shows segments on a log scale combining/separating
 */
export default function LogPropertiesVisualizer() {
  const [activeRule, setActiveRule] = useState('product')
  const [valueA, setValueA] = useState(100)
  const [valueB, setValueB] = useState(1000)
  const [power, setPower] = useState(3)
  const [showCombined, setShowCombined] = useState(false)
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 500, height: 200 })

  const rules = [
    { id: 'product', name: 'Product Rule', formula: 'log(A × B) = log(A) + log(B)' },
    { id: 'quotient', name: 'Quotient Rule', formula: 'log(A ÷ B) = log(A) - log(B)' },
    { id: 'power', name: 'Power Rule', formula: 'log(A^n) = n × log(A)' }
  ]

  // Handle responsive sizing
  useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.min(entry.contentRect.width, 600)
        setDimensions({ width, height: 180 })
      }
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // Calculate values based on active rule
  const getCalculations = () => {
    const logA = Math.log10(valueA)
    const logB = Math.log10(valueB)

    if (activeRule === 'product') {
      const product = valueA * valueB
      const logProduct = Math.log10(product)
      return { logA, logB, result: logProduct, resultValue: product }
    } else if (activeRule === 'quotient') {
      const quotient = valueA / valueB
      const logQuotient = Math.log10(quotient)
      return { logA, logB, result: logQuotient, resultValue: quotient }
    } else {
      const powered = Math.pow(valueA, power)
      const logPowered = power * logA
      return { logA, power, result: logPowered, resultValue: powered }
    }
  }

  const calc = getCalculations()

  // D3 rendering
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { width, height } = dimensions
    const margin = { top: 20, right: 20, bottom: 40, left: 20 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Scale for log values (0 to max)
    const maxLog = activeRule === 'power'
      ? Math.max(calc.result, calc.logA * calc.power) + 1
      : Math.max(calc.logA, calc.logB, Math.abs(calc.result)) + 1
    const minLog = activeRule === 'quotient' && calc.result < 0 ? calc.result - 0.5 : 0

    const xScale = d3.scaleLinear()
      .domain([minLog, maxLog])
      .range([0, chartWidth])

    // Draw axis
    const axisY = chartHeight - 20
    g.append('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', axisY)
      .attr('y2', axisY)
      .attr('stroke', '#a8a29e')
      .attr('stroke-width', 2)

    // Tick marks and labels
    const ticks = d3.range(Math.floor(minLog), Math.ceil(maxLog) + 1)
    ticks.forEach(tick => {
      g.append('line')
        .attr('x1', xScale(tick))
        .attr('x2', xScale(tick))
        .attr('y1', axisY - 5)
        .attr('y2', axisY + 5)
        .attr('stroke', '#78716c')
        .attr('stroke-width', 1)

      g.append('text')
        .attr('x', xScale(tick))
        .attr('y', axisY + 20)
        .attr('text-anchor', 'middle')
        .attr('fill', '#78716c')
        .attr('font-size', '11px')
        .text(tick)

      // Show 10^tick value
      g.append('text')
        .attr('x', xScale(tick))
        .attr('y', axisY + 32)
        .attr('text-anchor', 'middle')
        .attr('fill', '#a8a29e')
        .attr('font-size', '9px')
        .text(`(${Math.pow(10, tick).toLocaleString()})`)
    })

    // Draw segments based on rule
    const segmentY = 40
    const segmentHeight = 20

    if (activeRule === 'product') {
      // Segment A
      g.append('rect')
        .attr('x', xScale(0))
        .attr('y', segmentY)
        .attr('width', xScale(calc.logA) - xScale(0))
        .attr('height', segmentHeight)
        .attr('fill', '#3b82f6')
        .attr('rx', 4)

      g.append('text')
        .attr('x', xScale(calc.logA / 2))
        .attr('y', segmentY + 14)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text(`log(${valueA}) = ${calc.logA.toFixed(1)}`)

      if (showCombined) {
        // Segment B (attached)
        g.append('rect')
          .attr('x', xScale(calc.logA))
          .attr('y', segmentY)
          .attr('width', xScale(calc.logA + calc.logB) - xScale(calc.logA))
          .attr('height', segmentHeight)
          .attr('fill', '#22c55e')
          .attr('rx', 4)
          .attr('opacity', 0)
          .transition()
          .duration(500)
          .attr('opacity', 1)

        g.append('text')
          .attr('x', xScale(calc.logA + calc.logB / 2))
          .attr('y', segmentY + 14)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .attr('opacity', 0)
          .text(`log(${valueB}) = ${calc.logB.toFixed(1)}`)
          .transition()
          .duration(500)
          .attr('opacity', 1)

        // Result bracket
        g.append('path')
          .attr('d', `M ${xScale(0)} ${segmentY + segmentHeight + 8}
                      L ${xScale(0)} ${segmentY + segmentHeight + 15}
                      L ${xScale(calc.result)} ${segmentY + segmentHeight + 15}
                      L ${xScale(calc.result)} ${segmentY + segmentHeight + 8}`)
          .attr('stroke', '#f59e0b')
          .attr('stroke-width', 2)
          .attr('fill', 'none')
          .attr('opacity', 0)
          .transition()
          .duration(500)
          .attr('opacity', 1)

        g.append('text')
          .attr('x', xScale(calc.result / 2))
          .attr('y', segmentY + segmentHeight + 30)
          .attr('text-anchor', 'middle')
          .attr('fill', '#f59e0b')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('opacity', 0)
          .text(`= ${calc.logA.toFixed(1)} + ${calc.logB.toFixed(1)} = ${calc.result.toFixed(1)}`)
          .transition()
          .duration(500)
          .attr('opacity', 1)
      } else {
        // Segment B (separate)
        g.append('rect')
          .attr('x', xScale(0))
          .attr('y', segmentY + segmentHeight + 15)
          .attr('width', xScale(calc.logB) - xScale(0))
          .attr('height', segmentHeight)
          .attr('fill', '#22c55e')
          .attr('rx', 4)

        g.append('text')
          .attr('x', xScale(calc.logB / 2))
          .attr('y', segmentY + segmentHeight + 29)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .text(`log(${valueB}) = ${calc.logB.toFixed(1)}`)
      }
    } else if (activeRule === 'quotient') {
      // Segment A
      g.append('rect')
        .attr('x', xScale(0))
        .attr('y', segmentY)
        .attr('width', xScale(calc.logA) - xScale(0))
        .attr('height', segmentHeight)
        .attr('fill', '#3b82f6')
        .attr('rx', 4)

      g.append('text')
        .attr('x', xScale(calc.logA / 2))
        .attr('y', segmentY + 14)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text(`log(${valueA}) = ${calc.logA.toFixed(1)}`)

      if (showCombined) {
        // Show subtraction result
        const resultX = xScale(Math.max(0, calc.result))
        const resultWidth = xScale(Math.abs(calc.result)) - xScale(0)

        g.append('rect')
          .attr('x', calc.result >= 0 ? xScale(0) : xScale(calc.result))
          .attr('y', segmentY + segmentHeight + 25)
          .attr('width', resultWidth)
          .attr('height', segmentHeight)
          .attr('fill', '#f59e0b')
          .attr('rx', 4)
          .attr('opacity', 0)
          .transition()
          .duration(500)
          .attr('opacity', 1)

        g.append('text')
          .attr('x', xScale(calc.result / 2))
          .attr('y', segmentY + segmentHeight + 50)
          .attr('text-anchor', 'middle')
          .attr('fill', '#f59e0b')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('opacity', 0)
          .text(`= ${calc.logA.toFixed(1)} - ${calc.logB.toFixed(1)} = ${calc.result.toFixed(2)}`)
          .transition()
          .duration(500)
          .attr('opacity', 1)

        // Crossed out B segment
        g.append('rect')
          .attr('x', xScale(calc.result))
          .attr('y', segmentY)
          .attr('width', xScale(calc.logA) - xScale(calc.result))
          .attr('height', segmentHeight)
          .attr('fill', '#ef4444')
          .attr('rx', 4)
          .attr('opacity', 0)
          .transition()
          .duration(500)
          .attr('opacity', 0.5)
      } else {
        // Segment B (separate)
        g.append('rect')
          .attr('x', xScale(0))
          .attr('y', segmentY + segmentHeight + 15)
          .attr('width', xScale(calc.logB) - xScale(0))
          .attr('height', segmentHeight)
          .attr('fill', '#22c55e')
          .attr('rx', 4)

        g.append('text')
          .attr('x', xScale(calc.logB / 2))
          .attr('y', segmentY + segmentHeight + 29)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .text(`log(${valueB}) = ${calc.logB.toFixed(1)}`)
      }
    } else {
      // Power rule - show repeated segments
      const segmentWidth = (xScale(calc.logA) - xScale(0))

      for (let i = 0; i < (showCombined ? power : 1); i++) {
        g.append('rect')
          .attr('x', showCombined ? xScale(i * calc.logA) : xScale(0))
          .attr('y', showCombined ? segmentY : segmentY + i * (segmentHeight + 5))
          .attr('width', segmentWidth)
          .attr('height', segmentHeight)
          .attr('fill', '#3b82f6')
          .attr('rx', 4)
          .attr('opacity', 0)
          .transition()
          .duration(300)
          .delay(i * 150)
          .attr('opacity', 1)

        if (!showCombined || i === 0) {
          g.append('text')
            .attr('x', (showCombined ? xScale(i * calc.logA) : xScale(0)) + segmentWidth / 2)
            .attr('y', (showCombined ? segmentY : segmentY + i * (segmentHeight + 5)) + 14)
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .attr('font-size', '11px')
            .attr('font-weight', 'bold')
            .text(`log(${valueA}) = ${calc.logA.toFixed(1)}`)
        }
      }

      if (showCombined) {
        // Result bracket
        g.append('text')
          .attr('x', xScale(calc.result / 2))
          .attr('y', segmentY + segmentHeight + 25)
          .attr('text-anchor', 'middle')
          .attr('fill', '#f59e0b')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('opacity', 0)
          .text(`${power} × ${calc.logA.toFixed(1)} = ${calc.result.toFixed(1)}`)
          .transition()
          .duration(500)
          .delay(power * 150)
          .attr('opacity', 1)
      }
    }

  }, [activeRule, valueA, valueB, power, showCombined, dimensions, calc])

  return (
    <div className="bg-white rounded-xl border border-sand-200 p-6">
      <h3 className="font-serif text-lg font-semibold text-sand-900 mb-2">
        Why Do Logarithm Properties Work?
      </h3>
      <p className="text-sm text-sand-600 mb-4">
        Logarithms extract exponents. See how multiplication becomes addition on a log scale.
      </p>

      {/* Rule tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {rules.map(rule => (
          <button
            key={rule.id}
            onClick={() => {
              setActiveRule(rule.id)
              setShowCombined(false)
            }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeRule === rule.id
                ? 'bg-ocean-500 text-white'
                : 'bg-sand-100 text-sand-700 hover:bg-sand-200'
            }`}
          >
            {rule.name}
          </button>
        ))}
      </div>

      {/* Formula display */}
      <div className="mb-4 p-3 bg-sand-50 rounded-lg border border-sand-200">
        <div className="font-mono text-lg text-center text-sand-800">
          {rules.find(r => r.id === activeRule)?.formula}
        </div>
      </div>

      {/* Value controls */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-sand-600">A =</label>
          <select
            value={valueA}
            onChange={(e) => {
              setValueA(Number(e.target.value))
              setShowCombined(false)
            }}
            className="px-3 py-1 border border-sand-300 rounded-lg"
          >
            {[10, 100, 1000, 10000].map(v => (
              <option key={v} value={v}>{v.toLocaleString()}</option>
            ))}
          </select>
        </div>
        {activeRule !== 'power' && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-sand-600">B =</label>
            <select
              value={valueB}
              onChange={(e) => {
                setValueB(Number(e.target.value))
                setShowCombined(false)
              }}
              className="px-3 py-1 border border-sand-300 rounded-lg"
            >
              {[10, 100, 1000, 10000].map(v => (
                <option key={v} value={v}>{v.toLocaleString()}</option>
              ))}
            </select>
          </div>
        )}
        {activeRule === 'power' && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-sand-600">n =</label>
            <select
              value={power}
              onChange={(e) => {
                setPower(Number(e.target.value))
                setShowCombined(false)
              }}
              className="px-3 py-1 border border-sand-300 rounded-lg"
            >
              {[2, 3, 4, 5].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Visualization */}
      <div ref={containerRef} className="w-full mb-4">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="mx-auto"
        />
      </div>

      {/* Combine button */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowCombined(!showCombined)}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            showCombined
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-forest-500 text-white hover:bg-forest-600'
          }`}
        >
          {showCombined ? 'Show Separate' : activeRule === 'product' ? 'Combine Segments' : activeRule === 'quotient' ? 'Subtract Segments' : 'Stack Segments'}
        </button>
      </div>

      {/* Explanation */}
      {showCombined && (
        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="text-sm text-amber-800">
            {activeRule === 'product' && (
              <>
                <strong>Why it works:</strong> When you multiply {valueA.toLocaleString()} × {valueB.toLocaleString()},
                you're combining their "powers of 10." On a log scale, this is just adding lengths!
                <div className="mt-2 font-mono text-xs bg-white p-2 rounded">
                  10<sup>{calc.logA}</sup> × 10<sup>{calc.logB}</sup> = 10<sup>{calc.logA} + {calc.logB}</sup> = 10<sup>{calc.result}</sup>
                </div>
              </>
            )}
            {activeRule === 'quotient' && (
              <>
                <strong>Why it works:</strong> Division removes powers. {valueA.toLocaleString()} ÷ {valueB.toLocaleString()}
                means subtracting {calc.logB.toFixed(1)} from {calc.logA.toFixed(1)}.
                <div className="mt-2 font-mono text-xs bg-white p-2 rounded">
                  10<sup>{calc.logA}</sup> ÷ 10<sup>{calc.logB}</sup> = 10<sup>{calc.logA} - {calc.logB}</sup> = 10<sup>{calc.result.toFixed(2)}</sup>
                </div>
              </>
            )}
            {activeRule === 'power' && (
              <>
                <strong>Why it works:</strong> Raising {valueA.toLocaleString()} to the power {power}
                means multiplying the exponent {power} times.
                <div className="mt-2 font-mono text-xs bg-white p-2 rounded">
                  (10<sup>{calc.logA}</sup>)<sup>{power}</sup> = 10<sup>{calc.logA} × {power}</sup> = 10<sup>{calc.result}</sup>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
