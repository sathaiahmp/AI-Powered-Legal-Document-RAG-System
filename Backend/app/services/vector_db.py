# enhanced_vector_database.py - Optimized Vector Operations
import os
import hashlib
import pickle
from pathlib import Path
from typing import List, Optional, Dict, Any
from langchain_community.document_loaders import (
    PDFPlumberLoader, 
    UnstructuredWordDocumentLoader,
    TextLoader
)
from langchain_text_splitters import RecursiveCharacterTextSplitter
import numpy as np

# Try to import the HuggingFace embeddings wrapper. If the environment
# doesn't have `sentence-transformers`/`torch` installed, fall back to a
# lightweight deterministic embeddings implementation so the service can start.
try:
    from langchain_huggingface import HuggingFaceEmbeddings
    HF_AVAILABLE = True
except Exception:
    HuggingFaceEmbeddings = None  # type: ignore
    HF_AVAILABLE = False
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
import logging

# Import the Config class
from app.core.config import Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentProcessor:
    def __init__(self, config: Config):
        self.config = config
        self.embedding_model = self._get_embedding_model()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=config.CHUNK_SIZE,
            chunk_overlap=config.CHUNK_OVERLAP,
            add_start_index=True
        )
        self._document_cache = {}
    
    def _get_embedding_model(self):
        """Initialize embedding model (single instance per processor)."""
        if HF_AVAILABLE and HuggingFaceEmbeddings is not None:
            try:
                return HuggingFaceEmbeddings(
                    model_name=self.config.EMBEDDING_MODEL_NAME,
                    model_kwargs={'device': 'cpu'},
                    encode_kwargs={'normalize_embeddings': True}
                )
            except Exception as e:
                # If instantiation fails (e.g., missing sentence-transformers/torch),
                # fallback to the deterministic implementation.
                logger.warning(
                    "Failed to initialize HuggingFaceEmbeddings (missing dependencies or init error): %s",
                    str(e),
                )

        # Fallback deterministic embedding implementation. This is NOT a
        # replacement for a real model, but it allows the service to start
        # and other features (upload, chunking, basic retrieval) to work
        # during development when installing heavy deps like torch is not
        # possible. It produces fixed-size vectors derived from the text.
        logger.warning(
            "HuggingFace embeddings not available (sentence-transformers/torch missing). "
            "Using lightweight fallback embeddings. For production, install `sentence-transformers` and `torch`."
        )
        return _DeterministicFallbackEmbeddings(dim=384)


    def get_file_hash(self, file_content: bytes) -> str:
        """Generate hash for file to detect changes"""
        return hashlib.md5(file_content).hexdigest()

    def save_file(self, uploaded_file) -> str:
        """Save uploaded file and return path"""
        file_path = Path(self.config.PDFS_DIRECTORY) / uploaded_file.name

        with open(file_path, "wb") as f:
            f.write(uploaded_file.getbuffer())

        logger.info(f"File saved: {file_path}")
        return str(file_path)

    def load_document(self, file_path: str) -> List[Document]:
        """Load document based on file extension"""
        file_ext = Path(file_path).suffix.lower()

        loaders = {
            '.pdf': PDFPlumberLoader,
            '.docx': UnstructuredWordDocumentLoader,
            '.txt': TextLoader
        }

        if file_ext not in loaders:
            raise ValueError(f"Unsupported file format: {file_ext}")

        try:
            loader = loaders[file_ext](file_path)
            documents = loader.load()
            logger.info(f"Loaded {len(documents)} pages from {file_path}")
            return documents
        except Exception as e:
            logger.error(f"Error loading document: {e}")
            raise

    def create_chunks(self, documents: List[Document], file_name: str) -> List[Document]:
        """Create text chunks with enhanced metadata"""
        chunks = self.text_splitter.split_documents(documents)

        # Enhanced metadata
        for i, chunk in enumerate(chunks):
            chunk.metadata.update({
                "source": file_name,
                "chunk_id": i,
                "chunk_size": len(chunk.page_content),
                "document_type": self._detect_document_type(chunk.page_content)
            })

        logger.info(f"Created {len(chunks)} chunks from {file_name}")
        return chunks

    def _detect_document_type(self, content: str) -> str:
        """Detect document type based on content patterns"""
        content_lower = content.lower()

        # Legal document patterns
        patterns = {
            "contract": ["agreement", "contract", "parties", "whereas", "terms and conditions"],
            "nda": ["non-disclosure", "confidential", "proprietary information"],
            "employment": ["employment", "employee", "employer", "salary", "benefits"],
            "lease": ["lease", "lessor", "lessee", "rent", "premises"],
            "judgment": ["judgment", "court", "plaintiff", "defendant", "hereby orders"],
            "policy": ["policy", "guidelines", "procedures", "compliance"]
        }

        for doc_type, keywords in patterns.items():
            if any(keyword in content_lower for keyword in keywords):
                return doc_type

        return "general_legal"

    def index_document(self, file_path: str) -> FAISS:
        """Index document with caching"""
        file_name = Path(file_path).name

        # Check if already processed
        cache_key = f"{file_name}_{os.path.getmtime(file_path)}"
        if cache_key in self._document_cache:
            logger.info(f"Using cached index for {file_name}")
            return self._document_cache[cache_key]

        try:
            documents = self.load_document(file_path)
            chunks = self.create_chunks(documents, file_name)

            # Create or load existing vector store
            if os.path.exists(self.config.FAISS_DB_PATH):
                faiss_db = FAISS.load_local(
                    self.config.FAISS_DB_PATH,
                    self.embedding_model,
                    allow_dangerous_deserialization=True
                )
                # Add new documents
                faiss_db.add_documents(chunks)
            else:
                faiss_db = FAISS.from_documents(chunks, self.embedding_model)

            faiss_db.save_local(self.config.FAISS_DB_PATH)
            self._document_cache[cache_key] = faiss_db

            logger.info(f"Successfully indexed {file_name}")
            return faiss_db

        except Exception as e:
            logger.error(f"Error indexing document: {e}")
            raise

    def retrieve_documents(self, query: str, file_name: Optional[str] = None,
                         document_type: Optional[str] = None) -> List[Document]:
        """Enhanced document retrieval with filtering"""
        try:
            faiss_db = FAISS.load_local(
                self.config.FAISS_DB_PATH,
                self.embedding_model,
                allow_dangerous_deserialization=True
            )

            # If we have a file_name filter and a generic query, get all documents from that file
            if file_name and query in ["document content", "summary", ""]:
                # Get all documents and filter by file_name
                all_docs = faiss_db.similarity_search_with_score(
                    "document", k=1000  # Get more documents to ensure we find the right file
                )

                filtered_docs = []
                for doc, score in all_docs:
                    if doc.metadata.get("source") == file_name:
                        if document_type and doc.metadata.get("document_type") != document_type:
                            continue
                        doc.metadata["similarity_score"] = score
                        filtered_docs.append(doc)

                # Return all documents from the specific file, up to a reasonable limit
                logger.info(f"Found {len(filtered_docs)} documents for file {file_name}")
                return filtered_docs[:10]  # Limit to 10 chunks for summary to avoid payload size issues

            # Normal similarity search
            retrieved_docs = faiss_db.similarity_search_with_score(
                query, k=self.config.RETRIEVAL_K * 2
            )

            # Apply filters
            filtered_docs = []
            for doc, score in retrieved_docs:
                if file_name and doc.metadata.get("source") != file_name:
                    continue
                if document_type and doc.metadata.get("document_type") != document_type:
                    continue

                doc.metadata["similarity_score"] = score
                filtered_docs.append(doc)

            # Return top K results
            return filtered_docs[:self.config.RETRIEVAL_K]

        except Exception as e:
            logger.error(f"Error retrieving documents: {e}")
            return []


