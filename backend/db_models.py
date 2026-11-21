from datetime import datetime, timezone
from enum import Enum
from uuid import uuid4

from sqlalchemy import Column, Text
from sqlmodel import SQLModel, Field

def utc_now():
    return datetime.now(timezone.utc)

class GenerationStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ReviewStatus(str, Enum):
    UNREVIEWED = "unreviewed"
    APPROVED = "approved"
    REJECTED = "rejected"

class Generation(SQLModel, table=True):
    __tablename__ = "generations"

    # Identification
    generation_id: str = Field(
        default_factory=lambda: str(uuid4()),
        primary_key=True,
    )

    # Creative request
    project_name: str = Field(index=True)
    shot_name: str
    prompt_text: str = Field(sa_type=Text)
    reference_image_url: str
    ratio: str = "1280:720"
    duration: int = 5

    # Runway execution
    provider_task_id: str | None = Field(
        default=None,
        index=True,
    )
    status: GenerationStatus = Field(
        default=GenerationStatus.PENDING
    )
    output_url: str | None = None
    error_message: str | None = Field(
        default=None,
        sa_type=Text,
    )

    # Human review
    review_status: ReviewStatus = Field(
        default=ReviewStatus.UNREVIEWED
    )
    review_comments: str | None = Field(
        default=None,
        sa_type=Text,
    )
    reviewed_at: datetime | None = None

    # Timestamps
    created_at: datetime = Field(
        default_factory=utc_now
    )
    completed_at: datetime | None = None
