import MathDisplay, { MathBlock, MathWithExplanation } from './MathDisplay'
import {
  LogarithmicNumberLine,
  ExponentialLogConverter,
  CompressionDemo,
  BacteriaDoublingVisualization,
  CompoundInterestConvergence,
  LogPropertiesVisualizer,
  LogScaleTransformer
} from '@components/visualizations/module-1'
import { PHSpectrum, HydrogenIonCalculator, OceanAcidificationChart } from '@components/visualizations/module-2'
import { PopulationGrowthSimulator, LinearVsLogScale, BacterialGrowthCurve } from '@components/visualizations/module-3'
import { DrugConcentrationCurve, MultiDoseSimulator, TherapeuticWindow } from '@components/visualizations/module-4'
import { LogLogPlotBuilder, SpeciesComparison } from '@components/visualizations/module-5'
import { DecibelDemo } from '@components/visualizations/module-6'
import { EnzymeKineticsCurve } from '@components/visualizations/module-7'
import { SpeciesAreaExplorer } from '@components/visualizations/module-8'

// Map visualization component names to actual components
const visualizationComponents = {
  // Module 1
  LogarithmicNumberLine,
  ExponentialLogConverter,
  CompressionDemo,
  BacteriaDoublingVisualization,
  CompoundInterestConvergence,
  LogPropertiesVisualizer,
  LogScaleTransformer,
  // Module 2
  PHSpectrum,
  HydrogenIonCalculator,
  OceanAcidificationChart,
  // Module 3
  PopulationGrowthSimulator,
  LinearVsLogScale,
  BacterialGrowthCurve,
  // Module 4
  DrugConcentrationCurve,
  MultiDoseSimulator,
  TherapeuticWindow,
  // Module 5
  LogLogPlotBuilder,
  SpeciesComparison,
  // Module 6
  DecibelDemo,
  // Module 7
  EnzymeKineticsCurve,
  // Module 8
  SpeciesAreaExplorer
}

/**
 * Renders lesson content based on section type
 */
export default function LessonContent({ sections }) {
  if (!sections || sections.length === 0) {
    return <PlaceholderContent />
  }

  return (
    <div className="lesson-content space-y-8">
      {sections.map((section, index) => (
        <SectionRenderer key={index} section={section} />
      ))}
    </div>
  )
}

function SectionRenderer({ section }) {
  switch (section.type) {
    case 'narrative':
      return <NarrativeSection content={section.content} />
    case 'math':
      return <MathSection equation={section.equation} explanation={section.explanation} />
    case 'definition':
      return <DefinitionSection term={section.term} definition={section.definition} />
    case 'visualization':
      return <VisualizationSection component={section.component} />
    case 'keyPoint':
      return <KeyPointsSection points={section.points} />
    case 'example':
      return <ExampleSection title={section.title} examples={section.examples} />
    case 'property':
      return <PropertySection {...section} />
    case 'comparison':
      return <ComparisonSection title={section.title} items={section.items} />
    case 'practice':
      return <PracticeSection {...section} />
    case 'application':
      return <ApplicationSection title={section.title} content={section.content} />
    default:
      return null
  }
}

function NarrativeSection({ content }) {
  // Simple markdown-like parsing for bold text
  const parseContent = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-sand-900">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  return (
    <p className="text-sand-700 leading-relaxed text-lg">
      {parseContent(content)}
    </p>
  )
}

function MathSection({ equation, explanation }) {
  return (
    <MathWithExplanation math={equation} explanation={explanation} />
  )
}

function DefinitionSection({ term, definition }) {
  return (
    <div className="bg-ocean-50 border-l-4 border-ocean-500 rounded-r-lg p-5">
      <div className="flex items-start gap-3">
        <svg className="w-6 h-6 text-ocean-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <div>
          <h4 className="font-serif font-semibold text-ocean-800 text-lg mb-1">{term}</h4>
          <p className="text-ocean-700">{definition}</p>
        </div>
      </div>
    </div>
  )
}

function VisualizationSection({ component }) {
  const Component = visualizationComponents[component]

  if (!Component) {
    return (
      <div className="bg-sand-100 rounded-xl p-8 text-center">
        <p className="text-sand-500">Visualization: {component}</p>
      </div>
    )
  }

  return (
    <div className="my-8">
      <Component />
    </div>
  )
}

