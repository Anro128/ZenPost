from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.repositories.content_repo import content_repo

router = APIRouter(prefix="/api/history", tags=["history"])

@router.get("")
async def list_history(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    return await content_repo.list_paginated(db, offset=skip, limit=limit)

@router.get("/{id}")
async def get_history(id: int, db: AsyncSession = Depends(get_db)):
    res = await content_repo.get_by_id(db, id)
    if not res: raise HTTPException(404, "Not found")
    return res

@router.delete("/{id}")
async def delete_history(id: int, db: AsyncSession = Depends(get_db)):
    await content_repo.delete(db, id)
    return {"ok": True}
