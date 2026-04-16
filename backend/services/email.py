import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os

logger = logging.getLogger(__name__)

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
CONVENER_EMAIL = "convenerpaudc2026@gmail.com"

async def send_email(
    to_email: str,
    subject: str,
    body_html: str,
    body_text: Optional[str] = None
) -> bool:
    """
    Send an email using SMTP.
    Returns True if successful, False otherwise.
    """
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured. Email not sent.")
        logger.info(f"Would have sent email to {to_email}: {subject}")
        return False
    
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_USERNAME
        msg["To"] = to_email
        
        # Add plain text version
        if body_text:
            part1 = MIMEText(body_text, "plain")
            msg.attach(part1)
        
        # Add HTML version
        part2 = MIMEText(body_html, "html")
        msg.attach(part2)
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_USERNAME, to_email, msg.as_string())
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


async def send_registration_notification(registration_data: dict) -> bool:
    """
    Send registration notification to the convener email.
    """
    subject = f"New PAUDC 2026 Registration: {registration_data.get('first_name', '')} {registration_data.get('last_name', '')}"
    
    body_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1B5E3B, #A4372C); padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="color: #F6F0E1; margin: 0;">New Registration</h1>
                <p style="color: #F6F0E1; margin: 5px 0 0 0;">PAUDC 2026</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
                <h2 style="color: #1B5E3B; margin-top: 0;">Participant Details</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 40%;">Name:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{registration_data.get('first_name', '')} {registration_data.get('last_name', '')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{registration_data.get('email', '')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{registration_data.get('phone', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Country:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{registration_data.get('country', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">University:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{registration_data.get('university', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Registration Type:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{registration_data.get('registration_type', '').title()}</td>
                    </tr>
                </table>
                
                <h3 style="color: #1B5E3B; margin-top: 20px;">Institution Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 40%;">Institution Name:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{registration_data.get('institution_name', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Country:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{registration_data.get('institution_country', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">University Contact Email:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{registration_data.get('university_contact_email', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Your Contact Email:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{registration_data.get('your_contact_email', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Contact Phone:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{registration_data.get('institution_phone', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">To Whom Should It Be Addressed:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{registration_data.get('addressed_to', 'N/A')}</td>
                    </tr>
                </table>
                
                <h3 style="color: #1B5E3B; margin-top: 20px;">Additional Comments</h3>
                <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #eee;">
                    {registration_data.get('special_needs', 'None')}
                </div>
            </div>
            
            <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
                This is an automated notification from the PAUDC 2026 Registration System.
            </p>
        </div>
    </body>
    </html>
    """
    
    body_text = f"""
    New PAUDC 2026 Registration
    
    Name: {registration_data.get('first_name', '')} {registration_data.get('last_name', '')}
    Email: {registration_data.get('email', '')}
    Phone: {registration_data.get('phone', 'N/A')}
    Country: {registration_data.get('country', 'N/A')}
    University: {registration_data.get('university', 'N/A')}
    Registration Type: {registration_data.get('registration_type', '').title()}
    
    Institution Details:
    Institution Name: {registration_data.get('institution_name', 'N/A')}
    Country: {registration_data.get('institution_country', 'N/A')}
    University Contact Email: {registration_data.get('university_contact_email', 'N/A')}
    Your Contact Email: {registration_data.get('your_contact_email', 'N/A')}
    Contact Phone: {registration_data.get('institution_phone', 'N/A')}
    To Whom Should It Be Addressed: {registration_data.get('addressed_to', 'N/A')}
    
    Comments: {registration_data.get('special_needs', 'None')}
    """
    
    return await send_email(CONVENER_EMAIL, subject, body_html, body_text)


async def send_contact_notification(contact_data: dict) -> bool:
    """
    Send contact form notification to the convener email.
    """
    subject = f"PAUDC 2026 Contact: {contact_data.get('subject', 'New Message')}"
    
    body_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1B5E3B, #C8A046); padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="color: #F6F0E1; margin: 0;">Contact Form Message</h1>
                <p style="color: #F6F0E1; margin: 5px 0 0 0;">PAUDC 2026</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">From:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{contact_data.get('name', '')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{contact_data.get('email', '')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{contact_data.get('subject', '')}</td>
                    </tr>
                </table>
                
                <h3 style="color: #1B5E3B; margin-top: 0;">Message:</h3>
                <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #eee;">
                    {contact_data.get('message', '').replace(chr(10), '<br>')}
                </div>
                
                <p style="margin-top: 20px; color: #666;">
                    <strong>Reply to:</strong> <a href="mailto:{contact_data.get('email', '')}" style="color: #1B5E3B;">{contact_data.get('email', '')}</a>
                </p>
            </div>
            
            <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
                This message was sent via the PAUDC 2026 Contact Form.
            </p>
        </div>
    </body>
    </html>
    """
    
    body_text = f"""
    Contact Form Message - PAUDC 2026
    
    From: {contact_data.get('name', '')}
    Email: {contact_data.get('email', '')}
    Subject: {contact_data.get('subject', '')}
    
    Message:
    {contact_data.get('message', '')}
    """
    
    return await send_email(CONVENER_EMAIL, subject, body_html, body_text)
