"""
Pure utility functions for text chunking.

Text Splitting Strategy: RecursiveCharacterTextSplitter
=======================================================

WHY CHUNKING?
When using embeddings in RAG:
- Embeddings capture semantic meaning at ~1000 char resolution
- Chunks < 1000 chars lose context (fragments disconnected)
- Chunks > 1000 chars have multiple topics (retrieval hits wrong one)
- LLM context windows (4K-128K tokens) need room for: system prompt + query + chunks
- Typical: system prompt (500 tokens) + query (100 tokens) = 600 overhead
  → Remaining for chunks: 3400 tokens (if 4K model)
  → ~4-6 chunks × 1000 chars at 2-3 chars/token
  → Typical retrieval returns 3-5 chunks

CHUNK SIZE TRADEOFFS:
- chunk_size = 1000: 
  ✓ Balanced context (multiple sentences)
  ✓ Fits ~2 chunks per 4K context
  ✓ Industry standard (many RAG docs)
  ✗ May split important info across chunks
  
- chunk_size = 512:
  ✓ More chunks fit in context
  ✓ Faster embedding API calls
  ✗ Loses context (sentences fragmented)
  ✗ More API calls to same doc
  
- chunk_size = 2000:
  ✓ Preserves full paragraphs
  ✗ Uses 1 entire context window alone
  ✗ Wastes LLM context
  
Decision: 1000 chars (industry standard, semantic sweet spot)

CHUNK OVERLAP:
Why overlap? Without overlap:
"...end of chunk 1 (important context).
   START OF CHUNK 2 (depends on chunk 1)..."
   → Retriever might return only chunk 2
   → LLM has no chunk 1 context
   → Answer is incomplete

With 200-char overlap:
"...important context).
   START OF CHUNK 2 (depends on chunk 1)..." (repeated)
   → If only chunk 2 retrieved, context preserved
   → Typical: 20% overlap = 1000 * 0.2 = 200

RECURSIVE SPLITTING:
Hierarchical approach - preserve document structure:
1. Try splitting on paragraphs ("\n\n")
   → If chunk < 1000: Keep together (preserve paragraph meaning)
   → If chunk > 1000: Continue to step 2
   
2. Try splitting on sentences ("\n. ")
   → More granular than paragraphs
   → If chunk < 1000: Keep together
   → If chunk > 1000: Continue to step 3
   
3. Try splitting on words
   → Finest granularity
   → Always < 1000 (guaranteed fit)
   
4. Fall back to character split (shouldn't happen with 1000 limit)

Example:
```
Original document (3000 chars):
"Paragraph 1 (800 chars). Paragraph 2 (1200 chars). Paragraph 3 (1000 chars)."

Splitting on paragraphs (1000 chars, 200 overlap):
Chunk 0: [Paragraph 1 (800 chars)]
         (Too small to split further, keep as is)
         
Chunk 1: [End of Para 1 overlap (200 chars) + Para 2 (1200 chars) + start of Para 3]
         (Para 2 alone is > 1000, so recursively split on sentences)
         
Chunk 2: [Remainder of Para 2 + Para 3 + start next doc]
         (With 200 char overlap from chunk 1)
```

Result:
- Paragraph boundaries respected where possible
- Sentence boundaries respected where paragraphs too large
- Overlap ensures context preservation
- Semantic coherence maximized
"""

from typing import List, Tuple

from langchain_text_splitters import RecursiveCharacterTextSplitter


def create_text_splitter() -> RecursiveCharacterTextSplitter:
    """
    Factory function to create a configured RecursiveCharacterTextSplitter.
    
    Configuration:
    - chunk_size=1000: Size in characters (semantic sweet spot)
    - chunk_overlap=200: 20% overlap for context preservation
    - separators: Recursive hierarchy - paragraphs, sentences, words, chars
    
    Args:
        None
        
    Returns:
        Configured RecursiveCharacterTextSplitter instance
        
    Example:
        >>> splitter = create_text_splitter()
        >>> chunks = splitter.split_text(large_text)
        >>> len(chunks)  # Could be 30 chunks for 50K char document
    """
    return RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        # Hierarchy: Try splitting on these in order
        # Each level is more granular than the last
        separators=[
            "\n\n",      # Paragraph breaks (most coarse)
            "\n",        # Line breaks
            ". ",        # Sentence breaks
            " ",         # Word breaks
            "",          # Character breaks (fallback - shouldn't reach)
        ],
        length_function=len,  # Use character count, not token count
        is_separator_regex=False,  # Literal string separators, not regex
    )


def split_text_into_chunks(text: str) -> List[str]:
    """
    Split extracted document text into semantic chunks.
    
    Process:
    1. Create splitter with 1000 char / 200 overlap
    2. Apply recursive splitting (respects document structure)
    3. Return list of text chunks
    
    Args:
        text: Full extracted text from document
        
    Returns:
        List of text chunks (ordered, with overlap)
        
    Raises:
        ValueError: If text is empty or whitespace-only
        
    Example:
        >>> text = "Paragraph 1..." + "Paragraph 2..." (3000 chars)
        >>> chunks = split_text_into_chunks(text)
        >>> chunks  # [chunk1, chunk2, chunk3]
        >>> sum(len(c) for c in chunks)  # > 3000 (includes overlap)
    """
    if not text or not text.strip():
        raise ValueError("Cannot split empty or whitespace-only text")
    
    splitter = create_text_splitter()
    chunks = splitter.split_text(text)
    
    if not chunks:
        raise ValueError(
            "Text splitting resulted in empty chunks. "
            "This shouldn't happen unless text is malformed."
        )
    
    return chunks


def create_chunks_with_metadata(
    text: str,
    document_id: str,
    user_id: str,
) -> List[Tuple[int, str, int]]:
    """
    Split text into chunks and add metadata for MongoDB storage.
    
    For each chunk, prepare:
    - chunk_index: Position in sequence (0, 1, 2, ...)
    - content: The chunk text
    - chunk_size: Character length
    
    Args:
        text: Full extracted text
        document_id: MongoDB ObjectId of parent document (string)
        user_id: MongoDB ObjectId of user (string)
        
    Returns:
        List of tuples: (chunk_index, content, chunk_size)
        
    Example:
        >>> chunks_meta = create_chunks_with_metadata(
        ...     text="Large doc...",
        ...     document_id="507f1f77bcf86cd799439011",
        ...     user_id="user123"
        ... )
        >>> len(chunks_meta)  # 25 chunks
        >>> chunks_meta[0]
        (0, "First chunk content...", 1200)
    """
    chunks = split_text_into_chunks(text)
    
    chunks_with_metadata = [
        (
            chunk_index,  # Position in sequence
            chunk_content,  # The actual text
            len(chunk_content),  # Character count
        )
        for chunk_index, chunk_content in enumerate(chunks)
    ]
    
    return chunks_with_metadata
