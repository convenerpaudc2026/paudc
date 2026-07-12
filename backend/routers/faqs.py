import json
import logging
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user, get_optional_user
from schemas.auth import UserResponse
from services.faqs import FaqsService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/faqs", tags=["faqs"])

# Pydantic Schemas
class FaqsData(BaseModel):
    """Entity data schema (for create/update)"""
    question: str
    answer: str
    category: str
    order_index: int
    is_published: Optional[bool] = None
    created_at: Optional[str] = None

class FaqsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    question: Optional[str] = None
    answer: Optional[str] = None
    category: Optional[str] = None
    order_index: Optional[int] = None
    is_published: Optional[bool] = None
    created_at: Optional[str] = None

class FaqsResponse(BaseModel):
    """Entity response schema"""
    id: int
    question: str
    answer: str
    category: str
    order_index: int
    is_published: Optional[bool] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

class FaqsListResponse(BaseModel):
    """List response schema"""
    items: List[FaqsResponse]
    total: int
    skip: int
    limit: int

class FaqsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[FaqsData]

class FaqsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: FaqsUpdateData

class FaqsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[FaqsBatchUpdateItem]

class FaqsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# Routes
@router.get("/", response_model=FaqsListResponse)
async def query_faqs(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: Optional[UserResponse] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """Query faqs with filtering, sorting, and pagination"""
    service = FaqsService(db)
    try:
        query_dict = {}
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        if not current_user or current_user.role != 'admin':
            query_dict['is_published'] = True

        result = await service.get_list(skip=skip, limit=limit, query=query_dict, sort=sort)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying faqs: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{id}", response_model=FaqsResponse)
async def get_faqs(
    id: int,
    current_user: Optional[UserResponse] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single faqs by ID"""
    try:
        service = FaqsService(db)
        result = await service.get_by_id(id)
        if not result:
            raise HTTPException(status_code=404, detail="Faq not found")
        if not result.is_published and (not current_user or current_user.role != 'admin'):
            raise HTTPException(status_code=404, detail='Faq not found')
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/", response_model=FaqsResponse, status_code=201, dependencies=[Depends(get_admin_user)])
async def create_faqs(
    data: FaqsData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new faqs"""
    service = FaqsService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create faq")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/{id}", response_model=FaqsResponse, dependencies=[Depends(get_admin_user)])
async def update_faqs(
    id: int,
    data: FaqsUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing faqs"""
    service = FaqsService(db)
    try:
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            raise HTTPException(status_code=404, detail="Faq not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{id}", dependencies=[Depends(get_admin_user)])
async def delete_faqs(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single faqs by ID"""
    service = FaqsService(db)
    try:
        success = await service.delete(id)
        if not success:
            raise HTTPException(status_code=404, detail="Faq not found")
        return {"message": "Faq deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
