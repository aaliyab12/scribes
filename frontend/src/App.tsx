import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import PatientProfile from './pages/PatientProfile'

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
      </Routes>
    </BrowserRouter>
  )
}

export default App