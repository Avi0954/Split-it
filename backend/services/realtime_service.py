import asyncio
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from backend.websocket.manager import manager
from backend.websocket.events import EventTypes
from backend.models.group import GroupMember
from backend.models.friendship import Friendship

logger = logging.getLogger(__name__)

class RealtimeService:
    """
    Isolated service to dispatch WebSocket events after DB transactions complete.
    Never contains business logic. Never blocks the main thread.
    """

    def _get_group_member_ids(self, db: Session, group_id: int) -> set:
        members = db.query(GroupMember).filter(GroupMember.group_id == group_id).all()
        return {m.user_id for m in members}

    def _get_friend_ids(self, db: Session, friendship_id: int) -> set:
        f = db.query(Friendship).filter(Friendship.id == friendship_id).first()
        if f:
            return {f.user1_id, f.user2_id}
        return set()

    def _dispatch_async(self, user_ids: set, event_type: str, payload: dict, group_id: int = None):
        """Helper to fire off broadcast task without blocking."""
        event_data = {
            "type": event_type,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "group_id": group_id,
            "payload": payload
        }
        
        try:
            # We spawn a background task so it doesn't hold up the request
            # In FastAPI, standard async functions can be created as tasks on the event loop
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = asyncio.get_event_loop()
            loop.create_task(manager.broadcast_to_users(user_ids, event_data))
            logger.debug(f"Dispatched {event_type} to {user_ids}")
        except Exception as e:
            logger.error(f"Failed to dispatch realtime event: {e}")

    # --- Expense Events ---
    def broadcast_expense_created(self, db: Session, group_id: int, expense_data: dict):
        users = self._get_group_member_ids(db, group_id)
        self._dispatch_async(users, EventTypes.EXPENSE_CREATED, expense_data, group_id)
        
    def broadcast_expense_updated(self, db: Session, group_id: int, expense_data: dict):
        users = self._get_group_member_ids(db, group_id)
        self._dispatch_async(users, EventTypes.EXPENSE_UPDATED, expense_data, group_id)

    def broadcast_expense_deleted(self, db: Session, group_id: int, expense_id: int):
        users = self._get_group_member_ids(db, group_id)
        self._dispatch_async(users, EventTypes.EXPENSE_DELETED, {"expense_id": expense_id}, group_id)

    # --- Settlement Events ---
    def broadcast_settlement_created(self, db: Session, group_id: int, settlement_data: dict):
        users = self._get_group_member_ids(db, group_id)
        self._dispatch_async(users, EventTypes.SETTLEMENT_CREATED, settlement_data, group_id)

    # --- Group Events ---
    def broadcast_group_created(self, db: Session, group_id: int, group_data: dict, creator_id: int):
        self._dispatch_async({creator_id}, EventTypes.GROUP_CREATED, group_data, group_id)

    def broadcast_group_updated(self, db: Session, group_id: int, group_data: dict):
        users = self._get_group_member_ids(db, group_id)
        self._dispatch_async(users, EventTypes.GROUP_UPDATED, group_data, group_id)

    def broadcast_group_deleted(self, db: Session, group_id: int, affected_users: set):
        self._dispatch_async(affected_users, EventTypes.GROUP_DELETED, {"group_id": group_id}, group_id)

    def broadcast_member_added(self, db: Session, group_id: int, user_id: int):
        users = self._get_group_member_ids(db, group_id)
        self._dispatch_async(users, EventTypes.MEMBER_ADDED, {"user_id": user_id}, group_id)

    def broadcast_member_removed(self, db: Session, group_id: int, user_id: int):
        # We need to broadcast to the remaining members, and also the removed user
        users = self._get_group_member_ids(db, group_id)
        users.add(user_id)
        self._dispatch_async(users, EventTypes.MEMBER_REMOVED, {"user_id": user_id}, group_id)

    # --- Friend Events ---
    def broadcast_friend_added(self, db: Session, friendship_id: int, friend_data: dict):
        users = self._get_friend_ids(db, friendship_id)
        self._dispatch_async(users, EventTypes.FRIEND_ADDED, friend_data)

realtime_service = RealtimeService()
