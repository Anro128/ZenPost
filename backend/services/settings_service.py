from sqlalchemy.ext.asyncio import AsyncSession
from backend.repositories.setting_repo import setting_repo
from backend.models.enums import SettingCategory
from backend.services.env_service import get_env_key, write_env_key
from typing import Dict, List

API_KEY_NAMES = ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GEMINI_API_KEY", "DEEPSEEK_API_KEY", "OPENROUTER_API_KEY"]

class SettingsService:
    async def get_all_grouped(self, db: AsyncSession) -> Dict[str, List[dict]]:
        settings = await setting_repo.list_all(db)
        grouped = {}
        
        recorded_keys = {s.key for s in settings}
        for k in API_KEY_NAMES:
            if k not in recorded_keys:
                await setting_repo.upsert(db, k, k, SettingCategory.API_KEYS)
        
        settings = await setting_repo.list_all(db)
        
        for s in settings:
            cat = s.category.value if hasattr(s.category, 'value') else str(s.category)
            if cat not in grouped:
                grouped[cat] = []
                
            val = s.value
            if cat == SettingCategory.API_KEYS.value or s.key in API_KEY_NAMES:
                raw_secret = get_env_key(s.key)
                val = raw_secret if raw_secret else ""
                
            grouped[cat].append({"key": s.key, "value": val, "is_configured": bool(get_env_key(s.key))})
            
        return grouped

    async def get_by_category(self, db: AsyncSession, category: str) -> List[dict]:
        grouped = await self.get_all_grouped(db)
        return grouped.get(category, [])

    async def update_setting(self, db: AsyncSession, key: str, value: str, category: SettingCategory):
        if category == SettingCategory.API_KEYS or key in API_KEY_NAMES or key.endswith("_KEY"):
            write_env_key(key, value)
            db_val = key
            return await setting_repo.upsert(db, key, db_val, category)
        else:
            return await setting_repo.upsert(db, key, value, category)

settings_service = SettingsService()
