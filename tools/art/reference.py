"""Game art made from the reference pictures in tools/art/reference/.

Pictures are scaled down to the game's pixel size and reduced to a limited
palette. Sprites are cut out from the dark sprite-sheet backgrounds.
"""

import os
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
REFERENCE = os.path.join(HERE, "reference")
SCENE_WIDTH = 192
MAP_SCALE = 0.5

# Areas of reference/village_map.png covered with reference/village_map_old.png in the world map.
MAP_PATCHES = [
    (0, 0, 232, 276),  # legend
    (1300, 266, 1360, 312),  # quest marker above the shop
]

# Parts of the world map drawn again on top of characters that walk behind them.
# Coordinates are game pixels on art/world/map.png. Shapes: ("poly", points) or ("rect", box),
# or ("dark", box) = only the statue's dark and grey pixels inside the box.
OCCLUDERS = {
    "occlude_well": [
        ("poly", [(287, 127), (326, 127), (332, 150), (281, 150)]),
        ("rect", (288, 149, 296, 188)),
        ("rect", (321, 149, 329, 188)),
        ("rect", (295, 151, 323, 162)),
        ("rect", (295, 163, 326, 190)),
    ],
    "occlude_statue": [
        ("dark", (448, 145, 476, 190)),
        ("rect", (450, 187, 477, 215)),
    ],
}

# Close-up pictures: output name -> (reference file, crop box or None)
SCENES = {
    "talk_grandma": ("grandma.png", None),
    "talk_grandpa": ("grandpa_pond.png", None),
    "talk_seller": ("seller.png", None),
    # The club porch with the approved trio (village_lads_everyday_v4.png), drawn by Codex over the
    # composition of lads.png. Temporary until the human approves it.
    "talk_lads": ("incoming/lads_porch_v2.png", None),
    # The date at the river, drawn by Codex from the approved designs (Svetka, the river, the player).
    # Temporary until the human approves it.
    "river_date": ("incoming/river_date_v4.png", None),
    # He goes over to Svetka at the disco while Tolik watches from the door: the first of the four
    # approved key moments by ChatGPT (summer_key_moments_v2.png, top left), redrawn by Codex only to
    # give the hero the 2003 haircut the owner asked for. Temporary until the human approves it.
    "disco_svetka": ("incoming/disco_svetka_v2.png", None),
    "disco": ("disco.png", None),
    "shed": ("shed.png", None),
    "title": ("club_square.png", None),
    "intro": ("collage.png", (544, 350, 1032, 556)),
    "road": ("collage.png", (1054, 350, 1658, 556)),
}

# Sprites cut from sheets: output name -> (reference file, crop box, height in game pixels, background tolerance)
SPRITES = {
    # The lads in their everyday clothes, approved designs by ChatGPT (village_lads_everyday_v4.png,
    # left to right Tolik, Vovchik, Sanya; figures on top, portraits below).
    "tolik": ("incoming/village_lads_everyday_v4.png", (57, 36, 317, 893), 40, 25),
    "vovchik": ("incoming/village_lads_everyday_v4.png", (358, 41, 619, 874), 40, 25),
    "sanya": ("incoming/village_lads_everyday_v4.png", (651, 368, 1005, 867), 23, 25),
    "grandma": ("collage.png", (698, 565, 800, 775), 40, 25),
    # Valya of sturdy build, approved by ChatGPT (valya_character_v2.png, full figure on the left).
    "seller": ("incoming/valya_character_v2.png", (136, 13, 533, 1009), 40, 25),
    # Svetka, approved concept by ChatGPT (summer_characters_concepts.png, top left).
    "svetka": ("incoming/summer_characters_concepts.png", (108, 20, 272, 574), 40, 25),
    "backpack": ("sheet_club.png", (928, 452, 1108, 624), 14, 45),
    "moped": ("sheet_club.png", (1140, 396, 1488, 640), 28, 60),
    "truck": ("sheet_club.png", (24, 684, 432, 916), 52, 45),
    "shed_open": ("sheet_club.png", (468, 388, 896, 640), 26, 45),
}

# The lads' sheet is painted dark, muted and warm: at 40 px the denim and the olive jacket turned brown
# next to the brighter hero. Their sprites lose the warm cast first (red, green, blue factors), then get
# more light, contrast and a little colour (checked by the designer review, summer_round3).
SPRITE_LIFT = {name: ((0.92, 1.0, 1.15), 1.3, 1.15, 1.1) for name in ("tolik", "vovchik", "sanya")}


