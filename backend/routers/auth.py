import base64
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Optional
import urllib.parse

import httpx
from core.auth import (
    build_authorization_url,
    build_logout_url,
    create_access_token,
    generate_code_challenge,
    generate_code_verifier,
    generate_nonce,
    generate_state,
    get_current_user,
    validate_id_token,
)
from core.config import settings
from core.database import get_db
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from models.auth import OIDCState
from models.auth import User
from schemas.auth import (
    PlatformTokenExchangeRequest,
    TokenExchangeResponse,
    UserResponse,
)
from services.firebase import verify_firebase_token, init_firebase
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
bearer_scheme = HTTPBearer(auto_error=False)

async def get_bearer_token(
    request: Request, credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)
):
    """Extract bearer token from Authorization header."""
    if credentials and credentials.scheme.lower() == "bearer":
        return credentials.credentials
        
    logger.debug(f"Authentication required for request: {request.method} {request.url}")
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication credentials were not provided")

def derive_name_from_email(email: str) -> str:
    """Derive a simple name from email address."""
    if not email:
        return ""
    name_part = email.split("@")[0]
    # Simple capitalization of parts
    parts = name_part.replace(".", " ").replace("_", " ").split()
    return " ".join(part.capitalize() for part in parts)


# Firebase Login Schemas
class FirebaseLoginRequest(BaseModel):
    id_token: str


class FirebaseLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Firebase Login Endpoint
@router.post("/firebase/login", response_model=FirebaseLoginResponse)
async def firebase_login(
    request: FirebaseLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate user with Firebase ID token and return JWT token.
    
    The frontend sends the Firebase ID token obtained after authentication,
    and this endpoint validates it and returns a JWT token for API access.
    """
    # Initialize Firebase if not already done
    try:
        init_firebase()
    except Exception as e:
        logger.error(f"Firebase initialization failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Firebase authentication service unavailable"
        )
    
    # Verify Firebase token
    decoded_token = await verify_firebase_token(request.id_token)
    if not decoded_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase token"
        )
    
    firebase_uid = decoded_token.get("uid")
    email = decoded_token.get("email")
    
    if not firebase_uid or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token claims"
        )
    
    # Check if user exists in database
    stmt = select(User).where(User.external_id == firebase_uid)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    # Create user if doesn't exist
    if not user:
        name = decoded_token.get("name") or derive_name_from_email(email)
        user = User(
            external_id=firebase_uid,
            email=email,
            username=name or email.split("@")[0],
            full_name=name,
            role="participant",  # Default role
            provider="firebase"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        logger.info(f"New user created from Firebase: {email}")
    
    # Create JWT token
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )
    
    return FirebaseLoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )


@router.get("/login")
async def login(request: Request, db: AsyncSession = Depends(get_db)):
    """Redirect to OIDC provider login."""
    state = generate_state()
    nonce = generate_nonce()
    code_verifier = generate_code_verifier()
    code_challenge = generate_code_challenge(code_verifier)
    
    # Get dynamic redirect URL based on request host
    # This handles both local development and production correctly
    host = request.headers.get("host", "")
    scheme = request.headers.get("x-forwarded-proto", request.url.scheme)
    
    # Store state info for callback validation
    new_state = OIDCState(
        state=state,
        nonce=nonce,
        code_verifier=code_verifier,
        expires_at=datetime.now() + timedelta(minutes=15)
    )
    db.add(new_state)
    await db.commit()
    
    # Build redirect URL
    redirect_uri = None
    if settings.backend_url:
        redirect_uri = f"{settings.backend_url}/api/v1/auth/callback"
    else:
        # Fallback to dynamic host
        effective_host = request.headers.get("x-forwarded-host") or host
        if not effective_host:
            logger.warning("Dynamic backend_url not configured and no host found, fallback to localhost")
            effective_host = "localhost:8000"
            
        dynamic_url = f"{scheme}://{effective_host}"
        redirect_uri = f"{dynamic_url}/api/v1/auth/callback"
        
    auth_url = build_authorization_url(state, nonce, code_challenge, redirect_uri=redirect_uri)
    logger.info(f"Initiating OIDC login with redirect_uri: %s", redirect_uri)
    
    return RedirectResponse(
        url=auth_url,
        status_code=status.HTTP_302_FOUND,
        headers={"X-Request-ID": state}
    )

@router.get("/callback")
async def callback(
    request: Request,
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    error_description: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Handle OIDC callback."""
    if error:
        logger.error(f"OIDC error: {error} - {error_description}")
        return RedirectResponse(
            url=f"{settings.frontend_url}/auth/error?msg={urllib.parse.quote(error_description or error)}"
        )
        
    if not code or not state:
        logger.error("Missing code or state in callback")
        return RedirectResponse(
            url=f"{settings.frontend_url}/auth/error?msg=Invalid callback parameters"
        )
        
    # Verify state
    stmt = select(OIDCState).where(OIDCState.state == state)
    result = await db.execute(stmt)
    oidc_state = result.scalar_one_or_none()
    
    if not oidc_state or oidc_state.expires_at < datetime.now():
        logger.error(f"Invalid or expired state: {state}")
        return RedirectResponse(
            url=f"{settings.frontend_url}/auth/error?msg=Session expired or invalid state"
        )
        
    code_verifier = oidc_state.code_verifier
    nonce = oidc_state.nonce
    
    # Determine redirect_uri used in login
    host = request.headers.get("host", "")
    scheme = request.headers.get("x-forwarded-proto", request.url.scheme)
    redirect_uri = None
    if settings.backend_url:
        redirect_uri = f"{settings.backend_url}/api/v1/auth/callback"
    else:
        effective_host = request.headers.get("x-forwarded-host") or host
        dynamic_url = f"{scheme}://{effective_host}"
        redirect_uri = f"{dynamic_url}/api/v1/auth/callback"
        
    # Exchange authorization code for tokens with PKCE
    try:
        async with httpx.AsyncClient() as client:
            token_url = f"{settings.oidc_issuer_url}/oauth/token"
            data = {
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri,
                "client_id": settings.oidc_client_id,
                "client_secret": settings.oidc_client_secret,
                "code_verifier": code_verifier
            }
            
            # Using application/x-www-form-urlencoded
            headers = {"Content-Type": "application/x-www-form-urlencoded", "X-Request-ID": state}
            
            token_response = await client.post(token_url, data=data, headers=headers)
            
            if token_response.status_code != 200:
                logger.error(f"Token exchange failed: {token_response.status_code} - {token_response.text}")
                return RedirectResponse(
                    url=f"{settings.frontend_url}/auth/error?msg=Authentication token exchange failed"
                )
                
            token_data = token_response.json()
            id_token = token_data.get("id_token")
            access_token = token_data.get("access_token")
            
            if not id_token:
                logger.error("No ID token returned")
                return RedirectResponse(
                    url=f"{settings.frontend_url}/auth/error?msg=No ID token provided"
                )
                
            # Validate ID token
            try:
                payload = await validate_id_token(id_token)
            except Exception as e:
                logger.error(f"Token validation failed: {e}")
                return RedirectResponse(
                    url=f"{settings.frontend_url}/auth/error?msg=Token validation failed"
                )
                
            # Verify nonce
            if payload.get("nonce") != nonce:
                logger.error("Nonce mismatch")
                return RedirectResponse(
                    url=f"{settings.frontend_url}/auth/error?msg=Security verification failed"
                )
                
            # Clean up state
            await db.delete(oidc_state)
            
            # Find or create user
            email = payload.get("email")
            sub = payload.get("sub")
            
            if not email or not sub:
                logger.error("Missing email or sub in token payload")
                return RedirectResponse(
                    url=f"{settings.frontend_url}/auth/error?msg=Incomplete user profile"
                )
                
            stmt = select(User).where(User.id == sub)
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
            
            if not user:
                # Create new user
                user = User(
                    id=sub,
                    email=email,
                    name=payload.get("name") or derive_name_from_email(email),
                    role=payload.get("role", "user"),
                    last_login=datetime.now()
                )
                db.add(user)
            else:
                # Update existing user
                user.last_login = datetime.now()
                # Update role if provided in token (useful for admin syncing)
                if "role" in payload:
                    user.role = payload["role"]
                    
            await db.commit()
            
            # Store tokens in session/cookies or issue a new app token
            # For this implementation, we'll pass the platform token back to the frontend
            # which will exchange it for an app token using /token/exchange
            
            # Redirect to frontend callback page with the platform access token
            redirect_url = f"{settings.frontend_url}/auth/callback#token={urllib.parse.quote(access_token)}"
            return RedirectResponse(url=redirect_url)
            
    except Exception as e:
        logger.error(f"Callback processing failed: {e}", exc_info=True)
        return RedirectResponse(
            url=f"{settings.frontend_url}/auth/error?msg=Internal server error during authentication"
        )


@router.post("/token/exchange", response_model=TokenExchangeResponse)
async def exchange_token(request: PlatformTokenExchangeRequest, db: AsyncSession = Depends(get_db)):
    """Exchange a platform token for an application token."""
    platform_token = request.platform_token
    
    try:
        # 1. Verify the platform token
        async with httpx.AsyncClient() as client:
            userinfo_url = f"{settings.oidc_issuer_url}/userinfo"
            headers = {"Authorization": f"Bearer {platform_token}"}
            
            userinfo_response = await client.get(userinfo_url, headers=headers)
            
            if userinfo_response.status_code != 200:
                logger.error(f"Platform token verification failed: {userinfo_response.status_code} - {userinfo_response.text}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired platform token"
                )
                
            userinfo = userinfo_response.json()
            sub = userinfo.get("sub")
            email = userinfo.get("email")
            
            if not sub or not email:
                logger.error("Platform token missing essential claims (sub, email)")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incomplete user profile in token"
                )
                
            # 2. Get or update user
            stmt = select(User).where(User.id == sub)
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
            
            if not user:
                 user = User(
                    id=sub,
                    email=email,
                    name=userinfo.get("name") or derive_name_from_email(email),
                    role=userinfo.get("role", "user"),
                    last_login=datetime.now()
                )
                 db.add(user)
            else:
                user.last_login = datetime.now()
                
            await db.commit()

            # 3. Issue our own HS256-signed application JWT
            app_token = create_access_token({
                "sub": user.id,
                "email": user.email,
                "name": user.name,
                "role": user.role,
                "last_login": user.last_login.isoformat() if user.last_login else None,
            })
            return TokenExchangeResponse(token=app_token)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token exchange failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to exchange token"
        )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user


@router.post("/logout")
async def logout():
    """Build OIDC logout URL and return to client."""
    logout_url = build_logout_url()
    return {"redirect_url": logout_url}