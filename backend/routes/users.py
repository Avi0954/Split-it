from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from backend.models.user import User
from backend.schemas.user import UserResponse
from backend.utils.dependencies import get_db, get_current_user
from backend.models.expense import Expense
from backend.models.settlement import Settlement
from backend.models.group import GroupMember
from backend.utils.security import hash_password, verify_password
from pydantic import BaseModel, EmailStr

class UserUpdateSchema(BaseModel):
    name: str | None = None
    email: EmailStr | None = None

class PasswordChangeSchema(BaseModel):
    current_password: str
    new_password: str

router = APIRouter()

@router.get("/search", response_model=UserResponse)
def search_user_by_email(
    email: str = Query(..., description="The email of the user to search for"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Finds a user by their exact email address. 
    Used for adding members to a group.
    """
    print(f"DEBUG: Searching for user with email: {email}")
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in the matrix."
        )
        
    return user

@router.put("/update", response_model=UserResponse)
def update_user_profile(
    data: UserUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.name:
        current_user.name = data.name
    if data.email:
        # verify no collision
        existing = db.query(User).filter(User.email == data.email).first()
        if existing and existing.id != current_user.id:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = data.email
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/change-password")
def change_password(
    data: PasswordChangeSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(data.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    current_user.password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@router.get("/me/activity")
def get_user_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    group_ids = [m.group_id for m in current_user.group_memberships]
    if not group_ids:
        return []
    
    # Get recent expenses in user's groups
    expenses = db.query(Expense).filter(Expense.group_id.in_(group_ids)).order_by(Expense.created_at.desc()).limit(20).all()
    # Get recent settlements in user's groups
    settlements = db.query(Settlement).filter(Settlement.group_id.in_(group_ids)).order_by(Settlement.created_at.desc()).limit(20).all()
    
    feed = []
    for exp in expenses:
        feed.append({
            "type": "expense",
            "id": f"exp_{exp.id}",
            "description": exp.description,
            "amount": exp.amount,
            "group_name": exp.group.name,
            "by_user": exp.payer.name,
            "created_at": exp.created_at.isoformat()
        })
        
    for s in settlements:
        feed.append({
            "type": "settlement",
            "id": f"set_{s.id}",
            "description": "Settled debt",
            "amount": s.amount,
            "group_name": s.group.name,
            "by_user": s.from_user.name,
            "to_user": s.to_user.name,
            "created_at": s.created_at.isoformat()
        })
        
    # Sort unified feed by created_at descending
    feed.sort(key=lambda x: x["created_at"], reverse=True)
    return feed[:30]
