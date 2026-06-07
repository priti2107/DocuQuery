import { authStore } from "@/store/authStore";

const BASE_URL = "http://localhost:8000";

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface DocumentResponse {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  status: string;
}

export interface UploadResponse {
  message: string;
  document_id: string;
  filename: string;
  file_size: number;
  file_type: string;
  status: string;
}

export interface DocumentListResponse {
  documents: DocumentResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface EmbeddingResponse {
  message: string;
  document_id: string;
  chunks_embedded: number;
  embedding_model: string;
}

export interface SearchResultChunk {
  chunk_index: number;
  score: number;
  content: string;
  document_id: string;
  chunk_size: number;
}

export interface SearchResponse {
  query: string;
  matches: SearchResultChunk[];
}

export interface ChatSourceMetadata {
  document_id: string;
  chunk_index: number;
  score: number;
}

export interface ChatResponse {
  query: string;
  answer: string;
  sources: ChatSourceMetadata[];
  model: string;
  num_chunks: number;
}

// ============================================================================
// DOCUMENT SERVICE
// ============================================================================

export class DocumentService {
  /**
   * Helper to perform fetch requests with error handling and auth.
   * Automatically injects Bearer token and handles FormData.
   */
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    // Set headers - don't override Content-Type for FormData
    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    // Add authorization header if token exists
    const token = authStore.getToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = "An error occurred";
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Upload a document file.
   *
   * Sends multipart/form-data with the file to POST /documents/upload.
   * Automatically triggers text extraction and chunking on backend.
   *
   * @param file - The file to upload
   * @param onProgress - Optional callback for upload progress
   * @returns Upload response with document_id and metadata
   * @throws Error if upload fails
   */
  static async uploadDocument(
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    // Create XMLHttpRequest for progress tracking if callback provided
    if (onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const token = authStore.getToken();

        // Track upload progress
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });

        // Handle completion
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText) as UploadResponse;
              resolve(response);
            } catch {
              reject(new Error("Failed to parse upload response"));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.detail || "Upload failed"));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        // Handle errors
        xhr.addEventListener("error", () => {
          reject(new Error("Upload request failed"));
        });

        // Configure and send request
        xhr.open("POST", `${BASE_URL}/documents/upload`);
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }
        xhr.send(formData);
      });
    }

    // Without progress tracking, use standard fetch
    return this.request<UploadResponse>("/documents/upload", {
      method: "POST",
      body: formData,
    });
  }

  /**
   * List documents for the current user.
   *
   * @param skip - Number of documents to skip (for pagination)
   * @param limit - Maximum documents to return (default 10)
   * @returns List of documents and pagination info
   * @throws Error if request fails
   */
  static async listDocuments(
    skip: number = 0,
    limit: number = 10,
  ): Promise<DocumentListResponse> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    const rawResponse = await this.request<any>(
      `/documents?${params.toString()}`,
      { method: "GET" },
    );

    // Normalise: backend may return a flat array OR { documents: [...], total, skip, limit }
    const docArray: any[] = Array.isArray(rawResponse)
      ? rawResponse
      : Array.isArray(rawResponse?.documents)
        ? rawResponse.documents
        : [];

    const total: number = Array.isArray(rawResponse)
      ? rawResponse.length
      : rawResponse?.total ?? rawResponse?.length ?? docArray.length;

    // Always map _id → id so the UI's selectedDocId is never undefined
    const normalised = docArray.map((doc: any) => ({
      ...doc,
      id: doc.id ?? doc._id ?? "",
    }));

    return {
      documents: normalised,
      total,
      skip: rawResponse?.skip ?? 0,
      limit: rawResponse?.limit ?? limit,
    } as DocumentListResponse;
  }

  /**
   * Delete a document.
   *
   * Removes document metadata, chunks, and uploaded file.
   *
   * @param documentId - The ID of the document to delete
   * @returns Deletion confirmation
   * @throws Error if deletion fails
   */
  static async deleteDocument(
    documentId: string,
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/documents/${documentId}`, {
      method: "DELETE",
    });
  }

  /**
   * Generate embeddings for a document's chunks.
   *
   * This is required before using the document for RAG search/chat.
   * In production, this would be auto-triggered after chunking.
   * For now, it's a manual step to enable end-to-end testing.
   *
   * @param documentId - The ID of the document
   * @returns Embedding generation confirmation
   * @throws Error if embedding generation fails
   */
  static async generateEmbeddings(
    documentId: string,
  ): Promise<EmbeddingResponse> {
    return this.request<EmbeddingResponse>(
      `/documents/${documentId}/generate-embeddings`,
      { method: "POST" },
    );
  }

  /**
   * Perform semantic search across all documents.
   *
   * Uses embeddings to find semantically similar chunks to the query.
   * Returns top-k most relevant chunks ranked by cosine similarity.
   *
   * @param query - The search query
   * @param topK - Number of top results to return (default 5)
   * @param topK - Number of top results to return (default 10)
   * @returns Search results with matched chunks
   * @throws Error if search fails
   */
  static async searchDocuments(
    query: string,
    documentId?: string,
    topK: number = 10,
  ): Promise<SearchResponse> {
    return this.request<SearchResponse>(`/documents/search?top_k=${topK}`, {
      method: "POST",
      body: JSON.stringify({ query, document_id: documentId }),
    });
  }

  /**
   * RAG Chat - Answer questions using document context.
   *
   * Complete RAG pipeline:
   * 1. Convert query to embedding
   * 2. Retrieve relevant chunks via semantic similarity
   * 3. Build context-aware prompt
   * 4. Generate answer using local Ollama LLM
   * 5. Return answer with source citations
   *
   * Requires:
   * - Documents uploaded and embeddings generated
   * - Ollama running locally (ollama run mistral)
   *
   * @param query - The question to answer
   * @param documentId - Optional document ID to restrict chat context
   * @param topK - Number of context chunks to use (default 10)
   * @returns RAG response with answer and sources
   * @throws Error if chat/LLM fails
   */
  static async chatWithDocuments(
    query: string,
    documentId?: string,
    topK: number = 10,
  ): Promise<ChatResponse> {
    return this.request<ChatResponse>(`/documents/chat?top_k=${topK}`, {
      method: "POST",
      body: JSON.stringify({ query, document_id: documentId }),
    });
  }
}
