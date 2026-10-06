import json
import os

import boto3
from botocore.exceptions import ClientError


AWS_REGION = os.getenv("AWS_REGION", "us-east-2")
S3_BUCKET = os.getenv(
    "SCRIBES_S3_BUCKET",
    "scribes-clinical-data-aaliya",
)

s3 = boto3.client("s3", region_name=AWS_REGION)


def save_encounter(encounter: dict) -> None:
    encounter_id = encounter["encounter_id"]
    key = f"encounters/{encounter_id}.json"

    s3.put_object(
        Bucket=S3_BUCKET,
        Key=key,
        Body=json.dumps(encounter, indent=2),
        ContentType="application/json",
    )


def get_encounter(encounter_id: str) -> dict | None:
    key = f"encounters/{encounter_id}.json"

    try:
        response = s3.get_object(
            Bucket=S3_BUCKET,
            Key=key,
        )

        return json.loads(
            response["Body"].read().decode("utf-8")
        )

    except ClientError as error:
        error_code = error.response["Error"]["Code"]

        if error_code in ("NoSuchKey", "404"):
            return None

        raise


def list_encounters() -> list[dict]:
    response = s3.list_objects_v2(
        Bucket=S3_BUCKET,
        Prefix="encounters/",
    )

    encounters = []

    for item in response.get("Contents", []):
        key = item["Key"]

        if not key.endswith(".json"):
            continue

        object_response = s3.get_object(
            Bucket=S3_BUCKET,
            Key=key,
        )

        encounter = json.loads(
            object_response["Body"]
            .read()
            .decode("utf-8")
        )

        encounters.append(encounter)

    encounters.sort(
        key=lambda encounter: encounter.get(
            "created_at",
            "",
        ),
        reverse=True,
    )

    return encounters