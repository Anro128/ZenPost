from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.dialects.sqlite import insert
from backend.models.models import Setting
from backend.models.enums import SettingCategory
from backend.repositories.base import BaseRepository

class SettingRepository(BaseRepository[Setting]):
    def __init__(self):
        super().__init__(Setting)
        
    async def get_by_key(self, db: AsyncSession, key: str) -> Optional[Setting]:
        result = await db.execute(select(self.model).where(self.model.key == key))
        return result.scalars().first()

    async def get_by_category(self, db: AsyncSession, category: SettingCategory) -> List[Setting]:
        result = await db.execute(select(self.model).where(self.model.category == category))
        return result.scalars().all()

    async def upsert(self, db: AsyncSession, key: str, value: str, category: SettingCategory) -> Setting:
        stmt = insert(self.model).values(key=key, value=value, category=category)
        stmt = stmt.on_conflict_do_update(
            index_elements=['key'],
            set_={'value': value, 'category': category}
        )
        await db.execute(stmt)
        await db.commit()
        return await self.get_by_key(db, key)

setting_repo = SettingRepository()
