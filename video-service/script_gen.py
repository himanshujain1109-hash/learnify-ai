import os
import anthropic

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))


def generate_script(page_text: str, page_number: int) -> str:
    if not page_text.strip():
        return f"This section, page {page_number}, does not contain enough readable text to narrate."

    prompt = f"""You are creating a short spoken narration for a student.

Rules:
- Explain ONLY the supplied study material.
- Do not invent facts, examples, statistics, or unrelated information.
- Use simple teacher-like spoken language.
- Keep it to about 3-6 sentences.
- Do not repeat the source word-for-word.
- Return only the narration.

Study material:
{page_text[:12000]}
"""
    response = client.messages.create(
        model=os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-6"),
        max_tokens=350,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text.strip()
