import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { patients } from '../data/patients'
import '../App.css'

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
  const [activeTab, setActiveTab] = useState<ReviewTab>('soap')

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

          <button
            className="nav-item"
            onClick={() => navigate(`/patients/${patient.id}`)}
          >
            <span>♙</span>
            Patients
          </button>

          <button className="nav-item active">
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
          onClick={() => navigate(`/patients/${patient.id}`)}
        >
          ← Back to Patient
        </button>

        <section className="review-header">
          <div>
            <p className="eyebrow">ENCOUNTER REVIEW</p>
            <h2>{patient.name}</h2>

            <p className="subtitle">
              {patient.visitType} • August 20, 2026
            </p>
          </div>

          <div className="review-status">
            Draft for clinician review
          </div>
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
            <span className="gap-count">3</span>
          </button>

          <button
            className={activeTab === 'transcript' ? 'active' : ''}
            onClick={() => setActiveTab('transcript')}
          >
            Transcript
          </button>
        </div>

        {activeTab === 'soap' && (
          <section className="review-card">
            <div className="review-card-heading">
              <div>
                <h3>Generated SOAP Note</h3>
                <p>
                  Draft generated from the encounter transcript.
                  Clinician verification is required.
                </p>
              </div>
            </div>

            <div className="soap-content">
              <div className="soap-section">
                <span>S</span>

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

              <div className="soap-section">
                <span>O</span>

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

              <div className="soap-section">
                <span>A</span>

                <div>
                  <h4>Assessment</h4>
                  <p>
                    Hypertension follow-up with continued reported
                    headaches and a discrepancy between the patient's
                    reported medication use and the current medication
                    record.
                  </p>
                </div>
              </div>

              <div className="soap-section">
                <span>P</span>

                <div>
                  <h4>Plan</h4>

                  <ul>
                    <li>
                      Verify current Lisinopril use and medication status.
                    </li>
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
          <section className="review-card">
            <div className="review-card-heading">
              <div>
                <h3>Potential Care Gaps</h3>
                <p>
                  These items were flagged for clinician review based on
                  the encounter and available patient record.
                </p>
              </div>

              <span className="review-count">
                3 items
              </span>
            </div>

            <div className="care-gap-list">
              <div className="care-gap-card high">
                <div className="gap-top-row">
                  <div>
                    <span className="gap-category">
                      Medication Discrepancy
                    </span>
                    <h4>
                      Patient-reported medication status conflicts with
                      current chart.
                    </h4>
                  </div>

                  <span className="confidence high-confidence">
                    High confidence
                  </span>
                </div>

                <div className="evidence-grid">
                  <div className="evidence-box">
                    <span>Patient reported</span>
                    <p>
                      “I stopped taking it about two months ago because I
                      ran out.”
                    </p>
                  </div>

                  <div className="evidence-box">
                    <span>Current record</span>
                    <p>
                      Lisinopril 10 mg daily — listed as active.
                    </p>
                  </div>
                </div>

                <div className="why-flagged">
                  <strong>Why this was flagged</strong>
                  <p>
                    The patient's reported medication status differs
                    from the medication status documented in the current
                    chart.
                  </p>
                </div>

                <div className="gap-actions">
                  <button>Dismiss</button>
                  <button className="primary-gap-action">
                    Mark Reviewed
                  </button>
                </div>
              </div>

              <div className="care-gap-card high">
                <div className="gap-top-row">
                  <div>
                    <span className="gap-category">
                      Outstanding Laboratory Orders
                    </span>
                    <h4>
                      Previously ordered laboratory tests have no
                      recorded results.
                    </h4>
                  </div>

                  <span className="confidence high-confidence">
                    High confidence
                  </span>
                </div>

                <div className="evidence-grid">
                  <div className="evidence-box">
                    <span>Previous record</span>
                    <p>
                      CBC and comprehensive metabolic panel ordered on
                      February 10, 2026.
                    </p>
                  </div>

                  <div className="evidence-box">
                    <span>Current encounter</span>
                    <p>
                      Patient states that the ordered tests were not
                      completed.
                    </p>
                  </div>
                </div>

                <div className="why-flagged">
                  <strong>Why this was flagged</strong>
                  <p>
                    The available record contains outstanding orders
                    without corresponding results, and the patient
                    confirmed they were not completed.
                  </p>
                </div>

                <div className="gap-actions">
                  <button>Dismiss</button>
                  <button className="primary-gap-action">
                    Mark Reviewed
                  </button>
                </div>
              </div>

              <div className="care-gap-card medium">
                <div className="gap-top-row">
                  <div>
                    <span className="gap-category">
                      Follow-Up Timing
                    </span>
                    <h4>
                      Previous follow-up recommendation appears overdue.
                    </h4>
                  </div>

                  <span className="confidence medium-confidence">
                    Medium confidence
                  </span>
                </div>

                <div className="evidence-grid">
                  <div className="evidence-box">
                    <span>Previous plan</span>
                    <p>
                      Follow up in 3 months after February 10, 2026 visit.
                    </p>
                  </div>

                  <div className="evidence-box">
                    <span>Current encounter</span>
                    <p>
                      Current encounter is approximately six months later.
                    </p>
                  </div>
                </div>

                <div className="why-flagged">
                  <strong>Why this was flagged</strong>
                  <p>
                    The interval between encounters is longer than the
                    follow-up timing documented in the previous plan.
                  </p>
                </div>

                <div className="gap-actions">
                  <button>Dismiss</button>
                  <button className="primary-gap-action">
                    Mark Reviewed
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'transcript' && (
          <section className="review-card">
            <div className="review-card-heading">
              <div>
                <h3>Encounter Transcript</h3>
                <p>
                  Transcript used to generate the draft documentation and
                  review flags.
                </p>
              </div>
            </div>

            <div className="review-transcript">
              {transcript.map((entry, index) => (
                <div
                  className="transcript-entry"
                  key={`${entry.speaker}-${index}`}
                >
                  <div
                    className={`speaker-badge ${
                      entry.speaker === 'Patient'
                        ? 'patient-speaker'
                        : ''
                    }`}
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

        <div className="review-footer-actions">
          <button
            className="cancel-encounter"
            onClick={() => navigate(`/patients/${patient.id}`)}
          >
            Return to Patient
          </button>

          <button className="approve-note">
            Approve Draft
          </button>
        </div>
      </main>
    </div>
  )
}

export default EncounterReview