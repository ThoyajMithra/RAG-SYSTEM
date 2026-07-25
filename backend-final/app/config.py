from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str

    OPENAI_API_KEY: str=""
    GEMINI_API_KEY: str=""
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    GEM_EMBEDDING_MODEL: str = "gemini-embedding-001"
    EMBEDDING_DIM: int = 3072
    LLM_MODEL: str = "gpt-4o-mini"
    GEMINI_MODEL: str = "gemini-2.5-flash"

    STORAGE_DIR: str = "storage"

    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    TOP_K: int = 5

    # --- Audio transcription (OpenAI Whisper API) ---
    WHISPER_MODEL: str = "whisper-1"

    # --- YouTube video recommendations ---
    YOUTUBE_API_KEY: str = ""
    YOUTUBE_MAX_RESULTS: int = 3

    class Config:
        env_file = ".env"


settings = Settings()