def lifted(cut, factors):
    balance, brightness, contrast, color = factors
    alpha = cut.getchannel("A")
    bands = [band.point(lambda v, f=f: min(255, round(v * f))) for band, f in zip(cut.convert("RGB").split(), balance)]
    rgb = ImageEnhance.Brightness(Image.merge("RGB", bands)).enhance(brightness)
    rgb = ImageEnhance.Contrast(rgb).enhance(contrast)
    rgb = ImageEnhance.Color(rgb).enhance(color).convert("RGBA")
    rgb.putalpha(alpha)
    return rgb


# Bust portraits over the dialog text, by speaker id (js/assets.js, PORTRAIT_FILES): square crops of
# the designer's approved portraits, scaled to PORTRAIT_SIZE. dialogue_cast.png is the early sheet: the
# lads and Valya come from their newer sheets.
PORTRAITS = {
    # The hero with the 2003 haircut the owner asked for, redrawn by Codex from dialogue_cast.png.
    "hero": ("incoming/hero_portrait_v2.png", (290, 60, 1000, 770)),
    "grandma": ("incoming/dialogue_cast.png", (375, 50, 712, 387)),
    "grandpa": ("incoming/dialogue_cast.png", (734, 31, 1072, 369)),
    "valya": ("incoming/valya_character_v2.png", (700, 30, 1260, 590)),
    "tolik": ("incoming/village_lads_everyday_v4.png", (18, 946, 321, 1249)),
    "vovchik": ("incoming/village_lads_everyday_v4.png", (354, 953, 668, 1267)),
    "sanya": ("incoming/village_lads_everyday_v4.png", (697, 961, 1008, 1272)),
    "svetka": ("incoming/summer_characters_concepts.png", (17, 614, 332, 929)),
}
PORTRAIT_SIZE = 64


def portraits(out_portraits):
    os.makedirs(out_portraits, exist_ok=True)
    for name, (file, box) in PORTRAITS.items():
        small = load(file).crop(box).resize((PORTRAIT_SIZE, PORTRAIT_SIZE), Image.Resampling.BOX)
        limit_palette(small, 64).save(f"{out_portraits}/{name}.png")


# Checklist icons keep their dark background: output name -> (reference file, crop box)
ICONS = {
    "beer": ("collage.png", (924, 572, 1066, 730)),
    "tracksuit": ("collage.png", (1064, 572, 1212, 718)),
    "moped": ("sheet_club.png", (1130, 386, 1498, 640)),
}
ICON_HEIGHT = 32


# Hero walk sheets drawn by the designer (summer story, version 5: a 2003 school haircut, no backpack, the same proportions
# as everyone else, a full walk cycle). Flat #26222f background. Source rows: walking toward the viewer,
# away, sideways (8 frames and one standing frame each), then 4 idle frames. The sideways row faces
# the given way and is mirrored for the other. Temporary until the human approves them.
HERO_SHEETS = {
    "hero_city": ("incoming/hero_city_v5.png", "left"),
    "hero_sport": ("incoming/hero_sport_v5.png", "left"),
}
# Game sheet: rows walking down, up, left, right (8 frames), idle (4 frames), standing down, up, left,
# right. The same layout is read by js/world.js (HERO_*).
HERO_FRAME = (32, 48)  # room for a full stride, the bob of a step and a foot nearer the viewer
HERO_HEIGHT = 40  # a person, docs/PROPORTIONS.md
HERO_SOLES = 45  # a standing figure's soles end above this cell row; the outline under them is row 45
HERO_HEAD = 0.16  # the top part of a figure (its head) that keeps it in place in its cell

APP_ICON_SIZES = (180, 192, 512)

# Chickens (reference/chicken_sheet.png): frames idle, walk x5, peck x4, flap. Centre x of each frame.
CHICKEN_COLUMNS = [225, 408, 536, 662, 776, 870, 1000, 1100, 1196, 1292, 1434]
CHICKEN_WINDOW_W = 130
CHICKEN_BANDS = {"rooster": (22, 190), "hen_white": (200, 330), "hen_ginger": (350, 475), "hen_black": (492, 625)}
CHICKEN_SCALE = 0.11

# Hero on the moped (reference/moped_sheet.png): rows right (6), left (6), up (1), down (1).
MOPED_ROWS = [
    (255, [284, 504, 732, 956, 1180, 1406]),
    (418, [278, 506, 736, 956, 1182, 1408]),
    (595, [232]),
    (595, [844]),
]
MOPED_WINDOW = (180, 152)
MOPED_FRAME = (45, 38)

