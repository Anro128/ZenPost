from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.services.renderer_service import renderer_service
from backend.renderer.image_renderer import RenderConfig
from backend.models.enums import OutputType
from backend.repositories.provider_repo import provider_repo
from backend.providers.factory import provider_factory
import asyncio

router = APIRouter(prefix="/api/generate", tags=["generator"])

@router.post("")
async def generate_content(data: dict, db: AsyncSession = Depends(get_db)):
    topic = data.get("topic", "Motivation")
    output_type_str = data.get("output_type", "image")
    
    try:
        output_type = OutputType(output_type_str)
    except ValueError:
        output_type = OutputType.IMAGE

    # 1. Generate text (try to use an active provider, else fallback)
    generated_text = f"Keep pushing forward! Success in {topic} comes to those who don't quit."
    
    try:
        # Try to find a configured provider
        providers = ["openai", "gemini", "claude"]
        for p in providers:
            config = await provider_repo.get_by_key(db, p)
            if config and config.api_key:
                ai_provider = provider_factory.get(p, config.api_key, config.base_url)
                from backend.providers.base import GenerateOptions
                prompt = f"Write a short, powerful motivational quote about {topic}. No quotes around the text."
                res = await ai_provider.generate(prompt, GenerateOptions())
                if res and res.text:
                    generated_text = res.text
                break
    except Exception as e:
        print(f"AI Generation skipped/failed: {e}")

    # 2. Render Media
    template_id = data.get("template_id")
    config_params = {}
    if template_id:
        from backend.repositories.template_repo import template_repo
        template = await template_repo.get_by_id(db, template_id)
        if template:
            config_params = {
                "layout": template.layout,
                "font_family": template.font_family,
                "font_size": template.font_size,
                "font_weight": template.font_weight,
                "text_color": template.text_color,
                "bg_color": template.bg_color,
                "padding_x": template.padding_x,
                "padding_y": template.padding_y,
                "line_height": template.line_height,
                "text_align": template.text_align,
                "vertical_align": template.vertical_align,
                "footer_font_size": template.footer_font_size,
                "footer_color": template.footer_color,
            }
            
    if not config_params:
        config_params = {
            "bg_color": "#141414",
            "text_color": "#ffffff",
            "font_size": 40,
            "text_align": "center",
            "layout": "centered"
        }
    
    config = RenderConfig(**config_params)
    
    footer_text = "@vibecoded"
    if template_id and template:
        if getattr(template, 'footer_text', None):
            footer_text = template.footer_text

    try:
        # Run rendering in thread pool to avoid blocking async event loop
        media_path = await asyncio.to_thread(
            lambda: asyncio.run(renderer_service.render_content(
                text=generated_text,
                footer=footer_text,
                output_type=output_type,
                config=config
            ))
        )
    except Exception as e:
        # renderer_service.render_content is async, so we don't need to_thread if it's already async
        media_path = await renderer_service.render_content(
            text=generated_text,
            footer=footer_text,
            output_type=output_type,
            config=config
        )

    import os
    # Convert absolute OS path to a relative URL path that FastAPI can serve
    media_filename = os.path.basename(media_path)
    if output_type == OutputType.IMAGE:
        media_url = f"http://localhost:8000/storage/images/{media_filename}"
    else:
        media_url = f"http://localhost:8000/storage/videos/{media_filename}"

    return {
        "status": "success",
        "message": "Manual generation completed successfully.",
        "text": generated_text,
        "media_url": media_url
    }
