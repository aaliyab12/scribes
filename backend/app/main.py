from typing import List, Literal
from datetime import datetime
from uuid import uuid4

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


class EncounterReviewUpdate(BaseModel):
    reviewed_gap_ids: List[int]
    dismissed_gap_ids: List[int]
    status: Literal["draft", "approved"]


# -----------------------------
# Temporary encounter storage
# -----------------------------

# This is intentionally in-memory for now.
# Data will reset whenever the FastAPI server restarts.
encounters = {}


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

    encounter_id = str(uuid4())

    created_at = datetime.now().isoformat()

    stored_encounter = {
        "encounter_id": encounter_id,
        "patient_id": patient["id"],
        "patient": patient["name"],
        "duration": encounter.duration,
        "created_at": created_at,
        "transcript_entries": len(encounter.transcript),
        "transcript": [
            entry.model_dump()
            for entry in encounter.transcript
        ],
        "soap_note": soap_note.model_dump(),
        "care_gaps": [
            gap.model_dump()
            for gap in care_gaps
        ],
        "status": "draft",
        "reviewed_gap_ids": [],
        "dismissed_gap_ids": [],
    }

    encounters[encounter_id] = stored_encounter

    return stored_encounter


@app.get("/encounters")
def get_encounters():
    return list(encounters.values())


@app.get("/encounters/{encounter_id}")
def get_encounter(encounter_id: str):

    encounter = encounters.get(encounter_id)

    if encounter is None:
        raise HTTPException(
            status_code=404,
            detail="Encounter not found",
        )

    return encounter


@app.patch("/encounters/{encounter_id}/review")
def update_encounter_review(
    encounter_id: str,
    review: EncounterReviewUpdate,
):

    encounter = encounters.get(encounter_id)

    if encounter is None:
        raise HTTPException(
            status_code=404,
            detail="Encounter not found",
        )

    valid_gap_ids = {
        gap["id"]
        for gap in encounter["care_gaps"]
    }

    reviewed_ids = set(
        review.reviewed_gap_ids
    )

    dismissed_ids = set(
        review.dismissed_gap_ids
    )

    if not reviewed_ids.issubset(
        valid_gap_ids
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "One or more reviewed care gap IDs "
                "are invalid."
            ),
        )

    if not dismissed_ids.issubset(
        valid_gap_ids
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "One or more dismissed care gap IDs "
                "are invalid."
            ),
        )

    if reviewed_ids & dismissed_ids:
        raise HTTPException(
            status_code=400,
            detail=(
                "A care gap cannot be both reviewed "
                "and dismissed."
            ),
        )

    encounter["reviewed_gap_ids"] = (
        review.reviewed_gap_ids
    )

    encounter["dismissed_gap_ids"] = (
        review.dismissed_gap_ids
    )

    encounter["status"] = review.status

    return encounter