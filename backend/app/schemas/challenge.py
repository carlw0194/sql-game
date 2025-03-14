from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
import json
from app.models.challenge import DifficultyLevel, ChallengeType

class ChallengeBase(BaseModel):
    """
    Base schema for challenge data with common fields.
    
    Contains the core information about a SQL challenge including
    its title, description, and difficulty level.
    """
    title: str = Field(..., min_length=3, max_length=100)
    description: str
    difficulty: DifficultyLevel
    challenge_type: ChallengeType
    
class ChallengeCreate(ChallengeBase):
    """
    Schema for creating a new challenge.
    
    Includes all necessary fields to define a complete SQL challenge
    including the expected solution and test data.
    """
    level_number: int = Field(..., gt=0)
    initial_code: Optional[str] = None
    expected_solution: str
    schema_definition: str
    test_data: str  # JSON string of test data
    time_limit_seconds: Optional[int] = None
    max_attempts: Optional[int] = None
    xp_reward: int = 100
    performance_threshold_ms: Optional[int] = None
    
    @validator('test_data')
    def validate_test_data_json(cls, v):
        """
        Validate that test_data is a valid JSON string.
        
        Ensures the test data can be properly parsed by the system.
        """
        try:
            json.loads(v)
            return v
        except json.JSONDecodeError:
            raise ValueError('test_data must be a valid JSON string')

class ChallengeUpdate(BaseModel):
    """
    Schema for updating an existing challenge.
    
    All fields are optional since this is used for partial updates.
    """
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = None
    challenge_type: Optional[ChallengeType] = None
    initial_code: Optional[str] = None
    expected_solution: Optional[str] = None
    schema_definition: Optional[str] = None
    test_data: Optional[str] = None
    time_limit_seconds: Optional[int] = None
    max_attempts: Optional[int] = None
    xp_reward: Optional[int] = None
    performance_threshold_ms: Optional[int] = None
    
    @validator('test_data')
    def validate_test_data_json(cls, v):
        """
        Validate that test_data is a valid JSON string if provided.
        """
        if v is not None:
            try:
                json.loads(v)
                return v
            except json.JSONDecodeError:
                raise ValueError('test_data must be a valid JSON string')
        return v

class ChallengeInList(ChallengeBase):
    """
    Schema for challenge data in list responses.
    
    Contains a summary of challenge information for displaying
    in lists or challenge selection screens.
    """
    id: int
    level_number: int
    xp_reward: int
    time_limit_seconds: Optional[int] = None
    
    class Config:
        """
        Configuration for the Pydantic model.
        """
        orm_mode = True

class ChallengeDetail(ChallengeInList):
    """
    Schema for detailed challenge data.
    
    Contains all challenge information including the initial code
    and schema definition needed to attempt the challenge.
    """
    initial_code: Optional[str] = None
    schema_definition: str
    max_attempts: Optional[int] = None
    performance_threshold_ms: Optional[int] = None
    created_at: datetime
    
    class Config:
        """
        Configuration for the Pydantic model.
        """
        orm_mode = True

class SQLSubmission(BaseModel):
    """
    Schema for submitting a SQL solution to a challenge.
    
    Contains the user's SQL code and execution metrics.
    """
    challenge_id: int
    sql_code: str
    execution_time_ms: Optional[float] = None
    hints_used: Optional[int] = 0

class SQLSubmissionResult(BaseModel):
    """
    Schema for the result of a SQL submission.
    
    Contains the evaluation results including correctness,
    performance metrics, and feedback.
    """
    is_correct: bool
    execution_time_ms: Optional[float] = None
    error_message: Optional[str] = None
    feedback: Optional[str] = None
    score: int = 0
    stars: int = 0  # 0-3 stars based on performance
    xp_earned: int = 0
    is_challenge_completed: bool = False
    performance_comparison: Optional[Dict[str, Any]] = None  # Compare with expected solution

class UserProgressSchema(BaseModel):
    """
    Schema for user progress on a challenge.
    
    Tracks the user's attempts and completion status for a challenge.
    """
    challenge_id: int
    is_completed: bool
    attempts_count: int
    best_execution_time_ms: Optional[float] = None
    score: int
    stars: int
    first_attempted_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        """
        Configuration for the Pydantic model.
        """
        orm_mode = True

class UserProgressUpdate(BaseModel):
    """
    Schema for updating user progress on a challenge.
    
    Used internally to update progress after a submission.
    """
    is_completed: Optional[bool] = None
    attempts_count: Optional[int] = None
    best_execution_time_ms: Optional[float] = None
    last_submitted_solution: Optional[str] = None
    hints_used: Optional[int] = None
    score: Optional[int] = None
    stars: Optional[int] = None
    completed_at: Optional[datetime] = None
