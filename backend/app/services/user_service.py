from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app.models.user import User, UserRole, AvatarType
from app.schemas.user import UserCreate, UserUpdate
from app.core.auth import get_password_hash

def get_user(db: Session, user_id: int) -> Optional[User]:
    """
    Get a user by ID.
    
    Args:
        db: Database session
        user_id: User ID to look up
        
    Returns:
        User object if found, None otherwise
    """
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Get a user by email.
    
    Args:
        db: Database session
        email: Email to look up
        
    Returns:
        User object if found, None otherwise
    """
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """
    Get a user by username.
    
    Args:
        db: Database session
        username: Username to look up
        
    Returns:
        User object if found, None otherwise
    """
    return db.query(User).filter(User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """
    Get a list of users with pagination.
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of User objects
    """
    return db.query(User).offset(skip).limit(limit).all()

def create_new_user(db: Session, user: UserCreate) -> User:
    """
    Create a new user.
    
    Args:
        db: Database session
        user: User creation data
        
    Returns:
        Created User object
    """
    # Create a new user instance
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=get_password_hash(user.password),
        display_name=user.display_name or user.username,
        avatar_type=user.avatar_type,
        # Set default values for a new player
        is_active=True,
        role=UserRole.PLAYER,
        xp_points=0,
        level=1,
        rank_title="Junior DBA"
    )
    
    # Add to database and commit
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
    """
    Update a user's profile information.
    
    Args:
        db: Database session
        user_id: ID of the user to update
        user_update: User update data
        
    Returns:
        Updated User object if found, None otherwise
    """
    # Get the user
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    # Update user data
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    # Update timestamp
    db_user.updated_at = datetime.utcnow()
    
    # Commit changes
    db.commit()
    db.refresh(db_user)
    
    return db_user

def update_user_xp(db: Session, user_id: int, xp_gained: int) -> Optional[User]:
    """
    Update a user's XP and level.
    
    This function adds XP to a user's account and updates their level
    and rank title based on the new XP total.
    
    Args:
        db: Database session
        user_id: ID of the user to update
        xp_gained: Amount of XP to add
        
    Returns:
        Updated User object if found, None otherwise
    """
    # Get the user
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    # Add XP
    db_user.xp_points += xp_gained
    
    # Update level based on XP
    # Simple level formula: level = 1 + floor(xp / 1000)
    new_level = 1 + (db_user.xp_points // 1000)
    
    # Check if level has increased
    if new_level > db_user.level:
        db_user.level = new_level
        
        # Update rank title based on level
        if new_level >= 20:
            db_user.rank_title = "Database Architect"
        elif new_level >= 15:
            db_user.rank_title = "Principal DBA"
        elif new_level >= 10:
            db_user.rank_title = "Senior DBA"
        elif new_level >= 5:
            db_user.rank_title = "DBA"
        else:
            db_user.rank_title = "Junior DBA"
    
    # Commit changes
    db.commit()
    db.refresh(db_user)
    
    return db_user

def deactivate_user(db: Session, user_id: int) -> Optional[User]:
    """
    Deactivate a user account.
    
    Args:
        db: Database session
        user_id: ID of the user to deactivate
        
    Returns:
        Updated User object if found, None otherwise
    """
    # Get the user
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    # Deactivate the user
    db_user.is_active = False
    db_user.updated_at = datetime.utcnow()
    
    # Commit changes
    db.commit()
    db.refresh(db_user)
    
    return db_user
