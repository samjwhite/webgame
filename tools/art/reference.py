"""Game art made from the reference pictures in tools/art/reference/.

The pictures are scaled down to the game's pixel size, reduced to a limited
palette and, for world objects, cut out from the dark sprite-sheet background.
"""

import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REFERENCE = os.path.join(HERE, "reference")
SCENE_WIDTH = 192

# (left, top, right, bottom) boxes in reference/village.png
VILLAGE_OVERVIEW = (0, 0, 890, 690)
BUS_STOP_PANEL = (902, 700, 1534, 1010)

# Sprite-sheet cut-outs: name -> (box, width in game pixels)
SHEET_SPRITES = {
    "house": ((12, 711, 188, 827), 104),
    "shop": ((332, 707, 520, 827), 120),
    "bus_stop": ((532, 735, 672, 827), 60),
    "apple_tree": ((680, 707, 772, 823), 34),
    "sunflowers": ((204, 843, 268, 899), 22),
    "mallows": ((284, 835, 340, 903), 18),
    "logs": ((512, 855, 576, 899), 22),
    "haystack": ((588, 847, 660, 903), 26),
    "well": ((672, 835, 744, 907), 26),
    "bush": ((720, 923, 800, 991), 24),
}


def load(name):
    return Image.open(os.path.join(REFERENCE, name)).convert("RGB")


def limit_palette(img, colors=48):
    return img.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")


def scene(img, width=SCENE_WIDTH):
    height = round(img.height * width / img.width)
    small = img.resize((width, height), Image.Resampling.BOX)
    return limit_palette(small, 64)


def cut_out(img, tolerance=45):
    """Make the dark background around a sprite transparent (flood fill from the edges)."""
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    bg = pixels[0, 0]
    stack = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    seen = set()
    while stack:
        x, y = stack.pop()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h):
            continue
        seen.add((x, y))
        r, g, b, _ = pixels[x, y]
        if abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2]) > tolerance:
            continue
        pixels[x, y] = (0, 0, 0, 0)
        stack.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return rgba


def sprite(img, width):
    height = round(img.height * width / img.width)
    small = img.resize((width, height), Image.Resampling.BOX)
    alpha = small.getchannel("A").point(lambda a: 255 if a > 140 else 0)
    color = limit_palette(small.convert("RGB"), 32).convert("RGBA")
    color.putalpha(alpha)
    return color


def build(out_scenes, out_world):
    scene(load("grandma.png")).save(f"{out_scenes}/talk_grandma.png")
    scene(load("grandpa.png")).save(f"{out_scenes}/talk_grandpa.png")
    scene(load("seller.png")).save(f"{out_scenes}/talk_seller.png")

    village = load("village.png")
    scene(village.crop(VILLAGE_OVERVIEW)).save(f"{out_scenes}/title.png")
    scene(village.crop(BUS_STOP_PANEL)).save(f"{out_scenes}/bus_stop.png")

    for name, (box, width) in SHEET_SPRITES.items():
        sprite(cut_out(village.crop(box)), width).save(f"{out_world}/{name}.png")
