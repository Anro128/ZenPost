import httpx
from .base import BaseUploader

class ExternalPlannerUploader(BaseUploader):
    async def upload(self, content: dict, credentials: dict) -> str:
        url = credentials.get("api_url")
        api_key = credentials.get("api_key")
        headers = {"Authorization": f"Bearer {api_key}"}
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=content, headers=headers, timeout=30.0)
            response.raise_for_status()
        return response.json().get("id", url)
        
    async def validate_credentials(self, credentials: dict) -> bool:
        return "api_url" in credentials and "api_key" in credentials
