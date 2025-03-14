"""
Payment Schemas for SQL Game

This module defines Pydantic models for validating payment-related API requests and responses.
These schemas ensure data consistency and provide validation for payment operations.
"""

from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from app.models.payment import PaymentMethodType, PaymentStatus, SubscriptionTier, SubscriptionStatus
import re

# ==================== Payment Method Schemas ====================

class PaymentMethodBase(BaseModel):
    """
    Base schema for payment method data.
    
    Contains common fields shared by all payment method operations.
    """
    method_type: PaymentMethodType
    is_default: bool = False

class CardPaymentMethodCreate(PaymentMethodBase):
    """
    Schema for creating a new card payment method.
    
    Validates credit/debit card details with proper formatting and security.
    """
    method_type: PaymentMethodType = PaymentMethodType.VISA
    card_number: str = Field(..., min_length=13, max_length=19)
    card_holder_name: str = Field(..., min_length=2, max_length=100)
    card_expiry_month: str = Field(..., min_length=1, max_length=2)
    card_expiry_year: str = Field(..., min_length=2, max_length=4)
    card_cvv: str = Field(..., min_length=3, max_length=4)
    
    @validator('card_number')
    def validate_card_number(cls, v):
        """
        Validate credit card number using Luhn algorithm and format.
        
        Ensures the card number follows standard credit card number patterns.
        """
        # Remove any spaces or dashes
        v = re.sub(r'[\s-]', '', v)
        
        # Check if all digits
        if not v.isdigit():
            raise ValueError('Card number must contain only digits')
            
        # Check length (most cards are 13-19 digits)
        if len(v) < 13 or len(v) > 19:
            raise ValueError('Card number must be between 13 and 19 digits')
            
        # Luhn algorithm check
        digits = [int(d) for d in v]
        checksum = 0
        for i, digit in enumerate(reversed(digits)):
            if i % 2 == 1:  # Odd position (0-indexed from right)
                digit *= 2
                if digit > 9:
                    digit -= 9
            checksum += digit
            
        if checksum % 10 != 0:
            raise ValueError('Invalid card number (failed Luhn check)')
            
        return v
    
    @validator('card_expiry_month')
    def validate_expiry_month(cls, v):
        """
        Validate card expiry month.
        
        Ensures the month is between 1 and 12.
        """
        try:
            month = int(v)
            if month < 1 or month > 12:
                raise ValueError('Expiry month must be between 1 and 12')
        except ValueError:
            raise ValueError('Expiry month must be a valid number')
        
        # Format to two digits
        return f"{month:02d}"
    
    @validator('card_expiry_year')
    def validate_expiry_year(cls, v):
        """
        Validate card expiry year.
        
        Ensures the year is not in the past and follows a valid format.
        """
        current_year = datetime.now().year
        
        # Handle 2-digit year
        if len(v) == 2:
            year = int("20" + v)
        else:
            year = int(v)
            
        if year < current_year:
            raise ValueError('Card has expired (year in the past)')
            
        if year > current_year + 20:
            raise ValueError('Expiry year too far in the future')
            
        # Return 4-digit year
        return str(year)
    
    @validator('card_cvv')
    def validate_cvv(cls, v):
        """
        Validate card CVV/security code.
        
        Ensures the CVV is a valid 3 or 4 digit number.
        """
        if not v.isdigit():
            raise ValueError('CVV must contain only digits')
            
        if len(v) not in [3, 4]:
            raise ValueError('CVV must be 3 or 4 digits')
            
        return v

class MobileMoneyPaymentMethodCreate(PaymentMethodBase):
    """
    Schema for creating a new mobile money payment method.
    
    Validates mobile money account details for MTN and Orange Money.
    """
    method_type: PaymentMethodType = Field(..., description="Must be MTN_MOBILE_MONEY or ORANGE_MONEY")
    mobile_number: str = Field(..., min_length=8, max_length=15)
    account_name: str = Field(..., min_length=2, max_length=100)
    
    @validator('method_type')
    def validate_method_type(cls, v):
        """
        Validate that the method type is a mobile money type.
        
        Ensures only mobile money payment types are used with this schema.
        """
        if v not in [PaymentMethodType.MTN_MOBILE_MONEY, PaymentMethodType.ORANGE_MONEY]:
            raise ValueError('Method type must be MTN_MOBILE_MONEY or ORANGE_MONEY for mobile money payments')
        return v
    
    @validator('mobile_number')
    def validate_mobile_number(cls, v):
        """
        Validate mobile number format.
        
        Ensures the mobile number follows a valid format for mobile money accounts.
        """
        # Remove any spaces or dashes
        v = re.sub(r'[\s-]', '', v)
        
        # Check if all digits
        if not v.isdigit():
            raise ValueError('Mobile number must contain only digits')
            
        # Check length
        if len(v) < 8 or len(v) > 15:
            raise ValueError('Mobile number must be between 8 and 15 digits')
            
        return v

