"""
Database Seeding Script for SQL Game

This script populates the database with initial data for development and testing.
It creates sample users, challenges, achievements, and other necessary data.
"""

import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database.session import get_db, get_challenge_db
from app.models.user import User, UserRole, AvatarType
from app.models.challenge import Challenge, DifficultyLevel, ChallengeType
from app.models.leaderboard import LeaderboardEntry, LeaderboardType
from app.models.progress import Achievement, AchievementCategory, SkillTree, UserSkill
from app.core.security import get_password_hash
import datetime
from app.database.seed_payment_data import seed_pricing_plans

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_users(db: Session):
    """
    Seed the database with initial users.
    
    Creates admin and regular user accounts for development and testing.
    These accounts can be used to test different user roles and permissions
    in the application.
    """
    logger.info("Seeding users...")
    
    # Create admin user
    admin_user = User(
        email="admin@sqlgame.com",
        username="admin",
        hashed_password=get_password_hash("adminpassword"),
        display_name="Admin User",
        role=UserRole.ADMIN,
        avatar_type=AvatarType.DBA,  # Using DBA avatar type instead of SYSTEM
        avatar_customization='{"color": "red", "accessories": ["glasses"]}',
        is_active=True,
        created_at=datetime.datetime.utcnow()
    )
    
    # Create regular user
    regular_user = User(
        email="user@sqlgame.com",
        username="testuser",
        hashed_password=get_password_hash("userpassword"),
        display_name="Test User",
        role=UserRole.PLAYER,  # Using PLAYER role instead of USER
        avatar_type=AvatarType.DEVELOPER,  # Using DEVELOPER avatar type
        avatar_customization='{"color": "blue", "accessories": ["hat"]}',
        is_active=True,
        created_at=datetime.datetime.utcnow()
    )
    
    # Add users to database
    try:
        db.add(admin_user)
        db.add(regular_user)
        db.commit()
        logger.info("Users seeded successfully.")
    except IntegrityError:
        db.rollback()
        logger.info("Users already exist, skipping.")

