"""
Payment Models for SQL Game

This module defines the database models for handling payments and subscriptions
in the SQL Game application. It includes models for payment methods, transactions,
subscriptions, and pricing plans.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database.session import Base
import enum
from datetime import datetime
import uuid

class PaymentMethodType(str, enum.Enum):
    """
    Enum for different payment method types supported by the application.
    
    Includes credit/debit cards, mobile money options, and other payment platforms.
    """
    VISA = "visa"
    MASTERCARD = "mastercard"
    PAYONEER = "payoneer"
    MTN_MOBILE_MONEY = "mtn_mobile_money"
    ORANGE_MONEY = "orange_money"

class PaymentStatus(str, enum.Enum):
    """
    Enum for tracking the status of payment transactions.
    
    Allows monitoring of payment flow from initiation to completion or failure.
    """
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELED = "canceled"

class SubscriptionTier(str, enum.Enum):
    """
    Enum for different subscription tiers available in the freemium model.
    
    Defines the different levels of access and features available to users.
    """
    FREE = "free"
    BASIC = "basic"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"

class SubscriptionStatus(str, enum.Enum):
    """
    Enum for tracking the status of user subscriptions.
    
    Allows monitoring of subscription lifecycle from active to canceled.
    """
    ACTIVE = "active"
    CANCELED = "canceled"
    EXPIRED = "expired"
    TRIAL = "trial"
    PAST_DUE = "past_due"

class PaymentMethod(Base):
    """
    Model for storing user payment methods.
    
    Securely stores payment method details for recurring billing and one-time payments.
    """
    __tablename__ = "payment_methods"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    method_type = Column(Enum(PaymentMethodType), nullable=False)
    
    # For cards
    card_last_four = Column(String(4), nullable=True)
    card_expiry_month = Column(String(2), nullable=True)
    card_expiry_year = Column(String(4), nullable=True)
    
    # For mobile money
    mobile_number = Column(String(20), nullable=True)
    
    # For Payoneer
    payoneer_email = Column(String(100), nullable=True)
    
    # Common fields
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="payment_methods")
    transactions = relationship("Transaction", back_populates="payment_method")

class PricingPlan(Base):
    """
    Model for storing subscription pricing plans.
    
    Defines the different pricing tiers, features, and billing cycles available.
    """
    __tablename__ = "pricing_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    tier = Column(Enum(SubscriptionTier), nullable=False)
    price_monthly = Column(Float, nullable=False)
    price_yearly = Column(Float, nullable=False)
    description = Column(String(500), nullable=False)
    features = Column(String(1000), nullable=False)  # JSON string of features
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subscriptions = relationship("Subscription", back_populates="pricing_plan")

class Subscription(Base):
    """
    Model for tracking user subscriptions.
    
    Manages the subscription lifecycle including start/end dates, status, and renewal.
    """
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("pricing_plans.id"), nullable=False)
    status = Column(Enum(SubscriptionStatus), nullable=False, default=SubscriptionStatus.ACTIVE)
    start_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=False)
    is_auto_renew = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="subscriptions")
    pricing_plan = relationship("PricingPlan", back_populates="subscriptions")
    transactions = relationship("Transaction", back_populates="subscription")

class Transaction(Base):
    """
    Model for storing payment transactions.
    
    Records all financial transactions including subscription payments, one-time purchases,
    refunds, and other monetary operations.
    """
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    payment_method_id = Column(Integer, ForeignKey("payment_methods.id"), nullable=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=True)
    transaction_id = Column(String(100), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    amount = Column(Float, nullable=False)
    currency = Column(String(3), nullable=False, default="USD")
    status = Column(Enum(PaymentStatus), nullable=False, default=PaymentStatus.PENDING)
    description = Column(String(200), nullable=True)
    metadata = Column(String(1000), nullable=True)  # JSON string for additional data
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="transactions")
    payment_method = relationship("PaymentMethod", back_populates="transactions")
    subscription = relationship("Subscription", back_populates="transactions")
