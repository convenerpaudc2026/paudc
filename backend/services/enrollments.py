import logging
from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from models.enrollments import Enrollments

logger = logging.getLogger(__name__)

class EnrollmentsService:
    """Service layer for Enrollments operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any], user_id: str) -> Optional[Enrollments]:
        """Create a new enrollment"""
        data["user_id"] = user_id
        obj = Enrollments(**data)
        self.db.add(obj)
        try:
            await self.db.commit()
            await self.db.refresh(obj)
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating enrollment: {str(e)}")
            raise

    async def get_list(self, skip: int = 0, limit: int = 20, query: Optional[Dict[str, Any]] = None, sort: Optional[str] = None, user_id: str = None) -> Dict[str, Any]:
        """Get paginated list of enrollments (user can only see their own records)"""
        try:
            count_query = select(func.count(Enrollments.id))
            if user_id:
                count_query = count_query.where(Enrollments.user_id == user_id)
                
            if query:
                for field, value in query.items():
                    if hasattr(Enrollments, field):
                        count_query = count_query.where(getattr(Enrollments, field) == value)
                        
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()
            
            data_query = select(Enrollments)
            if user_id:
                data_query = data_query.where(Enrollments.user_id == user_id)
                
            if query:
                for field, value in query.items():
                    if hasattr(Enrollments, field):
                        data_query = data_query.where(getattr(Enrollments, field) == value)
                        
            if sort:
                if sort.startswith("-"):
                    field_name = sort[1:]
                    if hasattr(Enrollments, field_name):
                        data_query = data_query.order_by(getattr(Enrollments, field_name).desc())
                else:
                    if hasattr(Enrollments, sort):
                        data_query = data_query.order_by(getattr(Enrollments, sort).asc())
                        
            data_query = data_query.offset(skip).limit(limit)
            result = await self.db.execute(data_query)
            
            return {
                "items": result.scalars().all(),
                "total": total,
                "skip": skip,
                "limit": limit
            }
        except Exception as e:
            logger.error(f"Error fetching enrollments list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any], user_id: str = None) -> Optional[Enrollments]:
        """Update enrollment (requires ownership)"""
        try:
            query = select(Enrollments).where(Enrollments.id == obj_id)
            if user_id:
                query = query.where(Enrollments.user_id == user_id)

            result = await self.db.execute(query)
            obj = result.scalar_one_or_none()

            if not obj:
                return None

            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating enrollment: {str(e)}")
            raise

    async def delete(self, obj_id: int, user_id: str = None) -> bool:
        """Delete enrollment (requires ownership)"""
        try:
            query = select(Enrollments).where(Enrollments.id == obj_id)
            if user_id:
                query = query.where(Enrollments.user_id == user_id)
                
            result = await self.db.execute(query)
            obj = result.scalar_one_or_none()
            
            if not obj:
                return False
                
            await self.db.delete(obj)
            await self.db.commit()
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting enrollment: {str(e)}")
            raise