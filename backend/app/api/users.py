from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserProfile, UserUpdate, UserStats
from app.schemas.progress import UserProgressSummary, UserAchievementInResponse, UserSkillInResponse
from app.core.auth import get_current_active_user, get_admin_user
from app.services.user_service import get_user, get_users, update_user, deactivate_user

router = APIRouter()

@router.get("/", response_model=List[UserProfile])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)  # Only admins can list all users
):
    """
    Get a list of all users (admin only).
    
    This endpoint returns a paginated list of all user profiles.
    Only accessible to administrators.
    
    Args:
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return
        db: Database session
        current_user: Current authenticated admin user
        
    Returns:
        List of user profiles
    """
    users = get_users(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=UserProfile)
async def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a user profile by ID.
    
    This endpoint returns a user profile by ID. Users can only
    access their own profile unless they are administrators.
    
    Args:
        user_id: ID of the user to get
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        User profile
        
    Raises:
        HTTPException: If the user doesn't exist or the current user
                      doesn't have permission to access it
    """
    # Check if the user is requesting their own profile or is an admin
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this profile"
        )
    
    db_user = get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return db_user

@router.put("/me", response_model=UserProfile)
async def update_user_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update current user's profile.
    
    This endpoint allows users to update their own profile information.
    
    Args:
        user_update: User update data
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Updated user profile
    """
    updated_user = update_user(db, current_user.id, user_update)
    return updated_user

@router.get("/me/stats", response_model=UserStats)
async def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user's game statistics.
    
    This endpoint returns detailed statistics about the user's
    performance and progress in the game.
    
    Args:
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        User statistics
    """
    # Calculate user statistics from the database
    # This would typically involve querying various tables to aggregate data
    
    # For now, we'll return a placeholder with basic info
    return {
        "total_challenges_completed": 0,  # Will be calculated from UserProgress
        "total_achievements_earned": 0,   # Will be calculated from UserAchievement
        "average_score": 0.0,             # Will be calculated from UserProgress
        "highest_score": 0,               # Will be calculated from UserProgress
        "fastest_solution_ms": None,      # Will be calculated from UserProgress
        "total_xp": current_user.xp_points,
        "current_level": current_user.level,
        "rank_title": current_user.rank_title
    }

@router.get("/me/progress", response_model=UserProgressSummary)
async def get_user_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user's progress summary.
    
    This endpoint returns a summary of the user's overall progress
    in the game, including challenges, achievements, and skills.
    
    Args:
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        User progress summary
    """
    # Calculate user progress from the database
    # This would typically involve querying various tables to aggregate data
    
    # For now, we'll return a placeholder with basic info
    return {
        "total_xp": current_user.xp_points,
        "current_level": current_user.level,
        "rank_title": current_user.rank_title,
        "challenges_completed": 0,  # Will be calculated from UserProgress
        "achievements_earned": 0,   # Will be calculated from UserAchievement
        "skills_unlocked": 0,       # Will be calculated from UserSkill
        "highest_skill_level": 0,   # Will be calculated from UserSkill
        "global_rank": None         # Will be calculated from LeaderboardEntry
    }

@router.get("/me/achievements", response_model=List[UserAchievementInResponse])
async def get_user_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user's achievements.
    
    This endpoint returns a list of all achievements earned by the user.
    
    Args:
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of user achievements
    """
    # Query user achievements from the database
    # For now, we'll return an empty list
    return []

@router.get("/me/skills", response_model=List[UserSkillInResponse])
async def get_user_skills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user's skills.
    
    This endpoint returns a list of all skills unlocked by the user
    and their current progress in each skill.
    
    Args:
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of user skills
    """
    # Query user skills from the database
    # For now, we'll return an empty list
    return []

@router.delete("/{user_id}", response_model=UserProfile, status_code=status.HTTP_200_OK)
async def deactivate_user_account(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Deactivate a user account.
    
    This endpoint deactivates a user account. Users can only
    deactivate their own account unless they are administrators.
    
    Args:
        user_id: ID of the user to deactivate
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Deactivated user profile
        
    Raises:
        HTTPException: If the user doesn't exist or the current user
                      doesn't have permission to deactivate it
    """
    # Check if the user is deactivating their own account or is an admin
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to deactivate this account"
        )
    
    db_user = deactivate_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return db_user
