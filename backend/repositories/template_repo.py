from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models.models import Template
from backend.repositories.base import BaseRepository

class TemplateRepository(BaseRepository[Template]):
    def __init__(self):
        super().__init__(Template)
        
    async def get_default(self, db: AsyncSession) -> Optional[Template]:
        result = await db.execute(select(self.model).where(self.model.is_default == True))
        return result.scalars().first()

    async def get_by_name(self, db: AsyncSession, name: str) -> Optional[Template]:
        result = await db.execute(select(self.model).where(self.model.name == name))
        return result.scalars().first()

template_repo = TemplateRepository()
