from fastapi import FastAPI

app = FastAPI(
    title="DocuQuery API",
    description="RAG Document Intelligence Platform",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"message": "Welcome to DocuQuery API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}