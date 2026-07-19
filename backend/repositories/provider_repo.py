from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models.models import Provider
from backend.models.enums import ProviderType
from backend.repositories.base import BaseRepository

class ProviderRepository(BaseRepository[Provider]):
    def __init__(self):
        super().__init__(Provider)
        
    async def get_active(self, db: AsyncSession) -> List[Provider]:
        result = await db.execute(select(self.model).where(self.model.is_active == True))
        return result.scalars().all()

    async def get_by_type(self, db: AsyncSession, type_: ProviderType) -> List[Provider]:
        result = await db.execute(select(self.model).where(self.model.type == type_))
        return result.scalars().all()

    async def get_by_key(self, db: AsyncSession, provider_key: str) -> Optional[Provider]:
        result = await db.execute(select(self.model).where(self.model.provider_key == provider_key))
        return result.scalars().first()

provider_repo = ProviderRepository()
