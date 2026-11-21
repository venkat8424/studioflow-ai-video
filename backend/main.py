from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from datetime import UTC
from typing import Annotated
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException
from fastapi.concurrency import run_in_threadpool
from fastapi.params import Query
from runwayml import (
    APIError,
    BadRequestError,
    NotFoundError,
    RunwayMLError,
    UnprocessableEntityError,
)
from sqlalchemy import func, update
from sqlmodel import Session, col, select

from database import create_db_and_tables, get_session
from db_models import Generation, GenerationStatus as StoredGenerationStatus
from db_models import ReviewStatus as StoredReviewStatus
from db_models import utc_now
from models import (
    GenerationAcceptedResponse,
    GenerationListResponse,
    GenerationRequest,
    GenerationResponse,
    GenerationStatus,
    GenerationStatusResponse,
    ReviewRequest,
    ReviewResponse,
)
from runway_service import RunwayService

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
    create_db_and_tables()
    yield

app = FastAPI(title="StudioFlow API", description="API for managing video generation tasks", version="1.0.0", lifespan=lifespan)


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
async def generate(
    request: GenerationRequest,
    session: Annotated[Session, Depends(get_session)],
) -> GenerationAcceptedResponse:
    ratio = "1280:720" if request.ratio == "16:9" else request.ratio
    reference_image_url = str(request.reference_image_url)
    generation = Generation(
        project_name=request.project_name,
        shot_name=request.shot_name,
        prompt_text=request.prompt_text,
        reference_image_url=reference_image_url,
        ratio=ratio,
        duration=request.duration,
    )
    created_at = generation.created_at
    session.add(generation)
    await run_in_threadpool(session.commit)

    task_id = None
    try:
        async with open_runway_service() as runway:
            task_id = await runway.generate_video(
                prompt_text=request.prompt_text,
                reference_image_url=reference_image_url,
                ratio=ratio,
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
        generation.provider_task_id = task_id
        if task_id is None:
            generation.status = StoredGenerationStatus.FAILED
            generation.error_message = "Runway did not confirm the video generation request."
        await run_in_threadpool(session.commit)

    return GenerationAcceptedResponse(
        generation_id=UUID(task_id),
        status=GenerationStatus.PENDING,
        created_at=created_at,
    )

# List past generations
@app.get("/api/generations", response_model=GenerationListResponse)
def get_generations(
    session: Annotated[Session, Depends(get_session)],
    project_name: str | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> GenerationListResponse:
    query = select(Generation)
    if project_name is not None:
        query = query.where(Generation.project_name == project_name)

    total = session.exec(select(func.count()).select_from(query.subquery())).one()
    page = (
        query.order_by(col(Generation.created_at).desc(), col(Generation.generation_id).desc())
        .offset(offset)
        .limit(limit)
    )
    generations = [
        GenerationResponse.model_validate({
            **row.model_dump(),
            "generation_id": row.provider_task_id or row.generation_id,
            # SQLite returns the stored UTC timestamps without timezone information.
            "created_at": row.created_at.replace(tzinfo=UTC),
            "completed_at": row.completed_at.replace(tzinfo=UTC) if row.completed_at else None,
        })
        for row in session.exec(page)
    ]
    return GenerationListResponse(generations=generations, total=total)


def find_generation(session: Session, lookup_id: str) -> Generation | None:
    generation = session.exec(
        select(Generation).where(Generation.provider_task_id == lookup_id)
    ).one_or_none()
    if generation is None:
        generation = session.get(Generation, lookup_id)
    return generation


def persist_generation_status(
    session: Session,
    generation: Generation,
    response: GenerationStatusResponse,
) -> None:
    status = StoredGenerationStatus(response.status.value)
    if generation.status == status:
        return

    terminal = status in (StoredGenerationStatus.COMPLETED, StoredGenerationStatus.FAILED)
    previous_statuses = [generation.status]
    if terminal:
        previous_statuses.extend((StoredGenerationStatus.PENDING, StoredGenerationStatus.PROCESSING))

    # A slower poll must not overwrite a terminal result saved by another poll.
    session.exec(
        update(Generation)
        .where(
            col(Generation.generation_id) == generation.generation_id,
            col(Generation.status).in_(previous_statuses),
            col(Generation.status) != status,
        )
        .values(
            status=status,
            output_url=response.output_url,
            error_message=response.error_message,
            completed_at=utc_now() if terminal else None,
        )
    )
    session.commit()


# Refresh job status and return output
@app.get("/api/generations/{generation_id}", response_model=GenerationStatusResponse)
async def get_generation_status(
    generation_id: UUID,
    session: Annotated[Session, Depends(get_session)],
) -> GenerationStatusResponse:
    lookup_id = str(generation_id)
    generation = await run_in_threadpool(find_generation, session, lookup_id)
    if generation is None:
        task_id = lookup_id
    elif generation.provider_task_id is None:
        return GenerationStatusResponse(
            generation_id=generation_id,
            status=GenerationStatus(generation.status.value),
            created_at=generation.created_at.replace(tzinfo=UTC),
            output_url=generation.output_url,
            error_message=generation.error_message,
        )
    else:
        task_id = generation.provider_task_id

    try:
        async with open_runway_service() as runway:
            task = await runway.get_task_status(task_id)
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

    response = GenerationStatusResponse(
        generation_id=generation_id,
        status=status,
        created_at=task.created_at,
        output_url=output_url,
        error_message=error_message,
    )
    if generation is not None:
        await run_in_threadpool(persist_generation_status, session, generation, response)
    return response

# Approve or reject a video/generation
@app.patch("/api/generations/{generation_id}/review", response_model=ReviewResponse)
def review_generation(
    generation_id: UUID,
    review_data: ReviewRequest,
    session: Annotated[Session, Depends(get_session)],
) -> ReviewResponse:
    generation = find_generation(session, str(generation_id))
    if generation is None:
        raise HTTPException(status_code=404, detail="Generation not found.")

    reviewed_at = utc_now()
    review_fields: dict[str, object] = {
        "review_status": StoredReviewStatus(review_data.review_status.value),
        "reviewed_at": reviewed_at,
    }
    if "comments" in review_data.model_fields_set:
        review_fields["review_comments"] = review_data.comments
    comments = session.exec(
        update(Generation)
        .where(col(Generation.generation_id) == generation.generation_id)
        .values(**review_fields)
        .returning(col(Generation.review_comments))
    ).scalar_one()
    response = ReviewResponse(
        generation_id=UUID(generation.provider_task_id or generation.generation_id),
        review_status=review_data.review_status,
        comments=comments,
        reviewed_at=reviewed_at,
    )
    session.commit()
    return response
