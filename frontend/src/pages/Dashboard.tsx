import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ChevronRight,
  Clock3,
  FileText,
  Plus,
  Search,
} from 'lucide-react'
import type { Patient } from '../data/patients'

function Dashboard() {
  const navigate = useNavigate()

  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [patientError, setPatientError] = useState('')

  useEffect(() => {
    fetch('http://127.0.0.1:8000/patients')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch patients')
        }

        return response.json()
      })
      .then((data: Patient[]) => {
        setPatients(data)
        setLoadingPatients(false)
      })
      .catch((error) => {
        console.error('Patient fetch failed:', error)
        setPatientError('Unable to load patients.')
        setLoadingPatients(false)
      })
  }, [])

  const nextPatient = patients[0]

  return (
    <div className="page-shell">
      <nav className="topbar">
        <div className="topbar-inner">
          <button className="brand-button" onClick={() => navigate('/')}>
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
              className="topbar-link active"
              onClick={() => navigate('/')}
            >
              Dashboard
            </button>

            <button
              className="topbar-link"
              onClick={() => {
                document
                  .getElementById('patients')
                  ?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
              }}
            >
              Patients
            </button>

            <button
              className="topbar-link"
              onClick={() => {
                document
                  .getElementById('patients')
                  ?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
              }}
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
            <button className="round-button" aria-label="Search">
              <Search size={17} />
            </button>

            <div className="doctor-profile">
              <div className="doctor-avatar">JS</div>

              <div>
                <strong>Dr. John Smith</strong>
                <span>Internal Medicine</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="content">
        <section className="welcome-row">
          <div>
            <span className="overline">
              WEDNESDAY, AUGUST 26
            </span>

            <h1>Good afternoon, Dr. Smith.</h1>

            <p>
              Here’s what needs your attention today.
            </p>
          </div>

          <button className="primary-button">
            <Plus size={17} />
            New Encounter
          </button>
        </section>

        {loadingPatients ? (
          <section className="next-patient-banner">
            <p>Loading patient information...</p>
          </section>
        ) : patientError ? (
          <section className="next-patient-banner">
            <p>{patientError}</p>
          </section>
        ) : nextPatient ? (
          <section className="next-patient-banner">
            <div className="next-patient-copy">
              <span className="overline teal">
                NEXT PATIENT
              </span>

              <div className="next-person">
                <div className="avatar avatar-large">
                  {nextPatient.initials}
                </div>

                <div>
                  <div className="title-with-status">
                    <h2>{nextPatient.name}</h2>

                    <span className="status-pill ready">
                      <span />
                      Ready
                    </span>
                  </div>

                  <p>
                    {nextPatient.age} years old ·{' '}
                    {nextPatient.visitType}
                  </p>

                  <div className="inline-meta">
                    <span>
                      <Clock3 size={14} />
                      {nextPatient.appointmentTime}
                    </span>

                    <span className="warning-text">
                      <AlertTriangle size={14} />
                      3 items require review
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              className="secondary-button"
              onClick={() =>
                navigate(`/patients/${nextPatient.id}`)
              }
            >
              Review Patient
              <ChevronRight size={16} />
            </button>
          </section>
        ) : null}

        <div className="dashboard-columns">
          <section
            className="surface schedule-surface"
            id="patients"
          >
            <div className="surface-heading">
              <div>
                <h3>Today’s Schedule</h3>

                <p>
                  {loadingPatients
                    ? 'Loading appointments...'
                    : `${patients.length} appointments scheduled`}
                </p>
              </div>

              <button className="text-action">
                View all
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="patient-rows">
              {loadingPatients ? (
                <p>Loading patients...</p>
              ) : patientError ? (
                <p>{patientError}</p>
              ) : (
                patients.map((patient) => (
                  <button
                    key={patient.id}
                    className="patient-row"
                    onClick={() =>
                      navigate(`/patients/${patient.id}`)
                    }
                  >
                    <span className="appointment-time">
                      {patient.appointmentTime}
                    </span>

                    <div className="avatar">
                      {patient.initials}
                    </div>

                    <div className="patient-row-copy">
                      <div>
                        <strong>{patient.name}</strong>

                        {patient.status === 'Ready' && (
                          <span className="mini-ready">
                            Ready
                          </span>
                        )}
                      </div>

                      <span>
                        {patient.age} years ·{' '}
                        {patient.visitType}
                      </span>
                    </div>

                    <div className="row-link">
                      Review
                      <ChevronRight size={16} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="surface priority-surface">
            <div className="surface-heading">
              <div>
                <h3>Priority Review</h3>
                <p>Items needing attention</p>
              </div>

              <span className="count-badge">3</span>
            </div>

            <div className="priority-list">
              <button
                className="priority-row"
                onClick={() => navigate('/patients/1')}
              >
                <div className="priority-icon danger">
                  <AlertTriangle size={17} />
                </div>

                <div>
                  <span className="priority-label">
                    MEDICATION DISCREPANCY
                  </span>

                  <strong>Maria Lopez</strong>

                  <p>
                    Reported medication status differs from
                    the active chart.
                  </p>
                </div>

                <ChevronRight
                  className="hover-arrow"
                  size={16}
                />
              </button>

              <button
                className="priority-row"
                onClick={() => navigate('/patients/1')}
              >
                <div className="priority-icon amber">
                  <FileText size={17} />
                </div>

                <div>
                  <span className="priority-label">
                    OUTSTANDING LABS
                  </span>

                  <strong>Maria Lopez</strong>

                  <p>
                    Two previously ordered tests have no
                    recorded results.
                  </p>
                </div>

                <ChevronRight
                  className="hover-arrow"
                  size={16}
                />
              </button>

              <button
                className="priority-row"
                onClick={() => navigate('/patients/1')}
              >
                <div className="priority-icon blue">
                  <Clock3 size={17} />
                </div>

                <div>
                  <span className="priority-label">
                    FOLLOW-UP TIMING
                  </span>

                  <strong>Maria Lopez</strong>

                  <p>
                    Previous follow-up recommendation appears
                    overdue.
                  </p>
                </div>

                <ChevronRight
                  className="hover-arrow"
                  size={16}
                />
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Dashboard