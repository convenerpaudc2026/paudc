from time import timezone

from core.database import Base
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from datetime import datetime

class Registrations(Base):
    __tablename__ = "registrations"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=True)
    registration_type = Column(String, nullable=False)
    participant_role = Column(String, nullable=False)
    status = Column(String, nullable=False)
    institution_name = Column(String, nullable=True)
    institution_country = Column(String, nullable=True)
    institution_email = Column(String, nullable=True)
    institution_phone = Column(String, nullable=True)
    addressed_to = Column(String, nullable=True)
    number_of_participants = Column(Integer, nullable=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    your_contact_email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    country = Column(String, nullable=True)
    university = Column(String, nullable=True)
    dietary_requirements = Column(String, nullable=True)
    special_needs = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)