def seed_challenges(challenge_db: Session):
    """
    Seed the database with initial SQL challenges.
    
    Creates beginner, intermediate, and advanced challenges for users to solve.
    """
    logger.info("Seeding challenges...")
    
    # Beginner challenges
    beginner_challenges = [
        Challenge(
            title="Select All Employees",
            description="Write a query to select all employees from the 'employees' table.",
            difficulty=DifficultyLevel.BEGINNER,
            challenge_type=ChallengeType.QUERY_WRITING,
            level_number=1,
            xp_reward=10,
            initial_code="-- Write your SELECT query here\n\n",
            expected_solution="SELECT * FROM employees;",
            schema_definition="""
            CREATE TABLE employees (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                department TEXT NOT NULL,
                salary REAL NOT NULL,
                hire_date TEXT NOT NULL
            );
            
            INSERT INTO employees VALUES
                (1, 'John Doe', 'Engineering', 75000, '2020-01-15'),
                (2, 'Jane Smith', 'Marketing', 65000, '2019-05-20'),
                (3, 'Bob Johnson', 'Engineering', 80000, '2018-11-10'),
                (4, 'Alice Brown', 'HR', 60000, '2021-03-01'),
                (5, 'Charlie Wilson', 'Marketing', 70000, '2020-07-25');
            """,
            test_data='{"expected_rows": 5, "expected_columns": ["id", "name", "department", "salary", "hire_date"]}'
        ),
        Challenge(
            title="Filter by Department",
            description="Write a query to select all employees from the Engineering department.",
            difficulty=DifficultyLevel.BEGINNER,
            challenge_type=ChallengeType.QUERY_WRITING,
            level_number=2,
            xp_reward=15,
            initial_code="-- Write your query to filter by department\n\n",
            expected_solution="SELECT * FROM employees WHERE department = 'Engineering';",
            schema_definition="""
            CREATE TABLE employees (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                department TEXT NOT NULL,
                salary REAL NOT NULL,
                hire_date TEXT NOT NULL
            );
            
            INSERT INTO employees VALUES
                (1, 'John Doe', 'Engineering', 75000, '2020-01-15'),
                (2, 'Jane Smith', 'Marketing', 65000, '2019-05-20'),
                (3, 'Bob Johnson', 'Engineering', 80000, '2018-11-10'),
                (4, 'Alice Brown', 'HR', 60000, '2021-03-01'),
                (5, 'Charlie Wilson', 'Marketing', 70000, '2020-07-25');
            """,
            test_data='{"expected_rows": 2, "expected_columns": ["id", "name", "department", "salary", "hire_date"], "expected_values": {"department": ["Engineering"]}}'
        )
    ]
    
    # Intermediate challenges
    intermediate_challenges = [
        Challenge(
            title="Join Orders and Customers",
            description="Write a query to join the orders and customers tables to show all orders with customer names.",
            difficulty=DifficultyLevel.INTERMEDIATE,
            challenge_type=ChallengeType.QUERY_WRITING,
            level_number=101,
            xp_reward=25,
            initial_code="-- Write your JOIN query here\n\n",
            expected_solution="SELECT o.id, o.order_date, o.amount, c.name FROM orders o JOIN customers c ON o.customer_id = c.id;",
            schema_definition="""
            CREATE TABLE customers (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                signup_date TEXT NOT NULL
            );
            
            CREATE TABLE orders (
                id INTEGER PRIMARY KEY,
                customer_id INTEGER NOT NULL,
                order_date TEXT NOT NULL,
                amount REAL NOT NULL,
                FOREIGN KEY (customer_id) REFERENCES customers (id)
            );
            
            INSERT INTO customers VALUES
                (1, 'John Doe', 'john@example.com', '2020-01-10'),
                (2, 'Jane Smith', 'jane@example.com', '2020-02-15'),
                (3, 'Bob Johnson', 'bob@example.com', '2020-03-20');
                
            INSERT INTO orders VALUES
                (1, 1, '2020-04-10', 99.99),
                (2, 1, '2020-05-15', 149.99),
                (3, 2, '2020-04-20', 49.99),
                (4, 3, '2020-06-25', 199.99);
            """,
            test_data='{"expected_rows": 4, "expected_columns": ["id", "order_date", "amount", "name"]}'
        )
    ]
    
    # Advanced challenges
    advanced_challenges = [
        Challenge(
            title="Complex Aggregation",
            description="Write a query to find the total sales by department and month, sorted by month and then by total sales in descending order.",
            difficulty=DifficultyLevel.ADVANCED,
            challenge_type=ChallengeType.QUERY_WRITING,
            level_number=301,
            xp_reward=40,
            initial_code="-- Write your aggregation query here\n\n",
            expected_solution="""
            SELECT 
                d.name AS department,
                strftime('%Y-%m', s.sale_date) AS month,
                SUM(s.amount) AS total_sales
            FROM 
                sales s
            JOIN 
                employees e ON s.employee_id = e.id
            JOIN 
                departments d ON e.department_id = d.id
            GROUP BY 
                d.name, strftime('%Y-%m', s.sale_date)
            ORDER BY 
                month, total_sales DESC;
            """,
            schema_definition="""
            CREATE TABLE departments (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL
            );
            
            CREATE TABLE employees (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                department_id INTEGER NOT NULL,
                FOREIGN KEY (department_id) REFERENCES departments (id)
            );
            
            CREATE TABLE sales (
                id INTEGER PRIMARY KEY,
                employee_id INTEGER NOT NULL,
                sale_date TEXT NOT NULL,
                amount REAL NOT NULL,
                FOREIGN KEY (employee_id) REFERENCES employees (id)
            );
            
            INSERT INTO departments VALUES
                (1, 'Engineering'),
                (2, 'Marketing'),
                (3, 'Sales');
                
            INSERT INTO employees VALUES
                (1, 'John Doe', 1),
                (2, 'Jane Smith', 2),
                (3, 'Bob Johnson', 1),
                (4, 'Alice Brown', 3),
                (5, 'Charlie Wilson', 2);
                
            INSERT INTO sales VALUES
                (1, 1, '2020-01-15', 1000),
                (2, 1, '2020-01-20', 500),
                (3, 2, '2020-01-10', 750),
                (4, 3, '2020-02-05', 1200),
                (5, 4, '2020-02-10', 950),
                (6, 5, '2020-02-15', 800),
                (7, 1, '2020-02-20', 1100),
                (8, 2, '2020-03-05', 700),
                (9, 3, '2020-03-10', 1300),
                (10, 4, '2020-03-15', 850);
            """,
            test_data='{"expected_rows": 7, "expected_columns": ["department", "month", "total_sales"]}'
        )
    ]
    
    # Add all challenges to database
    try:
        for challenge in beginner_challenges + intermediate_challenges + advanced_challenges:
            challenge_db.add(challenge)
        challenge_db.commit()
        logger.info("Challenges seeded successfully.")
    except IntegrityError:
        challenge_db.rollback()
        logger.info("Some challenges already exist, skipping.")

