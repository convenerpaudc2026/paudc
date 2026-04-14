import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr

from services.email import send_contact_notification

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/contact", tags=["contact"])


class ContactFormData(BaseModel):
    """Contact form submission data"""
    name: str
    email: EmailStr
    subject: str
    message: str


class ContactFormResponse(BaseModel):
    """Contact form response"""
    success: bool
    message: str


@router.post("/", response_model=ContactFormResponse)
async def submit_contact_form(
    data: ContactFormData,
    background_tasks: BackgroundTasks
):
    """
    Submit a contact form message.
    Sends an email notification to the convener in the background.
    """
    try:
        # Add email sending to background tasks
        background_tasks.add_task(
            send_contact_notification,
            data.model_dump()
        )
        
        logger.info(f"Contact form submitted by {data.name} ({data.email})")
        
        return ContactFormResponse(
            success=True,
            message="Your message has been sent successfully. We will get back to you soon."
        )
        
    except Exception as e:
        logger.error(f"Failed to process contact form: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to send message. Please try again later."
        )
