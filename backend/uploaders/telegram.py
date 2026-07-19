import httpx
from .base import BaseUploader

class TelegramUploader(BaseUploader):
    async def upload(self, content: dict, credentials: dict) -> str:
        bot_token = credentials.get("bot_token")
        chat_id = credentials.get("chat_id")
        
        # Simplified upload (just sending text here, should send photo/video)
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": content.get("caption", "No caption")
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=30.0)
            response.raise_for_status()
        return f"tg://chat?id={chat_id}"
        
    async def validate_credentials(self, credentials: dict) -> bool:
        return "bot_token" in credentials and "chat_id" in credentials
