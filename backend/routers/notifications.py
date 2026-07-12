import json
import logging
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user, get_current_user
from schemas.auth import UserResponse
from services.notifications import NotificationsService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/notifications", tags=["notifications"])

# Pydantic Schemas
class NotificationsData(BaseModel):
    """Entity data schema (for create/update)"""
    title: str
    message: str
    type: str
    target_audience: Optional[str] = None
    is_urgent: Optional[bool] = None
    created_at: Optional[str] = None
    created_by: Optional[str] = None

class NotificationsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    title: Optional[str] = None
    message: Optional[str] = None
    type: Optional[str] = None
    target_audience: Optional[str] = None
    is_urgent: Optional[bool] = None
    created_at: Optional[str] = None
    created_by: Optional[str] = None

class NotificationsResponse(BaseModel):
    """Entity response schema"""
    id: int
    title: str
    message: str
    type: str
    target_audience: Optional[str] = None
    is_urgent: Optional[bool] = None
    created_at: Optional[str] = None
    created_by: Optional[str] = None

    class Config:
        from_attributes = True

class NotificationsListResponse(BaseModel):
    """List response schema"""
    items: List[NotificationsResponse]
    total: int
    skip: int
    limit: int

# Routes
@router.get("/", response_model=NotificationsListResponse)
async def query_notifications(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    logger.debug(f"Querying notifications: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    service = NotificationsService(db)
    try:
        query_dict = json.loads(query) if query else None
        return await service.get_list(skip=skip, limit=limit, query=query_dict, sort=sort)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid query JSON format")
    except Exception as e:
        logger.error(f"Error querying notifications: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/", response_model=NotificationsResponse, status_code=201, dependencies=[Depends(get_admin_user)])
async def create_notifications(
    data: NotificationsData,
    db: AsyncSession = Depends(get_db),
):
    service = NotificationsService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create notifications")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/{id}", response_model=NotificationsResponse, dependencies=[Depends(get_admin_user)])
async def update_notifications(
    id: int,
    data: NotificationsUpdateData,
    db: AsyncSession = Depends(get_db),
):
    service = NotificationsService(db)
    try:
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            raise HTTPException(status_code=404, detail="Notifications with id not found for update")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{id}", dependencies=[Depends(get_admin_user)])
async def delete_notifications(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    service = NotificationsService(db)
    try:
        if not await service.delete(id):
            raise HTTPException(status_code=404, detail="Notifications not found for deletion")
        return {"message": "Successfully deleted notification"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
