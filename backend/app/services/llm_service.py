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
    DEFAULT_MODEL = "llama3.2:1b"
    REQUEST_TIMEOUT = 300.0  # 5 minutes for LLM inference
    
    @staticmethod
    def build_rag_prompt(query: str, chunks: List[Dict[str, Any]]) -> str:
        """
        Build a RAG prompt with retrieved context and user query.
        
        Formats the prompt to:
        1. Include all retrieved chunks as context
        2. Clearly present the user query
        3. Give instructions to answer from context only
        """
        logger.info(f"🔨 Building RAG prompt with {len(chunks)} chunks for query: '{query[:60]}...'")
        
        # Reverse chunk order: most relevant chunk (index 0 = highest score) goes last
        # LLMs have recency bias — content closest to the Question line gets most attention
        ordered_chunks = list(reversed(chunks))
        
        # Format retrieved chunks as context (no mention of "Chunk" headers)
        context_text = "\n\n".join([
            chunk.get('content', '')
            for chunk in ordered_chunks
        ])
        
        # Detect if this is a summary query
        is_summary = False
        q_lower = query.lower()
        if any(kw in q_lower for kw in ["summar", "overview", "synopsis", "tldr", "tl;dr"]):
            is_summary = True
            
        if is_summary:
            prompt = f"""You are a document extraction assistant.

Answer ONLY using the provided context.

Rules:
- Summarize the main facts from the context.
- Do not add any introductory or concluding remarks.
- Do not add preambles, disclaimers, or safety warnings.
- Return ONLY the summary text.

Context:
{context_text if context_text else "NOT_FOUND"}

Question:
{query}

Answer:"""
        else:
            prompt = f"""You are a document extraction assistant.

Answer ONLY using the provided context.

Rules:
- Extract the value exactly as it appears in the context.
- Do not simplify, shorten, format, or omit any details.
- For lists or multiple items, separate them with commas on a single line.
- Return ONLY the exact extracted text.
- Do not explain, or add introductory/concluding text.
- If the answer is not in the context, return exactly: NOT_FOUND

Context:
{context_text if context_text else "NOT_FOUND"}

Question:
{query}

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
        """
        logger.info(f"🤖 Generating LLM answer using model: {model}")
        
        if not query or not query.strip():
            logger.error("Query is empty")
            raise ValueError("Query cannot be empty")
        
        if not chunks:
            logger.warning("No context chunks provided for answer generation. Returning NOT_FOUND.")
            return {
                "answer": "NOT_FOUND",
                "query": query,
                "model": model,
                "num_chunks": 0,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        
        try:
            # Step 1: Build RAG prompt
            prompt = LLMService.build_rag_prompt(query, chunks)

            # Step 2: Prepare Ollama API call
            logger.info(f"📡 Calling Ollama API at {LLMService.OLLAMA_API_URL}")
            
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False,  # Non-streaming for simpler response parsing
                "options": {
                    "temperature": 0.0,  # Low temperature for deterministic factual extraction
                    "top_p": 0.1,
                    "num_predict": 512,  # Limit response length for conciseness
                }
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

            # Normalize/clean answer to NOT_FOUND if it indicates failure or is empty
            answer_clean = answer_text.strip(" '\"`.,").strip()
            refusal_keywords = [
                "i cannot assist", "i cannot extract", "i cannot identify", 
                "i can't assist", "i am unable to", "i'm unable to",
                "not found", "information is not available", "not mention"
            ]
            if (not answer_clean or 
                answer_clean.upper() == "NOT_FOUND" or 
                any(kw in answer_clean.lower() for kw in refusal_keywords)):
                answer_text = "NOT_FOUND"
            else:
                answer_text = answer_clean
            
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
