import { Link } from 'react-router-dom'

const resources = [
  {
    category: 'Formula Sheets',
    items: [
      {
        title: 'Logarithm Properties Reference',
        description: 'Essential formulas and properties of logarithms for quick reference.',
        type: 'PDF',
        size: '156 KB'
      },
      {
        title: 'pH Calculations Cheat Sheet',
        description: 'Quick reference for pH, pOH, and hydrogen ion concentration calculations.',
        type: 'PDF',
        size: '124 KB'
      },
      {
        title: 'Enzyme Kinetics Formulas',
        description: 'Michaelis-Menten, Lineweaver-Burk, and inhibition equations.',
        type: 'PDF',
        size: '198 KB'
      }
    ]
  },
  {
    category: 'Module Summaries',
    items: [
      {
        title: 'Module 1: Foundations Summary',
        description: 'Key concepts and formulas from the Foundations of Logarithms module.',
        type: 'PDF',
        size: '245 KB'
      },
      {
        title: 'Module 2: pH Scale Summary',
        description: 'Complete overview of pH concepts with biological examples.',
        type: 'PDF',
        size: '312 KB'
      },
      {
        title: 'Module 3: Population Dynamics Summary',
        description: 'Growth models, doubling time, and logistic curves explained.',
        type: 'PDF',
        size: '287 KB'
      }
    ]
  },
  {
    category: 'Practice Problems',
    items: [
      {
        title: 'Extra Practice Set 1',
        description: '50 additional problems covering modules 1-4 with solutions.',
        type: 'PDF',
        size: '423 KB'
      },
      {
        title: 'Challenge Problem Collection',
        description: 'Advanced problems for students seeking extra challenge.',
        type: 'PDF',
        size: '356 KB'
      }
    ]
  }
]

const externalLinks = [
  {
    title: 'Khan Academy: Logarithms',
    description: 'Free video lessons on logarithm fundamentals.',
    url: 'https://www.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:logs'
  },
  {
    title: 'NCBI: pH in Biology',
    description: 'Scientific articles on pH regulation in living systems.',
    url: 'https://www.ncbi.nlm.nih.gov'
  },
  {
    title: 'Wolfram Alpha',
    description: 'Computational engine for checking logarithmic calculations.',
    url: 'https://www.wolframalpha.com'
  }
]

export default function Resources() {
  return (
    <div className="py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-sand-900 mb-2">
            Downloadable Resources
          </h1>
          <p className="text-sand-600">
            Formula sheets, summaries, and practice materials for offline study.
          </p>
        </div>

        {/* Resource Categories */}
        <div className="space-y-8 mb-12">
          {resources.map((category) => (
            <div key={category.category}>
              <h2 className="font-serif text-xl font-semibold text-sand-900 mb-4">
                {category.category}
              </h2>
              <div className="grid gap-4">
                {category.items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-sand-200 p-5 hover:border-sand-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zm-3 9v6h-2v-6H6l4-4 4 4h-2z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-sand-900">{item.title}</h3>
                          <p className="text-sm text-sand-500 mt-1">{item.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-sand-400">
                            <span>{item.type}</span>
                            <span>•</span>
                            <span>{item.size}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-forest-600 text-white text-sm font-medium rounded-lg hover:bg-forest-700 transition-colors shrink-0"
                        onClick={() => alert('Download functionality will be available when content is added.')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* External Resources */}
        <div className="mb-12">
          <h2 className="font-serif text-xl font-semibold text-sand-900 mb-4">
            External Resources
          </h2>
          <div className="grid gap-4">
            {externalLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-xl border border-sand-200 p-5 hover:border-ocean-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sand-900 group-hover:text-ocean-600 transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-sm text-sand-500 mt-1">{link.description}</p>
                  </div>
                  <svg className="w-5 h-5 text-sand-400 group-hover:text-ocean-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-br from-forest-50 to-ocean-50 rounded-2xl p-8">
          <h2 className="font-serif text-xl font-semibold text-sand-900 mb-4">
            Need More Help?
          </h2>
          <p className="text-sand-600 mb-6">
            If you're struggling with any concepts, we recommend revisiting the relevant module
            lessons and practicing with the interactive visualizations.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/modules"
              className="inline-flex items-center px-5 py-2.5 bg-forest-600 text-white font-medium rounded-lg hover:bg-forest-700 transition-colors"
            >
              Browse Modules
            </Link>
            <Link
              to="/glossary"
              className="inline-flex items-center px-5 py-2.5 bg-white text-sand-700 font-medium rounded-lg hover:bg-sand-50 border border-sand-200 transition-colors"
            >
              View Glossary
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
