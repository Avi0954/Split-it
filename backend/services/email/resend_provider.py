import os
import logging
import requests
from backend.services.email.email_provider import EmailProvider

logger = logging.getLogger(__name__)

class ResendProvider(EmailProvider):
    def __init__(self):
        self.api_key = os.getenv("RESEND_API_KEY")
        self.sender = os.getenv("EMAIL_FROM", "SplitIt <noreply@splitit.com>")
        self.reply_to = os.getenv("EMAIL_REPLY_TO", "support@splitit.com")

    def send_email(self, to_email: str, subject: str, html_content: str, plain_content: str) -> bool:
        if not self.api_key:
            logger.error("Resend API key missing.")
            return False

        try:
            response = requests.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "from": self.sender,
                    "to": to_email,
                    "subject": subject,
                    "html": html_content,
                    "text": plain_content,
                    "reply_to": self.reply_to
                },
                timeout=10
            )
            response.raise_for_status()
            logger.info(f"Email sent via Resend to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Resend failed to send email to {to_email}: {str(e)}")
            return False

class MockProvider(EmailProvider):
    def send_email(self, to_email: str, subject: str, html_content: str, plain_content: str) -> bool:
        print(f"\n{'='*50}\n[MOCK EMAIL SENT TO: {to_email}]\nSUBJECT: {subject}\n{'='*50}\n")
        logger.info(f"Mock email sent to {to_email} with subject '{subject}'")
        return True
