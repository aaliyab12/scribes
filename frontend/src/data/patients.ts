export type Patient = {
  id: number
  initials: string
  name: string
  age: number
  sex: string
  patientId: string
  appointmentTime: string
  visitType: string
  status: 'Upcoming' | 'Ready'
  conditions: string[]
  medications: string[]
  allergies: string[]
  lastVisit: string
}

export const patients: Patient[] = [
  {
    id: 1,
    initials: 'ML',
    name: 'Maria Lopez',
    age: 52,
    sex: 'Female',
    patientId: 'PT-1001',
    appointmentTime: '9:00 AM',
    visitType: 'Hypertension follow-up',
    status: 'Ready',
    conditions: ['Hypertension', 'Hyperlipidemia'],
    medications: ['Lisinopril 10 mg daily', 'Atorvastatin 20 mg daily'],
    allergies: ['Penicillin'],
    lastVisit: 'February 10, 2026',
  },
  {
    id: 2,
    initials: 'JW',
    name: 'James Wilson',
    age: 41,
    sex: 'Male',
    patientId: 'PT-1002',
    appointmentTime: '9:30 AM',
    visitType: 'Persistent cough',
    status: 'Upcoming',
    conditions: ['Seasonal allergies'],
    medications: ['Cetirizine 10 mg daily'],
    allergies: ['None documented'],
    lastVisit: 'May 2, 2026',
  },
  {
    id: 3,
    initials: 'SA',
    name: 'Sarah Ahmed',
    age: 35,
    sex: 'Female',
    patientId: 'PT-1003',
    appointmentTime: '10:00 AM',
    visitType: 'Annual physical',
    status: 'Upcoming',
    conditions: ['None documented'],
    medications: ['None documented'],
    allergies: ['None documented'],
    lastVisit: 'August 12, 2025',
  },
  {
    id: 4,
    initials: 'DC',
    name: 'David Chen',
    age: 63,
    sex: 'Male',
    patientId: 'PT-1004',
    appointmentTime: '10:30 AM',
    visitType: 'Diabetes follow-up',
    status: 'Upcoming',
    conditions: ['Type 2 Diabetes', 'Hypertension'],
    medications: ['Metformin 500 mg twice daily'],
    allergies: ['Sulfa drugs'],
    lastVisit: 'April 18, 2026',
  },
]