import logging
from typing import Dict, Any
from urllib.parse import urljoin

import httpx
from core.config import settings

logger = logging.getLogger(__name__)

class StorageService:
    """Service for handling file upload and display with ObjectStorage service integration."""

    def __init__(self):
        if not settings.oss_service_url or not settings.oss_api_key:
            raise ValueError("OSS service not configured. Set OSS_SERVICE_URL and OSS_API_KEY.")
            
        self.headers = {
            "Authorization": f"Bearer {settings.oss_api_key}",
            "Content-Type": "application/json",
        }

    async def _request_oss_service(self, endpoint: str, payload: dict = None) -> dict:
        """Make requests to the OSS service."""
        url = urljoin(settings.oss_service_url, endpoint)
        
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                if payload:
                    response = await client.post(url, headers=self.headers, json=payload)
                else:
                    response = await client.get(url, headers=self.headers)
                    
                response.raise_for_status()
                result = response.json()
                
                if result.get("code") != 200:
                    logger.warning('ObjectStorage service returned an application error')
                    raise ValueError('Storage service rejected the request')
                    
                return result.get("data", {})
                
        except httpx.HTTPStatusError as e:
            logger.error('Storage service HTTP error: %s', e.response.status_code)
            raise ValueError('Storage service request failed')
        except Exception as e:
            logger.error('Storage service call failed: %s', type(e).__name__)
            raise ValueError('Internal storage service error')

    async def create_bucket(self, request: Any) -> Dict[str, Any]:
        """Create a new bucket"""
        endpoint = "api/v1/infra/client/oss/buckets"
        payload = {
            "bucket_name": request.bucket_name,
            "visibility": getattr(request, "visibility", "public")
        }
        return await self._request_oss_service(endpoint, payload)

    async def list_buckets(self) -> Dict[str, Any]:
        """List buckets of the user"""
        endpoint = "api/v1/infra/client/oss/buckets"
        return await self._request_oss_service(endpoint)

    async def get_object_info(self, request: Any) -> Dict[str, Any]:
        """Get object metadata from the bucket"""
        endpoint = f"api/v1/infra/client/oss/buckets/{request.bucket_name}/objects/{request.object_key}/metadata"
        return await self._request_oss_service(endpoint)

    async def rename_object(self, request: Any) -> Dict[str, Any]:
        endpoint = f"api/v1/infra/client/oss/buckets/{request.bucket_name}/objects/rename"
        payload = {
            "overwrite_key": request.overwrite_key,
            "source_key": request.source_key,
            "target_key": request.target_key
        }
        return await self._request_oss_service(endpoint, payload)

    async def generate_presigned_upload_url(self, request: Any) -> Dict[str, Any]:
        endpoint = f"api/v1/infra/client/oss/buckets/{request.bucket_name}/objects/upload_url"
        payload = {
            "expires_in": 3600,
            "request_object_key": request.object_key
        }
        result = await self._request_oss_service(endpoint, payload)
        
        return {
            "upload_url": result.get("upload_url", ""),
            "download_url": result.get("download_url", ""),
            "expires_at": result.get("expires_at", "")
        }