# Well close-up (reference/well_scene.png and well_sheet.png). Coordinates are in the source pictures.
WELL_SCENE_BOX = (30, 30, 1506, 994)  # inside the picture frame
# Baked-in bucket, rope and crank are covered with a copy of the background next to them
# (fence and bushes repeat sideways). Rows below WELL_RIM_TOP are inside the ring and get blended.
WELL_ERASE_BUCKET = (684, 444, 826, 684)
WELL_ERASE_CRANK = (1078, 354, 1252, 526)
WELL_RIM_TOP = 600
WELL_RIM = (760, 660, 255, 55)  # centre x, centre y, radius x, radius y of the well ring top
WELL_FRONT_BOTTOM = 940
CRANK_HUBS = [(552, 857), (678, 852), (805, 852), (930, 852), (1053, 852), (1179, 852), (1307, 851), (1434, 850)]
CRANK_WINDOW = (14, 32, 102, 70)  # left, up, right, down from the hub
CRANK_SCALE = 0.34
BUCKET_BOXES = [(32, 828, 116, 936), (148, 828, 232, 936), (264, 828, 344, 936), (372, 816, 456, 936)]
BUCKET_SIZE = (17, 22)


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


def flat_background_mask(img, tolerance=14):
    """White where a picture on a flat background (its top left pixel) differs from it."""
    rgb = img.convert("RGB")
    difference = ImageChops.difference(rgb, Image.new("RGB", rgb.size, rgb.getpixel((0, 0))))
    r, g, b = difference.split()
    mask = ImageChops.lighter(ImageChops.lighter(r, g), b).point(lambda v: 255 if v > tolerance else 0)
    # Close pin holes where a dark pixel of the figure happens to match the background.
    return mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))


def runs(profile, gap, minimum):
    """Spans of a projection (one count per row or column) with content, split by empty gaps."""
    spans, start, empty = [], None, 0
    for i, count in enumerate(profile + [0] * gap):
        if count:
            if start is None:
                start = i
            empty = 0
        elif start is not None:
            empty += 1
            if empty >= gap:
                if i - empty + 1 - start >= minimum:
                    spans.append((start, i - empty + 1))
                start, empty = None, 0
    return spans


def figures_in_rows(mask):
    """Rows of figures on a sheet, each figure as its (left, top, right, bottom) box, rows top to bottom."""
    w, h = mask.size
    rows = []
    for top, bottom in runs([mask.crop((0, y, w, y + 1)).getbbox() is not None for y in range(h)], 12, 60):
        band = mask.crop((0, top, w, bottom))
        columns = [band.crop((x, 0, x + 1, band.height)).getbbox() is not None for x in range(w)]
        boxes = []
        for left, right in runs(columns, 10, 24):
            box = band.crop((left, 0, right, band.height)).getbbox()
            boxes.append((left, top + box[1], right, top + box[3]))
        rows.append(boxes)
    return rows


def outlined_sprite(small, colors):
    """A scaled-down figure made fully solid, reduced in colours and given the dark 1px outline of sprite()."""
    alpha = keep_largest_shape(small.getchannel("A").point(lambda a: 255 if a > 90 else 0))
    color = limit_palette(small.convert("RGB"), colors).convert("RGBA")
    color.putalpha(alpha)
    result = Image.new("RGBA", small.size, (34, 24, 20, 255))
    result.putalpha(alpha.filter(ImageFilter.MaxFilter(3)))
    result.alpha_composite(color)
    return result


def hero_cell(sheet, mask, box, baseline, scale):
    """One figure in a game cell: the soles on HERO_SOLES, the head in the middle, other figures left out."""
    left, top, right, bottom = box
    own = Image.new("L", mask.size, 0)
    own.paste(mask.crop(box), box[:2])
    figure = sheet.convert("RGBA")
    figure.putalpha(own)
    head = own.crop((left, top, right, top + round((baseline - top) * HERO_HEAD)))
    columns = [head.crop((x, 0, x + 1, head.height)).getbbox() is not None for x in range(head.width)]
    filled = [x for x, on in enumerate(columns) if on]
    center = left + (filled[0] + filled[-1] + 1) / 2
    w, h = HERO_FRAME
    window_top = baseline + 1 - HERO_SOLES / scale
    window = (center - w / 2 / scale, window_top, center + w / 2 / scale, window_top + h / scale)
    small = figure.resize(HERO_FRAME, Image.Resampling.BOX, box=window)
    return outlined_sprite(small, 40)


