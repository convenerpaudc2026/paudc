from datetime import datetime
from typing import Optional, Union
from pydantic import BaseModel, field_serializer

class UserResponse(BaseModel):
    id: str # Now a string UUID (platform sub)
    email: str
    name: Optional[str] = None
    role: str = "user" # user/admin
    last_login: Optional[Union[datetime, str]] = None

    class Config:
        from_attributes = True

    @field_serializer("last_login")
    def _serialize_last_login(self, value: Optional[Union[datetime, str]]) -> Optional[str]:
        if value is None:
            return None
        if isinstance(value, datetime):
            return value.isoformat()
        return value

class PlatformTokenExchangeRequest(BaseModel):
    """Request body for exchanging Platform token for app token."""
    platform_token: str

class TokenExchangeResponse(BaseModel):
    """Response body after establishing the HttpOnly application session."""
    success: bool = True
