import { useRef, useState, useEffect } from 'react'

/**
 * Responsive container for D3 visualizations
 * Handles sizing, accessibility, and common chart features
 */
export default function ChartContainer({
  children,
  title,
  description,
  aspectRatio = 16 / 9,
  minHeight = 300,
  maxHeight = 500,
  className = '',
  controls,
  legend
}) {
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 })

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width
        let height = width / aspectRatio
        height = Math.max(minHeight, Math.min(maxHeight, height))
        setDimensions({ width, height })
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [aspectRatio, minHeight, maxHeight])

  return (
    <div className={`visualization-wrapper ${className}`}>
      {/* Title and Description */}
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="font-serif text-lg font-semibold text-sand-900">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-sand-600 mt-1">{description}</p>
          )}
        </div>
      )}

      {/* Controls */}
      {controls && (
        <div className="mb-4 p-4 bg-sand-50 rounded-lg border border-sand-200">
          {controls}
        </div>
      )}

      {/* Chart Container */}
      <div
        ref={containerRef}
        className="visualization-container bg-white rounded-xl border border-sand-200 overflow-hidden"
        role="img"
        aria-label={title || 'Interactive visualization'}
      >
        <div
          style={{
            width: '100%',
            height: dimensions.height,
            position: 'relative'
          }}
        >
          {typeof children === 'function'
            ? children(dimensions)
            : children}
        </div>
      </div>

      {/* Legend */}
      {legend && (
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-sand-600">
          {legend}
        </div>
      )}
    </div>
  )
}

/**
 * Legend item component
 */
export function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-4 h-4 rounded"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </div>
  )
}
