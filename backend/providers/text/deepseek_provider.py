from .openai_provider import OpenAIProvider

class DeepSeekProvider(OpenAIProvider):
    async def generate(self, prompt: str, options) -> 'GenerateResult':
        self.base_url = self.base_url or "https://api.deepseek.com/v1/chat/completions"
        options.model = options.model or "deepseek-chat"
        return await super().generate(prompt, options)
        
    async def health_check(self) -> bool:
        self.base_url = self.base_url or "https://api.deepseek.com/v1/models"
        return await super().health_check()
