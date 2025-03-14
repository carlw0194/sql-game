from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Determine if we're in testing mode
TESTING = os.getenv("TESTING", "False").lower() in ("true", "1", "t")

# Get database URLs from environment variables or use defaults
POSTGRES_URL = os.getenv("POSTGRES_URL", "postgresql://postgres:password@localhost/sql_game")
SQLITE_URL = os.getenv("SQLITE_URL", "sqlite:///./sql_game.db")
TEST_SQLITE_URL = "sqlite:///./test_sql_game.db"

# Create engines for different databases
# Use SQLite for testing, PostgreSQL for production
if TESTING:
    # Use in-memory SQLite for testing
    main_engine = create_engine(
        "sqlite:///./test_sql_game.db",
        connect_args={"check_same_thread": False}  # Needed for SQLite
    )
    # SQLite database for SQL challenges (testing)
    challenge_engine = create_engine(
        "sqlite:///./test_challenges.db", 
        connect_args={"check_same_thread": False}  # Needed for SQLite
    )
else:
    # Main PostgreSQL database for user data, progress, etc.
    main_engine = create_engine(POSTGRES_URL)
    
    # SQLite database for SQL challenges
    challenge_engine = create_engine(
        SQLITE_URL, 
        connect_args={"check_same_thread": False}  # Needed for SQLite
    )

# Create session factories
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
    """
    db = MainSessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_challenge_db():
    """
    Dependency function to get a database session for the challenges database.
    
    This creates a new database session for each request and closes it when the request is done.
    Used with FastAPI's dependency injection system.
    
    This always connects to SQLite, but uses a different file in testing mode.
    """
    db = ChallengeSessionLocal()
    try:
        yield db
    finally:
        db.close()
