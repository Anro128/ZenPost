from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.services.renderer_service import renderer_service
from backend.renderer.image_renderer import RenderConfig
from backend.models.enums import OutputType
from backend.repositories.provider_repo import provider_repo
from backend.providers.factory import provider_factory
from backend.services.env_service import get_env_key
import asyncio

router = APIRouter(prefix="/api/generate", tags=["generator"])

@router.post("")
async def generate_content(data: dict, db: AsyncSession = Depends(get_db)):
    topic = data.get("topic", "Motivation")
    output_type_str = data.get("output_type", "image")
    provider_name = data.get("provider_name", "openai")
    model_name = data.get("model_name")
    
    try:
        output_type = OutputType(output_type_str)
    except ValueError:
        output_type = OutputType.IMAGE

    # 1. Generate text using requested Provider and Model
    generated_text = f"Keep pushing forward! Success in {topic} comes to those who don't quit."
    
    # Lookup provider in DB
    provider_config = await provider_repo.get_by_key(db, provider_name)
    api_key_env_var = provider_config.api_key if provider_config and provider_config.api_key else f"{provider_name.upper()}_API_KEY"
    api_key = get_env_key(api_key_env_var)
    
    if provider_name != "local" and not api_key:
        raise HTTPException(
            status_code=400, 
            detail=f"API key '{api_key_env_var}' is not configured in .env. Please add your key in Settings."
        )

    try:
        base_url = provider_config.base_url if provider_config else None
        ai_provider = provider_factory.get(provider_name, api_key, base_url)
        
        from backend.providers.base import GenerateOptions
        prompt = f"Write a short, powerful motivational quote about {topic}. Return text only without quotation marks."
        model = model_name or (provider_config.default_model if provider_config else "gpt-4o-mini")
        options = GenerateOptions(model=model)
        
        res = await ai_provider.generate(prompt, options)
        if res and res.text:
            generated_text = res.text
    except HTTPException:
        raise
    except Exception as e:
        print(f"AI Generation failed: {e}")
        # If AI generation fails, return explicit error
        raise HTTPException(status_code=500, detail=f"AI Generation failed with provider '{provider_name}': {str(e)}")

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
    if template_id and 'template' in locals() and template:
        if getattr(template, 'footer_text', None):
            footer_text = template.footer_text

    try:
        media_path = await asyncio.to_thread(
            lambda: asyncio.run(renderer_service.render_content(
                text=generated_text,
                footer=footer_text,
                output_type=output_type,
                config=config
            ))
        )
    except Exception:
        media_path = await renderer_service.render_content(
            text=generated_text,
            footer=footer_text,
            output_type=output_type,
            config=config
        )

    import os
    media_filename = os.path.basename(media_path)
    if output_type == OutputType.IMAGE:
        media_url = f"http://localhost:8000/storage/images/{media_filename}"
    else:
        media_url = f"http://localhost:8000/storage/videos/{media_filename}"

    return {
        "status": "success",
        "message": "Manual generation completed successfully.",
        "text": generated_text,
        "media_url": media_url,
        "provider_used": provider_name,
        "model_used": model_name or "default"
    }
