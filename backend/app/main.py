from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from app.patients import patients

app = FastAPI(
    title="Scribes API",
    description="Backend API for the Scribes clinical documentation assistant",
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

@app.get("/patients")
def get_patients():
    return patients


@app.get("/patients/{patient_id}")
def get_patient(patient_id: int):
    patient = next(
        (patient for patient in patients if patient["id"] == patient_id),
        None
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return patient