from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.models.user import User
from backend.schemas.user import UserCreate, UserLogin, UserResponse
from backend.utils.security import hash_password, verify_password, create_access_token
from backend.utils.dependencies import get_db, get_current_user
from backend.schemas.password_reset import ForgotPasswordRequest, ResetPasswordRequest
from backend.services.password_reset_service import request_password_reset, reset_password, cleanup_expired_tokens
from backend.services.email.email_service import email_service
from backend.utils.rate_limit import rate_limit_forgot_password, check_email_rate_limit
from fastapi import Request, BackgroundTasks

router = APIRouter()

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Registers a new user and hashes their password."""
    print(f"DEBUG: signup called with: {user_data}")
    # Check if email is already registered
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user record
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hash_password(user_data.password)
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send welcome email asynchronously
    email_service.send_welcome_email(background_tasks, new_user.email, new_user.name)
    
    return new_user

@router.post("/login")
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticates a user and returns a JWT access token."""
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    
    # Verify user exists and password is correct
    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate access token
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieves the current authenticated user's profile."""
    return current_user

@router.post("/forgot-password")
def forgot_password(
    request_data: ForgotPasswordRequest, 
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Initiates a password reset request."""
    # Run rate limit checks
    rate_limit_forgot_password(request)
    check_email_rate_limit(request_data.email)
    
    # Run cleanup of old tokens periodically
    cleanup_expired_tokens(db)
    
    request_password_reset(db, request_data.email, background_tasks)
    
    return {"message": "If an account exists for this email, a password reset link has been sent."}

@router.post("/reset-password")
def reset_password_endpoint(
    request_data: ResetPasswordRequest, 
    db: Session = Depends(get_db)
):
    """Resets the user password using a valid token."""
    # We call the service function to validate and save
    reset_password(db, request_data.token, request_data.new_password)
    
    return {"message": "Password reset successfully."}
