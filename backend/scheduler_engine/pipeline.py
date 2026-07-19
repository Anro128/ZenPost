import logging
from backend.database import async_session
from backend.services.queue_service import queue_service
from backend.models.enums import JobType

logger = logging.getLogger(__name__)

async def execute_pipeline(scheduler_id: int):
    """
    Called by APScheduler when a job is triggered.
    Enqueues a job to run the actual generation pipeline.
    """
    logger.info(f"Triggering pipeline for scheduler {scheduler_id}")
    async with async_session() as db:
        await queue_service.enqueue(
            db, 
            JobType.GENERATE, 
            {"scheduler_id": scheduler_id},
            scheduler_id=scheduler_id
        )
