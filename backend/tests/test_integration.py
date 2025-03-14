import pytest
import requests
import time
import subprocess
import os
import signal
import sys
from pathlib import Path

"""
Integration test script to verify communication between frontend and backend.

This script:
1. Starts the backend server
2. Makes API requests to verify backend functionality
3. Tests CORS headers to ensure frontend can communicate with backend
4. Shuts down the server after tests

Note: This test assumes both frontend and backend are properly configured.
"""

# Configuration
BACKEND_URL = "http://localhost:8000"
API_PREFIX = "/api"

def is_port_in_use(port):
    """
    Check if a port is already in use.
    
    Args:
        port: Port number to check
        
    Returns:
        True if port is in use, False otherwise
    """
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

@pytest.fixture(scope="module")
def backend_server():
    """
    Start the backend server for testing and shut it down after tests.
    
    This fixture starts the backend server using uvicorn and ensures
    it's properly terminated after tests are complete.
    
    Yields:
        Process object for the backend server
    """
    # Check if port is already in use
    if is_port_in_use(8000):
        pytest.skip("Port 8000 is already in use. Cannot start backend server for testing.")
    
    # Get the backend directory
    backend_dir = Path(__file__).parent.parent
    
    # Start the backend server
    if sys.platform.startswith('win'):
        # Windows uses different process creation
        server = subprocess.Popen(
            ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"],
            cwd=str(backend_dir),
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
        )
    else:
        # Unix-like systems
        server = subprocess.Popen(
            ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"],
            cwd=str(backend_dir),
            preexec_fn=os.setsid
        )
    
    # Wait for server to start
    time.sleep(3)
    
    # Run the tests
    yield server
    
    # Terminate the server
    if sys.platform.startswith('win'):
        # Windows
        os.kill(server.pid, signal.CTRL_BREAK_EVENT)
    else:
        # Unix-like systems
        os.killpg(os.getpgid(server.pid), signal.SIGTERM)
    
    server.wait()

def test_backend_health(backend_server):
    """
    Test that the backend server is running and responding.
    
    This test verifies that the backend server is running and
    responding to basic requests.
    """
    response = requests.get(f"{BACKEND_URL}/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_cors_headers(backend_server):
    """
    Test that CORS headers are properly set.
    
    This test verifies that the backend server is properly configured
    to allow cross-origin requests from the frontend.
    """
    # Send OPTIONS request to simulate CORS preflight
    headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Content-Type, Authorization"
    }
    response = requests.options(f"{BACKEND_URL}{API_PREFIX}/auth/login", headers=headers)
    
    # Check CORS headers
    assert response.status_code == 200
    assert "Access-Control-Allow-Origin" in response.headers
    assert "Access-Control-Allow-Methods" in response.headers
    assert "Access-Control-Allow-Headers" in response.headers
    
    # Check allowed origins
    assert "http://localhost:3000" in response.headers["Access-Control-Allow-Origin"]

def test_api_endpoints(backend_server):
    """
    Test that API endpoints are accessible.
    
    This test verifies that the API endpoints required by the frontend
    are accessible and responding with the expected status codes.
    """
    # Test authentication endpoints
    auth_response = requests.post(
        f"{BACKEND_URL}{API_PREFIX}/auth/login",
        data={"username": "testuser", "password": "wrongpassword"}
    )
    assert auth_response.status_code in [401, 422]  # Either unauthorized or validation error
    
    # Test challenges endpoint (should require authentication)
    challenges_response = requests.get(f"{BACKEND_URL}{API_PREFIX}/challenges/")
    assert challenges_response.status_code in [401, 403]  # Should require authentication
    
    # Test leaderboard endpoint (should require authentication)
    leaderboard_response = requests.get(f"{BACKEND_URL}{API_PREFIX}/leaderboard/global")
    assert leaderboard_response.status_code in [401, 403]  # Should require authentication

def test_register_and_login_flow(backend_server):
    """
    Test the user registration and login flow.
    
    This test verifies that a user can register, login, and access
    protected resources using the JWT token.
    """
    # Register a new user
    register_data = {
        "username": "integrationtestuser",
        "email": "integration@test.com",
        "password": "integrationtest",
        "display_name": "Integration Test User"
    }
    register_response = requests.post(
        f"{BACKEND_URL}{API_PREFIX}/auth/register",
        json=register_data
    )
    
    # Check if registration succeeded or user already exists
    if register_response.status_code == 201:
        assert register_response.json()["username"] == register_data["username"]
    elif register_response.status_code == 400:
        # User might already exist, which is fine for this test
        pass
    else:
        # Unexpected status code
        assert False, f"Unexpected status code: {register_response.status_code}"
    
    # Login with the new user
    login_data = {
        "username": register_data["username"],
        "password": register_data["password"]
    }
    login_response = requests.post(
        f"{BACKEND_URL}{API_PREFIX}/auth/login",
        data=login_data
    )
    
    # Check login response
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()
    assert login_response.json()["token_type"] == "bearer"
    
    # Get the token
    token = login_response.json()["access_token"]
    
    # Access protected resource
    headers = {"Authorization": f"Bearer {token}"}
    me_response = requests.get(
        f"{BACKEND_URL}{API_PREFIX}/users/me",
        headers=headers
    )
    
    # Check protected resource response
    assert me_response.status_code == 200
    assert me_response.json()["username"] == register_data["username"]
