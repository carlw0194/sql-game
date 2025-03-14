from sqlalchemy.orm import Session
import os
from app.database.session import main_engine, challenge_engine, Base
from app.models import user, challenge, leaderboard, progress, payment
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    """
    Initialize the database by creating all tables defined in the models.
    
    This function creates the tables in both the main PostgreSQL database
    and the SQLite challenges database if they don't already exist.
    
    The main database includes:
    - User accounts and profiles
    - Progress tracking
    - Leaderboards
    - Payment methods and subscriptions
    
    The challenges database contains:
    - SQL challenges and their solutions
    - Challenge categories and difficulty levels
    """
    # Create tables in the main database
    logger.info("Creating tables in the main database...")
    Base.metadata.create_all(bind=main_engine)
    
    # Create tables in the challenges database
    logger.info("Creating tables in the challenges database...")
    Base.metadata.create_all(bind=challenge_engine)
    
    logger.info("Database initialization completed successfully.")

def seed_db():
    """
    Seed the database with initial data after initialization.
    
    This function imports and calls the seed_database function from seed_db.py
    to populate the database with sample data for development and testing.
    
    This includes:
    - Sample user accounts
    - Pre-defined SQL challenges
    - Initial pricing plans for the freemium model
    """
    try:
        from app.database.seed_db import seed_database
        logger.info("Starting database seeding process...")
        seed_database()
        logger.info("Database seeding completed successfully.")
    except Exception as e:
        logger.error(f"Error seeding database: {str(e)}")
        logger.info("Database initialization completed, but seeding failed.")

def init_and_seed_db():
    """
    Initialize and seed the database in one operation.
    
    This function is useful for setting up a new development environment
    or resetting the database with fresh sample data.
    
    It performs two steps:
    1. Creates all database tables (init_db)
    2. Populates tables with initial data (seed_db)
    """
    init_db()
    seed_db()

if __name__ == "__main__":
    logger.info("Initializing database...")
    init_db()
    
    # Check if we should seed the database
    # This can be controlled via environment variable for automation purposes
    if os.getenv("SEED_DB", "False").lower() in ("true", "1", "t"):
        logger.info("Seeding database with initial data...")
        seed_db()
    
    logger.info("Database initialization script completed.")
