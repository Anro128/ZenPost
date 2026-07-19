from typing import List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from backend.models.models import GeneratedContent
from backend.models.enums import ContentStatus
from backend.repositories.base import BaseRepository

class ContentRepository(BaseRepository[GeneratedContent]):
    def __init__(self):
        super().__init__(GeneratedContent)
        
    async def get_by_scheduler(self, db: AsyncSession, scheduler_id: int) -> List[GeneratedContent]:
        result = await db.execute(select(self.model).where(self.model.scheduler_id == scheduler_id))
        return result.scalars().all()

    async def get_today_count(self, db: AsyncSession) -> int:
        today = datetime.utcnow().date()
        result = await db.execute(
            select(func.count())
            .select_from(self.model)
            .where(func.date(self.model.created_at) == today)
        )
        return result.scalar_one()

    async def get_by_status(self, db: AsyncSession, status: ContentStatus) -> List[GeneratedContent]:
        result = await db.execute(select(self.model).where(self.model.status == status))
        return result.scalars().all()

content_repo = ContentRepository()
