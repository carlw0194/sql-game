"""
Payment API Endpoints for SQL Game

This module defines the API endpoints for payment processing, subscription management,
and payment method operations. It implements the freemium payment strategy with support
for multiple payment methods.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, Union
import logging

from app.database.session import get_db
from app.services.payment_service import PaymentService
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.payment import (
    PaymentMethodBase, CardPaymentMethodCreate, MobileMoneyPaymentMethodCreate,
    PayoneerPaymentMethodCreate, PaymentMethodCreate, PaymentMethodResponse,
    PricingPlanResponse, SubscriptionCreate, SubscriptionResponse,
    TransactionCreate, TransactionResponse
)

# Set up logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# ==================== Payment Method Endpoints ====================

@router.post("/payment-methods/card", response_model=PaymentMethodResponse)
def create_card_payment_method(
    payment_data: CardPaymentMethodCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new credit/debit card payment method.
    
    Securely stores card information with only the last four digits visible.
    Sets this method as default if it's the user's first payment method.
    
    Args:
        payment_data: Card payment method details
        db: Database session
        current_user: Currently authenticated user
        
    Returns:
        The created PaymentMethod object
    """
    try:
        payment_method = PaymentService.create_card_payment_method(
            db=db,
            user_id=current_user.id,
            payment_data=payment_data
        )
        return payment_method
    except Exception as e:
        logger.error(f"Error creating card payment method: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment method"
        )

