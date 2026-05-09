from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.models.user import User
from backend.schemas.user import UserCreate, UserLogin, UserResponse
from backend.utils.security import hash_password, verify_password, create_access_token
from backend.utils.dependencies import get_db, get_current_user

router = APIRouter()

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
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
