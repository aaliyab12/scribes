import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  Search,
  Users,
} from 'lucide-react'
import type { Patient } from '../data/patients'

function Patients() {
  const navigate = useNavigate()

  const [patients, setPatients] =
    useState<Patient[]>([])

  const [loading, setLoading] =
    useState(true)

  const [loadError, setLoadError] =
    useState('')
    
    const [searchQuery, setSearchQuery] =
  useState('')

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const response = await fetch(
          'http://127.0.0.1:8000/patients',
        )

        if (!response.ok) {
          throw new Error(
            'Unable to load patients.',
          )
        }

        const data: Patient[] =
          await response.json()

        setPatients(data)
      } catch (error) {
        console.error(
          'Patients fetch failed:',
          error,
        )

        setLoadError(
          'Unable to load patients.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadPatients()
  }, [])

  const filteredPatients =
  patients.filter((patient) => {
    const query =
      searchQuery.toLowerCase().trim()

    if (!query) {
      return true
    }

    return (
      patient.name
        .toLowerCase()
        .includes(query) ||
      patient.patientId
        .toLowerCase()
        .includes(query) ||
      patient.visitType
        .toLowerCase()
        .includes(query) ||
      patient.conditions.some(
        (condition) =>
          condition
            .toLowerCase()
            .includes(query),
      )
    )
  })

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
              <span>
                Clinical Intelligence
              </span>
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

            <button className="topbar-link">
              Encounters
            </button>

            <button
              className="topbar-link"
              onClick={() =>
                navigate('/documentation')
              }
            >
              Documentation
            </button>

            <button
              className="topbar-link disabled-nav"
              disabled
            >
              Review Queue
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
        <section className="review-title">
          <div>
            <span className="overline">
              PATIENT DIRECTORY
            </span>

            <h1>Patients</h1>

            <p>
              View patient information,
              clinical history, and upcoming
              encounters.
            </p>
          </div>
        </section>

<div
  className="surface"
  style={{
    marginBottom: '20px',
    padding: '14px 18px',
  }}
>
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    }}
  >
    <Search
      size={17}
      style={{
        flexShrink: 0,
        opacity: 0.55,
      }}
    />

    <input
      type="text"
      value={searchQuery}
      onChange={(event) =>
        setSearchQuery(
          event.target.value,
        )
      }
      placeholder="Search by patient name, ID, condition, or visit type"
      aria-label="Search patients"
      style={{
        width: '100%',
        border: 'none',
        outline: 'none',
        background: 'transparent',
        font: 'inherit',
        color: 'inherit',
      }}
    />
  </div>
</div>

        {loading && (
          <div className="surface">
            <div
              style={{
                padding: '40px 24px',
                textAlign: 'center',
              }}
            >
              Loading patients...
            </div>
          </div>
        )}

        {loadError && (
          <div className="surface">
            <div
              style={{
                padding: '40px 24px',
                textAlign: 'center',
              }}
            >
              {loadError}
            </div>
          </div>
        )}

        {!loading &&
          !loadError &&
          patients.length === 0 && (
            <div className="surface">
              <div
                style={{
                  padding: '60px 24px',
                  textAlign: 'center',
                }}
              >
                <Users
                  size={28}
                  style={{
                    marginBottom: '12px',
                  }}
                />

                <h3>
                  No patients found
                </h3>

                <p>
                  Patient records will
                  appear here.
                </p>
              </div>
            </div>
          )}

{!loading &&
  !loadError &&
  filteredPatients.length > 0 &&
  filteredPatients.length === 0 && (
    <div className="surface">
      <div
        style={{
          padding: '50px 24px',
          textAlign: 'center',
        }}
      >
        <Search
          size={26}
          style={{
            marginBottom: '12px',
          }}
        />

        <h3>No matching patients</h3>

        <p>
          Try searching by patient name,
          ID, condition, or visit type.
        </p>
      </div>
    </div>
  )}

        {!loading &&
          !loadError &&
          filteredPatients.length > 0 && (
            <div className="gap-list">
              {filteredPatients.map(
                (patient) => (
                  <article
                    className="gap-card"
                    key={patient.id}
                  >
                    <div className="gap-heading">
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <div className="doctor-avatar">
                          {patient.initials}
                        </div>

                        <div>
                          <span className="priority-label">
                            {patient.patientId}
                          </span>

                          <h4>
                            {patient.name}
                          </h4>
                        </div>
                      </div>

                      <span className="draft-chip">
                        {patient.status}
                      </span>
                    </div>

                    <div className="evidence-pair">
                      <div>
                        <span>
                          Patient
                        </span>

                        <p>
                          {patient.age} years ·{' '}
                          {patient.sex}
                        </p>
                      </div>

                      <div>
                        <span>
                          Visit
                        </span>

                        <p>
                          {patient.visitType}
                        </p>
                      </div>
                    </div>

                    <div className="evidence-pair">
                      <div>
                        <span>
                          Conditions
                        </span>

                        <p>
                          {patient.conditions
                            .length > 0
                            ? patient.conditions.join(
                                ', ',
                              )
                            : 'None documented'}
                        </p>
                      </div>

                      <div>
                        <span>
                          Appointment
                        </span>

                        <p>
                          {
                            patient.appointmentTime
                          }
                        </p>
                      </div>
                    </div>

                    <div className="gap-actions">
                      <button
                        className="soft-button"
                        onClick={() =>
                          navigate(
                            `/patients/${patient.id}`,
                          )
                        }
                      >
                        View Patient
                        <ArrowRight
                          size={14}
                        />
                      </button>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
      </main>
    </div>
  )
}

export default Patients