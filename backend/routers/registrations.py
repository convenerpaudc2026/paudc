import json
import logging
from typing import Literal, Optional, List
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.enums import ParticipantRole
from dependencies.auth import get_current_user
from models.auth import User
from services.registrations import RegistrationsService
from services.email import send_registration_notification

ParticipantRoleLiteral = Literal["debater", "adjudicator", "observer", "organizer"]

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/registrations", tags=["registrations"])

# Pydantic Schemas
class RegistrationsData(BaseModel):
    """Entity data schema (for create/update)"""
    registration_type: str
    participant_role: ParticipantRoleLiteral
    status: str
    institution_name: Optional[str] = None
    institution_country: Optional[str] = None
    institution_email: Optional[str] = None
    institution_phone: Optional[str] = None
    number_of_participants: Optional[int] = None
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    country: Optional[str] = None
    university: Optional[str] = None
    dietary_requirements: Optional[str] = None
    special_needs: Optional[str] = None

class RegistrationsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    registration_type: Optional[str] = None
    participant_role: Optional[ParticipantRoleLiteral] = None
    status: Optional[str] = None
    institution_name: Optional[str] = None
    institution_country: Optional[str] = None
    institution_email: Optional[str] = None
    institution_phone: Optional[str] = None
    number_of_participants: Optional[int] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    university: Optional[str] = None
    dietary_requirements: Optional[str] = None
    special_needs: Optional[str] = None

class RegistrationsResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: Optional[str] = None
    registration_type: str
    participant_role: ParticipantRoleLiteral
    status: str
    institution_name: Optional[str] = None
    institution_country: Optional[str] = None
    institution_email: Optional[str] = None
    institution_phone: Optional[str] = None
    number_of_participants: Optional[int] = None
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    country: Optional[str] = None
    university: Optional[str] = None
    dietary_requirements: Optional[str] = None
    special_needs: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

class RegistrationsListResponse(BaseModel):
    """List response schema"""
    items: List[RegistrationsResponse]
    total: int
    skip: int
    limit: int

class RegistrationsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[RegistrationsData]

class RegistrationsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: RegistrationsUpdateData

class RegistrationsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[RegistrationsBatchUpdateItem]

class RegistrationsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# Routes
@router.get("/", response_model=RegistrationsListResponse)
async def query_registrations(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=2000),
    current_user: User = Depends(get_current_user), # Added Auth!
    db: AsyncSession = Depends(get_db),
):
    try:
        query_dict = json.loads(query) if query else {}
        
        # Security: If the user is a standard participant, force the query to only return their data
        if current_user.role not in ["admin", "organizer"]:
            query_dict["user_id"] = str(current_user.id)

        service = RegistrationsService(db)
        result = await service.get_list(skip=skip, limit=limit, query=query_dict, sort=sort)
        return result
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid query JSON format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=RegistrationsResponse)
async def get_registration_by_id(
    id: int, 
    current_user: User = Depends(get_current_user), # Added Auth!
    db: AsyncSession = Depends(get_db)
):
    service = RegistrationsService(db)
    result = await service.get_by_id(id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Registration not found")
        
    # Security: Only admins/organizers or the owner can view this specific ID
    if current_user.role not in ["admin", "organizer"] and result.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to view this registration")
        
    return result

# --- UNPROTECTED ROUTE FOR PUBLIC SUBMISSIONS ---
@router.post("/", response_model=RegistrationsResponse, status_code=201)
async def create_registrations(
    data: RegistrationsData,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    service = RegistrationsService(db)
    try:
        # Generate a unique guest ID instead of using None
        guest_id = f"guest_{uuid.uuid4().hex[:12]}" 
        
        # Pass the guest_id to the service
        result = await service.create(data.model_dump(), user_id=guest_id)
        
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create registrations")
        
        # Send email notification to convener in the background
        background_tasks.add_task(
            send_registration_notification,
            data.model_dump()
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.put("/batch", response_model=RegistrationsListResponse)
async def update_registrations_batch(
    request: RegistrationsBatchUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = RegistrationsService(db)
    results = []
    try:
        for item in request.items:
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        return {"items": results, "total": len(results), "skip": 0, "limit": len(results)}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.delete("/batch")
async def delete_registrations_batch(
    request: RegistrationsBatchDeleteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = RegistrationsService(db)
    deleted_count = 0
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        return {"message": f"Successfully deleted {deleted_count} registrations"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{id}")
async def delete_registration(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = RegistrationsService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            raise HTTPException(status_code=404, detail="Registration not found")
        return {"message": "Registration deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")