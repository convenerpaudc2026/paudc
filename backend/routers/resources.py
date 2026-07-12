import json
import logging
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user, get_optional_user
from schemas.auth import UserResponse
from services.resources import ResourcesService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/resources", tags=["resources"])

# Pydantic Schemas
class ResourcesData(BaseModel):
    """Entity data schema (for create/update)"""
    title: str
    description: Optional[str] = None
    category: str
    file_url: str
    file_type: str
    is_public: Optional[bool] = None
    download_count: Optional[int] = None
    created_at: Optional[str] = None

class ResourcesUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    file_url: Optional[str] = None
    file_type: Optional[str] = None
    is_public: Optional[bool] = None
    download_count: Optional[int] = None
    created_at: Optional[str] = None

class ResourcesResponse(BaseModel):
    """Entity response schema"""
    id: int
    title: str
    description: Optional[str] = None
    category: str
    file_url: str
    file_type: str
    is_public: Optional[bool] = None
    download_count: Optional[int] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

class ResourcesListResponse(BaseModel):
    """List response schema"""
    items: List[ResourcesResponse]
    total: int
    skip: int
    limit: int

class ResourcesBatchCreateRequest(BaseModel):
    items: List[ResourcesData]

class ResourcesBatchUpdateItem(BaseModel):
    id: int
    updates: ResourcesUpdateData

class ResourcesBatchUpdateRequest(BaseModel):
    items: List[ResourcesBatchUpdateItem]

class ResourcesBatchDeleteRequest(BaseModel):
    ids: List[int]


# Routes
@router.get("/", response_model=ResourcesListResponse)
async def query_resources(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: Optional[UserResponse] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        query_dict = json.loads(query) if query else {}
        if not current_user or current_user.role != 'admin':
            query_dict['is_public'] = True
        service = ResourcesService(db)
        result = await service.get_list(skip=skip, limit=limit, query=query_dict, sort=sort)
        return result
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid query JSON format")
    except Exception as e:
        logger.error(f"Error querying resources: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{id}", response_model=ResourcesResponse)
async def get_resources(
    id: int,
    current_user: Optional[UserResponse] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    service = ResourcesService(db)
    result = await service.get_by_id(id)
    if not result:
        raise HTTPException(status_code=404, detail="Resources not found")
    if not result.is_public and (not current_user or current_user.role != 'admin'):
        raise HTTPException(status_code=404, detail='Resource not found')
    return result

@router.post("/batch", response_model=ResourcesListResponse, status_code=201, dependencies=[Depends(get_admin_user)])
async def create_resources_batch(request: ResourcesBatchCreateRequest, db: AsyncSession = Depends(get_db)):
    service = ResourcesService(db)
    results = []
    try:
        for item in request.items:
            result = await service.create(item.model_dump())
            if result:
                results.append(result)
        return {"items": results, "total": len(results), "skip": 0, "limit": len(results)}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")

@router.put("/{id}", response_model=ResourcesResponse, dependencies=[Depends(get_admin_user)])
async def update_resources(id: int, data: ResourcesUpdateData, db: AsyncSession = Depends(get_db)):
    service = ResourcesService(db)
    try:
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            raise HTTPException(status_code=404, detail="Resources with id not found for update")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{id}", dependencies=[Depends(get_admin_user)])
async def delete_resources(id: int, db: AsyncSession = Depends(get_db)):
    service = ResourcesService(db)
    try:
        if not await service.delete(id):
            raise HTTPException(status_code=404, detail="Resources not found for deletion")
        return {"message": "Successfully deleted resources"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
