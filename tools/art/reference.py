"""Game art made from the reference pictures in tools/art/reference/.

Pictures are scaled down to the game's pixel size and reduced to a limited
palette. Sprites are cut out from the dark sprite-sheet backgrounds.
"""

import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REFERENCE = os.path.join(HERE, "reference")
SCENE_WIDTH = 192
MAP_SCALE = 0.5

# Close-up pictures: output name -> (reference file, crop box or None)
SCENES = {
    "talk_grandma": ("grandma.png", None),
    "talk_grandpa": ("grandpa.png", None),
    "talk_seller": ("seller.png", None),
    "talk_lads": ("lads.png", None),
    "disco": ("disco.png", None),
    "shed": ("shed.png", None),
    "title": ("club_square.png", None),
    "intro": ("collage.png", (544, 350, 1032, 556)),
    "road": ("collage.png", (1054, 350, 1658, 556)),
}

# Sprites cut from sheets: output name -> (reference file, crop box, height in game pixels)
SPRITES = {
    "hero_city": ("collage.png", (18, 565, 108, 775), 26),
    "hero_sport": ("collage.png", (160, 565, 248, 775), 26),
    "hero_moped": ("collage.png", (266, 565, 454, 775), 28),
    "lad_red": ("collage.png", (456, 565, 534, 760), 25),
    "lad_squat": ("collage.png", (526, 600, 628, 760), 19),
    "lad_cap": ("collage.png", (628, 565, 694, 760), 25),
    "grandma": ("collage.png", (698, 565, 800, 775), 25),
    "seller": ("collage.png", (806, 565, 910, 775), 25),
    "backpack": ("sheet_club.png", (928, 452, 1108, 624), 12),
    "moped": ("sheet_club.png", (1140, 396, 1488, 640), 18),
    "truck": ("sheet_club.png", (24, 684, 432, 916), 26),
    "shed_open": ("sheet_club.png", (468, 388, 896, 640), 26),
}


# Checklist icons keep their dark background: output name -> (reference file, crop box)
ICONS = {
    "beer": ("collage.png", (924, 572, 1066, 730)),
    "tracksuit": ("collage.png", (1064, 572, 1212, 718)),
    "moped": ("sheet_club.png", (1130, 386, 1498, 640)),
}
ICON_HEIGHT = 32


def load(name):
    return Image.open(os.path.join(REFERENCE, name)).convert("RGB")


def limit_palette(img, colors):
    return img.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")


def scene(img, width=SCENE_WIDTH):
    height = round(img.height * width / img.width)
    small = img.resize((width, height), Image.Resampling.BOX)
    return limit_palette(small, 64)


def cut_out(img, tolerance=60):
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


def sprite(img, height):
    width = max(1, round(img.width * height / img.height))
    small = img.resize((width, height), Image.Resampling.BOX)
    alpha = small.getchannel("A").point(lambda a: 255 if a > 130 else 0)
    color = limit_palette(small.convert("RGB"), 32).convert("RGBA")
    color.putalpha(alpha)
    return color


def icon(img):
    width = round(img.width * ICON_HEIGHT / img.height)
    return limit_palette(img.resize((width, ICON_HEIGHT), Image.Resampling.BOX), 32)


def build(out_scenes, out_world, out_ui):
    for name, (file, box) in SCENES.items():
        img = load(file)
        if box:
            img = img.crop(box)
        scene(img).save(f"{out_scenes}/{name}.png")

    village = load("village_map.png")
    size = (round(village.width * MAP_SCALE), round(village.height * MAP_SCALE))
    village.resize(size, Image.Resampling.BOX).save(f"{out_world}/map.png")

    for name, (file, box, height) in SPRITES.items():
        sprite(cut_out(load(file).crop(box)), height).save(f"{out_world}/{name}.png")

    for name, (file, box) in ICONS.items():
        icon(load(file).crop(box)).save(f"{out_ui}/{name}.png")
