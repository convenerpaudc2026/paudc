import secrets
import os
from typing import Literal, Optional
from pathlib import Path
from urllib.parse import urlparse
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Find the absolute path to the directory containing this config file
# (If your config.py is inside a 'core' folder, add .parent to go up one level to the root)
BASE_DIR = Path(__file__).resolve().parent.parent 
ENV_PATH = BASE_DIR / ".env"

# Force Python to load the file into the environment before Pydantic even boots up
load_dotenv(ENV_PATH)

class Settings(BaseSettings):
    # App Settings
    project_name: str = "PAUDC 2026 Debate Tournament" # Added this!
    api_v1_str: str = "/api/v1"
    version: str = "1.0.0"
    port: int = Field(default=8000, ge=1, le=65535)
    debug: bool = False
    environment: str = 'production' if (
        os.getenv('VERCEL') == '1' or os.getenv('AWS_LAMBDA_FUNCTION_NAME')
    ) else 'dev'
    DATABASE_URL: str = "sqlite+aiosqlite:///./paudc.db"
    
    # Auth & JWT
    jwt_secret_key: str = ""
    jwt_algorithm: Literal["HS256"] = "HS256"
    jwt_audience: str = "paudc-api"
    jwt_expire_minutes: int = 60
    auth_cookie_name: str = "paudc_session"
    auth_cookie_samesite: Literal["lax", "strict", "none"] = "lax"
    
    # OIDC (OpenID Connect)
    oidc_client_id: str = ""
    oidc_client_secret: str = ""
    oidc_issuer_url: str = ""
    oidc_scope: str = "openid email profile"
    
    oidc_require_verified_email: bool = True

    # URLs
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"
    cors_origins: str = ""
    
    # External APIs
    stripe_api_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None 
    oss_service_url: Optional[str] = None
    oss_api_key: Optional[str] = None
    api_base_url: Optional[str] = None
    api_key: Optional[str] = None
    google_apps_script_url: Optional[str] = None
    legacy_lab_apps_script_url: Optional[str] = None
    
    # Admin User Initialization
    admin_user_id: Optional[str] = None
    admin_user_email: Optional[str] = None

    @property
    def allowed_cors_origins(self) -> list[str]:
        configured = [origin.strip().rstrip('/') for origin in self.cors_origins.split(',')]
        origins = {origin for origin in configured if origin and origin != '*'}
        if self.frontend_url:
            origins.add(self.frontend_url.rstrip('/'))
        return sorted(origins)

    @model_validator(mode='after')
    def validate_security_settings(self):
        environment = self.environment.strip().lower()
        if not self.jwt_secret_key:
            if environment == 'production':
                raise ValueError('JWT_SECRET_KEY must be configured in production')
            self.jwt_secret_key = secrets.token_urlsafe(48)
        elif (
            len(self.jwt_secret_key) < 32
            or self.jwt_secret_key == 'local_dev_secret_key_change_in_production'
        ):
            raise ValueError('JWT_SECRET_KEY must contain at least 32 characters')
        if '*' in {origin.strip() for origin in self.cors_origins.split(',')}:
            raise ValueError('CORS_ORIGINS cannot contain a wildcard')
        if environment == 'production':
            if self.debug:
                raise ValueError('DEBUG must be false in production')
            for name, url in (('FRONTEND_URL', self.frontend_url), ('BACKEND_URL', self.backend_url)):
                if not url.startswith('https://'):
                    raise ValueError(f'{name} must use HTTPS in production')
            for name, url in (
                ('OIDC_ISSUER_URL', self.oidc_issuer_url),
                ('OSS_SERVICE_URL', self.oss_service_url),
                ('API_BASE_URL', self.api_base_url),
            ):
                if url and not url.startswith('https://'):
                    raise ValueError(f'{name} must use HTTPS in production')
            if self.DATABASE_URL.startswith('sqlite'):
                raise ValueError('DATABASE_URL must use a persistent database in production')
        if self.auth_cookie_samesite == 'none' and environment != 'production':
            raise ValueError('SameSite=None cookies require production HTTPS')
        for name, form_url in (
            ('GOOGLE_APPS_SCRIPT_URL', self.google_apps_script_url),
            ('LEGACY_LAB_APPS_SCRIPT_URL', self.legacy_lab_apps_script_url),
        ):
            if form_url:
                parsed_form_url = urlparse(form_url)
                if parsed_form_url.scheme != 'https' or parsed_form_url.hostname != 'script.google.com':
                    raise ValueError(f'{name} must be an HTTPS script.google.com URL')
        return self

    # Pydantic v2 configuration
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        extra="ignore",
        case_sensitive=False
    )

settings = Settings()
