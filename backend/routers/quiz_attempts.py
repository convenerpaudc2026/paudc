import json
import logging
from typing import Dict, Optional, List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_user
from dependencies.course_access import require_course_access
from models.auth import User
from models.quiz_attempts import QuizAttempts
from models.quiz_questions import QuizQuestions
from models.quizzes import Quizzes
from services.quiz_attempts import QuizAttemptsService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/quiz_attempts", tags=["quiz_attempts"])

# Pydantic Schemas
class QuizAttemptsData(BaseModel):
    quiz_id: int
    answers: Dict[int, str] = Field(min_length=1, max_length=100)

class QuizAttemptsUpdateData(BaseModel):
    quiz_id: Optional[int] = None
    score: Optional[int] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    attempt_number: Optional[int] = None
    passed: Optional[bool] = None

class QuizAttemptsResponse(BaseModel):
    id: int
    user_id: str
    quiz_id: int
    score: Optional[int] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    attempt_number: Optional[int] = None
    passed: Optional[bool] = None

    class Config:
        from_attributes = True

class QuizAttemptsListResponse(BaseModel):
    items: List[QuizAttemptsResponse]
    total: int
    skip: int
    limit: int

# Routes
@router.get("/", response_model=QuizAttemptsListResponse)
async def query_quiz_attempts(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = QuizAttemptsService(db)
    try:
        query_dict = json.loads(query) if query else None
        return await service.get_list(
            skip=skip, limit=limit, query=query_dict, sort=sort, user_id=str(current_user.id)
        )
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid query JSON format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/", response_model=QuizAttemptsResponse, status_code=201)
async def create_quiz_attempts(
    data: QuizAttemptsData,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = QuizAttemptsService(db)
    try:
        quiz = await db.scalar(
            select(Quizzes).where(Quizzes.id == data.quiz_id, Quizzes.is_published.is_(True))
        )
        if quiz is None:
            raise HTTPException(status_code=404, detail='Quiz not found')
        await require_course_access(quiz.course_id, current_user, db)

        questions = (
            await db.execute(
                select(QuizQuestions)
                .where(QuizQuestions.quiz_id == data.quiz_id)
                .order_by(QuizQuestions.order_index)
            )
        ).scalars().all()
        if not questions:
            raise HTTPException(status_code=400, detail='Quiz has no questions')

        attempt_count = await db.scalar(
            select(func.count(QuizAttempts.id)).where(
                QuizAttempts.quiz_id == data.quiz_id,
                QuizAttempts.user_id == str(current_user.id),
            )
        ) or 0
        if quiz.max_attempts and attempt_count >= quiz.max_attempts:
            raise HTTPException(status_code=409, detail='Maximum quiz attempts reached')

        total_points = sum(max(question.points or 0, 0) for question in questions)
        if total_points <= 0:
            raise HTTPException(status_code=400, detail='Quiz points are not configured')
        earned_points = sum(
            max(question.points or 0, 0)
            for question in questions
            if data.answers.get(question.id) == question.correct_answer
        )
        score = round((earned_points / total_points) * 100)
        now = datetime.utcnow()
        result = await service.create(
            {
                'quiz_id': data.quiz_id,
                'score': score,
                'started_at': now,
                'completed_at': now,
                'attempt_number': attempt_count + 1,
                'passed': score >= (quiz.passing_score or 70),
            },
            user_id=str(current_user.id),
        )
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create quiz attempt")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error('Quiz submission failed', exc_info=True)
        raise HTTPException(status_code=500, detail='Failed to submit quiz')
