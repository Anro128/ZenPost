from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.repositories.scheduler_repo import scheduler_repo
from backend.services.scheduler_service import scheduler_service

router = APIRouter(prefix="/api/schedulers", tags=["schedulers"])

@router.get("")
async def list_schedulers(db: AsyncSession = Depends(get_db)):
    return await scheduler_repo.list_all(db)

@router.get("/{id}")
async def get_scheduler(id: int, db: AsyncSession = Depends(get_db)):
    res = await scheduler_repo.get_by_id(db, id)
    if not res: raise HTTPException(404, "Not found")
    return res

@router.post("")
async def create_scheduler(data: dict, db: AsyncSession = Depends(get_db)):
    return await scheduler_repo.create(db, data)

@router.put("/{id}")
async def update_scheduler(id: int, data: dict, db: AsyncSession = Depends(get_db)):
    s = await scheduler_repo.get_by_id(db, id)
    if not s: raise HTTPException(404, "Not found")
    return await scheduler_repo.update(db, s, data)

@router.delete("/{id}")
async def delete_scheduler(id: int, db: AsyncSession = Depends(get_db)):
    await scheduler_repo.delete(db, id)
    return {"ok": True}

@router.post("/{id}/toggle")
async def toggle_scheduler(id: int, db: AsyncSession = Depends(get_db)):
    res = await scheduler_service.toggle_enabled(db, id)
    if not res: raise HTTPException(404)
    return res

@router.post("/{id}/trigger")
async def trigger_scheduler(id: int, db: AsyncSession = Depends(get_db)):
    await scheduler_service.manual_trigger(db, id)
    return {"ok": True}
