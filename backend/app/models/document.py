"""
MongoDB Document model for storing document metadata.

This model represents a document uploaded by a user in the system.
Stores metadata about the document (who uploaded, when, file info)
but NOT the actual file content (that's stored on disk).

Architecture:
- Document files: stored in backend/uploads/
- Document metadata: stored in MongoDB
- MongoDB record contains reference to file, not the file itself
- This separation allows efficient querying and management

Why separate metadata from files?
1. Database efficient: small metadata vs large file contents
2. Easy deletion: remove MongoDB record + delete file from disk
3. Queryable: search documents by metadata (date, type, etc)
4. Scalable: can move files to S3/cloud storage independently
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Document(BaseModel):
    """
    Document model representing a file uploaded by a user.
    
    Fields:
        id: MongoDB ObjectId (auto-generated, unique)
        user_id: Reference to User._id (who uploaded this)
        filename: Original filename (e.g., "resume.pdf")
        file_type: MIME type (e.g., "application/pdf")
        file_size: File size in bytes
        upload_date: When document was uploaded (timestamp)
        status: Processing status ("uploaded", "processing", "indexed")
        file_path: Relative path where file is saved (e.g., "uploads/507f.../resume.pdf")
        storage_key: Unique identifier for the file on disk
    
    Example MongoDB document:
    {
        "_id": ObjectId("507f1f77bcf86cd799439011"),
        "user_id": ObjectId("507f1f77bcf86cd799439012"),
        "filename": "resume.pdf",
        "file_type": "application/pdf",
        "file_size": 245632,
        "upload_date": ISODate("2024-05-24T10:30:00Z"),
        "status": "uploaded",
        "file_path": "uploads/507f1f77bcf86cd799439011/resume.pdf",
        "storage_key": "507f1f77bcf86cd799439011_resume"
    }
    
    Why store file_path in metadata?
    - Quick reference for deletion/retrieval
    - Track where file is stored
    - Allow file organization in subdirectories
    - Enable file migration later (e.g., S3 upload)
    """
    
    # Document identification
    id: Optional[str] = Field(default=None, alias="_id", description="MongoDB ObjectId")
    user_id: str = Field(..., description="User who uploaded this document")
    
    # File information
    filename: str = Field(..., min_length=1, max_length=255, description="Original filename")
    file_type: str = Field(..., description="MIME type (e.g., application/pdf)")
    file_size: int = Field(..., ge=1, description="File size in bytes")
    
    # Storage and status
    file_path: str = Field(..., description="Path where file is saved on disk")
    storage_key: str = Field(..., description="Unique identifier for storage")
    
    # Timestamp
    upload_date: datetime = Field(default_factory=datetime.utcnow, description="Upload timestamp")
    
    # Processing
    status: str = Field(default="uploaded", description="Status: uploaded, processing, indexed, error")
    
    class Config:
        """Pydantic configuration for Document model."""
        # Allow both "id" and "_id" field names
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "user_id": "507f1f77bcf86cd799439012",
                "filename": "research_paper.pdf",
                "file_type": "application/pdf",
                "file_size": 1024000,
                "upload_date": "2024-05-24T10:30:00Z",
                "status": "uploaded",
                "file_path": "uploads/507f1f77bcf86cd799439011/research_paper.pdf",
                "storage_key": "507f1f77bcf86cd799439011_research_paper"
            }
        }