class PayoneerPaymentMethodCreate(PaymentMethodBase):
    """
    Schema for creating a new Payoneer payment method.
    
    Validates Payoneer account details.
    """
    method_type: PaymentMethodType = PaymentMethodType.PAYONEER
    payoneer_email: EmailStr
    account_name: str = Field(..., min_length=2, max_length=100)

class PaymentMethodCreate(BaseModel):
    """
    Schema for creating any type of payment method.
    
    Uses discriminated union to handle different payment method types.
    """
    payment_method: Union[CardPaymentMethodCreate, MobileMoneyPaymentMethodCreate, PayoneerPaymentMethodCreate]

class PaymentMethodResponse(PaymentMethodBase):
    """
    Schema for payment method response.
    
    Returns payment method details with sensitive data masked.
    """
    id: int
    user_id: int
    method_type: PaymentMethodType
    
    # Card details (masked)
    card_last_four: Optional[str] = None
    card_expiry_month: Optional[str] = None
    card_expiry_year: Optional[str] = None
    
    # Mobile money details (partially masked)
    mobile_number: Optional[str] = None
    
    # Payoneer details (partially masked)
    payoneer_email: Optional[str] = None
    
    is_default: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Configuration for the Pydantic model."""
        orm_mode = True

# ==================== Pricing Plan Schemas ====================

class PricingPlanBase(BaseModel):
    """
    Base schema for pricing plan data.
    
    Contains common fields shared by all pricing plan operations.
    """
    name: str
    tier: SubscriptionTier
    price_monthly: float
    price_yearly: float
    description: str
    features: List[str]
    is_active: bool = True

class PricingPlanCreate(PricingPlanBase):
    """
    Schema for creating a new pricing plan.
    
    Admin-only operation for defining subscription tiers.
    """
    pass

class PricingPlanResponse(PricingPlanBase):
    """
    Schema for pricing plan response.
    
    Returns complete pricing plan details.
    """
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Configuration for the Pydantic model."""
        orm_mode = True

# ==================== Subscription Schemas ====================

class SubscriptionBase(BaseModel):
    """
    Base schema for subscription data.
    
    Contains common fields shared by all subscription operations.
    """
    plan_id: int
    is_auto_renew: bool = True

class SubscriptionCreate(SubscriptionBase):
    """
    Schema for creating a new subscription.
    
    Includes payment method for initial billing.
    """
    payment_method_id: int
    billing_cycle: str = Field(..., description="Either 'monthly' or 'yearly'")
    
    @validator('billing_cycle')
    def validate_billing_cycle(cls, v):
        """
        Validate billing cycle.
        
        Ensures the billing cycle is either monthly or yearly.
        """
        if v not in ['monthly', 'yearly']:
            raise ValueError('Billing cycle must be either "monthly" or "yearly"')
        return v

class SubscriptionResponse(SubscriptionBase):
    """
    Schema for subscription response.
    
    Returns complete subscription details including status and dates.
    """
    id: int
    user_id: int
    status: SubscriptionStatus
    start_date: datetime
    end_date: datetime
    created_at: datetime
    updated_at: datetime
    pricing_plan: PricingPlanResponse
    
    class Config:
        """Configuration for the Pydantic model."""
        orm_mode = True

# ==================== Transaction Schemas ====================

class TransactionBase(BaseModel):
    """
    Base schema for transaction data.
    
    Contains common fields shared by all transaction operations.
    """
    amount: float
    currency: str = "USD"
    description: Optional[str] = None

class TransactionCreate(TransactionBase):
    """
    Schema for creating a new transaction.
    
    Used for one-time payments not tied to subscriptions.
    """
    payment_method_id: int
    metadata: Optional[Dict[str, Any]] = None

class TransactionResponse(TransactionBase):
    """
    Schema for transaction response.
    
    Returns complete transaction details including status and timestamps.
    """
    id: int
    user_id: int
    transaction_id: str
    status: PaymentStatus
    payment_method_id: Optional[int] = None
    subscription_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Configuration for the Pydantic model."""
        orm_mode = True
