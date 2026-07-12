import os
import re
from typing import List, Literal
from pydantic import BaseModel, Field, field_validator


def validate_object_key_value(value: str) -> str:
    key = value.strip().replace('\\', '/')
    if not key or len(key) > 1024 or key.startswith('/'):
        raise ValueError('object key is invalid')
    if any(part in ('', '.', '..') for part in key.split('/')):
        raise ValueError('object key contains an invalid path segment')
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._/-]*', key):
        raise ValueError('object key contains unsupported characters')
    return key

class OSSBaseModel(BaseModel):
    bucket_name: str = Field(..., description="The bucket name")

    @field_validator("bucket_name")
    @classmethod
    def validate_bucket_name(cls, v):
        value = v.strip().lower()
        if not re.fullmatch(r'[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]', value) or '..' in value:
            raise ValueError('bucket_name must be a valid 3-63 character storage bucket name')
        return value

class BucketRequest(OSSBaseModel):
    """Request to create bucket"""
    visibility: Literal["public", "private"] = "public"

class BucketInfo(BucketRequest):
    pass

class BucketListResponse(BaseModel):
    buckets: List[BucketInfo] = []

class ObjectRequest(OSSBaseModel):
    object_key: str = ""

    _validate_object_key = field_validator('object_key')(validate_object_key_value)

class FileUpDownloadRequest(OSSBaseModel):
    """Request for generating presigned upload URL."""
    object_key: str = Field(..., description="Name of the file to upload")

    @field_validator("object_key")
    @classmethod
    def validate_object_key(cls, v):
        return validate_object_key_value(v)

class FileUpDownloadResponse(BaseModel):
    """Response with presigned upload&download URL and access URL."""
    upload_url: str = Field(default="", description="Presigned URL for uploading the file")
    download_url: str = Field(default="", description="Presigned URL for downloading the file")
    expires_at: str = Field(..., description="Upload URL expiration time")

class RenameRequest(OSSBaseModel):
    source_key: str = ""
    target_key: str = ""
    overwrite_key: bool = True

    _validate_keys = field_validator('source_key', 'target_key')(validate_object_key_value)

class CopyRequest(OSSBaseModel):
    source_key: str = ""
    target_key: str = ""

    _validate_keys = field_validator('source_key', 'target_key')(validate_object_key_value)
