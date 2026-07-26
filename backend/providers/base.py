from abc import ABC, abstractmethod
from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class GenerateOptions(BaseModel):
    temperature: float = 0.7
    max_tokens: int = 1000
    model: Optional[str] = None

class GenerateResult(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    
    text: str
    caption: str
    hashtags: List[str]
    keywords: List[str]
    title: str
    model_used: str
    cost: float = 0.0
    duration_ms: int = 0

class AITextProvider(ABC):
    def __init__(self, api_key: str, base_url: Optional[str] = None):
        self.api_key = api_key
        self.base_url = base_url
    
    @abstractmethod
    async def generate(self, prompt: str, options: GenerateOptions = GenerateOptions()) -> GenerateResult:
        ...
    
    @abstractmethod
    async def health_check(self) -> bool:
        ...
