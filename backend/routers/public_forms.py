import logging
from typing import Literal, Optional

import httpx
from core.config import settings
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, ConfigDict, EmailStr, Field, TypeAdapter, field_validator, model_validator


logger = logging.getLogger(__name__)
router = APIRouter(prefix='/api/v1/forms', tags=['public-forms'])
email_adapter = TypeAdapter(EmailStr)


class PublicFormSubmission(BaseModel):
    model_config = ConfigDict(extra='forbid')

    type: Literal['registration', 'contact', 'lms_waitlist', 'visa']
    email: EmailStr
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    phone: Optional[str] = Field(default=None, min_length=1, max_length=64)
    institution: Optional[str] = Field(default=None, min_length=1, max_length=200)
    team: Optional[str] = Field(default=None, min_length=1, max_length=100)
    subject: Optional[str] = Field(default=None, min_length=1, max_length=200)
    message: Optional[str] = Field(default=None, max_length=5000)
    registrationType: Optional[Literal['institution', 'individual']] = None
    country: Optional[str] = Field(default=None, min_length=1, max_length=120)
    addressedTo: Optional[str] = Field(default=None, min_length=1, max_length=200)
    contactEmails: Optional[str] = Field(default=None, max_length=1000)

    @field_validator('contactEmails')
    @classmethod
    def validate_contact_emails(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        emails = [item.strip() for item in value.split(',') if item.strip()]
        if not emails or len(emails) > 10:
            raise ValueError('contactEmails must contain between 1 and 10 addresses')
        validated = [str(email_adapter.validate_python(item)) for item in emails]
        return ', '.join(validated)

    @model_validator(mode='after')
    def validate_required_fields(self):
        required_by_type = {
            'contact': ('name', 'subject', 'message'),
            'registration': ('name', 'registrationType'),
            'lms_waitlist': (),
            'visa': ('name', 'country'),
        }
        missing = [field for field in required_by_type[self.type] if not getattr(self, field)]
        if missing:
            missing_fields = ', '.join(missing)
            raise ValueError(f'Missing fields for {self.type}: {missing_fields}')
        return self


class PublicFormResponse(BaseModel):
    success: bool = True


@router.post('/submit', response_model=PublicFormResponse)
async def submit_public_form(data: PublicFormSubmission):
    if not settings.google_apps_script_url:
        logger.error('Public form destination is not configured')
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='Form service is temporarily unavailable',
        )

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.post(
                settings.google_apps_script_url,
                data={'payload': data.model_dump_json(exclude_none=True)},
            )
            response.raise_for_status()
    except httpx.HTTPError as exc:
        logger.error('Public form forwarding failed: %s', type(exc).__name__)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail='Form submission could not be completed',
        ) from exc

    logger.info('Public %s form forwarded successfully', data.type)
    return PublicFormResponse()
