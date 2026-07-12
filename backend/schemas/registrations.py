from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from core.enums import ParticipantRole, Status

class RegistrationsBase(BaseModel):
    """Base properties shared across multiple schemas"""
    registration_type: str = Field(min_length=1, max_length=50)
    participant_role: ParticipantRole
    status: Status
    institution_name: Optional[str] = Field(default=None, max_length=200)
    institution_country: Optional[str] = Field(default=None, max_length=120)
    institution_email: Optional[EmailStr] = None
    institution_phone: Optional[str] = Field(default=None, max_length=64)
    number_of_participants: Optional[int] = Field(default=None, ge=1, le=500)
    first_name: str = Field(min_length=1, max_length=120)
    last_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=64)
    country: Optional[str] = Field(default=None, max_length=120)
    university: Optional[str] = Field(default=None, max_length=200)
    dietary_requirements: Optional[str] = Field(default=None, max_length=1000)
    special_needs: Optional[str] = Field(default=None, max_length=2000)

class RegistrationsData(RegistrationsBase):
    """Schema for creating a new registration"""
    pass

class RegistrationsUpdateData(BaseModel):
    """Schema for partial updates (all fields optional)"""
    registration_type: Optional[str] = Field(default=None, min_length=1, max_length=50)
    participant_role: Optional[ParticipantRole] = None
    status: Optional[Status] = None
    institution_name: Optional[str] = Field(default=None, max_length=200)
    institution_country: Optional[str] = Field(default=None, max_length=120)
    institution_email: Optional[EmailStr] = None
    institution_phone: Optional[str] = Field(default=None, max_length=64)
    number_of_participants: Optional[int] = Field(default=None, ge=1, le=500)
    first_name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    last_name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=64)
    country: Optional[str] = Field(default=None, max_length=120)
    university: Optional[str] = Field(default=None, max_length=200)
    dietary_requirements: Optional[str] = Field(default=None, max_length=1000)
    special_needs: Optional[str] = Field(default=None, max_length=2000)

class RegistrationsResponse(RegistrationsBase):
    """Schema for returning a registration to the client"""
    id: int
    user_id: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class RegistrationsListResponse(BaseModel):
    """Schema for paginated list responses"""
    items: List[RegistrationsResponse]
    total: int
    skip: int
    limit: int

# --- Batch Operation Schemas ---

class RegistrationsBatchCreateRequest(BaseModel):
    items: List[RegistrationsData] = Field(min_length=1, max_length=100)

class RegistrationsBatchUpdateItem(BaseModel):
    id: int
    updates: RegistrationsUpdateData

class RegistrationsBatchUpdateRequest(BaseModel):
    items: List[RegistrationsBatchUpdateItem] = Field(min_length=1, max_length=100)

class RegistrationsBatchDeleteRequest(BaseModel):
    ids: List[int] = Field(min_length=1, max_length=100)
