from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.services.settings_service import settings_service
from backend.models.enums import SettingCategory

router = APIRouter(prefix="/api/settings", tags=["settings"])

@router.get("")
async def get_all_settings(db: AsyncSession = Depends(get_db)):
    return await settings_service.get_all_grouped(db)

@router.get("/{category}")
async def get_settings_by_category(category: str, db: AsyncSession = Depends(get_db)):
    return await settings_service.get_by_category(db, category)

@router.put("")
@router.post("")
async def save_bulk_settings(data: dict, db: AsyncSession = Depends(get_db)):
    for key, val in data.items():
        if key in ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GEMINI_API_KEY", "DEEPSEEK_API_KEY", "OPENROUTER_API_KEY"]:
            category = SettingCategory.API_KEYS
        else:
            category = SettingCategory.GENERAL
        await settings_service.update_setting(db, key, str(val), category)
    return {"status": "success", "message": "Settings updated successfully"}

@router.put("/{key}")
async def update_setting(key: str, data: dict, db: AsyncSession = Depends(get_db)):
    cat_str = data.get("category", SettingCategory.API_KEYS.value)
    try:
        category = SettingCategory(cat_str)
    except ValueError:
        category = SettingCategory.GENERAL
        
    return await settings_service.update_setting(db, key, data.get("value", ""), category)
