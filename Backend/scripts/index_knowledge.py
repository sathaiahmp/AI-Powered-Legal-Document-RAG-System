import os
import sys
import logging

# Add parent directory to path to import src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.config import Config
from vector_database import DocumentProcessor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def index_knowledge_base():
    config = Config()
    doc_processor = DocumentProcessor(config)
    pdfs_dir = config.PDFS_DIRECTORY
    
    logger.info(f"Indexing documents from {pdfs_dir}...")
    
    files = [f for f in os.listdir(pdfs_dir) if f.endswith('.txt') or f.endswith('.pdf') or f.endswith('.docx')]
    
    if not files:
        logger.warning("No files found to index.")
        return

    for filename in files:
        file_path = os.path.join(pdfs_dir, filename)
        try:
            logger.info(f"Indexing {filename}...")
            doc_processor.index_document(file_path)
            logger.info(f"Successfully indexed {filename}")
        except Exception as e:
            logger.error(f"Failed to index {filename}: {e}")

if __name__ == "__main__":
    index_knowledge_base()
