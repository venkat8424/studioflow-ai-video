from datetime import UTC, datetime
from uuid import UUID

from fastapi import FastAPI, HTTPException
from fastapi.params import Query
from runwayml import APIError, BadRequestError, RunwayMLError, UnprocessableEntityError

from models import (
    GenerationAcceptedResponse,
    GenerationListResponse,
    GenerationRequest,
    GenerationResponse,
    GenerationStatus,
    ReviewRequest,
    ReviewResponse,
)
from runway_service import RunwayService

app = FastAPI(title="StudioFlow API", description="API for managing video generation tasks", version="1.0.0")

@app.get("/api/health")
async def health():
    return {"status": "healthy"}

# Submit a new video-generation task
@app.post("/api/generate", response_model=GenerationAcceptedResponse)
async def generate(request: GenerationRequest) -> GenerationAcceptedResponse:
    try:
        runway = RunwayService()
    except RunwayMLError as exc:
        raise HTTPException(status_code=503, detail="Runway is not configured.") from exc

    try:
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
    finally:
        await runway.close()

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
@app.get("/api/generations/{generation_id}", response_model=GenerationResponse)
async def get_generation_status(generation_id: UUID):
    # Here you would implement the logic to check the status of a specific generation task
    # For now, we'll just return a placeholder response
    return {
        "generation_id": generation_id,
        "status": "pending",  # This would be dynamic based on actual job status
        "output_url": None  # This would be the URL to the generated video if completed
    }

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
