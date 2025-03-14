from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from app.database.session import get_db
from app.models.user import User
from app.models.leaderboard import LeaderboardType
from app.schemas.leaderboard import LeaderboardResponse, UserRankingResponse
from app.core.auth import get_current_active_user, get_admin_user
from app.services.leaderboard_service import (
    get_leaderboard, get_user_ranking, update_leaderboard_ranks
)

router = APIRouter()

@router.get("/global", response_model=LeaderboardResponse)
async def get_global_leaderboard(
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of entries to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the global leaderboard.
    
    This endpoint returns the global leaderboard, which ranks players
    based on their total score across all challenges.
    
    Args:
        limit: Maximum number of entries to return
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Leaderboard with entries and user's position
    """
    # Get the leaderboard entries
    entries = get_leaderboard(db, LeaderboardType.GLOBAL, limit=limit)
    
    # Get the user's ranking
    user_ranking = get_user_ranking(db, current_user.id)
    
    return {
        "leaderboard_type": LeaderboardType.GLOBAL,
        "entries": entries,
        "user_rank": user_ranking["global_rank"],
        "user_score": user_ranking["global_score"],
        "total_players": user_ranking["total_players"]
    }

@router.get("/daily", response_model=LeaderboardResponse)
async def get_daily_leaderboard(
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of entries to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the daily leaderboard.
    
    This endpoint returns the daily leaderboard, which ranks players
    based on their score earned today.
    
    Args:
        limit: Maximum number of entries to return
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Leaderboard with entries and user's position
    """
    # Calculate today's time period
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    today_end = today_start + timedelta(days=1)
    
    # Get the leaderboard entries
    entries = get_leaderboard(
        db, 
        LeaderboardType.DAILY, 
        period_start=today_start,
        period_end=today_end,
        limit=limit
    )
    
    # Get the user's ranking
    user_ranking = get_user_ranking(db, current_user.id)
    
    return {
        "leaderboard_type": LeaderboardType.DAILY,
        "entries": entries,
        "user_rank": user_ranking["daily_rank"],
        "user_score": user_ranking["daily_score"],
        "total_players": user_ranking["total_players"],
        "period_start": today_start,
        "period_end": today_end
    }

@router.get("/weekly", response_model=LeaderboardResponse)
async def get_weekly_leaderboard(
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of entries to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the weekly leaderboard.
    
    This endpoint returns the weekly leaderboard, which ranks players
    based on their score earned this week (starting from Monday).
    
    Args:
        limit: Maximum number of entries to return
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Leaderboard with entries and user's position
    """
    # Calculate this week's time period
    now = datetime.utcnow()
    today = datetime(now.year, now.month, now.day)
    week_start = today - timedelta(days=now.weekday())  # Monday
    week_end = week_start + timedelta(days=7)  # Next Monday
    
    # Get the leaderboard entries
    entries = get_leaderboard(
        db, 
        LeaderboardType.WEEKLY, 
        period_start=week_start,
        period_end=week_end,
        limit=limit
    )
    
    # Get the user's ranking
    user_ranking = get_user_ranking(db, current_user.id)
    
    return {
        "leaderboard_type": LeaderboardType.WEEKLY,
        "entries": entries,
        "user_rank": user_ranking["weekly_rank"],
        "user_score": user_ranking["weekly_score"],
        "total_players": user_ranking["total_players"],
        "period_start": week_start,
        "period_end": week_end
    }

@router.get("/monthly", response_model=LeaderboardResponse)
async def get_monthly_leaderboard(
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of entries to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the monthly leaderboard.
    
    This endpoint returns the monthly leaderboard, which ranks players
    based on their score earned this month.
    
    Args:
        limit: Maximum number of entries to return
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Leaderboard with entries and user's position
    """
    # Calculate this month's time period
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    
    # Calculate next month
    if now.month == 12:
        month_end = datetime(now.year + 1, 1, 1)
    else:
        month_end = datetime(now.year, now.month + 1, 1)
    
    # Get the leaderboard entries
    entries = get_leaderboard(
        db, 
        LeaderboardType.MONTHLY, 
        period_start=month_start,
        period_end=month_end,
        limit=limit
    )
    
    # Get the user's ranking
    user_ranking = get_user_ranking(db, current_user.id)
    
    return {
        "leaderboard_type": LeaderboardType.MONTHLY,
        "entries": entries,
        "user_rank": user_ranking["monthly_rank"],
        "user_score": user_ranking["monthly_score"],
        "total_players": user_ranking["total_players"],
        "period_start": month_start,
        "period_end": month_end
    }

@router.get("/user/ranking", response_model=UserRankingResponse)
async def get_current_user_ranking(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the current user's ranking across all leaderboards.
    
    This endpoint returns the user's position on all leaderboards,
    including global, daily, weekly, and monthly.
    
    Args:
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        User's ranking information
    """
    return get_user_ranking(db, current_user.id)

@router.post("/update-ranks", status_code=status.HTTP_200_OK)
async def update_ranks(
    leaderboard_type: LeaderboardType,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)  # Only admins can update ranks
):
    """
    Update the ranks for a leaderboard (admin only).
    
    This endpoint recalculates the ranks for all entries on a leaderboard
    based on their scores, assigning rank 1 to the highest score.
    
    Args:
        leaderboard_type: Type of leaderboard to update
        db: Database session
        current_user: Current authenticated admin user
        
    Returns:
        Number of entries updated
    """
    # Calculate time periods if needed
    period_start = None
    period_end = None
    
    if leaderboard_type != LeaderboardType.GLOBAL:
        now = datetime.utcnow()
        today = datetime(now.year, now.month, now.day)
        
        if leaderboard_type == LeaderboardType.DAILY:
            period_start = today
            period_end = today + timedelta(days=1)
        elif leaderboard_type == LeaderboardType.WEEKLY:
            period_start = today - timedelta(days=now.weekday())
            period_end = period_start + timedelta(days=7)
        elif leaderboard_type == LeaderboardType.MONTHLY:
            period_start = datetime(now.year, now.month, 1)
            if now.month == 12:
                period_end = datetime(now.year + 1, 1, 1)
            else:
                period_end = datetime(now.year, now.month + 1, 1)
    
    # Update the ranks
    updates = update_leaderboard_ranks(db, leaderboard_type, period_start, period_end)
    
    return {"message": f"Updated {updates} entries on the {leaderboard_type} leaderboard"}
