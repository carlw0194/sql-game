from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database.session import get_db
from app.core.auth import (
    authenticate_user, create_access_token, 
    ACCESS_TOKEN_EXPIRE_MINUTES, get_current_active_user
)
from app.models.user import User
from app.schemas.user import Token, UserCreate, UserProfile
from app.services.user_service import create_new_user, get_user_by_username

router = APIRouter()

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login endpoint.
    
    This endpoint authenticates a user and returns a JWT token
    that can be used to access protected endpoints.
    
    Args:
        form_data: OAuth2 form with username and password
        db: Database session
        
    Returns:
        JWT access token
        
    Raises:
        HTTPException: If authentication fails
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token with user information
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user.
    
    This endpoint creates a new user account with the provided
    information and returns the user profile.
    
    Args:
        user_data: User registration data
        db: Database session
        
    Returns:
        Created user profile
        
    Raises:
        HTTPException: If a user with the same username or email already exists
    """
    # Check if username already exists
    db_user = get_user_by_username(db, username=user_data.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create new user
    return create_new_user(db=db, user=user_data)

@router.get("/me", response_model=UserProfile)
async def read_users_me(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user profile.
    
    This endpoint returns the profile of the currently authenticated user.
    
    Args:
        current_user: Current authenticated user from dependency
        
    Returns:
        User profile
    """
    return current_user
