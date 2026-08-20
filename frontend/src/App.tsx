import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import PatientProfile from './pages/PatientProfile'
import Encounter from './pages/Encounter'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/patients/:id"
          element={<PatientProfile />}
        />

        <Route
          path="/patients/:id/encounter"
          element={<Encounter />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App