import asyncio
from typing import Dict, Any
from backend.repositories.job_repo import job_repo
from backend.repositories.scheduler_repo import scheduler_repo
from backend.repositories.content_repo import content_repo
from backend.repositories.template_repo import template_repo
from backend.models.enums import JobStatus, JobType, OutputType, ContentStatus, UploadStatus
from backend.services.generator_service import generator_service
from backend.services.renderer_service import renderer_service
from backend.services.upload_service import upload_service
from backend.renderer.image_renderer import RenderConfig
from sqlalchemy.ext.asyncio import AsyncSession
import traceback

class QueueService:
    def __init__(self):
        self.queue = asyncio.Queue()
        self.workers = []
        
    async def start(self):
        for i in range(3):
            task = asyncio.create_task(self.worker(i))
            self.workers.append(task)
            
    async def stop(self):
        for task in self.workers:
            task.cancel()
            
    async def enqueue(self, db: AsyncSession, job_type: JobType, payload: Dict[str, Any], scheduler_id: int = None) -> int:
        job = await job_repo.create(db, {
            "type": job_type,
            "payload": payload,
            "scheduler_id": scheduler_id,
            "status": JobStatus.PENDING
        })
        await self.queue.put(job.id)
        return job.id
        
    async def worker(self, worker_id: int):
        from backend.database import AsyncSessionLocal
        
        while True:
            try:
                job_id = await self.queue.get()
                async with AsyncSessionLocal() as db:
                    job = await job_repo.get_by_id(db, job_id)
                    if not job:
                        self.queue.task_done()
                        continue
                        
                    await job_repo.update(db, job, {"status": JobStatus.RUNNING})
                    
                    try:
                        if job.type == JobType.GENERATE:
                            scheduler_id = job.payload.get("scheduler_id")
                            scheduler = await scheduler_repo.get_by_id(db, scheduler_id)
                            if not scheduler:
                                raise ValueError(f"Scheduler {scheduler_id} not found")
                            
                            content = await generator_service.generate_for_scheduler(db, scheduler)
                            
                            # Enqueue render
                            render_type = JobType.RENDER_IMAGE if scheduler.output_type == OutputType.IMAGE else JobType.RENDER_VIDEO
                            await self.enqueue(db, render_type, {
                                "content_id": content.id,
                                "scheduler_id": scheduler_id
                            }, scheduler_id=scheduler_id)
                            
                        elif job.type in (JobType.RENDER_IMAGE, JobType.RENDER_VIDEO):
                            content_id = job.payload.get("content_id")
                            scheduler_id = job.payload.get("scheduler_id")
                            content = await content_repo.get_by_id(db, content_id)
                            scheduler = await scheduler_repo.get_by_id(db, scheduler_id)
                            
                            template_id = content.template_id or scheduler.template_id
                            template = None
                            if template_id:
                                template = await template_repo.get_by_id(db, template_id)
                            
                            if not template:
                                template = await template_repo.get_default(db)
                                
                            config = RenderConfig()
                            if template:
                                config.width = 1080
                                config.height = 1350 if scheduler.output_type == OutputType.IMAGE else 1920
                                config.font_family = template.font_family
                                config.font_size = template.font_size
                                config.font_weight = str(template.font_weight)
                                config.text_color = template.text_color
                                config.bg_color = template.bg_color
                                config.padding_x = template.padding_x
                                config.padding_y = template.padding_y
                                config.line_height = template.line_height
                                config.text_align = template.text_align
                                config.vertical_align = template.vertical_align
                                config.footer_font_size = template.footer_font_size
                                config.footer_color = template.footer_color
                                
                            output_type = OutputType.IMAGE if job.type == JobType.RENDER_IMAGE else OutputType.VIDEO
                            file_path = await renderer_service.render_content(
                                text=content.output_text,
                                footer=scheduler.footer_username,
                                output_type=output_type,
                                config=config
                            )
                            
                            update_data = {"status": ContentStatus.RENDERED}
                            if output_type == OutputType.IMAGE:
                                update_data["image_path"] = file_path
                            else:
                                update_data["video_path"] = file_path
                                
                            await content_repo.update(db, content, update_data)
                            
                            if scheduler.upload_destination and scheduler.upload_destination.lower() != "none":
                                await self.enqueue(db, JobType.UPLOAD, {
                                    "content_id": content.id,
                                    "scheduler_id": scheduler_id
                                }, scheduler_id=scheduler_id)
                                
                        elif job.type == JobType.UPLOAD:
                            content_id = job.payload.get("content_id")
                            scheduler_id = job.payload.get("scheduler_id")
                            content = await content_repo.get_by_id(db, content_id)
                            scheduler = await scheduler_repo.get_by_id(db, scheduler_id)
                            
                            # Simulate upload
                            await asyncio.sleep(2)
                            upload_url = f"https://example.com/post/{content_id}"
                            
                            await upload_service.record_upload(
                                db,
                                content_id=content_id,
                                platform=scheduler.upload_destination,
                                status=UploadStatus.SUCCESS,
                                url=upload_url
                            )
                            await content_repo.update(db, content, {"status": ContentStatus.UPLOADED})

                        await job_repo.update(db, job, {"status": JobStatus.COMPLETED})
                    except Exception as e:
                        print(f"Job {job_id} failed: {e}")
                        traceback.print_exc()
                        await job_repo.update(db, job, {
                            "status": JobStatus.FAILED,
                            "error": str(e)
                        })
                self.queue.task_done()
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"Worker {worker_id} error: {e}")
                traceback.print_exc()

queue_service = QueueService()
