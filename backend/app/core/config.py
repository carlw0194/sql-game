"""
Configuration Settings for SQL Game

This module defines configuration settings for the application, including
database connections, API settings, and security configurations.
It uses environment variables with sensible defaults for development.
"""

import os
import secrets
from typing import Any, Dict, List, Optional, Union

# Import from pydantic-settings instead of pydantic directly
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, PostgresDsn, field_validator

class Settings(BaseSettings):
    """
    Application settings class that loads configuration from environment variables.
    
    This class defines all configurable aspects of the application and provides
    validation and default values. It's used throughout the application to
    ensure consistent configuration access.
    """
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "SQL Game"
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        """
        Parse CORS origins from string or list format.
        
        This validator converts a comma-separated string of origins to a list,
        or validates that the provided value is already a list.
        """
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database Settings
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "sqlgame")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None

    @field_validator("SQLALCHEMY_DATABASE_URI", mode="before")
    def assemble_db_connection(cls, v: Optional[str], info: Dict[str, Any]) -> Any:
        """
        Construct PostgreSQL connection string from individual components.
        
        This validator builds a complete connection string using the PostgreSQL
        server, user, password, database name, and port settings.
        
        In Pydantic v2, the URL building API has changed from v1.
        """
        if isinstance(v, str):
            return v
            
        # Get values from the model
        values = info.data
        
        # Build the connection string manually since the API has changed in Pydantic v2
        user = values.get("POSTGRES_USER")
        password = values.get("POSTGRES_PASSWORD")
        host = values.get("POSTGRES_SERVER")
        port = values.get("POSTGRES_PORT")
        db = values.get("POSTGRES_DB", "")
        
        # Construct PostgreSQL connection URL
        return f"postgresql://{user}:{password}@{host}:{port}/{db}"
    
    # SQLite Challenges Database (for storing SQL challenges separately)
    CHALLENGE_DB_PATH: str = os.getenv(
        "CHALLENGE_DB_PATH", 
        "sqlite:///./challenges.db"
    )
    
    # Security Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Email Settings
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = None

    # Payment Settings
    ENABLE_PAYMENT_PROCESSING: bool = os.getenv("ENABLE_PAYMENT_PROCESSING", "False").lower() == "true"
    PAYMENT_API_KEY: Optional[str] = os.getenv("PAYMENT_API_KEY")
    PAYMENT_API_SECRET: Optional[str] = os.getenv("PAYMENT_API_SECRET")
    
    class Config:
        """
        Configuration for the Settings class.
        
        Defines metadata for how the settings should be loaded and validated.
        """
        case_sensitive = True
        env_file = ".env"


# Create a global settings object to be imported throughout the application
settings = Settings()
