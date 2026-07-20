from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List

from backend.database import get_db
from backend.schemas.friend import AddFriendRequest, FriendResponse
from backend.models.user import User
from backend.models.group import Group, GroupMember
from backend.models.friendship import Friendship
from backend.utils.dependencies import get_current_user
from backend.services.email.email_service import email_service
from backend.services.realtime_service import realtime_service
from fastapi import BackgroundTasks

router = APIRouter()

@router.post("/", response_model=FriendResponse, status_code=status.HTTP_201_CREATED)
def add_friend(request: AddFriendRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if request.email == current_user.email:
        raise HTTPException(status_code=400, detail="Cannot add yourself as a friend")

    friend_user = db.query(User).filter(User.email == request.email).first()
    if not friend_user:
        raise HTTPException(status_code=404, detail="User with this email not found")

    # Check if friendship already exists
    existing_friendship = db.query(Friendship).filter(
        or_(
            and_(Friendship.user1_id == current_user.id, Friendship.user2_id == friend_user.id),
            and_(Friendship.user1_id == friend_user.id, Friendship.user2_id == current_user.id)
        )
    ).first()

    if existing_friendship:
        raise HTTPException(status_code=400, detail="You are already friends with this user")

    # 1. Create a hidden 1-on-1 group
    new_group = Group(
        name=f"Direct: {current_user.name} & {friend_user.name}",
        description="Hidden group for 1-on-1 expenses",
        created_by=current_user.id
    )
    db.add(new_group)
    db.commit()
    db.refresh(new_group)

    # 2. Add both members to the group
    member1 = GroupMember(group_id=new_group.id, user_id=current_user.id)
    member2 = GroupMember(group_id=new_group.id, user_id=friend_user.id)
    db.add(member1)
    db.add(member2)

    # 3. Create Friendship record
    u1, u2 = sorted([current_user.id, friend_user.id])
    new_friendship = Friendship(
        user1_id=u1,
        user2_id=u2,
        group_id=new_group.id
    )
    db.add(new_friendship)
    db.commit()
    db.refresh(new_friendship)

    # Send friend invitation email asynchronously
    email_service.send_friend_invitation(background_tasks, friend_user.email, current_user.name)

    friend_data = {
        "id": new_friendship.id,
        "friend": friend_user,
        "group_id": new_group.id,
        "balance": 0.0
    }
    
    # Broadcast event
    # We must convert the friend_user model to dict to avoid serialization issues
    friend_payload = {
        "id": new_friendship.id,
        "friend": {
            "id": friend_user.id,
            "name": friend_user.name,
            "email": friend_user.email
        },
        "group_id": new_group.id,
        "balance": 0.0
    }
    realtime_service.broadcast_friend_added(db, new_friendship.id, friend_payload)

    return friend_data

@router.get("/", response_model=List[FriendResponse])
def get_friends(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    friendships = db.query(Friendship).filter(
        or_(Friendship.user1_id == current_user.id, Friendship.user2_id == current_user.id)
    ).all()

    # For each friendship, we need to get the friend user and calculate balance
    # Wait, calculating balance across the hidden group is same as normal group balance
    from backend.services.expense_service import calculate_group_balances
    
    result = []
    for f in friendships:
        friend_id = f.user2_id if f.user1_id == current_user.id else f.user1_id
        friend_user = db.query(User).filter(User.id == friend_id).first()
        
        # Calculate balance
        try:
            balances = calculate_group_balances(db, f.group_id)
            balance = 0.0
            for b in balances:
                if b.user_id == current_user.id:
                    balance = b.net_balance
        except Exception:
            balance = 0.0

        result.append({
            "id": f.id,
            "friend": friend_user,
            "group_id": f.group_id,
            "balance": balance
        })

    return result
