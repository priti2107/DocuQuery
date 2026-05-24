"""
Text extraction service for document processing.

This service layer handles the business logic of text extraction:
1. Receives file content and metadata
2. Validates inputs
3. Calls appropriate text extractor
4. Returns structured extraction result
5. Handles errors gracefully

Service Layer Architecture:
- Routes (HTTP layer): Receive requests, validate HTTP details
- Service (this file): Business logic, independent of HTTP
- Utilities (file_extractors): Pure functions for extraction
- Database: Store results

Why async?
- Text extraction can be CPU-intensive (especially for large PDFs)
- FastAPI uses async/await for non-blocking operations
- Async service methods integrate seamlessly with async routes
- asyncio.to_thread() runs sync code without blocking event loop

RAG Pipeline Integration:
Step 1: Extract text (this service)
Step 2: Split into chunks (chunking_service - future)
Step 3: Create embeddings (embedding_service - future)
Step 4: Store in vector DB (vector_db_service - future)

This service handles Step 1.
"""

import asyncio
import logging
from typing import Tuple

from app.utils.file_extractors import extract_text_from_file


# Configure logging for this module
logger = logging.getLogger(__name__)


class ExtractionService:
    """
    Service for document text extraction.
    
    Handles extracting text from uploaded documents
    and preparing it for further RAG processing.
    
    Methods are async to integrate with Motor (async MongoDB)
    and FastAPI's async request handling.
    
    Usage Example:
        extraction_service = ExtractionService()
        text, length = await extraction_service.extract_text(
            file_content=file_bytes,
            file_type="application/pdf"
        )
    """
    
    @staticmethod
    async def extract_text(
        file_content: bytes,
        file_type: str
    ) -> Tuple[str, int]:
        """
        Extract text from uploaded file.
        
        This method wraps the synchronous file_extractors functions
        and runs them in a thread pool to avoid blocking the event loop.
        
        Why run sync code in thread?
        - Text extraction is CPU-bound (parsing, processing)
        - FastAPI event loop cannot be blocked by long operations
        - asyncio.to_thread() runs function in thread pool
        - Returns awaitable that doesn't block other requests
        
        Process:
        1. Validate inputs
        2. Run extractor in thread (non-blocking)
        3. Return extracted text and metadata
        4. Log results for monitoring
        
        Args:
            file_content: File bytes from upload
            file_type: MIME type (e.g., "application/pdf")
            
        Returns:
            Tuple of (extracted_text, character_count)
            - extracted_text: Full text content
            - character_count: Length of extracted text
            
        Raises:
            ValueError: If file_type not supported
            Exception: If extraction fails
        """
        # Validate inputs
        if not file_content:
            raise ValueError("File content is empty")
        
        if not file_type:
            raise ValueError("File type not specified")
        
        # Log extraction start
        logger.info(
            f"Starting text extraction for file type: {file_type}, "
            f"size: {len(file_content)} bytes"
        )
        
        try:
            # Run extraction in thread pool to avoid blocking event loop
            # asyncio.to_thread() is available in Python 3.9+
            extracted_text, char_count = await asyncio.to_thread(
                extract_text_from_file,
                file_content,
                file_type
            )
            
            # Log success
            logger.info(
                f"Successfully extracted text. "
                f"Characters: {char_count}, Words: {len(extracted_text.split())}"
            )
            
            return extracted_text, char_count
        
        except Exception as e:
            # Log failure with details
            logger.error(
                f"Text extraction failed for file type {file_type}: {str(e)}"
            )
            raise
    
    @staticmethod
    def get_extraction_status_message(char_count: int) -> str:
        """
        Generate status message for extraction result.
        
        Used in responses to give feedback on extraction quality.
        
        Args:
            char_count: Number of characters extracted
            
        Returns:
            Status message describing extraction
        """
        if char_count == 0:
            return "No text extracted"
        elif char_count < 100:
            return "Minimal text extracted"
        elif char_count < 1000:
            return "Small document"
        elif char_count < 10000:
            return "Medium document"
        else:
            return "Large document"


# Create singleton instance
# In production, this could be dependency-injected
extraction_service = ExtractionService()
