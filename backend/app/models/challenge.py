from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database.session import Base

class DifficultyLevel(str, enum.Enum):
    """
    Enum for challenge difficulty levels.
    
    Represents the increasing difficulty tiers in the game,
    from beginner to expert level challenges.
    """
    BEGINNER = "beginner"       # Levels 1-100
    INTERMEDIATE = "intermediate"  # Levels 101-300
    ADVANCED = "advanced"       # Levels 301-500
    EXPERT = "expert"           # Levels 500+

class ChallengeType(str, enum.Enum):
    """
    Enum for different types of SQL challenges.
    
    Each type focuses on different SQL skills and concepts:
    - QUERY_WRITING: Writing correct SQL queries
    - OPTIMIZATION: Improving query performance
    - BEST_PRACTICES: Fixing schema design, security issues, etc.
    """
    QUERY_WRITING = "query_writing"
    OPTIMIZATION = "optimization"
    BEST_PRACTICES = "best_practices"
    BOSS_FIGHT = "boss_fight"  # Multi-step complex challenges

class Challenge(Base):
    """
    Challenge model representing SQL challenges in the game.
    
    Stores all information about a challenge including its description,
    difficulty, expected solution, and test data.
    """
    __tablename__ = "challenges"
    
    # Primary key and identification
    id = Column(Integer, primary_key=True, index=True)
    level_number = Column(Integer, unique=True, index=True)
    
    # Challenge metadata
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(Enum(DifficultyLevel), nullable=False)
    challenge_type = Column(Enum(ChallengeType), nullable=False)
    
    # SQL-specific data
    initial_code = Column(Text, nullable=True)  # Starting code provided to the player
    expected_solution = Column(Text, nullable=False)  # One possible correct solution
    schema_definition = Column(Text, nullable=False)  # Database schema for this challenge
    test_data = Column(Text, nullable=False)  # JSON string of test data
    
    # Challenge parameters
    time_limit_seconds = Column(Integer, nullable=True)  # For timed challenges
    max_attempts = Column(Integer, nullable=True)  # Limit attempts if specified
    xp_reward = Column(Integer, default=100)  # XP points awarded for completion
    performance_threshold_ms = Column(Integer, nullable=True)  # For optimization challenges
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user_progress = relationship("UserProgress", back_populates="challenge")
    
    def __repr__(self):
        """String representation of the Challenge object."""
        return f"<Challenge {self.title} (Level: {self.level_number})>"


class UserProgress(Base):
    """
    UserProgress model tracking a user's progress on specific challenges.
    
    Records attempts, completion status, and performance metrics
    for each challenge a user has attempted.
    """
    __tablename__ = "user_progress"
    
    # Composite primary key
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    challenge_id = Column(Integer, ForeignKey("challenges.id"), nullable=False)
    
    # Progress data
    is_completed = Column(Boolean, default=False)
    attempts_count = Column(Integer, default=0)
    best_execution_time_ms = Column(Float, nullable=True)
    last_submitted_solution = Column(Text, nullable=True)
    hints_used = Column(Integer, default=0)
    
    # Scoring
    score = Column(Integer, default=0)  # Points earned for this challenge
    stars = Column(Integer, default=0)  # 1-3 stars rating based on performance
    
    # Timestamps
    first_attempted_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    last_attempted_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="progress")
    challenge = relationship("Challenge", back_populates="user_progress")
    
    def __repr__(self):
        """String representation of the UserProgress object."""
        return f"<UserProgress User:{self.user_id} Challenge:{self.challenge_id} Completed:{self.is_completed}>"
