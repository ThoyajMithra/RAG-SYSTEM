import os
from pypdf import PdfReader
from app.services.transcription import transcribe_audio, AUDIO_EXTENSIONS
# from docx import Document as DocxDocument


def extract_text(file_path: str) -> str:
    """Extract raw text from a file based on its extension."""
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return _extract_pdf(file_path)
    # elif ext == ".docx":
    #     return _extract_docx(file_path)
    elif ext in (".txt", ".md"):
        return _extract_txt(file_path)
    elif ext in AUDIO_EXTENSIONS:
        # Audio files are transcribed via Whisper, then flow through the
        # same chunk/embed/store pipeline as any other document.
        return transcribe_audio(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def _extract_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    pages = []
    for page in reader.pages:
        text = page.extract_text() or ""
        pages.append(text)
    return "\n\n".join(pages)


# def _extract_docx(file_path: str) -> str:
#     doc = DocxDocument(file_path)
#     paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
#     return "\n\n".join(paragraphs)


def _extract_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()
