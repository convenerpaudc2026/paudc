import json
import logging
from typing import Optional, List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_user
from models.auth import User
from services.enrollments import EnrollmentsService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/enrollments", tags=["enrollments"])

# Pydantic Schemas
class EnrollmentsData(BaseModel):
    """Entity data schema (for create/update)"""
    course_id: int
    status: str

class EnrollmentsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    course_id: Optional[int] = None
    enrolled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    progress_percentage: Optional[int] = None
    status: Optional[str] = None

class EnrollmentsResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    course_id: int
    enrolled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    progress_percentage: Optional[int] = None
    status: str

    class Config:
        from_attributes = True

class EnrollmentsListResponse(BaseModel):
    """List response schema"""
    items: List[EnrollmentsResponse]
    total: int
    skip: int
    limit: int

class EnrollmentsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[EnrollmentsData]

class EnrollmentsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: EnrollmentsUpdateData

class EnrollmentsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[EnrollmentsBatchUpdateItem]

class EnrollmentsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# Routes
@router.get("/", response_model=EnrollmentsListResponse)
async def query_enrollments(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query enrollments with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying enrollments: query={query}, sort={sort}, skip={skip}, limit={limit}")
    
    service = EnrollmentsService(db)
    
    try:
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query=query_dict,
            sort=sort,
            user_id=str(current_user.id)
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying enrollments: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/", response_model=EnrollmentsResponse, status_code=201)
async def create_enrollments(
    data: EnrollmentsData,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new enrollment"""
    service = EnrollmentsService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create enrollment")
        return result
    except Exception as e:
        logger.error(f"Error creating enrollment: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.patch("/{id}", response_model=EnrollmentsResponse)
async def update_enrollments(
    id: int,
    data: EnrollmentsUpdateData,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an enrollment (user can only update their own)"""
    service = EnrollmentsService(db)
    try:
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        if update_dict.get("status") == "completed" and "completed_at" not in update_dict:
            update_dict["completed_at"] = datetime.utcnow()
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=404, detail="Enrollment not found or unauthorized")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating enrollment: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{id}")
async def delete_enrollments(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single enrollment by ID (requires ownership)"""
    service = EnrollmentsService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            raise HTTPException(status_code=404, detail="Enrollment not found or deletion not authorized")
        return {"message": "Enrollment deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting enrollment: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")