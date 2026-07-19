from sqlalchemy.ext.asyncio import AsyncSession
from backend.repositories.upload_repo import upload_repo
from backend.models.enums import UploadStatus

class UploadService:
    async def record_upload(self, db: AsyncSession, content_id: int, platform: str, status: UploadStatus, url: str = None, error: str = None):
        await upload_repo.create(db, {
            "content_id": content_id,
            "platform": platform,
            "status": status,
            "upload_url": url,
            "error_message": error
        })

upload_service = UploadService()
