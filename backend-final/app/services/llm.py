# from typing import List
# from openai import OpenAI

# from app.config import settings

# client = OpenAI(api_key=settings.OPENAI_API_KEY)

# SYSTEM_PROMPT = """You are a helpful assistant that answers questions using ONLY the
# provided context. If the answer is not contained in the context, say you don't know
# instead of making something up. Always be concise and cite which source number(s)
# you used, like [1], [2]."""


# def generate_answer(question: str, context_chunks: List[str]) -> str:
#     numbered_context = "\n\n".join(
#         f"[{i + 1}] {chunk}" for i, chunk in enumerate(context_chunks)
#     )

#     user_prompt = f"""Context:
# {numbered_context}

# Question: {question}

# Answer using only the context above."""

#     response = client.chat.completions.create(
#         model=settings.LLM_MODEL,
#         messages=[
#             {"role": "system", "content": SYSTEM_PROMPT},
#             {"role": "user", "content": user_prompt},
#         ],
#         temperature=0.2,
#     )

#     return response.choices[0].message.content










from typing import List
from google import genai
from google.genai import types
from app.config import settings

# Initialize client using the new SDK
client = genai.Client(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """You are a knowledgeable assistant.

Use the provided document context whenever it is relevant.

If the document does not contain the answer, answer using your own knowledge.

When using information from the document, cite the corresponding source numbers in square brackets, for example [1] or [2,4].

Never invent citations.
"""
# SYSTEM_PROMPT = """You are a helpful assistant that answers questions using ONLY the provided context. 
# If the answer is not contained in the context, say you don't know instead of making something up. 
# Always be concise and cite which source number(s) you used, like, [2]."""

def generate_answer(question: str, context_chunks: List[str]) -> str:
    # Format the context chunks with numbers
    numbered_context = "\n\n".join(
        f"[{i + 1}] {chunk}" for i, chunk in enumerate(context_chunks)
    )
    
    user_prompt = f"Context:\n{numbered_context}\n\nQuestion: {question}\n\nAnswer using only the context above."
    
    # Call Gemini using the recommended model and configuration syntax
    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,  # e.g., 'gemini-2.5-flash'
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=0.2,
        ),
    )
    
    return response.text
