import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
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
    type: string
    title: string
    level: string
  }[]
}

function ReviewQueue() {
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
            'Unable to load review queue.',
          )
        }

        const data: StoredEncounter[] =
          await response.json()

        setEncounters(data)
      } catch (error) {
        console.error(
          'Review queue fetch failed:',
          error,
        )

        setLoadError(
          'Unable to load review queue.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadEncounters()
  }, [])

  const reviewQueue =
    encounters.filter((encounter) => {
      return (
        encounter.status === 'draft' &&
        encounter.care_gaps.length > 0
      )
    })

  const unresolvedGapCount = (
    encounter: StoredEncounter,
  ) => {
    return encounter.care_gaps.filter(
      (gap) =>
        !encounter.reviewed_gap_ids.includes(
          gap.id,
        ) &&
        !encounter.dismissed_gap_ids.includes(
          gap.id,
        ),
    ).length
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

            <button
              className="topbar-link"
              onClick={() =>
                navigate('/encounters')
              }
            >
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

            <button className="topbar-link active">
              Review Queue

              {reviewQueue.length > 0 && (
                <span className="nav-badge">
                  {reviewQueue.length}
                </span>
              )}
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
              CLINICIAN REVIEW
            </span>

            <h1>Review Queue</h1>

            <p>
              Review encounters with potential
              care gaps requiring clinician
              attention.
            </p>
          </div>

          {!loading && !loadError && (
            <span className="draft-chip">
              {reviewQueue.length}{' '}
              {reviewQueue.length === 1
                ? 'encounter'
                : 'encounters'}{' '}
              pending
            </span>
          )}
        </section>

        {loading && (
          <div className="surface">
            <div
              style={{
                padding: '40px 24px',
                textAlign: 'center',
              }}
            >
              Loading review queue...
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
          reviewQueue.length === 0 && (
            <div className="surface">
              <div
                style={{
                  padding: '60px 24px',
                  textAlign: 'center',
                }}
              >
                <CheckCircle2
                  size={30}
                  style={{
                    marginBottom: '12px',
                  }}
                />

                <h3>
                  Review queue is clear
                </h3>

                <p>
                  There are no encounters
                  with care gaps currently
                  awaiting clinician review.
                </p>
              </div>
            </div>
          )}

        {!loading &&
          !loadError &&
          reviewQueue.length > 0 && (
            <div className="gap-list">
              {reviewQueue.map(
                (encounter) => {
                  const unresolved =
                    unresolvedGapCount(
                      encounter,
                    )

                  return (
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

                        <span className="draft-chip">
                          Needs Review
                        </span>
                      </div>

                      <div className="evidence-pair">
                        <div>
                          <span>
                            Potential Care Gaps
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
                            Unresolved
                          </span>

                          <p>{unresolved}</p>
                        </div>
                      </div>

                      <div className="evidence-pair">
                        <div>
                          <span>
                            Reviewed
                          </span>

                          <p>
                            {
                              encounter
                                .reviewed_gap_ids
                                .length
                            }
                          </p>
                        </div>

                        <div>
                          <span>
                            Dismissed
                          </span>

                          <p>
                            {
                              encounter
                                .dismissed_gap_ids
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
                          Review Encounter
                          <ArrowRight
                            size={14}
                          />
                        </button>
                      </div>
                    </article>
                  )
                },
              )}
            </div>
          )}
      </main>
    </div>
  )
}

export default ReviewQueue