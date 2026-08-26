import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Activity,
  ArrowLeft,
  Circle,
  Mic,
  Search,
  Square,
} from 'lucide-react'
import { patients } from '../data/patients'

type TranscriptEntry = {
  speaker: 'Doctor' | 'Patient'
  text: string
}

const patientTranscripts: Record<number, TranscriptEntry[]> = {
  1: [
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
  ],

  2: [
    {
      speaker: 'Doctor',
      text: 'Hi James. How long have you been dealing with the cough?',
    },
    {
      speaker: 'Patient',
      text: 'It has been going on for about three weeks.',
    },
    {
      speaker: 'Doctor',
      text: 'Have you had any fever, shortness of breath, or chest pain?',
    },
    {
      speaker: 'Patient',
      text: 'No chest pain or shortness of breath. I had a mild fever last week.',
    },
    {
      speaker: 'Doctor',
      text: 'Are you still taking Cetirizine for your seasonal allergies?',
    },
    {
      speaker: 'Patient',
      text: 'Yes, I take it most days.',
    },
  ],

  3: [
    {
      speaker: 'Doctor',
      text: 'Hi Sarah. Since this is your annual physical, how have you been feeling overall?',
    },
    {
      speaker: 'Patient',
      text: 'Overall I feel pretty good. I have been more tired than usual lately.',
    },
    {
      speaker: 'Doctor',
      text: 'Are you currently taking any medications or supplements?',
    },
    {
      speaker: 'Patient',
      text: 'No prescription medications. I take a multivitamin occasionally.',
    },
    {
      speaker: 'Doctor',
      text: 'Any new medical concerns since your last physical?',
    },
    {
      speaker: 'Patient',
      text: 'Nothing major besides the fatigue.',
    },
  ],

  4: [
    {
      speaker: 'Doctor',
      text: 'Hi David. How has your diabetes management been since your last visit?',
    },
    {
      speaker: 'Patient',
      text: 'My blood sugar has been higher than usual in the mornings.',
    },
    {
      speaker: 'Doctor',
      text: 'Are you still taking Metformin twice a day?',
    },
    {
      speaker: 'Patient',
      text: 'I usually take it, but I miss the evening dose a few times each week.',
    },
    {
      speaker: 'Doctor',
      text: 'Have you noticed any other symptoms?',
    },
    {
      speaker: 'Patient',
      text: 'I have been feeling more thirsty lately.',
    },
  ],
}

function Encounter() {
  const navigate = useNavigate()
  const { id } = useParams()

  const patient = patients.find((p) => p.id === Number(id))
  const patientId = Number(id)

  const sampleTranscript =
    patientTranscripts[patientId] ?? []

  const [isRecording, setIsRecording] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [visibleTranscript, setVisibleTranscript] =
    useState<TranscriptEntry[]>([])

  useEffect(() => {
    let timer: number | undefined

    if (isRecording) {
      timer = window.setInterval(() => {
        setSeconds((previous) => previous + 1)
      }, 1000)
    }

    return () => {
      if (timer) window.clearInterval(timer)
    }
  }, [isRecording])

  useEffect(() => {
    if (!isRecording) return
    if (visibleTranscript.length >= sampleTranscript.length) return

    const transcriptTimer = window.setTimeout(() => {
      setVisibleTranscript((previous) => [
        ...previous,
        sampleTranscript[previous.length],
      ])
    }, 1800)

    return () => window.clearTimeout(transcriptTimer)
  }, [isRecording, visibleTranscript, sampleTranscript])

  if (!patient) {
    return <div className="empty-page">Patient not found.</div>
  }

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0')

    const remaining = (totalSeconds % 60)
      .toString()
      .padStart(2, '0')

    return `${minutes}:${remaining}`
  }

  const startRecording = () => {
    setSeconds(0)
    setVisibleTranscript([])
    setHasStarted(true)
    setIsRecording(true)
  }

  const stopRecording = () => {
    setIsRecording(false)
  }

  const endEncounter = () => {
    navigate(`/patients/${patient.id}/encounter/review`, {
      state: {
        transcript: visibleTranscript,
        duration: seconds,
      },
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
          onClick={() =>
            navigate(`/patients/${patient.id}`)
          }
        >
          <ArrowLeft size={15} />
          {patient.name}
        </button>

        <section className="encounter-title-row">
          <div>
            <span className="overline">
              LIVE ENCOUNTER
            </span>

            <h1>{patient.name}</h1>

            <p>
              {patient.visitType} · {patient.age} years old
            </p>
          </div>

          <span
            className={
              isRecording
                ? 'recording-chip recording'
                : 'recording-chip'
            }
          >
            <Circle size={8} fill="currentColor" />

            {isRecording
              ? 'Recording'
              : hasStarted
                ? 'Recording stopped'
                : 'Not Recording'}
          </span>
        </section>

        <div className="encounter-grid">
          <section className="recording-surface">
            <div
              className={
                isRecording
                  ? 'mic-orb active'
                  : 'mic-orb'
              }
            >
              <Mic size={29} />
            </div>

            <span className="recording-caption">
              {isRecording
                ? 'Recording Encounter'
                : visibleTranscript.length > 0
                  ? 'Encounter Recorded'
                  : 'Ready to Record'}
            </span>

            <strong className="timer">
              {formatTime(seconds)}
            </strong>

            <p>
              This prototype currently uses a simulated
              transcript. Live speech-to-text will be
              connected later.
            </p>

            {!isRecording ? (
              <button
                className="primary-button record-button"
                onClick={startRecording}
              >
                <Mic size={16} />

                {hasStarted
                  ? 'Restart Recording'
                  : 'Start Recording'}
              </button>
            ) : (
              <button
                className="danger-button"
                onClick={stopRecording}
              >
                <Square
                  size={14}
                  fill="currentColor"
                />
                Stop Recording
              </button>
            )}
          </section>

          <section className="surface transcript-surface">
            <div className="surface-heading">
              <div>
                <h3>Live Transcript</h3>
                <p>
                  Conversation transcription appears here.
                </p>
              </div>

              <span className="subtle-counter">
                {visibleTranscript.length} entries
              </span>
            </div>

            <div className="transcript-body">
              {visibleTranscript.length === 0 ? (
                <div className="transcript-empty">
                  <Mic size={28} />

                  <strong>No transcript yet</strong>

                  <span>
                    Start recording to begin the encounter.
                  </span>
                </div>
              ) : (
                visibleTranscript.map((entry, index) => (
                  <div
                    className="transcript-line"
                    key={`${entry.speaker}-${index}`}
                  >
                    <div
                      className={
                        entry.speaker === 'Doctor'
                          ? 'speaker-avatar doctor'
                          : 'speaker-avatar patient'
                      }
                    >
                      {entry.speaker === 'Doctor'
                        ? 'DR'
                        : 'PT'}
                    </div>

                   <div>
  <strong>
    {entry.speaker === 'Doctor'
      ? 'Dr. John Smith'
      : patient.name}
  </strong>

  <p>{entry.text}</p>
</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="bottom-actions">
          <button
            className="ghost-button"
            onClick={() =>
              navigate(`/patients/${patient.id}`)
            }
          >
            Cancel
          </button>

          <button
            className="primary-button"
            disabled={
              visibleTranscript.length === 0 ||
              isRecording
            }
            onClick={endEncounter}
          >
            End Encounter
          </button>
        </div>
      </main>
    </div>
  )
}

export default Encounter