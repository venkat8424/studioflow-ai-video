from datetime import datetime
from enum import Enum
from typing import Literal
from uuid import UUID
from pydantic import BaseModel, Field, HttpUrl

from runway_service import RunwayVideoRatio

class GenerationStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ReviewStatus(str, Enum):
    UNREVIEWED = "unreviewed"
    APPROVED = "approved"
    REJECTED = "rejected"

class GenerationRequest(BaseModel):
    project_name: str = Field(min_length=1, max_length=100)
    shot_name: str = Field(min_length=1, max_length=100)
    prompt_text: str = Field(min_length=1, max_length=2000)
    reference_image_url: HttpUrl
    ratio: Literal[RunwayVideoRatio, "16:9"] = "16:9"
    duration: int = Field(default=5)

class GenerationAcceptedResponse(BaseModel):
    generation_id: UUID
    status: GenerationStatus
    created_at: datetime

class GenerationResponse(BaseModel):
    generation_id: UUID
    project_name: str
    shot_name: str
    prompt_text: str
    reference_image_url: HttpUrl
    ratio: str
    duration: int

    status: GenerationStatus
    review_status: ReviewStatus

    output_url: str | None = None
    error_message: str | None = None

    created_at: datetime
    completed_at: datetime | None = None


class GenerationListResponse(BaseModel):
    generations: list[GenerationResponse]
    total: int


class ReviewRequest(BaseModel):
    review_status: ReviewStatus
    comments: str | None = Field(default=None, max_length=2000)


class ReviewResponse(BaseModel):
    generation_id: UUID
    review_status: ReviewStatus
    comments: str | None = None
    reviewed_at: datetime
