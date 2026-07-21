from sqlalchemy.orm import Session
from fastapi import BackgroundTasks
from backend.services.push_service import push_service

def dispatch_expense_added(background_tasks: BackgroundTasks, db: Session, user_ids: list, by_user_name: str, amount: float, description: str, group_id: int):
    payload = {
        "title": "New Expense Added",
        "body": f"{by_user_name} added ₹{amount:,.2f} for {description}.",
        "url": f"/groups/{group_id}",
        "type": "expense_added"
    }
    for uid in user_ids:
        push_service.send_notification_async(background_tasks, db, uid, payload)

def dispatch_settlement_received(background_tasks: BackgroundTasks, db: Session, to_user_id: int, from_user_name: str, amount: float):
    payload = {
        "title": "Settlement Received",
        "body": f"{from_user_name} settled ₹{amount:,.2f} with you.",
        "url": "/dashboard", # or settlements page
        "type": "settlement_received"
    }
    push_service.send_notification_async(background_tasks, db, to_user_id, payload)

def dispatch_added_to_group(background_tasks: BackgroundTasks, db: Session, user_id: int, group_name: str, group_id: int):
    payload = {
        "title": "Added to Group",
        "body": f"You've been added to \"{group_name}\".",
        "url": f"/groups/{group_id}",
        "type": "group_added"
    }
    push_service.send_notification_async(background_tasks, db, user_id, payload)

def dispatch_friend_added(background_tasks: BackgroundTasks, db: Session, user_id: int, friend_name: str):
    payload = {
        "title": "Friend Added",
        "body": f"{friend_name} added you as a friend.",
        "url": "/friends",
        "type": "friend_added"
    }
    push_service.send_notification_async(background_tasks, db, user_id, payload)
