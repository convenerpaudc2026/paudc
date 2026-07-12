import json
import logging
from typing import Optional, List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user, get_current_user
from dependencies.course_access import require_course_access
from models.course_modules import CourseModules
from schemas.auth import UserResponse
from services.course_materials import CourseMaterialsService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/course_materials", tags=["course_materials"])

# Pydantic Schemas
class CourseMaterialsData(BaseModel):
    """Entity data schema (for create/update)"""
    module_id: int
    title: str
    material_type: str
    order_index: int
    created_at: Optional[datetime] = None

class CourseMaterialsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    module_id: Optional[int] = None
    title: Optional[str] = None
    material_type: Optional[str] = None
    order_index: Optional[int] = None
    created_at: Optional[datetime] = None

class CourseMaterialsResponse(BaseModel):
    """Entity response schema"""
    id: int
    module_id: int
    title: str
    material_type: str
    order_index: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CourseMaterialsListResponse(BaseModel):
    """List response schema"""
    items: List[CourseMaterialsResponse]
    total: int
    skip: int
    limit: int

class CourseMaterialsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[CourseMaterialsData]

class CourseMaterialsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: CourseMaterialsUpdateData

class CourseMaterialsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[CourseMaterialsBatchUpdateItem]

class CourseMaterialsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# Routes
@router.get("/", response_model=CourseMaterialsListResponse)
async def query_course_materials(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query course materials with filtering, sorting, and pagination"""
    logger.debug(f"Querying course materials: query={query}, sort={sort}, skip={skip}, limit={limit}")
    
    try:
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        if current_user.role != 'admin':
            module_id = query_dict.get('module_id') if query_dict else None
            if not isinstance(module_id, int):
                raise HTTPException(status_code=400, detail='module_id is required')
            module = await db.scalar(select(CourseModules).where(CourseModules.id == module_id))
            if module is None:
                raise HTTPException(status_code=404, detail='Module not found')
            await require_course_access(module.course_id, current_user, db)

        service = CourseMaterialsService(db)
        result = await service.get_list(
            skip=skip,
            limit=limit,
            query=query_dict,
            sort=sort,
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying course materials: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=CourseMaterialsResponse)
async def get_course_materials(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single course material by ID"""
    try:
        service = CourseMaterialsService(db)
        result = await service.get_by_id(id)
        if not result:
            raise HTTPException(status_code=404, detail=f"Course material with id {id} not found")
        if current_user.role != 'admin':
            module = await db.scalar(select(CourseModules).where(CourseModules.id == result.module_id))
            if module is None:
                raise HTTPException(status_code=404, detail='Module not found')
            await require_course_access(module.course_id, current_user, db)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching course material {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=CourseMaterialsListResponse, status_code=201, dependencies=[Depends(get_admin_user)])
async def create_course_materials_batch(
    request: CourseMaterialsBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple course materials in a single request"""
    service = CourseMaterialsService(db)
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


@router.put("/batch", response_model=CourseMaterialsListResponse, dependencies=[Depends(get_admin_user)])
async def update_course_materials_batch(
    request: CourseMaterialsBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple course materials in a single request"""
    service = CourseMaterialsService(db)
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


@router.delete("/batch", dependencies=[Depends(get_admin_user)])
async def delete_course_materials_batch(
    request: CourseMaterialsBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple course materials by their IDs"""
    service = CourseMaterialsService(db)
    deleted_count = 0
    try:
        for item_id in request.ids:
            if await service.delete(item_id):
                deleted_count += 1
        return {"message": f"Successfully deleted {deleted_count} materials", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
