import logging
import asyncio
from typing import Dict, Set
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Maps user_id to a set of active WebSockets
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        # We also need a way to track which groups a user belongs to if we wanted pure server-side filtering, 
        # but the prompt specifies broadcasting to affected users, which means we can just resolve the user IDs 
        # when broadcasting.

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        logger.info(f"User {user_id} connected. Total active users: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"User {user_id} disconnected.")

    async def broadcast_to_users(self, user_ids: set, event_data: dict):
        """Broadcast an event to specific users."""
        for user_id in user_ids:
            if user_id in self.active_connections:
                for connection in self.active_connections[user_id]:
                    try:
                        await connection.send_json(event_data)
                    except Exception as e:
                        logger.error(f"Failed to send message to user {user_id}: {e}")
                        # Cleanup dead connection
                        await self._cleanup_dead_connection(connection, user_id)
                        
    async def _cleanup_dead_connection(self, websocket: WebSocket, user_id: int):
        try:
            self.disconnect(websocket, user_id)
        except Exception:
            pass

manager = ConnectionManager()
