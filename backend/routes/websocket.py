from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from sqlalchemy.orm import Session
from backend.utils.dependencies import get_db
from backend.utils.security import verify_access_token
from backend.websocket.manager import manager
import logging
import asyncio
import json

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time synchronization.
    Authenticates via JWT token query parameter.
    """
    # Authenticate token
    try:
        payload = verify_access_token(token)
        if not payload:
            await websocket.close(code=1008)
            return
            
        user_email = payload.get("sub")
        if not user_email:
            await websocket.close(code=1008)
            return
            
        # We need the user ID
        from backend.models.user import User
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            await websocket.close(code=1008)
            return
            
        user_id = user.id
    except Exception as e:
        logger.error(f"WebSocket auth failed: {e}")
        await websocket.close(code=1008)
        return

    # Accept connection
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # We don't expect the client to send much data, but we listen for heartbeat 'ping'
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(websocket, user_id)
