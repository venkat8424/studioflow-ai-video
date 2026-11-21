from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from uuid import UUID

from fastapi import FastAPI, HTTPException
from fastapi.params import Query
from runwayml import (
    APIError,
    BadRequestError,
    NotFoundError,
    RunwayMLError,
    UnprocessableEntityError,
)

from models import (
    GenerationAcceptedResponse,
    GenerationListResponse,
    GenerationRequest,
    GenerationStatus,
    GenerationStatusResponse,
    ReviewRequest,
    ReviewResponse,
)
from runway_service import RunwayService

app = FastAPI(title="StudioFlow API", description="API for managing video generation tasks", version="1.0.0")


@asynccontextmanager
async def open_runway_service() -> AsyncGenerator[RunwayService]:
    try:
        runway = RunwayService()
    except RunwayMLError as exc:
        raise HTTPException(status_code=503, detail="Runway is not configured.") from exc

    try:
        yield runway
    finally:
        await runway.close()


@app.get("/api/health")
async def health():
    return {"status": "healthy"}

# Submit a new video-generation task
@app.post("/api/generate", response_model=GenerationAcceptedResponse)
async def generate(request: GenerationRequest) -> GenerationAcceptedResponse:
    try:
        async with open_runway_service() as runway:
            task_id = await runway.generate_video(
                prompt_text=request.prompt_text,
                reference_image_url=str(request.reference_image_url),
                ratio="1280:720" if request.ratio == "16:9" else request.ratio,
                duration=request.duration,
            )
    except (BadRequestError, UnprocessableEntityError) as exc:
        raise HTTPException(
            status_code=422, detail="Runway rejected the video generation request."
        ) from exc
    except APIError as exc:
        raise HTTPException(
            status_code=502, detail="Runway could not accept the video generation request."
        ) from exc
    return GenerationAcceptedResponse(
        generation_id=UUID(task_id),
        status=GenerationStatus.PENDING,
        created_at=datetime.now(UTC),
    )

# List past generations
@app.get("/api/generations", response_model=GenerationListResponse)
async def get_generations(project_name: str | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0)):
    return {"message": "This endpoint is for retrieving generated videos. Please use POST method with the required data."}

# Refresh job status and return output
@app.get("/api/generations/{generation_id}", response_model=GenerationStatusResponse)
async def get_generation_status(generation_id: UUID) -> GenerationStatusResponse:
    try:
        async with open_runway_service() as runway:
            task = await runway.get_task_status(str(generation_id))
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail="Generation not found.") from exc
    except APIError as exc:
        raise HTTPException(
            status_code=502, detail="Could not retrieve the generation status from Runway."
        ) from exc

    output_url = None
    error_message = None
    if task.status in ("PENDING", "THROTTLED"):
        status = GenerationStatus.PENDING
    elif task.status == "RUNNING":
        status = GenerationStatus.PROCESSING
    elif task.status == "SUCCEEDED":
        status = GenerationStatus.COMPLETED
        output_url = next(iter(task.output), None)
    elif task.status == "FAILED":
        status = GenerationStatus.FAILED
        error_message = f"Runway generation failed: {task.failure}"
    elif task.status == "CANCELLED":
        status = GenerationStatus.FAILED
        error_message = "The Runway generation was canceled."
    else:
        raise HTTPException(status_code=502, detail="Runway returned an unknown task status.")

    return GenerationStatusResponse(
        generation_id=generation_id,
        status=status,
        created_at=task.created_at,
        output_url=output_url,
        error_message=error_message,
    )

# Approve or reject a video/generation
@app.patch("/api/generations/{generation_id}/review", response_model=ReviewResponse)
async def review_generation(generation_id: UUID, review_data: ReviewRequest):
    # Here you would implement the logic to approve or reject a generation task
    # For now, we'll just return a placeholder response
    return {
        "generation_id": generation_id,
        "status": "reviewed",
        "review_result": review_data.get("approved", False)
    }
