import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import PatientProfile from './pages/PatientProfile'
import Encounter from './pages/Encounter'
import EncounterReview from './pages/EncounterReview'
import Documentation from './pages/Documentation'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/patients"
          element={<Patients />}
        />

        <Route
          path="/patients/:id"
          element={<PatientProfile />}
        />

        <Route
          path="/patients/:id/encounter"
          element={<Encounter />}
        />

        <Route
          path="/patients/:id/encounters/:encounterId/review"
          element={<EncounterReview />}
        />

        <Route
          path="/documentation"
          element={<Documentation />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App