"""
MongoDB DocumentChunk model for storing text chunks.

This model represents individual chunks of extracted text from documents.

Why Chunks?
===========
Documents are too large for embeddings. We split into chunks:

Example:
Document (50,000 characters) 
    → Split into 50 chunks × 1000 chars each
    → Each chunk gets embedded
    → Vector database stores all 50 chunks
    → Query retrieves most relevant chunks
    → Chunks passed to LLM with context

This enables:
- Efficient storage (don't embed entire document)
- Relevant search (retrieve specific sections)
- Context windows (LLM has room for instructions + chunks + prompt)

MongoDB Collection: document_chunks
One document per chunk - thousands of chunks per uploaded document
"""

from datetime import datetime
from typing import Any, Optional

from bson import ObjectId
from pydantic import BaseModel, Field, field_validator


class DocumentChunk(BaseModel):
    """
    Model representing a single chunk of text from a document.
    
    Attributes:
        id: MongoDB ObjectId (unique chunk identifier)
        document_id: Reference to parent Document._id (which doc this came from)
        user_id: User who owns this document (for access control)
        chunk_index: 0-based index of this chunk (chunk 0, chunk 1, etc)
        content: The actual text content of this chunk
        chunk_size: Length of content in characters
        embedding_status: Whether embedding has been created (future task)
        embedding_vector: The vector embedding (future - after Task 8)
        created_at: When chunk was created
        updated_at: Last update timestamp
    
    Example MongoDB document:
    {
        "_id": ObjectId("507f1f77bcf86cd799439011"),
        "document_id": ObjectId("507f1f77bcf86cd799439010"),
        "user_id": "507f1f77bcf86cd799439012",
        "chunk_index": 0,
        "content": "This is the first chunk of the document...",
        "chunk_size": 1024,
        "embedding_status": "pending",
        "embedding_vector": null,
        "created_at": ISODate("2024-05-25T10:30:00Z"),
        "updated_at": ISODate("2024-05-25T10:30:00Z")
    }
    """
    
    # Identification
    id: Optional[str] = Field(default=None, alias="_id", description="MongoDB ObjectId")
    document_id: str = Field(..., description="Parent document ID")
    user_id: str = Field(..., description="User who owns this document")
    
    # Chunk metadata
    chunk_index: int = Field(..., ge=0, description="0-based chunk position")
    content: str = Field(..., min_length=1, description="Actual chunk text content")
    chunk_size: int = Field(..., ge=1, description="Character count of content")
    
    # Embedding (prepared for future)
    embedding_status: str = Field(
        default="pending",
        description="Status: pending, embedded, failed"
    )
    embedding_vector: Optional[list[float]] = Field(
        default=None,
        description="Vector embedding (future - Task 8)"
    )
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation time")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update")
    
    @field_validator("id", mode="before")
    @classmethod
    def convert_object_id_to_string(cls, v: Any) -> str | None:
        """
        Pydantic v2 field validator for 'id' field.
        
        Converts MongoDB ObjectId to string automatically.
        Handles both direct ObjectId and alias _id from MongoDB.
        
        Args:
            v: Value to validate (ObjectId, string, or None)
            
        Returns:
            String representation of ObjectId or original value
        """
        if isinstance(v, ObjectId):
            return str(v)
        return v
    
    class Config:
        """Pydantic configuration for DocumentChunk model."""
        # Allow both "id" and "_id" field names
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "document_id": "507f1f77bcf86cd799439010",
                "user_id": "507f1f77bcf86cd799439012",
                "chunk_index": 0,
                "content": "This is the first chunk of text from the document...",
                "chunk_size": 1024,
                "embedding_status": "pending",
                "embedding_vector": None,
                "created_at": "2024-05-25T10:30:00Z",
                "updated_at": "2024-05-25T10:30:00Z"
            }
        }
