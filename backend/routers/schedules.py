import json
import logging
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user, get_optional_user
from schemas.auth import UserResponse
from services.schedules import SchedulesService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/schedules", tags=["schedules"])

# Pydantic Schemas
class SchedulesData(BaseModel):
    event_date: str
    start_time: str
    end_time: str
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    category: str
    is_public: Optional[bool] = None
    created_at: Optional[str] = None

class SchedulesUpdateData(BaseModel):
    event_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    is_public: Optional[bool] = None
    created_at: Optional[str] = None

class SchedulesResponse(BaseModel):
    id: int
    event_date: str
    start_time: str
    end_time: str
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    category: str
    is_public: Optional[bool] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

class SchedulesListResponse(BaseModel):
    items: List[SchedulesResponse]
    total: int
    skip: int
    limit: int

class SchedulesBatchCreateRequest(BaseModel):
    items: List[SchedulesData]

class SchedulesBatchUpdateItem(BaseModel):
    id: int
    updates: SchedulesUpdateData

class SchedulesBatchUpdateRequest(BaseModel):
    items: List[SchedulesBatchUpdateItem]

class SchedulesBatchDeleteRequest(BaseModel):
    ids: List[int]


# Routes
@router.get("/", response_model=SchedulesListResponse)
async def query_schedules(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: Optional[UserResponse] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        query_dict = json.loads(query) if query else {}
        if not current_user or current_user.role != 'admin':
            query_dict['is_public'] = True
        service = SchedulesService(db)
        result = await service.get_list(skip=skip, limit=limit, query=query_dict, sort=sort)
        return result
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid query JSON format")
    except Exception as e:
        logger.error(f"Error querying schedules: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{id}", response_model=SchedulesResponse)
async def get_schedules(
    id: int,
    current_user: Optional[UserResponse] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    service = SchedulesService(db)
    result = await service.get_by_id(id)
    if not result:
        raise HTTPException(status_code=404, detail="Schedules not found")
    if not result.is_public and (not current_user or current_user.role != 'admin'):
        raise HTTPException(status_code=404, detail='Schedule not found')
    return result

@router.post("/batch", response_model=SchedulesListResponse, status_code=201, dependencies=[Depends(get_admin_user)])
async def create_schedules_batch(request: SchedulesBatchCreateRequest, db: AsyncSession = Depends(get_db)):
    service = SchedulesService(db)
    results = []
    try:
        for item in request.items:
            result = await service.create(item.model_dump())
            if result:
                results.append(result)
        return {"items": results, "total": len(results), "skip": 0, "limit": len(results)}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")

@router.delete("/batch", dependencies=[Depends(get_admin_user)])
async def delete_schedules_batch(request: SchedulesBatchDeleteRequest, db: AsyncSession = Depends(get_db)):
    service = SchedulesService(db)
    deleted_count = 0
    try:
        for item_id in request.ids:
            if await service.delete(item_id):
                deleted_count += 1
        return {"message": f"Successfully deleted {deleted_count} schedules"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{id}", dependencies=[Depends(get_admin_user)])
async def delete_schedule(id: int, db: AsyncSession = Depends(get_db)):
    service = SchedulesService(db)
    try:
        if not await service.delete(id):
            raise HTTPException(status_code=404, detail="Schedules not found for deletion")
        return {"message": "Successfully deleted schedules"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
