from core.database import Base
from sqlalchemy import Column, Integer, String, DateTime, Text

class CourseModules(Base):
    __tablename__ = "course_modules"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    course_id = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    order_index = Column(Integer, nullable=False)
    content_type = Column(String, nullable=True)
    content = Column(Text, nullable=True)
    video_url = Column(String, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)
