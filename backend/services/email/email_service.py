import os
import time
import logging
from typing import Callable
from fastapi import BackgroundTasks

from backend.services.email.email_provider import EmailProvider
from backend.services.email.resend_provider import ResendProvider, MockProvider
from backend.services.email import email_templates

logger = logging.getLogger(__name__)

# Configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
MAX_RETRIES = 3
BACKOFF_DELAYS = [1, 2, 4] # seconds

class EmailService:
    def __init__(self, provider: EmailProvider = None):
        if provider:
            self.provider = provider
        else:
            # Default logic based on environment
            provider_type = os.getenv("EMAIL_PROVIDER", "MOCK").upper()
            if provider_type == "RESEND":
                self.provider = ResendProvider()
            else:
                self.provider = MockProvider()

    def _execute_with_retry(self, to_email: str, subject: str, html: str, plain: str):
        """Executes the email sending logic with a backoff retry strategy."""
        start_time = time.time()
        
        for attempt in range(MAX_RETRIES):
            success = self.provider.send_email(to_email, subject, html, plain)
            
            if success:
                duration = round(time.time() - start_time, 2)
                logger.info(f"Email '{subject}' delivered to {to_email} in {duration}s (Attempt {attempt+1})")
                return
            
            if attempt < MAX_RETRIES - 1:
                delay = BACKOFF_DELAYS[attempt]
                logger.warning(f"Email delivery failed for {to_email}. Retrying in {delay}s...")
                time.sleep(delay)
                
        logger.error(f"Failed to deliver email '{subject}' to {to_email} after {MAX_RETRIES} attempts.")

    def _queue_email(self, background_tasks: BackgroundTasks, to_email: str, subject: str, html: str, plain: str):
        """Queues the email for background execution."""
        background_tasks.add_task(self._execute_with_retry, to_email, subject, html, plain)

    # =========================================================================
    # PUBLIC NOTIFICATION METHODS
    # =========================================================================

    def send_welcome_email(self, background_tasks: BackgroundTasks, to_email: str, user_name: str):
        login_url = f"{FRONTEND_URL}/login"
        html, plain = email_templates.get_welcome_email(user_name, login_url)
        self._queue_email(
            background_tasks, 
            to_email, 
            f"Welcome to {email_templates.APP_NAME}!", 
            html, 
            plain
        )

    def send_password_reset(self, background_tasks: BackgroundTasks, to_email: str, reset_token: str):
        reset_url = f"{FRONTEND_URL}/reset-password?token={reset_token}"
        html, plain = email_templates.get_password_reset_email(reset_url)
        self._queue_email(
            background_tasks, 
            to_email, 
            "Reset your SplitIt password", 
            html, 
            plain
        )

    def send_group_invitation(self, background_tasks: BackgroundTasks, to_email: str, group_name: str, inviter_name: str, group_id: int):
        group_url = f"{FRONTEND_URL}/groups/{group_id}"
        html, plain = email_templates.get_group_invitation_email(group_name, inviter_name, group_url)
        self._queue_email(
            background_tasks, 
            to_email, 
            "You've been invited to join a SplitIt group", 
            html, 
            plain
        )

    def send_friend_invitation(self, background_tasks: BackgroundTasks, to_email: str, inviter_name: str):
        accept_url = f"{FRONTEND_URL}/friends"
        html, plain = email_templates.get_friend_invitation_email(inviter_name, accept_url)
        self._queue_email(
            background_tasks, 
            to_email, 
            "You've been invited to connect on SplitIt", 
            html, 
            plain
        )

# Global instance for DI
email_service = EmailService()
