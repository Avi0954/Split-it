from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.models.user import User
from backend.models.push_subscription import PushSubscription
from backend.schemas.push_subscription import PushSubscriptionCreate, PushSubscriptionOut
from backend.utils.dependencies import get_current_user

import os

router = APIRouter()

@router.get("/vapid-public-key", response_model=dict)
def get_vapid_public_key():
    """Returns the VAPID public key so the frontend can subscribe."""
    public_key = os.environ.get("VAPID_PUBLIC_KEY")
    if not public_key:
        raise HTTPException(status_code=501, detail="Push notifications not configured on the server")
    return {"publicKey": public_key}

@router.post("/subscribe", response_model=dict)
def subscribe(
    subscription: PushSubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Saves a push subscription for the authenticated user."""
    
    # Check if subscription already exists for this endpoint
    existing = db.query(PushSubscription).filter(PushSubscription.endpoint == subscription.endpoint).first()
    
    if existing:
        # If it exists but for a different user, update the user
        if existing.user_id != current_user.id:
            existing.user_id = current_user.id
            existing.p256dh = subscription.keys.p256dh
            existing.auth = subscription.keys.auth
            db.commit()
        return {"message": "Subscription already exists and updated"}
        
    new_sub = PushSubscription(
        user_id=current_user.id,
        endpoint=subscription.endpoint,
        p256dh=subscription.keys.p256dh,
        auth=subscription.keys.auth
    )
    db.add(new_sub)
    db.commit()
    
    return {"message": "Subscription saved"}

@router.delete("/unsubscribe", response_model=dict)
def unsubscribe(
    endpoint: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Removes a push subscription."""
    sub = db.query(PushSubscription).filter(
        PushSubscription.endpoint == endpoint,
        PushSubscription.user_id == current_user.id
    ).first()
    
    if sub:
        db.delete(sub)
        db.commit()
        
    return {"message": "Unsubscribed successfully"}
