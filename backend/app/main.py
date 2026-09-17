from typing import List, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.patients import patients


# -----------------------------
# Request and response models
# -----------------------------

class TranscriptEntry(BaseModel):
    speaker: Literal["Doctor", "Patient"]
    text: str


class EncounterRequest(BaseModel):
    patient_id: int
    duration: int
    transcript: List[TranscriptEntry]


class SoapNote(BaseModel):
    subjective: str
    objective: str
    assessment: str
    plan: List[str]


class CareGap(BaseModel):
    id: int
    type: str
    title: str
    leftLabel: str
    left: str
    rightLabel: str
    right: str
    reason: str
    level: str


# -----------------------------
# FastAPI application
# -----------------------------

app = FastAPI(
    title="Scribes API",
    description=(
        "Backend API for the Scribes clinical "
        "documentation assistant"
    ),
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Basic API routes
# -----------------------------

@app.get("/")
def root():
    return {
        "message": "Scribes API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }


# -----------------------------
# Patient routes
# -----------------------------

@app.get("/patients")
def get_patients():
    return patients


@app.get("/patients/{patient_id}")
def get_patient(patient_id: int):
    patient = next(
        (
            patient
            for patient in patients
            if patient["id"] == patient_id
        ),
        None,
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    return patient


# -----------------------------
# SOAP note generation
# -----------------------------

def build_soap_note(
    patient: dict,
    transcript: List[TranscriptEntry],
) -> SoapNote:

    patient_statements = [
        entry.text
        for entry in transcript
        if entry.speaker == "Patient"
    ]

    doctor_statements = [
        entry.text
        for entry in transcript
        if entry.speaker == "Doctor"
    ]

    if patient_statements:
        subjective = " ".join(patient_statements)
    else:
        subjective = (
            "No patient statements were recorded during "
            "this encounter."
        )

    conditions = ", ".join(patient["conditions"])
    medications = ", ".join(patient["medications"])

    objective = (
        "Available chart history lists the following active "
        f"conditions: {conditions}. Current medications "
        f"documented in the record: {medications}."
    )

    if transcript:
        assessment = (
            f"{patient['visitType']}. Draft assessment is based "
            "only on the recorded encounter and available chart "
            "information and requires clinician verification."
        )
    else:
        assessment = (
            "Insufficient encounter information available for "
            "a draft assessment."
        )

    if doctor_statements:
        plan = [
            (
                "Review the recorded encounter and verify the "
                "generated documentation."
            ),
            (
                "Confirm any medication, laboratory, or "
                "follow-up discrepancies before finalizing "
                "the note."
            ),
        ]
    else:
        plan = [
            (
                "No clinician plan was captured in the "
                "recorded portion of the encounter."
            ),
            (
                "Review the available transcript before "
                "finalizing documentation."
            ),
        ]

    return SoapNote(
        subjective=subjective,
        objective=objective,
        assessment=assessment,
        plan=plan,
    )


# -----------------------------
# Care-gap detection
# -----------------------------

def detect_care_gaps(
    patient: dict,
    transcript: List[TranscriptEntry],
) -> List[CareGap]:

    care_gaps = []

    patient_statements = [
        entry.text
        for entry in transcript
        if entry.speaker == "Patient"
    ]

    transcript_text = " ".join(
        entry.text.lower()
        for entry in transcript
    )

    # Maria: medication discrepancy
    if (
        patient["id"] == 1
        and "stopped taking" in transcript_text
    ):
        statement = next(
            (
                text
                for text in patient_statements
                if "stopped taking" in text.lower()
            ),
            "",
        )

        care_gaps.append(
            CareGap(
                id=1,
                type="MEDICATION DISCREPANCY",
                title=(
                    "Patient-reported medication status "
                    "conflicts with current chart."
                ),
                leftLabel="PATIENT REPORTED",
                left=statement,
                rightLabel="CURRENT RECORD",
                right=(
                    "Lisinopril 10 mg daily — "
                    "listed as active."
                ),
                reason=(
                    "The recorded encounter indicates that "
                    "the patient stopped taking a medication "
                    "that remains listed as active in the chart."
                ),
                level="High confidence",
            )
        )

    # Maria: outstanding laboratory orders
    if (
        patient["id"] == 1
        and "never got those done" in transcript_text
    ):
        statement = next(
            (
                text
                for text in patient_statements
                if "never got those done" in text.lower()
            ),
            "",
        )

        care_gaps.append(
            CareGap(
                id=2,
                type="OUTSTANDING LABORATORY ORDERS",
                title=(
                    "Previously ordered laboratory tests "
                    "appear incomplete."
                ),
                leftLabel="PREVIOUS RECORD",
                left=(
                    "CBC and comprehensive metabolic panel "
                    "were ordered February 10, 2026."
                ),
                rightLabel="CURRENT ENCOUNTER",
                right=statement,
                reason=(
                    "The patient confirmed during the recorded "
                    "encounter that previously ordered tests "
                    "were not completed."
                ),
                level="High confidence",
            )
        )

    # David: medication adherence
    if (
        patient["id"] == 4
        and "miss the evening dose" in transcript_text
    ):
        statement = next(
            (
                text
                for text in patient_statements
                if "miss the evening dose" in text.lower()
            ),
            "",
        )

        care_gaps.append(
            CareGap(
                id=3,
                type="MEDICATION ADHERENCE",
                title=(
                    "Patient reports frequently missing an "
                    "evening medication dose."
                ),
                leftLabel="PATIENT REPORTED",
                left=statement,
                rightLabel="CURRENT RECORD",
                right=(
                    "Metformin 500 mg twice daily is listed "
                    "as the current medication schedule."
                ),
                reason=(
                    "The recorded medication use differs from "
                    "the documented twice-daily schedule."
                ),
                level="High confidence",
            )
        )

    return care_gaps


# -----------------------------
# Encounter routes
# -----------------------------

@app.post("/encounters")
def create_encounter(encounter: EncounterRequest):

    patient = next(
        (
            patient
            for patient in patients
            if patient["id"] == encounter.patient_id
        ),
        None,
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    soap_note = build_soap_note(
        patient,
        encounter.transcript,
    )

    care_gaps = detect_care_gaps(
        patient,
        encounter.transcript,
    )

    return {
        "message": "Encounter analyzed",
        "patient": patient["name"],
        "duration": encounter.duration,
        "transcript_entries": len(encounter.transcript),
        "transcript": encounter.transcript,
        "soap_note": soap_note,
        "care_gaps": care_gaps,
    }