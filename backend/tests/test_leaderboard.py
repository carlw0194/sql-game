import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime, timedelta

from app.main import app
from app.database.session import get_db
from app.models.user import Base, User
from app.models.leaderboard import LeaderboardEntry, LeaderboardType
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
    
    # Create test users and leaderboard entries
    db = TestingSessionLocal()
    
    # Create test users
    users = []
    for i in range(1, 6):
        hashed_password = get_password_hash(f"password{i}")
        user = User(
            username=f"user{i}",
            email=f"user{i}@example.com",
            hashed_password=hashed_password,
            display_name=f"User {i}",
            is_active=True,
            is_admin=i == 1  # First user is admin
        )
        db.add(user)
        users.append(user)
    
    # Flush to get user IDs
    db.flush()
    
    # Calculate time periods
    now = datetime.utcnow()
    today = datetime(now.year, now.month, now.day)
    today_end = today + timedelta(days=1)
    
    week_start = today - timedelta(days=now.weekday())
    week_end = week_start + timedelta(days=7)
    
    month_start = datetime(now.year, now.month, 1)
    if now.month == 12:
        month_end = datetime(now.year + 1, 1, 1)
    else:
        month_end = datetime(now.year, now.month + 1, 1)
    
    # Create global leaderboard entries
    for i, user in enumerate(users):
        score = 1000 - i * 200  # Descending scores
        entry = LeaderboardEntry(
            user_id=user.id,
            leaderboard_type=LeaderboardType.GLOBAL,
            score=score,
            rank=i + 1
        )
        db.add(entry)
    
    # Create daily leaderboard entries
    for i, user in enumerate(users):
        score = 500 - i * 100  # Descending scores
        entry = LeaderboardEntry(
            user_id=user.id,
            leaderboard_type=LeaderboardType.DAILY,
            score=score,
            rank=i + 1,
            period_start=today,
            period_end=today_end
        )
        db.add(entry)
    
    # Create weekly leaderboard entries
    for i, user in enumerate(users):
        score = 2000 - i * 300  # Descending scores
        entry = LeaderboardEntry(
            user_id=user.id,
            leaderboard_type=LeaderboardType.WEEKLY,
            score=score,
            rank=i + 1,
            period_start=week_start,
            period_end=week_end
        )
        db.add(entry)
    
    # Create monthly leaderboard entries
    for i, user in enumerate(users):
        score = 5000 - i * 500  # Descending scores
        entry = LeaderboardEntry(
            user_id=user.id,
            leaderboard_type=LeaderboardType.MONTHLY,
            score=score,
            rank=i + 1,
            period_start=month_start,
            period_end=month_end
        )
        db.add(entry)
    
    db.commit()
    db.close()
    
    # Run the test
    yield
    
    # Drop tables
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def user_token():
    """
    Create an access token for a regular user.
    
    Returns:
        JWT access token
    """
    # Get user from database
    db = TestingSessionLocal()
    user = db.query(User).filter(User.username == "user2").first()
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
    admin = db.query(User).filter(User.username == "user1").first()
    db.close()
    
    # Create access token
    return create_access_token({"sub": admin.username})

def test_get_global_leaderboard(test_db, user_token):
    """
    Test getting the global leaderboard.
    
    This test verifies that an authenticated user can retrieve
    the global leaderboard with player rankings.
    """
    response = client.get(
        "/api/leaderboard/global",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    # Check response status code
    assert response.status_code == 200
    
    # Check response data
    data = response.json()
    assert data["leaderboard_type"] == LeaderboardType.GLOBAL
    assert isinstance(data["entries"], list)
    assert len(data["entries"]) == 5
    assert data["entries"][0]["rank"] == 1
    assert data["entries"][0]["score"] == 1000
    assert data["user_rank"] == 2  # User2 is rank 2
    assert data["user_score"] == 800  # User2's score
    assert data["total_players"] == 5

def test_get_daily_leaderboard(test_db, user_token):
    """
    Test getting the daily leaderboard.
    
    This test verifies that an authenticated user can retrieve
    the daily leaderboard with player rankings.
    """
    response = client.get(
        "/api/leaderboard/daily",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    # Check response status code
    assert response.status_code == 200
    
    # Check response data
    data = response.json()
    assert data["leaderboard_type"] == LeaderboardType.DAILY
    assert isinstance(data["entries"], list)
    assert len(data["entries"]) == 5
    assert data["entries"][0]["rank"] == 1
    assert data["entries"][0]["score"] == 500
    assert data["user_rank"] == 2  # User2 is rank 2
    assert data["user_score"] == 400  # User2's score
    assert data["total_players"] == 5
    assert "period_start" in data
    assert "period_end" in data

def test_get_weekly_leaderboard(test_db, user_token):
    """
    Test getting the weekly leaderboard.
    
    This test verifies that an authenticated user can retrieve
    the weekly leaderboard with player rankings.
    """
    response = client.get(
        "/api/leaderboard/weekly",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    # Check response status code
    assert response.status_code == 200
    
    # Check response data
    data = response.json()
    assert data["leaderboard_type"] == LeaderboardType.WEEKLY
    assert isinstance(data["entries"], list)
    assert len(data["entries"]) == 5
    assert data["entries"][0]["rank"] == 1
    assert data["entries"][0]["score"] == 2000
    assert data["user_rank"] == 2  # User2 is rank 2
    assert data["user_score"] == 1700  # User2's score
    assert data["total_players"] == 5
    assert "period_start" in data
    assert "period_end" in data

def test_get_monthly_leaderboard(test_db, user_token):
    """
    Test getting the monthly leaderboard.
    
    This test verifies that an authenticated user can retrieve
    the monthly leaderboard with player rankings.
    """
    response = client.get(
        "/api/leaderboard/monthly",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    # Check response status code
    assert response.status_code == 200
    
    # Check response data
    data = response.json()
    assert data["leaderboard_type"] == LeaderboardType.MONTHLY
    assert isinstance(data["entries"], list)
    assert len(data["entries"]) == 5
    assert data["entries"][0]["rank"] == 1
    assert data["entries"][0]["score"] == 5000
    assert data["user_rank"] == 2  # User2 is rank 2
    assert data["user_score"] == 4500  # User2's score
    assert data["total_players"] == 5
    assert "period_start" in data
    assert "period_end" in data

def test_get_user_ranking(test_db, user_token):
    """
    Test getting a user's ranking across all leaderboards.
    
    This test verifies that a user can retrieve their position
    on all leaderboards.
    """
    response = client.get(
        "/api/leaderboard/user/ranking",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    # Check response status code
    assert response.status_code == 200
    
    # Check response data
    data = response.json()
    assert data["global_rank"] == 2
    assert data["global_score"] == 800
    assert data["daily_rank"] == 2
    assert data["daily_score"] == 400
    assert data["weekly_rank"] == 2
    assert data["weekly_score"] == 1700
    assert data["monthly_rank"] == 2
    assert data["monthly_score"] == 4500
    assert data["total_players"] == 5

def test_update_ranks(test_db, admin_token):
    """
    Test updating the ranks for a leaderboard.
    
    This test verifies that an admin user can update the ranks
    for a leaderboard based on scores.
    """
    response = client.post(
        "/api/leaderboard/update-ranks",
        params={"leaderboard_type": LeaderboardType.GLOBAL},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    # Check response status code
    assert response.status_code == 200
    
    # Check response data
    data = response.json()
    assert "message" in data
    assert "Updated" in data["message"]
    assert "global" in data["message"].lower()
