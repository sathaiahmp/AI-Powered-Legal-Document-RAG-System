# AI Legal Document Analyzer - Backend

The backend service for the AI Legal Document Analyzer, built with FastAPI. It handles document processing, vector storage (FAISS), and RAG (Retrieval-Augmented Generation) pipelines.

## Features

- **FastAPI**: High-performance API framework.
- **RAG Pipeline**: Integrates with LLMs for intelligent document analysis.
- **Vector Database**: Uses FAISS for efficient similarity search.
- **Document Processing**: Supports PDF, DOCX, and TXT formats.

## Requirements

- Python 3.10+
- Dependencies listed in `requirements.txt`

## Local Setup (Without Docker)

1.  **Create a virtual environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

2.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Environment Variables**:
    Create a `.env` file in this directory. You can use `.env.example` as a template.
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run the application**:
    ```bash
    uvicorn api_app:app --reload --host 0.0.0.0 --port 8000
    ```

## API Documentation

Once running, access the interactive API docs at:
[http://localhost:8000/docs](http://localhost:8000/docs)

## Directory Structure

- `api_app.py`: Main entry point for the FastAPI application.
- `rag_pipeline.py`: Logic for Retrieval-Augmented Generation.
- `vector_database.py`: Handles document indexing and retrieval.
- `pdfs/`: Directory where uploaded documents are stored.
- `vectorstore/`: Directory where FAISS indices are persisted.
