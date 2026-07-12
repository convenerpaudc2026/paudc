import json
import logging
from typing import Optional, List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user, get_optional_user
from schemas.auth import UserResponse
from services.courses import CoursesService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/courses", tags=["courses"])

# Pydantic Schemas
class CoursesData(BaseModel):
    """Entity data schema (for create/update)"""
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    difficulty_level: str
    estimated_hours: Optional[int] = None
    is_published: Optional[bool] = None
    created_by: Optional[str] = None

class CoursesUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    title: Optional[str] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    difficulty_level: Optional[str] = None
    estimated_hours: Optional[int] = None
    is_published: Optional[bool] = None
    created_by: Optional[str] = None

class CoursesResponse(BaseModel):
    """Entity response schema"""
    id: int
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    difficulty_level: str
    estimated_hours: Optional[int] = None
    is_published: Optional[bool] = None
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CoursesListResponse(BaseModel):
    """List response schema"""
    items: List[CoursesResponse]
    total: int
    skip: int
    limit: int

class CoursesBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[CoursesData]

class CoursesBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: CoursesUpdateData

class CoursesBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[CoursesBatchUpdateItem]

class CoursesBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# Routes
@router.get("/", response_model=CoursesListResponse)
async def query_courses(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: Optional[UserResponse] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """Query courses with filtering, sorting, and pagination"""
    logger.debug(f"Querying courses: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    try:
        # Parse query JSON if provided
        query_dict = {}
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        if not current_user or current_user.role != 'admin':
            query_dict['is_published'] = True

        service = CoursesService(db)
        result = await service.get_list(
            skip=skip,
            limit=limit,
            query=query_dict,
            sort=sort,
        )
        
        logger.debug(f"Found {result['total']} courses")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying courses: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=CoursesResponse)
async def get_courses(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: Optional[UserResponse] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single courses by ID"""
    logger.debug(f"Fetching courses with id {id}, fields={fields}")
    
    try:
        service = CoursesService(db)
        result = await service.get_by_id(id)
        
        if not result:
            raise HTTPException(status_code=404, detail=f"Courses with id {id} not found")
        if not result.is_published and (not current_user or current_user.role != 'admin'):
            raise HTTPException(status_code=404, detail='Course not found')
            
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching courses module {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/", response_model=CoursesResponse, status_code=201)
async def create_course(
    data: CoursesData,
    current_user: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a single course (admin only)"""
    service = CoursesService(db)
    try:
        payload = data.model_dump()
        payload["created_by"] = payload.get("created_by") or str(current_user.id)
        payload["created_at"] = datetime.utcnow()
        payload["updated_at"] = datetime.utcnow()
        result = await service.create(payload)
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create course")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating course: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.put("/{id}", response_model=CoursesResponse)
async def update_course(
    id: int,
    data: CoursesUpdateData,
    current_user: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a single course (admin only)"""
    service = CoursesService(db)
    try:
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        update_dict["updated_at"] = datetime.utcnow()
        result = await service.update(id, update_dict)
        if not result:
            raise HTTPException(status_code=404, detail=f"Course with id {id} not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating course: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{id}")
async def delete_course(
    id: int,
    current_user: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single course (admin only)"""
    service = CoursesService(db)
    try:
        success = await service.delete(id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Course with id {id} not found")
        return {"message": "Course deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting course: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=CoursesListResponse, status_code=201, dependencies=[Depends(get_admin_user)])
async def create_courses_batch(
    request: CoursesBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple courses in a single request"""
    logger.debug(f"Batch creating {len(request.items)} courses")
    
    service = CoursesService(db)
    results = []
    
    try:
        for item in request.items:
            result = await service.create(item.model_dump())
            if result:
                results.append(result)
                
        logger.info(f"Batch created {len(results)} courses successfully")
        return {"items": results, "total": len(results), "skip": 0, "limit": len(results)}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=CoursesListResponse, dependencies=[Depends(get_admin_user)])
async def update_courses_batch(
    request: CoursesBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple courses in a single request"""
    logger.debug(f"Batch updating {len(request.items)} courses")
    
    service = CoursesService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
                
        logger.info(f"Batch updated {len(results)} courses successfully")
        return {"items": results, "total": len(results), "skip": 0, "limit": len(results)}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.delete("/batch", dependencies=[Depends(get_admin_user)])
async def delete_courses_batch(
    request: CoursesBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple courses by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} courses")
    
    service = CoursesService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
                
        logger.info(f"Courses ({deleted_count}) deleted successfully")
        return {"message": f"Successfully deleted {deleted_count} courses", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting courses: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
