from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.models.group import Group, GroupMember
from backend.models.user import User
from backend.models.expense import Expense, Split
from backend.models.settlement import Settlement
from backend.schemas.group import GroupCreate
from backend.services.expense_service import calculate_group_balances
from backend.services.realtime_service import realtime_service
from backend.services.notification_dispatcher import dispatch_added_to_group
from fastapi import BackgroundTasks

def create_group(db: Session, user_id: int, group_data: GroupCreate):
    """Creates a new group and automatically adds the creator as a member."""
    new_group = Group(
        name=group_data.name,
        description=group_data.description,
        icon_name=group_data.icon_name,
        icon_color=group_data.icon_color,
        currency=group_data.currency,
        created_by=user_id
    )
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    
    # Automatically add creator as the first member
    add_member(db, new_group.id, user_id)
    
    # Broadcast event
    group_dict = {
        "id": new_group.id,
        "name": new_group.name,
        "description": new_group.description
    }
    realtime_service.broadcast_group_created(db, new_group.id, group_dict, user_id)
    
    return new_group

def add_member(db: Session, group_id: int, user_id: int, background_tasks: BackgroundTasks = None, current_user_name: str = ""):
    """Adds a user to a group after validating existence and duplicates."""
    # Check if group exists
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Check if user is already a member
    is_member = db.query(GroupMember).filter(
        GroupMember.group_id == group_id, 
        GroupMember.user_id == user_id
    ).first()
    
    if is_member:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is already a member of this group")
    
    # Add new member
    new_member = GroupMember(
        group_id=group_id,
        user_id=user_id
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    
    # Broadcast event
    realtime_service.broadcast_member_added(db, group_id, user_id)
    
    # Send Push Notification
    if background_tasks and current_user_name:
        dispatch_added_to_group(background_tasks, db, user_id, group.name, group_id)
    
    return new_member

def get_user_groups(db: Session, user_id: int):
    """Retrieves all groups that the user is a member of."""
    memberships = db.query(GroupMember).filter(GroupMember.user_id == user_id).all()
    # Extract group objects from memberships
    return [m.group for m in memberships]

def get_group_details(db: Session, group_id: int):
    """Retrieves comprehensive group details including the member list."""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    return group

def remove_member(db: Session, group_id: int, user_id: int):
    """Allows a user to leave a group, provided their balance is fully settled."""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
        
    membership = db.query(GroupMember).filter(
        GroupMember.group_id == group_id, 
        GroupMember.user_id == user_id
    ).first()
    
    if not membership:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You are not a member of this group")

    # Check if user has zero balance
    balances = calculate_group_balances(db, group_id)
    user_balance = next((b for b in balances if b.user_id == user_id), None)
    
    if user_balance and abs(user_balance.net_balance) > 0.01:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"You cannot leave the group. Your net balance must be zero. Current balance: {user_balance.net_balance}"
        )

    db.delete(membership)
    db.commit()
    
    # Broadcast event
    realtime_service.broadcast_member_removed(db, group_id, user_id)
    
    return {"message": "You have left the group successfully"}

def delete_group(db: Session, group_id: int, user_id: int):
    """Deletes a group and destroys all associated historical data (expenses, splits, settlements). Only the creator can do this."""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    if group.created_by != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the group creator can delete this group")

    # Capture member IDs before deletion to broadcast to them
    members = db.query(GroupMember).filter(GroupMember.group_id == group_id).all()
    affected_users = {m.user_id for m in members}

    # Destructive manual cascade to bypass integrity constraint locks easily
    # 1. Delete all splits generated by expenses in this group
    db.query(Split).filter(Split.expense_id.in_(
        db.query(Expense.id).filter(Expense.group_id == group_id)
    )).delete(synchronize_session=False)

    # 2. Delete all expenses
    db.query(Expense).filter(Expense.group_id == group_id).delete(synchronize_session=False)
    
    # 3. Delete all settlements
    db.query(Settlement).filter(Settlement.group_id == group_id).delete(synchronize_session=False)
    
    # 4. Delete group memberships
    db.query(GroupMember).filter(GroupMember.group_id == group_id).delete(synchronize_session=False)
    
    # 5. Finally, delete the group
    db.delete(group)
    
    db.commit()
    
    # Broadcast event
    realtime_service.broadcast_group_deleted(db, group_id, affected_users)
    
    return {"message": "Group permanently deleted"}
