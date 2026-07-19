from abc import ABC, abstractmethod

class BaseUploader(ABC):
    @abstractmethod
    async def upload(self, content: dict, credentials: dict) -> str:
        """Returns upload URL or ID on success"""
        pass
        
    @abstractmethod
    async def validate_credentials(self, credentials: dict) -> bool:
        pass
