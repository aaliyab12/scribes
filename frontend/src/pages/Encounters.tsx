import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  Search,
  Stethoscope,
} from 'lucide-react'

type StoredEncounter = {
  encounter_id: string
  patient_id: number
  patient: string
  duration: number
  created_at: string
  transcript_entries: number
  status: 'draft' | 'approved'
  reviewed_gap_ids: number[]
  dismissed_gap_ids: number[]
  care_gaps: {
    id: number
  }[]
}

function Encounters() {
  const navigate = useNavigate()

  const [encounters, setEncounters] =
    useState<StoredEncounter[]>([])

  const [loading, setLoading] =
    useState(true)

  const [loadError, setLoadError] =
    useState('')

  const [searchQuery, setSearchQuery] =
    useState('')

  useEffect(() => {
    const loadEncounters = async () => {
      try {
        const response = await fetch(
          'http://127.0.0.1:8000/encounters',
        )

        if (!response.ok) {
          throw new Error(
            'Unable to load encounters.',
          )
        }

        const data: StoredEncounter[] =
          await response.json()

        setEncounters(data)
      } catch (error) {
        console.error(
          'Encounters fetch failed:',
          error,
        )

        setLoadError(
          'Unable to load encounters.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadEncounters()
  }, [])

  const filteredEncounters =
    encounters.filter((encounter) => {
      const query =
        searchQuery.toLowerCase().trim()

      if (!query) {
        return true
      }

      return (
        encounter.patient
          .toLowerCase()
          .includes(query) ||
        encounter.status
          .toLowerCase()
          .includes(query)
      )
    })

  const formatDuration = (
    totalSeconds: number,
  ) => {
    const minutes = Math.floor(
      totalSeconds / 60,
    )
      .toString()
      .padStart(2, '0')

    const seconds = (
      totalSeconds % 60
    )
      .toString()
      .padStart(2, '0')

    return `${minutes}:${seconds}`
  }

  const formatDate = (
    createdAt: string,
  ) => {
    const date = new Date(createdAt)

    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
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

            <button
              className="topbar-link"
              onClick={() =>
                navigate('/patients')
              }
            >
              Patients
            </button>

            <button className="topbar-link active">
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
            className="topbar-link"
            onClick={() => navigate('/review-queue')}
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
              ENCOUNTER HISTORY
            </span>

            <h1>Encounters</h1>

            <p>
              View recorded patient encounters
              and their review status.
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
              placeholder="Search by patient name or review status"
              aria-label="Search encounters"
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
              Loading encounters...
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
          encounters.length === 0 && (
            <div className="surface">
              <div
                style={{
                  padding: '60px 24px',
                  textAlign: 'center',
                }}
              >
                <Stethoscope
                  size={28}
                  style={{
                    marginBottom: '12px',
                  }}
                />

                <h3>
                  No encounters yet
                </h3>

                <p>
                  Recorded patient encounters
                  will appear here.
                </p>
              </div>
            </div>
          )}

        {!loading &&
          !loadError &&
          encounters.length > 0 &&
          filteredEncounters.length === 0 && (
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

                <h3>
                  No matching encounters
                </h3>

                <p>
                  Try searching by patient
                  name or review status.
                </p>
              </div>
            </div>
          )}

        {!loading &&
          !loadError &&
          filteredEncounters.length > 0 && (
            <div className="gap-list">
              {filteredEncounters.map(
                (encounter) => (
                  <article
                    className="gap-card"
                    key={
                      encounter.encounter_id
                    }
                  >
                    <div className="gap-heading">
                      <div>
                        <span className="priority-label">
                          {formatDate(
                            encounter.created_at,
                          )}
                        </span>

                        <h4>
                          {encounter.patient}
                        </h4>
                      </div>

                      <span
                        className={
                          encounter.status ===
                          'approved'
                            ? 'draft-chip approved'
                            : 'draft-chip'
                        }
                      >
                        {encounter.status ===
                        'approved'
                          ? 'Approved'
                          : 'Draft'}
                      </span>
                    </div>

                    <div className="evidence-pair">
                      <div>
                        <span>
                          Duration
                        </span>

                        <p>
                          {formatDuration(
                            encounter.duration,
                          )}
                        </p>
                      </div>

                      <div>
                        <span>
                          Transcript
                        </span>

                        <p>
                          {
                            encounter
                              .transcript_entries
                          }{' '}
                          entries
                        </p>
                      </div>
                    </div>

                    <div className="evidence-pair">
                      <div>
                        <span>
                          Care Gaps
                        </span>

                        <p>
                          {
                            encounter
                              .care_gaps.length
                          }
                        </p>
                      </div>

                      <div>
                        <span>
                          Reviewed
                        </span>

                        <p>
                          {
                            encounter
                              .reviewed_gap_ids
                              .length
                          }{' '}
                          of{' '}
                          {
                            encounter
                              .care_gaps.length
                          }
                        </p>
                      </div>
                    </div>

                    <div className="gap-actions">
                      <button
                        className="soft-button"
                        onClick={() =>
                          navigate(
                            `/patients/${encounter.patient_id}/encounters/${encounter.encounter_id}/review`,
                          )
                        }
                      >
                        View Encounter
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

export default Encounters