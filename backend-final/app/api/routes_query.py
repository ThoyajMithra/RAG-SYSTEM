from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import QueryRequest, QueryResponse, SourceChunk
from app.services.retrieval import retrieve_relevant_chunks
from app.services.llm import generate_answer
from app.services.youtube import search_videos

router = APIRouter(prefix="/query", tags=["query"])


@router.post("", response_model=QueryResponse)
def query(request: QueryRequest, db: Session = Depends(get_db)):

    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    results = retrieve_relevant_chunks(
        db=db,
        question=request.question,
        top_k=request.top_k,
        document_ids=request.document_ids,
    )

    videos = search_videos(request.question)
    print(results,"---",videos)

    if not results:
        return QueryResponse(
            answer="I couldn't find any relevant documents to answer that.",
            sources=[],
            videos=videos,
        )

    context_chunks = [r["chunk"].content for r in results]
    answer = generate_answer(request.question, context_chunks)

    sources = [
        SourceChunk(
            document_id=r["document"].id,
            filename=r["document"].filename,
            chunk_index=r["chunk"].chunk_index,
            content=r["chunk"].content,
            score=r["score"],
        )
        for r in results
    ]

    return QueryResponse(answer=answer, sources=sources, videos=videos)
