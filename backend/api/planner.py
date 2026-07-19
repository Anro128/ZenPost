from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.repositories.planner_repo import planner_repo

router = APIRouter(prefix="/api/planner", tags=["planner"])

@router.get("")
async def list_planner(db: AsyncSession = Depends(get_db)):
    return await planner_repo.list_all(db)

@router.post("")
async def create_planner(data: dict, db: AsyncSession = Depends(get_db)):
    return await planner_repo.create(db, data)

@router.put("/{id}")
async def update_planner(id: int, data: dict, db: AsyncSession = Depends(get_db)):
    p = await planner_repo.get_by_id(db, id)
    if not p: raise HTTPException(404)
    return await planner_repo.update(db, p, data)

@router.delete("/{id}")
async def delete_planner(id: int, db: AsyncSession = Depends(get_db)):
    await planner_repo.delete(db, id)
    return {"ok": True}
