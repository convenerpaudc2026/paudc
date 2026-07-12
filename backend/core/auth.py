import base64
import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import urllib.parse

import httpx
from core.config import settings
from jose import jwt, jwk
from jose.exceptions import ExpiredSignatureError, JWTError, JWTClaimsError

from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from starlette.responses import Response


logger = logging.getLogger(__name__)


def generate_state() -> str:
    """Generate a secure state parameter for OIDC."""
    return secrets.token_urlsafe(32)


def generate_nonce() -> str:
    """Generate a secure nonce parameter for OIDC."""
    return secrets.token_urlsafe(32)


def generate_code_verifier() -> str:
    """Generate PKCE code verifier."""
    # 128 bytes base64url encoded
    return secrets.token_urlsafe(96)


def generate_code_challenge(code_verifier: str) -> str:
    """Generate PKCE code challenge from verifier."""
    digest = hashlib.sha256(code_verifier.encode('ascii')).digest()
    return base64.urlsafe_b64encode(digest).decode('ascii').rstrip('=')


async def get_jwks() -> dict:
    """Fetch JWKS from the OIDC provider."""
    jwks_url = f"{settings.oidc_issuer_url}/.well-known/jwks.json"
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            logger.debug(f"Fetching JWKS from {jwks_url}")
            response = await client.get(jwks_url)
            response.raise_for_status()
            jwks_data = response.json()
            
            logger.info(f"Successfully fetched JWKS with {len(jwks_data.get('keys', []))} keys")
            return jwks_data
    except httpx.TimeoutException:
        logger.error('Timeout while fetching OIDC JWKS')
        raise
    except httpx.HTTPStatusError as e:
        logger.error('OIDC JWKS request failed with status %s', e.response.status_code)
        raise
    except Exception as e:
        logger.error('OIDC JWKS retrieval failed: %s', type(e).__name__)
        raise IDTokenValidationError('Unable to retrieve authentication keys', 'jwks_fetch_error') from e


class IDTokenValidationError(Exception):
    """Custom exception for ID token validation errors."""
    
    def __init__(self, message: str, error_type: str = "validation_error"):
        self.message = message
        self.error_type = error_type
        super().__init__(self.message)


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode and validate JWT access token."""
    
    if not settings.jwt_secret_key:
        raise ValueError("JWT_SECRET_KEY is not configured")
        
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
            audience=settings.jwt_audience,
            issuer=settings.backend_url.rstrip('/'),
            options={'require_sub': True, 'require_exp': True, 'require_iat': True},
        )
        
        # Log user hash instead of actual user ID to avoid exposing sensitive information
        user_id = payload.get("sub", "unknown")
        user_id_hash = hashlib.sha256(str(user_id).encode()).hexdigest()[:8] if user_id != "unknown" else "unknown"
        logger.debug(f"Authentication token validated for user hash: {user_id_hash}")
        
        return payload
    except ExpiredSignatureError as exc:
        logger.warning("Authentication token has expired")
        raise IDTokenValidationError("Token has expired") from exc
    except JWTError as exc:
        logger.warning("Authentication token validation failed: %s", type(exc).__name__)
        # Do not log exc directly, which may contain sensitive token data
        raise IDTokenValidationError("Invalid authentication token") from exc


def create_access_token(data: Dict[str, Any]) -> str:
    """Issue a signed HS256 application JWT from the given payload data."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        **data,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        'iss': settings.backend_url.rstrip('/'),
        'aud': settings.jwt_audience,
        'jti': secrets.token_urlsafe(16),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.auth_cookie_name,
        value=token,
        max_age=settings.jwt_expire_minutes * 60,
        path='/',
        secure=settings.environment == 'production',
        httponly=True,
        samesite=settings.auth_cookie_samesite,
    )


def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.auth_cookie_name,
        path='/',
        secure=settings.environment == 'production',
        httponly=True,
        samesite=settings.auth_cookie_samesite,
    )


