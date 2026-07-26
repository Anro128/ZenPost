from sqlalchemy.ext.asyncio import AsyncSession
from backend.services.prompt_builder import build_prompt, ensure_short_caption
from backend.providers.factory import provider_factory
from backend.models.models import Scheduler, GeneratedContent
from backend.models.enums import ContentStatus
from backend.repositories.content_repo import content_repo
from backend.repositories.provider_repo import provider_repo
from backend.services.env_service import get_env_key

class GeneratorService:
    async def generate_for_scheduler(self, db: AsyncSession, scheduler: Scheduler) -> GeneratedContent:
        provider_config = await provider_repo.get_by_key(db, scheduler.provider_name)
        if not provider_config:
            raise ValueError(f"Provider '{scheduler.provider_name}' not found in database")
            
        api_key_var = provider_config.api_key or f"{scheduler.provider_name.upper()}_API_KEY"
        api_key = get_env_key(api_key_var)
        
        if scheduler.provider_name != "local" and not api_key:
            raise ValueError(f"API key '{api_key_var}' for provider '{scheduler.provider_name}' is missing in .env")

        ai_provider = provider_factory.get(
            scheduler.provider_name, 
            api_key, 
            provider_config.base_url
        )
        
        prompt = build_prompt(
            topic=scheduler.topic,
            language=scheduler.language,
            tone=scheduler.tone,
            audience=scheduler.audience,
            prompt_override=scheduler.prompt_override,
            negative_prompt=scheduler.negative_prompt
        )
        
        from backend.providers.base import GenerateOptions
        options = GenerateOptions(model=scheduler.model_name or provider_config.default_model)
        
        result = await ai_provider.generate(prompt, options)
        
        # Ensure caption is strictly shorter than main content text
        safe_caption = ensure_short_caption(result.caption, result.text)
        
        content = await content_repo.create(db, {
            "scheduler_id": scheduler.id,
            "prompt_used": prompt,
            "output_text": result.text,
            "caption": safe_caption,
            "hashtags": result.hashtags,
            "keywords": result.keywords,
            "title": result.title,
            "provider_used": scheduler.provider_name,
            "model_used": result.model_used,
            "cost": result.cost,
            "duration_ms": result.duration_ms,
            "status": ContentStatus.GENERATING,
            "template_id": scheduler.template_id
        })
        
        return content

generator_service = GeneratorService()
