import os
import uuid
from typing import List, Optional, Annotated
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.schemas.group import GroupCreate, GroupResponse, GroupDetail, AddMember
from backend.utils.dependencies import get_db, get_current_user
from backend.models.user import User
from backend.services.group_service import create_group, add_member, get_user_groups, get_group_details, remove_member, delete_group

router = APIRouter()

@router.post("/", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
def create_new_group(
    group_data: GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Creates a new group with an icon and the current user as creator."""
    return create_group(db, current_user.id, group_data)

@router.post("/{group_id}/add-member", status_code=status.HTTP_201_CREATED)
def add_new_member(group_id: int, member_data: AddMember, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Adds a member to the specified group by user ID."""
    return add_member(db, group_id, member_data.user_id)

@router.get("/", response_model=List[GroupResponse])
def list_my_groups(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    groups = get_user_groups(db, current_user.id)
    
    from backend.services.expense_service import calculate_group_balances
    from backend.models.group import GroupMember
    from backend.models.expense import Expense
    from datetime import datetime
    
    def time_ago(dt: datetime) -> str:
        diff = datetime.utcnow() - dt
        if diff.days > 0:
            return f"{diff.days}d ago"
        hours = diff.seconds // 3600
        if hours > 0:
            return f"{hours}h ago"
        minutes = (diff.seconds % 3600) // 60
        if minutes > 0:
            return f"{minutes}m ago"
        return "Just now"
    
    result = []
    for g in groups:
        members_count = db.query(GroupMember).filter(GroupMember.group_id == g.id).count()
        balance = 0.0
        try:
            balances = calculate_group_balances(db, g.id)
            for b in balances:
                if b.user_id == current_user.id:
                    balance = b.net_balance
        except Exception:
            pass
            
        last_activity = None
        recent_exp = db.query(Expense).filter(Expense.group_id == g.id).order_by(Expense.created_at.desc()).first()
        if recent_exp:
            payer_name = "You" if recent_exp.payer_id == current_user.id else recent_exp.payer.name.split(" ")[0]
            curr_symbol = "₹" if getattr(recent_exp, 'currency', 'INR') == "INR" else "रु "
            last_activity = f"{payer_name} paid {curr_symbol}{recent_exp.amount:g} • {time_ago(recent_exp.created_at)}"
            
        result.append({
            "id": g.id,
            "name": g.name,
            "created_by": g.created_by,
            "created_at": g.created_at,
            "description": g.description,
            "icon_name": g.icon_name,
            "icon_color": g.icon_color,
            "members_count": members_count,
            "user_balance": balance,
            "last_activity": last_activity
        })
    return result

@router.get("/{group_id}", response_model=GroupDetail)
def get_group(group_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieves detailed information about a group, including members."""
    return get_group_details(db, group_id)

@router.delete("/{group_id}/members/me")
def leave_group(group_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Allows the current user to leave the group, provided their balance is exactly zero."""
    return remove_member(db, group_id, current_user.id)

@router.delete("/{group_id}")
def dump_group(group_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Permanently deletes the group and cascades to all nested resources. Restricted to group creator."""
    return delete_group(db, group_id, current_user.id)
