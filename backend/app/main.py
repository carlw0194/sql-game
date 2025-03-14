from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

# Import our modules
from app.database.session import get_db
from app.api import users, challenges, leaderboard, auth

# Create FastAPI app
app = FastAPI(
    title="SQL Scenario Game API",
    description="Backend API for the SQL Scenario game - an interactive SQL learning platform",
    version="0.1.0"
)

# Configure CORS
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:4173",  # Vite preview
    "http://localhost:3000",  # Alternative frontend port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(challenges.router, prefix="/api/challenges", tags=["Challenges"])
app.include_router(leaderboard.router, prefix="/api/leaderboard", tags=["Leaderboard"])

# Health check endpoint for testing
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring and testing.
    
    This endpoint returns a simple status message to verify that
    the API server is running and responding to requests.
    
    Returns:
        dict: A dictionary with a status message
    """
    return {"status": "ok", "message": "SQL Scenario Game API is running"}

@app.get("/")
def read_root():
    """
    Root endpoint that returns a welcome message and basic API information.
    This serves as a health check and API status indicator.
    """
    return {
        "message": "Welcome to SQL Scenario Game API",
        "status": "online",
        "docs_url": "/docs",
        "version": "0.1.0"
    }
