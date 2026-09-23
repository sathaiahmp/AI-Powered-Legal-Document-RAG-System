from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import os

# Import services
from app.core.config import Config
from app.services.vector_db import DocumentProcessor

router = APIRouter()

# Initialize core components
config = Config()
doc_processor = DocumentProcessor(config)

class UploadResponse(BaseModel):
    docId: str
    name: str
    size: int
    message: str

@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...), sessionId: str = None):
    try:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in [".pdf", ".docx", ".txt"]:
            raise HTTPException(
                status_code=400, detail="Unsupported file type. Use PDF, DOCX, or TXT."
            )

        contents = await file.read()
        save_path = os.path.join(config.PDFS_DIRECTORY, file.filename)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        with open(save_path, "wb") as f:
            f.write(contents)

        doc_processor.index_document(save_path)

        # Note: We are not updating analytics store here as it's handled in chat module
        # If needed, we can inject the store or use a shared dependency

        return UploadResponse(
            docId=file.filename,
            name=file.filename,
            size=len(contents),
            message="File uploaded and indexed successfully",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
