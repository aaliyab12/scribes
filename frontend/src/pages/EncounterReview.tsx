import { useEffect, useState } from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  Activity,
  ArrowLeft,
  Check,
  Search,
} from 'lucide-react'
import type { Patient } from '../data/patients'

type ReviewTab = 'soap' | 'gaps' | 'transcript'

type TranscriptEntry = {
  speaker: 'Doctor' | 'Patient'
  text: string
}

type SoapNote = {
  subjective: string
  objective: string
  assessment: string
  plan: string[]
}

type CareGap = {
  id: number
  type: string
  title: string
  leftLabel: string
  left: string
  rightLabel: string
  right: string
  reason: string
  level: string
}

type StoredEncounter = {
  encounter_id: string
  patient_id: number
  patient: string
  duration: number
  created_at: string
  transcript_entries: number
  transcript: TranscriptEntry[]
  soap_note: SoapNote
  care_gaps: CareGap[]
  status: string
}

function EncounterReview() {
  const navigate = useNavigate()

  const {
    id,
    encounterId,
  } = useParams()

  const [patient, setPatient] =
    useState<Patient | null>(null)

  const [encounter, setEncounter] =
    useState<StoredEncounter | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [loadError, setLoadError] =
    useState('')

  const [activeTab, setActiveTab] =
    useState<ReviewTab>('soap')

  const [reviewed, setReviewed] =
    useState<number[]>([])

  const [dismissed, setDismissed] =
    useState<number[]>([])

  const [approved, setApproved] =
    useState(false)

  useEffect(() => {
    if (!id || !encounterId) {
      setLoadError(
        'Encounter information is missing.',
      )
      setLoading(false)
      return
    }

    const loadReview = async () => {
      try {
        const [
          patientResponse,
          encounterResponse,
        ] = await Promise.all([
          fetch(
            `http://127.0.0.1:8000/patients/${id}`,
          ),
          fetch(
            `http://127.0.0.1:8000/encounters/${encounterId}`,
          ),
        ])

        if (!patientResponse.ok) {
          throw new Error(
            'Unable to load patient.',
          )
        }

        if (!encounterResponse.ok) {
          if (
            encounterResponse.status === 404
          ) {
            throw new Error(
              'Encounter not found.',
            )
          }

          throw new Error(
            'Unable to load encounter.',
          )
        }

        const patientData: Patient =
          await patientResponse.json()

        const encounterData: StoredEncounter =
          await encounterResponse.json()

        if (
          encounterData.patient_id !==
          patientData.id
        ) {
          throw new Error(
            'Encounter does not belong to this patient.',
          )
        }

        setPatient(patientData)
        setEncounter(encounterData)
      } catch (error) {
        console.error(
          'Encounter review fetch failed:',
          error,
        )

        if (error instanceof Error) {
          setLoadError(error.message)
        } else {
          setLoadError(
            'Unable to load encounter review.',
          )
        }
      } finally {
        setLoading(false)
      }
    }

    loadReview()
  }, [id, encounterId])

  if (loading) {
    return (
      <div className="empty-page">
        Loading encounter...
      </div>
    )
  }

  if (
    loadError ||
    !patient ||
    !encounter
  ) {
    return (
      <div className="empty-page">
        {loadError ||
          'Unable to load encounter.'}
      </div>
    )
  }

  const transcript =
    encounter.transcript

  const duration =
    encounter.duration

  const soapNote =
    encounter.soap_note

  const careGaps =
    encounter.care_gaps

  const formatDuration = (
    totalSeconds: number,
  ) => {
    const minutes = Math.floor(
      totalSeconds / 60,
    )
      .toString()
      .padStart(2, '0')

    const remaining = (
      totalSeconds % 60
    )
      .toString()
      .padStart(2, '0')

    return `${minutes}:${remaining}`
  }

  const markReviewed = (
    gap: number,
  ) => {
    setReviewed((current) => [
      ...new Set([
        ...current,
        gap,
      ]),
    ])

    setDismissed((current) =>
      current.filter(
        (item) => item !== gap,
      ),
    )
  }

  const dismiss = (
    gap: number,
  ) => {
    setDismissed((current) => [
      ...new Set([
        ...current,
        gap,
      ]),
    ])

    setReviewed((current) =>
      current.filter(
        (item) => item !== gap,
      ),
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
                navigate(
                  `/patients/${patient.id}`,
                )
              }
            >
              Patients
            </button>

            <button className="topbar-link active">
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

              <span className="nav-badge">
                {careGaps.length}
              </span>
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
          onClick={() =>
            navigate(
              `/patients/${patient.id}`,
            )
          }
        >
          <ArrowLeft size={15} />
          {patient.name}
        </button>

        <section className="review-title">
          <div>
            <span className="overline">
              ENCOUNTER REVIEW
            </span>

            <h1>{patient.name}</h1>

            <p>
              {patient.visitType} ·
              {' '}Recorded duration{' '}
              {formatDuration(duration)}
            </p>
          </div>

          <span
            className={
              approved
                ? 'draft-chip approved'
                : 'draft-chip'
            }
          >
            {approved ? (
              <>
                <Check size={14} />
                Approved
              </>
            ) : (
              'Draft for clinician review'
            )}
          </span>
        </section>

        {transcript.length === 0 && (
          <div className="surface">
            <div className="surface-heading">
              <div>
                <h3>
                  No encounter transcript
                  available
                </h3>

                <p>
                  No transcript was stored for
                  this encounter.
                </p>
              </div>
            </div>
          </div>
        )}

        {transcript.length > 0 && (
          <>
            <div className="review-tabs">
              <button
                className={
                  activeTab === 'soap'
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setActiveTab('soap')
                }
              >
                SOAP Note
              </button>

              <button
                className={
                  activeTab === 'gaps'
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setActiveTab('gaps')
                }
              >
                Care Gaps
                <span>
                  {careGaps.length}
                </span>
              </button>

              <button
                className={
                  activeTab === 'transcript'
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setActiveTab('transcript')
                }
              >
                Transcript
              </button>
            </div>

            {activeTab === 'soap' && (
              <section className="surface review-surface">
                <div className="surface-heading">
                  <div>
                    <h3>
                      Generated SOAP Note
                    </h3>

                    <p>
                      Prototype draft based
                      only on the recorded
                      portion of this
                      encounter.
                    </p>
                  </div>
                </div>

                <div className="soap-note">
                  <div className="soap-row">
                    <div className="soap-letter">
                      S
                    </div>

                    <div>
                      <h4>Subjective</h4>
                      <p>
                        {soapNote.subjective}
                      </p>
                    </div>
                  </div>

                  <div className="soap-row">
                    <div className="soap-letter">
                      O
                    </div>

                    <div>
                      <h4>Objective</h4>
                      <p>
                        {soapNote.objective}
                      </p>
                    </div>
                  </div>

                  <div className="soap-row">
                    <div className="soap-letter">
                      A
                    </div>

                    <div>
                      <h4>Assessment</h4>
                      <p>
                        {soapNote.assessment}
                      </p>
                    </div>
                  </div>

                  <div className="soap-row">
                    <div className="soap-letter">
                      P
                    </div>

                    <div>
                      <h4>Plan</h4>

                      <ul>
                        {soapNote.plan.map(
                          (planItem) => (
                            <li
                              key={planItem}
                            >
                              {planItem}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'gaps' && (
              <section className="surface review-surface">
                <div className="surface-heading">
                  <div>
                    <h3>
                      Potential Care Gaps
                    </h3>

                    <p>
                      Prototype rules applied
                      only to information
                      actually captured during
                      this encounter.
                    </p>
                  </div>

                  <span className="count-badge">
                    {careGaps.length}
                  </span>
                </div>

                {careGaps.length === 0 ? (
                  <div
                    style={{
                      padding:
                        '40px 24px',
                      textAlign: 'center',
                      color: '#73818a',
                      fontSize: '11px',
                    }}
                  >
                    No potential care gaps
                    were detected from the
                    recorded portion of this
                    encounter.
                  </div>
                ) : (
                  <div className="gap-list">
                    {careGaps.map(
                      (gap) => (
                        <article
                          key={gap.id}
                          className={
                            dismissed.includes(
                              gap.id,
                            )
                              ? 'gap-card dismissed'
                              : reviewed.includes(
                                    gap.id,
                                  )
                                ? 'gap-card reviewed'
                                : 'gap-card'
                          }
                        >
                          <div className="gap-heading">
                            <div>
                              <span className="priority-label">
                                {gap.type}
                              </span>

                              <h4>
                                {gap.title}
                              </h4>
                            </div>

                            <span
                              className={
                                gap.level.startsWith(
                                  'High',
                                )
                                  ? 'confidence-chip high'
                                  : 'confidence-chip medium'
                              }
                            >
                              {gap.level}
                            </span>
                          </div>

                          <div className="evidence-pair">
                            <div>
                              <span>
                                {gap.leftLabel}
                              </span>

                              <p>
                                {gap.left}
                              </p>
                            </div>

                            <div>
                              <span>
                                {gap.rightLabel}
                              </span>

                              <p>
                                {gap.right}
                              </p>
                            </div>
                          </div>

                          <div className="why">
                            <strong>
                              Why this was
                              flagged
                            </strong>

                            <p>
                              {gap.reason}
                            </p>
                          </div>

                          <div className="gap-actions">
                            {dismissed.includes(
                              gap.id,
                            ) ? (
                              <span className="resolved-text">
                                Dismissed
                              </span>
                            ) : reviewed.includes(
                                gap.id,
                              ) ? (
                              <span className="resolved-text">
                                <Check
                                  size={14}
                                />
                                Reviewed
                              </span>
                            ) : (
                              <>
                                <button
                                  className="ghost-button small"
                                  onClick={() =>
                                    dismiss(
                                      gap.id,
                                    )
                                  }
                                >
                                  Dismiss
                                </button>

                                <button
                                  className="soft-button"
                                  onClick={() =>
                                    markReviewed(
                                      gap.id,
                                    )
                                  }
                                >
                                  Mark Reviewed
                                </button>
                              </>
                            )}
                          </div>
                        </article>
                      ),
                    )}
                  </div>
                )}
              </section>
            )}

            {activeTab ===
              'transcript' && (
              <section className="surface review-surface">
                <div className="surface-heading">
                  <div>
                    <h3>
                      Encounter Transcript
                    </h3>

                    <p>
                      Stored transcript from
                      this encounter.
                    </p>
                  </div>

                  <span className="subtle-counter">
                    {transcript.length}{' '}
                    entries
                  </span>
                </div>

                <div className="transcript-body review-transcript">
                  {transcript.map(
                    (entry, index) => (
                      <div
                        className="transcript-line"
                        key={`${entry.speaker}-${index}`}
                      >
                        <div
                          className={
                            entry.speaker ===
                            'Doctor'
                              ? 'speaker-avatar doctor'
                              : 'speaker-avatar patient'
                          }
                        >
                          {entry.speaker ===
                          'Doctor'
                            ? 'DR'
                            : 'PT'}
                        </div>

                        <div>
                          <strong>
                            {entry.speaker ===
                            'Doctor'
                              ? 'Dr. John Smith'
                              : patient.name}
                          </strong>

                          <p>
                            {entry.text}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </section>
            )}
          </>
        )}

        <div className="bottom-actions">
          <button
            className="ghost-button"
            onClick={() =>
              navigate(
                `/patients/${patient.id}`,
              )
            }
          >
            Return to Patient
          </button>

          <button
            className="primary-button"
            disabled={
              transcript.length === 0
            }
            onClick={() =>
              setApproved(true)
            }
          >
            {approved ? (
              <>
                <Check size={16} />
                Approved
              </>
            ) : (
              'Approve Draft'
            )}
          </button>
        </div>
      </main>
    </div>
  )
}

export default EncounterReview