from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "public" / "assets" / "brand"
APP = ROOT / "app"
GREEN = "#176b43"
INK = "#17211b"
OFF_WHITE = "#f4f7f3"
SAFFRON = "#e4a93f"
FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_REGULAR = "C:/Windows/Fonts/segoeui.ttf"


def fit(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    result = image.copy()
    result.thumbnail(size, Image.Resampling.LANCZOS)
    return result


def centered_paste(canvas: Image.Image, image: Image.Image, center: tuple[int, int]) -> None:
    canvas.alpha_composite(image, (center[0] - image.width // 2, center[1] - image.height // 2))


def solid_mark(mark: Image.Image, color: str) -> Image.Image:
    result = Image.new("RGBA", mark.size, color)
    result.putalpha(mark.getchannel("A"))
    return result


def draw_wordmark(
    canvas: Image.Image,
    origin: tuple[int, int],
    size: int,
    primary: str,
    accent: str,
) -> tuple[int, int, int, int]:
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.truetype(FONT_BOLD, size)
    first = "TemanUsaha"
    second = " AI"
    draw.text(origin, first, font=font, fill=primary)
    split = origin[0] + round(draw.textlength(first, font=font))
    draw.text((split, origin[1]), second, font=font, fill=accent)
    return draw.textbbox(origin, first + second, font=font)


def horizontal_logo(mark: Image.Image, *, white: bool = False) -> Image.Image:
    canvas = Image.new("RGBA", (1800, 420))
    logo_mark = fit(solid_mark(mark, "white") if white else mark, (330, 330))
    centered_paste(canvas, logo_mark, (210, 210))
    draw_wordmark(
        canvas,
        (410, 103),
        154,
        "white" if white else INK,
        "white" if white else GREEN,
    )
    return canvas


def stacked_logo(mark: Image.Image) -> Image.Image:
    canvas = Image.new("RGBA", (1100, 1000))
    centered_paste(canvas, fit(mark, (560, 560)), (550, 335))
    scratch = Image.new("RGBA", canvas.size)
    bbox = draw_wordmark(scratch, (0, 0), 128, INK, GREEN)
    wordmark_width = bbox[2] - bbox[0]
    draw_wordmark(canvas, ((canvas.width - wordmark_width) // 2, 690), 128, INK, GREEN)
    return canvas


def pattern(mark: Image.Image) -> Image.Image:
    canvas = Image.new("RGBA", (1600, 900))
    tile = fit(solid_mark(mark, GREEN), (150, 150))
    alpha = tile.getchannel("A").point(lambda value: round(value * 0.09))
    tile.putalpha(alpha)
    for row, y in enumerate(range(-60, canvas.height + 120, 210)):
        offset = 105 if row % 2 else 0
        for x in range(-80 + offset, canvas.width + 120, 260):
            canvas.alpha_composite(tile, (x, y))
    return canvas


def apple_icon(mark: Image.Image) -> Image.Image:
    canvas = Image.new("RGB", (180, 180), OFF_WHITE).convert("RGBA")
    centered_paste(canvas, fit(mark, (142, 142)), (90, 90))
    return canvas.convert("RGB")


def social_cover(mark: Image.Image) -> Image.Image:
    banner = Image.open(BRAND.parent / "illustrations" / "warung-dashboard-banner.png").convert("RGB")
    canvas = ImageOps.fit(banner, (1200, 630), method=Image.Resampling.LANCZOS, centering=(0.55, 0.5)).convert("RGBA")
    overlay = Image.new("RGBA", canvas.size)
    overlay_draw = ImageDraw.Draw(overlay)
    for x in range(850):
        opacity = max(0, round(235 * (1 - x / 850)))
        overlay_draw.line((x, 0, x, canvas.height), fill=(23, 107, 67, opacity))
    canvas = Image.alpha_composite(canvas, overlay)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((64, 62, 202, 200), radius=30, fill=(244, 247, 243, 240))
    centered_paste(canvas, fit(mark, (120, 120)), (133, 131))
    draw.text((64, 238), "TemanUsaha AI", font=ImageFont.truetype(FONT_BOLD, 70), fill="white")
    draw.text((66, 332), "Asisten operasional warung", font=ImageFont.truetype(FONT_REGULAR, 38), fill=OFF_WHITE)
    draw.text((66, 388), "dari percakapan ke tindakan.", font=ImageFont.truetype(FONT_REGULAR, 38), fill=OFF_WHITE)
    draw.rounded_rectangle((64, 486, 438, 552), radius=18, fill=SAFFRON)
    draw.text((91, 494), "Warung Nasi Bu Sari", font=ImageFont.truetype(FONT_BOLD, 31), fill=INK)
    return canvas.convert("RGB")


def main() -> None:
    BRAND.mkdir(parents=True, exist_ok=True)
    mark = Image.open(BRAND / "temanusaha-mark.png").convert("RGBA")
    alpha_box = mark.getchannel("A").getbbox()
    assert alpha_box, "Source mark has no visible pixels"
    mark = mark.crop(alpha_box)

    horizontal_logo(mark).save(BRAND / "temanusaha-logo-horizontal.png", optimize=True)
    horizontal_logo(mark, white=True).save(BRAND / "temanusaha-logo-horizontal-white.png", optimize=True)
    stacked_logo(mark).save(BRAND / "temanusaha-logo-stacked.png", optimize=True)
    solid_mark(mark, GREEN).save(BRAND / "temanusaha-mark-monochrome-green.png", optimize=True)
    solid_mark(mark, "white").save(BRAND / "temanusaha-mark-monochrome-white.png", optimize=True)
    pattern(mark).save(BRAND / "temanusaha-pattern.png", optimize=True)
    apple_icon(mark).save(APP / "apple-icon.png", optimize=True)
    favicon = fit(mark, (256, 256))
    favicon.save(APP / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    social_cover(mark).save(APP / "opengraph-image.png", optimize=True)

    expected = {
        BRAND / "temanusaha-logo-horizontal.png": (1800, 420),
        BRAND / "temanusaha-logo-horizontal-white.png": (1800, 420),
        BRAND / "temanusaha-logo-stacked.png": (1100, 1000),
        BRAND / "temanusaha-pattern.png": (1600, 900),
        APP / "apple-icon.png": (180, 180),
        APP / "opengraph-image.png": (1200, 630),
    }
    for path, size in expected.items():
        with Image.open(path) as image:
            assert image.size == size, f"{path.name}: expected {size}, got {image.size}"
    print(f"Generated {len(expected) + 3} brand assets")


if __name__ == "__main__":
    main()
