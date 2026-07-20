import secrets
import hashlib
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, BackgroundTasks
from backend.models.user import User
from backend.models.password_reset_token import PasswordResetToken
from backend.services.email.email_service import email_service
from backend.utils.security import hash_password

TOKEN_EXPIRATION_MINUTES = 15

def _hash_token(token: str) -> str:
    """Hashes the token for secure storage using SHA256."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def request_password_reset(db: Session, email: str, background_tasks: BackgroundTasks):
    """
    Initiates a password reset request.
    Always returns silently regardless of whether the user exists,
    to prevent email enumeration.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Don't throw an error, just return to prevent user enumeration
        return
        
    # Generate secure random token
    raw_token = secrets.token_urlsafe(32)
    hashed_token = _hash_token(raw_token)
    
    expires_at = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRATION_MINUTES)
    
    # Save the hashed token in DB
    reset_record = PasswordResetToken(
        user_id=user.id,
        hashed_token=hashed_token,
        expires_at=expires_at,
        used=False
    )
    
    db.add(reset_record)
    db.commit()
    
    # Send email with the RAW token asynchronously
    email_service.send_password_reset(background_tasks, user.email, raw_token)

def reset_password(db: Session, raw_token: str, new_password: str):
    """
    Validates a password reset token and updates the user's password if valid.
    """
    # Hash the incoming raw token to find it in the DB
    hashed_token = _hash_token(raw_token)
    
    # Find token in DB
    token_record = db.query(PasswordResetToken).filter(
        PasswordResetToken.hashed_token == hashed_token
    ).first()
    
    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid or expired reset token."
        )
        
    if token_record.used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="This reset token has already been used."
        )
        
    if token_record.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="This reset token has expired."
        )
        
    # Get user
    user = db.query(User).filter(User.id == token_record.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found."
        )
        
    # Update password
    user.password = hash_password(new_password)
    
    # Mark token as used
    token_record.used = True
    
    # Delete all other tokens for this user
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.id != token_record.id
    ).delete(synchronize_session=False)
    
    db.commit()

def cleanup_expired_tokens(db: Session):
    """Deletes expired tokens from the database to save space."""
    db.query(PasswordResetToken).filter(
        PasswordResetToken.expires_at < datetime.utcnow()
    ).delete(synchronize_session=False)
    db.commit()
