from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from app.models.user import UserRole, AvatarType

class UserBase(BaseModel):
    """
    Base schema for user data with common fields.
    """
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    
class UserCreate(UserBase):
    """
    Schema for creating a new user, includes password.
    """
    password: str = Field(..., min_length=8)
    display_name: Optional[str] = None
    avatar_type: AvatarType = AvatarType.DBA
    
    @validator('password')
    def password_strength(cls, v):
        """
        Validate password strength.
        
        Ensures the password meets minimum security requirements:
        - At least 8 characters
        - Contains at least one digit
        - Contains at least one uppercase letter
        """
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        return v

class UserLogin(BaseModel):
    """
    Schema for user login credentials.
    """
    username: str
    password: str

class UserUpdate(BaseModel):
    """
    Schema for updating user profile information.
    """
    display_name: Optional[str] = None
    avatar_type: Optional[AvatarType] = None
    avatar_customization: Optional[str] = None
    
class UserProfile(UserBase):
    """
    Schema for user profile data returned by the API.
    """
    id: int
    uuid: str
    display_name: Optional[str] = None
    avatar_type: AvatarType
    avatar_customization: Optional[str] = None
    xp_points: int
    level: int
    rank_title: str
    created_at: datetime
    
    class Config:
        """
        Configuration for the Pydantic model.
        """
        orm_mode = True  # Allows the model to read data from ORM objects

class UserStats(BaseModel):
    """
    Schema for user game statistics.
    """
    total_challenges_completed: int
    total_achievements_earned: int
    average_score: float
    highest_score: int
    fastest_solution_ms: Optional[float] = None
    total_xp: int
    current_level: int
    rank_title: str
    
    class Config:
        """
        Configuration for the Pydantic model.
        """
        orm_mode = True

class Token(BaseModel):
    """
    Schema for authentication token.
    """
    access_token: str
    token_type: str
    
class TokenData(BaseModel):
    """
    Schema for decoded token data.
    """
    username: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[UserRole] = None
