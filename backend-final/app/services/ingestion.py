from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Document, Chunk
from app.utils.loaders import extract_text
from app.utils.chunker import chunk_text
from app.services.embeddings import embed_texts
from app.config import settings


def process_document(file_path: str, document_id: str):
    db: Session = SessionLocal()
    try:
        doc = db.query(Document).get(document_id)
        if doc is None:
            return

        # 1. Extract raw text
        text = extract_text(file_path)
        if not text.strip():
            doc.status = "failed"
            doc.error_message = "No extractable text found in file."
            db.commit()
            return

        # 2. Chunk
        chunks = chunk_text(
            text,
            chunk_size=settings.CHUNK_SIZE,
            overlap=settings.CHUNK_OVERLAP,
        )
        if not chunks:
            doc.status = "failed"
            doc.error_message = "Chunking produced no content."
            db.commit()
            return

        # 3. Embed (batched)
        vectors = embed_texts(chunks)

        # 4. Store chunks + embeddings
        for idx, (chunk_str, vector) in enumerate(zip(chunks, vectors)):
            db.add(
                Chunk(
                    document_id=document_id,
                    content=chunk_str,
                    embedding=vector,
                    chunk_index=idx,
                )
            )

        doc.status = "ready"
        db.commit()

    except Exception as e:
        db.rollback()
        doc = db.query(Document).get(document_id)
        if doc:
            doc.status = "failed"
            doc.error_message = str(e)
            db.commit()
    finally:
        db.close()
