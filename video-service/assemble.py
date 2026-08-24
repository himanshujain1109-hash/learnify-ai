from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips


def make_slide_clip(image_path, audio_path):
    audio = AudioFileClip(audio_path)
    clip = ImageClip(image_path).set_duration(audio.duration)
    return clip.set_audio(audio)


def assemble_video(slide_clips, output_path):
    final = concatenate_videoclips(slide_clips, method="compose")
    final.write_videofile(
        output_path,
        fps=24,
        codec="libx264",
        audio_codec="aac",
        logger=None,
    )
    final.close()
