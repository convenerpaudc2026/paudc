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


# Where an Apps Script web app's reply comes from: /exec redirects to googleusercontent.
APPS_SCRIPT_RESPONSE_HOSTS = frozenset({'script.google.com', 'script.googleusercontent.com'})


def apps_script_failure(response: httpx.Response) -> Optional[str]:
    """Why an Apps Script reply means the submission was NOT saved, or None if it was.

    Apps Script answers HTTP 200 even when the script fails: a caught error comes
    back as {"success": false, "message": ...}, an uncaught one as an HTML error
    page, and a deployment that needs sign-in redirects to a Google login page.
    Treating every 200 as success let a broken sheet silently drop registrations
    while applicants were told they had been received.
    """
    host = response.url.host
    if host not in APPS_SCRIPT_RESPONSE_HOSTS:
        return f'redirected to {host} (deployment access or authorization problem)'
    try:
        body = response.json()
    except ValueError:
        body = None
    if isinstance(body, dict):
        if body.get('success') is False:
            detail = body.get('message') or body.get('error') or 'no message'
            return f'script reported failure: {str(detail)[:300]}'
        return None
    if 'text/html' in response.headers.get('content-type', ''):
        return 'script returned an HTML page instead of JSON (uncaught script error?)'
    return None


async def forward_to_apps_script(destination: str, data: BaseModel, timeout: float, label: str) -> None:
    """POST a submission to an Apps Script web app; raise 502 unless it was really saved."""
    try:
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
            response = await client.post(
                destination,
                data={'payload': data.model_dump_json(exclude_none=True)},
            )
            response.raise_for_status()
    except httpx.HTTPError as exc:
        logger.error('%s forwarding failed: %s', label, type(exc).__name__)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail='Form submission could not be completed',
        ) from exc

    failure = apps_script_failure(response)
    if failure:
        logger.error('%s was not saved by Apps Script: %s', label, failure)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail='Form submission could not be completed',
        )


@router.post('/submit', response_model=PublicFormResponse)
async def submit_public_form(data: PublicFormSubmission):
    # Visa requests can route to their own Apps Script / sheet when configured;
    # every other form type falls back to the shared destination.
    destination = settings.google_apps_script_url
    if data.type == 'visa' and settings.visa_apps_script_url:
        destination = settings.visa_apps_script_url

    if not destination:
        logger.error('Public form destination is not configured')
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='Form service is temporarily unavailable',
        )

    await forward_to_apps_script(destination, data, timeout=15.0, label=f'Public {data.type} form')
    logger.info('Public %s form forwarded successfully', data.type)
    return PublicFormResponse()


class LegacyLabAttachment(BaseModel):
    model_config = ConfigDict(extra='forbid')

    filename: str = Field(min_length=1, max_length=255)
    mimeType: str = Field(min_length=1, max_length=150)
    # base64 of a file the frontend caps at ~1.3MB (~1.73MB encoded).
    dataBase64: str = Field(min_length=1, max_length=2_000_000)


class LegacyLabApplication(BaseModel):
    model_config = ConfigDict(extra='forbid')

    # Section 1 — Applicant information
    fullName: str = Field(min_length=1, max_length=200)
    email: EmailStr
    phone: str = Field(min_length=1, max_length=64)
    country: str = Field(min_length=1, max_length=120)
    city: str = Field(min_length=1, max_length=120)
    institution: str = Field(min_length=1, max_length=200)
    courseOfStudy: Optional[str] = Field(default=None, max_length=200)
    levelOfStudy: str = Field(min_length=1, max_length=60)
    applicantType: Literal['Individual', 'Team']

    # Section 2 — Team information
    teamName: Optional[str] = Field(default=None, max_length=200)
    teamLead: Optional[str] = Field(default=None, max_length=200)
    teamMembers: Optional[str] = Field(default=None, max_length=3000)
    teamInstitutions: Optional[str] = Field(default=None, max_length=3000)

    # Section 3 — Eligibility and availability
    studentStatus: str = Field(min_length=1, max_length=60)
    availableIncubation: str = Field(min_length=1, max_length=20)
    availableShowcase: str = Field(min_length=1, max_length=20)
    understandNoGuarantee: bool

    # Section 4 — Project idea
    projectTitle: str = Field(min_length=1, max_length=200)
    thematicArea: str = Field(min_length=1, max_length=120)
    ideaOneSentence: str = Field(min_length=1, max_length=1000)
    problem: str = Field(min_length=1, max_length=4000)
    affected: str = Field(min_length=1, max_length=4000)
    solution: str = Field(min_length=1, max_length=4000)
    whyItMatters: str = Field(min_length=1, max_length=4000)
    alreadyStarted: Literal['Yes', 'No', 'Partly']
    progressSoFar: Optional[str] = Field(default=None, max_length=4000)

    # Section 5 — Pilot and support needed
    pilotDescription: str = Field(min_length=1, max_length=4000)
    pilotLocation: str = Field(min_length=1, max_length=300)
    supportNeeded: list[str]
    supportOther: Optional[str] = Field(default=None, max_length=300)
    pilotBudget: str = Field(min_length=1, max_length=60)

    # Section 6 — Impact and motivation
    changeHoped: str = Field(min_length=1, max_length=4000)
    beneficiaryReach: str = Field(min_length=1, max_length=40)
    personalMotivation: str = Field(min_length=1, max_length=4000)

    # Section 7 — Supporting material
    links: Optional[str] = Field(default=None, max_length=2000)
    attachment: Optional[LegacyLabAttachment] = None

    # Section 8 — Declarations
    declarationAccurate: bool
    declarationOriginal: bool
    declarationConsent: bool
    declarationParticipate: bool

    @field_validator('supportNeeded')
    @classmethod
    def validate_support_needed(cls, value: list[str]) -> list[str]:
        if not value or len(value) > 10:
            raise ValueError('supportNeeded must contain between 1 and 10 items')
        if any(len(item) > 60 for item in value):
            raise ValueError('supportNeeded values are too long')
        return value

    @model_validator(mode='after')
    def validate_application(self):
        required_true = (
            'understandNoGuarantee', 'declarationAccurate', 'declarationOriginal',
            'declarationConsent', 'declarationParticipate',
        )
        not_accepted = [name for name in required_true if not getattr(self, name)]
        if not_accepted:
            raise ValueError(f'Required confirmations missing: {", ".join(not_accepted)}')

        if self.applicantType == 'Team':
            missing = [f for f in ('teamName', 'teamLead', 'teamMembers') if not (getattr(self, f) or '').strip()]
            if missing:
                raise ValueError(f'Missing team fields: {", ".join(missing)}')

        if self.alreadyStarted in ('Yes', 'Partly') and not (self.progressSoFar or '').strip():
            raise ValueError('progressSoFar is required when work has already started')

        if 'Other' in self.supportNeeded and not (self.supportOther or '').strip():
            raise ValueError('supportOther is required when "Other" support is selected')

        return self


@router.post('/legacy-lab', response_model=PublicFormResponse)
async def submit_legacy_lab(data: LegacyLabApplication):
    if not settings.legacy_lab_apps_script_url:
        logger.error('Legacy Lab form destination is not configured')
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='Form service is temporarily unavailable',
        )

    await forward_to_apps_script(
        settings.legacy_lab_apps_script_url, data, timeout=20.0, label='Legacy Lab application',
    )
    logger.info('Legacy Lab application forwarded successfully')
    return PublicFormResponse()
