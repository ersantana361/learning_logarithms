import { Routes, Route } from 'react-router-dom'
import Layout from '@components/layout/Layout'
import Home from '@pages/Home'
import ModuleOverview from '@pages/ModuleOverview'
import ModuleDetail from '@pages/ModuleDetail'
import LessonView from '@pages/LessonView'
import ExercisePage from '@pages/ExercisePage'
import Dashboard from '@pages/Dashboard'
import Glossary from '@pages/Glossary'
import Resources from '@pages/Resources'
import NotFound from '@pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="modules" element={<ModuleOverview />} />
        <Route path="modules/:moduleId" element={<ModuleDetail />} />
        <Route path="modules/:moduleId/lessons/:lessonId" element={<LessonView />} />
        <Route path="modules/:moduleId/exercises" element={<ExercisePage />} />
        <Route path="modules/:moduleId/exercises/:exerciseType" element={<ExercisePage />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="glossary" element={<Glossary />} />
        <Route path="resources" element={<Resources />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
