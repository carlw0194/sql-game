from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database.session import Base

class LeaderboardType(str, enum.Enum):
    """
    Enum for different types of leaderboards in the game.
    
    GLOBAL: Overall ranking across all players
    DAILY: Daily challenge rankings
    WEEKLY: Weekly challenge rankings
    MONTHLY: Monthly challenge rankings
    """
    GLOBAL = "global"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class LeaderboardEntry(Base):
    """
    LeaderboardEntry model representing a player's position on a leaderboard.
    
    Tracks scores and rankings for different leaderboard types,
    allowing players to compare their performance with others.
    """
    __tablename__ = "leaderboard_entries"
    
    # Primary key and identification
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Leaderboard data
    leaderboard_type = Column(Enum(LeaderboardType), nullable=False)
    score = Column(Integer, default=0)
    rank = Column(Integer, nullable=True)  # Calculated and updated periodically
    
    # Time period (for non-global leaderboards)
    period_start = Column(DateTime(timezone=True), nullable=True)
    period_end = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="leaderboard_entries")
    
    # Ensure each user has only one entry per leaderboard type per time period
    __table_args__ = (
        UniqueConstraint('user_id', 'leaderboard_type', 'period_start', 'period_end', 
                        name='unique_leaderboard_entry'),
    )
    
    def __repr__(self):
        """String representation of the LeaderboardEntry object."""
        return f"<LeaderboardEntry User:{self.user_id} Type:{self.leaderboard_type} Score:{self.score}>"
