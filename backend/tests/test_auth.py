import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.session import get_db
from app.models.user import Base, User
from app.core.auth import get_password_hash

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

# Configure pytest-asyncio to use function scope for fixtures
# This addresses the deprecation warning
def pytest_configure(config):
    """
    Configure pytest-asyncio to use function scope for fixtures.
    
    This function sets the asyncio_default_fixture_loop_scope to function,
    which is recommended for future compatibility with pytest-asyncio.
    """
    config.addinivalue_line(
        "asyncio_default_fixture_loop_scope", "function"
    )

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
    
    # Create a test user
    db = TestingSessionLocal()
    hashed_password = get_password_hash("testpassword")
    test_user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=hashed_password,
        display_name="Test User",
        is_active=True
    )
    db.add(test_user)
    db.commit()
    db.close()
    
    # Run the test
    yield
    
    # Drop tables
    Base.metadata.drop_all(bind=engine)

# Use pytest_asyncio.fixture instead of pytest.fixture for async fixtures
@pytest_asyncio.fixture
async def client():
    """
    Create an async test client for FastAPI.
    
    This fixture provides an async client that can be used to make
    requests to the FastAPI application during tests.
    
    Returns:
        AsyncClient: An async client for testing FastAPI endpoints
    """
    # Use async with to properly manage the client lifecycle
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac  # This yields the actual client, not an async generator

@pytest.mark.asyncio
async def test_register_user(test_db, client):
    """
    Test user registration endpoint.
    
    This test verifies that a new user can be registered
    and that the response contains the expected user data.
    """
    response = await client.post(
        "/api/auth/register",
        json={
            "username": "newuser",
            "email": "new@example.com",
            "password": "newpassword",
            "display_name": "New User"
        }
    )
    
    # Check response status code
    assert response.status_code == 201
    
    # Check response data
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "new@example.com"
    assert data["display_name"] == "New User"
    assert "id" in data
    assert "hashed_password" not in data

@pytest.mark.asyncio
async def test_login_user(test_db, client):
    """
    Test user login endpoint.
    
    This test verifies that a user can log in with valid credentials
    and that the response contains an access token.
    """
    # Login with valid credentials
    response = await client.post(
        "/api/auth/login",
        data={
            "username": "testuser",
            "password": "testpassword"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    # Check response status code
    assert response.status_code == 200
    
    # Check response data
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_invalid_credentials(test_db, client):
    """
    Test login with invalid credentials.
    
    This test verifies that the login endpoint returns an error
    when invalid credentials are provided.
    """
    # Login with invalid password
    response = await client.post(
        "/api/auth/login",
        data={
            "username": "testuser",
            "password": "wrongpassword"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    # Check response status code
    assert response.status_code == 401
    
    # Check error message
    data = response.json()
    assert "detail" in data
    assert "Incorrect username or password" in data["detail"]

@pytest.mark.asyncio
async def test_get_current_user(test_db, client):
    """
    Test getting the current user.
    
    This test verifies that an authenticated user can retrieve
    their own user profile.
    """
    # Login to get access token
    login_response = await client.post(
        "/api/auth/login",
        data={
            "username": "testuser",
            "password": "testpassword"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    access_token = login_response.json()["access_token"]
    
    # Get current user with token
    response = await client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    # Check response status code
    assert response.status_code == 200
    
    # Check response data
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert data["display_name"] == "Test User"
