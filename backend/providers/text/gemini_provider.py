import httpx
import time
import json
from typing import Optional
from backend.providers.base import AITextProvider, GenerateOptions, GenerateResult

class GeminiProvider(AITextProvider):
    async def generate(self, prompt: str, options: GenerateOptions = GenerateOptions()) -> GenerateResult:
        start_time = time.time()
        model = options.model or "gemini-2.0-flash"
        url = self.base_url or f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        
        system_prompt = (
            "You are an AI assistant. Always respond in valid JSON matching this schema: "
            "{'text': '...', 'caption': '...', 'hashtags': ['...'], 'keywords': ['...'], 'title': '...'}"
        )
        
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": system_prompt + "\n\n" + prompt}]}
            ],
            "generationConfig": {
                "temperature": options.temperature,
                "maxOutputTokens": options.max_tokens,
                "responseMimeType": "application/json"
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{url}?key={self.api_key}", 
                json=payload, 
                timeout=60.0
            )
            response.raise_for_status()
            data = response.json()
            
        content = data["candidates"][0]["content"]["parts"][0]["text"]
        result_dict = json.loads(content)
        duration_ms = int((time.time() - start_time) * 1000)
        
        return GenerateResult(
            text=result_dict.get("text", ""),
            caption=result_dict.get("caption", ""),
            hashtags=result_dict.get("hashtags", []),
            keywords=result_dict.get("keywords", []),
            title=result_dict.get("title", ""),
            model_used=model,
            cost=0.0,
            duration_ms=duration_ms
        )
        
    async def health_check(self) -> bool:
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={self.api_key}"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=10.0)
                return response.status_code == 200
        except Exception:
            return False
