from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models import Chunk, Document
from app.services.embeddings import embed_query
from app.config import settings


def retrieve_relevant_chunks(
    db: Session,
    question: str,
    top_k: Optional[int] = None,
    document_ids: Optional[List[str]] = None,
):
    """
    Embeds the query and finds the top_k most similar chunks.

    When VECTOR_BACKEND=pinecone, similarity search runs against the
    Pinecone index (chunk text/metadata is then hydrated from Postgres).
    Otherwise it falls back to pgvector's cosine distance operator directly
    in Postgres. Lower distance = more similar.
    """
    top_k = top_k or settings.TOP_K
    query_vector = embed_query(question)



    distance_col = Chunk.embedding.cosine_distance(query_vector).label("distance")

    stmt = (
        select(Chunk, Document, distance_col)
        .join(Document, Chunk.document_id == Document.id)
    )

    if document_ids:
        stmt = stmt.where(Chunk.document_id.in_(document_ids))

    stmt = stmt.order_by(distance_col).limit(top_k)

    results = db.execute(stmt).all()

    output = []
    for chunk, doc, distance in results:
        similarity = 1 - distance if distance is not None else None
        output.append(
            {
                "chunk": chunk,
                "document": doc,
                "score": round(similarity, 4) if similarity is not None else None,
            }
        )
    return output


def _retrieve_via_external_store(
    db: Session,
    vector_store,
    query_vector: List[float],
    top_k: int,
    document_ids: Optional[List[str]],
):
    """Runs the similarity search on the external vector store, then hydrates
    each match's chunk text and parent document from Postgres."""
    matches = vector_store.query(
        query_vector=query_vector, top_k=top_k, document_ids=document_ids
    )
    if not matches:
        return []

    chunk_ids = [m["chunk_id"] for m in matches]
    rows = (
        db.execute(
            select(Chunk, Document)
            .join(Document, Chunk.document_id == Document.id)
            .where(Chunk.id.in_(chunk_ids))
        )
        .all()
    )
    chunk_lookup = {chunk.id: (chunk, doc) for chunk, doc in rows}

    output = []
    for match in matches:
        pair = chunk_lookup.get(match["chunk_id"])
        if not pair:
            continue
        chunk, doc = pair
        output.append({"chunk": chunk, "document": doc, "score": round(match["score"], 4)})
    return output
