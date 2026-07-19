import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from backend.database import async_session
from backend.repositories.scheduler_repo import scheduler_repo
from backend.scheduler_engine.pipeline import execute_pipeline

class SchedulerEngine:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        
    async def start(self):
        async with async_session() as db:
            schedulers = await scheduler_repo.get_enabled(db)
            for s in schedulers:
                self.add_job(s)
        self.scheduler.start()
        
    def add_job(self, scheduler_model):
        job_id = f"scheduler_{scheduler_model.id}"
        # Parse simple cron (e.g., "0 12 * * *")
        trigger = CronTrigger.from_crontab(scheduler_model.cron_expression)
        
        self.scheduler.add_job(
            execute_pipeline,
            trigger,
            id=job_id,
            args=[scheduler_model.id],
            replace_existing=True
        )
        
    def remove_job(self, scheduler_id: int):
        job_id = f"scheduler_{scheduler_id}"
        if self.scheduler.get_job(job_id):
            self.scheduler.remove_job(job_id)

scheduler_engine = SchedulerEngine()
