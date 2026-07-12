from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.enrollments import Enrollments
from schemas.auth import UserResponse


async def require_course_access(
    course_id: int,
    current_user: UserResponse,
    db: AsyncSession,
) -> None:
    if current_user.role == 'admin':
        return

    enrollment_id = await db.scalar(
        select(Enrollments.id).where(
            Enrollments.course_id == course_id,
            Enrollments.user_id == str(current_user.id),
        )
    )
    if enrollment_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Enrollment is required to access this course content',
        )
