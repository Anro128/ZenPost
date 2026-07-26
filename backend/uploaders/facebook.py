from .base import BaseUploader
from backend.services.facebook_service import facebook_service

class FacebookUploader(BaseUploader):
    async def upload(self, content: dict, credentials: dict) -> str:
        page_id = credentials.get("page_id")
        access_token = credentials.get("page_access_token")
        message = content.get("caption") or content.get("output_text") or "New Post"
        image_path = content.get("image_path")
        video_path = content.get("video_path")

        if not page_id or not access_token:
            raise ValueError("Missing page_id or page_access_token for Facebook upload")

        result = await facebook_service.publish_post(
            page_id=page_id,
            token=access_token,
            message=message,
            image_path=image_path,
            video_path=video_path
        )

        if not result.get("success"):
            raise Exception(result.get("error", "Unknown Facebook upload error"))

        post_id = result.get("post_id") or result.get("id")
        return f"https://facebook.com/{post_id}"

    async def validate_credentials(self, credentials: dict) -> bool:
        token = credentials.get("page_access_token")
        if not token:
            return False
        res = await facebook_service.validate_page_token(token)
        return res.get("valid", False)
