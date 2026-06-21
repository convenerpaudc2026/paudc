import json
import logging
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user
from schemas.auth import UserResponse
from services.quiz_questions import QuizQuestionsService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/quiz_questions", tags=["quiz_questions"])

# Pydantic Schemas
class QuizQuestionsData(BaseModel):
    quiz_id: int
    question_text: str
    question_type: str
    options: str
    correct_answer: str
    points: int
    order_index: int

class QuizQuestionsUpdateData(BaseModel):
    quiz_id: Optional[int] = None
    question_text: Optional[str] = None
    question_type: Optional[str] = None
    options: Optional[str] = None
    correct_answer: Optional[str] = None
    points: Optional[int] = None
    order_index: Optional[int] = None

class QuizQuestionsResponse(BaseModel):
    id: int
    quiz_id: int
    question_text: str
    question_type: str
    options: str
    correct_answer: str
    points: int
    order_index: int

    class Config:
        from_attributes = True

class QuizQuestionsListResponse(BaseModel):
    items: List[QuizQuestionsResponse]
    total: int
    skip: int
    limit: int

# Routes
@router.get("/", response_model=QuizQuestionsListResponse)
async def query_quiz_questions(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    service = QuizQuestionsService(db)
    try:
        query_dict = json.loads(query) if query else None
        return await service.get_list(skip=skip, limit=limit, query=query_dict, sort=sort)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid query JSON format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=QuizQuestionsResponse)
async def get_quiz_question(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    service = QuizQuestionsService(db)
    result = await service.get_by_id(id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Quiz question {id} not found")
    return result


@router.post("/", response_model=QuizQuestionsResponse, status_code=201)
async def create_quiz_question(
    data: QuizQuestionsData,
    current_user: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = QuizQuestionsService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create quiz question")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating quiz question: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.put("/{id}", response_model=QuizQuestionsResponse)
async def update_quiz_question(
    id: int,
    data: QuizQuestionsUpdateData,
    current_user: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = QuizQuestionsService(db)
    try:
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            raise HTTPException(status_code=404, detail=f"Quiz question with id {id} not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating quiz question: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{id}")
async def delete_quiz_question(
    id: int,
    current_user: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    service = QuizQuestionsService(db)
    try:
        success = await service.delete(id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Quiz question with id {id} not found")
        return {"message": "Quiz question deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting quiz question: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
