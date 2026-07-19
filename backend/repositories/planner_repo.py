from typing import List, Optional
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models.models import PlannerItem
from backend.models.enums import PlannerStatus
from backend.repositories.base import BaseRepository

class PlannerRepository(BaseRepository[PlannerItem]):
    def __init__(self):
        super().__init__(PlannerItem)
        
    async def get_next_for_scheduler(self, db: AsyncSession, scheduler_id: int) -> Optional[PlannerItem]:
        result = await db.execute(
            select(self.model)
            .where(self.model.scheduler_id == scheduler_id)
            .where(self.model.status == PlannerStatus.SCHEDULED)
            .order_by(self.model.target_date.asc())
        )
        return result.scalars().first()

    async def get_by_status(self, db: AsyncSession, status: PlannerStatus) -> List[PlannerItem]:
        result = await db.execute(select(self.model).where(self.model.status == status))
        return result.scalars().all()

    async def get_by_date_range(self, db: AsyncSession, start_date: date, end_date: date) -> List[PlannerItem]:
        result = await db.execute(
            select(self.model)
            .where(self.model.target_date >= start_date)
            .where(self.model.target_date <= end_date)
        )
        return result.scalars().all()

planner_repo = PlannerRepository()
