from fastapi import FastAPI
from app.api import health, chat, documents
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Legal Document Analyzer")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router, tags=["Health"])
app.include_router(chat.router, tags=["Chat"])
app.include_router(documents.router, tags=["Documents"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
