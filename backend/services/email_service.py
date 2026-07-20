import os
import logging

logger = logging.getLogger(__name__)

def get_email_template(reset_link: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password - SplitIt</title>
        <style>
            body {{ font-family: 'Inter', Arial, sans-serif; background-color: #09090B; color: #EAEAF0; margin: 0; padding: 40px; text-align: center; }}
            .container {{ max-width: 500px; margin: 0 auto; background-color: #12121A; padding: 40px; border-radius: 16px; border: 1px solid #1F1F2B; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #EAEAF0; text-decoration: none; display: inline-block; margin-bottom: 24px; }}
            .logo span {{ color: #A78BFA; }}
            h1 {{ font-size: 20px; font-weight: 600; margin-bottom: 16px; }}
            p {{ color: #A1A1AA; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }}
            .btn {{ display: inline-block; background-color: #A78BFA; color: #000; padding: 12px 24px; font-weight: 600; font-size: 14px; text-decoration: none; border-radius: 8px; margin-bottom: 24px; }}
            .footer {{ margin-top: 32px; font-size: 12px; color: #52525B; }}
        </style>
    </head>
    <body>
        <div class="container">
            <a href="#" class="logo">Split<span>It</span></a>
            <h1>Reset Your Password</h1>
            <p>Hello,</p>
            <p>We received a request to reset your SplitIt password.</p>
            <p>Click below to reset your password.</p>
            
            <a href="{reset_link}" class="btn">Reset Password</a>
            
            <p><strong>This link expires in 15 minutes.</strong></p>
            <p>If you didn't request this, simply ignore this email.</p>
            
            <div class="footer">
                <p>Securely sent by SplitIt.</p>
            </div>
        </div>
    </body>
    </html>
    """

def get_plain_text_template(reset_link: str) -> str:
    return f"""
    Hello,
    
    We received a request to reset your SplitIt password.
    
    Click the link below to reset your password:
    {reset_link}
    
    This link expires in 15 minutes.
    
    If you didn't request this, simply ignore this email.
    """

def send_password_reset_email(to_email: str, reset_token: str):
    provider = os.getenv("EMAIL_PROVIDER", "MOCK").upper()
    frontend_url = os.getenv("RESET_PASSWORD_URL", "http://localhost:5173/reset-password")
    reset_link = f"{frontend_url}?token={reset_token}"
    
    html_content = get_email_template(reset_link)
    plain_content = get_plain_text_template(reset_link)
    
    if provider == "RESEND":
        _send_via_resend(to_email, html_content, plain_content)
    elif provider == "SMTP":
        _send_via_smtp(to_email, html_content, plain_content)
    elif provider == "MAILGUN":
        _send_via_mailgun(to_email, html_content, plain_content)
    else:
        # Mock sending
        print(f"\n{'='*50}\n[MOCK EMAIL SENT TO: {to_email}]\nLINK: {reset_link}\n{'='*50}\n")
        logger.info(f"Mock email sent to {to_email} with token {reset_token}")

def _send_via_resend(to_email: str, html: str, plain: str):
    import requests
    api_key = os.getenv("EMAIL_API_KEY")
    sender = os.getenv("EMAIL_FROM", "noreply@splitit.com")
    
    if not api_key:
        logger.error("Resend API key missing.")
        return
        
    requests.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {api_key}"},
        json={
            "from": sender,
            "to": to_email,
            "subject": "Reset your SplitIt password",
            "html": html,
            "text": plain
        }
    )

def _send_via_smtp(to_email: str, html: str, plain: str):
    # Implementation would go here using smtplib
    pass

def _send_via_mailgun(to_email: str, html: str, plain: str):
    # Implementation would go here using requests
    pass
