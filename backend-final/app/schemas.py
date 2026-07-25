from typing import Optional, List
from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: str
    filename: str
    status: str
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


class UploadResponse(BaseModel):
    document_ids: List[str]
    filenames: List[str]
    statuss: List[str]


class QueryRequest(BaseModel):
    question: str
    document_ids: Optional[List[str]] = None  # optional: restrict search to these docs
    top_k: Optional[int] = None


class SourceChunk(BaseModel):
    document_id: str
    filename: str
    chunk_index: int
    content: str
    score: float


class VideoResult(BaseModel):
    video_id: str
    title: str
    channel: str
    thumbnail_url: str
    url: str


class QueryResponse(BaseModel):
    answer: str
    sources: List[SourceChunk]
    videos: List[VideoResult] = []
