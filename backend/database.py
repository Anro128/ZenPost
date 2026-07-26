import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from backend.config import settings

# Ensure directory for SQLite database exists
if "sqlite" in settings.DATABASE_URL:
    db_file_path = settings.DATABASE_URL.split("///")[-1]
    db_dir = os.path.dirname(db_file_path)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)

engine = create_async_engine(settings.DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
AsyncSessionLocal = async_session
Base = declarative_base()

async def get_db():
    async with async_session() as session:
        yield session
