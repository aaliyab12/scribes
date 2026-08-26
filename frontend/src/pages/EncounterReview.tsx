import { useState } from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Check,
  Search,
} from 'lucide-react'
import { patients } from '../data/patients'

type ReviewTab = 'soap' | 'gaps' | 'transcript'

type TranscriptEntry = {
  speaker: 'Doctor' | 'Patient'
  text: string
}

type EncounterState = {
  transcript?: TranscriptEntry[]
  duration?: number
}

function EncounterReview() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()

  const patient = patients.find(
    (p) => p.id === Number(id),
  )

  const encounterState =
    (location.state as EncounterState | null) ?? null

  const transcript =
    encounterState?.transcript ?? []

  const duration =
    encounterState?.duration ?? 0

  const [activeTab, setActiveTab] =
    useState<ReviewTab>('soap')

  const [reviewed, setReviewed] =
    useState<number[]>([])

  const [dismissed, setDismissed] =
    useState<number[]>([])

  const [approved, setApproved] =
    useState(false)

  if (!patient) {
    return (
      <div className="empty-page">
        Patient not found.
      </div>
    )
  }

  const patientStatements = transcript
    .filter((entry) => entry.speaker === 'Patient')
    .map((entry) => entry.text)

  const doctorStatements = transcript
    .filter((entry) => entry.speaker === 'Doctor')
    .map((entry) => entry.text)

  const transcriptText = transcript
    .map((entry) => entry.text.toLowerCase())
    .join(' ')

  const formatDuration = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0')

    const remaining = (totalSeconds % 60)
      .toString()
      .padStart(2, '0')

    return `${minutes}:${remaining}`
  }

  const buildSubjective = () => {
    if (patientStatements.length === 0) {
      return 'No patient statements were recorded during this encounter.'
    }

    return patientStatements.join(' ')
  }

  const buildObjective = () => {
    const conditions =
      patient.conditions.join(', ')

    const medications =
      patient.medications.join(', ')

    return `Available chart history lists the following active conditions: ${conditions}. Current medications documented in the record: ${medications}.`
  }

  const buildAssessment = () => {
    if (transcript.length === 0) {
      return 'Insufficient encounter information available for a draft assessment.'
    }

    return `${patient.visitType}. Draft assessment is based only on the recorded encounter and available chart information and requires clinician verification.`
  }

  const buildPlan = () => {
    if (doctorStatements.length === 0) {
      return [
        'No clinician plan was captured in the recorded portion of the encounter.',
        'Review the available transcript before finalizing documentation.',
      ]
    }

    return [
      'Review the recorded encounter and verify the generated documentation.',
      'Confirm any medication, laboratory, or follow-up discrepancies before finalizing the note.',
    ]
  }

  const careGaps = []

  if (
    patient.id === 1 &&
    transcriptText.includes('stopped taking')
  ) {
    careGaps.push({
      id: 1,
      type: 'MEDICATION DISCREPANCY',
      title:
        'Patient-reported medication status conflicts with current chart.',
      leftLabel: 'PATIENT REPORTED',
      left:
        patientStatements.find((statement) =>
          statement
            .toLowerCase()
            .includes('stopped taking'),
        ) ?? '',
      rightLabel: 'CURRENT RECORD',
      right:
        'Lisinopril 10 mg daily — listed as active.',
      reason:
        'The recorded encounter indicates that the patient stopped taking a medication that remains listed as active in the chart.',
      level: 'High confidence',
    })
  }

  if (
    patient.id === 1 &&
    transcriptText.includes('never got those done')
  ) {
    careGaps.push({
      id: 2,
      type: 'OUTSTANDING LABORATORY ORDERS',
      title:
        'Previously ordered laboratory tests appear incomplete.',
      leftLabel: 'PREVIOUS RECORD',
      left:
        'CBC and comprehensive metabolic panel were ordered February 10, 2026.',
      rightLabel: 'CURRENT ENCOUNTER',
      right:
        patientStatements.find((statement) =>
          statement
            .toLowerCase()
            .includes('never got those done'),
        ) ?? '',
      reason:
        'The patient confirmed during the recorded encounter that previously ordered tests were not completed.',
      level: 'High confidence',
    })
  }

  if (
    patient.id === 4 &&
    transcriptText.includes('miss the evening dose')
  ) {
    careGaps.push({
      id: 3,
      type: 'MEDICATION ADHERENCE',
      title:
        'Patient reports frequently missing an evening medication dose.',
      leftLabel: 'PATIENT REPORTED',
      left:
        patientStatements.find((statement) =>
          statement
            .toLowerCase()
            .includes('miss the evening dose'),
        ) ?? '',
      rightLabel: 'CURRENT RECORD',
      right:
        'Metformin 500 mg twice daily is listed as the current medication schedule.',
      reason:
        'The recorded medication use differs from the documented twice-daily schedule.',
      level: 'High confidence',
    })
  }

  const markReviewed = (gap: number) => {
    setReviewed((current) => [
      ...new Set([...current, gap]),
    ])

    setDismissed((current) =>
      current.filter((item) => item !== gap),
    )
  }

  const dismiss = (gap: number) => {
    setDismissed((current) => [
      ...new Set([...current, gap]),
    ])

    setReviewed((current) =>
      current.filter((item) => item !== gap),
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

            <button
              className="topbar-link"
              onClick={() =>
                navigate(`/patients/${patient.id}`)
              }
            >
              Patients
            </button>

            <button className="topbar-link active">
              Encounters
            </button>

            <button className="topbar-link">
              Documentation
            </button>

            <button className="topbar-link">
              Review Queue
              <span className="nav-badge">
                {careGaps.length}
              </span>
            </button>
          </div>

          <div className="topbar-actions">
            <button className="round-button">
              <Search size={17} />
            </button>

            <div className="doctor-profile">
              <div className="doctor-avatar">
                JS
              </div>

              <div>
                <strong>Dr. John Smith</strong>
                <span>Internal Medicine</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="content">
        <button
          className="back-link"
          onClick={() =>
            navigate(`/patients/${patient.id}`)
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
              {patient.visitType} · Recorded duration{' '}
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
                <h3>No encounter transcript available</h3>

                <p>
                  Return to the patient and record an
                  encounter before generating documentation.
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
                <span>{careGaps.length}</span>
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
                    <h3>Generated SOAP Note</h3>

                    <p>
                      Prototype draft based only on the
                      recorded portion of this encounter.
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
                      <p>{buildSubjective()}</p>
                    </div>
                  </div>

                  <div className="soap-row">
                    <div className="soap-letter">
                      O
                    </div>

                    <div>
                      <h4>Objective</h4>
                      <p>{buildObjective()}</p>
                    </div>
                  </div>

                  <div className="soap-row">
                    <div className="soap-letter">
                      A
                    </div>

                    <div>
                      <h4>Assessment</h4>
                      <p>{buildAssessment()}</p>
                    </div>
                  </div>

                  <div className="soap-row">
                    <div className="soap-letter">
                      P
                    </div>

                    <div>
                      <h4>Plan</h4>

                      <ul>
                        {buildPlan().map(
                          (planItem) => (
                            <li key={planItem}>
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
                    <h3>Potential Care Gaps</h3>

                    <p>
                      Prototype rules applied only to
                      information actually captured during
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
                      padding: '40px 24px',
                      textAlign: 'center',
                      color: '#73818a',
                      fontSize: '11px',
                    }}
                  >
                    No potential care gaps were detected
                    from the recorded portion of this
                    encounter.
                  </div>
                ) : (
                  <div className="gap-list">
                    {careGaps.map((gap) => (
                      <article
                        key={gap.id}
                        className={
                          dismissed.includes(gap.id)
                            ? 'gap-card dismissed'
                            : reviewed.includes(gap.id)
                              ? 'gap-card reviewed'
                              : 'gap-card'
                        }
                      >
                        <div className="gap-heading">
                          <div>
                            <span className="priority-label">
                              {gap.type}
                            </span>

                            <h4>{gap.title}</h4>
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

                            <p>{gap.left}</p>
                          </div>

                          <div>
                            <span>
                              {gap.rightLabel}
                            </span>

                            <p>{gap.right}</p>
                          </div>
                        </div>

                        <div className="why">
                          <strong>
                            Why this was flagged
                          </strong>

                          <p>{gap.reason}</p>
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
                              <Check size={14} />
                              Reviewed
                            </span>
                          ) : (
                            <>
                              <button
                                className="ghost-button small"
                                onClick={() =>
                                  dismiss(gap.id)
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
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'transcript' && (
              <section className="surface review-surface">
                <div className="surface-heading">
                  <div>
                    <h3>Encounter Transcript</h3>

                    <p>
                      Only the transcript captured before
                      recording was stopped is shown here.
                    </p>
                  </div>

                  <span className="subtle-counter">
                    {transcript.length} entries
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
                            {entry.speaker}
                          </strong>

                          <p>{entry.text}</p>
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
              navigate(`/patients/${patient.id}`)
            }
          >
            Return to Patient
          </button>

          <button
            className="primary-button"
            disabled={transcript.length === 0}
            onClick={() => setApproved(true)}
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