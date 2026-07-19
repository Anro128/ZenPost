from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.services.analytics_service import analytics_service
from backend.repositories.analytics_repo import analytics_repo
from datetime import date, timedelta

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/dashboard")
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    return await analytics_service.get_dashboard_stats(db)

@router.get("/daily")
async def get_daily(days: int = 7, db: AsyncSession = Depends(get_db)):
    end = date.today()
    start = end - timedelta(days=days)
    return await analytics_repo.get_by_date_range(db, start, end)
