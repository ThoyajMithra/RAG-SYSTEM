from typing import List
from openai import OpenAI
from google import genai

from app.config import settings

# client = OpenAI(api_key=settings.OPENAI_API_KEY)

client = genai.Client(api_key=settings.GEMINI_API_KEY)

def embed_texts(texts: List[str]) -> List[List[float]]:

    if not texts:
        return []

    # response = client.embeddings.create(
    #     model=settings.GEM_EMBEDDING_MODEL,
    #     input=texts,
    # )

    response = client.models.embed_content(
        model=settings.GEM_EMBEDDING_MODEL,
        contents=texts,
    )
    # response.data is returned in the same order as the input
    # return [item.embedding for item in response.data]
    return [item.values for item in response.embeddings]


def embed_query(query: str) -> List[float]:
    return embed_texts([query])[0]
