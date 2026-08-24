import edge_tts


async def generate_audio(text, output_path, voice="en-IN-NeerjaNeural"):
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_path)
