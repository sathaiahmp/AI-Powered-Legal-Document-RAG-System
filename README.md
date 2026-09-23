# AI Legal Document Analyzer

A full-stack application for analyzing legal documents using AI. This project leverages a FastAPI backend with RAG (Retrieval-Augmented Generation) capabilities and a Next.js frontend for a seamless user experience.

## Project Structure

- **Backend**: Python-based API using FastAPI, LangChain, and FAISS for vector storage. Handles document processing, embedding, and AI analysis.
- **Frontend**: Next.js application providing a modern interface for uploading documents and viewing analysis results.

## Prerequisites

- **Docker Desktop**: Ensure Docker Desktop is installed and running.
- **Git**: For cloning the repository.

## Getting Started (Docker)

The easiest way to run the application is using Docker Compose.

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd "AI Legal Document Analyzer"
    ```

2.  **Start the application**:
    ```bash
    docker-compose up --build -d
    ```

3.  **Access the services**:
    - **Frontend**: [http://localhost:3000](http://localhost:3000)
    - **Backend API**: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)

4.  **Stop the application**:
    ```bash
    docker-compose down
    ```

## Manual Setup

If you prefer to run the services locally without Docker, refer to the README files in the respective directories:

- [Backend README](./Backend/README.md)
- [Frontend README](./Frontend/README.md)

## Features

- **Document Upload**: Support for PDF, DOCX, and TXT files.
- **AI Analysis**: Ask questions about your legal documents.
- **Summarization**: Get comprehensive summaries of uploaded files.
- **Analytics**: Track query intents and confidence scores.

## License

This project is licensed under the MIT License - see the [LICENSE](Backend/LICENSE) file for details.
