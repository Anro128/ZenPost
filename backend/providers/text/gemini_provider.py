import httpx
import time
import json
import asyncio
from typing import Optional
from fastapi import HTTPException
from backend.providers.base import AITextProvider, GenerateOptions, GenerateResult

class GeminiProvider(AITextProvider):
    async def generate(self, prompt: str, options: GenerateOptions = GenerateOptions()) -> GenerateResult:
        start_time = time.time()
        primary_model = options.model or "gemini-3.1-flash-lite"
        if primary_model.startswith("models/"):
            primary_model = primary_model.replace("models/", "")
            
        # Candidate models to try in sequence if rate-limited
        models_to_try = [primary_model]
        fallback = "gemini-3.5-flash-lite" if primary_model == "gemini-3.1-flash-lite" else "gemini-3.1-flash-lite"
        if fallback not in models_to_try:
            models_to_try.append(fallback)
            
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
        
        last_error = None
        for current_model in models_to_try:
            url = self.base_url or f"https://generativelanguage.googleapis.com/v1beta/models/{current_model}:generateContent"
            
            # Retry up to 3 attempts with exponential backoff on 429
            for attempt in range(1, 4):
                try:
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
                        model_used=current_model,
                        cost=0.0,
                        duration_ms=duration_ms
                    )
                except httpx.HTTPStatusError as e:
                    last_error = e
                    if e.response.status_code == 429:
                        # Rate limit hit: wait before retrying or switching model
                        print(f"Gemini 429 Rate Limit on '{current_model}' (Attempt {attempt}/3). Retrying in {attempt * 2}s...")
                        if attempt < 3:
                            await asyncio.sleep(attempt * 2)
                    else:
                        raise e
                except Exception as e:
                    last_error = e
                    break
                    
        # If all attempts exhausted
        if last_error and isinstance(last_error, httpx.HTTPStatusError) and last_error.response.status_code == 429:
            raise HTTPException(
                status_code=429, 
                detail="Google Gemini Rate Limit Exceeded (429). You have hit Google's free request limit per minute. Please wait 15-30 seconds, or switch to another provider (OpenAI, DeepSeek, Local Ollama)."
            )
        raise HTTPException(status_code=500, detail=f"Gemini API request failed: {str(last_error)}")

    async def health_check(self) -> bool:
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={self.api_key}"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=10.0)
                return response.status_code == 200
        except Exception:
            return False
