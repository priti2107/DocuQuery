#  DocuQuery — RAG Document Intelligence Platform

> An enterprise-grade Retrieval-Augmented Generation (RAG) platform that lets users upload documents and query them using natural language — with source-cited answers powered by LLMs.

##  Problem Statement

Organizations spend countless hours manually searching through:

- PDFs
- Reports
- DOCX files
- CSV datasets
- Text documents

to find specific information.

**DocuQuery** solves this problem by combining document ingestion, semantic chunking, vector embeddings, similarity search, and large language models (LLMs) to provide accurate, source-grounded answers in seconds.

---

##  Key Features

###  Document Processing
- Multi-format upload (PDF, DOCX, CSV, TXT)
- Text extraction and preprocessing
- Semantic chunking & recursive text splitting
- Embedding generation using Sentence Transformers

###  RAG Question Answering
- Natural language querying across documents
- Top-k semantic retrieval
- LLM-generated answers with source citations
- Multi-document cross-query support

###  Authentication & User Management
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access (Free vs Pro)

###  Analytics & Feedback
- Query history tracking
- User feedback (thumbs up/down)
- Usage analytics dashboard

###  Deployment
- Dockerized backend
- Vercel frontend deployment
- Render backend deployment
- CI/CD with GitHub Actions

---

## 🏗️ Technology Stack

| Layer | Technology |
|------|------------|
| Backend API | Python, FastAPI |
| Frontend | React / Next.js |
| Database | MongoDB Atlas |
| Vector Store | FAISS / Pinecone |
| Embeddings | Sentence-Transformers |
| LLM | OpenAI GPT-4o / Llama |
| Authentication | JWT, Passlib |
| Containerization | Docker |
| File Storage | AWS S3 |
| Deployment | Render, Vercel |

---

## 🏛️ Architecture Overview

```text
User Upload (PDF/DOCX/CSV/TXT)
          │
          ▼
   Document Parsing
          │
          ▼
   Semantic Chunking
          │
          ▼
Vector Embedding (Sentence-Transformers)
          │
          ▼
  Vector Store (FAISS / Pinecone)
          │
     ─────┴─────
     │         │
   Query     Index
     │         │
     ▼         ▼
Semantic Search → Top-K Relevant Chunks
          │
          ▼
OpenAI GPT-4o / Llama + Context
          │
          ▼
Answer with Source Citations → User
