import logging
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

# Note: If your model class is named 'Notifications' (plural), add an 's' to the end of Notifications here!
from models.notifications import Notifications 

logger = logging.getLogger(__name__)

class NotificationsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_list(
        self,
        skip: int = 0,
        limit: int = 20,
        query: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        try:
            count_query = select(func.count(Notifications.id))
            data_query = select(Notifications)
            if query:
                for field, value in query.items():
                    if hasattr(Notifications, field):
                        predicate = getattr(Notifications, field) == value
                        count_query = count_query.where(predicate)
                        data_query = data_query.where(predicate)
            total = (await self.db.execute(count_query)).scalar()
            if sort:
                descending = sort.startswith('-')
                field_name = sort[1:] if descending else sort
                if hasattr(Notifications, field_name):
                    column = getattr(Notifications, field_name)
                    data_query = data_query.order_by(column.desc() if descending else column.asc())
            data_query = data_query.offset(skip).limit(limit)
            items = (await self.db.execute(data_query)).scalars().all()
            
            return {"items": items, "total": total, "skip": skip, "limit": limit}
        except Exception as e:
            logger.error(f"Error fetching notifications: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Notifications]:
        return await self.db.scalar(select(Notifications).where(Notifications.id == obj_id))

    async def create(self, data: Dict[str, Any]) -> Notifications:
        obj = Notifications(**data)
        self.db.add(obj)
        try:
            await self.db.commit()
            await self.db.refresh(obj)
            return obj
        except Exception:
            await self.db.rollback()
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Notifications]:
        obj = await self.get_by_id(obj_id)
        if obj is None:
            return None
        for key, value in update_data.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        try:
            await self.db.commit()
            await self.db.refresh(obj)
            return obj
        except Exception:
            await self.db.rollback()
            raise

    async def delete(self, obj_id: int) -> bool:
        obj = await self.get_by_id(obj_id)
        if obj is None:
            return False
        try:
            await self.db.delete(obj)
            await self.db.commit()
            return True
        except Exception:
            await self.db.rollback()
            raise