class _DeterministicFallbackEmbeddings:
    """A tiny embeddings implementation with stable, deterministic vectors.

    Methods match the minimal interface expected by LangChain/FAISS: 
    `embed_documents(list[str]) -> list[list[float]]` and `embed_query(str) -> list[float]`.

    This uses SHA256 digests expanded into floats. The vectors are not
    semantically meaningful and should only be used as a development
    fallback.
    """

    def __init__(self, dim: int = 384):
        self.dim = dim

    def _text_to_vector(self, text: str) -> List[float]:
        # Create a SHA256 digest and expand it to fill the requested dim
        h = hashlib.sha256(text.encode('utf-8')).digest()
        # Repeat the hash as needed
        repeats = (self.dim + len(h) - 1) // len(h)
        data = (h * repeats)[: self.dim]
        arr = np.frombuffer(data, dtype=np.uint8).astype(np.float32)
        # Normalize to unit length to mimic real embeddings behavior
        norm = np.linalg.norm(arr)
        if norm == 0:
            return arr.tolist()
        return (arr / norm).tolist()

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._text_to_vector(t) for t in texts]

    def embed_query(self, text: str) -> List[float]:
        return self._text_to_vector(text)

    def __call__(self, texts):
        """Allow the fallback to be callable like some embeddings wrappers.

        If given a single string, return the query embedding. If given a list
        of strings, return list of embeddings.
        """
        if isinstance(texts, str):
            return self.embed_query(texts)
        if isinstance(texts, (list, tuple)):
            return self.embed_documents(list(texts))
        # Fallback: try to stringify and embed
        return self.embed_query(str(texts))