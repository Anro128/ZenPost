from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models.models import Upload
from backend.models.enums import UploadStatus
from backend.repositories.base import BaseRepository

class UploadRepository(BaseRepository[Upload]):
    def __init__(self):
        super().__init__(Upload)
        
    async def get_by_content(self, db: AsyncSession, content_id: int) -> List[Upload]:
        result = await db.execute(select(self.model).where(self.model.content_id == content_id))
        return result.scalars().all()

    async def get_by_platform(self, db: AsyncSession, platform: str) -> List[Upload]:
        result = await db.execute(select(self.model).where(self.model.platform == platform))
        return result.scalars().all()

    async def get_failed(self, db: AsyncSession) -> List[Upload]:
        result = await db.execute(select(self.model).where(self.model.status == UploadStatus.FAILED))
        return result.scalars().all()

upload_repo = UploadRepository()
