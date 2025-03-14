from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database.session import Base

class AchievementCategory(str, enum.Enum):
    """
    Enum for categories of achievements in the game.
    
    Each category represents a different area of SQL expertise:
    - QUERY_MASTERY: Writing efficient and correct SQL queries
    - OPTIMIZATION: Query performance tuning skills
    - INDEXING: Proper use of database indexes
    - SECURITY: SQL security best practices
    - DESIGN: Database design principles
    """
    QUERY_MASTERY = "query_mastery"
    OPTIMIZATION = "optimization"
    INDEXING = "indexing"
    SECURITY = "security"
    DESIGN = "design"
    GENERAL = "general"  # For general gameplay achievements

class Achievement(Base):
    """
    Achievement model representing unlockable achievements in the game.
    
    Defines the requirements and rewards for each achievement
    that players can earn through gameplay.
    """
    __tablename__ = "achievements"
    
    # Primary key and identification
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)  # Unique code for the achievement
    
    # Achievement details
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(AchievementCategory), nullable=False)
    
    # Requirements and rewards
    requirement_description = Column(Text, nullable=False)
    xp_reward = Column(Integer, default=0)
    badge_image_url = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user_achievements = relationship("UserAchievement", back_populates="achievement")
    
    def __repr__(self):
        """String representation of the Achievement object."""
        return f"<Achievement {self.title} ({self.code})>"

class UserAchievement(Base):
    """
    UserAchievement model tracking which achievements a user has earned.
    
    Records when each achievement was earned by a specific user.
    """
    __tablename__ = "user_achievements"
    
    # Composite primary key
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    
    # Achievement data
    earned_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")
    
    def __repr__(self):
        """String representation of the UserAchievement object."""
        return f"<UserAchievement User:{self.user_id} Achievement:{self.achievement_id}>"

class SkillTree(Base):
    """
    SkillTree model representing the skills that players can unlock and level up.
    
    Defines the skill tree structure and requirements for progression.
    """
    __tablename__ = "skill_tree"
    
    # Primary key and identification
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)  # Unique code for the skill
    
    # Skill details
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)  # e.g., "Query", "Performance", "Design"
    
    # Skill tree structure
    level = Column(Integer, default=1)  # Skill level (1-5 typically)
    parent_skill_id = Column(Integer, ForeignKey("skill_tree.id"), nullable=True)  # For prerequisite skills
    xp_required = Column(Integer, default=100)  # XP needed to unlock this skill
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Self-referential relationship for skill tree hierarchy
    prerequisites = relationship("SkillTree", 
                               backref="dependents",
                               remote_side=[id])
    
    def __repr__(self):
        """String representation of the SkillTree object."""
        return f"<Skill {self.name} (Level: {self.level})>"

class UserSkill(Base):
    """
    UserSkill model tracking a user's progress in the skill tree.
    
    Records which skills a user has unlocked and their progress
    toward unlocking higher levels of each skill.
    """
    __tablename__ = "user_skills"
    
    # Composite primary key
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skill_tree.id"), nullable=False)
    
    # Skill progress data
    current_level = Column(Integer, default=0)  # 0 means not unlocked yet
    current_xp = Column(Integer, default=0)  # Progress toward next level
    is_unlocked = Column(Boolean, default=False)
    
    # Timestamps
    unlocked_at = Column(DateTime(timezone=True), nullable=True)
    last_updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        """String representation of the UserSkill object."""
        return f"<UserSkill User:{self.user_id} Skill:{self.skill_id} Level:{self.current_level}>"
