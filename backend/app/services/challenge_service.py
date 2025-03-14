from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List, Dict, Any, Tuple
import json
import time
import sqlite3
import re

from app.models.challenge import Challenge, UserProgress, DifficultyLevel, ChallengeType
from app.schemas.challenge import ChallengeCreate, ChallengeUpdate, SQLSubmission, SQLSubmissionResult

def get_challenge(db: Session, challenge_id: int) -> Optional[Challenge]:
    """
    Get a challenge by ID.
    
    Args:
        db: Database session
        challenge_id: Challenge ID to look up
        
    Returns:
        Challenge object if found, None otherwise
    """
    return db.query(Challenge).filter(Challenge.id == challenge_id).first()

def get_challenge_by_level(db: Session, level_number: int) -> Optional[Challenge]:
    """
    Get a challenge by level number.
    
    Args:
        db: Database session
        level_number: Level number to look up
        
    Returns:
        Challenge object if found, None otherwise
    """
    return db.query(Challenge).filter(Challenge.level_number == level_number).first()

def get_challenges(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    difficulty: Optional[DifficultyLevel] = None,
    challenge_type: Optional[ChallengeType] = None
) -> List[Challenge]:
    """
    Get a list of challenges with optional filtering.
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        difficulty: Optional filter by difficulty level
        challenge_type: Optional filter by challenge type
        
    Returns:
        List of Challenge objects
    """
    query = db.query(Challenge)
    
    # Apply filters if provided
    if difficulty:
        query = query.filter(Challenge.difficulty == difficulty)
    if challenge_type:
        query = query.filter(Challenge.challenge_type == challenge_type)
    
    # Order by level number
    query = query.order_by(Challenge.level_number)
    
    # Apply pagination
    return query.offset(skip).limit(limit).all()

def create_challenge(db: Session, challenge: ChallengeCreate) -> Challenge:
    """
    Create a new challenge.
    
    Args:
        db: Database session
        challenge: Challenge creation data
        
    Returns:
        Created Challenge object
    """
    # Create a new challenge instance
    db_challenge = Challenge(
        level_number=challenge.level_number,
        title=challenge.title,
        description=challenge.description,
        difficulty=challenge.difficulty,
        challenge_type=challenge.challenge_type,
        initial_code=challenge.initial_code,
        expected_solution=challenge.expected_solution,
        schema_definition=challenge.schema_definition,
        test_data=challenge.test_data,
        time_limit_seconds=challenge.time_limit_seconds,
        max_attempts=challenge.max_attempts,
        xp_reward=challenge.xp_reward,
        performance_threshold_ms=challenge.performance_threshold_ms
    )
    
    # Add to database and commit
    db.add(db_challenge)
    db.commit()
    db.refresh(db_challenge)
    
    return db_challenge

def update_challenge(
    db: Session, 
    challenge_id: int, 
    challenge_update: ChallengeUpdate
) -> Optional[Challenge]:
    """
    Update a challenge.
    
    Args:
        db: Database session
        challenge_id: ID of the challenge to update
        challenge_update: Challenge update data
        
    Returns:
        Updated Challenge object if found, None otherwise
    """
    # Get the challenge
    db_challenge = get_challenge(db, challenge_id)
    if not db_challenge:
        return None
    
    # Update challenge data
    update_data = challenge_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_challenge, key, value)
    
    # Commit changes
    db.commit()
    db.refresh(db_challenge)
    
    return db_challenge

def delete_challenge(db: Session, challenge_id: int) -> bool:
    """
    Delete a challenge.
    
    Args:
        db: Database session
        challenge_id: ID of the challenge to delete
        
    Returns:
        True if the challenge was deleted, False otherwise
    """
    # Get the challenge
    db_challenge = get_challenge(db, challenge_id)
    if not db_challenge:
        return False
    
    # Delete the challenge
    db.delete(db_challenge)
    db.commit()
    
    return True

def get_user_progress(db: Session, user_id: int, challenge_id: int) -> Optional[UserProgress]:
    """
    Get a user's progress on a specific challenge.
    
    Args:
        db: Database session
        user_id: User ID
        challenge_id: Challenge ID
        
    Returns:
        UserProgress object if found, None otherwise
    """
    return db.query(UserProgress).filter(
        UserProgress.user_id == user_id,
        UserProgress.challenge_id == challenge_id
    ).first()

def get_user_challenges_progress(
    db: Session, 
    user_id: int, 
    completed_only: bool = False
) -> List[UserProgress]:
    """
    Get a user's progress on all challenges.
    
    Args:
        db: Database session
        user_id: User ID
        completed_only: If True, only return completed challenges
        
    Returns:
        List of UserProgress objects
    """
    query = db.query(UserProgress).filter(UserProgress.user_id == user_id)
    
    if completed_only:
        query = query.filter(UserProgress.is_completed == True)
    
    return query.all()

