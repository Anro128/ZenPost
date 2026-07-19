from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./content_generator.db"
    STORAGE_PATH: str = "./storage"
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]
    DEFAULT_TIMEZONE: str = "UTC"
    SCHEDULER_ENABLED: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
