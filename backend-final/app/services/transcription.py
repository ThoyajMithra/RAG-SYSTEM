from openai import OpenAI

from app.config import settings

AUDIO_EXTENSIONS = {".mp3", ".mp4", ".mpeg", ".mpga", ".m4a", ".wav", ".webm"}

_client = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


def transcribe_audio(file_path: str) -> str:
    """
    Transcribes an audio file to plain text using OpenAI's Whisper API.
    The returned text is fed into the same chunk -> embed -> store pipeline
    used for documents, so uploaded audio becomes searchable/queryable
    just like a PDF or text file.
    """
    client = _get_client()
    with open(file_path, "rb") as audio_file:
        transcript = client.audio.transcriptions.create(
            model=settings.WHISPER_MODEL,
            file=audio_file,
        )
    return transcript.text
