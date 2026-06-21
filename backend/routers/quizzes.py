import json
import logging
from typing import Optional, List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user
from schemas.auth import UserResponse
from services.quizzes import QuizzesService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/quizzes", tags=["quizzes"])

# Pydantic Schemas
class QuizzesData(BaseModel):
    course_id: int
    module_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    time_limit_minutes: Optional[int] = None
    max_attempts: Optional[int] = None
    passing_score: Optional[int] = None
    is_published: Optional[bool] = None
    created_at: Optional[datetime] = None

class QuizzesUpdateData(BaseModel):
    course_id: Optional[int] = None
    module_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    time_limit_minutes: Optional[int] = None
    max_attempts: Optional[int] = None
    passing_score: Optional[int] = None
    is_published: Optional[bool] = None
    created_at: Optional[datetime] = None

class QuizzesResponse(BaseModel):
    id: int
    course_id: int
    module_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    time_limit_minutes: Optional[int] = None
    max_attempts: Optional[int] = None
    passing_score: Optional[int] = None
    is_published: Optional[bool] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class QuizzesListResponse(BaseModel):
    items: List[QuizzesResponse]
    total: int
    skip: int
    limit: int

# Routes
@router.get("/", response_model=QuizzesListResponse)
async def query_quizzes(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    service = QuizzesService(db)
    try:
        query_dict = json.loads(query) if query else None
        return await service.get_list(skip=skip, limit=limit, query=query_dict, sort=sort)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid query JSON format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=QuizzesResponse)
async def get_quiz(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    service = QuizzesService(db)
    result = await service.get_by_id(id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Quiz with id {id} not found")
    return result


@router.post("/", response_model=QuizzesResponse, status_code=201)
async def create_quiz(
    data: QuizzesData,
    current_user: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a quiz (admin only)"""
    service = QuizzesService(db)
    try:
        payload = data.model_dump()
        if not payload.get("created_at"):
            payload["created_at"] = datetime.utcnow()
        result = await service.create(payload)
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create quiz")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating quiz: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.put("/{id}", response_model=QuizzesResponse)
async def update_quiz(
    id: int,
    data: QuizzesUpdateData,
    current_user: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a quiz (admin only)"""
    service = QuizzesService(db)
    try:
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            raise HTTPException(status_code=404, detail=f"Quiz with id {id} not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating quiz: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{id}")
async def delete_quiz(
    id: int,
    current_user: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a quiz (admin only)"""
    service = QuizzesService(db)
    try:
        success = await service.delete(id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Quiz with id {id} not found")
        return {"message": "Quiz deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting quiz: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
