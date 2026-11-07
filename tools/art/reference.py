"""Game art made from the reference pictures in tools/art/reference/.

Pictures are scaled down to the game's pixel size and reduced to a limited
palette. Sprites are cut out from the dark sprite-sheet backgrounds.
"""

import os
from PIL import Image, ImageFilter

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

# Sprites cut from sheets: output name -> (reference file, crop box, height in game pixels, background tolerance)
SPRITES = {
    "hero_moped": ("collage.png", (266, 565, 454, 775), 42, 45),
    "lad_red": ("collage.png", (456, 565, 534, 760), 40, 25),
    "lad_squat": ("collage.png", (526, 600, 628, 760), 30, 45),
    "lad_cap": ("collage.png", (628, 565, 694, 760), 40, 25),
    "grandma": ("collage.png", (698, 565, 800, 775), 40, 25),
    "seller": ("collage.png", (806, 565, 910, 775), 40, 25),
    "backpack": ("sheet_club.png", (928, 452, 1108, 624), 14, 45),
    "moped": ("sheet_club.png", (1140, 396, 1488, 640), 22, 60),
    "truck": ("sheet_club.png", (24, 684, 432, 916), 34, 45),
    "shed_open": ("sheet_club.png", (468, 388, 896, 640), 26, 45),
}


# Checklist icons keep their dark background: output name -> (reference file, crop box)
ICONS = {
    "beer": ("collage.png", (924, 572, 1066, 730)),
    "tracksuit": ("collage.png", (1064, 572, 1212, 718)),
    "moped": ("sheet_club.png", (1130, 386, 1498, 640)),
}
ICON_HEIGHT = 32


# Hero animation sheets: 4 walking rows (down, up, left, right) of 8 frames, idle frames on the right.
HERO_SHEETS = {"hero_city": "hero_city_sheet.png", "hero_sport": "hero_sport_sheet.png"}
HERO_COLUMNS = [200, 324, 448, 570, 692, 816, 936, 1058]
HERO_ROW_TOPS = [24, 240, 444, 646]
HERO_IDLE_COLUMNS = [1350, 1462, 1574, 1686]
HERO_WINDOW = (124, 194)
HERO_FRAME = (28, 44)

APP_ICON_SIZES = (180, 192, 512)


def load(name):
    return Image.open(os.path.join(REFERENCE, name)).convert("RGB")


def limit_palette(img, colors):
    return img.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")


def scene(img, width=SCENE_WIDTH):
    height = round(img.height * width / img.width)
    small = img.resize((width, height), Image.Resampling.BOX)
    return limit_palette(small, 64)


def cut_out(img, tolerance):
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


def keep_largest_shape(alpha):
    """Drop small stray bits (pieces of neighbouring sprites) and keep the main figure."""
    w, h = alpha.size
    pixels = alpha.load()
    seen = set()
    largest = []
    for start in ((x, y) for y in range(h) for x in range(w)):
        if start in seen or pixels[start] == 0:
            continue
        shape = []
        stack = [start]
        seen.add(start)
        while stack:
            x, y = stack.pop()
            shape.append((x, y))
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in seen and pixels[nx, ny]:
                    seen.add((nx, ny))
                    stack.append((nx, ny))
        if len(shape) > len(largest):
            largest = shape
    result = Image.new("L", alpha.size, 0)
    for point in largest:
        result.putpixel(point, 255)
    return result


def sprite(img, height):
    """Scale a cut-out down, make it fully solid and give it a dark 1px outline."""
    width = max(1, round(img.width * height / img.height))
    small = img.resize((width, height), Image.Resampling.BOX)
    alpha = keep_largest_shape(small.getchannel("A").point(lambda a: 255 if a > 70 else 0))
    color = limit_palette(small.convert("RGB"), 32).convert("RGBA")
    color.putalpha(alpha)

    outline = Image.new("RGBA", (width, height), (34, 24, 20, 255))
    outline.putalpha(alpha.filter(ImageFilter.MaxFilter(3)))
    result = Image.new("RGBA", (width + 2, height + 2), (0, 0, 0, 0))
    result.alpha_composite(outline, (1, 1))
    result.alpha_composite(color, (1, 1))
    return result


def cut_out_gradient(img, step=14, total=80):
    """Like cut_out, but follows a background that slowly changes colour (glow behind the figure)."""
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    ref = pixels[0, 0]
    edges = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    stack = [(point, pixels[point]) for point in edges]
    seen = set()
    while stack:
        (x, y), previous = stack.pop()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h):
            continue
        color = pixels[x, y]
        if sum(abs(color[i] - previous[i]) for i in range(3)) > step:
            continue
        if sum(abs(color[i] - ref[i]) for i in range(3)) > total:
            continue
        seen.add((x, y))
        pixels[x, y] = (0, 0, 0, 0)
        for neighbour in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            stack.append((neighbour, color))
    return rgba


def hero_frame(sheet, center_x, top):
    w, h = HERO_WINDOW
    window = cut_out_gradient(sheet.crop((center_x - w // 2, top, center_x + w // 2, top + h)))
    small = window.resize(HERO_FRAME, Image.Resampling.BOX)
    alpha = keep_largest_shape(small.getchannel("A").point(lambda a: 255 if a > 90 else 0))
    color = limit_palette(small.convert("RGB"), 40).convert("RGBA")
    color.putalpha(alpha)
    return color


def hero_animation(file):
    """One sheet: rows down, up, left, right (8 frames each), then 4 idle frames."""
    sheet = load(file)
    rows = [[hero_frame(sheet, x, top) for x in HERO_COLUMNS] for top in HERO_ROW_TOPS]
    rows.append([hero_frame(sheet, x, HERO_ROW_TOPS[0]) for x in HERO_IDLE_COLUMNS])
    fw, fh = HERO_FRAME
    result = Image.new("RGBA", (fw * len(HERO_COLUMNS), fh * len(rows)))
    for r, frames in enumerate(rows):
        for c, frame in enumerate(frames):
            result.alpha_composite(frame, (c * fw, r * fh))
    return result


def app_icons(out_icons):
    img = load("icon.png")
    inset = round(img.width * 0.04)
    img = img.crop((inset, inset, img.width - inset, img.height - inset))
    for size in APP_ICON_SIZES:
        img.resize((size, size), Image.Resampling.LANCZOS).save(f"{out_icons}/icon-{size}.png")


def icon(img):
    width = round(img.width * ICON_HEIGHT / img.height)
    return limit_palette(img.resize((width, ICON_HEIGHT), Image.Resampling.BOX), 32)


def build(out_scenes, out_world, out_ui, out_icons):
    for name, (file, box) in SCENES.items():
        img = load(file)
        if box:
            img = img.crop(box)
        scene(img).save(f"{out_scenes}/{name}.png")

    village = load("village_map.png")
    size = (round(village.width * MAP_SCALE), round(village.height * MAP_SCALE))
    village.resize(size, Image.Resampling.BOX).save(f"{out_world}/map.png")

    for name, (file, box, height, tolerance) in SPRITES.items():
        sprite(cut_out(load(file).crop(box), tolerance), height).save(f"{out_world}/{name}.png")

    for name, (file, box) in ICONS.items():
        icon(load(file).crop(box)).save(f"{out_ui}/{name}.png")

    for name, file in HERO_SHEETS.items():
        hero_animation(file).save(f"{out_world}/{name}.png")

    app_icons(out_icons)
