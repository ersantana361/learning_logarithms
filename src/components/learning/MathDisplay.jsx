import { useEffect, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

/**
 * Component for rendering mathematical equations using KaTeX
 * Supports both inline and block display modes
 */
export default function MathDisplay({
  math,
  block = false,
  className = '',
  errorColor = '#cc0000'
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current && math) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: block,
          throwOnError: false,
          errorColor,
          trust: true,
          strict: false
        })
      } catch (error) {
        console.error('KaTeX rendering error:', error)
        containerRef.current.textContent = math
      }
    }
  }, [math, block, errorColor])

  return (
    <span
      ref={containerRef}
      className={`math-display ${block ? 'block my-4' : 'inline'} ${className}`}
      aria-label={`Mathematical expression: ${math}`}
    />
  )
}

/**
 * Block math equation with optional label
 */
export function MathBlock({ math, label, className = '' }) {
  return (
    <div className={`math-block my-6 ${className}`}>
      <div className="flex items-center justify-center gap-4">
        <MathDisplay math={math} block />
        {label && (
          <span className="text-sm text-sand-500 font-medium">({label})</span>
        )}
      </div>
    </div>
  )
}

/**
 * Math equation with explanation
 */
export function MathWithExplanation({ math, explanation, className = '' }) {
  return (
    <div className={`math-with-explanation p-4 bg-sand-50 rounded-lg border border-sand-200 ${className}`}>
      <div className="flex justify-center mb-3">
        <MathDisplay math={math} block />
      </div>
      <p className="text-sm text-sand-600 text-center">{explanation}</p>
    </div>
  )
}

/**
 * Inline math within text - convenience component
 */
export function InlineMath({ children }) {
  return <MathDisplay math={children} />
}

/**
 * Common mathematical symbols as pre-defined components
 */
export const MathSymbols = {
  log10: (x) => `\\log_{10}(${x})`,
  ln: (x) => `\\ln(${x})`,
  logBase: (b, x) => `\\log_{${b}}(${x})`,
  power: (base, exp) => `${base}^{${exp}}`,
  fraction: (num, den) => `\\frac{${num}}{${den}}`,
  sqrt: (x) => `\\sqrt{${x}}`,
  sum: (from, to, expr) => `\\sum_{${from}}^{${to}} ${expr}`,
  approx: '\\approx',
  times: '\\times',
  cdot: '\\cdot',
  pm: '\\pm',
  leq: '\\leq',
  geq: '\\geq',
  neq: '\\neq',
  infinity: '\\infty',
  e: 'e',
  pi: '\\pi'
}

/**
 * Pre-built common equations
 */
export const CommonEquations = {
  logDefinition: 'b^x = y \\Leftrightarrow \\log_b(y) = x',
  phDefinition: '\\text{pH} = -\\log_{10}[\\text{H}^+]',
  exponentialGrowth: 'N(t) = N_0 e^{rt}',
  doublingTime: 't_2 = \\frac{\\ln(2)}{r}',
  halfLife: 't_{1/2} = \\frac{\\ln(2)}{k}',
  michaelisMenten: 'v = \\frac{V_{max}[S]}{K_m + [S]}',
  shannonIndex: "H' = -\\sum_{i=1}^{S} p_i \\ln(p_i)",
  speciesArea: 'S = cA^z',
  weberFechner: 'S = k \\ln(I)',
  kleiber: 'BMR = aM^{0.75}',
  decibel: 'dB = 10 \\log_{10}\\left(\\frac{I}{I_0}\\right)',
  logProduct: '\\log(AB) = \\log(A) + \\log(B)',
  logQuotient: '\\log\\left(\\frac{A}{B}\\right) = \\log(A) - \\log(B)',
  logPower: '\\log(A^n) = n \\cdot \\log(A)'
}
