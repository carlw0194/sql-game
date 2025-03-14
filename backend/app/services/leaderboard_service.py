from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

from app.models.leaderboard import LeaderboardEntry, LeaderboardType
from app.models.user import User
from app.schemas.leaderboard import LeaderboardEntryCreate, LeaderboardEntryUpdate

def get_leaderboard_entry(
    db: Session, 
    entry_id: int
) -> Optional[LeaderboardEntry]:
    """
    Get a leaderboard entry by ID.
    
    Args:
        db: Database session
        entry_id: Leaderboard entry ID to look up
        
    Returns:
        LeaderboardEntry object if found, None otherwise
    """
    return db.query(LeaderboardEntry).filter(LeaderboardEntry.id == entry_id).first()

def get_user_leaderboard_entry(
    db: Session,
    user_id: int,
    leaderboard_type: LeaderboardType,
    period_start: Optional[datetime] = None,
    period_end: Optional[datetime] = None
) -> Optional[LeaderboardEntry]:
    """
    Get a user's entry on a specific leaderboard.
    
    Args:
        db: Database session
        user_id: User ID
        leaderboard_type: Type of leaderboard
        period_start: Start of the time period (for time-based leaderboards)
        period_end: End of the time period (for time-based leaderboards)
        
    Returns:
        LeaderboardEntry object if found, None otherwise
    """
    query = db.query(LeaderboardEntry).filter(
        LeaderboardEntry.user_id == user_id,
        LeaderboardEntry.leaderboard_type == leaderboard_type
    )
    
    # Apply time period filters if provided
    if period_start:
        query = query.filter(LeaderboardEntry.period_start == period_start)
    else:
        query = query.filter(LeaderboardEntry.period_start.is_(None))
        
    if period_end:
        query = query.filter(LeaderboardEntry.period_end == period_end)
    else:
        query = query.filter(LeaderboardEntry.period_end.is_(None))
    
    return query.first()

def get_leaderboard(
    db: Session,
    leaderboard_type: LeaderboardType,
    period_start: Optional[datetime] = None,
    period_end: Optional[datetime] = None,
    limit: int = 100
) -> List[Dict[str, Any]]:
    """
    Get a leaderboard with user details.
    
    This function retrieves a leaderboard with the specified type and time period,
    joining with the User table to include user details in the results.
    
    Args:
        db: Database session
        leaderboard_type: Type of leaderboard
        period_start: Start of the time period (for time-based leaderboards)
        period_end: End of the time period (for time-based leaderboards)
        limit: Maximum number of entries to return
        
    Returns:
        List of dictionaries containing leaderboard entries with user details
    """
    # Build the query
    query = db.query(
        LeaderboardEntry,
        User.username,
        User.display_name,
        User.avatar_type
    ).join(
        User, LeaderboardEntry.user_id == User.id
    ).filter(
        LeaderboardEntry.leaderboard_type == leaderboard_type,
        User.is_active == True
    )
    
    # Apply time period filters if provided
    if period_start:
        query = query.filter(LeaderboardEntry.period_start == period_start)
    else:
        query = query.filter(LeaderboardEntry.period_start.is_(None))
        
    if period_end:
        query = query.filter(LeaderboardEntry.period_end == period_end)
    else:
        query = query.filter(LeaderboardEntry.period_end.is_(None))
    
    # Order by rank or score
    query = query.order_by(
        LeaderboardEntry.rank.asc().nullsfirst(),
        LeaderboardEntry.score.desc()
    )
    
    # Apply limit
    query = query.limit(limit)
    
    # Execute the query
    results = query.all()
    
    # Convert to list of dictionaries
    leaderboard_entries = []
    for entry, username, display_name, avatar_type in results:
        leaderboard_entries.append({
            "id": entry.id,
            "user_id": entry.user_id,
            "username": username,
            "display_name": display_name,
            "avatar_type": avatar_type,
            "leaderboard_type": entry.leaderboard_type,
            "score": entry.score,
            "rank": entry.rank,
            "period_start": entry.period_start,
            "period_end": entry.period_end
        })
    
    return leaderboard_entries

def get_user_ranking(
    db: Session,
    user_id: int
) -> Dict[str, Any]:
    """
    Get a user's ranking across all leaderboards.
    
    This function retrieves a user's position on all leaderboards,
    including global, daily, weekly, and monthly.
    
    Args:
        db: Database session
        user_id: User ID
        
    Returns:
        Dictionary containing the user's ranking information
    """
    # Get the user's entries on each leaderboard
    global_entry = get_user_leaderboard_entry(db, user_id, LeaderboardType.GLOBAL)
    
    # Get current time periods
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    today_end = today_start + timedelta(days=1)
    
    week_start = today_start - timedelta(days=now.weekday())
    week_end = week_start + timedelta(days=7)
    
    month_start = datetime(now.year, now.month, 1)
    if now.month == 12:
        month_end = datetime(now.year + 1, 1, 1)
    else:
        month_end = datetime(now.year, now.month + 1, 1)
    
    # Get time-based entries
    daily_entry = get_user_leaderboard_entry(
        db, user_id, LeaderboardType.DAILY, today_start, today_end
    )
    weekly_entry = get_user_leaderboard_entry(
        db, user_id, LeaderboardType.WEEKLY, week_start, week_end
    )
    monthly_entry = get_user_leaderboard_entry(
        db, user_id, LeaderboardType.MONTHLY, month_start, month_end
    )
    
    # Count total players
    total_players = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    
    # Build the response
    return {
        "global_rank": global_entry.rank if global_entry else None,
        "global_score": global_entry.score if global_entry else None,
        "daily_rank": daily_entry.rank if daily_entry else None,
        "daily_score": daily_entry.score if daily_entry else None,
        "weekly_rank": weekly_entry.rank if weekly_entry else None,
        "weekly_score": weekly_entry.score if weekly_entry else None,
        "monthly_rank": monthly_entry.rank if monthly_entry else None,
        "monthly_score": monthly_entry.score if monthly_entry else None,
        "total_players": total_players
    }

