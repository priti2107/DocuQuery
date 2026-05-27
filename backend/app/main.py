"""
Main FastAPI application entry point.

This module:
1. Initializes FastAPI app with configuration
2. Sets up lifespan events (startup/shutdown)
3. Registers API routers
4. Defines root endpoints

Application Structure:
- app/main.py: FastAPI app initialization (THIS FILE)
- app/api/: API route handlers (auth.py, documents.py, etc.)
- app/services/: Business logic (auth_service.py, document_service.py, etc.)
- app/models/: Database document models
- app/schemas/: API request/response schemas
- app/core/: Configuration and security utilities
- app/db/: Database connection and utilities

Router Organization:
Each API module (auth, documents, etc.) creates its own router with prefix.
Main app includes all routers, grouping them logically.

Example:
- api/auth.py creates router with prefix="/auth"
- api/documents.py creates router with prefix="/documents"
- Main app includes both: app.include_router(auth.router), etc.
- Results in endpoints: /auth/login, /auth/register, /documents/upload, etc.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
import sys
import bcrypt
import passlib

from app.core.config import settings
from app.db.database import connect_to_mongo, close_mongo_connection
from app.api import auth, documents


# ============================================================================
# DIAGNOSTIC INFORMATION (printed at startup)
# ============================================================================
print("\n" + "=" * 80)
print("DOCUQUERY BACKEND STARTUP DIAGNOSTICS")
print("=" * 80)
print(f"Python executable: {sys.executable}")
print(f"Python version: {sys.version}")
print(f"Passlib version: {passlib.__version__}")
print(f"Bcrypt version: {bcrypt.__version__}")
print("=" * 80 + "\n")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan context manager for startup/shutdown events.
    
    When to use lifespan:
    - Initialize resources at startup (database connections, caches)
    - Clean up resources at shutdown (close connections, save state)
    - Happens before first request / after last request
    
    Process:
    1. FastAPI calls lifespan() on startup
    2. Code before yield runs (startup)
    3. yield pauses, app runs normally
    4. On shutdown, code after yield runs (cleanup)
    5. FastAPI closes context manager
    
    Startup Tasks:
    - Connect to MongoDB (await connect_to_mongo())
    - Initialize cache (if using Redis, Memcached, etc.)
    - Load configuration files
    - Start background tasks
    
    Shutdown Tasks:
    - Close database connections (await close_mongo_connection())
    - Save state to file/database
    - Stop background tasks
    
    Args:
        app: FastAPI application instance
    """
    # ===== STARTUP =====
    # Connect to MongoDB when application starts
    await connect_to_mongo()

    # ===== APPLICATION RUNNING =====
    # yield pauses here; application serves requests
    yield

    # ===== SHUTDOWN =====
    # Close MongoDB connection when application stops
    await close_mongo_connection()


# ============================================================================
# APP INITIALIZATION
# ============================================================================

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    description="RAG Document Intelligence Platform",
    lifespan=lifespan
)


# ============================================================================
# ROUTER REGISTRATION
# ============================================================================

# Include authentication router
# All routes in auth.router will be prefixed with /auth
# Example: GET /auth/me, POST /auth/login, POST /auth/register
app.include_router(auth.router)

# Include documents router
# All routes in documents.router will be prefixed with /documents
# Example: POST /documents/upload, GET /documents, DELETE /documents/{id}
app.include_router(documents.router)


# ============================================================================
# ROOT ENDPOINTS
# ============================================================================

@app.get("/")
def root():
    """
    Root endpoint - API welcome message.
    
    Returns:
        Welcome message with app name and version
    """
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint - verify API and database are running.
    
    Used by:
    - Load balancers to verify server is healthy
    - Monitoring systems to track uptime
    - Kubernetes liveness probes
    
    Returns:
        Status information (status: "healthy", database: "connected")
    """
    return {
        "status": "healthy",
        "database": "connected"
    }