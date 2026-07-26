from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from datetime import datetime, timezone
from apscheduler.triggers.cron import CronTrigger
from backend.repositories.analytics_repo import analytics_repo
from backend.models.models import GeneratedContent, Scheduler, FacebookPage, Job
from backend.models.enums import ContentStatus

class AnalyticsService:
    async def get_dashboard_stats(self, db: AsyncSession):
        today_stats = await analytics_repo.get_today(db)
        
        # Total generated count
        gen_res = await db.execute(select(func.count()).select_from(GeneratedContent))
        total_generated = gen_res.scalar_one() or 0

        # Total uploaded count
        up_res = await db.execute(
            select(func.count()).select_from(GeneratedContent).where(GeneratedContent.status == ContentStatus.UPLOADED)
        )
        total_uploaded = up_res.scalar_one() or 0

        # Active schedulers count
        sched_res = await db.execute(select(func.count()).select_from(Scheduler).where(Scheduler.is_enabled == True))
        total_schedulers = sched_res.scalar_one() or 0

        # Facebook pages count
        fb_res = await db.execute(select(func.count()).select_from(FacebookPage).where(FacebookPage.token_valid == True))
        facebook_pages_count = fb_res.scalar_one() or 0

        # Upcoming jobs (from active schedulers)
        schedulers_q = await db.execute(select(Scheduler).where(Scheduler.is_enabled == True).limit(5))
        active_schedulers = schedulers_q.scalars().all()
        
        upcoming_jobs = []
        for s in active_schedulers:
            next_run_str = "Scheduled"
            if s.cron_expression:
                try:
                    trigger = CronTrigger.from_crontab(s.cron_expression)
                    next_time = trigger.get_next_fire_time(None, datetime.now())
                    if next_time:
                        next_run_str = next_time.strftime("%d %b %H:%M")
                except Exception:
                    pass
                    
            upcoming_jobs.append({
                "id": s.id,
                "scheduler_name": s.name,
                "next_run": next_run_str,
                "topic": s.topic
            })

        # Recent Activity (Latest Generated Contents)
        recent_q = await db.execute(select(GeneratedContent).order_by(desc(GeneratedContent.created_at)).limit(5))
        recent_contents = recent_q.scalars().all()
        
        recent_activity = []
        for c in recent_contents:
            recent_activity.append({
                "id": c.id,
                "type": "error" if c.status == ContentStatus.FAILED else "success",
                "title": c.title or c.output_text[:30] + "...",
                "status": c.status.value if hasattr(c.status, 'value') else str(c.status),
                "timestamp": c.created_at.strftime("%H:%M") if c.created_at else "Just now"
            })

        # Provider breakdown dict
        provider_res = await db.execute(
            select(GeneratedContent.provider_used, func.count(GeneratedContent.id)).group_by(GeneratedContent.provider_used)
        )
        provider_breakdown = {}
        for row in provider_res.all():
            p_name = row[0] or "gemini"
            provider_breakdown[p_name] = row[1] or 0

        return {
            "total_generated": total_generated,
            "total_uploaded": total_uploaded,
            "total_schedulers": total_schedulers,
            "facebook_pages_count": facebook_pages_count,
            "generated_today": today_stats.total_generated if today_stats else 0,
            "uploaded_today": today_stats.total_uploaded if today_stats else 0,
            "failed_today": today_stats.total_failed if today_stats else 0,
            "cost_today": today_stats.cost_total if today_stats else 0.0,
            "upcoming_jobs": upcoming_jobs,
            "recent_activity": recent_activity,
            "provider_breakdown": provider_breakdown
        }

analytics_service = AnalyticsService()
