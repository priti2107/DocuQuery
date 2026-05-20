from fastapi import FastAPI
from app.core.config import settings

# Initialize FastAPI application with settings from configuration
# These values come from environment variables or .env file
app = FastAPI(
    title=settings.APP_NAME,
    description="RAG Document Intelligence Platform",
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

@app.get("/")
def root():
    return {"message": "Welcome to DocuQuery API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}