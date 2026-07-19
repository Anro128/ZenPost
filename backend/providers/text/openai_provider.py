import httpx
import time
import json
from typing import Optional
from backend.providers.base import AITextProvider, GenerateOptions, GenerateResult

class OpenAIProvider(AITextProvider):
    async def generate(self, prompt: str, options: GenerateOptions = GenerateOptions()) -> GenerateResult:
        start_time = time.time()
        url = self.base_url or "https://api.openai.com/v1/chat/completions"
        model = options.model or "gpt-4o-mini"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        system_prompt = (
            "You are an AI assistant. Always respond in valid JSON matching this schema: "
            "{'text': '...', 'caption': '...', 'hashtags': ['...'], 'keywords': ['...'], 'title': '...'}"
        )
        
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": options.temperature,
            "max_tokens": options.max_tokens,
            "response_format": {"type": "json_object"}
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload, timeout=60.0)
            response.raise_for_status()
            data = response.json()
            
        content = data["choices"][0]["message"]["content"]
        result_dict = json.loads(content)
        
        # Dummy cost calculation
        cost = data["usage"]["total_tokens"] * 0.000001 
        duration_ms = int((time.time() - start_time) * 1000)
        
        return GenerateResult(
            text=result_dict.get("text", ""),
            caption=result_dict.get("caption", ""),
            hashtags=result_dict.get("hashtags", []),
            keywords=result_dict.get("keywords", []),
            title=result_dict.get("title", ""),
            model_used=model,
            cost=cost,
            duration_ms=duration_ms
        )
        
    async def health_check(self) -> bool:
        url = self.base_url or "https://api.openai.com/v1/models"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, timeout=10.0)
                return response.status_code == 200
        except Exception:
            return False
