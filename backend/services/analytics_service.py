from sqlalchemy.ext.asyncio import AsyncSession
from backend.repositories.analytics_repo import analytics_repo
from datetime import date

class AnalyticsService:
    async def get_dashboard_stats(self, db: AsyncSession):
        today = date.today()
        today_stats = await analytics_repo.get_today(db)
        
        return {
            "generated_today": today_stats.total_generated if today_stats else 0,
            "uploaded_today": today_stats.total_uploaded if today_stats else 0,
            "failed_today": today_stats.total_failed if today_stats else 0,
            "cost_today": today_stats.cost_total if today_stats else 0.0
        }

analytics_service = AnalyticsService()
