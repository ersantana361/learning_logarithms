import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

const glossaryTerms = [
  {
    id: 'logarithm',
    term: 'Logarithm',
    definition: 'The power to which a base must be raised to produce a given number. If b^x = y, then log_b(y) = x.',
    symbol: 'log_b(x)',
    category: 'foundations',
    example: 'log₁₀(1000) = 3 because 10³ = 1000'
  },
  {
    id: 'natural-logarithm',
    term: 'Natural Logarithm',
    definition: 'A logarithm with base e (approximately 2.718). Written as ln(x). Commonly used in biological growth models.',
    symbol: 'ln(x)',
    category: 'foundations',
    example: 'ln(e) = 1, ln(e²) = 2'
  },
  {
    id: 'common-logarithm',
    term: 'Common Logarithm',
    definition: 'A logarithm with base 10. Written as log(x) or log₁₀(x). Used in pH calculations and decibel measurements.',
    symbol: 'log₁₀(x)',
    category: 'foundations',
    example: 'log(100) = 2, log(1000) = 3'
  },
  {
    id: 'ph',
    term: 'pH',
    definition: 'A measure of acidity defined as the negative logarithm of hydrogen ion concentration: pH = -log[H⁺].',
    symbol: 'pH = -log[H⁺]',
    category: 'chemistry',
    example: 'A solution with [H⁺] = 10⁻⁷ M has pH = 7'
  },
  {
    id: 'exponential-growth',
    term: 'Exponential Growth',
    definition: 'Growth where the rate of increase is proportional to the current value. Population grows at a constant percentage rate.',
    symbol: 'N(t) = N₀e^(rt)',
    category: 'population',
    example: 'Bacterial population doubling every 20 minutes'
  },
  {
    id: 'doubling-time',
    term: 'Doubling Time',
    definition: 'The time required for a quantity to double in size at a constant growth rate. Calculated as t₂ = ln(2)/r.',
    symbol: 't₂ = ln(2)/r',
    category: 'population',
    example: 'A 5% annual growth rate gives a doubling time of about 14 years'
  },
  {
    id: 'half-life',
    term: 'Half-Life',
    definition: 'The time required for a quantity to reduce to half its initial value. Used in pharmacology and radioactive decay.',
    symbol: 't½ = ln(2)/k',
    category: 'pharmacology',
    example: 'Caffeine has a half-life of approximately 5 hours'
  },
  {
    id: 'michaelis-menten',
    term: 'Michaelis-Menten Equation',
    definition: 'Describes enzyme kinetics: v = Vmax[S]/(Km + [S]), where v is reaction velocity, Vmax is maximum velocity, Km is the Michaelis constant, and [S] is substrate concentration.',
    symbol: 'v = Vmax[S]/(Km + [S])',
    category: 'enzymes',
    example: 'At [S] = Km, the reaction rate is Vmax/2'
  },
  {
    id: 'km',
    term: 'Km (Michaelis Constant)',
    definition: 'The substrate concentration at which an enzyme operates at half its maximum velocity. Indicates enzyme-substrate affinity.',
    symbol: 'Km',
    category: 'enzymes',
    example: 'Low Km indicates high affinity for substrate'
  },
  {
    id: 'decibel',
    term: 'Decibel (dB)',
    definition: 'A logarithmic unit for measuring sound intensity: dB = 10 × log₁₀(I/I₀), where I₀ is the reference intensity.',
    symbol: 'dB = 10log(I/I₀)',
    category: 'perception',
    example: 'A 10 dB increase represents a 10-fold increase in sound intensity'
  },
  {
    id: 'weber-fechner',
    term: 'Weber-Fechner Law',
    definition: 'States that perceived sensation is proportional to the logarithm of stimulus intensity. Explains why we perceive ratios, not differences.',
    symbol: 'S = k × log(I)',
    category: 'perception',
    example: 'Equal ratios of stimulus produce equal differences in perception'
  },
  {
    id: 'kleibers-law',
    term: "Kleiber's Law",
    definition: 'Metabolic rate scales with body mass to the 3/4 power: BMR ∝ M^0.75. Larger animals have lower metabolic rates per unit mass.',
    symbol: 'BMR = aM^0.75',
    category: 'allometry',
    example: 'An elephant has a lower metabolic rate per kg than a mouse'
  },
  {
    id: 'shannon-index',
    term: 'Shannon Diversity Index',
    definition: 'A measure of species diversity: H\' = -Σ(pᵢ × ln(pᵢ)), where pᵢ is the proportion of species i.',
    symbol: "H' = -Σ(pᵢ ln pᵢ)",
    category: 'ecology',
    example: 'Higher H\' indicates greater biodiversity'
  },
  {
    id: 'species-area',
    term: 'Species-Area Relationship',
    definition: 'The relationship between island/habitat area and number of species: S = cA^z, where z is typically around 0.25.',
    symbol: 'S = cA^z',
    category: 'ecology',
    example: 'Larger islands support more species'
  }
]

const categories = [
  { id: 'all', label: 'All Terms' },
  { id: 'foundations', label: 'Foundations' },
  { id: 'chemistry', label: 'Chemistry' },
  { id: 'population', label: 'Population' },
  { id: 'pharmacology', label: 'Pharmacology' },
  { id: 'enzymes', label: 'Enzymes' },
  { id: 'perception', label: 'Perception' },
  { id: 'allometry', label: 'Allometry' },
  { id: 'ecology', label: 'Ecology' }
]

export default function Glossary() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('term') || '')
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredTerms = useMemo(() => {
    return glossaryTerms.filter(term => {
      const matchesSearch = search === '' ||
        term.term.toLowerCase().includes(search.toLowerCase()) ||
        term.definition.toLowerCase().includes(search.toLowerCase())

      const matchesCategory = activeCategory === 'all' || term.category === activeCategory

      return matchesSearch && matchesCategory
    })
  }, [search, activeCategory])

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-sand-900 mb-2">
            Glossary
          </h1>
          <p className="text-sand-600">
            Key terms and concepts from logarithms in biology.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search terms..."
              className="w-full pl-12 pr-4 py-3 border border-sand-200 rounded-lg focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-forest-600 text-white'
                  : 'bg-sand-100 text-sand-600 hover:bg-sand-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Terms List */}
        <div className="space-y-4">
          {filteredTerms.length > 0 ? (
            filteredTerms.map((term) => (
              <div
                key={term.id}
                id={term.id}
                className="bg-white rounded-xl border border-sand-200 p-6 hover:border-sand-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-serif text-xl font-semibold text-sand-900">
                    {term.term}
                  </h3>
                  <code className="px-3 py-1 bg-sand-100 text-sand-700 rounded-lg text-sm font-mono shrink-0">
                    {term.symbol}
                  </code>
                </div>
                <p className="text-sand-600 mb-4 leading-relaxed">
                  {term.definition}
                </p>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-forest-100 text-forest-700 rounded-full text-xs font-medium capitalize">
                    {term.category}
                  </span>
                  <span className="text-sm text-sand-500">
                    <span className="font-medium">Example:</span> {term.example}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-sand-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sand-500">No terms found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
