"""
Main API Router for SQL Game

This module defines the main API router and includes all endpoint routers
from different modules of the application.
"""

from fastapi import APIRouter
from app.api.endpoints import users, challenges, leaderboard, progress, payment

# Create main API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(challenges.router, prefix="/challenges", tags=["challenges"])
api_router.include_router(leaderboard.router, prefix="/leaderboard", tags=["leaderboard"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
api_router.include_router(payment.router, prefix="/payments", tags=["payments"])
