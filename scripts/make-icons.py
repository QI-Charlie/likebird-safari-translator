#!/usr/bin/env python3
"""Generate EE icons from the supplied brand mark with Pillow."""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
LIME = (167, 255, 0)
SIZES = (16, 19, 32, 38, 48, 64, 96, 128, 256, 512, 1024)
ICON_CORNER_RATIO = 0.22


def brand_mark(image):
    # The supplied image composites lime over white. Recreate its edge alpha
    # and set the fill to the approved digital brand color.
    alpha = image.getchannel("B").point(lambda blue: min(255, round((255 - blue) * 255 / 253)))
    mark = Image.new("RGBA", image.size, LIME)
    mark.putalpha(alpha)
    return mark.crop(alpha.getbbox())


def main():
    with Image.open(ASSETS / "brand-logo.png") as image:
        artwork = image.convert("RGB")
    if artwork.width != artwork.height:
        raise ValueError("The app icon artwork must be square.")
    mark = brand_mark(artwork)
    icon_dir = ASSETS / "icons"
    icon_dir.mkdir(exist_ok=True)
    # The small-size variant keeps the shape clear without microtype.
    micro = mark.copy()
    ImageDraw.Draw(micro).rectangle(
        (round(micro.width * .90), round(micro.height * .82), micro.width, micro.height),
        fill=(0, 0, 0, 0),
    )
    mark.resize((256, round(256 * mark.height / mark.width)), Image.Resampling.LANCZOS).save(icon_dir / "brand.png")
    micro.resize((128, round(128 * micro.height / micro.width)), Image.Resampling.LANCZOS).save(icon_dir / "brand-small.png")
    # Round the canvas corners without repositioning or scaling the mark within it.
    alpha = Image.new("L", artwork.size)
    ImageDraw.Draw(alpha).rounded_rectangle(
        (0, 0, artwork.width - 1, artwork.height - 1),
        radius=round(artwork.width * ICON_CORNER_RATIO),
        fill=255,
    )
    artwork.putalpha(alpha)
    for size in SIZES:
        icon = artwork.resize((size, size), Image.Resampling.LANCZOS)
        icon.save(icon_dir / f"icon-{size}.png")

    largest = Image.open(icon_dir / "icon-1024.png")
    sizes = [16, 32, 64, 128, 256, 512]
    variants = [Image.open(icon_dir / f"icon-{size}.png") for size in sizes]
    largest.save(ASSETS / "AppIcon.icns", append_images=variants)


if __name__ == "__main__":
    main()
