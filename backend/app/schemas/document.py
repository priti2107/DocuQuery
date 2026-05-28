"""
Pydantic schemas for document upload and listing endpoints.

Schemas handle:
1. Upload file request validation
2. Document list response formatting
3. Document detail response
4. Error responses

Key differences from models:
- Schemas validate API input/output
- Models describe database storage
- Schemas may exclude sensitive fields (e.g., file_path not in response)
- Schemas enforce stricter validation for input (e.g., file types)
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class DocumentResponse(BaseModel):
    """
    Schema for returning document information to client.
    
    What we send back to client when they upload or list documents.
    
    Important: Does NOT include file_path (that's internal)
    Client shouldn't know exact file storage location.
    
    Example response:
    {
        "id": "507f1f77bcf86cd799439011",
        "filename": "resume.pdf",
        "file_type": "application/pdf",
        "file_size": 245632,
        "upload_date": "2024-05-24T10:30:00Z",
        "status": "uploaded"
    }
    
    Attributes:
        id: Document identifier
        filename: Name of uploaded file
        file_type: MIME type
        file_size: Size in bytes
        upload_date: When uploaded
        status: Current processing status
    """
    
    id: Optional[str] = Field(None, alias="_id", description="Document ID")
    filename: str = Field(..., description="Filename")
    file_type: str = Field(..., description="MIME type")
    file_size: int = Field(..., description="File size in bytes")
    upload_date: datetime = Field(..., description="Upload timestamp")
    status: str = Field(..., description="Processing status")
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "filename": "research_paper.pdf",
                "file_type": "application/pdf",
                "file_size": 1024000,
                "upload_date": "2024-05-24T10:30:00Z",
                "status": "uploaded"
            }
        }


class DocumentListResponse(BaseModel):
    """
    Schema for listing all documents.
    
    Returns list of documents with pagination info.
    
    Example:
    {
        "documents": [
            {"id": "...", "filename": "...", ...},
            {"id": "...", "filename": "...", ...}
        ],
        "total": 25,
        "skip": 0,
        "limit": 10
    }
    
    Attributes:
        documents: List of DocumentResponse
        total: Total documents for user
        skip: Number skipped (for pagination)
        limit: Max documents returned
    """
    
    documents: List[DocumentResponse] = Field(
        ...,
        description="List of documents"
    )
    total: int = Field(..., ge=0, description="Total documents for user")
    skip: int = Field(default=0, ge=0, description="Documents skipped")
    limit: int = Field(default=10, ge=1, description="Documents returned")
    
    class Config:
        json_schema_extra = {
            "example": {
                "documents": [
                    {
                        "_id": "507f1f77bcf86cd799439011",
                        "filename": "resume.pdf",
                        "file_type": "application/pdf",
                        "file_size": 245632,
                        "upload_date": "2024-05-24T10:30:00Z",
                        "status": "uploaded"
                    }
                ],
                "total": 1,
                "skip": 0,
                "limit": 10
            }
        }


class DocumentDeleteResponse(BaseModel):
    """
    Schema for delete endpoint response.
    
    Example:
    {
        "message": "Document deleted successfully",
        "document_id": "507f1f77bcf86cd799439011",
        "filename": "resume.pdf"
    }
    
    Attributes:
        message: Confirmation message
        document_id: ID of deleted document
        filename: Filename that was deleted
    """
    
    message: str = Field(..., description="Confirmation message")
    document_id: str = Field(..., description="ID of deleted document")
    filename: str = Field(..., description="Filename that was deleted")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Document deleted successfully",
                "document_id": "507f1f77bcf86cd799439011",
                "filename": "resume.pdf"
            }
        }


class UploadResponse(BaseModel):
    """
    Schema for successful file upload response.
    
    Returned when file is successfully uploaded and metadata saved.
    
    Example:
    {
        "message": "File uploaded successfully",
        "document_id": "507f1f77bcf86cd799439011",
        "filename": "resume.pdf",
        "file_size": 245632,
        "file_type": "application/pdf",
        "status": "uploaded"
    }
    
    Attributes:
        message: Confirmation message
        document_id: ID for future reference
        filename: Name of uploaded file
        file_size: Size in bytes
        file_type: MIME type
        status: Current status (always "uploaded" on success)
    """
    
    message: str = Field(..., description="Success message")
    document_id: str = Field(..., description="Document ID")
    filename: str = Field(..., description="Uploaded filename")
    file_size: int = Field(..., description="File size in bytes")
    file_type: str = Field(..., description="MIME type")
    status: str = Field(..., description="Status (uploaded)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "File uploaded successfully",
                "document_id": "507f1f77bcf86cd799439011",
                "filename": "resume.pdf",
                "file_size": 245632,
                "file_type": "application/pdf",
                "status": "uploaded"
            }
        }


class EmbeddingResponse(BaseModel):
    """
    Schema for document embedding generation response.
    
    Returned after successfully generating embeddings for all chunks
    of a document.
    
    Example:
    {
        "document_id": "507f1f77bcf86cd799439011",
        "chunks_processed": 42,
        "status": "completed"
    }
    
    Attributes:
        document_id: Document identifier
        chunks_processed: Number of chunks embedded
        status: Embedding generation status ("completed" or "failed")
    """
    
    document_id: str = Field(..., description="Document ID")
    chunks_processed: int = Field(..., ge=0, description="Number of chunks embedded")
    status: str = Field(..., description="Embedding status (completed or failed)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "document_id": "507f1f77bcf86cd799439011",
                "chunks_processed": 42,
                "status": "completed"
            }
        }
