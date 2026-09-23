# config.py - Centralized Configuration
import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class Config:
    # Directories
    PDFS_DIRECTORY: str = "pdfs/"
    FAISS_DB_PATH: str = "vectorstore/db_faiss"
    REPORTS_DIRECTORY: str = "reports/"
    
    # Model Configuration
    GEMINI_MODEL_NAME: str = "gemini-2.0-flash"
    # Ordered list of models to try if the configured model is unavailable.
    SUPPORTED_GEMINI_MODELS: list = None
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # RAG Parameters
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    RETRIEVAL_K: int = 5
    
    # UI Configuration
    MAX_FILE_SIZE: int = 200  # MB
    SUPPORTED_FORMATS: list = None
    
    def __post_init__(self):
        if self.SUPPORTED_FORMATS is None:
            self.SUPPORTED_FORMATS = ["pdf", "docx", "txt"]
        if self.SUPPORTED_GEMINI_MODELS is None:
            # Provide a safe default list. Adjust as needed for your org.
            self.SUPPORTED_GEMINI_MODELS = [
                self.GEMINI_MODEL_NAME,
                "gemini-2.0-pro-exp",
                "gemini-flash-latest",
                "gemini-pro-latest",
            ]
        
        # Create directories
        for directory in [self.PDFS_DIRECTORY, self.REPORTS_DIRECTORY, 
                         os.path.dirname(self.FAISS_DB_PATH)]:
            os.makedirs(directory, exist_ok=True)

config = Config()