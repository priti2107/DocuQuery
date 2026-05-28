"""
Document upload and management API endpoints.

Endpoints:
- POST /documents/upload: Upload a new document
- GET /documents: List documents for current user
- DELETE /documents/{document_id}: Delete a document

All endpoints require JWT authentication.

How file uploads work in FastAPI:
1. Client sends multipart/form-data with file
2. FastAPI creates UploadFile object
3. We validate, save file, store metadata
4. Return document info to client

multipart/form-data encoding:
- Sends file as binary stream
- Includes file metadata (filename, content-type)
- Client uses: FormData in JavaScript, requests.files in Python, etc.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from fastapi.responses import FileResponse

from app.api.auth import get_current_user
from app.models.user import User
from app.schemas.document import (
    DocumentDeleteResponse,
    DocumentListResponse,
    DocumentResponse,
    UploadResponse,
    EmbeddingResponse,
    SearchRequest,
    SearchResponse,
    SearchResultChunk,
    ChatRequest,
    ChatResponse,
    ChatSourceMetadata,
)
from app.services.document_service import document_service
from app.services.embedding_service import embedding_service
from app.services.retrieval_service import retrieval_service
from app.services.llm_service import llm_service


# ============================================================================
# ROUTER SETUP
# ============================================================================

router = APIRouter(
    prefix="/documents",
    tags=["documents"],
)


# ============================================================================
# ROUTES
# ============================================================================

@router.post(
    "/upload",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a document"
)
async def upload_document(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
) -> UploadResponse:
    """
    Upload a document file.
    
    How UploadFile Works:
    - FastAPI automatically parses multipart/form-data
    - UploadFile object provides:
        - file: BytesIO object with file content
        - filename: Original filename
        - content_type: MIME type (e.g., "application/pdf")
        - size: File size in bytes (may be None)
    
    Authentication:
    - Requires JWT token in Authorization header
    - FastAPI extracts from "Authorization: Bearer <token>"
    - get_current_user validates token and returns User
    
    Validation:
    - Check file type is allowed (PDF, DOCX, TXT, CSV)
    - Check file size < 50MB
    - Check extension matches MIME type (security)
    
    File Storage:
    - Saves to backend/uploads/{user_id}/{filename}
    - Stores metadata in MongoDB documents collection
    - Metadata linked to user via user_id
    
    Error Handling:
    - 400: File type not allowed or file too large
    - 401: Invalid/missing token
    - 422: Invalid input
    
    Request:
    - Content-Type: multipart/form-data
    - Body: file=<binary>
    
    Response (201 Created):
    {
        "message": "File uploaded successfully",
        "document_id": "507f...",
        "filename": "resume.pdf",
        "file_size": 245632,
        "file_type": "application/pdf",
        "status": "uploaded"
    }
    
    Args:
        file: File uploaded by client (FastAPI extracts from form data)
        current_user: User from JWT token (injected by Depends)
    
    Returns:
        UploadResponse with document metadata
        
    Raises:
        HTTPException 400: Invalid file
        HTTPException 401: Authentication failed
    """
    # Read file content into memory
    # file.file is BytesIO object
    file_content = await file.read()
    
    # Get file metadata
    filename = file.filename or "unknown"
    file_size = len(file_content)
    content_type = file.content_type or "application/octet-stream"
    
    try:
        # Upload to document service
        # Service validates, saves file, stores metadata
        document = await document_service.upload_document(
            file_content=file_content,
            filename=filename,
            file_size=file_size,
            content_type=content_type,
            user_id=str(current_user.id),
        )
    except ValueError as e:
        # File validation failed
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Unexpected error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )
    
    return UploadResponse(
        message="File uploaded successfully",
        document_id=str(document.id),
        filename=document.filename,
        file_size=document.file_size,
        file_type=document.file_type,
        status=document.status,
    )


@router.get(
    "",
    response_model=DocumentListResponse,
    summary="List documents for current user"
)
async def list_documents(
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
) -> DocumentListResponse:
    """
    List documents for the current authenticated user.
    
    Returns:
    - List of documents owned by user
    - Pagination info (total, skip, limit)
    - Sorted by upload_date (newest first)
    
    Pagination:
    - skip: Number of documents to skip (default 0)
    - limit: Max documents to return (default 10, max 100)
    - Use for loading documents page by page
    
    Example pagination:
    - Page 1: skip=0, limit=10 (documents 1-10)
    - Page 2: skip=10, limit=10 (documents 11-20)
    - Page 3: skip=20, limit=10 (documents 21-30)
    
    Security:
    - Only returns documents for authenticated user
    - Query filters by user_id from JWT token
    - User cannot see other users' documents
    
    Request:
    GET /documents?skip=0&limit=10
    Authorization: Bearer <token>
    
    Response (200 OK):
    {
        "documents": [
            {
                "_id": "507f...",
                "filename": "resume.pdf",
                "file_type": "application/pdf",
                "file_size": 245632,
                "upload_date": "2024-05-24T10:30:00Z",
                "status": "uploaded"
            }
        ],
        "total": 25,
        "skip": 0,
        "limit": 10
    }
    
    Args:
        skip: Number of documents to skip (for pagination)
        limit: Max documents to return (for pagination)
        current_user: User from JWT token (injected by Depends)
    
    Returns:
        DocumentListResponse with documents and pagination info
    """
    # Query documents for user
    documents, total = await document_service.list_documents(
        user_id=str(current_user.id),
        skip=skip,
        limit=limit,
    )
    
    # Convert Document models to response schema
    doc_responses = [
        DocumentResponse(
            id=str(doc.id),
            filename=doc.filename,
            file_type=doc.file_type,
            file_size=doc.file_size,
            upload_date=doc.upload_date,
            status=doc.status,
        )
        for doc in documents
    ]
    
    return DocumentListResponse(
        documents=doc_responses,
        total=total,
        skip=skip,
        limit=limit,
    )


@router.delete(
    "/{document_id}",
    response_model=DocumentDeleteResponse,
    summary="Delete a document"
)
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
) -> DocumentDeleteResponse:
    """
    Delete a document (removes file and metadata).
    
    Deletes:
    - File from backend/uploads/
    - Metadata from MongoDB
    
    Security:
    - Only owner can delete their document
    - Verified by user_id in database query
    - User ID comes from JWT token (cannot be forged)
    
    Process:
    1. Verify document exists and belongs to user
    2. Delete file from disk
    3. Delete metadata from MongoDB
    4. Return confirmation
    
    Error Handling:
    - 404: Document not found or user doesn't own it
    - 401: Invalid/missing token
    
    Request:
    DELETE /documents/507f1f77bcf86cd799439011
    Authorization: Bearer <token>
    
    Response (200 OK):
    {
        "message": "Document deleted successfully",
        "document_id": "507f1f77bcf86cd799439011",
        "filename": "resume.pdf"
    }
    
    Args:
        document_id: MongoDB ObjectId as string
        current_user: User from JWT token (injected by Depends)
    
    Returns:
        DocumentDeleteResponse with deletion confirmation
        
    Raises:
        HTTPException 404: Document not found or access denied
    """
    # Get document to retrieve filename for response
    document = await document_service.get_document(
        document_id=document_id,
        user_id=str(current_user.id),
    )
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or you don't have permission to delete it"
        )
    
    # Delete the document
    success = await document_service.delete_document(
        document_id=document_id,
        user_id=str(current_user.id),
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document"
        )
    
    return DocumentDeleteResponse(
        message="Document deleted successfully",
        document_id=document_id,
        filename=document.filename,
    )


@router.post(
    "/{document_id}/generate-embeddings",
    response_model=EmbeddingResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate embeddings for document chunks"
)
async def generate_document_embeddings(
    document_id: str,
    current_user: User = Depends(get_current_user),
) -> EmbeddingResponse:
    """
    Generate embeddings for all chunks of a document.
    
    This is a test endpoint to manually trigger embedding generation.
    In production, embeddings would be auto-generated after chunking.
    
    Process:
    1. Verify document exists and belongs to user
    2. Fetch all chunks for document from MongoDB
    3. Generate embedding vectors for each chunk
    4. Store embeddings in document_chunks collection
    5. Return count of chunks embedded
    
    Embedding Model:
    - sentence-transformers/all-MiniLM-L6-v2
    - 384-dimensional embeddings
    - Fast inference (~10ms per chunk)
    
    Error Handling:
    - 404: Document not found or user doesn't own it
    - 400: Document has no chunks to embed
    - 500: Embedding generation failed
    
    Request:
    POST /documents/507f1f77bcf86cd799439011/generate-embeddings
    Authorization: Bearer <token>
    
    Response (200 OK):
    {
        "document_id": "507f1f77bcf86cd799439011",
        "chunks_processed": 42,
        "status": "completed"
    }
    
    Args:
        document_id: MongoDB ObjectId as string
        current_user: User from JWT token (injected by Depends)
    
    Returns:
        EmbeddingResponse with count of embedded chunks
        
    Raises:
        HTTPException 404: Document not found or access denied
        HTTPException 400: No chunks to embed
        HTTPException 500: Embedding generation failed
    """
    from app.db.database import get_database
    
    # Verify document exists and belongs to user
    document = await document_service.get_document(
        document_id=document_id,
        user_id=str(current_user.id),
    )
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or you don't have permission to access it"
        )
    
    try:
        # Get database instance
        db = get_database()
        
        # Generate embeddings for all chunks
        chunks_processed, status_message = await embedding_service.process_document_embeddings(
            db=db,
            document_id=document_id,
        )
        
        if chunks_processed == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=status_message or "No chunks to embed"
            )
        
        return EmbeddingResponse(
            document_id=document_id,
            chunks_processed=chunks_processed,
            status="completed",
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Embedding generation failed: {str(e)}"
        )


@router.post(
    "/search",
    response_model=SearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Semantic search across documents"
)
async def semantic_search(
    search_request: SearchRequest,
    current_user: User = Depends(get_current_user),
    top_k: int = 5,
) -> SearchResponse:
    """
    Perform semantic search across all document chunks.
    
    Uses embeddings to find semantically similar chunks, not keyword matching.
    Returns top-k most relevant chunks ranked by cosine similarity.
    
    RAG Pipeline Phase - Retrieval:
    1. Convert user query to embedding (384 dimensions)
    2. Fetch all chunks with embeddings from MongoDB
    3. Compute cosine similarity between query and each chunk
    4. Sort by similarity score (descending)
    5. Return top-k chunks
    
    Key Differences from Keyword Search:
    - Keyword search: "FastAPI" only matches exact/fuzzy "FastAPI"
    - Semantic search: "modern web framework" matches chunks about FastAPI
    - Works with synonyms, rephrasing, different vocabulary
    - Captures meaning, not just words
    
    Example Semantic Matches:
    - Query: "Which Python web framework is used?"
    - Would match chunks about "FastAPI", "Django", "Flask"
    - Even if exact phrase not in chunk
    
    Similarity Scores:
    - Range: 0.0 (completely different) to 1.0 (identical)
    - Typical relevant results: > 0.5
    - Very relevant: > 0.75
    - Highly relevant: > 0.9
    
    Error Handling:
    - 400: Empty query
    - 401: Invalid/missing token
    - 422: Invalid request schema
    - 500: Embedding/similarity computation failed
    
    Request:
    POST /documents/search
    Authorization: Bearer <token>
    {
        "query": "What programming languages are used?"
    }
    
    Response (200 OK):
    {
        "query": "What programming languages are used?",
        "matches": [
            {
                "chunk_index": 0,
                "score": 0.92,
                "content": "FastAPI uses Python 3.7+...",
                "document_id": "507f1f77bcf86cd799439011",
                "chunk_size": 512
            },
            {
                "chunk_index": 3,
                "score": 0.85,
                "content": "JavaScript and TypeScript for frontend...",
                "document_id": "507f1f77bcf86cd799439012",
                "chunk_size": 512
            }
        ]
    }
    
    Query Parameters:
    - top_k: Number of top results to return (default 5, max 20)
    
    Args:
        search_request: SearchRequest with "query" field
        current_user: User from JWT token (injected by Depends)
        top_k: Number of top results to return (query parameter)
    
    Returns:
        SearchResponse with matched chunks sorted by score
        
    Raises:
        HTTPException 400: Empty query or invalid parameters
        HTTPException 500: Search computation failed
    """
    from app.db.database import get_database
    
    # Validate top_k parameter
    if top_k < 1 or top_k > 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="top_k must be between 1 and 20"
        )
    
    try:
        # Get database instance
        db = get_database()
        
        # Perform semantic search
        logger = __import__("logging").getLogger(__name__)
        logger.info(
            f"Semantic search initiated by user {current_user.email}: "
            f"'{search_request.query[:60]}...'"
        )
        
        matched_chunks = await retrieval_service.retrieve_relevant_chunks(
            db=db,
            query=search_request.query,
            top_k=top_k,
            min_score=0.0,  # Return all matches, even low-confidence ones
        )
        
        # Convert matched chunks to SearchResultChunk schema
        result_chunks = [
            SearchResultChunk(
                chunk_index=chunk["chunk_index"],
                score=chunk["score"],
                content=chunk["content"],
                document_id=chunk["document_id"],
                chunk_size=chunk["chunk_size"],
            )
            for chunk in matched_chunks
        ]
        
        logger = __import__("logging").getLogger(__name__)
        logger.info(
            f"Semantic search completed for user {current_user.email}: "
            f"found {len(result_chunks)} relevant chunks"
        )
        
        return SearchResponse(
            query=search_request.query,
            matches=result_chunks,
        )
    
    except ValueError as e:
        # Query validation error
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Search computation error
        logger = __import__("logging").getLogger(__name__)
        logger.error(f"Semantic search failed: {str(e)}", exc_info=True)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Semantic search failed: {str(e)}"
        )


# ============================================================================
# RAG CHAT ENDPOINT (FINAL RAG PIPELINE LAYER)
# ============================================================================

@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="RAG Chat - Answer Questions from Documents",
)
async def chat(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    top_k: int = 5,
) -> ChatResponse:
    """
    Complete RAG pipeline chat endpoint.
    
    Answers user questions using document context through:
    1. Semantic retrieval - Find relevant document chunks
    2. Prompt building - Create context-aware prompt
    3. LLM generation - Generate answer using local Ollama model
    4. Source tracking - Return which chunks were used
    
    The RAG Pipeline:
    User Query → Query Embedding → Similarity Search → Top Chunks →
    Prompt Building → LLM Generation → AI Answer
    
    This completes the full RAG stack:
    - MongoDB for document storage
    - Embeddings for semantic understanding
    - Cosine similarity for chunk retrieval
    - Ollama LLM for answer generation
    
    Error Handling:
    - 400: Empty query or invalid parameters
    - 401: Invalid/missing token
    - 422: Invalid request schema
    - 503: Ollama API unreachable (LLM not running)
    - 500: Other processing errors
    
    Requirements:
    - Ollama must be running locally: ollama run mistral
    - User must have uploaded documents with embeddings
    
    Request:
    POST /chat
    Authorization: Bearer <token>
    {
        "query": "What databases are mentioned in the documents?"
    }
    
    Response (200 OK):
    {
        "query": "What databases are mentioned in the documents?",
        "answer": "MongoDB and PostgreSQL are the databases mentioned...",
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
    
    Query Parameters:
    - top_k: Number of context chunks to retrieve (default 5, max 20)
    
    Args:
        chat_request: ChatRequest with "query" field
        current_user: User from JWT token (injected by Depends)
        top_k: Number of top chunks to use as context
    
    Returns:
        ChatResponse with LLM answer and source metadata
        
    Raises:
        HTTPException 400: Empty query or invalid parameters
        HTTPException 503: Ollama API unreachable
        HTTPException 500: LLM generation failed
    """
    import logging
    from app.db.database import get_database
    
    logger = logging.getLogger(__name__)
    
    # Validate top_k parameter
    if top_k < 1 or top_k > 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="top_k must be between 1 and 20"
        )
    
    try:
        # Step 1: Retrieve relevant chunks
        logger.info(
            f"🤖 RAG chat initiated by user {current_user.email}: "
            f"'{chat_request.query[:60]}...'"
        )
        
        db = get_database()
        
        retrieved_chunks = await retrieval_service.retrieve_relevant_chunks(
            db=db,
            query=chat_request.query,
            top_k=top_k,
            min_score=0.0,
        )
        
        logger.info(
            f"✅ Retrieved {len(retrieved_chunks)} context chunks for LLM"
        )
        
        # Step 2: Generate LLM answer
        logger.info("🧠 Calling LLM for answer generation...")
        
        llm_result = await llm_service.generate_answer(
            query=chat_request.query,
            chunks=retrieved_chunks,
            model="mistral"  # or "tinyllama" for faster inference
        )
        
        # Step 3: Format response with source metadata
        sources = [
            ChatSourceMetadata(
                document_id=chunk["document_id"],
                chunk_index=chunk["chunk_index"],
                score=chunk["score"],
            )
            for chunk in retrieved_chunks
        ]
        
        chat_response = ChatResponse(
            query=chat_request.query,
            answer=llm_result["answer"],
            sources=sources,
            model=llm_result["model"],
            num_chunks=len(retrieved_chunks),
        )
        
        logger.info(
            f"✅ RAG chat completed for user {current_user.email}: "
            f"generated answer from {len(retrieved_chunks)} chunks"
        )
        
        return chat_response
    
    except ValueError as e:
        # Query validation error
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    except RuntimeError as e:
        # LLM service error - check if Ollama is running
        error_msg = str(e).lower()
        
        if "ollama" in error_msg and ("unreachable" in error_msg or "connect" in error_msg):
            logger.error(f"❌ Ollama API unreachable: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="LLM service (Ollama) is not running. "
                       "Please start it with: ollama run mistral"
            )
        else:
            logger.error(f"❌ LLM generation failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"LLM answer generation failed: {str(e)}"
            )
    
    except Exception as e:
        # Other errors
        logger.error(f"❌ RAG chat failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RAG chat failed: {str(e)}"
        )
