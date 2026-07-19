from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.repositories.template_repo import template_repo

router = APIRouter(prefix="/api/templates", tags=["templates"])

@router.get("")
async def list_templates(db: AsyncSession = Depends(get_db)):
    return await template_repo.list_all(db)

@router.get("/{id}")
async def get_template(id: int, db: AsyncSession = Depends(get_db)):
    res = await template_repo.get_by_id(db, id)
    if not res: raise HTTPException(404, "Not found")
    return res

@router.post("")
async def create_template(data: dict, db: AsyncSession = Depends(get_db)):
    return await template_repo.create(db, data)

@router.put("/{id}")
async def update_template(id: int, data: dict, db: AsyncSession = Depends(get_db)):
    s = await template_repo.get_by_id(db, id)
    if not s: raise HTTPException(404, "Not found")
    return await template_repo.update(db, s, data)

@router.delete("/{id}")
async def delete_template(id: int, db: AsyncSession = Depends(get_db)):
    await template_repo.delete(db, id)
    return {"ok": True}
