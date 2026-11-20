from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from runwayml import AsyncRunwayML
from runwayml.types import TaskRetrieveResponse

class RunwayService:
    """Submit image-to-video jobs and retrieve their current Runway status."""

    def __init__(self, client: AsyncRunwayML | None = None) -> None:
        if client is None:
            load_dotenv(Path(__file__).with_name(".env"))
            client = AsyncRunwayML()
        self._client = client

    async def generate_video(
        self,
        *,
        prompt_text: str,
        reference_image_url: str,
        ratio: Literal[
            "1280:720", "720:1280", "1104:832", "832:1104", "960:960", "1584:672"
        ] = "1280:720",
        duration: int = 5,
    ) -> str:
        """Submit a generation request and return its Runway task ID."""
        # A retry after a lost response could create a second billable task.
        task = await self._client.with_options(max_retries=0).image_to_video.create(
            model="gen4_turbo",
            prompt_image=reference_image_url,
            prompt_text=prompt_text,
            ratio=ratio,
            duration=duration,
        )
        return task.id

    async def get_task_status(self, task_id: str) -> TaskRetrieveResponse:
        """Fetch the current task details, including output or failure when available."""
        return await self._client.tasks.retrieve(task_id)

    async def close(self) -> None:
        """Close the Runway client and its HTTP connections."""
        await self._client.close()
