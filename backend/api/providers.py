from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.repositories.provider_repo import provider_repo
from backend.models.models import Provider
from backend.models.enums import ProviderType
from backend.services.env_service import get_env_key
from typing import List, Optional

router = APIRouter(prefix="/api/providers", tags=["providers"])

DEFAULT_PROVIDERS = [
    {
        "name": "OpenAI",
        "type": ProviderType.TEXT,
        "provider_key": "openai",
        "api_key": "OPENAI_API_KEY",
        "default_model": "gpt-4o-mini",
        "available_models": ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"],
        "is_active": True
    },
    {
        "name": "Google Gemini",
        "type": ProviderType.TEXT,
        "provider_key": "gemini",
        "api_key": "GEMINI_API_KEY",
        "default_model": "gemini-3.1-flash-lite",
        "available_models": ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-3.5-flash"],
        "is_active": True
    },
    {
        "name": "Anthropic Claude",
        "type": ProviderType.TEXT,
        "provider_key": "claude",
        "api_key": "ANTHROPIC_API_KEY",
        "default_model": "claude-3-5-sonnet-20241022",
        "available_models": ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
        "is_active": True
    },
    {
        "name": "DeepSeek",
        "type": ProviderType.TEXT,
        "provider_key": "deepseek",
        "api_key": "DEEPSEEK_API_KEY",
        "default_model": "deepseek-chat",
        "available_models": ["deepseek-chat", "deepseek-coder"],
        "is_active": True
    },
    {
        "name": "Local Ollama",
        "type": ProviderType.TEXT,
        "provider_key": "local",
        "api_key": "",
        "base_url": "http://localhost:11434",
        "default_model": "llama3.2",
        "available_models": ["llama3.2", "mistral", "gemma2"],
        "is_active": True
    }
]

async def ensure_default_providers(db: AsyncSession):
    existing = await provider_repo.list_all(db)
    if not existing:
        for p in DEFAULT_PROVIDERS:
            data = p.copy()
            data.pop("available_models", None)
            await provider_repo.create(db, data)

@router.get("")
async def get_providers(
    configured_only: bool = Query(False),
    db: AsyncSession = Depends(get_db)
):
    await ensure_default_providers(db)
    providers = await provider_repo.get_active(db)
    
    result = []
    for p in providers:
        # Match available models
        models = [p.default_model]
        for dp in DEFAULT_PROVIDERS:
            if dp["provider_key"] == p.provider_key:
                models = dp["available_models"]
                break
        
        # Check if provider has valid API key configured in .env (local is always considered configured)
        is_configured = True if p.provider_key == "local" else bool(get_env_key(p.api_key))
        
        if configured_only and not is_configured:
            continue
            
        result.append({
            "id": p.id,
            "name": p.name,
            "provider_key": p.provider_key,
            "api_key_name": p.api_key,
            "default_model": p.default_model,
            "available_models": models,
            "base_url": p.base_url,
            "is_active": p.is_active,
            "is_configured": is_configured
        })
    return result

@router.post("")
async def create_provider(data: dict, db: AsyncSession = Depends(get_db)):
    provider = await provider_repo.create(db, {
        "name": data.get("name"),
        "type": ProviderType.TEXT,
        "provider_key": data.get("provider_key"),
        "api_key": data.get("api_key_name", ""),
        "base_url": data.get("base_url"),
        "default_model": data.get("default_model"),
        "is_active": data.get("is_active", True)
    })
    return provider