def seed_achievements(db: Session):
    """
    Seed the database with achievements that users can earn.
    
    Creates various achievement categories and specific achievements within each category.
    These achievements provide goals and rewards for players as they progress through
    the SQL learning game.
    """
    logger.info("Seeding achievements...")
    
    # Check if achievements already exist
    existing_achievements = db.query(Achievement).count()
    if existing_achievements > 0:
        logger.info("Achievements already exist, skipping.")
        return
    
    # Define achievements
    achievements = [
        # Query Mastery achievements
        Achievement(
            code="first_select",
            title="SELECT Apprentice",
            description="Write your first SELECT query",
            category=AchievementCategory.QUERY_MASTERY,
            requirement_description="Complete your first basic SELECT challenge",
            xp_reward=50,
            badge_image_url="badges/select_apprentice.png"
        ),
        Achievement(
            code="join_master",
            title="JOIN Master",
            description="Successfully use complex joins",
            category=AchievementCategory.QUERY_MASTERY,
            requirement_description="Complete 5 JOIN challenges",
            xp_reward=100,
            badge_image_url="badges/join_master.png"
        ),
        
        # Optimization achievements
        Achievement(
            code="speed_demon",
            title="Speed Demon",
            description="Optimize a query to run in under 100ms",
            category=AchievementCategory.OPTIMIZATION,
            requirement_description="Optimize a query to run in under 100ms on a large dataset",
            xp_reward=150,
            badge_image_url="badges/speed_demon.png"
        ),
        
        # Security achievements
        Achievement(
            code="injection_blocker",
            title="Injection Blocker",
            description="Successfully prevent SQL injection",
            category=AchievementCategory.SECURITY,
            requirement_description="Fix 3 SQL injection vulnerabilities",
            xp_reward=200,
            badge_image_url="badges/injection_blocker.png"
        ),
        
        # General achievements
        Achievement(
            code="challenge_streak",
            title="Challenge Streak",
            description="Complete 5 challenges in a row",
            category=AchievementCategory.GENERAL,
            requirement_description="Complete 5 challenges without failing",
            xp_reward=75,
            badge_image_url="badges/challenge_streak.png"
        )
    ]
    
    # Add achievements to database
    for achievement in achievements:
        db.add(achievement)
    
    try:
        db.commit()
        logger.info(f"Successfully seeded {len(achievements)} achievements")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding achievements: {str(e)}")
        raise

def seed_skill_trees(db: Session):
    """
    Seed the database with skill trees for user progression.
    
    Creates skill trees with various SQL skills that users can unlock.
    Each skill represents a specific SQL concept or technique that players
    can master as they progress through the game.
    """
    logger.info("Seeding skill trees...")
    
    # Check if skill trees already exist
    existing_skills = db.query(SkillTree).count()
    if existing_skills > 0:
        logger.info("Skill trees already exist, skipping.")
        return
    
    # Define basic skills (no prerequisites)
    basic_skills = [
        SkillTree(
            code="basic_select",
            name="Basic SELECT",
            description="Learn to retrieve data using basic SELECT statements",
            category="Query Writing",
            level=1,
            xp_required=0  # First skill, no XP required
        ),
        SkillTree(
            code="basic_where",
            name="WHERE Clause",
            description="Filter results using the WHERE clause",
            category="Query Writing",
            level=1,
            xp_required=50
        ),
        SkillTree(
            code="basic_order",
            name="ORDER BY",
            description="Sort results using ORDER BY",
            category="Query Writing",
            level=1,
            xp_required=100
        )
    ]
    
    # Add basic skills to database
    for skill in basic_skills:
        db.add(skill)
    
    try:
        db.commit()
        logger.info("Basic skills seeded successfully.")
        
        # Get the skills we just created to use as prerequisites
        basic_select = db.query(SkillTree).filter(SkillTree.code == "basic_select").first()
        basic_where = db.query(SkillTree).filter(SkillTree.code == "basic_where").first()
        basic_order = db.query(SkillTree).filter(SkillTree.code == "basic_order").first()
        
        # Define intermediate skills (with prerequisites)
        intermediate_skills = [
            SkillTree(
                code="basic_join",
                name="Basic JOINs",
                description="Combine data from multiple tables using JOINs",
                category="Query Writing",
                level=2,
                parent_skill_id=basic_select.id,
                xp_required=200
            ),
            SkillTree(
                code="basic_aggregation",
                name="Basic Aggregation",
                description="Use aggregate functions like COUNT, SUM, AVG",
                category="Query Writing",
                level=2,
                parent_skill_id=basic_select.id,
                xp_required=250
            ),
            SkillTree(
                code="advanced_filtering",
                name="Advanced Filtering",
                description="Use complex WHERE conditions with AND, OR, NOT",
                category="Query Writing",
                level=2,
                parent_skill_id=basic_where.id,
                xp_required=300
            )
        ]
        
        # Add intermediate skills to database
        for skill in intermediate_skills:
            db.add(skill)
            
        db.commit()
        logger.info(f"Successfully seeded {len(basic_skills) + len(intermediate_skills)} skill tree items")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding skill trees: {str(e)}")
        raise

def seed_database():
    """
    Main function to seed the entire database with initial data.
    
    Calls all individual seeding functions in the correct order.
    """
    logger.info("Starting database seeding process...")
    
    # Get database sessions
    db = next(get_db())
    challenge_db = next(get_challenge_db())
    
    try:
        # Seed users first
        seed_users(db)
        
        # Seed challenges
        seed_challenges(challenge_db)
        
        # Seed achievements
        seed_achievements(db)
        
        # Seed skill trees
        seed_skill_trees(db)
        
        # Seed payment data
        seed_pricing_plans(db)
        
        logger.info("Database seeding completed successfully.")
    except Exception as e:
        logger.error(f"Error during database seeding: {str(e)}")
        raise
    finally:
        db.close()
        challenge_db.close()

if __name__ == "__main__":
    seed_database()
