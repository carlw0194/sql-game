"""
Database Session Management for SQL Game

This module establishes database connections and provides session management
for both the main PostgreSQL database and the SQLite challenges database.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from app.core.config import settings

# Load environment variables
load_dotenv()

# Determine if we're in testing mode
TESTING = os.getenv("TESTING", "False").lower() in ("true", "1", "t")

# Create engines for different databases
if TESTING:
    """
    In testing mode, use SQLite databases for both main and challenge databases.
    SQLite is faster for tests and doesn't require a separate database server.
    """
    # Use in-memory SQLite for main database in testing
    main_engine = create_engine(
        "sqlite:///./test_sql_game.db",
        connect_args={"check_same_thread": False}  # Needed for SQLite to allow multiple threads
    )
    
    # SQLite database for SQL challenges (testing)
    challenge_engine = create_engine(
        "sqlite:///./test_challenges.db", 
        connect_args={"check_same_thread": False}  # Needed for SQLite to allow multiple threads
    )
else:
    """
    In production mode, use PostgreSQL for the main database and SQLite for challenges.
    PostgreSQL provides better performance, concurrency, and data integrity for user data,
    while SQLite is simpler for the challenges database which has less concurrent access.
    """
    # Main PostgreSQL database for user data, progress, etc.
    main_engine = create_engine(
        settings.SQLALCHEMY_DATABASE_URI,
        pool_pre_ping=True,  # Verify connection before using from pool
        pool_size=10,        # Maximum number of connections to keep in the pool
        max_overflow=20      # Maximum number of connections to create above pool_size
    )
    
    # SQLite database for SQL challenges
    challenge_engine = create_engine(
        settings.CHALLENGE_DB_PATH, 
        connect_args={"check_same_thread": False}  # Needed for SQLite to allow multiple threads
    )

# Create session factories
"""
Session factories create new database sessions when needed.
- autocommit=False: Changes aren't automatically committed
- autoflush=False: Changes aren't automatically flushed to the database
"""
MainSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=main_engine)
ChallengeSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=challenge_engine)

# Base class for SQLAlchemy models
Base = declarative_base()

def get_db():
    """
    Dependency function to get a database session for the main database.
    
    This creates a new database session for each request and closes it when the request is done.
    Used with FastAPI's dependency injection system.
    
    In production, this connects to PostgreSQL. In testing, it connects to SQLite.
    
    Yields:
        Session: A SQLAlchemy database session
    """
    db = MainSessionLocal()
    try:
        yield db
    finally:
        # Ensure the session is closed even if an exception occurs
        db.close()

def get_challenge_db():
    """
    Dependency function to get a database session for the challenges database.
    
    This creates a new database session for each request and closes it when the request is done.
    Used with FastAPI's dependency injection system.
    
    This always connects to SQLite, but uses a different file in testing mode.
    
    Yields:
        Session: A SQLAlchemy database session for the challenges database
    """
    db = ChallengeSessionLocal()
    try:
        yield db
    finally:
        # Ensure the session is closed even if an exception occurs
        db.close()
