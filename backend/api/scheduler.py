from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from apscheduler.triggers.cron import CronTrigger
from backend.database import get_db
from backend.repositories.scheduler_repo import scheduler_repo
from backend.services.scheduler_service import scheduler_service

router = APIRouter(prefix="/api/schedulers", tags=["schedulers"])

def attach_scheduler_extra(scheduler):
    if not scheduler:
        return None
    
    data = {
        "id": scheduler.id,
        "name": scheduler.name,
        "status": scheduler.status,
        "is_enabled": scheduler.is_enabled,
        "cron_expression": scheduler.cron_expression,
        "timezone": scheduler.timezone,
        "topic": scheduler.topic,
        "language": scheduler.language,
        "tone": scheduler.tone,
        "audience": scheduler.audience,
        "provider_name": scheduler.provider_name,
        "model_name": scheduler.model_name,
        "output_type": scheduler.output_type,
        "template_id": scheduler.template_id,
        "footer_username": scheduler.footer_username,
        "upload_destination": scheduler.upload_destination,
        "destination": scheduler.upload_destination or "facebook",
        "facebook_page_id": scheduler.facebook_page_id,
        "last_run_at": scheduler.last_run_at,
        "created_at": scheduler.created_at,
        "updated_at": scheduler.updated_at,
        "next_run_at": None
    }
    
    if scheduler.is_enabled and scheduler.cron_expression:
        try:
            trigger = CronTrigger.from_crontab(scheduler.cron_expression)
            now = datetime.now()
            next_time = trigger.get_next_fire_time(None, now)
            if next_time:
                data["next_run_at"] = next_time.isoformat()
        except Exception:
            data["next_run_at"] = None
            
    return data

@router.get("")
async def list_schedulers(db: AsyncSession = Depends(get_db)):
    schedulers = await scheduler_repo.list_all(db)
    return [attach_scheduler_extra(s) for s in schedulers]

@router.get("/{id}")
async def get_scheduler(id: int, db: AsyncSession = Depends(get_db)):
    res = await scheduler_repo.get_by_id(db, id)
    if not res:
        raise HTTPException(404, "Not found")
    return attach_scheduler_extra(res)

@router.post("")
async def create_scheduler(data: dict, db: AsyncSession = Depends(get_db)):
    res = await scheduler_repo.create(db, data)
    
    # Sync with engine
    from backend.scheduler_engine.engine import scheduler_engine
    if res.is_enabled:
        scheduler_engine.add_job(res)
        
    return attach_scheduler_extra(res)

@router.put("/{id}")
async def update_scheduler(id: int, data: dict, db: AsyncSession = Depends(get_db)):
    s = await scheduler_repo.get_by_id(db, id)
    if not s:
        raise HTTPException(404, "Not found")
    res = await scheduler_repo.update(db, s, data)
    
    # Sync with engine
    from backend.scheduler_engine.engine import scheduler_engine
    if res.is_enabled:
        scheduler_engine.add_job(res)
    else:
        scheduler_engine.remove_job(res.id)
        
    return attach_scheduler_extra(res)

@router.delete("/{id}")
async def delete_scheduler(id: int, db: AsyncSession = Depends(get_db)):
    from backend.scheduler_engine.engine import scheduler_engine
    scheduler_engine.remove_job(id)
    await scheduler_repo.delete(db, id)
    return {"ok": True}

@router.post("/{id}/toggle")
async def toggle_scheduler(id: int, db: AsyncSession = Depends(get_db)):
    res = await scheduler_service.toggle_enabled(db, id)
    if not res:
        raise HTTPException(404)
        
    from backend.scheduler_engine.engine import scheduler_engine
    if res.is_enabled:
        scheduler_engine.add_job(res)
    else:
        scheduler_engine.remove_job(res.id)
        
    return attach_scheduler_extra(res)

@router.post("/{id}/trigger")
async def trigger_scheduler(id: int, db: AsyncSession = Depends(get_db)):
    await scheduler_service.manual_trigger(db, id)
    return {"ok": True}
