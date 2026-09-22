import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  FileText,
  Search,
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

function Documentation() {
  const navigate = useNavigate()

  const [encounters, setEncounters] =
    useState<StoredEncounter[]>([])

  const [loading, setLoading] =
    useState(true)

  const [loadError, setLoadError] =
    useState('')

  useEffect(() => {
    const loadEncounters = async () => {
      try {
        const response = await fetch(
          'http://127.0.0.1:8000/encounters',
        )

        if (!response.ok) {
          throw new Error(
            'Unable to load documentation.',
          )
        }

        const data: StoredEncounter[] =
          await response.json()

        setEncounters(data)
      } catch (error) {
        console.error(
          'Documentation fetch failed:',
          error,
        )

        setLoadError(
          'Unable to load documentation.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadEncounters()
  }, [])

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
            onClick={() => navigate('/patients')}
            >
                Patients
            </button>

            <button className="topbar-link">
              Encounters
            </button>

            <button className="topbar-link active">
              Documentation
            </button>

            <button className="topbar-link">
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
              CLINICAL DOCUMENTATION
            </span>

            <h1>Documentation</h1>

            <p>
              Review generated documentation
              from recorded encounters.
            </p>
          </div>
        </section>

        {loading && (
          <div className="surface">
            <div
              style={{
                padding: '40px 24px',
                textAlign: 'center',
              }}
            >
              Loading documentation...
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
                <FileText
                  size={28}
                  style={{
                    marginBottom: '12px',
                  }}
                />

                <h3>
                  No documentation yet
                </h3>

                <p>
                  Completed encounters will
                  appear here for review.
                </p>
              </div>
            </div>
          )}

        {!loading &&
          !loadError &&
          encounters.length > 0 && (
            <div className="gap-list">
              {encounters.map(
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
                          Encounter Duration
                        </span>

                        <p>
                          {formatDuration(
                            encounter.duration,
                          )}
                        </p>
                      </div>

                      <div>
                        <span>
                          Care Gaps
                        </span>

                        <p>
                          {
                            encounter
                              .care_gaps
                              .length
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
                        Open Documentation
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

export default Documentation