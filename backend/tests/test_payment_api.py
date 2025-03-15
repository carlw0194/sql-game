"""
Payment API Testing Script

This script tests the payment-related API endpoints to ensure they function correctly.
It tests the entire payment flow from retrieving pricing plans to creating subscriptions.
"""

import requests
import json
import sys
import os
from typing import Dict, Any, List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# API base URL
BASE_URL = "http://localhost:8000"

# Test user credentials
TEST_USER = {
    "email": "player@example.com",
    "password": "password123"
}

# Test admin credentials
ADMIN_USER = {
    "email": "admin@example.com",
    "password": "adminpass123"
}

def login(email: str, password: str) -> Optional[str]:
    """
    Log in to the API and get an access token.
    
    Args:
        email: User email
        password: User password
        
    Returns:
        Access token if login successful, None otherwise
    """
    try:
        response = requests.post(
            f"{BASE_URL}/users/login",
            data={"username": email, "password": password}
        )
        
        if response.status_code == 200:
            token_data = response.json()
            return token_data.get("access_token")
        else:
            logger.error(f"Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        return None

def get_pricing_plans(token: str) -> List[Dict[str, Any]]:
    """
    Get all pricing plans.
    
    Args:
        token: Access token
        
    Returns:
        List of pricing plans
    """
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/payments/pricing-plans", headers=headers)
        
        if response.status_code == 200:
            plans = response.json()
            logger.info(f"Retrieved {len(plans)} pricing plans")
            return plans
        else:
            logger.error(f"Failed to get pricing plans: {response.status_code} - {response.text}")
            return []
    except Exception as e:
        logger.error(f"Error getting pricing plans: {str(e)}")
        return []

def create_payment_method(token: str, method_type: str = "visa") -> Optional[Dict[str, Any]]:
    """
    Create a payment method for the user.
    
    Args:
        token: Access token
        method_type: Type of payment method to create
        
    Returns:
        Created payment method if successful, None otherwise
    """
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        if method_type == "visa":
            # Create a credit card payment method
            data = {
                "method_type": "visa",
                "card_number": "4111111111111111",
                "card_expiry_month": "12",
                "card_expiry_year": "2025",
                "is_default": True
            }
            response = requests.post(
                f"{BASE_URL}/payments/payment-methods/card",
                json=data,
                headers=headers
            )
        elif method_type == "mtn_mobile_money":
            # Create a mobile money payment method
            data = {
                "method_type": "mtn_mobile_money",
                "mobile_number": "0712345678",
                "is_default": True
            }
            response = requests.post(
                f"{BASE_URL}/payments/payment-methods/mobile-money",
                json=data,
                headers=headers
            )
        elif method_type == "payoneer":
            # Create a Payoneer payment method
            data = {
                "method_type": "payoneer",
                "payoneer_email": "user@example.com",
                "is_default": True
            }
            response = requests.post(
                f"{BASE_URL}/payments/payment-methods/payoneer",
                json=data,
                headers=headers
            )
        else:
            logger.error(f"Unsupported payment method type: {method_type}")
            return None
        
        if response.status_code == 200:
            payment_method = response.json()
            logger.info(f"Created payment method: {payment_method['id']}")
            return payment_method
        else:
            logger.error(f"Failed to create payment method: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"Error creating payment method: {str(e)}")
        return None

def get_payment_methods(token: str) -> List[Dict[str, Any]]:
    """
    Get all payment methods for the user.
    
    Args:
        token: Access token
        
    Returns:
        List of payment methods
    """
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/payments/payment-methods", headers=headers)
        
        if response.status_code == 200:
            methods = response.json()
            logger.info(f"Retrieved {len(methods)} payment methods")
            return methods
        else:
            logger.error(f"Failed to get payment methods: {response.status_code} - {response.text}")
            return []
    except Exception as e:
        logger.error(f"Error getting payment methods: {str(e)}")
        return []

def create_subscription(token: str, plan_id: int, payment_method_id: int) -> Optional[Dict[str, Any]]:
    """
    Create a subscription for the user.
    
    Args:
        token: Access token
        plan_id: ID of the pricing plan
        payment_method_id: ID of the payment method
        
    Returns:
        Created subscription if successful, None otherwise
    """
    try:
        headers = {"Authorization": f"Bearer {token}"}
        data = {
            "plan_id": plan_id,
            "payment_method_id": payment_method_id,
            "billing_cycle": "monthly",
            "is_auto_renew": True
        }
        
        response = requests.post(
            f"{BASE_URL}/payments/subscriptions",
            json=data,
            headers=headers
        )
        
        if response.status_code == 200:
            subscription = response.json()
            logger.info(f"Created subscription: {subscription['id']}")
            return subscription
        else:
            logger.error(f"Failed to create subscription: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"Error creating subscription: {str(e)}")
        return None

def get_subscriptions(token: str) -> List[Dict[str, Any]]:
    """
    Get all subscriptions for the user.
    
    Args:
        token: Access token
        
    Returns:
        List of subscriptions
    """
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/payments/subscriptions", headers=headers)
        
        if response.status_code == 200:
            subscriptions = response.json()
            logger.info(f"Retrieved {len(subscriptions)} subscriptions")
            return subscriptions
        else:
            logger.error(f"Failed to get subscriptions: {response.status_code} - {response.text}")
            return []
    except Exception as e:
        logger.error(f"Error getting subscriptions: {str(e)}")
        return []

def run_payment_tests():
    """
    Run tests for the payment API endpoints.
    
    Tests the entire payment flow:
    1. Login
    2. Get pricing plans
    3. Create payment method
    4. Get payment methods
    5. Create subscription
    6. Get subscriptions
    """
    # Step 1: Login
    logger.info("Logging in as test user...")
    token = login(TEST_USER["email"], TEST_USER["password"])
    
    if not token:
        logger.error("Login failed, cannot proceed with tests")
        return
    
    logger.info("Login successful")
    
    # Step 2: Get pricing plans
    logger.info("Getting pricing plans...")
    plans = get_pricing_plans(token)
    
    if not plans:
        logger.error("Failed to get pricing plans, cannot proceed with tests")
        return
    
    # Select the premium plan
    premium_plan = next((plan for plan in plans if plan["tier"] == "premium"), None)
    
    if not premium_plan:
        logger.error("Premium plan not found, cannot proceed with tests")
        return
    
    logger.info(f"Selected premium plan: {premium_plan['name']} (ID: {premium_plan['id']})")
    
    # Step 3: Create payment method
    logger.info("Creating payment method...")
    payment_method = create_payment_method(token, "visa")
    
    if not payment_method:
        # Try to get existing payment methods
        logger.info("Creating payment method failed, checking for existing methods...")
        methods = get_payment_methods(token)
        
        if methods:
            payment_method = methods[0]
            logger.info(f"Using existing payment method: {payment_method['id']}")
        else:
            logger.error("No payment methods available, cannot proceed with tests")
            return
    
    # Step 4: Create subscription
    logger.info(f"Creating subscription to plan {premium_plan['id']} with payment method {payment_method['id']}...")
    subscription = create_subscription(token, premium_plan["id"], payment_method["id"])
    
    if not subscription:
        logger.error("Failed to create subscription")
    else:
        logger.info(f"Successfully created subscription: {subscription['id']}")
    
    # Step 5: Get subscriptions
    logger.info("Getting user subscriptions...")
    subscriptions = get_subscriptions(token)
    
    if subscriptions:
        logger.info(f"User has {len(subscriptions)} subscriptions")
        for sub in subscriptions:
            logger.info(f"Subscription: {sub['id']} - Status: {sub['status']} - Plan: {sub['plan_id']}")
    else:
        logger.error("Failed to get user subscriptions")
    
    logger.info("Payment API tests completed")

if __name__ == "__main__":
    logger.info("Starting payment API tests")
    run_payment_tests()
