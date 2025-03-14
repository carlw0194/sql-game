"""
Seed Payment Data for SQL Game

This module provides functions to seed the database with initial payment-related data,
including pricing plans for the freemium model.
"""

from sqlalchemy.orm import Session
import logging
from app.models.payment import PricingPlan, SubscriptionTier

# Set up logging
logger = logging.getLogger(__name__)

def seed_pricing_plans(db: Session):
    """
    Seed the database with initial pricing plans.
    
    Creates the Free, Premium, and Enterprise subscription tiers with their
    respective features and pricing.
    
    Args:
        db: Database session
    """
    # Check if pricing plans already exist
    existing_plans = db.query(PricingPlan).count()
    if existing_plans > 0:
        logger.info("Pricing plans already exist. Skipping seeding.")
        return
    
    # Define pricing plans
    plans = [
        # Free tier
        PricingPlan(
            name="Free",
            tier=SubscriptionTier.FREE,
            price_monthly=0.0,
            price_yearly=0.0,
            description="Basic access to SQL learning scenarios",
            features=[
                "Access to 10 basic SQL challenges",
                "Basic leaderboard access",
                "Limited progress tracking",
                "Community forum access"
            ],
            is_active=True
        ),
        
        # Premium tier
        PricingPlan(
            name="Premium",
            tier=SubscriptionTier.PREMIUM,
            price_monthly=9.99,
            price_yearly=99.99,  # ~2 months free with yearly subscription
            description="Full access to all SQL learning content and features",
            features=[
                "Access to all SQL challenges and scenarios",
                "Advanced leaderboard features",
                "Detailed progress tracking and analytics",
                "Priority community support",
                "Downloadable resources and cheat sheets",
                "No advertisements"
            ],
            is_active=True
        ),
        
        # Enterprise tier
        PricingPlan(
            name="Enterprise",
            tier=SubscriptionTier.ENTERPRISE,
            price_monthly=29.99,
            price_yearly=299.99,  # ~2 months free with yearly subscription
            description="Team-based SQL learning with administrative features",
            features=[
                "All Premium features",
                "Team management dashboard",
                "Progress tracking for team members",
                "Custom SQL challenges for your organization",
                "Team leaderboards",
                "Dedicated support",
                "API access for integration with your systems",
                "Bulk user management"
            ],
            is_active=True
        )
    ]
    
    # Add plans to database
    for plan in plans:
        db.add(plan)
    
    try:
        db.commit()
        logger.info(f"Successfully seeded {len(plans)} pricing plans")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding pricing plans: {str(e)}")
        raise
