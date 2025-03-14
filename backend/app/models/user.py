from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database.session import Base
import uuid

class UserRole(str, enum.Enum):
    """
    Enum for user roles in the system.
    
    PLAYER: Regular player of the game
    ADMIN: Administrator with special privileges
    """
    PLAYER = "player"
    ADMIN = "admin"

class AvatarType(str, enum.Enum):
    """
    Enum for avatar types that players can choose.
    
    These represent different database professional roles
    that align with the game's theme.
    """
    DBA = "dba"
    DEVELOPER = "developer"
    DATA_ANALYST = "data_analyst"
    DATA_SCIENTIST = "data_scientist"
    DATA_ENGINEER = "data_engineer"

class User(Base):
    """
    User model representing players in the SQL Scenario game.
    
    Stores user authentication information, profile details,
    and tracks their progress and achievements in the game.
    """
    __tablename__ = "users"
    
    # Primary key and identification
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, unique=True, index=True, default=lambda: str(uuid.uuid4()))
    
    # Authentication fields
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    # User status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    role = Column(Enum(UserRole), default=UserRole.PLAYER)
    
    # Profile information
    display_name = Column(String, nullable=True)
    avatar_type = Column(Enum(AvatarType), default=AvatarType.DBA)
    avatar_customization = Column(String, nullable=True)  # JSON string of customization options
    
    # Game progress
    xp_points = Column(Integer, default=0)
    level = Column(Integer, default=1)
    rank_title = Column(String, default="Junior DBA")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    progress = relationship("UserProgress", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")
    leaderboard_entries = relationship("LeaderboardEntry", back_populates="user", cascade="all, delete-orphan")
    
    # Payment and subscription relationships
    payment_methods = relationship("PaymentMethod", back_populates="user", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        """String representation of the User object."""
        return f"<User {self.username} (ID: {self.id})>"
