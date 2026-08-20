import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { patients } from '../data/patients'
import '../App.css'

const sampleTranscript = [
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

function Encounter() {
  const navigate = useNavigate()
  const { id } = useParams()

  const patient = patients.find((p) => p.id === Number(id))

  const [isRecording, setIsRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [visibleTranscript, setVisibleTranscript] = useState<
    typeof sampleTranscript
  >([])

  useEffect(() => {
    let timer: number | undefined

    if (isRecording) {
      timer = window.setInterval(() => {
        setSeconds((previous) => previous + 1)
      }, 1000)
    }

    return () => {
      if (timer) {
        window.clearInterval(timer)
      }
    }
  }, [isRecording])

  useEffect(() => {
    if (!isRecording) {
      return
    }

    if (visibleTranscript.length >= sampleTranscript.length) {
      return
    }

    const transcriptTimer = window.setTimeout(() => {
      setVisibleTranscript((previous) => [
        ...previous,
        sampleTranscript[previous.length],
      ])
    }, 1800)

    return () => {
      window.clearTimeout(transcriptTimer)
    }
  }, [isRecording, visibleTranscript])

  if (!patient) {
    return <div>Patient not found.</div>
  }

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0')

    const remainingSeconds = (totalSeconds % 60)
      .toString()
      .padStart(2, '0')

    return `${minutes}:${remainingSeconds}`
  }

  const startRecording = () => {
    setSeconds(0)
    setVisibleTranscript([])
    setIsRecording(true)
  }

  const stopRecording = () => {
    setIsRecording(false)
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

        <section className="encounter-header">
          <div>
            <p className="eyebrow">LIVE ENCOUNTER</p>
            <h2>{patient.name}</h2>
            <p className="subtitle">
              {patient.visitType} • {patient.age} years old
            </p>
          </div>

          <div
            className={`recording-status ${
              isRecording ? 'recording' : ''
            }`}
          >
            <span className="recording-dot" />
            {isRecording ? 'Recording' : 'Not Recording'}
          </div>
        </section>

        <section className="encounter-layout">
          <div className="recording-panel">
            <div className="microphone-circle">
              🎙
            </div>

            <p className="recording-label">
              {isRecording
                ? 'Recording Encounter'
                : 'Ready to Record'}
            </p>

            <strong className="encounter-timer">
              {formatTime(seconds)}
            </strong>

            <p className="recording-helper">
              This prototype currently uses a simulated transcript.
              Live speech-to-text will be connected later.
            </p>

            {!isRecording ? (
              <button
                className="new-encounter start-recording"
                onClick={startRecording}
              >
                Start Recording
              </button>
            ) : (
              <button
                className="stop-recording"
                onClick={stopRecording}
              >
                Stop Recording
              </button>
            )}
          </div>

          <div className="transcript-panel">
            <div className="transcript-heading">
              <div>
                <h3>Live Transcript</h3>
                <p>
                  Conversation transcription will appear here.
                </p>
              </div>

              <span>
                {visibleTranscript.length} entries
              </span>
            </div>

            <div className="transcript-content">
              {visibleTranscript.length === 0 ? (
                <div className="empty-transcript">
                  <span>🎙</span>
                  <strong>No transcript yet</strong>
                  <p>
                    Start the encounter to begin transcription.
                  </p>
                </div>
              ) : (
                visibleTranscript.map((entry, index) => (
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
                      {entry.speaker === 'Doctor'
                        ? 'DR'
                        : 'PT'}
                    </div>

                    <div>
                      <strong>{entry.speaker}</strong>
                      <p>{entry.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <div className="encounter-actions">
          <button
            className="cancel-encounter"
            onClick={() => navigate(`/patients/${patient.id}`)}
          >
            Cancel Encounter
          </button>

          <button
            className="end-encounter"
            disabled={visibleTranscript.length === 0}
          >
            End Encounter →
          </button>
        </div>
      </main>
    </div>
  )
}

export default Encounter