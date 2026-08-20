import { useNavigate, useParams } from 'react-router-dom'
import { patients } from '../data/patients'
import '../App.css'

function PatientProfile() {
  const navigate = useNavigate()
  const { id } = useParams()

  const patient = patients.find((p) => p.id === Number(id))

  if (!patient) {
    return <div>Patient not found.</div>
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>

          <div>
            <h1>Scribes</h1>
            <span>Clinical Intelligence</span>
          </div>
        </div>

        <nav>
          <button
            className="nav-item"
            onClick={() => navigate('/')}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button className="nav-item active">
            <span>♙</span>
            Patients
          </button>

          <button className="nav-item">
            <span>◷</span>
            Encounters
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="doctor-avatar">JS</div>

          <div>
            <strong>Dr. John Smith</strong>
            <span>Internal Medicine</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <button
          className="back-button"
          onClick={() => navigate('/')}
        >
          ← Back to Dashboard
        </button>

        <section className="patient-header">
          <div>
            <p className="eyebrow">PATIENT PROFILE</p>
            <h2>{patient.name}</h2>

            <p className="subtitle">
              {patient.age} years old • {patient.sex} • {patient.patientId}
            </p>
          </div>

          <button className="new-encounter"
            onClick={() => navigate(`/patients/${patient.id}/encounter`)}
          >
            Start Encounter
          </button>
        </section>

        <section className="profile-grid">
          <div className="profile-card">
            <span className="profile-label">Active Conditions</span>

            {patient.conditions.map((condition) => (
              <strong key={condition}>{condition}</strong>
            ))}
          </div>

          <div className="profile-card">
            <span className="profile-label">Current Medications</span>

            {patient.medications.map((medication) => (
              <strong key={medication}>{medication}</strong>
            ))}
          </div>

          <div className="profile-card">
            <span className="profile-label">Allergies</span>

            {patient.allergies.map((allergy) => (
              <strong key={allergy}>{allergy}</strong>
            ))}
          </div>

          <div className="profile-card">
            <span className="profile-label">Last Visit</span>
            <strong>{patient.lastVisit}</strong>
          </div>
        </section>

        {patient.id === 1 && (
          <>
            <section className="clinical-section">
              <div className="section-heading profile-section-heading">
                <div>
                  <h3>Clinical Follow-Up</h3>
                  <p>
                    Outstanding items from previous encounters.
                  </p>
                </div>
              </div>

              <div className="follow-up-item">
                <div className="warning-icon">!</div>

                <div>
                  <strong>CBC</strong>
                  <span>
                    Ordered February 10, 2026 • No result found
                  </span>
                </div>
              </div>

              <div className="follow-up-item">
                <div className="warning-icon">!</div>

                <div>
                  <strong>Comprehensive Metabolic Panel</strong>
                  <span>
                    Ordered February 10, 2026 • No result found
                  </span>
                </div>
              </div>
            </section>

            <section className="clinical-section previous-encounter">
              <div className="section-heading profile-section-heading">
                <div>
                  <h3>Previous Encounter</h3>
                  <p>February 10, 2026</p>
                </div>
              </div>

              <div className="encounter-content">
                <div>
                  <span className="profile-label">Assessment</span>
                  <p>
                    Hypertension follow-up. Blood pressure remains
                    elevated and continued monitoring was recommended.
                  </p>
                </div>

                <div>
                  <span className="profile-label">Plan</span>

                  <ul>
                    <li>Continue Lisinopril 10 mg daily</li>
                    <li>CBC ordered</li>
                    <li>Comprehensive metabolic panel ordered</li>
                    <li>Follow up in 3 months</li>
                  </ul>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default PatientProfile