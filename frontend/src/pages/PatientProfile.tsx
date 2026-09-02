import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Clock3,
  Search,
  Stethoscope,
} from 'lucide-react'
import type { Patient } from '../data/patients'

function PatientProfile() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [loadingPatient, setLoadingPatient] = useState(true)
  const [patientError, setPatientError] = useState('')

  useEffect(() => {
    if (!id) {
      setPatientError('Patient not found.')
      setLoadingPatient(false)
      return
    }

    fetch(`http://127.0.0.1:8000/patients/${id}`)
      .then((response) => {
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Patient not found.')
          }

          throw new Error('Unable to load patient.')
        }

        return response.json()
      })
      .then((data: Patient) => {
        setPatient(data)
        setLoadingPatient(false)
      })
      .catch((error) => {
        console.error('Patient fetch failed:', error)

        setPatientError(
          error.message || 'Unable to load patient.'
        )

        setLoadingPatient(false)
      })
  }, [id])

  if (loadingPatient) {
    return (
      <div className="empty-page">
        Loading patient...
      </div>
    )
  }

  if (patientError || !patient) {
    return (
      <div className="empty-page">
        {patientError || 'Patient not found.'}
      </div>
    )
  }

  return (
    <div className="page-shell">
      <nav className="topbar">
        <div className="topbar-inner">
          <button
            className="brand-button"
            onClick={() => navigate('/')}
          >
            <div className="brand-mark">
              <Activity size={20} />
            </div>

            <div className="brand-text">
              <strong>Scribes</strong>
              <span>Clinical Intelligence</span>
            </div>
          </button>

          <div className="topbar-links">
            <button
              className="topbar-link"
              onClick={() => navigate('/')}
            >
              Dashboard
            </button>

            <button className="topbar-link active">
              Patients
            </button>

            <button
              className="topbar-link"
              onClick={() =>
                navigate(`/patients/${patient.id}/encounter`)
              }
            >
              Encounters
            </button>

            <button
              className="topbar-link disabled-nav"
              disabled
              title="Available once encounter documentation is stored"
            >
              Documentation
            </button>

            <button
              className="topbar-link disabled-nav"
              disabled
              title="Available once care gaps are stored"
            >
              Review Queue
              <span className="nav-badge">3</span>
            </button>
          </div>

          <div className="topbar-actions">
            <button
              className="round-button"
              aria-label="Search"
            >
              <Search size={17} />
            </button>

            <div className="doctor-profile">
              <div className="doctor-avatar">
                JS
              </div>

              <div>
                <strong>
                  Dr. John Smith
                </strong>

                <span>
                  Internal Medicine
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="content">
        <button
          className="back-link"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={15} />
          Dashboard
        </button>

        <section className="profile-heading">
          <div className="profile-identity">
            <div className="avatar patient-hero-avatar">
              {patient.initials}
            </div>

            <div>
              <span className="overline">
                PATIENT PROFILE
              </span>

              <h1>
                {patient.name}
              </h1>

              <p>
                {patient.age} years old · {patient.sex} ·{' '}
                {patient.patientId}
              </p>
            </div>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              navigate(`/patients/${patient.id}/encounter`)
            }
          >
            <Stethoscope size={17} />
            Start Encounter
          </button>
        </section>

        <section className="patient-summary">
          <div>
            <span className="field-label">
              Active Conditions
            </span>

            {patient.conditions.map((condition) => (
              <strong key={condition}>
                {condition}
              </strong>
            ))}
          </div>

          <div>
            <span className="field-label">
              Current Medications
            </span>

            {patient.medications.map((medication) => (
              <strong key={medication}>
                {medication}
              </strong>
            ))}
          </div>

          <div>
            <span className="field-label">
              Allergies
            </span>

            {patient.allergies.map((allergy) => (
              <strong key={allergy}>
                {allergy}
              </strong>
            ))}
          </div>

          <div>
            <span className="field-label">
              Last Visit
            </span>

            <strong>
              {patient.lastVisit}
            </strong>
          </div>
        </section>

        {patient.id === 1 && (
          <div className="profile-columns">
            <section className="surface">
              <div className="surface-heading">
                <div>
                  <h3>
                    Clinical Follow-Up
                  </h3>

                  <p>
                    Outstanding items from previous encounters.
                  </p>
                </div>

                <span className="count-badge">
                  2
                </span>
              </div>

              <div className="followup-list">
                <div className="followup-row">
                  <div className="priority-icon amber">
                    <AlertTriangle size={17} />
                  </div>

                  <div>
                    <strong>
                      CBC
                    </strong>

                    <span>
                      Ordered February 10, 2026 · No result found
                    </span>
                  </div>

                  <ChevronRight size={16} />
                </div>

                <div className="followup-row">
                  <div className="priority-icon amber">
                    <AlertTriangle size={17} />
                  </div>

                  <div>
                    <strong>
                      Comprehensive Metabolic Panel
                    </strong>

                    <span>
                      Ordered February 10, 2026 · No result found
                    </span>
                  </div>

                  <ChevronRight size={16} />
                </div>
              </div>
            </section>

            <section className="surface">
              <div className="surface-heading">
                <div>
                  <h3>
                    Previous Encounter
                  </h3>

                  <p>
                    February 10, 2026
                  </p>
                </div>

                <Clock3
                  size={18}
                  className="muted-icon"
                />
              </div>

              <div className="previous-note">
                <div>
                  <span className="field-label">
                    Assessment
                  </span>

                  <p>
                    Hypertension follow-up. Blood pressure remains
                    elevated and continued monitoring was recommended.
                  </p>
                </div>

                <div>
                  <span className="field-label">
                    Plan
                  </span>

                  <ul>
                    <li>
                      Continue Lisinopril 10 mg daily
                    </li>

                    <li>
                      CBC ordered
                    </li>

                    <li>
                      Comprehensive metabolic panel ordered
                    </li>

                    <li>
                      Follow up in 3 months
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default PatientProfile