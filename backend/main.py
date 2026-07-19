from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from backend.config import settings
from backend.database import engine, Base
from backend.api.health import router as health_router
from backend.api.scheduler import router as scheduler_router
from backend.api.generator import router as generator_router
from backend.api.template import router as template_router
from backend.api.history import router as history_router
from backend.api.analytics import router as analytics_router
from backend.api.planner import router as planner_router
from backend.api.upload import router as upload_router
from backend.api.settings import router as settings_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    os.makedirs(os.path.join(settings.STORAGE_PATH, "images"), exist_ok=True)
    os.makedirs(os.path.join(settings.STORAGE_PATH, "videos"), exist_ok=True)
    
    # Start background services
    from backend.services.queue_service import queue_service
    from backend.scheduler_engine.engine import scheduler_engine
    await queue_service.start()
    await scheduler_engine.start()
    
    yield
    
    # Stop background services
    await queue_service.stop()

app = FastAPI(title="AI Content Generator", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.STORAGE_PATH, exist_ok=True)
app.mount("/storage", StaticFiles(directory=settings.STORAGE_PATH), name="storage")

app.include_router(health_router)
app.include_router(scheduler_router)
app.include_router(generator_router)
app.include_router(template_router)
app.include_router(history_router)
app.include_router(analytics_router)
app.include_router(planner_router)
app.include_router(upload_router)
app.include_router(settings_router)

@app.get("/")
async def root():
    return {"status": "ok", "service": "AI Content Generator API"}