async def validate_id_token(id_token: str) -> Optional[Dict[str, Any]]:
    """Validate ID token with proper JWT signature verification using JWKS."""
    
    # Get the header to find the key ID
    header = jwt.get_unverified_header(id_token)
    kid = header.get("kid")
    
    if not kid:
        logger.error("ID token validation failed: No kid found in JWT header")
        raise IDTokenValidationError("Token format is invalid", "missing_kid")
        
    # Get JWKS from the provider
    try:
        jwks = await get_jwks()
    except Exception as e:
        logger.error('ID token validation failed because JWKS retrieval failed')
        raise IDTokenValidationError("Unable to retrieve authentication keys", "jwks_fetch_error")
        
    # Find the matching key
    matching_key = None
    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            matching_key = key
            break
            
    if not matching_key:
        logger.error(f"ID token validation failed: No matching key found for kid {kid}")
        raise IDTokenValidationError("Authentication key not found", "key_not_found")
        
    # Convert JWK to PEM format for jose.jwt
    try:
        # Extract RSA components
        def base64url_decode(inp):
            # decode base64url encoded string
            padding = 4 - (len(inp) % 4)
            if padding != 4:
                inp += "=" * padding
            return base64.urlsafe_b64decode(inp)

        # Construct RSA public key
        n_bytes = base64url_decode(matching_key["n"])
        e_bytes = base64url_decode(matching_key["e"])
        
        n = int.from_bytes(n_bytes, "big")
        e = int.from_bytes(e_bytes, "big")
        
        public_numbers = rsa.RSAPublicNumbers(e, n)
        public_key = public_numbers.public_key()
        
        # Convert to PEM format
        pem_key = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        
    except Exception as e:
        logger.error("JWK to PEM conversion failed")
        # Log exact exception, but don't expose it to user
        raise IDTokenValidationError("Authentication key processing failed", "key_conversion_error")
        
    # Verify and decode the JWT
    try:
        expected_issuer = settings.oidc_issuer_url
        if not expected_issuer.endswith('/'):
            expected_issuer += '/'

        payload = jwt.decode(
            id_token,
            pem_key,
            algorithms=["RS256"],
            audience=settings.oidc_client_id,
            issuer=expected_issuer,
        )
        
        # Log user hash instead of actual user ID to avoid exposing sensitive information
        user_hash = hashlib.sha256(str(payload.get("sub", "")).encode()).hexdigest()[:8] if payload.get("sub") else "unknown"
        logger.info(f"ID token successfully validated for user hash: {user_hash}")
        
        return payload
        
    except ExpiredSignatureError:
        logger.warning("ID token validation failed: Token has expired")
        raise IDTokenValidationError("Token has expired", "expired")
    except JWTClaimsError as e:
        logger.error('ID token validation failed: invalid claims')
        raise IDTokenValidationError("Invalid token claims", "invalid_claims")
    except JWTError as e:
        logger.error(f"ID token validation failed: Signature verification failed")
        raise IDTokenValidationError("Invalid signature", "invalid_signature")


def build_authorization_url(state: str, nonce: str, code_challenge: Optional[str] = None, redirect_uri: Optional[str] = None) -> str:
    """Build OIDC authorization URL with optional PKCE support."""
    
    params = {
        "client_id": settings.oidc_client_id,
        "response_type": "code",
        "scope": settings.oidc_scope,
        "redirect_uri": redirect_uri or f"{settings.backend_url}/api/v1/auth/callback",
        "state": state,
        "nonce": nonce,
    }
    
    # Add PKCE parameters if provided
    if code_challenge:
        params["code_challenge"] = code_challenge
        params["code_challenge_method"] = "S256"
        
    auth_url = f"{settings.oidc_issuer_url}/authorize?{urllib.parse.urlencode(params)}"
    return auth_url


def build_logout_url(id_token: Optional[str] = None) -> str:
    """Build OIDC Logout URL."""
    
    params = {
        "post_logout_redirect_uri": f"{settings.frontend_url}/logout-callback"
    }
    
    if id_token:
        params["id_token_hint"] = id_token
        
    logout_url = f"{settings.oidc_issuer_url}/logout?{urllib.parse.urlencode(params)}"
    return logout_url
