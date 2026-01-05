import { useState, useEffect } from 'react'

/**
 * Interactive converter between exponential and logarithmic forms
 * Shows the relationship: b^x = y ⟺ log_b(y) = x
 */
export default function ExponentialLogConverter() {
  const [base, setBase] = useState(10)
  const [exponent, setExponent] = useState(3)
  const [result, setResult] = useState(1000)
  const [activeInput, setActiveInput] = useState('exponent')
  const [animating, setAnimating] = useState(false)

  // Calculate result when base or exponent changes
  useEffect(() => {
    if (activeInput === 'exponent' || activeInput === 'base') {
      const newResult = Math.pow(base, exponent)
      if (isFinite(newResult) && newResult > 0) {
        setResult(newResult)
      }
    }
  }, [base, exponent, activeInput])

  // Calculate exponent when result changes
  useEffect(() => {
    if (activeInput === 'result') {
      if (result > 0 && base > 0 && base !== 1) {
        const newExponent = Math.log(result) / Math.log(base)
        if (isFinite(newExponent)) {
          setExponent(parseFloat(newExponent.toFixed(4)))
        }
      }
    }
  }, [result, base, activeInput])

  const handleSwap = () => {
    setAnimating(true)
    setTimeout(() => setAnimating(false), 500)
  }

  const formatNumber = (n) => {
    if (Math.abs(n) >= 1000000) return n.toExponential(2)
    if (Number.isInteger(n)) return n.toString()
    return n.toFixed(4).replace(/\.?0+$/, '')
  }

  return (
    <div className="bg-white rounded-xl border border-sand-200 p-6">
      <h3 className="font-serif text-lg font-semibold text-sand-900 mb-2">
        Exponential ⟺ Logarithmic Converter
      </h3>
      <p className="text-sm text-sand-600 mb-6">
        Explore the relationship between exponential and logarithmic forms.
        Change any value to see the others update.
      </p>

      {/* Exponential Form */}
      <div className={`mb-6 p-5 rounded-xl border-2 transition-all duration-300 ${
        animating ? 'border-ocean-400 bg-ocean-50' : 'border-ocean-200 bg-ocean-50/50'
      }`}>
        <div className="text-xs font-medium text-ocean-600 uppercase tracking-wide mb-3">
          Exponential Form
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {/* Base input */}
          <div className="flex flex-col items-center">
            <label className="text-xs text-sand-500 mb-1">base</label>
            <input
              type="number"
              value={base}
              onChange={(e) => {
                setActiveInput('base')
                setBase(parseFloat(e.target.value) || 2)
              }}
              onFocus={() => setActiveInput('base')}
              min={2}
              max={100}
              className="w-16 h-12 text-center text-xl font-mono font-bold border-2 border-ocean-300 rounded-lg focus:border-ocean-500 focus:outline-none bg-white"
            />
          </div>

          {/* Exponent (superscript style) */}
          <div className="flex flex-col items-center relative">
            <label className="text-xs text-sand-500 mb-1">exponent</label>
            <input
              type="number"
              value={exponent}
              onChange={(e) => {
                setActiveInput('exponent')
                setExponent(parseFloat(e.target.value) || 0)
              }}
              onFocus={() => setActiveInput('exponent')}
              step={0.1}
              className="w-16 h-10 text-center text-lg font-mono font-bold border-2 border-ocean-300 rounded-lg focus:border-ocean-500 focus:outline-none bg-white -mt-2"
            />
          </div>

          <span className="text-2xl font-bold text-sand-400 mx-2">=</span>

          {/* Result */}
          <div className="flex flex-col items-center">
            <label className="text-xs text-sand-500 mb-1">result</label>
            <input
              type="number"
              value={result}
              onChange={(e) => {
                setActiveInput('result')
                setResult(parseFloat(e.target.value) || 1)
              }}
              onFocus={() => setActiveInput('result')}
              min={0.001}
              className="w-28 h-12 text-center text-xl font-mono font-bold border-2 border-ocean-300 rounded-lg focus:border-ocean-500 focus:outline-none bg-white"
            />
          </div>
        </div>

        <div className="text-center mt-3 font-mono text-lg text-ocean-700">
          {base}<sup>{formatNumber(exponent)}</sup> = {formatNumber(result)}
        </div>
      </div>

      {/* Conversion Arrow */}
      <div className="flex justify-center my-4">
        <button
          onClick={handleSwap}
          className="p-3 rounded-full bg-sand-100 hover:bg-sand-200 transition-colors"
          aria-label="Convert between forms"
        >
          <svg className="w-6 h-6 text-sand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      {/* Logarithmic Form */}
      <div className={`p-5 rounded-xl border-2 transition-all duration-300 ${
        animating ? 'border-forest-400 bg-forest-50' : 'border-forest-200 bg-forest-50/50'
      }`}>
        <div className="text-xs font-medium text-forest-600 uppercase tracking-wide mb-3">
          Logarithmic Form
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-xl font-bold text-forest-700">log</span>
          <span className="text-sm font-mono text-forest-600 -ml-1 mr-1">{base}</span>
          <span className="text-xl text-sand-400">(</span>
          <span className="font-mono text-xl font-bold text-forest-700">{formatNumber(result)}</span>
          <span className="text-xl text-sand-400">)</span>
          <span className="text-2xl font-bold text-sand-400 mx-2">=</span>
          <span className="font-mono text-xl font-bold text-forest-700">{formatNumber(exponent)}</span>
        </div>

        <div className="text-center mt-3 font-mono text-lg text-forest-700">
          log<sub>{base}</sub>({formatNumber(result)}) = {formatNumber(exponent)}
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-amber-800">
            <strong>Key insight:</strong> The logarithm asks "What power do I raise {base} to in order to get {formatNumber(result)}?"
            The answer is {formatNumber(exponent)}, because {base}<sup>{formatNumber(exponent)}</sup> = {formatNumber(result)}.
          </div>
        </div>
      </div>

      {/* Common Examples */}
      <div className="mt-6">
        <div className="text-xs font-medium text-sand-500 uppercase tracking-wide mb-3">
          Try these examples
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { base: 10, exp: 2, label: '10² = 100' },
            { base: 2, exp: 8, label: '2⁸ = 256' },
            { base: 10, exp: -2, label: '10⁻² = 0.01' },
            { base: 'e', exp: 1, label: 'e¹ ≈ 2.718' }
          ].map((example, i) => (
            <button
              key={i}
              onClick={() => {
                setBase(example.base === 'e' ? Math.E : example.base)
                setExponent(example.exp)
                setActiveInput('exponent')
              }}
              className="px-3 py-1.5 text-sm font-mono bg-sand-100 text-sand-700 rounded-lg hover:bg-sand-200 transition-colors"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
