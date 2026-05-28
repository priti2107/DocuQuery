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
)
from app.services.document_service import document_service
from app.services.embedding_service import embedding_service


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
