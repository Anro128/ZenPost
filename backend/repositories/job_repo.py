from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models.models import Job
from backend.models.enums import JobStatus
from backend.repositories.base import BaseRepository

class JobRepository(BaseRepository[Job]):
    def __init__(self):
        super().__init__(Job)
        
    async def get_pending(self, db: AsyncSession) -> List[Job]:
        result = await db.execute(select(self.model).where(self.model.status == JobStatus.PENDING))
        return result.scalars().all()

    async def get_running(self, db: AsyncSession) -> List[Job]:
        result = await db.execute(select(self.model).where(self.model.status == JobStatus.RUNNING))
        return result.scalars().all()

    async def get_by_scheduler(self, db: AsyncSession, scheduler_id: int) -> List[Job]:
        result = await db.execute(select(self.model).where(self.model.scheduler_id == scheduler_id))
        return result.scalars().all()

    async def get_failed(self, db: AsyncSession) -> List[Job]:
        result = await db.execute(select(self.model).where(self.model.status == JobStatus.FAILED))
        return result.scalars().all()

job_repo = JobRepository()
