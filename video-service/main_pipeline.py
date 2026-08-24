import asyncio
from pathlib import Path

from extract import extract_document
from script_gen import generate_script
from tts import generate_audio
from visual import generate_visual
from assemble import make_slide_clip, assemble_video


def run_pipeline(input_path: str, job_dir: str):
    job = Path(job_dir)
    assets = job / "assets"
    assets.mkdir(parents=True, exist_ok=True)

    pages = extract_document(input_path)
    if not pages:
        raise ValueError("No readable pages/slides were found.")

    clips = []
    for index, page in enumerate(pages):
        text = page.get("text", "").strip()
        script = generate_script(text, page["number"])

        audio_path = assets / f"page_{index + 1}.mp3"
        image_path = assets / f"page_{index + 1}.png"

        asyncio.run(generate_audio(script, str(audio_path)))
        generate_visual(
            f"Page {page['number']}",
            script,
            str(image_path),
        )

        clips.append(
            make_slide_clip(str(image_path), str(audio_path))
        )

    output_path = job / "output.mp4"
    assemble_video(clips, str(output_path))

    for clip in clips:
        try:
            clip.close()
            if clip.audio:
                clip.audio.close()
        except Exception:
            pass

    return str(output_path)
