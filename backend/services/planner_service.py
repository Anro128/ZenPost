from sqlalchemy.ext.asyncio import AsyncSession
from backend.repositories.planner_repo import planner_repo
from backend.models.models import PlannerItem
from backend.models.enums import PlannerStatus

class PlannerService:
    async def mark_generated(self, db: AsyncSession, item_id: int) -> PlannerItem:
        item = await planner_repo.get_by_id(db, item_id)
        if item:
            return await planner_repo.update(db, item, {"status": PlannerStatus.GENERATED})
        return None

planner_service = PlannerService()