@router.post("/payment-methods/mobile-money", response_model=PaymentMethodResponse)
def create_mobile_money_payment_method(
    payment_data: MobileMoneyPaymentMethodCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new mobile money payment method.
    
    Supports MTN Mobile Money and Orange Money payment methods.
    
    Args:
        payment_data: Mobile money payment method details
        db: Database session
        current_user: Currently authenticated user
        
    Returns:
        The created PaymentMethod object
    """
    try:
        payment_method = PaymentService.create_mobile_money_payment_method(
            db=db,
            user_id=current_user.id,
            payment_data=payment_data
        )
        return payment_method
    except Exception as e:
        logger.error(f"Error creating mobile money payment method: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment method"
        )

@router.post("/payment-methods/payoneer", response_model=PaymentMethodResponse)
def create_payoneer_payment_method(
    payment_data: PayoneerPaymentMethodCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new Payoneer payment method.
    
    Args:
        payment_data: Payoneer payment method details
        db: Database session
        current_user: Currently authenticated user
        
    Returns:
        The created PaymentMethod object
    """
    try:
        payment_method = PaymentService.create_payoneer_payment_method(
            db=db,
            user_id=current_user.id,
            payment_data=payment_data
        )
        return payment_method
    except Exception as e:
        logger.error(f"Error creating Payoneer payment method: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment method"
        )

@router.get("/payment-methods", response_model=List[PaymentMethodResponse])
def get_payment_methods(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all payment methods for the current user.
    
    Args:
        db: Database session
        current_user: Currently authenticated user
        
    Returns:
        List of PaymentMethod objects
    """
    try:
        payment_methods = PaymentService.get_user_payment_methods(
            db=db,
            user_id=current_user.id
        )
        return payment_methods
    except Exception as e:
        logger.error(f"Error getting payment methods: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get payment methods"
        )

@router.delete("/payment-methods/{payment_method_id}")
def delete_payment_method(
    payment_method_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a payment method.
    
    Args:
        payment_method_id: ID of the payment method to delete
        db: Database session
        current_user: Currently authenticated user
        
    Returns:
        Success message
    """
    try:
        PaymentService.delete_payment_method(
            db=db,
            user_id=current_user.id,
            payment_method_id=payment_method_id
        )
        return {"message": "Payment method deleted successfully"}
    except HTTPException as e:
        # Re-raise HTTP exceptions from the service
        raise e
    except Exception as e:
        logger.error(f"Error deleting payment method: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete payment method"
        )

@router.put("/payment-methods/{payment_method_id}/default", response_model=PaymentMethodResponse)
def set_default_payment_method(
    payment_method_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Set a payment method as the default for the current user.
    
    Args:
        payment_method_id: ID of the payment method to set as default
        db: Database session
        current_user: Currently authenticated user
        
    Returns:
        The updated PaymentMethod object
    """
    try:
        payment_method = PaymentService.set_default_payment_method(
            db=db,
            user_id=current_user.id,
            payment_method_id=payment_method_id
        )
        return payment_method
    except HTTPException as e:
        # Re-raise HTTP exceptions from the service
        raise e
    except Exception as e:
        logger.error(f"Error setting default payment method: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to set default payment method"
        )

# ==================== Pricing Plan Endpoints ====================

@router.get("/pricing-plans", response_model=List[PricingPlanResponse])
def get_pricing_plans(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """
    Get all pricing plans.
    
    Args:
        active_only: If True, only return active pricing plans
        db: Database session
        
    Returns:
        List of PricingPlan objects
    """
    try:
        pricing_plans = PaymentService.get_pricing_plans(
            db=db,
            active_only=active_only
        )
        return pricing_plans
    except Exception as e:
        logger.error(f"Error getting pricing plans: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get pricing plans"
        )

@router.get("/pricing-plans/{plan_id}", response_model=PricingPlanResponse)
def get_pricing_plan(
    plan_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific pricing plan by ID.
    
    Args:
        plan_id: ID of the pricing plan
        db: Database session
        
    Returns:
        PricingPlan object
    """
    try:
        pricing_plan = PaymentService.get_pricing_plan(
            db=db,
            plan_id=plan_id
        )
        
        if not pricing_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pricing plan not found"
            )
            
        return pricing_plan
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        logger.error(f"Error getting pricing plan: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get pricing plan"
        )

# ==================== Subscription Endpoints ====================

@router.post("/subscriptions", response_model=SubscriptionResponse)
def create_subscription(
    subscription_data: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new subscription for the current user.
    
    Processes the initial payment and sets up the subscription.
    
    Args:
        subscription_data: Subscription details
        db: Database session
        current_user: Currently authenticated user
        
    Returns:
        The created Subscription object
    """
    try:
        subscription = PaymentService.create_subscription(
            db=db,
            user_id=current_user.id,
            subscription_data=subscription_data
        )
        return subscription
    except HTTPException as e:
        # Re-raise HTTP exceptions from the service
        raise e
    except Exception as e:
        logger.error(f"Error creating subscription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create subscription"
        )

@router.put("/subscriptions/{subscription_id}/cancel", response_model=SubscriptionResponse)
def cancel_subscription(
    subscription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cancel a user's subscription.
    
    The subscription will remain active until the end date but will not auto-renew.
    
    Args:
        subscription_id: ID of the subscription to cancel
        db: Database session
        current_user: Currently authenticated user
        
    Returns:
        The updated Subscription object
    """
    try:
        subscription = PaymentService.cancel_subscription(
            db=db,
            user_id=current_user.id,
            subscription_id=subscription_id
        )
        return subscription
    except HTTPException as e:
        # Re-raise HTTP exceptions from the service
        raise e
    except Exception as e:
        logger.error(f"Error canceling subscription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel subscription"
        )

@router.get("/subscriptions", response_model=List[SubscriptionResponse])
def get_subscriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all subscriptions for the current user.
    
    Args:
        db: Database session
        current_user: Currently authenticated user
        
    Returns:
        List of Subscription objects
    """
    try:
        subscriptions = PaymentService.get_user_subscriptions(
            db=db,
            user_id=current_user.id
        )
        return subscriptions
    except HTTPException as e:
        # Re-raise HTTP exceptions from the service
        raise e
    except Exception as e:
        logger.error(f"Error getting subscriptions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get subscriptions"
        )

# ==================== Transaction Endpoints ====================

@router.post("/transactions", response_model=TransactionResponse)
def create_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Process a one-time payment not tied to a subscription.
    
    Args:
        transaction_data: Payment details
        db: Database session
        current_user: Currently authenticated user
        
    Returns:
        The created Transaction object
    """
    try:
        transaction = PaymentService.process_one_time_payment(
            db=db,
            user_id=current_user.id,
            payment_data=transaction_data
        )
        return transaction
    except HTTPException as e:
        # Re-raise HTTP exceptions from the service
        raise e
    except Exception as e:
        logger.error(f"Error processing payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process payment"
        )

@router.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get transaction history for the current user.
    
    Args:
        limit: Maximum number of transactions to return
        offset: Number of transactions to skip
        db: Database session
        current_user: Currently authenticated user
        
    Returns:
        List of Transaction objects
    """
    try:
        transactions = PaymentService.get_user_transactions(
            db=db,
            user_id=current_user.id,
            limit=limit,
            offset=offset
        )
        return transactions
    except HTTPException as e:
        # Re-raise HTTP exceptions from the service
        raise e
    except Exception as e:
        logger.error(f"Error getting transactions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get transactions"
        )