def hero_animation(file, side_faces):
    """The game sheet for one outfit, laid out as described at HERO_SHEETS."""
    sheet = load(file)
    mask = flat_background_mask(sheet)
    rows = figures_in_rows(mask)
    counts = [len(row) for row in rows]
    if counts != [9, 9, 9, 4]:
        raise ValueError(f"{file}: expected rows of 9, 9, 9 and 4 figures, found {counts}")
    cells = []
    for row in rows:
        # Image generation does not keep one scale across rows, so each row is measured by its own
        # standing figure (the last one; in the idle row, the first). Its soles are the ground: a
        # walking foot nearer the viewer may reach a little below it, and the head bobs inside the row.
        standing = row[8] if len(row) == 9 else row[0]
        scale = HERO_HEIGHT / (standing[3] - standing[1])
        baseline = standing[3] - 1
        cells.append([hero_cell(sheet, mask, box, baseline, scale) for box in row])
    down, up, side, idle = cells
    mirrored = [cell.transpose(Image.Transpose.FLIP_LEFT_RIGHT) for cell in side]
    left, right = (side, mirrored) if side_faces == "left" else (mirrored, side)
    layout = [down[:8], up[:8], left[:8], right[:8], idle, [down[8], up[8], left[8], right[8]]]
    fw, fh = HERO_FRAME
    result = Image.new("RGBA", (fw * 8, fh * len(layout)))
    for r, frames in enumerate(layout):
        for c, frame in enumerate(frames):
            result.alpha_composite(frame, (c * fw, r * fh))
    return result


