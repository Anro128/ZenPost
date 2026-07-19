import httpx
import time
import json
from typing import Optional
from backend.providers.base import AITextProvider, GenerateOptions, GenerateResult

class LocalProvider(AITextProvider):
    async def generate(self, prompt: str, options: GenerateOptions = GenerateOptions()) -> GenerateResult:
        start_time = time.time()
        url = self.base_url or "http://localhost:11434/api/generate"
        model = options.model or "llama3"
        
        system_prompt = (
            "You are an AI assistant. Always respond in valid JSON matching this schema: "
            "{'text': '...', 'caption': '...', 'hashtags': ['...'], 'keywords': ['...'], 'title': '...'}"
        )
        
        payload = {
            "model": model,
            "prompt": prompt,
            "system": system_prompt,
            "stream": False,
            "options": {
                "temperature": options.temperature,
                "num_predict": options.max_tokens
            },
            "format": "json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=60.0)
            response.raise_for_status()
            data = response.json()
            
        content = data.get("response", "")
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
        url = self.base_url or "http://localhost:11434/api/tags"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=5.0)
                return response.status_code == 200
        except Exception:
            return False
