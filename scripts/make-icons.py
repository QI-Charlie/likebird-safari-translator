#!/usr/bin/env python3
"""Generate the YiLiu icon set with Pillow (run through `npm run icons`)."""

from pathlib import Path
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ICON_DIR = ROOT / "assets" / "icons"
APP_ICONSET = ROOT / "build" / "AppIcon.iconset"
FONT_PATH = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
SERIF_PATH = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"

CHAR = (42, 42, 40)
LIME = (166, 255, 0)
INK = (17, 17, 17)
PAPER = (247, 244, 236)


def rounded_mask(size, radius):
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def draw_brand(size, glyph="译", simple=False):
    scale = 4
    canvas_size = size * scale
    image = Image.new("RGBA", (canvas_size, canvas_size), (*CHAR, 255))

    mask = rounded_mask(canvas_size, int(canvas_size * 0.225))
    image.putalpha(mask)

    draw = ImageDraw.Draw(image)
    font_size = int(canvas_size * (0.54 if not simple else 0.62))
    try:
        font = ImageFont.truetype(FONT_PATH, font_size)
    except OSError:
        font = ImageFont.truetype(SERIF_PATH, font_size)

    x = canvas_size / 2
    y = canvas_size * (0.49 if not simple else 0.48)
    draw.text(
        (x, y),
        glyph,
        font=font,
        anchor="mm",
        fill=(*LIME, 255),
    )

    return image.resize((size, size), Image.LANCZOS)


def main():
    ICON_DIR.mkdir(parents=True, exist_ok=True)
    for size in (48, 64, 96, 128, 256, 512, 1024):
        draw_brand(size, "译", simple=False).save(ICON_DIR / f"icon-{size}.png", "PNG")

    # A large Y stays legible at toolbar sizes.
    for size in (16, 19, 32, 38):
        draw_brand(size, "Y", simple=True).save(ICON_DIR / f"icon-{size}.png", "PNG")

    if APP_ICONSET.exists():
        for child in APP_ICONSET.iterdir():
            child.unlink()
    APP_ICONSET.mkdir(parents=True, exist_ok=True)
    pairs = [
        (16, "icon_16x16.png"),
        (32, "icon_16x16@2x.png"),
        (32, "icon_32x32.png"),
        (64, "icon_32x32@2x.png"),
        (128, "icon_128x128.png"),
        (256, "icon_128x128@2x.png"),
        (256, "icon_256x256.png"),
        (512, "icon_256x256@2x.png"),
        (512, "icon_512x512.png"),
        (1024, "icon_512x512@2x.png"),
    ]
    for size, name in pairs:
        draw_brand(size, "译", simple=False).save(APP_ICONSET / name, "PNG")
    icns_path = ROOT / "assets" / "AppIcon.icns"
    subprocess.run(
        ["iconutil", "-c", "icns", str(APP_ICONSET), "-o", str(icns_path)],
        check=True,
    )
    print(f"Generated {len(list(ICON_DIR.glob('*.png')))} extension icons and {icns_path.name}")


if __name__ == "__main__":
    sys.exit(main())
