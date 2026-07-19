from typing import Dict, Type, Optional
from .base import AITextProvider
from .text.openai_provider import OpenAIProvider
from .text.gemini_provider import GeminiProvider
from .text.claude_provider import ClaudeProvider
from .text.openrouter_provider import OpenRouterProvider
from .text.deepseek_provider import DeepSeekProvider
from .text.local_provider import LocalProvider

class ProviderFactory:
    def __init__(self):
        self._providers: Dict[str, Type[AITextProvider]] = {}
        self._instances: Dict[str, AITextProvider] = {}
        
        # Auto-register defaults
        self.register("openai", OpenAIProvider)
        self.register("gemini", GeminiProvider)
        self.register("claude", ClaudeProvider)
        self.register("openrouter", OpenRouterProvider)
        self.register("deepseek", DeepSeekProvider)
        self.register("local", LocalProvider)

    def register(self, key: str, provider_class: Type[AITextProvider]):
        self._providers[key] = provider_class

    def get(self, key: str, api_key: str, base_url: Optional[str] = None) -> AITextProvider:
        if key not in self._providers:
            raise ValueError(f"Provider {key} not found")
        
        # Simple caching per instance key
        instance_key = f"{key}_{api_key}_{base_url}"
        if instance_key not in self._instances:
            self._instances[instance_key] = self._providers[key](api_key=api_key, base_url=base_url)
            
        return self._instances[instance_key]

provider_factory = ProviderFactory()
