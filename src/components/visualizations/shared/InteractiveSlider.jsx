/**
 * Interactive slider for controlling visualization parameters
 */
export default function InteractiveSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  showValue = true,
  formatValue = (v) => v,
  className = ''
}) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={`interactive-slider ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-sand-700">
          {label}
        </label>
        {showValue && (
          <span className="text-sm font-mono text-sand-900">
            {formatValue(value)}{unit}
          </span>
        )}
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-sand-200 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-forest-500
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-forest-500
            [&::-moz-range-thumb]:border-none
            [&::-moz-range-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, #22c55e ${percentage}%, #e7e5e4 ${percentage}%)`
          }}
        />
      </div>
    </div>
  )
}

/**
 * Number input with increment/decrement buttons
 */
export function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  className = ''
}) {
  const handleIncrement = () => {
    const newValue = value + step
    if (max === undefined || newValue <= max) {
      onChange(newValue)
    }
  }

  const handleDecrement = () => {
    const newValue = value - step
    if (min === undefined || newValue >= min) {
      onChange(newValue)
    }
  }

  return (
    <div className={`number-input ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-sand-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrement}
          disabled={min !== undefined && value <= min}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-sand-100 text-sand-600 hover:bg-sand-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Decrease"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="w-24 px-3 py-1.5 text-center font-mono border border-sand-200 rounded-lg focus:border-forest-500 focus:outline-none"
        />
        <span className="text-sm text-sand-500">{unit}</span>
        <button
          onClick={handleIncrement}
          disabled={max !== undefined && value >= max}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-sand-100 text-sand-600 hover:bg-sand-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Increase"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  )
}
