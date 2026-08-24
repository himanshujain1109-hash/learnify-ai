from PIL import Image, ImageDraw, ImageFont
import textwrap


def generate_visual(title, description, output_path):
    img = Image.new("RGB", (1280, 720), color="#17142d")
    draw = ImageDraw.Draw(img)

    try:
        title_font = ImageFont.truetype("DejaVuSans-Bold.ttf", 52)
        body_font = ImageFont.truetype("DejaVuSans.ttf", 28)
    except Exception:
        title_font = ImageFont.load_default()
        body_font = ImageFont.load_default()

    draw.text((70, 65), title[:90], fill="white", font=title_font)

    wrapped = textwrap.fill(description[:900], width=62)
    draw.multiline_text(
        (70, 160),
        wrapped,
        fill="#d3d1e2",
        font=body_font,
        spacing=14,
    )
    img.save(output_path)
