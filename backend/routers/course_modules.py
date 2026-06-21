import json
import logging
from typing import Optional, List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_user, get_admin_user
from schemas.auth import UserResponse
from services.course_modules import CourseModulesService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/course_modules", tags=["course_modules"])

# Pydantic Schemas
class CourseModulesData(BaseModel):
    """Entity data schema (for create)"""
    course_id: int
    title: str
    description: Optional[str] = None
    order_index: int
    content_type: Optional[str] = None
    content: Optional[str] = None
    video_url: Optional[str] = None
    duration_minutes: Optional[int] = None
    created_at: Optional[datetime] = None

class CourseModulesUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    course_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None
    content_type: Optional[str] = None
    content: Optional[str] = None
    video_url: Optional[str] = None
    duration_minutes: Optional[int] = None
    created_at: Optional[datetime] = None

class CourseModulesResponse(BaseModel):
    id: int
    course_id: int
    title: str
    description: Optional[str] = None
    order_index: int
    content_type: Optional[str] = None
    content: Optional[str] = None
    video_url: Optional[str] = None
    duration_minutes: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CourseModulesListResponse(BaseModel):
    items: List[CourseModulesResponse]
    total: int
    skip: int
    limit: int

class CourseModulesBatchCreateRequest(BaseModel):
    items: List[CourseModulesData]

class CourseModulesBatchUpdateItem(BaseModel):
    id: int
    updates: CourseModulesUpdateData

class CourseModulesBatchUpdateRequest(BaseModel):
    items: List[CourseModulesBatchUpdateItem]

class CourseModulesBatchDeleteRequest(BaseModel):
    ids: List[int]


# Routes
@router.get("/", response_model=CourseModulesListResponse)
async def query_course_modules(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    try:
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        service = CourseModulesService(db)
        return await service.get_list(skip=skip, limit=limit, query=query_dict, sort=sort)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying course modules: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=CourseModulesResponse)
async def get_course_modules(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    try:
        service = CourseModulesService(db)
        result = await service.get_by_id(id)
        if not result:
            raise HTTPException(status_code=404, detail=f"Course module with id {id} not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching course module {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/", response_model=CourseModulesResponse, status_code=201)
async def create_course_module(
    data: CourseModulesData,
    current_user: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a single course module (admin only)"""
    service = CourseModulesService(db)
    try:
        payload = data.model_dump()
        if not payload.get("created_at"):
            payload["created_at"] = datetime.utcnow()
        result = await service.create(payload)
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create course module")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating course module: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.put("/{id}", response_model=CourseModulesResponse)
async def update_course_module(
    id: int,
    data: CourseModulesUpdateData,
    current_user: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a single course module (admin only)"""
    service = CourseModulesService(db)
    try:
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            raise HTTPException(status_code=404, detail=f"Course module with id {id} not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating course module: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{id}")
async def delete_course_module(
    id: int,
    current_user: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single course module (admin only)"""
    service = CourseModulesService(db)
    try:
        success = await service.delete(id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Course module with id {id} not found")
        return {"message": "Course module deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting course module: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=CourseModulesListResponse, status_code=201)
async def create_course_modules_batch(
    request: CourseModulesBatchCreateRequest,
    current_user: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = CourseModulesService(db)
    results = []
    try:
        for item in request.items:
            payload = item.model_dump()
            if not payload.get("created_at"):
                payload["created_at"] = datetime.utcnow()
            result = await service.create(payload)
            if result:
                results.append(result)
        return {"items": results, "total": len(results), "skip": 0, "limit": len(results)}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=CourseModulesListResponse)
async def update_course_modules_batch(
    request: CourseModulesBatchUpdateRequest,
    current_user: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = CourseModulesService(db)
    results = []
    try:
        for item in request.items:
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        return {"items": results, "total": len(results), "skip": 0, "limit": len(results)}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.delete("/batch")
async def delete_course_modules_batch(
    request: CourseModulesBatchDeleteRequest,
    current_user: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = CourseModulesService(db)
    deleted_count = 0
    try:
        for item_id in request.ids:
            if await service.delete(item_id):
                deleted_count += 1
        return {"message": f"Successfully deleted {deleted_count} modules", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
