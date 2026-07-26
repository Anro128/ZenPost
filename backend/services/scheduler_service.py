from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from backend.repositories.scheduler_repo import scheduler_repo
from backend.models.models import Scheduler

class SchedulerService:
    async def toggle_enabled(self, db: AsyncSession, scheduler_id: int) -> Optional[Scheduler]:
        scheduler = await scheduler_repo.get_by_id(db, scheduler_id)
        if scheduler:
            return await scheduler_repo.update(db, scheduler, {"is_enabled": not scheduler.is_enabled})
        return None
        
    async def manual_trigger(self, db: AsyncSession, scheduler_id: int):
        from backend.services.queue_service import queue_service
        from backend.models.enums import JobType
        scheduler = await scheduler_repo.get_by_id(db, scheduler_id)
        if scheduler:
            await queue_service.enqueue(db, JobType.GENERATE, {"scheduler_id": scheduler_id}, scheduler_id)

scheduler_service = SchedulerService()
