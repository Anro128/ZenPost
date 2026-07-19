from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.services.settings_service import settings_service

router = APIRouter(prefix="/api/settings", tags=["settings"])

@router.get("")
async def get_all_settings(db: AsyncSession = Depends(get_db)):
    return await settings_service.get_all_grouped(db)

@router.put("/{key}")
async def update_setting(key: str, data: dict, db: AsyncSession = Depends(get_db)):
    from backend.repositories.setting_repo import setting_repo
    from backend.models.enums import SettingCategory
    return await setting_repo.upsert(db, key, data.get("value"), data.get("category", SettingCategory.GENERAL))
