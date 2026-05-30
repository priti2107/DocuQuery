# Task 11: RAG Chat with Ollama - Setup & Testing Guide

## Current Status
✅ **All code implementation complete:**
- LLMService with RAG prompt building and answer generation
- Chat schemas (ChatRequest, ChatResponse, ChatSourceMetadata)
- POST /chat endpoint fully integrated with retrieval pipeline
- Comprehensive error handling and logging
- All imports verified and working

## Prerequisites: Install Ollama

### Step 1: Download Ollama
Visit: https://ollama.com/download

Choose your platform:
- macOS: Download `.dmg` installer
- Linux: `curl -fsSL https://ollama.ai/install.sh | sh`
- Windows: Download `.exe` installer

### Step 2: Run Ollama Service
After installing Ollama, it runs as a background service on:
```
http://localhost:11434/api/generate
```

### Step 3: Download a Model
Choose one:

**Recommended (better quality, slower):**
```bash
ollama run mistral
```

**Fast (tinyllama, good for testing):**
```bash
ollama run tinyllama
```

This command:
1. Downloads the model (first time only)
2. Starts the model
3. Keep this terminal open while testing

## RAG Pipeline Architecture

```
User Query
    ↓
Semantic Retrieval (retrieval_service.py)
    ↓
Top-K Context Chunks
    ↓
RAG Prompt Building (llm_service.py)
    ↓
Ollama LLM API Call
    ↓
Generated Answer + Sources
```

## Testing the Chat Endpoint

### Step 1: Start FastAPI Server
```bash
cd /Users/pritichavan/Documents/DocuQuery/DocuQuery/backend
/Users/pritichavan/Documents/DocuQuery/DocuQuery/venv/bin/python << 'EOF'
import sys
sys.path.insert(0, '/Users/pritichavan/Documents/DocuQuery/DocuQuery/backend')
import uvicorn
uvicorn.run("app.main:app", host="127.0.0.1", port=8001, reload=False)
EOF
```

### Step 2: Upload Documents
Use the upload endpoint to add test documents with embeddings

### Step 3: Test Chat via Swagger UI
Visit: http://127.0.0.1:8001/docs

Navigate to: **POST /chat**

Example requests:
```json
{
  "query": "What databases are mentioned?"
}
```

```json
{
  "query": "What technologies are used in this project?"
}
```

```json
{
  "query": "Summarize the main technologies"
}
```

### Step 4: Test via Python Script

See `test_chat_endpoint.py` for complete end-to-end testing.

## Response Format

```json
{
  "query": "What databases are mentioned?",
  "answer": "MongoDB and PostgreSQL are the databases mentioned in the documents.",
  "sources": [
    {
      "document_id": "507f1f77bcf86cd799439011",
      "chunk_index": 2,
      "score": 0.91
    },
    {
      "document_id": "507f1f77bcf86cd799439011",
      "chunk_index": 5,
      "score": 0.87
    }
  ],
  "model": "mistral",
  "num_chunks": 2
}
```

## Error Handling

### Ollama Not Running
**Error:** 503 Service Unavailable
```json
{
  "detail": "LLM service (Ollama) is not running. Please start it with: ollama run mistral"
}
```

**Solution:** Start Ollama with a model first

### No Documents
**Response:** "I could not find relevant information in the uploaded documents."

**Solution:** Upload documents and generate embeddings first

## Performance Notes

- **Mistral**: Better quality answers (~30-60s per query)
- **TinyLlama**: Faster responses (~5-10s per query)
- First query takes longer (model initialization)
- Subsequent queries are faster

## Architecture Files

| File | Purpose |
|------|---------|
| `backend/app/services/llm_service.py` | LLM integration and prompt building |
| `backend/app/schemas/document.py` | Chat request/response schemas |
| `backend/app/api/documents.py` | POST /chat endpoint |
| `backend/requirements.txt` | Updated with httpx dependency |

## Next Steps (After Testing)

1. ✅ Complete semantic search implementation
2. ✅ Integrate retrieval with LLM
3. ✅ Create chat endpoint
4. ⏳ **TEST** with Ollama running
5. Performance optimization
6. Multi-turn conversation support (future)
7. Streaming responses (future)

## Complete RAG Stack Summary

```
Frontend (React/Vue)
    ↓
FastAPI Backend (Python)
    ↓
┌─────────────────────────────┐
│  MongoDB Atlas (Documents)  │
│    + Motor (Async Driver)   │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│  Embeddings (🤗 Hugging Face)       │
│  all-MiniLM-L6-v2 (384 dims)│
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│  Semantic Retrieval         │
│  (Cosine Similarity)        │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│  RAG Prompt Building        │
│  (Context Injection)        │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│  Ollama Local LLM           │
│  (Mistral / TinyLlama)      │
└─────────────────────────────┘
    ↓
AI-Generated Answer + Sources
```

Ready to test! 🚀
