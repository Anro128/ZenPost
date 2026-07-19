from typing import List, Optional
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.dialects.sqlite import insert
from backend.models.models import AnalyticsDaily
from backend.repositories.base import BaseRepository

class AnalyticsRepository(BaseRepository[AnalyticsDaily]):
    def __init__(self):
        super().__init__(AnalyticsDaily)
        
    async def get_by_date_range(self, db: AsyncSession, start_date: date, end_date: date) -> List[AnalyticsDaily]:
        result = await db.execute(
            select(self.model)
            .where(self.model.date >= start_date)
            .where(self.model.date <= end_date)
        )
        return result.scalars().all()

    async def get_today(self, db: AsyncSession) -> Optional[AnalyticsDaily]:
        today = date.today()
        result = await db.execute(select(self.model).where(self.model.date == today))
        return result.scalars().first()

    async def upsert_daily(self, db: AsyncSession, stats: dict) -> AnalyticsDaily:
        today = stats.get('date', date.today())
        stmt = insert(self.model).values(**stats)
        stmt = stmt.on_conflict_do_update(
            index_elements=['date'],
            set_={k: v for k, v in stats.items() if k != 'date'}
        )
        await db.execute(stmt)
        await db.commit()
        return await self.get_today(db)

analytics_repo = AnalyticsRepository()
