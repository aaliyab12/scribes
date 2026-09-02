import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import PatientProfile from './pages/PatientProfile'
import Encounter from './pages/Encounter'
import EncounterReview from './pages/EncounterReview'
import { useEffect } from 'react'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients/:id" element={<PatientProfile />} />
        <Route
          path="/patients/:id/encounter"
          element={<Encounter />}
        />
        <Route
          path="/patients/:id/encounter/review"
          element={<EncounterReview />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App