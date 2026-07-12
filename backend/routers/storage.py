import logging
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from dependencies.auth import get_current_user, get_admin_user
from models.auth import User
from schemas.storage import (
    BucketListResponse, 
    BucketRequest, 
    FileUpDownloadRequest, 
    FileUpDownloadResponse, 
    ObjectRequest, 
    RenameRequest
)
from services.storage import StorageService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/storage", tags=["storage"])

@router.post("/create-bucket", response_model=BucketRequest)
async def create_bucket(
    request: BucketRequest, 
    current_user: User = Depends(get_admin_user)
):
    """Create a new bucket"""
    service = StorageService()
    try:
        await service.create_bucket(request)
        return request
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to create bucket: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create bucket")

@router.get("/list-buckets", response_model=BucketListResponse)
async def list_buckets(current_user: User = Depends(get_admin_user)):
    """List buckets of the user"""
    service = StorageService()
    try:
        result = await service.list_buckets()
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/get-object-info", response_model=ObjectRequest)
async def get_object_info(
    request: ObjectRequest = Depends(), 
    current_user: User = Depends(get_admin_user)
):
    """Get object metadata from the bucket"""
    service = StorageService()
    try:
        result = await service.get_object_info(request)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/upload-url", response_model=FileUpDownloadResponse)
async def upload_file_url(
    request: FileUpDownloadRequest, 
    current_user: User = Depends(get_admin_user)
):
    """Get a presigned URL for uploading a file to StorageService."""
    service = StorageService()
    try:
        result = await service.generate_presigned_upload_url(request)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/rename-object", response_model=RenameRequest)
async def rename_object(
    request: RenameRequest, 
    current_user: User = Depends(get_admin_user)
):
    """Rename an object in the bucket"""
    service = StorageService()
    try:
        await service.rename_object(request)
        return request
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
