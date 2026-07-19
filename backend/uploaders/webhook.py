import httpx
from .base import BaseUploader

class WebhookUploader(BaseUploader):
    async def upload(self, content: dict, credentials: dict) -> str:
        url = credentials.get("webhook_url")
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=content, timeout=30.0)
            response.raise_for_status()
        return url
        
    async def validate_credentials(self, credentials: dict) -> bool:
        return "webhook_url" in credentials
