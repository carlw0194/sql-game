"""
Payment Service for SQL Game

This module provides services for handling payment processing, subscription management,
and integration with payment gateways. It supports multiple payment methods including
credit/debit cards, mobile money (MTN and Orange Money), and Payoneer.
"""

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from typing import Optional, Dict, Any, List, Union
import logging
from datetime import datetime, timedelta
import json
import uuid

from app.models.payment import (
    PaymentMethod, PricingPlan, Subscription, Transaction,
    PaymentMethodType, PaymentStatus, SubscriptionTier, SubscriptionStatus
)
from app.models.user import User
from app.schemas.payment import (
    CardPaymentMethodCreate, MobileMoneyPaymentMethodCreate, 
    PayoneerPaymentMethodCreate, SubscriptionCreate, TransactionCreate
)

# Set up logging
logger = logging.getLogger(__name__)

class PaymentService:
    """
    Service for handling payment-related operations.
    
    This class provides methods for managing payment methods, processing payments,
    and handling subscriptions in the SQL Game application.
    """
    
    @staticmethod
    def create_card_payment_method(
        db: Session, 
        user_id: int, 
        payment_data: CardPaymentMethodCreate
    ) -> PaymentMethod:
        """
        Create a new credit/debit card payment method for a user.
        
        Securely stores card information with only the last four digits visible.
        Sets this method as default if it's the user's first payment method.
        
        Args:
            db: Database session
            user_id: ID of the user adding the payment method
            payment_data: Card payment method details
            
        Returns:
            The created PaymentMethod object
            
        Raises:
            HTTPException: If user doesn't exist or there's an error creating the payment method
        """
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Extract card details
        card_number = payment_data.card_number.strip()
        card_last_four = card_number[-4:]  # Store only last 4 digits
        
        # Check if this should be the default payment method
        is_default = payment_data.is_default
        if not is_default:
            # If user has no payment methods, make this the default
            existing_methods = db.query(PaymentMethod).filter(
                PaymentMethod.user_id == user_id
            ).count()
            
            if existing_methods == 0:
                is_default = True
        
        # If setting as default, unset any existing default
        if is_default:
            db.query(PaymentMethod).filter(
                PaymentMethod.user_id == user_id,
                PaymentMethod.is_default == True
            ).update({"is_default": False})
        
        # Create new payment method
        payment_method = PaymentMethod(
            user_id=user_id,
            method_type=payment_data.method_type,
            card_last_four=card_last_four,
            card_expiry_month=payment_data.card_expiry_month,
            card_expiry_year=payment_data.card_expiry_year,
            is_default=is_default
        )
        
        try:
            db.add(payment_method)
            db.commit()
            db.refresh(payment_method)
            return payment_method
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error creating card payment method: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create payment method"
            )
    
    @staticmethod
    def create_mobile_money_payment_method(
        db: Session, 
        user_id: int, 
        payment_data: MobileMoneyPaymentMethodCreate
    ) -> PaymentMethod:
        """
        Create a new mobile money payment method for a user.
        
        Supports MTN Mobile Money and Orange Money payment methods.
        
        Args:
            db: Database session
            user_id: ID of the user adding the payment method
            payment_data: Mobile money payment method details
            
        Returns:
            The created PaymentMethod object
            
        Raises:
            HTTPException: If user doesn't exist or there's an error creating the payment method
        """
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if this should be the default payment method
        is_default = payment_data.is_default
        if not is_default:
            # If user has no payment methods, make this the default
            existing_methods = db.query(PaymentMethod).filter(
                PaymentMethod.user_id == user_id
            ).count()
            
            if existing_methods == 0:
                is_default = True
        
        # If setting as default, unset any existing default
        if is_default:
            db.query(PaymentMethod).filter(
                PaymentMethod.user_id == user_id,
                PaymentMethod.is_default == True
            ).update({"is_default": False})
        
        # Create new payment method
        payment_method = PaymentMethod(
            user_id=user_id,
            method_type=payment_data.method_type,
            mobile_number=payment_data.mobile_number,
            is_default=is_default
        )
        
        try:
            db.add(payment_method)
            db.commit()
            db.refresh(payment_method)
            return payment_method
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error creating mobile money payment method: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create payment method"
            )
    
    @staticmethod
    def create_payoneer_payment_method(
        db: Session, 
        user_id: int, 
        payment_data: PayoneerPaymentMethodCreate
    ) -> PaymentMethod:
        """
        Create a new Payoneer payment method for a user.
        
        Args:
            db: Database session
            user_id: ID of the user adding the payment method
            payment_data: Payoneer payment method details
            
        Returns:
            The created PaymentMethod object
            
        Raises:
            HTTPException: If user doesn't exist or there's an error creating the payment method
        """
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if this should be the default payment method
        is_default = payment_data.is_default
        if not is_default:
            # If user has no payment methods, make this the default
            existing_methods = db.query(PaymentMethod).filter(
                PaymentMethod.user_id == user_id
            ).count()
            
            if existing_methods == 0:
                is_default = True
        
        # If setting as default, unset any existing default
        if is_default:
            db.query(PaymentMethod).filter(
                PaymentMethod.user_id == user_id,
                PaymentMethod.is_default == True
            ).update({"is_default": False})
        
        # Create new payment method
        payment_method = PaymentMethod(
            user_id=user_id,
            method_type=payment_data.method_type,
            payoneer_email=payment_data.payoneer_email,
            is_default=is_default
        )
        
        try:
            db.add(payment_method)
            db.commit()
            db.refresh(payment_method)
            return payment_method
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error creating Payoneer payment method: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create payment method"
            )
    
    @staticmethod
    def get_user_payment_methods(db: Session, user_id: int) -> List[PaymentMethod]:
        """
        Get all payment methods for a user.
        
        Args:
            db: Database session
            user_id: ID of the user
            
        Returns:
            List of PaymentMethod objects
            
        Raises:
            HTTPException: If user doesn't exist
        """
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get payment methods
        payment_methods = db.query(PaymentMethod).filter(
            PaymentMethod.user_id == user_id
        ).all()
        
        return payment_methods
    
    @staticmethod
    def delete_payment_method(db: Session, user_id: int, payment_method_id: int) -> bool:
        """
        Delete a payment method.
        
        Args:
            db: Database session
            user_id: ID of the user
            payment_method_id: ID of the payment method to delete
            
        Returns:
            True if successful, False otherwise
            
        Raises:
            HTTPException: If user or payment method doesn't exist, or if it's the only payment method
                          for a user with active subscriptions
        """
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if payment method exists and belongs to user
        payment_method = db.query(PaymentMethod).filter(
            PaymentMethod.id == payment_method_id,
            PaymentMethod.user_id == user_id
        ).first()
        
        if not payment_method:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment method not found or doesn't belong to user"
            )
        
        # Check if it's the default method and user has active subscriptions
        if payment_method.is_default:
            # Count other payment methods
            other_methods_count = db.query(PaymentMethod).filter(
                PaymentMethod.user_id == user_id,
                PaymentMethod.id != payment_method_id
            ).count()
            
            # Check for active subscriptions
            active_subs = db.query(Subscription).filter(
                Subscription.user_id == user_id,
                Subscription.status == SubscriptionStatus.ACTIVE
            ).count()
            
            if other_methods_count == 0 and active_subs > 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot delete the only payment method when user has active subscriptions"
                )
        
        try:
            # Delete the payment method
            db.delete(payment_method)
            
            # If it was the default and there are other methods, set a new default
            if payment_method.is_default:
                other_method = db.query(PaymentMethod).filter(
                    PaymentMethod.user_id == user_id
                ).first()
                
                if other_method:
                    other_method.is_default = True
            
            db.commit()
            return True
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error deleting payment method: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete payment method"
            )
    
    @staticmethod
    def set_default_payment_method(db: Session, user_id: int, payment_method_id: int) -> PaymentMethod:
        """
        Set a payment method as the default for a user.
        
        Args:
            db: Database session
            user_id: ID of the user
            payment_method_id: ID of the payment method to set as default
            
        Returns:
            The updated PaymentMethod object
            
        Raises:
            HTTPException: If user or payment method doesn't exist
        """
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if payment method exists and belongs to user
        payment_method = db.query(PaymentMethod).filter(
            PaymentMethod.id == payment_method_id,
            PaymentMethod.user_id == user_id
        ).first()
        
        if not payment_method:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment method not found or doesn't belong to user"
            )
        
        try:
            # Unset any existing default
            db.query(PaymentMethod).filter(
                PaymentMethod.user_id == user_id,
                PaymentMethod.is_default == True
            ).update({"is_default": False})
            
            # Set new default
            payment_method.is_default = True
            
            db.commit()
            db.refresh(payment_method)
            return payment_method
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error setting default payment method: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to set default payment method"
            )
    
    @staticmethod
    def get_pricing_plans(db: Session, active_only: bool = True) -> List[PricingPlan]:
        """
        Get all pricing plans.
        
        Args:
            db: Database session
            active_only: If True, only return active pricing plans
            
        Returns:
            List of PricingPlan objects
        """
        query = db.query(PricingPlan)
        
        if active_only:
            query = query.filter(PricingPlan.is_active == True)
        
        return query.all()
    
    @staticmethod
    def get_pricing_plan(db: Session, plan_id: int) -> Optional[PricingPlan]:
        """
        Get a specific pricing plan by ID.
        
        Args:
            db: Database session
            plan_id: ID of the pricing plan
            
        Returns:
            PricingPlan object if found, None otherwise
        """
        return db.query(PricingPlan).filter(PricingPlan.id == plan_id).first()
    
    @staticmethod
    def create_subscription(
        db: Session, 
        user_id: int, 
        subscription_data: SubscriptionCreate
    ) -> Subscription:
        """
        Create a new subscription for a user.
        
        Processes the initial payment and sets up the subscription.
        
        Args:
            db: Database session
            user_id: ID of the user
            subscription_data: Subscription details
            
        Returns:
            The created Subscription object
            
        Raises:
            HTTPException: If user, plan, or payment method doesn't exist, or if payment fails
        """
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if plan exists and is active
        plan = db.query(PricingPlan).filter(
            PricingPlan.id == subscription_data.plan_id,
            PricingPlan.is_active == True
        ).first()
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pricing plan not found or inactive"
            )
        
        # Check if payment method exists and belongs to user
        payment_method = db.query(PaymentMethod).filter(
            PaymentMethod.id == subscription_data.payment_method_id,
            PaymentMethod.user_id == user_id
        ).first()
        
        if not payment_method:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment method not found or doesn't belong to user"
            )
        
        # Check if user already has an active subscription to this plan
        existing_sub = db.query(Subscription).filter(
            Subscription.user_id == user_id,
            Subscription.plan_id == plan.id,
            Subscription.status == SubscriptionStatus.ACTIVE
        ).first()
        
        if existing_sub:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has an active subscription to this plan"
            )
        
        # Calculate subscription details
        start_date = datetime.utcnow()
        
        # Set end date based on billing cycle
        if subscription_data.billing_cycle == "monthly":
            end_date = start_date + timedelta(days=30)
            amount = plan.price_monthly
        else:  # yearly
            end_date = start_date + timedelta(days=365)
            amount = plan.price_yearly
        
        try:
            # Create subscription
            subscription = Subscription(
                user_id=user_id,
                plan_id=plan.id,
                status=SubscriptionStatus.ACTIVE,
                start_date=start_date,
                end_date=end_date,
                is_auto_renew=subscription_data.is_auto_renew
            )
            
            db.add(subscription)
            db.flush()  # Get subscription ID without committing
            
            # Process payment
            # In a real system, this would integrate with a payment gateway
            transaction = Transaction(
                user_id=user_id,
                payment_method_id=payment_method.id,
                subscription_id=subscription.id,
                transaction_id=str(uuid.uuid4()),
                amount=amount,
                currency="USD",
                status=PaymentStatus.COMPLETED,
                description=f"{plan.name} Subscription - {subscription_data.billing_cycle}"
            )
            
            db.add(transaction)
            db.commit()
            db.refresh(subscription)
            
            return subscription
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error creating subscription: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create subscription"
            )
    
    @staticmethod
    def cancel_subscription(db: Session, user_id: int, subscription_id: int) -> Subscription:
        """
        Cancel a user's subscription.
        
        The subscription will remain active until the end date but will not auto-renew.
        
        Args:
            db: Database session
            user_id: ID of the user
            subscription_id: ID of the subscription to cancel
            
        Returns:
            The updated Subscription object
            
        Raises:
            HTTPException: If user or subscription doesn't exist
        """
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if subscription exists and belongs to user
        subscription = db.query(Subscription).filter(
            Subscription.id == subscription_id,
            Subscription.user_id == user_id
        ).first()
        
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subscription not found or doesn't belong to user"
            )
        
        # Check if subscription is already canceled
        if subscription.status == SubscriptionStatus.CANCELED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Subscription is already canceled"
            )
        
        try:
            # Update subscription
            subscription.status = SubscriptionStatus.CANCELED
            subscription.is_auto_renew = False
            
            db.commit()
            db.refresh(subscription)
            
            return subscription
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error canceling subscription: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to cancel subscription"
            )
    
    @staticmethod
    def get_user_subscriptions(db: Session, user_id: int) -> List[Subscription]:
        """
        Get all subscriptions for a user.
        
        Args:
            db: Database session
            user_id: ID of the user
            
        Returns:
            List of Subscription objects
            
        Raises:
            HTTPException: If user doesn't exist
        """
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get subscriptions
        subscriptions = db.query(Subscription).filter(
            Subscription.user_id == user_id
        ).all()
        
        return subscriptions
    
    @staticmethod
    def get_user_transactions(
        db: Session, 
        user_id: int, 
        limit: int = 10, 
        offset: int = 0
    ) -> List[Transaction]:
        """
        Get transaction history for a user.
        
        Args:
            db: Database session
            user_id: ID of the user
            limit: Maximum number of transactions to return
            offset: Number of transactions to skip
            
        Returns:
            List of Transaction objects
            
        Raises:
            HTTPException: If user doesn't exist
        """
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get transactions
        transactions = db.query(Transaction).filter(
            Transaction.user_id == user_id
        ).order_by(
            Transaction.created_at.desc()
        ).offset(offset).limit(limit).all()
        
        return transactions
    
    @staticmethod
    def process_one_time_payment(
        db: Session, 
        user_id: int, 
        payment_data: TransactionCreate
    ) -> Transaction:
        """
        Process a one-time payment not tied to a subscription.
        
        Args:
            db: Database session
            user_id: ID of the user
            payment_data: Payment details
            
        Returns:
            The created Transaction object
            
        Raises:
            HTTPException: If user or payment method doesn't exist, or if payment fails
        """
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if payment method exists and belongs to user
        payment_method = db.query(PaymentMethod).filter(
            PaymentMethod.id == payment_data.payment_method_id,
            PaymentMethod.user_id == user_id
        ).first()
        
        if not payment_method:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment method not found or doesn't belong to user"
            )
        
        try:
            # Process payment
            # In a real system, this would integrate with a payment gateway
            transaction = Transaction(
                user_id=user_id,
                payment_method_id=payment_method.id,
                transaction_id=str(uuid.uuid4()),
                amount=payment_data.amount,
                currency=payment_data.currency,
                status=PaymentStatus.COMPLETED,
                description=payment_data.description,
                metadata=json.dumps(payment_data.metadata) if payment_data.metadata else None
            )
            
            db.add(transaction)
            db.commit()
            db.refresh(transaction)
            
            return transaction
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error processing payment: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process payment"
            )
