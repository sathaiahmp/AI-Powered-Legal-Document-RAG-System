import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import os
from dotenv import load_dotenv
import numpy as np

# Internal modules
from src.config import Config
from vector_database import DocumentProcessor
from rag_pipeline import LegalRAGPipeline

# Load .env if present
load_dotenv()

# Initialize core components
config = Config()
doc_processor = DocumentProcessor(config)
rag_pipeline = LegalRAGPipeline(config)


# ---------------------------
# Helpers
# ---------------------------

def to_python_type(obj):
    """Convert numpy types to plain Python for JSON serialization."""
    if isinstance(obj, (np.generic,)):  # catches np.float32, np.int64, etc.
        return obj.item()
    if isinstance(obj, (list, tuple)):
        return [to_python_type(x) for x in obj]
    if isinstance(obj, dict):
        return {k: to_python_type(v) for k, v in obj.items()}
    return obj


# ---------------------------
# Analytics store
# ---------------------------

class AnalyticsStore:
    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}

    def ensure_session(self, session_id: str):
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "queryIntents": {},
                "totalQueries": 0,
                "confidenceSum": 0.0,
                "lastUpdated": datetime.now().isoformat(),
            }
        return self.sessions[session_id]

    def record(self, session_id: str, intent: str, confidence: float):
        sess = self.ensure_session(session_id)
        sess["queryIntents"][intent] = sess["queryIntents"].get(intent, 0) + 1
        sess["totalQueries"] += 1
        sess["confidenceSum"] += float(confidence)
        sess["lastUpdated"] = datetime.now().isoformat()

    def get_summary(self, session_id: str) -> Dict[str, Any]:
        sess = self.ensure_session(session_id)
        avg_conf = (
            sess["confidenceSum"] / sess["totalQueries"]
            if sess["totalQueries"] > 0
            else 0.0
        )
        return {
            "intents": sess["queryIntents"],
            "totalQueries": sess["totalQueries"],
            "averageConfidence": float(avg_conf),
            "lastUpdated": sess["lastUpdated"],
        }


analytics_store = AnalyticsStore()


# ---------------------------
# FastAPI app
# ---------------------------

app = FastAPI(title="Smart Legal Document Analyzer API", version="1.0.0")

# CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------
# Request/Response Models
# ---------------------------

class AnalyzeRequest(BaseModel):
    query: str
    analysisType: Optional[str] = None
    docType: Optional[str] = None
    sessionId: Optional[str] = None
    docId: Optional[str] = None


class AnalyzeResponse(BaseModel):
    answer: str
    intent: str
    confidence: float
    sources: list
    timestamp: str


class UploadResponse(BaseModel):
    docId: str
    name: str
    size: int
    message: str


class SummaryResponse(BaseModel):
    docId: str
    summary: str


class AnalyticsResponse(BaseModel):
    sessionId: str
    intents: Dict[str, int]
    totalQueries: int
    averageConfidence: float
    lastUpdated: str


# ---------------------------
# Intent mapping
# ---------------------------

INTENT_MAP = {
    None: None,
    "Q&A": "general",
    "Contract Analysis": "contract_analysis",
    "Compliance Check": "compliance_check",
    "Risk Assessment": "risk_assessment",
}


def resolve_intent(analysis_type: Optional[str]) -> Optional[str]:
    if analysis_type in INTENT_MAP:
        return INTENT_MAP[analysis_type]
    return None


# ---------------------------
# Endpoints
# ---------------------------

@app.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...), sessionId: Optional[str] = None):
    try:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in [".pdf", ".docx", ".txt"]:
            raise HTTPException(
                status_code=400, detail="Unsupported file type. Use PDF, DOCX, or TXT."
            )

        contents = await file.read()
        save_path = os.path.join(config.PDFS_DIRECTORY, file.filename)
        with open(save_path, "wb") as f:
            f.write(contents)

        doc_processor.index_document(save_path)

        if sessionId:
            analytics_store.ensure_session(sessionId)

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


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    if not req.query or not req.query.strip():
        raise HTTPException(status_code=400, detail="Query is required")

    intent = resolve_intent(req.analysisType)

    try:
        documents = doc_processor.retrieve_documents(
            req.query,
            file_name=req.docId,
            document_type=None if not req.docType else req.docType,
        )

        # If retrieval returned no documents but a docId was provided,
        # fall back to loading the raw document and chunking it so the
        # RAG pipeline has context to answer from.
        if not documents and req.docId:
            try:
                file_path = os.path.join(config.PDFS_DIRECTORY, req.docId)
                raw_pages = doc_processor.load_document(file_path)
                # Create chunks from the raw pages and use them as documents
                documents = doc_processor.create_chunks(raw_pages, req.docId)
                # keep to a reasonable size
                documents = documents[: config.RETRIEVAL_K * 2]
            except Exception as e:
                # If even loading fails, log and continue with empty documents
                import logging

                logging.getLogger(__name__).warning(
                    "Fallback loading of full document failed for %s: %s", req.docId, str(e)
                )

        response = rag_pipeline.generate_response(req.query, documents, intent=intent)

        response = to_python_type(response)  # ensure JSON serializable

        if req.sessionId:
            analytics_store.record(
                req.sessionId,
                response.get("intent", intent or "general"),
                response.get("confidence", 0.0),
            )

        return AnalyzeResponse(
            answer=str(response.get("answer", "")),
            intent=str(response.get("intent", intent or "general")),
            confidence=float(response.get("confidence", 0.0)),
            sources=[str(s) for s in response.get("sources", [])],
            timestamp=str(
                response.get("timestamp", datetime.now().isoformat())
            ),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.get("/summary", response_model=SummaryResponse)
async def summary(docId: str, summaryType: Optional[str] = "comprehensive"):
    try:
        # Use a generic query to retrieve all documents from the specific file
        documents = doc_processor.retrieve_documents("document content", file_name=docId)
        
        if not documents:
            raise HTTPException(status_code=404, detail=f"No documents found for {docId}")
        
        summary_text = rag_pipeline.generate_summary(
            documents, summary_type=summaryType or "comprehensive"
        )
        return SummaryResponse(docId=docId, summary=str(summary_text))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summary failed: {str(e)}")


@app.get("/analytics", response_model=AnalyticsResponse)
async def analytics(sessionId: str):
    try:
        data = analytics_store.get_summary(sessionId)
        return AnalyticsResponse(
            sessionId=sessionId,
            intents={str(k): int(v) for k, v in data["intents"].items()},
            totalQueries=int(data["totalQueries"]),
            averageConfidence=float(data["averageConfidence"]),
            lastUpdated=str(data["lastUpdated"]),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics failed: {str(e)}")


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("api_app:app", host="127.0.0.1", port=8000, reload=True)
