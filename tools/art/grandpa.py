"""Grandpa Petro for the world map.

There is no full-height picture of grandpa yet, so he is repainted from the hero's
idle frames (same proportions and style): flat cap, grey hair, moustache, knitted
cardigan over a checked shirt, brown trousers and a walking stick.
"""

from PIL import Image

FRAME_W, FRAME_H = 28, 44
IDLE_ROW = 4

CAP = [(62, 43, 32), (91, 65, 48), (116, 86, 63)]
CARDIGAN = [(107, 74, 46), (164, 128, 86), (196, 164, 118)]
SHIRT = [(58, 72, 96), (120, 124, 112)]
TROUSERS = [(52, 38, 30), (82, 62, 48), (110, 86, 66)]
SHOES = [(40, 30, 24), (70, 54, 42)]
GREY = (200, 198, 190)
MOUSTACHE = [(184, 180, 172), (236, 232, 224)]
STICK = [(70, 42, 22), (138, 90, 46)]
OUTLINE = (34, 24, 20, 255)


def brightness(color):
    r, g, b = color[:3]
    return (r + g + b) / 3


def shade(palette, color):
    """Pick a palette colour with about the same brightness as the original pixel."""
    level = brightness(color) / 255
    index = min(len(palette) - 1, int(level * len(palette) * 1.3))
    return palette[index] + (255,)


def is_skin(color):
    r, g, b = color[:3]
    return r > 170 and 100 < g < 200 and b < 150 and r - b > 60


def repaint(frame):
    out = frame.copy()
    pixels = out.load()
    for y in range(FRAME_H):
        for x in range(FRAME_W):
            color = pixels[x, y]
            if color[3] == 0 or brightness(color) < 45:
                continue
            r, g, b = color[:3]
            if y <= 8:
                pixels[x, y] = shade(CAP, color)
            elif y <= 14:
                if not is_skin(color) and (x <= 10 or x >= 17):
                    pixels[x, y] = GREY + (255,)
            elif y <= 26:
                if 13 <= x <= 14 and y <= 23:
                    pixels[x, y] = SHIRT[(x + y) % 2] + (255,)
                elif is_skin(color) and y >= 26:
                    continue
                elif y in (19, 23):
                    pixels[x, y] = CARDIGAN[0] + (255,)
                else:
                    pixels[x, y] = shade(CARDIGAN, color)
            elif y <= 36:
                if is_skin(color):
                    continue
                pixels[x, y] = shade(TROUSERS, color)
            else:
                pixels[x, y] = shade(SHOES, color)

    # cap brim and moustache
    for x in range(9, 20):
        if pixels[x, 8][3]:
            pixels[x, 8] = CAP[0] + (255,)
    for x in range(12, 17):
        pixels[x, 13] = MOUSTACHE[1 if x in (13, 14, 15) else 0] + (255,)

    # walking stick in the right hand
    for y in range(26, 42):
        pixels[22, y] = STICK[1] + (255,)
        for x in (21, 23):
            if pixels[x, y][3] == 0:
                pixels[x, y] = OUTLINE
    for x in range(20, 23):
        pixels[x, 26] = STICK[1] + (255,)
        pixels[x, 25] = OUTLINE
    return out


def build(hero_sheet_path, out_path):
    sheet = Image.open(hero_sheet_path).convert("RGBA")
    frames = [sheet.crop((i * FRAME_W, IDLE_ROW * FRAME_H, (i + 1) * FRAME_W, (IDLE_ROW + 1) * FRAME_H)) for i in range(4)]
    strip = Image.new("RGBA", (FRAME_W * len(frames), FRAME_H))
    for i, frame in enumerate(frames):
        strip.alpha_composite(repaint(frame), (i * FRAME_W, 0))
    strip.save(out_path)
