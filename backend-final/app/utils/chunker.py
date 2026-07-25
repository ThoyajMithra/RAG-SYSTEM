from typing import List
import tiktoken

_encoder = tiktoken.get_encoding("cl100k_base")


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """
    Split text into overlapping chunks measured in tokens (not characters),
    which keeps chunk sizes consistent regardless of language/formatting.
    """
    if not text or not text.strip():
        return []

    tokens = _encoder.encode(text)
    chunks = []

    start = 0
    while start < len(tokens):
        end = start + chunk_size
        chunk_tokens = tokens[start:end]
        chunk_str = _encoder.decode(chunk_tokens).strip()
        if chunk_str:
            chunks.append(chunk_str)

        if end >= len(tokens):
            break
        start = end - overlap  # step forward, leaving overlap for context continuity

    return chunks
