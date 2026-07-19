from sqlalchemy.ext.asyncio import AsyncSession
from backend.repositories.setting_repo import setting_repo
from backend.models.enums import SettingCategory
from typing import Dict, List

class SettingsService:
    async def get_all_grouped(self, db: AsyncSession) -> Dict[str, List[dict]]:
        settings = await setting_repo.list_all(db)
        grouped = {}
        for s in settings:
            if s.category not in grouped:
                grouped[s.category] = []
            grouped[s.category].append({"key": s.key, "value": s.value})
        return grouped

settings_service = SettingsService()
