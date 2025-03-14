from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.leaderboard import LeaderboardType

class LeaderboardEntryBase(BaseModel):
    """
    Base schema for leaderboard entry data with common fields.
    
    Contains the core information about a player's position on a leaderboard.
    """
    leaderboard_type: LeaderboardType
    score: int = Field(..., ge=0)
    
class LeaderboardEntryCreate(LeaderboardEntryBase):
    """
    Schema for creating a new leaderboard entry.
    
    Used internally by the system to add or update leaderboard entries.
    """
    user_id: int
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None

class LeaderboardEntryUpdate(BaseModel):
    """
    Schema for updating an existing leaderboard entry.
    
    All fields are optional since this is used for partial updates.
    """
    score: Optional[int] = Field(None, ge=0)
    rank: Optional[int] = Field(None, ge=1)

class LeaderboardEntryInResponse(LeaderboardEntryBase):
    """
    Schema for leaderboard entry data in responses.
    
    Contains the entry information along with user details for display.
    """
    id: int
    user_id: int
    username: str  # Joined from User model
    display_name: Optional[str] = None  # Joined from User model
    avatar_type: str  # Joined from User model
    rank: Optional[int] = None
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    
    class Config:
        """
        Configuration for the Pydantic model.
        """
        orm_mode = True

class LeaderboardResponse(BaseModel):
    """
    Schema for a complete leaderboard response.
    
    Contains a list of entries along with metadata about the leaderboard.
    """
    leaderboard_type: LeaderboardType
    entries: List[LeaderboardEntryInResponse]
    total_entries: int
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    current_user_rank: Optional[int] = None
    current_user_score: Optional[int] = None

class UserRankingResponse(BaseModel):
    """
    Schema for a user's ranking across different leaderboards.
    
    Provides a summary of the user's position on all leaderboards.
    """
    global_rank: Optional[int] = None
    global_score: Optional[int] = None
    daily_rank: Optional[int] = None
    daily_score: Optional[int] = None
    weekly_rank: Optional[int] = None
    weekly_score: Optional[int] = None
    monthly_rank: Optional[int] = None
    monthly_score: Optional[int] = None
    total_players: int
