# RAG Backend (FastAPI + pgvector)

## Structure
```
backend/
├── app/
│   ├── main.py                  # FastAPI app, CORS, startup (creates tables + pgvector extension)
│   ├── config.py                # settings loaded from .env
│   ├── database.py               # SQLAlchemy engine/session
│   ├── models.py                 # Document + Chunk (with vector column)
│   ├── schemas.py                # Pydantic request/response models
│   ├── api/
│   │   ├── routes_upload.py      # POST /upload
│   │   ├── routes_documents.py   # GET/DELETE /documents
│   │   └── routes_query.py       # POST /query  (the RAG endpoint)
│   ├── services/
│   │   ├── ingestion.py          # extract -> chunk -> embed -> store (background task)
│   │   ├── retrieval.py          # embed query -> vector similarity search
│   │   ├── embeddings.py         # Gemini embedding calls
│   │   ├── llm.py                # Gemini chat completion for the final answer
│   │   ├── transcription.py      # Whisper audio -> text (for audio uploads)
│   │   ├── youtube.py            # YouTube Data API video recommendations
│   │   └── vector_store.py       # pluggable backend: pgvector (default) or Pinecone
│   └── utils/
│       ├── loaders.py            # pdf/txt/md/audio text extraction
│       └── chunker.py            # token-based chunking with overlap
├── storage/                      # uploaded raw files land here
├── docker-compose.yml            # postgres + pgvector
├── requirements.txt
└── .env.example
```

## Setup

1. **Start Postgres with pgvector:**
   ```bash
   docker compose up -d
   ```

2. **Create a virtualenv and install deps:**
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # edit .env and add your OPENAI_API_KEY
   ```

4. **Run the server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   On startup it automatically enables the `vector` extension and creates tables.

5. Visit `http://localhost:8000/docs` for interactive Swagger UI.

## API

### `POST /upload`
Multipart form upload (`files` field, accepts multiple). Saves each file, creates a
`Document` row with `status=processing`, and processes it in a background task
so the request returns immediately. Accepts `.pdf`, `.txt`, `.md`, and audio
files (`.mp3`, `.wav`, `.m4a`, `.mp4`, `.webm`) — audio is transcribed via
OpenAI Whisper first, then the transcript flows through the normal
chunk → embed → store pipeline, so you can ask questions about a lecture
recording or podcast the same way you would a PDF.

Response:
```json
{ "document_ids": ["uuid"], "filenames": ["notes.pdf"], "statuss": ["processing"] }
```

Poll `GET /documents/{document_id}` until `status` becomes `ready` (or `failed`).

### `GET /documents`
Lists all uploaded documents and their status.

### `DELETE /documents/{document_id}`
Deletes the file from disk and removes the document + its chunks (cascade).

### `POST /query`
```json
{
  "question": "What does the contract say about termination?",
  "document_ids": null,   // optional: restrict to specific docs
  "top_k": 5               // optional: override default TOP_K
}
```

Response:
```json
{
  "answer": "...",
  "sources": [
    { "document_id": "...", "filename": "...", "chunk_index": 3, "content": "...", "score": 0.83 }
  ],
  "videos": [
    { "video_id": "...", "title": "...", "channel": "...", "thumbnail_url": "...", "url": "https://www.youtube.com/watch?v=..." }
  ]
}
```
`videos` is populated from the YouTube Data API using the question as the
search term (empty list if `YOUTUBE_API_KEY` isn't set, or if the search
fails — this never blocks the core answer).

## Vector store: pgvector vs Pinecone

By default (`VECTOR_BACKEND=pgvector`), chunk embeddings are stored directly
in Postgres and searched with pgvector's `cosine_distance` operator — no
external vector DB needed.

Set `VECTOR_BACKEND=pinecone` (plus `PINECONE_API_KEY`) to instead store and
search embeddings in a Pinecone serverless index. `app/services/vector_store.py`
creates the index automatically if it doesn't exist. Chunk text and document
metadata always stay in Postgres either way; only the embedding + similarity
search move to Pinecone. `app/services/retrieval.py` and `ingestion.py`
route through this abstraction automatically — no other code changes needed
to switch backends.

## How it works

**Ingestion:** file saved to `storage/` → text extracted (pypdf/python-docx) →
split into ~500-token chunks with 50-token overlap → each chunk embedded via
OpenAI → chunk text + vector + metadata stored as rows in the `chunks` table
(Postgres, using the `pgvector` extension for the `embedding` column).

**Retrieval:** the question is embedded the same way → pgvector's
`cosine_distance` operator finds the nearest chunk vectors directly in SQL →
those chunks are stitched into a context block → sent to the LLM along with
the question to generate a grounded answer.

Everything (files' metadata, chunk text, and vectors) lives in one Postgres
database — no separate vector DB to keep in sync. Raw files themselves sit on
disk (or point this at S3 by changing `routes_upload.py`'s save logic).

## Swapping providers
- Different embedding/LLM provider (Anthropic, Cohere, local models via
  `sentence-transformers`): edit `app/services/embeddings.py` and
  `app/services/llm.py` only — nothing else needs to change.
- Bigger scale / different vector DB (Qdrant, Pinecone): replace
  `app/services/retrieval.py`'s query logic; the rest of the app is unaffected.
- Heavier ingestion workloads: swap `BackgroundTasks` for Celery + Redis in
  `routes_upload.py` and `services/ingestion.py`.

## Production notes
- Use Alembic migrations instead of `Base.metadata.create_all` in `main.py`.
- Restrict CORS `allow_origins` to your actual frontend domain.
- Add auth (e.g. JWT dependency) to all routes before exposing publicly.
- Validate/limit upload file size.
