from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.progress import AchievementCategory

class AchievementBase(BaseModel):
    """
    Base schema for achievement data with common fields.
    
    Contains the core information about an achievement including
    its title, description, and category.
    """
    title: str = Field(..., min_length=3, max_length=100)
    description: str
    category: AchievementCategory
    requirement_description: str
    xp_reward: int = Field(..., ge=0)
    
class AchievementCreate(AchievementBase):
    """
    Schema for creating a new achievement.
    
    Includes all necessary fields to define a complete achievement.
    """
    code: str = Field(..., min_length=3, max_length=50)
    badge_image_url: Optional[str] = None

class AchievementUpdate(BaseModel):
    """
    Schema for updating an existing achievement.
    
    All fields are optional since this is used for partial updates.
    """
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[AchievementCategory] = None
    requirement_description: Optional[str] = None
    xp_reward: Optional[int] = Field(None, ge=0)
    badge_image_url: Optional[str] = None

class AchievementInResponse(AchievementBase):
    """
    Schema for achievement data in responses.
    
    Contains the achievement information for display in the UI.
    """
    id: int
    code: str
    badge_image_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        """
        Configuration for the Pydantic model.
        """
        orm_mode = True

class UserAchievementInResponse(BaseModel):
    """
    Schema for user achievement data in responses.
    
    Contains information about an achievement earned by a user.
    """
    achievement: AchievementInResponse
    earned_at: datetime
    
    class Config:
        """
        Configuration for the Pydantic model.
        """
        orm_mode = True

class SkillTreeBase(BaseModel):
    """
    Base schema for skill tree data with common fields.
    
    Contains the core information about a skill in the skill tree.
    """
    name: str = Field(..., min_length=3, max_length=50)
    description: str
    category: str
    level: int = Field(..., ge=1, le=5)
    xp_required: int = Field(..., ge=0)
    
class SkillTreeCreate(SkillTreeBase):
    """
    Schema for creating a new skill in the skill tree.
    
    Includes all necessary fields to define a complete skill.
    """
    code: str = Field(..., min_length=3, max_length=50)
    parent_skill_id: Optional[int] = None

class SkillTreeUpdate(BaseModel):
    """
    Schema for updating an existing skill in the skill tree.
    
    All fields are optional since this is used for partial updates.
    """
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    level: Optional[int] = Field(None, ge=1, le=5)
    xp_required: Optional[int] = Field(None, ge=0)
    parent_skill_id: Optional[int] = None

class SkillTreeInResponse(SkillTreeBase):
    """
    Schema for skill tree data in responses.
    
    Contains the skill information for display in the UI.
    """
    id: int
    code: str
    parent_skill_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        """
        Configuration for the Pydantic model.
        """
        orm_mode = True

class UserSkillInResponse(BaseModel):
    """
    Schema for user skill data in responses.
    
    Contains information about a user's progress in a skill.
    """
    skill: SkillTreeInResponse
    current_level: int
    current_xp: int
    is_unlocked: bool
    unlocked_at: Optional[datetime] = None
    last_updated_at: datetime
    
    class Config:
        """
        Configuration for the Pydantic model.
        """
        orm_mode = True

class UserProgressSummary(BaseModel):
    """
    Schema for a summary of a user's overall progress.
    
    Provides an overview of the user's achievements, skills, and game progress.
    """
    total_xp: int
    current_level: int
    rank_title: str
    challenges_completed: int
    achievements_earned: int
    skills_unlocked: int
    highest_skill_level: int
    global_rank: Optional[int] = None
