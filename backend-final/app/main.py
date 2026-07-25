from fastapi import FastAPI
from fastapi import routing

from sqlalchemy import text

from app.database import engine, Base
from app.api import routes_upload, routes_query, routes_documents


app = FastAPI(title="RAG Backend")



@app.on_event("startup")
def on_startup():
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()

    Base.metadata.create_all(bind=engine)

app.include_router(routes_upload.router)
app.include_router(routes_documents.router)
app.include_router(routes_query.router)