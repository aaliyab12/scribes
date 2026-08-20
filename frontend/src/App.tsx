import './App.css'

type Patient = {
  id: number
  initials: string
  name: string
  age: number
  appointmentTime: string
  visitType: string
  status: 'Upcoming' | 'Ready'
}

const patients: Patient[] = [
  {
    id: 1,
    initials: 'ML',
    name: 'Maria Lopez',
    age: 52,
    appointmentTime: '9:00 AM',
    visitType: 'Hypertension follow-up',
    status: 'Ready',
  },
  {
    id: 2,
    initials: 'JW',
    name: 'James Wilson',
    age: 41,
    appointmentTime: '9:30 AM',
    visitType: 'Persistent cough',
    status: 'Upcoming',
  },
  {
    id: 3,
    initials: 'SA',
    name: 'Sarah Ahmed',
    age: 35,
    appointmentTime: '10:00 AM',
    visitType: 'Annual physical',
    status: 'Upcoming',
  },
  {
    id: 4,
    initials: 'DC',
    name: 'David Chen',
    age: 63,
    appointmentTime: '10:30 AM',
    visitType: 'Diabetes follow-up',
    status: 'Upcoming',
  },
]

function App() {
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
          <button className="nav-item active">
            <span>▦</span>
            Dashboard
          </button>

          <button className="nav-item">
            <span>♙</span>
            Patients
          </button>

          <button className="nav-item">
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
        <header>
          <div>
            <p className="eyebrow">THURSDAY, AUGUST 20</p>
            <h2>Good afternoon, Dr. Smith.</h2>
            <p className="subtitle">
              Here's an overview of your clinical schedule.
            </p>
          </div>

          <button className="new-encounter">+ New Encounter</button>
        </header>

        <section className="stats">
          <div className="stat-card">
            <span>Today's patients</span>
            <strong>4</strong>
          </div>

          <div className="stat-card">
            <span>Completed encounters</span>
            <strong>0</strong>
          </div>

          <div className="stat-card attention">
            <span>Items requiring review</span>
            <strong>3</strong>
          </div>
        </section>

        <section className="schedule">
          <div className="section-heading">
            <div>
              <h3>Today's Patients</h3>
              <p>Select a patient to review their clinical record.</p>
            </div>

            <span>August 20, 2026</span>
          </div>

          <div className="patient-list">
            {patients.map((patient) => (
              <div className="patient-card" key={patient.id}>
                <div className="time">{patient.appointmentTime}</div>

                <div className="patient-avatar">{patient.initials}</div>

                <div className="patient-info">
                  <strong>{patient.name}</strong>
                  <span>{patient.age} years old</span>
                </div>

                <div className="visit-type">
                  <span>Reason for visit</span>
                  <strong>{patient.visitType}</strong>
                </div>

                <span
                  className={`status ${
                    patient.status === 'Ready' ? 'ready' : ''
                  }`}
                >
                  {patient.status}
                </span>

                <button className="review-button">Review Patient →</button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App