from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_PASSWORD: str = ""  # Loaded dynamically from APP_PASSWORD in .env
    DATABASE_URL: str = "sqlite+aiosqlite:///./content_generator.db"
    STORAGE_PATH: str = "./storage"
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]
    DEFAULT_TIMEZONE: str = "UTC"
    SCHEDULER_ENABLED: bool = True

settings = Settings()