def create_or_update_leaderboard_entry(
    db: Session,
    entry_data: LeaderboardEntryCreate
) -> LeaderboardEntry:
    """
    Create or update a leaderboard entry.
    
    This function checks if an entry already exists for the user on the
    specified leaderboard and time period. If it does, it updates the score;
    otherwise, it creates a new entry.
    
    Args:
        db: Database session
        entry_data: Leaderboard entry creation data
        
    Returns:
        Created or updated LeaderboardEntry object
    """
    # Check if entry already exists
    existing_entry = get_user_leaderboard_entry(
        db,
        entry_data.user_id,
        entry_data.leaderboard_type,
        entry_data.period_start,
        entry_data.period_end
    )
    
    if existing_entry:
        # Update existing entry
        existing_entry.score = entry_data.score
        existing_entry.updated_at = func.now()
        db.commit()
        db.refresh(existing_entry)
        return existing_entry
    else:
        # Create new entry
        db_entry = LeaderboardEntry(
            user_id=entry_data.user_id,
            leaderboard_type=entry_data.leaderboard_type,
            score=entry_data.score,
            period_start=entry_data.period_start,
            period_end=entry_data.period_end
        )
        db.add(db_entry)
        db.commit()
        db.refresh(db_entry)
        return db_entry

def update_leaderboard_ranks(
    db: Session,
    leaderboard_type: LeaderboardType,
    period_start: Optional[datetime] = None,
    period_end: Optional[datetime] = None
) -> int:
    """
    Update the ranks for all entries on a leaderboard.
    
    This function recalculates the ranks for all entries on a leaderboard
    based on their scores, assigning rank 1 to the highest score.
    
    Args:
        db: Database session
        leaderboard_type: Type of leaderboard
        period_start: Start of the time period (for time-based leaderboards)
        period_end: End of the time period (for time-based leaderboards)
        
    Returns:
        Number of entries updated
    """
    # Build the query to get entries ordered by score
    query = db.query(LeaderboardEntry).filter(
        LeaderboardEntry.leaderboard_type == leaderboard_type
    )
    
    # Apply time period filters if provided
    if period_start:
        query = query.filter(LeaderboardEntry.period_start == period_start)
    else:
        query = query.filter(LeaderboardEntry.period_start.is_(None))
        
    if period_end:
        query = query.filter(LeaderboardEntry.period_end == period_end)
    else:
        query = query.filter(LeaderboardEntry.period_end.is_(None))
    
    # Order by score descending
    query = query.order_by(LeaderboardEntry.score.desc())
    
    # Get all entries
    entries = query.all()
    
    # Update ranks
    current_rank = 1
    current_score = None
    updates = 0
    
    for entry in entries:
        # If this is a new score, increment the rank
        if current_score is not None and entry.score < current_score:
            current_rank += 1
        
        # Update the rank if it has changed
        if entry.rank != current_rank:
            entry.rank = current_rank
            updates += 1
        
        # Remember this score for the next iteration
        current_score = entry.score
    
    # Commit changes if any were made
    if updates > 0:
        db.commit()
    
    return updates

def update_user_score(
    db: Session,
    user_id: int,
    score_delta: int,
    leaderboard_type: LeaderboardType = LeaderboardType.GLOBAL,
    period_start: Optional[datetime] = None,
    period_end: Optional[datetime] = None
) -> LeaderboardEntry:
    """
    Update a user's score on a leaderboard.
    
    This function adds the specified score delta to a user's score on the
    specified leaderboard. If the user doesn't have an entry yet, it creates one.
    
    Args:
        db: Database session
        user_id: User ID
        score_delta: Amount to add to the user's score (can be negative)
        leaderboard_type: Type of leaderboard
        period_start: Start of the time period (for time-based leaderboards)
        period_end: End of the time period (for time-based leaderboards)
        
    Returns:
        Updated LeaderboardEntry object
    """
    # Get existing entry if any
    entry = get_user_leaderboard_entry(
        db, user_id, leaderboard_type, period_start, period_end
    )
    
    if entry:
        # Update existing entry
        entry.score += score_delta
        entry.updated_at = func.now()
        db.commit()
        db.refresh(entry)
        return entry
    else:
        # Create new entry
        return create_or_update_leaderboard_entry(
            db,
            LeaderboardEntryCreate(
                user_id=user_id,
                leaderboard_type=leaderboard_type,
                score=score_delta,
                period_start=period_start,
                period_end=period_end
            )
        )
