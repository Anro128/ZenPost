from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models.models import Scheduler
from backend.models.enums import SchedulerStatus
from backend.repositories.base import BaseRepository

class SchedulerRepository(BaseRepository[Scheduler]):
    def __init__(self):
        super().__init__(Scheduler)
        
    async def get_active(self, db: AsyncSession) -> List[Scheduler]:
        result = await db.execute(select(self.model).where(self.model.status == SchedulerStatus.ACTIVE))
        return result.scalars().all()

    async def get_enabled(self, db: AsyncSession) -> List[Scheduler]:
        result = await db.execute(select(self.model).where(self.model.is_enabled == True))
        return result.scalars().all()

    async def get_by_name(self, db: AsyncSession, name: str) -> Optional[Scheduler]:
        result = await db.execute(select(self.model).where(self.model.name == name))
        return result.scalars().first()

scheduler_repo = SchedulerRepository()
