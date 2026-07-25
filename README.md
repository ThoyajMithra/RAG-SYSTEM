# RAG Chat Application

A simple Retrieval-Augmented Generation (RAG) chat application built with React, FastAPI, PostgreSQL, and OpenAI.

## Tech Stack

### Frontend
- React
- Vite

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL + pgvector
- OpenAI API

---

## Project Structure

```
project/
│
├── client/        # React frontend
├── backend/       # FastAPI backend
└── README.md
```

---

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd project
```

---

### 2. Start PostgreSQL

```bash
cd backend

docker compose up -d
```

---

### 3. Run the Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs at:

```
http://localhost:8000
```

API Docs:

```
http://localhost:8000/docs
```

---

### 4. Run the Frontend

Open another terminal.

```bash
cd client

npm install

npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## Features

- Chat interface
- Upload PDF, DOCX, and TXT files
- Document processing
- Semantic search using pgvector
- AI-generated answers based on uploaded documents

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload documents |
| GET | `/documents` | List uploaded documents |
| DELETE | `/documents/{id}` | Delete a document |
| POST | `/query` | Ask questions about uploaded documents |

---

## Notes

- Add your `OPENAI_API_KEY` to the `.env` file before starting the backend.
- Make sure PostgreSQL is running before starting the backend.
- The frontend communicates with the backend through the configured API base URL.
