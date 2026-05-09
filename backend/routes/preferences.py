from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.models.user import User
from backend.models.user_preferences import UserPreferences
from backend.schemas.preferences import PreferencesResponse, PreferencesUpdate
from backend.utils.dependencies import get_db, get_current_user

router = APIRouter()

@router.get("/", response_model=PreferencesResponse)
def get_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the current user's preferences. Creates default if none exist."""
    prefs = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()
    
    if not prefs:
        prefs = UserPreferences(user_id=current_user.id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
        
    return prefs

@router.put("/", response_model=PreferencesResponse)
def update_preferences(
    update_data: PreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update settings and preferences"""
    prefs = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()
    
    if not prefs:
        prefs = UserPreferences(user_id=current_user.id)
        db.add(prefs)
    
    # Update only provided fields
    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(prefs, key, value)
        
    db.commit()
    db.refresh(prefs)
    return prefs
