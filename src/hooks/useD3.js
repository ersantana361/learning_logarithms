import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'

/**
 * Custom hook for D3.js integration with React
 * Handles cleanup and re-rendering on dependency changes
 *
 * @param {Function} renderFn - Function that receives D3 selection and renders the visualization
 * @param {Array} dependencies - Dependency array for re-rendering
 * @returns {React.RefObject} - Ref to attach to the SVG or container element
 */
export function useD3(renderFn, dependencies = []) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) {
      // Clear previous content to prevent duplicates
      d3.select(ref.current).selectAll('*').remove()

      // Call the render function with the D3 selection
      renderFn(d3.select(ref.current))
    }

    // Cleanup on unmount or before re-render
    return () => {
      if (ref.current) {
        d3.select(ref.current).selectAll('*').remove()
      }
    }
  }, dependencies)

  return ref
}

/**
 * Hook for responsive D3 visualizations
 * Observes container size and provides dimensions
 *
 * @param {React.RefObject} containerRef - Ref to the container element
 * @param {number} baseWidth - Default width
 * @param {number} baseHeight - Default height
 * @returns {{ width: number, height: number }} - Current dimensions
 */
export function useResponsiveD3(containerRef, baseWidth = 600, baseHeight = 400) {
  const [dimensions, setDimensions] = useState({ width: baseWidth, height: baseHeight })

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        // Maintain aspect ratio
        const aspectRatio = baseHeight / baseWidth
        setDimensions({
          width: Math.min(width, baseWidth),
          height: Math.min(width * aspectRatio, baseHeight)
        })
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => resizeObserver.disconnect()
  }, [containerRef, baseWidth, baseHeight])

  return dimensions
}

// Re-export d3 for convenience
export { d3 }

export default useD3
