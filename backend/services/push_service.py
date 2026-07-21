import json
import logging
import os
from pywebpush import webpush, WebPushException
from sqlalchemy.orm import Session
from backend.models.push_subscription import PushSubscription
from fastapi import BackgroundTasks

logger = logging.getLogger(__name__)

class PushNotificationService:
    def __init__(self):
        self.public_key = os.environ.get("VAPID_PUBLIC_KEY")
        self.private_key = os.environ.get("VAPID_PRIVATE_KEY")
        self.subject = os.environ.get("VAPID_SUBJECT", "mailto:admin@splitit.com")

    def _get_vapid_claims(self):
        return {
            "sub": self.subject
        }

    def send_notification(self, db: Session, user_id: int, payload: dict):
        """
        Retrieves all subscriptions for a user and sends the push notification securely.
        """
        if not self.private_key or not self.public_key:
            logger.warning("VAPID keys not configured. Skipping push notification.")
            return

        subscriptions = db.query(PushSubscription).filter(PushSubscription.user_id == user_id).all()
        if not subscriptions:
            return

        for sub in subscriptions:
            subscription_info = {
                "endpoint": sub.endpoint,
                "keys": {
                    "p256dh": sub.p256dh,
                    "auth": sub.auth
                }
            }
            
            try:
                webpush(
                    subscription_info=subscription_info,
                    data=json.dumps(payload),
                    vapid_private_key=self.private_key,
                    vapid_claims=self._get_vapid_claims()
                )
                logger.info(f"Push notification sent successfully to {sub.endpoint}")
            except WebPushException as ex:
                logger.error(f"Push notification failed: {repr(ex)}")
                # If subscription is no longer valid (e.g. 410 Gone or 404 Not Found), remove it
                if ex.response and ex.response.status_code in [404, 410]:
                    logger.info(f"Removing invalid subscription: {sub.endpoint}")
                    db.delete(sub)
                    db.commit()
            except Exception as e:
                logger.error(f"Unexpected error sending push notification: {e}")

    def send_notification_async(self, background_tasks: BackgroundTasks, db: Session, user_id: int, payload: dict):
        """
        Adds the send_notification task to FastAPI BackgroundTasks to avoid blocking the main thread.
        """
        background_tasks.add_task(self.send_notification, db, user_id, payload)


push_service = PushNotificationService()
