from abc import ABC, abstractmethod
import logging

logger = logging.getLogger(__name__)

class EmailProvider(ABC):
    """
    Abstract base class for all email providers.
    Ensures provider-agnostic business logic.
    """
    
    @abstractmethod
    def send_email(self, to_email: str, subject: str, html_content: str, plain_content: str) -> bool:
        """
        Sends an email.
        Should handle its own exceptions and return True on success, False on failure.
        """
        pass
