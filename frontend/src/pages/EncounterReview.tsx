import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Check,
  Search,
} from 'lucide-react'
import { patients } from '../data/patients'

type ReviewTab = 'soap' | 'gaps' | 'transcript'

const transcript = [
  {
    speaker: 'Doctor',
    text: 'Hi Maria. How have you been feeling since your last visit?',
  },
  {
    speaker: 'Patient',
    text: 'I have still been getting headaches, especially in the evenings.',
  },
  {
    speaker: 'Doctor',
    text: 'Are you still taking your blood pressure medication every day?',
  },
  {
    speaker: 'Patient',
    text: 'Actually, I stopped taking it about two months ago because I ran out.',
  },
  {
    speaker: 'Doctor',
    text: 'Did you complete the blood tests we ordered during your last visit?',
  },
  {
    speaker: 'Patient',
    text: 'No, I never got those done.',
  },
]

function EncounterReview() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [activeTab, setActiveTab] =
    useState<ReviewTab>('soap')

  const [reviewed, setReviewed] = useState<number[]>([])
  const [dismissed, setDismissed] = useState<number[]>([])
  const [approved, setApproved] = useState(false)

  const patient = patients.find((p) => p.id === Number(id))

  if (!patient) {
    return <div className="empty-page">Patient not found.</div>
  }

  const markReviewed = (gap: number) => {
    setReviewed((current) => [...new Set([...current, gap])])
    setDismissed((current) => current.filter((item) => item !== gap))
  }

  const dismiss = (gap: number) => {
    setDismissed((current) => [...new Set([...current, gap])])
    setReviewed((current) => current.filter((item) => item !== gap))
  }

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
            <button className="topbar-link" onClick={() => navigate('/')}>
              Dashboard
            </button>
            <button
              className="topbar-link"
              onClick={() => navigate(`/patients/${patient.id}`)}
            >
              Patients
            </button>
            <button className="topbar-link active">Encounters</button>
            <button className="topbar-link">Documentation</button>
            <button className="topbar-link">
              Review Queue
              <span className="nav-badge">3</span>
            </button>
          </div>

          <div className="topbar-actions">
            <button className="round-button">
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
        <button
          className="back-link"
          onClick={() => navigate(`/patients/${patient.id}`)}
        >
          <ArrowLeft size={15} />
          {patient.name}
        </button>

        <section className="review-title">
          <div>
            <span className="overline">ENCOUNTER REVIEW</span>
            <h1>{patient.name}</h1>
            <p>{patient.visitType} · August 26, 2026</p>
          </div>

          <span className={approved ? 'draft-chip approved' : 'draft-chip'}>
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

        <div className="review-tabs">
          <button
            className={activeTab === 'soap' ? 'active' : ''}
            onClick={() => setActiveTab('soap')}
          >
            SOAP Note
          </button>

          <button
            className={activeTab === 'gaps' ? 'active' : ''}
            onClick={() => setActiveTab('gaps')}
          >
            Care Gaps
            <span>3</span>
          </button>

          <button
            className={activeTab === 'transcript' ? 'active' : ''}
            onClick={() => setActiveTab('transcript')}
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
                  Draft generated from the encounter. Clinician
                  verification is required.
                </p>
              </div>
            </div>

            <div className="soap-note">
              <div className="soap-row">
                <div className="soap-letter">S</div>

                <div>
                  <h4>Subjective</h4>
                  <p>
                    Patient presents for hypertension follow-up and
                    reports continued headaches, particularly in the
                    evenings. Patient states that she stopped taking
                    her blood pressure medication approximately two
                    months ago after running out.
                  </p>
                </div>
              </div>

              <div className="soap-row">
                <div className="soap-letter">O</div>

                <div>
                  <h4>Objective</h4>
                  <p>
                    Existing medical history includes hypertension and
                    hyperlipidemia. Current medication record lists
                    Lisinopril 10 mg daily and Atorvastatin 20 mg daily.
                    Previous CBC and comprehensive metabolic panel have
                    no recorded results.
                  </p>
                </div>
              </div>

              <div className="soap-row">
                <div className="soap-letter">A</div>

                <div>
                  <h4>Assessment</h4>
                  <p>
                    Hypertension follow-up with continued reported
                    headaches and a discrepancy between the patient’s
                    reported medication use and the current medication
                    record.
                  </p>
                </div>
              </div>

              <div className="soap-row">
                <div className="soap-letter">P</div>

                <div>
                  <h4>Plan</h4>
                  <ul>
                    <li>Verify current Lisinopril use and medication status.</li>
                    <li>
                      Review outstanding CBC and comprehensive metabolic
                      panel orders.
                    </li>
                    <li>
                      Continue clinician-directed hypertension follow-up.
                    </li>
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
                  Flagged from the encounter and available patient record.
                </p>
              </div>

              <span className="count-badge">3</span>
            </div>

            <div className="gap-list">
              {[
                {
                  id: 1,
                  type: 'MEDICATION DISCREPANCY',
                  title:
                    'Patient-reported medication status conflicts with current chart.',
                  leftLabel: 'PATIENT REPORTED',
                  left:
                    '“I stopped taking it about two months ago because I ran out.”',
                  rightLabel: 'CURRENT RECORD',
                  right: 'Lisinopril 10 mg daily — listed as active.',
                  reason:
                    'The patient’s reported medication status differs from the medication status documented in the current chart.',
                  level: 'High confidence',
                },
                {
                  id: 2,
                  type: 'OUTSTANDING LABORATORY ORDERS',
                  title:
                    'Previously ordered laboratory tests have no recorded results.',
                  leftLabel: 'PREVIOUS RECORD',
                  left:
                    'CBC and comprehensive metabolic panel ordered February 10, 2026.',
                  rightLabel: 'CURRENT ENCOUNTER',
                  right:
                    'Patient states that the ordered tests were not completed.',
                  reason:
                    'Outstanding orders have no corresponding results and the patient confirmed that they were not completed.',
                  level: 'High confidence',
                },
                {
                  id: 3,
                  type: 'FOLLOW-UP TIMING',
                  title:
                    'Previous follow-up recommendation appears overdue.',
                  leftLabel: 'PREVIOUS PLAN',
                  left:
                    'Follow up in 3 months after February 10, 2026 visit.',
                  rightLabel: 'CURRENT ENCOUNTER',
                  right:
                    'Current encounter occurred approximately six months later.',
                  reason:
                    'The interval between encounters is longer than the follow-up timing documented in the previous plan.',
                  level: 'Medium confidence',
                },
              ].map((gap) => (
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
                      <span className="priority-label">{gap.type}</span>
                      <h4>{gap.title}</h4>
                    </div>

                    <span
                      className={
                        gap.level.startsWith('High')
                          ? 'confidence-chip high'
                          : 'confidence-chip medium'
                      }
                    >
                      {gap.level}
                    </span>
                  </div>

                  <div className="evidence-pair">
                    <div>
                      <span>{gap.leftLabel}</span>
                      <p>{gap.left}</p>
                    </div>

                    <div>
                      <span>{gap.rightLabel}</span>
                      <p>{gap.right}</p>
                    </div>
                  </div>

                  <div className="why">
                    <strong>Why this was flagged</strong>
                    <p>{gap.reason}</p>
                  </div>

                  <div className="gap-actions">
                    {dismissed.includes(gap.id) ? (
                      <span className="resolved-text">
                        Dismissed
                      </span>
                    ) : reviewed.includes(gap.id) ? (
                      <span className="resolved-text">
                        <Check size={14} />
                        Reviewed
                      </span>
                    ) : (
                      <>
                        <button
                          className="ghost-button small"
                          onClick={() => dismiss(gap.id)}
                        >
                          Dismiss
                        </button>

                        <button
                          className="soft-button"
                          onClick={() => markReviewed(gap.id)}
                        >
                          Mark Reviewed
                        </button>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'transcript' && (
          <section className="surface review-surface">
            <div className="surface-heading">
              <div>
                <h3>Encounter Transcript</h3>
                <p>
                  Transcript used to generate documentation and review flags.
                </p>
              </div>
            </div>

            <div className="transcript-body review-transcript">
              {transcript.map((entry, index) => (
                <div className="transcript-line" key={index}>
                  <div
                    className={
                      entry.speaker === 'Doctor'
                        ? 'speaker-avatar doctor'
                        : 'speaker-avatar patient'
                    }
                  >
                    {entry.speaker === 'Doctor' ? 'DR' : 'PT'}
                  </div>

                  <div>
                    <strong>{entry.speaker}</strong>
                    <p>{entry.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="bottom-actions">
          <button
            className="ghost-button"
            onClick={() => navigate(`/patients/${patient.id}`)}
          >
            Return to Patient
          </button>

          <button
            className="primary-button"
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