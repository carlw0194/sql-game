"""
Security Utilities for SQL Game

This module provides security-related functions for password hashing, token generation,
and authentication. It uses industry-standard cryptographic practices to ensure
user data remains secure.
"""

from datetime import datetime, timedelta
from typing import Any, Optional, Union

from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

# Password hashing configuration
# Using bcrypt for password hashing with appropriate security settings
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password: The plain-text password to verify
        hashed_password: The hashed password to check against
        
    Returns:
        bool: True if the password matches the hash, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Generate a secure hash for a password.
    
    This function creates a one-way hash of the password using bcrypt,
    which is resistant to brute force and rainbow table attacks.
    
    Args:
        password: The plain-text password to hash
        
    Returns:
        str: The hashed password
    """
    return pwd_context.hash(password)

def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.
    
    Args:
        subject: The subject of the token, typically the user ID
        expires_delta: Optional expiration time delta, defaults to settings value
        
    Returns:
        str: The encoded JWT token
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    # Create the JWT payload
    to_encode = {"exp": expire, "sub": str(subject)}
    
    # Encode the token with the secret key
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt
