from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.services.settings_service import settings_service
from backend.models.enums import SettingCategory

router = APIRouter(prefix="/api/settings", tags=["settings"])

API_KEY_NAMES = {"OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GEMINI_API_KEY", "DEEPSEEK_API_KEY", "OPENROUTER_API_KEY"}

@router.get("")
async def get_all_settings(db: AsyncSession = Depends(get_db)):
    return await settings_service.get_all_grouped(db)

@router.get("/{category}")
async def get_settings_by_category(category: str, db: AsyncSession = Depends(get_db)):
    return await settings_service.get_by_category(db, category)

@router.put("")
@router.post("")
async def save_bulk_settings(data: dict, db: AsyncSession = Depends(get_db)):
    for key in data.keys():
        if key in API_KEY_NAMES:
            raise HTTPException(
                status_code=403, 
                detail="Security policy: AI API Keys cannot be modified via Web/API. Please configure them directly in the server .env file."
            )
            
    for key, val in data.items():
        await settings_service.update_setting(db, key, str(val), SettingCategory.GENERAL)
    return {"status": "success", "message": "Settings updated successfully"}

@router.put("/{key}")
async def update_setting(key: str, data: dict, db: AsyncSession = Depends(get_db)):
    if key in API_KEY_NAMES:
        raise HTTPException(
            status_code=403, 
            detail="Security policy: AI API Keys cannot be modified via Web/API. Please configure them directly in the server .env file."
        )
    return await settings_service.update_setting(db, key, data.get("value", ""), SettingCategory.GENERAL)
