"""
Application configuration module.

This module loads and validates environment variables using Pydantic BaseSettings.
It provides a singleton settings object that can be imported and used throughout
the application.

Key concepts:
- All configuration comes from environment variables or .env file
- Type validation ensures correct data types
- Secrets are never hardcoded
- Settings are loaded once at startup for performance
"""

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Pydantic's BaseSettings automatically:
    1. Loads variables from .env file (if python-dotenv is installed)
    2. Reads from actual environment variables
    3. Validates types (e.g., DEBUG must be boolean)
    4. Raises errors if required fields are missing
    
    Usage:
        from app.core.config import settings
        
        print(settings.APP_NAME)      # "DocuQuery API"
        print(settings.DEBUG)          # True
        print(settings.DATABASE_NAME)  # "docuquery"
    """
    
    # Application metadata
    APP_NAME: str = Field(default="DocuQuery API", description="Application name")
    APP_VERSION: str = Field(default="1.0.0", description="Application version")
    
    # Debug mode - controls verbose logging and error details
    DEBUG: bool = Field(default=False, description="Enable debug mode")
    
    # Database configuration
    MONGODB_URI: str = Field(
        default="mongodb://localhost:27017",
        description="MongoDB connection string"
    )
    DATABASE_NAME: str = Field(
        default="docuquery",
        description="MongoDB database name"
    )
    
    # Security settings
    SECRET_KEY: str = Field(
        description="Secret key for signing JWTs - keep this secure!",
        min_length=32
    )
    ALGORITHM: str = Field(
        default="HS256",
        description="Algorithm for JWT encoding/decoding"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=30,
        description="JWT access token expiration time in minutes"
    )
    
    class Config:
        """Pydantic configuration for BaseSettings."""
        # Load environment variables from .env file
        # Requires: pip install python-dotenv
        env_file = ".env"
        env_file_encoding = "utf-8"
        # Case-insensitive environment variable matching
        case_sensitive = False
        # Additional settings configuration
        extra = "ignore"  # Ignore extra environment variables not defined in Settings


# Singleton instance - created once at application startup
# This object is imported throughout the app to access settings
settings = Settings()


# Example of how to use settings in other modules:
"""
# In app/main.py or any other module:
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)
"""
