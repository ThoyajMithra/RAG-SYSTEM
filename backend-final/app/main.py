from fastapi import FastAPI
from fastapi import routing
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import text

from app.database import engine, Base
from app.api import routes_upload, routes_query, routes_documents


app = FastAPI(title="RAG Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",
        "https://rag-system-2vt.pages.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()

    Base.metadata.create_all(bind=engine)

app.include_router(routes_upload.router)
app.include_router(routes_documents.router)
app.include_router(routes_query.router)