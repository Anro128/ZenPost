import httpx
import time
import json
from typing import Optional
from backend.providers.base import AITextProvider, GenerateOptions, GenerateResult

class ClaudeProvider(AITextProvider):
    async def generate(self, prompt: str, options: GenerateOptions = GenerateOptions()) -> GenerateResult:
        start_time = time.time()
        url = self.base_url or "https://api.anthropic.com/v1/messages"
        model = options.model or "claude-sonnet-4-20250514"
        
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        
        system_prompt = (
            "You are an AI assistant. Always respond in valid JSON matching this schema: "
            "{'text': '...', 'caption': '...', 'hashtags': ['...'], 'keywords': ['...'], 'title': '...'}"
        )
        
        payload = {
            "model": model,
            "system": system_prompt,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": options.temperature,
            "max_tokens": options.max_tokens
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload, timeout=60.0)
            response.raise_for_status()
            data = response.json()
            
        content = data["content"][0]["text"]
        result_dict = json.loads(content)
        duration_ms = int((time.time() - start_time) * 1000)
        
        return GenerateResult(
            text=result_dict.get("text", ""),
            caption=result_dict.get("caption", ""),
            hashtags=result_dict.get("hashtags", []),
            keywords=result_dict.get("keywords", []),
            title=result_dict.get("title", ""),
            model_used=model,
            cost=0.0, # Calculate later
            duration_ms=duration_ms
        )
        
    async def health_check(self) -> bool:
        # Anthropic doesn't have a simple auth check endpoint, send a minimal message
        url = self.base_url or "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        payload = {
            "model": "claude-3-haiku-20240307",
            "messages": [{"role": "user", "content": "hello"}],
            "max_tokens": 1
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=payload, timeout=10.0)
                return response.status_code == 200
        except Exception:
            return False