def evaluate_sql_submission(
    db: Session,
    user_id: int,
    submission: SQLSubmission
) -> SQLSubmissionResult:
    """
    Evaluate a SQL submission for a challenge.
    
    This function executes the submitted SQL code against a test database,
    compares the results with the expected solution, and returns a detailed
    evaluation result.
    
    Args:
        db: Database session
        user_id: User ID
        submission: SQL submission data
        
    Returns:
        Evaluation result
    """
    # Get the challenge
    challenge = get_challenge(db, submission.challenge_id)
    if not challenge:
        return SQLSubmissionResult(
            is_correct=False,
            error_message="Challenge not found",
            feedback="The specified challenge does not exist.",
            score=0,
            stars=0,
            xp_earned=0,
            is_challenge_completed=False
        )
    
    # Get or create user progress for this challenge
    user_progress = get_user_progress(db, user_id, challenge.id)
    if not user_progress:
        user_progress = UserProgress(
            user_id=user_id,
            challenge_id=challenge.id,
            is_completed=False,
            attempts_count=0,
            hints_used=0,
            score=0,
            stars=0
        )
        db.add(user_progress)
    
    # Increment attempt count
    user_progress.attempts_count += 1
    user_progress.last_submitted_solution = submission.sql_code
    user_progress.hints_used += submission.hints_used or 0
    user_progress.last_attempted_at = func.now()
    
    # Execute the SQL code in a sandboxed environment
    # This is a simplified version - in a real implementation,
    # we would use a more secure execution environment
    try:
        # Parse the test data
        test_data = json.loads(challenge.test_data)
        
        # Create an in-memory SQLite database for testing
        conn = sqlite3.connect(":memory:")
        cursor = conn.cursor()
        
        # Create the schema
        cursor.executescript(challenge.schema_definition)
        
        # Insert test data
        for table_name, rows in test_data.items():
            if not rows:
                continue
                
            # Get column names from the first row
            columns = rows[0].keys()
            placeholders = ", ".join(["?" for _ in columns])
            column_str = ", ".join(columns)
            
            # Insert each row
            for row in rows:
                values = [row[col] for col in columns]
                cursor.execute(
                    f"INSERT INTO {table_name} ({column_str}) VALUES ({placeholders})",
                    values
                )
        
        # Measure execution time
        start_time = time.time()
        
        # Execute the submitted SQL
        cursor.execute(submission.sql_code)
        submitted_result = cursor.fetchall()
        
        # Calculate execution time
        execution_time_ms = (time.time() - start_time) * 1000
        
        # Execute the expected solution for comparison
        cursor.execute(challenge.expected_solution)
        expected_result = cursor.fetchall()
        
        # Close the connection
        conn.close()
        
        # Compare results
        is_correct = (submitted_result == expected_result)
        
        # Calculate score and stars based on correctness, execution time, and hints used
        score = 0
        stars = 0
        
        if is_correct:
            # Base score for correctness
            score = 100
            
            # Performance bonus/penalty
            if challenge.performance_threshold_ms:
                if execution_time_ms <= challenge.performance_threshold_ms:
                    # Performance bonus
                    performance_ratio = challenge.performance_threshold_ms / max(execution_time_ms, 1)
                    performance_bonus = min(int(50 * performance_ratio), 100)
                    score += performance_bonus
                else:
                    # Performance penalty
                    performance_ratio = execution_time_ms / challenge.performance_threshold_ms
                    performance_penalty = min(int(25 * performance_ratio), 50)
                    score -= performance_penalty
            
            # Hint penalty
            hint_penalty = min(user_progress.hints_used * 10, 50)
            score -= hint_penalty
            
            # Ensure score is within bounds
            score = max(50, min(score, 200))
            
            # Calculate stars (1-3)
            if score >= 150:
                stars = 3
            elif score >= 100:
                stars = 2
            else:
                stars = 1
            
            # Update user progress
            user_progress.is_completed = True
            user_progress.completed_at = func.now()
            user_progress.score = max(user_progress.score, score)
            user_progress.stars = max(user_progress.stars, stars)
            
            if not user_progress.best_execution_time_ms or execution_time_ms < user_progress.best_execution_time_ms:
                user_progress.best_execution_time_ms = execution_time_ms
        
        # Commit changes to user progress
        db.commit()
        db.refresh(user_progress)
        
        # Calculate XP earned (only if this is the first completion)
        xp_earned = 0
        if is_correct and user_progress.is_completed and user_progress.attempts_count == 1:
            xp_earned = challenge.xp_reward
        
        # Generate feedback
        feedback = ""
        if is_correct:
            feedback = "Your solution is correct! "
            if stars == 3:
                feedback += "Excellent performance!"
            elif stars == 2:
                feedback += "Good job!"
            else:
                feedback += "You've solved the challenge, but there's room for optimization."
        else:
            feedback = "Your solution is incorrect. The results don't match the expected output."
        
        # Create performance comparison data
        performance_comparison = {
            "execution_time_ms": execution_time_ms,
            "threshold_ms": challenge.performance_threshold_ms,
            "is_optimized": challenge.performance_threshold_ms and execution_time_ms <= challenge.performance_threshold_ms
        }
        
        return SQLSubmissionResult(
            is_correct=is_correct,
            execution_time_ms=execution_time_ms,
            feedback=feedback,
            score=score,
            stars=stars,
            xp_earned=xp_earned,
            is_challenge_completed=user_progress.is_completed,
            performance_comparison=performance_comparison
        )
        
    except sqlite3.Error as e:
        # SQL execution error
        error_message = str(e)
        
        # Update user progress
        db.commit()
        
        return SQLSubmissionResult(
            is_correct=False,
            error_message=error_message,
            feedback=f"SQL Error: {error_message}",
            score=0,
            stars=0,
            xp_earned=0,
            is_challenge_completed=False
        )
    except Exception as e:
        # Other errors
        error_message = str(e)
        
        # Update user progress
        db.commit()
        
        return SQLSubmissionResult(
            is_correct=False,
            error_message=error_message,
            feedback=f"Error: {error_message}",
            score=0,
            stars=0,
            xp_earned=0,
            is_challenge_completed=False
        )
