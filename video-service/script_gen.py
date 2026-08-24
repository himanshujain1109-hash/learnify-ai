import os
from google import genai


def get_gemini_client():
    api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is missing in Render environment variables."
        )

    api_key = api_key.strip()

    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is empty in Render environment variables."
        )

    return genai.Client(
        api_key=api_key
    )


MODEL = os.environ.get(
    "GEMINI_MODEL",
    "gemini-3.1-flash-lite"
)


def generate_script(page_text: str, page_number: int) -> str:

    if not page_text.strip():
        return (
            f"This section, page {page_number}, "
            "does not contain enough readable text to narrate."
        )

    client = get_gemini_client()

    prompt = f"""
You are an expert college professor creating
a short educational narration.

Rules:

- Explain ONLY the supplied study material.
- Do not invent facts.
- Use simple spoken language.
- Make it suitable for a college student.
- Keep it around 3 to 6 sentences.
- Do not copy the source word-for-word.
- Return ONLY the narration.
- Do not add a heading.

Page number:
{page_number}

Study material:
{page_text[:12000]}
"""

    try:

        response = client.models.generate_content(
            model=MODEL,
            contents=prompt
        )

    except Exception as e:

        raise RuntimeError(
            f"Gemini API request failed: {type(e).__name__}: {e}"
        )

    text = getattr(response, "text", None)

    if not text:
        raise RuntimeError(
            "Gemini returned an empty response."
        )

    return text.strip()
