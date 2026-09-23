from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
from datetime import datetime
import numpy as np

# Import services
from app.core.config import Config
from app.services.vector_db import DocumentProcessor
from app.services.rag_service import LegalRAGPipeline

router = APIRouter()

# Initialize core components
config = Config()
doc_processor = DocumentProcessor(config)
rag_pipeline = LegalRAGPipeline(config)

# ---------------------------
# Analytics store (Simple In-Memory)
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
# Models
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
# Helpers
# ---------------------------
def to_python_type(obj):
    if isinstance(obj, (np.generic,)):
        return obj.item()
    if isinstance(obj, (list, tuple)):
        return [to_python_type(x) for x in obj]
    if isinstance(obj, dict):
        return {k: to_python_type(v) for k, v in obj.items()}
    return obj

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

@router.post("/analyze", response_model=AnalyzeResponse)
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

        if not documents and req.docId:
            try:
                import os
                file_path = os.path.join(config.PDFS_DIRECTORY, req.docId)
                raw_pages = doc_processor.load_document(file_path)
                documents = doc_processor.create_chunks(raw_pages, req.docId)
                documents = documents[: config.RETRIEVAL_K * 2]
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning(
                    "Fallback loading of full document failed for %s: %s", req.docId, str(e)
                )

        response = rag_pipeline.generate_response(req.query, documents, intent=intent)
        response = to_python_type(response)

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
            timestamp=str(response.get("timestamp", datetime.now().isoformat())),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/summary", response_model=SummaryResponse)
async def summary(docId: str, summaryType: Optional[str] = "comprehensive"):
    try:
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

@router.get("/analytics", response_model=AnalyticsResponse)
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