function KeyPointsSection({ points }) {
  return (
    <div className="bg-forest-50 rounded-xl p-6 border border-forest-200">
      <h4 className="font-serif font-semibold text-forest-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Key Points
      </h4>
      <ul className="space-y-2">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-3 text-forest-700">
            <span className="w-6 h-6 rounded-full bg-forest-200 text-forest-700 flex items-center justify-center text-sm font-medium shrink-0">
              {i + 1}
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ExampleSection({ title, examples }) {
  return (
    <div className="bg-white rounded-xl border border-sand-200 overflow-hidden">
      <div className="bg-sand-50 px-5 py-3 border-b border-sand-200">
        <h4 className="font-serif font-semibold text-sand-800">{title}</h4>
      </div>
      <div className="divide-y divide-sand-100">
        {examples.map((example, i) => (
          <div key={i} className="p-5">
            <div className="flex flex-wrap gap-4 items-center mb-2">
              <div className="font-mono text-ocean-600 bg-ocean-50 px-3 py-1 rounded">
                {example.exponential}
              </div>
              <svg className="w-5 h-5 text-sand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <div className="font-mono text-forest-600 bg-forest-50 px-3 py-1 rounded">
                {example.logarithmic}
              </div>
            </div>
            {example.note && (
              <p className="text-sm text-sand-500 italic">{example.note}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function PropertySection({ name, formula, explanation, example }) {
  return (
    <div className="bg-white rounded-xl border border-sand-200 p-6">
      <h4 className="font-serif font-semibold text-sand-900 text-lg mb-3">{name}</h4>
      <div className="flex justify-center mb-4">
        <div className="bg-sand-50 px-6 py-3 rounded-lg">
          <MathDisplay math={formula} block />
        </div>
      </div>
      <p className="text-sand-600 mb-4">{explanation}</p>
      {example && (
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <span className="text-sm font-medium text-amber-800">Example: </span>
          <span className="text-amber-700">{example}</span>
        </div>
      )}
    </div>
  )
}

function ComparisonSection({ title, items }) {
  return (
    <div className="bg-white rounded-xl border border-sand-200 overflow-hidden">
      <div className="bg-sand-50 px-5 py-3 border-b border-sand-200">
        <h4 className="font-serif font-semibold text-sand-800">{title}</h4>
      </div>
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-sand-200">
        {items.map((item, i) => (
          <div key={i} className="p-5">
            <h5 className="font-semibold text-sand-800 mb-3">{item.type}</h5>
            <ul className="space-y-1 mb-3">
              {item.uses.map((use, j) => (
                <li key={j} className="text-sm text-sand-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-forest-500"></span>
                  {use}
                </li>
              ))}
            </ul>
            <p className="text-sm text-sand-500 italic">{item.reason}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PracticeSection({ question, answer, hint }) {
  return (
    <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
      <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Quick Check
      </h4>
      <p className="text-amber-900 mb-3">{question}</p>
      <details className="text-sm">
        <summary className="cursor-pointer text-amber-700 hover:text-amber-800 font-medium">
          Show hint
        </summary>
        <p className="mt-2 text-amber-600 pl-4 border-l-2 border-amber-300">{hint}</p>
      </details>
      <details className="text-sm mt-2">
        <summary className="cursor-pointer text-amber-700 hover:text-amber-800 font-medium">
          Show answer
        </summary>
        <p className="mt-2 text-amber-800 font-mono pl-4 border-l-2 border-amber-300">{answer}</p>
      </details>
    </div>
  )
}

function ApplicationSection({ title, content }) {
  return (
    <div className="bg-gradient-to-r from-forest-50 to-ocean-50 rounded-xl p-6 border border-sand-200">
      <h4 className="font-serif font-semibold text-sand-900 mb-2 flex items-center gap-2">
        <svg className="w-5 h-5 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        {title}
      </h4>
      <p className="text-sand-700">{content}</p>
    </div>
  )
}

function PlaceholderContent() {
  return (
    <div className="bg-sand-50 rounded-xl p-8 text-center border-2 border-dashed border-sand-200">
      <svg className="w-12 h-12 mx-auto text-sand-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 className="text-lg font-semibold text-sand-700 mb-2">Lesson Content</h3>
      <p className="text-sand-500">
        Full lesson content will be displayed here with interactive elements.
      </p>
    </div>
  )
}
