"""
Document service layer for handling file uploads and metadata management.

This service handles:
1. File validation (extension, size, MIME type)
2. File storage on disk
3. Metadata storage in MongoDB
4. Document querying and deletion
5. File cleanup on deletion

Architecture:
- Service receives UploadFile from FastAPI
- Validates file
- Saves to disk at backend/uploads/{user_id}/{filename}
- Stores metadata in MongoDB documents collection
- Returns document info to client
- On deletion: removes both file and metadata
"""

import os
import shutil
from datetime import datetime
from pathlib import Path
from typing import List

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db.database import get_database
from app.models.document import Document


# ============================================================================
# CONFIGURATION
# ============================================================================

# Base directory for file uploads
UPLOADS_DIR = Path(__file__).parent.parent.parent / "uploads"

# Allowed file types (MIME types)
ALLOWED_MIME_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/plain": "txt",
    "text/csv": "csv",
}

# Maximum file size: 50 MB
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB in bytes


class DocumentService:
    """
    Service for document upload and management operations.
    
    Handles the business logic for:
    - Validating uploaded files
    - Saving files to disk
    - Storing metadata in MongoDB
    - Querying documents
    - Deleting documents
    
    All methods are async because they interact with Motor (async MongoDB).
    """
    
    @staticmethod
    async def _get_documents_collection() -> any:
        """
        Get MongoDB documents collection.
        
        Returns:
            Motor AsyncIOMotorCollection for documents
        """
        db: AsyncIOMotorDatabase = get_database()
        return db["documents"]
    
    @staticmethod
    def _create_uploads_dir() -> None:
        """
        Create uploads directory if it doesn't exist.
        
        Creates:
        - backend/uploads/
        
        Safe to call multiple times (mkdir -p behavior).
        """
        UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    
    @staticmethod
    def _validate_file(filename: str, file_size: int, content_type: str) -> tuple[bool, str]:
        """
        Validate uploaded file.
        
        Checks:
        1. File extension is allowed
        2. File size is within limit
        3. MIME type is allowed
        4. Filename is not empty
        
        Validation Process:
        - Get extension from filename
        - Check if MIME type is in ALLOWED_MIME_TYPES
        - Check if file_size <= MAX_FILE_SIZE
        - Return (is_valid, error_message)
        
        Security Note:
        - Never trust client's content_type alone
        - Check extension and MIME type
        - Reject if mismatch (e.g., .exe with document MIME type)
        
        Args:
            filename: Original filename from upload
            file_size: Size in bytes
            content_type: MIME type from Content-Type header
            
        Returns:
            (is_valid: bool, error_message: str or empty string)
        """
        # Check filename not empty
        if not filename or len(filename) == 0:
            return False, "Filename cannot be empty"
        
        # Extract extension from filename
        # Example: "resume.pdf" -> ".pdf" -> "pdf"
        file_ext = Path(filename).suffix.lower()
        
        # Check if MIME type is allowed
        if content_type not in ALLOWED_MIME_TYPES:
            allowed = ", ".join(ALLOWED_MIME_TYPES.keys())
            return False, f"File type {content_type} not allowed. Allowed: {allowed}"
        
        # Check if file size exceeds limit
        if file_size > MAX_FILE_SIZE:
            max_mb = MAX_FILE_SIZE / (1024 * 1024)
            return False, f"File size exceeds {max_mb}MB limit"
        
        # Get expected extension for this MIME type
        expected_ext = ALLOWED_MIME_TYPES.get(content_type)
        
        # Check if file extension matches MIME type
        # This prevents .exe files with document MIME type
        if file_ext != f".{expected_ext}":
            return False, f"File extension {file_ext} doesn't match MIME type {content_type}"
        
        # All checks passed
        return True, ""
    
    @staticmethod
    async def upload_document(
        file_content: bytes,
        filename: str,
        file_size: int,
        content_type: str,
        user_id: str,
    ) -> Document:
        """
        Upload a document: save file and store metadata.
        
        Process:
        1. Validate file
        2. Create user-specific directory
        3. Save file to disk
        4. Store metadata in MongoDB
        5. Return Document object
        
        File Organization:
        Files saved to: backend/uploads/{user_id}/{filename}
        Example: backend/uploads/507f1f77bcf86cd799439012/resume.pdf
        
        Why organize by user_id?
        - Easy to delete all files for user
        - Prevents name collisions between users
        - Can easily move to cloud storage per user
        
        Metadata Stored:
        - user_id: Who uploaded it
        - filename: Original filename
        - file_type: MIME type
        - file_size: Bytes
        - upload_date: When uploaded
        - status: "uploaded" (ready for processing)
        - file_path: Full path on disk
        - storage_key: Unique ID for file
        
        Args:
            file_content: Raw file bytes
            filename: Original filename
            file_size: File size in bytes
            content_type: MIME type (e.g., "application/pdf")
            user_id: User who uploaded (from JWT token)
            
        Returns:
            Document object with metadata
            
        Raises:
            ValueError: If file validation fails
        """
        # Validate file
        is_valid, error_msg = DocumentService._validate_file(filename, file_size, content_type)
        if not is_valid:
            raise ValueError(error_msg)
        
        # Create uploads directory if needed
        DocumentService._create_uploads_dir()
        
        # Create user-specific directory
        user_dir = UPLOADS_DIR / user_id
        user_dir.mkdir(parents=True, exist_ok=True)
        
        # Save file to disk
        file_path = user_dir / filename
        
        # Write file content to disk
        # Using synchronous write (FastAPI handles in threadpool for async)
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        # Create document metadata
        storage_key = f"{user_id}_{filename}"
        document = Document(
            user_id=user_id,
            filename=filename,
            file_type=content_type,
            file_size=file_size,
            file_path=str(file_path.relative_to(UPLOADS_DIR.parent)),  # Relative path from project root
            storage_key=storage_key,
            upload_date=datetime.utcnow(),
            status="uploaded",
        )
        
        # Store metadata in MongoDB
        documents_collection = await DocumentService._get_documents_collection()
        result = await documents_collection.insert_one(
            document.model_dump(by_alias=True, exclude_none=True)
        )
        
        # Set the MongoDB-generated _id
        document.id = str(result.inserted_id)
        
        return document
    
    @staticmethod
    async def list_documents(
        user_id: str,
        skip: int = 0,
        limit: int = 10,
    ) -> tuple[List[Document], int]:
        """
        List documents for a user with pagination.
        
        Query:
        db.documents.find({user_id: "..."})
                    .skip(skip)
                    .limit(limit)
        
        Pagination:
        - skip: How many documents to skip
        - limit: Max documents to return
        
        Example: skip=10, limit=5 returns documents 11-15
        
        Returns both list and total count so client can:
        - Display "Showing 1-5 of 25 documents"
        - Implement pagination UI
        
        Args:
            user_id: User to list documents for
            skip: Number of documents to skip
            limit: Max documents to return
            
        Returns:
            (documents: List[Document], total: int)
        """
        documents_collection = await DocumentService._get_documents_collection()
        
        # Query documents for user
        # Sort by upload_date descending (newest first)
        cursor = documents_collection.find({"user_id": user_id}).sort(
            "upload_date", -1  # -1 = descending (newest first)
        ).skip(skip).limit(limit)
        
        # Convert cursor results to Document objects
        documents = []
        async for doc in cursor:
            documents.append(Document(**doc))
        
        # Get total count of documents for user
        total = await documents_collection.count_documents({"user_id": user_id})
        
        return documents, total
    
    @staticmethod
    async def get_document(document_id: str, user_id: str) -> Document | None:
        """
        Get a single document by ID.
        
        Security: Check that document belongs to user (user_id match)
        This prevents users from accessing other users' documents
        
        Query:
        db.documents.findOne({
            "_id": ObjectId("..."),
            "user_id": "..."
        })
        
        Args:
            document_id: MongoDB ObjectId as string
            user_id: User who should own this document
            
        Returns:
            Document if found and belongs to user, None otherwise
        """
        from bson import ObjectId
        
        documents_collection = await DocumentService._get_documents_collection()
        
        try:
            doc = await documents_collection.find_one({
                "_id": ObjectId(document_id),
                "user_id": user_id,
            })
            
            if not doc:
                return None
            
            return Document(**doc)
        except Exception:
            # ObjectId conversion failed or other error
            return None
    
    @staticmethod
    async def delete_document(document_id: str, user_id: str) -> bool:
        """
        Delete a document (remove file and metadata).
        
        Process:
        1. Find document in MongoDB
        2. Verify user owns it (security)
        3. Delete file from disk
        4. Delete metadata from MongoDB
        5. Return success/failure
        
        Error Handling:
        - If file doesn't exist: still delete metadata
        - If metadata doesn't exist: file already deleted
        - Both operations are attempted (file AND metadata)
        
        Args:
            document_id: MongoDB ObjectId as string
            user_id: User deleting (must be owner)
            
        Returns:
            True if deleted, False if not found or access denied
        """
        from bson import ObjectId
        
        documents_collection = await DocumentService._get_documents_collection()
        
        try:
            # Find document to get file path
            doc = await documents_collection.find_one({
                "_id": ObjectId(document_id),
                "user_id": user_id,
            })
            
            if not doc:
                return False
            
            # Delete file from disk
            if "file_path" in doc:
                file_path = Path(__file__).parent.parent.parent.parent / doc["file_path"]
                if file_path.exists():
                    file_path.unlink()  # Delete file
            
            # Delete metadata from MongoDB
            result = await documents_collection.delete_one({
                "_id": ObjectId(document_id),
                "user_id": user_id,
            })
            
            return result.deleted_count == 1
        except Exception:
            return False


# Singleton instance
document_service = DocumentService()
