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

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_users(db: Session):
    """
    Seed the database with initial users.
    
    Creates admin and regular user accounts for development and testing.
    """
    logger.info("Seeding users...")
    
    # Create admin user
    admin_user = User(
        email="admin@sqlgame.com",
        username="admin",
        hashed_password=get_password_hash("adminpassword"),
        full_name="Admin User",
        role=UserRole.ADMIN,
        avatar_type=AvatarType.SYSTEM,
        avatar_url="admin_avatar.png",
        is_active=True,
        created_at=datetime.datetime.utcnow()
    )
    
    # Create regular user
    regular_user = User(
        email="user@sqlgame.com",
        username="testuser",
        hashed_password=get_password_hash("userpassword"),
        full_name="Test User",
        role=UserRole.USER,
        avatar_type=AvatarType.SYSTEM,
        avatar_url="user_avatar.png",
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
            type=ChallengeType.SELECT,
            points=10,
            initial_sql="-- Write your SELECT query here\n\n",
            expected_result="JSON representation of all employees",
            solution="SELECT * FROM employees;",
            hint="Use the SELECT statement with * to retrieve all columns.",
            schema_sql="""
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
            """
        ),
        Challenge(
            title="Filter by Department",
            description="Write a query to select all employees from the Engineering department.",
            difficulty=DifficultyLevel.BEGINNER,
            type=ChallengeType.SELECT,
            points=15,
            initial_sql="-- Write your query to filter by department\n\n",
            expected_result="JSON representation of Engineering employees",
            solution="SELECT * FROM employees WHERE department = 'Engineering';",
            hint="Use the WHERE clause to filter results by the department column.",
            schema_sql="""
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
            """
        )
    ]
    
    # Intermediate challenges
    intermediate_challenges = [
        Challenge(
            title="Join Orders and Customers",
            description="Write a query to join the orders and customers tables to show all orders with customer names.",
            difficulty=DifficultyLevel.INTERMEDIATE,
            type=ChallengeType.JOIN,
            points=25,
            initial_sql="-- Write your JOIN query here\n\n",
            expected_result="JSON representation of joined tables",
            solution="SELECT o.id, o.order_date, o.amount, c.name FROM orders o JOIN customers c ON o.customer_id = c.id;",
            hint="Use the JOIN keyword to combine tables based on the customer_id.",
            schema_sql="""
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
            """
        )
    ]
    
    # Advanced challenges
    advanced_challenges = [
        Challenge(
            title="Complex Aggregation",
            description="Write a query to find the total sales by department and month, sorted by month and then by total sales in descending order.",
            difficulty=DifficultyLevel.ADVANCED,
            type=ChallengeType.AGGREGATE,
            points=40,
            initial_sql="-- Write your aggregation query here\n\n",
            expected_result="JSON representation of aggregated results",
            solution="""
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
            hint="Use GROUP BY with multiple columns and the strftime function to format dates.",
            schema_sql="""
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
                (1, 'Electronics'),
                (2, 'Clothing'),
                (3, 'Home Goods');
                
            INSERT INTO employees VALUES
                (1, 'John Doe', 1),
                (2, 'Jane Smith', 2),
                (3, 'Bob Johnson', 1),
                (4, 'Alice Brown', 3),
                (5, 'Charlie Wilson', 2);
                
            INSERT INTO sales VALUES
                (1, 1, '2022-01-15', 1200.00),
                (2, 1, '2022-01-20', 800.00),
                (3, 2, '2022-01-10', 950.00),
                (4, 3, '2022-01-25', 1500.00),
                (5, 4, '2022-02-05', 700.00),
                (6, 5, '2022-02-10', 1100.00),
                (7, 1, '2022-02-15', 900.00),
                (8, 2, '2022-02-20', 1300.00),
                (9, 3, '2022-02-25', 600.00),
                (10, 4, '2022-02-28', 1000.00);
            """
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
    """
    logger.info("Seeding achievements...")
    
    # Create achievement categories
    categories = [
        AchievementCategory(name="Beginner", description="Achievements for beginners"),
        AchievementCategory(name="Intermediate", description="Achievements for intermediate users"),
        AchievementCategory(name="Advanced", description="Achievements for advanced users"),
        AchievementCategory(name="Mastery", description="Achievements for SQL masters")
    ]
    
    try:
        for category in categories:
            db.add(category)
        db.commit()
        
        # Get the categories we just created
        categories = db.query(AchievementCategory).all()
        category_dict = {cat.name: cat.id for cat in categories}
        
        # Create achievements
        achievements = [
            # Beginner achievements
            Achievement(
                name="First Query",
                description="Run your first SQL query",
                category_id=category_dict["Beginner"],
                points=5,
                icon="first_query.png"
            ),
            Achievement(
                name="SELECT Master",
                description="Complete 5 SELECT challenges",
                category_id=category_dict["Beginner"],
                points=10,
                icon="select_master.png"
            ),
            
            # Intermediate achievements
            Achievement(
                name="JOIN Expert",
                description="Complete 5 JOIN challenges",
                category_id=category_dict["Intermediate"],
                points=15,
                icon="join_expert.png"
            ),
            Achievement(
                name="Data Manipulator",
                description="Complete 5 INSERT/UPDATE/DELETE challenges",
                category_id=category_dict["Intermediate"],
                points=20,
                icon="data_manipulator.png"
            ),
            
            # Advanced achievements
            Achievement(
                name="Aggregation Guru",
                description="Complete 5 aggregation challenges",
                category_id=category_dict["Advanced"],
                points=25,
                icon="aggregation_guru.png"
            ),
            Achievement(
                name="Subquery Wizard",
                description="Complete 5 subquery challenges",
                category_id=category_dict["Advanced"],
                points=30,
                icon="subquery_wizard.png"
            ),
            
            # Mastery achievements
            Achievement(
                name="SQL Master",
                description="Complete all challenges",
                category_id=category_dict["Mastery"],
                points=50,
                icon="sql_master.png"
            ),
            Achievement(
                name="Performance Optimizer",
                description="Optimize 5 queries for better performance",
                category_id=category_dict["Mastery"],
                points=40,
                icon="performance_optimizer.png"
            )
        ]
        
        for achievement in achievements:
            db.add(achievement)
        db.commit()
        logger.info("Achievements seeded successfully.")
    except IntegrityError:
        db.rollback()
        logger.info("Some achievements already exist, skipping.")

def seed_skill_trees(db: Session):
    """
    Seed the database with skill trees for user progression.
    
    Creates skill trees with various SQL skills that users can unlock.
    """
    logger.info("Seeding skill trees...")
    
    # Create skill trees
    skill_trees = [
        SkillTree(
            name="Basic SQL",
            description="Fundamental SQL skills",
            level=1,
            icon="basic_sql.png",
            prerequisites=None
        ),
        SkillTree(
            name="Intermediate SQL",
            description="More advanced SQL concepts",
            level=2,
            icon="intermediate_sql.png",
            prerequisites="Basic SQL"
        ),
        SkillTree(
            name="Advanced SQL",
            description="Complex SQL techniques",
            level=3,
            icon="advanced_sql.png",
            prerequisites="Intermediate SQL"
        ),
        SkillTree(
            name="SQL Optimization",
            description="SQL performance optimization",
            level=4,
            icon="sql_optimization.png",
            prerequisites="Advanced SQL"
        )
    ]
    
    try:
        for skill_tree in skill_trees:
            db.add(skill_tree)
        db.commit()
        logger.info("Skill trees seeded successfully.")
    except IntegrityError:
        db.rollback()
        logger.info("Some skill trees already exist, skipping.")

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
        
        logger.info("Database seeding completed successfully!")
    except Exception as e:
        logger.error(f"Error seeding database: {str(e)}")
        raise
    finally:
        db.close()
        challenge_db.close()

if __name__ == "__main__":
    seed_database()
