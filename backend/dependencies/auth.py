import hashlib
import logging
from typing import Optional

from core.auth import decode_access_token, IDTokenValidationError
from core.config import settings
from core.database import get_db
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from models.auth import User
from schemas.auth import UserResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

bearer_scheme = HTTPBearer(auto_error=False)


async def get_bearer_token(
    request: Request, credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)
):
    """Extract bearer token from Authorization header."""
    if credentials and credentials.scheme.lower() == "bearer":
        return credentials.credentials

    cookie_token = request.cookies.get(settings.auth_cookie_name)
    if cookie_token:
        return cookie_token

    logger.debug(f"Authentication required for request: {request.method} {request.url}")
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication credentials were not provided")


async def resolve_authenticated_user(token: str, db: AsyncSession) -> UserResponse:
    """Validate the token and reload authoritative identity and role data."""
    try:
        payload = decode_access_token(token)
    except IDTokenValidationError as exc:
        # log error type only, not the full exception which may contain sensitive token data
        logger.warning(f"Token validation failed: %s", type(exc).__name__)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=exc.message)

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")

    # Log user hash instead of actual user ID to avoid exposing sensitive information
    user_id_hash = hashlib.sha256(str(user_id).encode()).hexdigest()[:8] if user_id else 'unknown'
    logger.debug('Authentication token validated for user hash: %s', user_id_hash)

    user = await db.scalar(select(User).where(User.id == str(user_id)))
    if user is None:
        logger.warning('Authentication rejected because the user no longer exists')
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Authentication session is no longer valid')
    return UserResponse.model_validate(user)


async def get_current_user(
    token: str = Depends(get_bearer_token),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    return await resolve_authenticated_user(token, db)


async def get_optional_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> Optional[UserResponse]:
    # Anonymous requests are allowed, but malformed or invalid tokens are not.
    if credentials is None:
        cookie_token = request.cookies.get(settings.auth_cookie_name)
        if cookie_token:
            return await resolve_authenticated_user(cookie_token, db)
        return None
    if credentials.scheme.lower() != 'bearer':
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid authentication scheme')
    return await resolve_authenticated_user(credentials.credentials, db)


async def get_admin_user(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """Dependency to ensure current user has admin role."""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user
