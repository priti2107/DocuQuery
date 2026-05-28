"""
LLM Service for RAG Chat - Final RAG Pipeline Layer

Completes the RAG pipeline:
User Query → Retrieval → Context Injection → LLM → AI Answer

Provides methods to:
1. Build RAG prompts with retrieved context
2. Call local Ollama LLM models
3. Parse and format LLM responses

The LLMService integrates with RetrievalService to create a complete
chatbot that answers questions based on uploaded document context.

Architecture:
- Calls Ollama API (http://localhost:11434/api/generate)
- Uses local models (tinyllama, mistral)
- Requires Ollama to be running locally
- Integrates semantic retrieval for context injection
- Handles streaming and non-streaming responses
"""

import logging
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class LLMService:
    """
    Service for generating LLM responses using retrieved document context.
    
    Responsibilities:
    - Build RAG prompts with retrieved chunks as context
    - Call Ollama local LLM API
    - Parse and format LLM responses
    - Handle errors gracefully
    - Log all steps for debugging
    
    Configuration:
    - Ollama API endpoint: http://localhost:11434/api/generate
    - Models: tinyllama (fast), mistral (better quality)
    - Timeout: 300 seconds (LLM inference can be slow)
    
    Requirements:
    - Ollama must be running locally with a model
    - Command: ollama run mistral (or tinyllama)
    """
    
    # Ollama API configuration
    OLLAMA_API_URL = "http://localhost:11434/api/generate"
    DEFAULT_MODEL = "mistral"
    REQUEST_TIMEOUT = 300.0  # 5 minutes for LLM inference
    
    @staticmethod
    def build_rag_prompt(query: str, chunks: List[Dict[str, Any]]) -> str:
        """
        Build a RAG prompt with retrieved context and user query.
        
        Formats the prompt to:
        1. Include all retrieved chunks as context
        2. Clearly present the user query
        3. Give instructions to answer from context only
        
        Args:
            query (str): User's question/query
            chunks (List[Dict]): Retrieved chunks from retrieval_service
                                 Each chunk has: content, score, chunk_index, document_id
            
        Returns:
            str: Formatted RAG prompt for LLM
            
        Example:
            >>> chunks = [
            ...     {"content": "FastAPI is a web framework", "score": 0.92, ...},
            ...     {"content": "Python is used for APIs", "score": 0.88, ...}
            ... ]
            >>> prompt = LLMService.build_rag_prompt("What is FastAPI?", chunks)
            >>> len(prompt) > 100
            True
        """
        logger.info(f"🔨 Building RAG prompt with {len(chunks)} chunks for query: '{query[:60]}...'")
        
        # Format retrieved chunks as context
        context_text = "\n\n".join([
            f"[Chunk {i+1}]\n{chunk.get('content', '')}"
            for i, chunk in enumerate(chunks)
        ])
        
        # Build the full prompt with instructions
        prompt = f"""Context:
{context_text if context_text else "No relevant context found."}

Question:
{query}

Instructions:
- Answer ONLY using the provided context above
- Be concise and direct
- If the answer is not found in the context, respond with: "I could not find relevant information in the uploaded documents."
- Do NOT make up or assume information not in the context

Answer:"""
        
        logger.info(f"✅ RAG prompt built: {len(prompt)} characters, {len(chunks)} context chunks")
        logger.debug(f"Prompt preview: {prompt[:200]}...")
        
        return prompt
    
    @staticmethod
    async def generate_answer(
        query: str,
        chunks: List[Dict[str, Any]],
        model: str = DEFAULT_MODEL
    ) -> Dict[str, Any]:
        """
        Generate LLM answer using retrieved context.
        
        Process:
        1. Build RAG prompt with context
        2. Call Ollama API
        3. Parse LLM response
        4. Return formatted answer with metadata
        
        Args:
            query (str): User's question
            chunks (List[Dict]): Retrieved context chunks
            model (str): Ollama model name (default: mistral)
            
        Returns:
            Dict with keys:
            - answer (str): Generated answer from LLM
            - query (str): Original query echoed back
            - model (str): Model used for generation
            - num_chunks (int): Number of context chunks used
            - timestamp (str): ISO format timestamp
            
        Raises:
            ValueError: If query or chunks invalid
            RuntimeError: If Ollama API unreachable or fails
            
        Example:
            >>> result = await LLMService.generate_answer(
            ...     "What databases are used?",
            ...     [{"content": "MongoDB is used", "score": 0.95}],
            ...     model="mistral"
            ... )
            >>> result["answer"]
            "MongoDB is used in this project."
        """
        logger.info(f"🤖 Generating LLM answer using model: {model}")
        
        if not query or not query.strip():
            logger.error("Query is empty")
            raise ValueError("Query cannot be empty")
        
        if not chunks:
            logger.warning("No context chunks provided for answer generation")
            chunks = []
        
        try:
            # Step 1: Build RAG prompt
            prompt = LLMService.build_rag_prompt(query, chunks)
            
            # Step 2: Prepare Ollama API call
            logger.info(f"📡 Calling Ollama API at {LLMService.OLLAMA_API_URL}")
            
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False  # Non-streaming for simpler response parsing
            }
            
            logger.debug(f"Ollama request payload: model={model}, prompt_length={len(prompt)}")
            
            # Step 3: Call Ollama API
            async with httpx.AsyncClient(timeout=LLMService.REQUEST_TIMEOUT) as client:
                response = await client.post(
                    LLMService.OLLAMA_API_URL,
                    json=payload
                )
            
            if response.status_code != 200:
                logger.error(f"Ollama API error: {response.status_code}")
                logger.debug(f"Response: {response.text[:200]}")
                raise RuntimeError(
                    f"Ollama API returned {response.status_code}: {response.text}"
                )
            
            # Step 4: Parse response
            response_data = response.json()
            answer_text = response_data.get("response", "").strip()
            
            if not answer_text:
                logger.warning("Ollama returned empty response")
                answer_text = "I could not generate a response. Please try again."
            
            logger.info(f"✅ LLM answer generated: {len(answer_text)} characters")
            logger.debug(f"Answer preview: {answer_text[:100]}...")
            
            # Step 5: Format and return result
            result = {
                "answer": answer_text,
                "query": query,
                "model": model,
                "num_chunks": len(chunks),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            
            logger.info(f"🎉 Answer generation complete")
            return result
            
        except httpx.ConnectError as e:
            logger.error(f"❌ Cannot connect to Ollama at {LLMService.OLLAMA_API_URL}")
            logger.error(f"   Make sure Ollama is running: ollama run mistral")
            raise RuntimeError(
                f"Ollama API unreachable at {LLMService.OLLAMA_API_URL}. "
                f"Please ensure Ollama is running locally: 'ollama run mistral'"
            ) from e
        
        except httpx.TimeoutException as e:
            logger.error(f"❌ Ollama API timeout after {LLMService.REQUEST_TIMEOUT}s")
            raise RuntimeError(
                f"Ollama API timeout. LLM inference took too long."
            ) from e
        
        except Exception as e:
            logger.error(f"❌ LLM answer generation failed: {str(e)}")
            raise RuntimeError(f"LLM answer generation failed: {str(e)}") from e


# Singleton instance for use in endpoints
llm_service = LLMService()
