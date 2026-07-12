from core.database import Base
from sqlalchemy import Column, DateTime, Integer, String, UniqueConstraint

class Enrollments(Base):
    __tablename__ = "enrollments"
    __table_args__ = (
        UniqueConstraint('user_id', 'course_id', name='uq_enrollments_user_course'),
        {'extend_existing': True},
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    course_id = Column(Integer, nullable=False)
    enrolled_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    progress_percentage = Column(Integer, nullable=True)
    status = Column(String, nullable=False)
