from .openai_provider import OpenAIProvider

class OpenRouterProvider(OpenAIProvider):
    async def generate(self, prompt: str, options) -> 'GenerateResult':
        self.base_url = self.base_url or "https://openrouter.ai/api/v1/chat/completions"
        options.model = options.model or "meta-llama/llama-3.1-8b-instruct"
        return await super().generate(prompt, options)
        
    async def health_check(self) -> bool:
        self.base_url = self.base_url or "https://openrouter.ai/api/v1/models"
        return await super().health_check()
