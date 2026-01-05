# Learning Logarithms

An interactive educational platform teaching logarithms through real-world biological applications.

## Overview

This web application makes logarithms accessible and meaningful by connecting mathematical concepts to fascinating biological phenomena - from the pH of ocean water to how drug dosages work in your body.

## Features

- **8 Learning Modules** covering logarithms in biology:
  1. Introduction to Logarithms
  2. The pH Scale & Ocean Acidification
  3. Population Growth & Bacterial Dynamics
  4. Pharmacokinetics & Drug Dosing
  5. Allometric Scaling & Power Laws
  6. Decibels & Sound Intensity
  7. Enzyme Kinetics
  8. Species-Area Relationships

- **Interactive D3.js Visualizations** - Explore concepts through dynamic, hands-on graphics
- **Practice Exercises** - Reinforce learning with hints and detailed solutions
- **Progress Tracking** - Your progress is saved locally as you learn
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- React 19 + Vite
- D3.js for data visualizations
- Tailwind CSS v4 for styling
- KaTeX for mathematical equations
- LocalStorage for progress persistence

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone git@github.com:ersantana361/learning_logarithms.git
cd learning_logarithms

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── assets/data/       # Module content (lessons, exercises)
├── components/
│   ├── layout/        # Header, Footer, Layout
│   ├── learning/      # LessonContent, MathDisplay, ModuleCard
│   └── visualizations/# D3.js interactive components (by module)
├── contexts/          # ProgressContext, ThemeContext
├── hooks/             # useLocalStorage, useD3
└── pages/             # Route components
```

## License

MIT
