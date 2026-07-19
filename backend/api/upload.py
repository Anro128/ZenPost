from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.repositories.upload_repo import upload_repo

router = APIRouter(prefix="/api", tags=["upload"])

@router.get("/uploads")
async def list_uploads(db: AsyncSession = Depends(get_db)):
    return await upload_repo.list_all(db)

@router.post("/uploads/{content_id}")
async def upload_content(content_id: int, db: AsyncSession = Depends(get_db)):
    return {"status": "queued"}
    
@router.get("/upload-accounts")
async def get_accounts():
    return []
