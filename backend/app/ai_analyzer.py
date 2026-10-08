import json
import os
from typing import Literal

from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel, Field


load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL = "openai/gpt-oss-120b"


# ---------------------------------------------------------
# Structured AI output models
# ---------------------------------------------------------

class SoapNote(BaseModel):
    subjective: str
    objective: list[str]
    assessment: str
    plan: list[str]


class CareGap(BaseModel):
    type: str
    title: str
    left: str
    leftLabel: str
    right: str
    rightLabel: str
    reason: str
    level: Literal["high", "medium", "low"]


class EncounterAnalysis(BaseModel):
    soap_note: SoapNote
    care_gaps: list[CareGap] = Field(default_factory=list)


# ---------------------------------------------------------
# AI instructions
# ---------------------------------------------------------

SYSTEM_PROMPT = """
You are an AI clinical documentation assistant used in a prototype
application called Scribes.

All patient information is synthetic.

Your role is DOCUMENTATION AND DISCREPANCY DETECTION.

You are NOT acting as a physician and you must NOT independently decide
what treatment, diagnosis, medication, test, or follow-up should occur.

You have two responsibilities:

1. Create a draft SOAP note using ONLY information explicitly supported
   by the supplied patient record and encounter transcript.

2. Identify potential care gaps or discrepancies ONLY when they are
   directly supported by evidence in the supplied information.


========================
GROUNDING RULES
========================

Use only facts contained in the supplied patient record or transcript.

Do NOT:
- invent diagnoses
- invent symptoms
- invent vital signs
- invent laboratory values
- invent laboratory test names
- invent medications
- invent procedures
- invent previous orders
- invent treatment decisions
- invent follow-up intervals
- invent referrals
- invent prescriptions or refills
- infer that a condition is controlled or uncontrolled
- infer a diagnosis from symptoms
- recommend what the clinician should do

If information is missing, do not fill in the missing information.

PRESERVE SOURCE ATTRIBUTION:

Do not rewrite an implied relationship as though it were explicitly
stated by the patient or clinician.

For example, if the patient says "my blood pressure medication" and the
patient record lists Lisinopril, you may identify a potential discrepancy
between those two pieces of information, but do not state that the patient
explicitly said they stopped Lisinopril.

Similarly, do not attach dates, medication names, test names, diagnoses,
or other details to an event unless the supplied information explicitly
connects them.

When comparing information from different sources, preserve the wording
and source of each piece of evidence.

========================
SOAP NOTE RULES
========================

SUBJECTIVE:
Summarize symptoms, medication use, concerns, and history explicitly
reported by the patient during the encounter.

OBJECTIVE:
Include only factual information explicitly present in the supplied
patient record or transcript.

Do not create physical examination findings, vital signs, laboratory
results, or other observations that were not provided.

ASSESSMENT:
Document only conditions or issues explicitly supported by the patient
record or encounter.

Do not independently diagnose a new condition.

Do not claim a condition is controlled, uncontrolled, improving,
worsening, stable, or unstable unless the supplied information explicitly
states this.

PLAN:
Document ONLY plans, orders, prescriptions, referrals, follow-ups,
education, or treatment decisions that the clinician explicitly discussed
in the transcript.

Do NOT create a medically appropriate plan yourself.

If the clinician did not document a plan in the supplied transcript,
return:

["No treatment plan documented in the supplied transcript."]


========================
CARE GAP RULES
========================

A care gap must be supported by identifiable evidence.

Examples include:

- the patient record lists a medication but the patient reports they
  stopped taking it

- a previous order is documented and the patient reports it was not
  completed

Do not manufacture a care gap simply because one might be medically
reasonable.

It is completely acceptable to return zero care gaps.

For each care gap:

LEFT:
State the relevant information from the patient record or previously
documented information.

RIGHT:
State the relevant information from the current transcript.

REASON:
Explain the discrepancy without making a new diagnosis or treatment
recommendation.

LEVEL:
Use only:
"high"
"medium"
"low"


========================
OUTPUT
========================

Return ONLY valid JSON using exactly this structure:

{
  "soap_note": {
    "subjective": "string",
    "objective": ["string"],
    "assessment": "string",
    "plan": ["string"]
  },
  "care_gaps": [
    {
      "type": "string",
      "title": "string",
      "left": "string",
      "leftLabel": "string",
      "right": "string",
      "rightLabel": "string",
      "reason": "string",
      "level": "high"
    }
  ]
}

Do not include markdown.

Do not include commentary before or after the JSON.

All generated documentation is a draft and requires clinician review.
"""


# ---------------------------------------------------------
# Encounter analysis
# ---------------------------------------------------------

def analyze_encounter(
    patient: dict,
    transcript: list[dict[str, str]],
) -> dict:
    """
    Generate a grounded draft SOAP note and evidence-supported
    potential care gaps.
    """

    if not transcript:
        raise ValueError("Transcript cannot be empty.")

    patient_context = {
        "name": patient.get("name"),
        "age": patient.get("age"),
        "sex": patient.get("sex"),
        "visit_type": patient.get("visitType"),
        "conditions": patient.get("conditions", []),
        "medications": patient.get("medications", []),
        "allergies": patient.get("allergies", []),
        "last_visit": patient.get("lastVisit"),
    }

    input_data = {
        "patient_record": patient_context,
        "transcript": transcript,
    }

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": json.dumps(input_data, indent=2),
            },
        ],
        response_format={"type": "json_object"},
        temperature=0,
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError("AI returned an empty response.")

    try:
        raw_result = json.loads(content)
    except json.JSONDecodeError as error:
        raise ValueError(
            "AI returned invalid JSON."
        ) from error

    try:
        validated_result = EncounterAnalysis.model_validate(
            raw_result
        )
    except Exception as error:
        raise ValueError(
            "AI response did not match the required structure."
        ) from error

    return validated_result.model_dump()