import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.session import get_db
from app.models.user import Base, User
from app.models.challenge import Challenge, DifficultyLevel, ChallengeType
from app.core.auth import get_password_hash, create_access_token

# Create an in-memory SQLite database for testing
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the get_db dependency to use our test database
def override_get_db():
    """
    Override the database session dependency for testing.
    
    This function creates a new database session for each test request
    and closes it after the test is complete.
    
    Returns:
        SQLAlchemy database session
    """
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create a test client
client = TestClient(app)

@pytest.fixture(scope="function")
def test_db():
    """
    Create test database tables before each test and drop them after.
    
    This fixture ensures that each test starts with a clean database.
    
    Yields:
        SQLAlchemy database session
    """
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create a test user and admin user
    db = TestingSessionLocal()
    
    # Regular user
    hashed_password = get_password_hash("testpassword")
    test_user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=hashed_password,
        display_name="Test User",
        is_active=True
    )
    db.add(test_user)
    
    # Admin user
    admin_hashed_password = get_password_hash("adminpassword")
    admin_user = User(
        username="adminuser",
        email="admin@example.com",
        hashed_password=admin_hashed_password,
        display_name="Admin User",
        is_active=True,
        is_admin=True
    )
    db.add(admin_user)
    
    # Create some test challenges
    test_challenge = Challenge(
        level_number=1,
        title="Test Challenge",
        description="A simple test challenge",
        difficulty=DifficultyLevel.BEGINNER,
        challenge_type=ChallengeType.QUERY,
        initial_code="SELECT * FROM users",
        expected_solution="SELECT id, name FROM users",
        schema_definition="""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY,
                name TEXT,
                email TEXT
            );
        """,
        test_data="""
            {
                "users": [
                    {"id": 1, "name": "Alice", "email": "alice@example.com"},
                    {"id": 2, "name": "Bob", "email": "bob@example.com"}
                ]
            }
        """,
        time_limit_seconds=60,
        max_attempts=3,
        xp_reward=100,
        performance_threshold_ms=500
    )
    db.add(test_challenge)
    
    db.commit()
    db.close()
    
    # Run the test
    yield
    
    # Drop tables
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def user_token():
    """
    Create an access token for the test user.
    
    Returns:
        JWT access token
    """
    # Get user from database
    db = TestingSessionLocal()
    user = db.query(User).filter(User.username == "testuser").first()
    db.close()
    
    # Create access token
    return create_access_token({"sub": user.username})

@pytest.fixture
def admin_token():
    """
    Create an access token for the admin user.
    
    Returns:
        JWT access token
    """
    # Get admin from database
    db = TestingSessionLocal()
    admin = db.query(User).filter(User.username == "adminuser").first()
    db.close()
    
    # Create access token
    return create_access_token({"sub": admin.username})

def test_get_challenges(test_db, user_token):
    """
    Test getting a list of challenges.
    
    This test verifies that an authenticated user can retrieve
    a list of challenges.
    """
    response = client.get(
        "/api/challenges/",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    # Check response status code
    assert response.status_code == 200
    
    # Check response data
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["title"] == "Test Challenge"

def test_get_challenge_by_id(test_db, user_token):
    """
    Test getting a challenge by ID.
    
    This test verifies that an authenticated user can retrieve
    a specific challenge by its ID.
    """
    response = client.get(
        "/api/challenges/1",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    # Check response status code
    assert response.status_code == 200
    
    # Check response data
    data = response.json()
    assert data["id"] == 1
    assert data["title"] == "Test Challenge"
    assert data["difficulty"] == DifficultyLevel.BEGINNER
    assert data["challenge_type"] == ChallengeType.QUERY

def test_create_challenge(test_db, admin_token):
    """
    Test creating a new challenge.
    
    This test verifies that an admin user can create a new challenge
    and that the response contains the expected challenge data.
    """
    response = client.post(
        "/api/challenges/",
        json={
            "level_number": 2,
            "title": "New Challenge",
            "description": "A new test challenge",
            "difficulty": DifficultyLevel.INTERMEDIATE,
            "challenge_type": ChallengeType.OPTIMIZATION,
            "initial_code": "SELECT * FROM products",
            "expected_solution": "SELECT id, name FROM products WHERE price > 10",
            "schema_definition": """
                CREATE TABLE products (
                    id INTEGER PRIMARY KEY,
                    name TEXT,
                    price REAL
                );
            """,
            "test_data": """
                {
                    "products": [
                        {"id": 1, "name": "Apple", "price": 5.0},
                        {"id": 2, "name": "Banana", "price": 15.0}
                    ]
                }
            """,
            "time_limit_seconds": 120,
            "max_attempts": 5,
            "xp_reward": 200,
            "performance_threshold_ms": 300
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    # Check response status code
    assert response.status_code == 201
    
    # Check response data
    data = response.json()
    assert data["level_number"] == 2
    assert data["title"] == "New Challenge"
    assert data["difficulty"] == DifficultyLevel.INTERMEDIATE
    assert data["challenge_type"] == ChallengeType.OPTIMIZATION

def test_update_challenge(test_db, admin_token):
    """
    Test updating an existing challenge.
    
    This test verifies that an admin user can update an existing challenge
    and that the response contains the updated challenge data.
    """
    response = client.put(
        "/api/challenges/1",
        json={
            "title": "Updated Challenge",
            "description": "An updated test challenge",
            "difficulty": DifficultyLevel.ADVANCED
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    # Check response status code
    assert response.status_code == 200
    
    # Check response data
    data = response.json()
    assert data["id"] == 1
    assert data["title"] == "Updated Challenge"
    assert data["description"] == "An updated test challenge"
    assert data["difficulty"] == DifficultyLevel.ADVANCED

def test_delete_challenge(test_db, admin_token):
    """
    Test deleting a challenge.
    
    This test verifies that an admin user can delete a challenge
    and that the challenge is no longer accessible after deletion.
    """
    # Delete the challenge
    delete_response = client.delete(
        "/api/challenges/1",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    # Check response status code
    assert delete_response.status_code == 204
    
    # Try to get the deleted challenge
    get_response = client.get(
        "/api/challenges/1",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    # Check that the challenge is not found
    assert get_response.status_code == 404

def test_submit_sql_solution(test_db, user_token):
    """
    Test submitting a SQL solution for a challenge.
    
    This test verifies that a user can submit a SQL solution for a challenge
    and receive feedback on correctness and performance.
    """
    response = client.post(
        "/api/challenges/1/submit",
        json={
            "challenge_id": 1,
            "sql_code": "SELECT id, name FROM users",
            "hints_used": 0
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    # Check response status code
    assert response.status_code == 200
    
    # Check response data
    data = response.json()
    assert data["is_correct"] == True
    assert "execution_time_ms" in data
    assert "score" in data
    assert "stars" in data
    assert "feedback" in data

def test_get_user_progress(test_db, user_token):
    """
    Test getting a user's progress on challenges.
    
    This test verifies that a user can retrieve their progress
    on all challenges they have attempted.
    """
    # First submit a solution to create progress data
    client.post(
        "/api/challenges/1/submit",
        json={
            "challenge_id": 1,
            "sql_code": "SELECT id, name FROM users",
            "hints_used": 0
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    # Get user progress
    response = client.get(
        "/api/challenges/user/progress",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    # Check response status code
    assert response.status_code == 200
    
    # Check response data
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["challenge_id"] == 1
    assert data[0]["is_completed"] == True
    assert "score" in data[0]
    assert "stars" in data[0]
