from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models.models import FacebookPage
from backend.repositories.base import BaseRepository

class FacebookPageRepository(BaseRepository[FacebookPage]):
    def __init__(self):
        super().__init__(FacebookPage)

    async def get_by_page_id(self, db: AsyncSession, page_id: str) -> Optional[FacebookPage]:
        result = await db.execute(select(self.model).where(self.model.page_id == page_id))
        return result.scalars().first()

    async def get_valid_pages(self, db: AsyncSession) -> List[FacebookPage]:
        result = await db.execute(select(self.model).where(self.model.token_valid == True))
        return result.scalars().all()

facebook_repo = FacebookPageRepository()