def glow_frame(sheet, center_x, top, window, size):
    """Cut one frame from a sheet with a glowing dark background and scale it down."""
    w, h = window
    cut = cut_out_gradient(sheet.crop((center_x - w // 2, top, center_x + w // 2, top + h)))
    small = cut.resize(size, Image.Resampling.BOX)
    alpha = keep_largest_shape(small.getchannel("A").point(lambda a: 255 if a > 90 else 0))
    color = limit_palette(small.convert("RGB"), 32).convert("RGBA")
    color.putalpha(alpha)
    return color


def chicken_strips(out_world):
    sheet = load("chicken_sheet.png")
    for name, (top, bottom) in CHICKEN_BANDS.items():
        window = (CHICKEN_WINDOW_W, bottom - top)
        size = (round(window[0] * CHICKEN_SCALE), round(window[1] * CHICKEN_SCALE))
        frames = [glow_frame(sheet, x, top, window, size) for x in CHICKEN_COLUMNS]
        cut_strip(frames, size).save(f"{out_world}/{name}.png")


def moped_riding(out_world):
    sheet = load("moped_sheet.png")
    fw, fh = MOPED_FRAME
    result = Image.new("RGBA", (fw * 6, fh * len(MOPED_ROWS)))
    for r, (top, columns) in enumerate(MOPED_ROWS):
        for c, x in enumerate(columns):
            result.alpha_composite(glow_frame(sheet, x, top, MOPED_WINDOW, MOPED_FRAME), (c * fw, r * fh))
    result.save(f"{out_world}/hero_moped.png")


def is_statue_pixel(color):
    r, g, b = color[:3]
    return (r + g + b) / 3 < 140 or r - b < 40


def occluder(world_map, shapes):
    """Cut the given shapes out of the world map as a transparent overlay."""
    mask = Image.new("L", world_map.size, 0)
    draw = ImageDraw.Draw(mask)
    pixels = world_map.load()
    for kind, shape in shapes:
        if kind == "poly":
            draw.polygon(shape, fill=255)
        elif kind == "rect":
            draw.rectangle((shape[0], shape[1], shape[2] - 1, shape[3] - 1), fill=255)
        else:
            left, top, right, bottom = shape
            for y in range(top, bottom):
                for x in range(left, right):
                    if is_statue_pixel(pixels[x, y]):
                        mask.putpixel((x, y), 255)
    layer = world_map.convert("RGBA")
    layer.putalpha(mask)
    return layer.crop(mask.getbbox())


def app_icons(out_icons):
    img = load("icon.png")
    inset = round(img.width * 0.04)
    img = img.crop((inset, inset, img.width - inset, img.height - inset))
    for size in APP_ICON_SIZES:
        img.resize((size, size), Image.Resampling.LANCZOS).save(f"{out_icons}/icon-{size}.png")


def fill_rows(img, box):
    """Paint over a box by blending each row from its left edge colour to its right edge colour."""
    left, top, right, bottom = box
    pixels = img.load()
    for y in range(top, bottom):
        a, b = pixels[left - 1, y], pixels[right, y]
        for x in range(left, right):
            t = (x - left + 1) / (right - left + 1)
            pixels[x, y] = tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def copy_from_right(img, box):
    """Paint over a box with the same-size area just to its right."""
    left, top, right, bottom = box
    width = right - left
    img.paste(img.crop((right, top, right + width, bottom)), (left, top))


def well_pictures():
    """The well without bucket, rope and crank, plus the front of the ring as a separate layer."""
    scene = load("well_scene.png")
    left, top, right, bottom = WELL_ERASE_BUCKET
    copy_from_right(scene, (left, top, right, WELL_RIM_TOP))
    fill_rows(scene, (left, WELL_RIM_TOP, right, bottom))
    copy_from_right(scene, WELL_ERASE_CRANK)

    cx, cy, rx, ry = WELL_RIM
    mask = Image.new("L", scene.size, 0)
    mask_pixels = mask.load()
    for x in range(cx - rx, cx + rx + 1):
        front_edge = cy + ry * (1 - ((x - cx) / rx) ** 2) ** 0.5
        for y in range(int(front_edge), WELL_FRONT_BOTTOM):
            mask_pixels[x, y] = 255
    front = scene.convert("RGBA")
    front.putalpha(mask)

    box = WELL_SCENE_BOX
    background = scene.crop(box)
    front = front.crop(box)
    size = (SCENE_WIDTH, round(background.height * SCENE_WIDTH / background.width))
    background = limit_palette(background.resize(size, Image.Resampling.BOX), 64)
    small_front = front.resize(size, Image.Resampling.BOX)
    alpha = small_front.getchannel("A").point(lambda a: 255 if a > 128 else 0)
    small_front = background.convert("RGBA")
    small_front.putalpha(alpha)
    return background, small_front


def cut_strip(frames, size):
    strip = Image.new("RGBA", (size[0] * len(frames), size[1]))
    for i, frame in enumerate(frames):
        strip.alpha_composite(frame, (i * size[0], 0))
    return strip


def solid_sprite(img, size):
    small = img.resize(size, Image.Resampling.BOX)
    alpha = small.getchannel("A").point(lambda a: 255 if a > 110 else 0)
    color = limit_palette(small.convert("RGB"), 24).convert("RGBA")
    color.putalpha(alpha)
    return color


def well_crank_frames():
    sheet = load("well_sheet.png")
    left, up, right, down = CRANK_WINDOW
    size = (round((left + right) * CRANK_SCALE), round((up + down) * CRANK_SCALE))
    frames = []
    for hx, hy in CRANK_HUBS:
        window = cut_out(sheet.crop((hx - left, hy - up, hx + right, hy + down)), 40)
        frames.append(solid_sprite(window, size))
    return cut_strip(frames, size)


def well_bucket_frames():
    sheet = load("well_sheet.png")
    frames = []
    for left, top, right, bottom in BUCKET_BOXES:
        # all buckets share the bottom line, so crop them to the same height
        window = cut_out(sheet.crop((left, 808, right, bottom)), 40)
        frames.append(solid_sprite(window, BUCKET_SIZE))
    return cut_strip(frames, BUCKET_SIZE)


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
    # The "Карта" screen shows the map with its legend and markers.
    village.resize(size, Image.Resampling.BOX).save(f"{out_ui}/village_map.png")
    # In the world the legend and the "!" above the shop are covered with the same spots of the old map.
    old = load("village_map_old.png")
    for box in MAP_PATCHES:
        village.paste(old.crop(box), box[:2])
    world_map = village.resize(size, Image.Resampling.BOX)
    world_map.save(f"{out_world}/map.png")
    for name, shapes in OCCLUDERS.items():
        occluder(world_map, shapes).save(f"{out_world}/{name}.png")

    for name, (file, box, height, tolerance) in SPRITES.items():
        cut = cut_out(load(file).crop(box), tolerance)
        if name in SPRITE_LIFT:
            cut = lifted(cut, SPRITE_LIFT[name])
        sprite(cut, height).save(f"{out_world}/{name}.png")

    for name, (file, box) in ICONS.items():
        icon(load(file).crop(box)).save(f"{out_ui}/{name}.png")

    for name, (file, side_faces) in HERO_SHEETS.items():
        hero_animation(file, side_faces).save(f"{out_world}/{name}.png")

    app_icons(out_icons)
    chicken_strips(out_world)
    moped_riding(out_world)

    background, front = well_pictures()
    background.save(f"{out_scenes}/well.png")
    front.save(f"{out_scenes}/well_front.png")
    well_crank_frames().save(f"{out_scenes}/crank.png")
    well_bucket_frames().save(f"{out_scenes}/bucket.png")
