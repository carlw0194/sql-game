from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models.user import User
from app.models.challenge import DifficultyLevel, ChallengeType
from app.schemas.challenge import (
    ChallengeInList, ChallengeDetail, ChallengeCreate, ChallengeUpdate,
    SQLSubmission, SQLSubmissionResult, UserProgressSchema
)
from app.core.auth import get_current_active_user, get_admin_user
from app.services.challenge_service import (
    get_challenge, get_challenges, create_challenge, update_challenge, delete_challenge,
    get_user_challenges_progress, evaluate_sql_submission
)
from app.services.user_service import update_user_xp

router = APIRouter()

@router.get("/", response_model=List[ChallengeInList])
async def read_challenges(
    skip: int = 0,
    limit: int = 100,
    difficulty: Optional[DifficultyLevel] = None,
    challenge_type: Optional[ChallengeType] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a list of challenges with optional filtering.
    
    This endpoint returns a paginated list of challenges that can be filtered
    by difficulty level and challenge type.
    
    Args:
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return
        difficulty: Optional filter by difficulty level
        challenge_type: Optional filter by challenge type
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of challenge summaries
    """
    challenges = get_challenges(
        db, 
        skip=skip, 
        limit=limit, 
        difficulty=difficulty, 
        challenge_type=challenge_type
    )
    return challenges

@router.get("/{challenge_id}", response_model=ChallengeDetail)
async def read_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a challenge by ID.
    
    This endpoint returns detailed information about a specific challenge,
    including its description, initial code, and schema definition.
    
    Args:
        challenge_id: ID of the challenge to get
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Challenge details
        
    Raises:
        HTTPException: If the challenge doesn't exist
    """
    db_challenge = get_challenge(db, challenge_id=challenge_id)
    if db_challenge is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )
    return db_challenge

@router.post("/", response_model=ChallengeDetail, status_code=status.HTTP_201_CREATED)
async def create_new_challenge(
    challenge: ChallengeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)  # Only admins can create challenges
):
    """
    Create a new challenge (admin only).
    
    This endpoint allows administrators to create new SQL challenges
    with all necessary details.
    
    Args:
        challenge: Challenge creation data
        db: Database session
        current_user: Current authenticated admin user
        
    Returns:
        Created challenge details
        
    Raises:
        HTTPException: If a challenge with the same level number already exists
    """
    # Check if level number already exists
    existing_challenge = db.query(get_challenge(db, challenge.level_number))
    if existing_challenge:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Challenge with level number {challenge.level_number} already exists"
        )
    
    return create_challenge(db=db, challenge=challenge)

@router.put("/{challenge_id}", response_model=ChallengeDetail)
async def update_existing_challenge(
    challenge_id: int,
    challenge_update: ChallengeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)  # Only admins can update challenges
):
    """
    Update an existing challenge (admin only).
    
    This endpoint allows administrators to update the details of an
    existing SQL challenge.
    
    Args:
        challenge_id: ID of the challenge to update
        challenge_update: Challenge update data
        db: Database session
        current_user: Current authenticated admin user
        
    Returns:
        Updated challenge details
        
    Raises:
        HTTPException: If the challenge doesn't exist
    """
    updated_challenge = update_challenge(db, challenge_id, challenge_update)
    if updated_challenge is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )
    return updated_challenge

@router.delete("/{challenge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)  # Only admins can delete challenges
):
    """
    Delete a challenge (admin only).
    
    This endpoint allows administrators to delete an existing SQL challenge.
    
    Args:
        challenge_id: ID of the challenge to delete
        db: Database session
        current_user: Current authenticated admin user
        
    Raises:
        HTTPException: If the challenge doesn't exist
    """
    result = delete_challenge(db, challenge_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )
    return None

@router.post("/{challenge_id}/submit", response_model=SQLSubmissionResult)
async def submit_sql_solution(
    challenge_id: int,
    submission: SQLSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Submit a SQL solution for a challenge.
    
    This endpoint allows users to submit their SQL code for a challenge
    and receive immediate feedback on correctness and performance.
    
    Args:
        challenge_id: ID of the challenge
        submission: SQL submission data
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Evaluation result
        
    Raises:
        HTTPException: If the challenge doesn't exist or if the submission is invalid
    """
    # Ensure the challenge exists
    db_challenge = get_challenge(db, challenge_id=challenge_id)
    if db_challenge is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )
    
    # Ensure the challenge ID in the path matches the one in the submission
    if challenge_id != submission.challenge_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Challenge ID in path does not match the one in submission"
        )
    
    # Evaluate the submission
    result = evaluate_sql_submission(db, current_user.id, submission)
    
    # Award XP if earned
    if result.xp_earned > 0:
        update_user_xp(db, current_user.id, result.xp_earned)
    
    return result

@router.get("/user/progress", response_model=List[UserProgressSchema])
async def get_user_challenge_progress(
    completed_only: bool = Query(False, description="Filter to only show completed challenges"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the current user's progress on all challenges.
    
    This endpoint returns a list of all challenges the user has attempted
    or completed, along with their progress details.
    
    Args:
        completed_only: If True, only return completed challenges
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of user progress records
    """
    progress = get_user_challenges_progress(db, current_user.id, completed_only)
    return progress
