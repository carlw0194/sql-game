# SQL Scenario Game - Testing Guide

This document provides instructions for running tests for the SQL Scenario Game project, including backend unit tests and frontend-backend integration tests.

## Prerequisites

Before running the tests, ensure you have the following installed:

- Python 3.8 or higher
- Node.js 14 or higher
- npm 6 or higher

## Backend Testing

The backend tests verify that all API endpoints and services are functioning correctly.

### Installing Dependencies

First, install all required Python dependencies:

```powershell
cd backend
pip install -r requirements.txt
```

### Running Backend Tests

You can run all backend tests using the provided PowerShell script:

```powershell
.\run_backend_tests.ps1
```

This script will run the following test suites:

1. Authentication Tests (`test_auth.py`)
2. Challenge Tests (`test_challenges.py`)
3. Leaderboard Tests (`test_leaderboard.py`)
4. Integration Tests (`test_integration.py`)

### Running Individual Test Files

To run a specific test file, use the following command:

```powershell
cd backend
pytest -xvs tests/test_auth.py
```

Replace `test_auth.py` with the specific test file you want to run.

## Frontend-Backend Integration Testing

To test the integration between the frontend and backend, we've created a special API test component and integration testing scripts.

### Installing Frontend Dependencies

First, install all required Node.js dependencies:

```powershell
cd frontend
npm install
```

### Running the Integration Test

You can run the complete integration test using the provided PowerShell script:

```powershell
.\test_integration.ps1
```

This script will:

1. Run the backend tests
2. Start the backend server in a new window
3. Start the frontend development server in a new window
4. Open the API test page in your browser

### Manual Testing

If you prefer to test manually:

1. Start the backend server:
   ```powershell
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. In a separate terminal, start the frontend development server:
   ```powershell
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5173/api-test
   ```

4. Click the "Run API Tests" button to test the connection between the frontend and backend.

## API Test Component

The API Test component (`ApiTest.tsx`) tests the following functionality:

1. User Registration
2. User Login
3. Fetching User Profile
4. Fetching Challenges

The component displays the results of each test, making it easy to verify that the frontend can successfully communicate with the backend.

## Health Check Endpoint

The backend includes a health check endpoint that can be used to verify that the server is running:

```
GET http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "SQL Scenario Game API is running"
}
```

## Troubleshooting

### Module Not Found Errors

If you encounter "Module not found" errors when running the backend tests, try installing the backend package in development mode:

```powershell
cd backend
pip install -e .
```

### CORS Issues

If you encounter CORS issues when testing the frontend-backend integration, ensure that the frontend URL is included in the `allow_origins` list in `backend/app/main.py`.

### Database Connection Issues

If you encounter database connection issues, ensure that the database file exists and has the correct permissions. The default SQLite database file is located at `backend/sql_game.db`.

## Continuous Integration

For automated testing in a CI/CD pipeline, you can use the following commands:

```powershell
# Run backend tests
cd backend
pytest

# Run frontend tests (if implemented)
cd frontend
npm test
```

## Next Steps

After verifying that all tests pass, you can proceed with:

1. Deploying the application
2. Adding more features
3. Implementing additional tests for new functionality

For any questions or issues, please refer to the project documentation or contact the development team.
