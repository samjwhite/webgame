"""Game art made from the reference pictures in tools/art/reference/.

Pictures are scaled down to RES times the game's pixel size (lib.RES) and reduced to a limited
palette. Sprites are cut out from the dark sprite-sheet backgrounds. Sizes in the constants below
are game pixels unless they say they are in the source picture.
"""

import os
from PIL import Image, ImageChops, ImageEnhance, ImageFilter

from lib import OUTLINE, RES

HERE = os.path.dirname(os.path.abspath(__file__))
REFERENCE = os.path.join(HERE, "reference")
SCENE_WIDTH = 192
MAP_SCALE = 0.5  # the "Карта" screen: game pixels per pixel of village_map.png

# Close-up pictures: output name -> (reference file, crop box or None)
SCENES = {
    # Baba Hanya's close-up, redrawn by Codex in the game's style with the same face (approved).
    "talk_grandma": ("incoming/talk_grandma_v2.png", None),
    "talk_grandpa": ("grandpa_pond.png", None),
    # Valya behind the counter: the approved Valya, the sign "Продукти", the same counter as before.
    "talk_seller": ("incoming/seller_v2.png", None),
    # The club porch with the approved trio (village_lads_everyday_v4.png), drawn by Codex over the
    # composition of lads.png. Approved by the owner.
    "talk_lads": ("incoming/lads_porch_v2.png", None),
    # The date at the river, drawn by Codex from the approved designs (Svetka, the river, the player).
    # Approved by the owner.
    "river_date": ("incoming/river_date_v4.png", None),
    # He goes over to Svetka at the disco while Tolik watches from the door: the first of the four
    # approved key moments by ChatGPT (summer_key_moments_v2.png, top left), redrawn by Codex only to
    # give the hero the 2003 haircut the owner asked for. Approved by the owner.
    "disco_svetka": ("incoming/disco_svetka_v2.png", None),
    # The catfish (summer story, stage 2): the two catches and the night sale are the approved ChatGPT
    # concepts redrawn by Codex only for the hero's 2003 haircut; the battery scene is drawn by Codex
    # from the approved driver and hero.
    "catfish_rod": ("incoming/pond_catfish_rod_v4.png", None),
    "catfish_night": ("incoming/pond_catfish_night_v2.png", None),
    "catfish_sale": ("incoming/catfish_sale_v2.png", None),
    "battery_rant": ("incoming/battery_rant_v2.png", None),
    # Mykola's kung fu in front of the TV: the approved ChatGPT concept, the hero redrawn by Codex to his
    # 2003 haircut and tracksuit.
    "mykola_kungfu": ("incoming/mykola_kungfu_v2.png", None),
    "disco": ("disco.png", None),
    # Grandma's shed with the moped under the tarpaulin, in the style of the approved yard.
    "shed": ("incoming/shed_v2.png", None),
    # The title: the approved club square (the old festive picture was too much like a postcard).
    "title": ("incoming/loc_club_v2.png", (180, 40, 1356, 702)),
    # The evening by the club: the approved club and lads, drawn by Codex.
    "nightfall": ("incoming/nightfall_v2.png", None),
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
    # Mykola, approved by ChatGPT (summer_characters_concepts.png, second figure).
    "mykola": ("incoming/summer_characters_concepts.png", (441, 15, 636, 577), 40, 25),
    # The driver, approved by ChatGPT (summer_characters_concepts.png, third figure).
    "driver": ("incoming/summer_characters_concepts.png", (785, 15, 1014, 573), 40, 25),
    # His car, drawn by Codex (driver_car.png): the bonnet shut, and open with the battery gone. Both
    # cells are the same size, so the car stands in the same place in both.
    "car": ("incoming/driver_car.png", (14, 380, 524, 700), 42, 25),
    "car_empty": ("incoming/driver_car.png", (1008, 380, 1518, 700), 42, 25),
    "backpack": ("sheet_club.png", (928, 452, 1108, 624), 14, 45),
    "moped": ("sheet_club.png", (1140, 396, 1488, 640), 28, 60),
    "truck": ("sheet_club.png", (24, 684, 432, 916), 52, 45),
    "shed_open": ("sheet_club.png", (468, 388, 896, 640), 26, 45),
}

# The lads' sheet and Svetka's concept are painted dark, muted and warm: at 40 px the denim, the olive
# jacket and her red blouse turned brown next to the brighter hero. Their sprites lose the warm cast first (red, green, blue factors), then get
# more light, contrast and a little colour (checked by the designer review, summer_round3).
SPRITE_LIFT = {name: ((0.92, 1.0, 1.15), 1.3, 1.15, 1.1) for name in ("tolik", "vovchik", "sanya", "svetka", "driver", "mykola")}


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
    "driver": ("incoming/summer_characters_concepts.png", (736, 616, 1065, 945)),
    "mykola": ("incoming/summer_characters_concepts.png", (375, 608, 692, 925)),
}
PORTRAIT_SIZE = 64  # CSS pixels in the dialog (style.css); the file is RES times larger


def portraits(out_portraits):
    os.makedirs(out_portraits, exist_ok=True)
    size = PORTRAIT_SIZE * RES
    for name, (file, box) in PORTRAITS.items():
        small = load(file).crop(box).resize((size, size), Image.Resampling.BOX)
        limit_palette(small, 128).save(f"{out_portraits}/{name}.png")


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
# the given way and is mirrored for the other. Approved by the owner.
HERO_SHEETS = {
    "hero_city": ("incoming/hero_city_v5.png", "left", 0),
    "hero_sport": ("incoming/hero_sport_v5.png", "left", 1),
}
# The sideways walk, redrawn by the designer as a classic cycle (the owner found the first one jerky):
# row 0 in city clothes, row 1 in the tracksuit, 8 frames each, facing right.
HERO_SIDE_WALK = "incoming/hero_side_walk.png"
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

# The hero on grandpa's moped (incoming/hero_moped_v2.png; the old sheet showed another man in a cap):
# rows: city clothes riding right (6), the tracksuit riding right (6), then back and front views, city and
# tracksuit. The game sheets hero_moped_city/sport.png: rows right (6), left (6, mirrored), up, down.
MOPED_SHEET = "incoming/hero_moped_v2.png"
MOPED_FRAME = (48, 46)
MOPED_SIDE_LENGTH = 42  # the moped's length in game pixels when seen from the side
MOPED_FRONT_HEIGHT = 42  # rider and moped seen from the front or back

# Well close-up: a whitewashed concrete ring with a lid, a drum and a chain (incoming/well_scene_v5.png,
# drawn without the bucket and the crank handle), and its animation parts (incoming/well_parts_v2.png).
# Coordinates are in the source pictures. js/closeup.js (WELL_*) places the parts on the scene.
WELL_SCENE = "incoming/well_scene_v5.png"
WELL_PARTS = "incoming/well_parts_v2.png"
WELL_SCENE_BOX = (30, 30, 1506, 994)  # inside the picture frame
WELL_RIM = (752, 662, 252, 48)  # centre x, centre y, radius x, radius y of the ring's top
WELL_FRONT_BOTTOM = 940
# The crank handle in 8 turns, by the centre of its hub; the window around a hub; game pixels per pixel.
CRANK_HUBS = [(76, 235), (273, 238), (459, 231), (651, 235), (886, 236), (1070, 240), (1242, 234), (1399, 239)]
CRANK_WINDOW = (140, 140, 155, 145)  # left, up, right, down from the hub
CRANK_SCALE = 0.13
# The bucket: empty, full, swinging, splashing; each by the x of its chain, cut from BUCKET_TOP down.
BUCKET_CHAINS = [210, 580, 955, 1325]
BUCKET_TOP = 556
BUCKET_WINDOW = (110, 140, 354)  # left and right of the chain, height
BUCKET_SCALE = 0.0885


def load(name):
    return Image.open(os.path.join(REFERENCE, name)).convert("RGB")


def limit_palette(img, colors):
    return img.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")


def scene(img, width=SCENE_WIDTH):
    """A close-up picture `width` game pixels wide, built RES times larger."""
    height = round(img.height * width / img.width)
    small = img.resize((width * RES, height * RES), Image.Resampling.BOX)
    return limit_palette(small, 128)


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


def outline_filter():
    return ImageFilter.MaxFilter(2 * OUTLINE + 1)


def sprite(img, height):
    """Scale a cut-out to `height` game pixels (RES times larger in the file), make it fully solid
    and give it a dark outline. The result has one game pixel of room for the outline on each side."""
    width = max(1, round(img.width * height / img.height))
    small = img.resize((width * RES, height * RES), Image.Resampling.BOX)
    alpha = keep_largest_shape(small.getchannel("A").point(lambda a: 255 if a > 70 else 0))
    color = limit_palette(small.convert("RGB"), 48).convert("RGBA")
    color.putalpha(alpha)

    outline = Image.new("RGBA", small.size, (34, 24, 20, 255))
    outline.putalpha(alpha.filter(outline_filter()))
    result = Image.new("RGBA", ((width + 2) * RES, (height + 2) * RES), (0, 0, 0, 0))
    result.alpha_composite(outline, (RES, RES))
    result.alpha_composite(color, (RES, RES))
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
    """A scaled-down figure made fully solid, reduced in colours and given the dark outline of sprite()."""
    alpha = keep_largest_shape(small.getchannel("A").point(lambda a: 255 if a > 90 else 0))
    color = limit_palette(small.convert("RGB"), colors).convert("RGBA")
    color.putalpha(alpha)
    result = Image.new("RGBA", small.size, (34, 24, 20, 255))
    result.putalpha(alpha.filter(outline_filter()))
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
    small = figure.resize((w * RES, h * RES), Image.Resampling.BOX, box=window)
    return outlined_sprite(small, 64)


def side_walk_cells(row_index):
    """The sideways walk from HERO_SIDE_WALK, facing right: scaled so a typical frame is a person's height."""
    sheet = load(HERO_SIDE_WALK)
    # A low tolerance: the navy tracksuit is close to the dark background and would fall apart.
    mask = flat_background_mask(sheet, 6)
    row = figures_in_rows(mask)[row_index]
    heights = sorted(box[3] - box[1] for box in row)
    scale = HERO_HEIGHT / heights[len(heights) // 2]
    baseline = max(box[3] for box in row) - 1
    return [hero_cell(sheet, mask, box, baseline, scale) for box in row]


def hero_animation(file, side_faces, side_walk_row=None):
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
    if side_walk_row is not None:
        walk_right = side_walk_cells(side_walk_row)
        walk_left = [cell.transpose(Image.Transpose.FLIP_LEFT_RIGHT) for cell in walk_right]
        left = walk_left + [left[8]]
        right = walk_right + [right[8]]
    layout = [down[:8], up[:8], left[:8], right[:8], idle, [down[8], up[8], left[8], right[8]]]
    fw, fh = larger(HERO_FRAME)
    result = Image.new("RGBA", (fw * 8, fh * len(layout)))
    for r, frames in enumerate(layout):
        for c, frame in enumerate(frames):
            result.alpha_composite(frame, (c * fw, r * fh))
    return result


def larger(size):
    """A size in game pixels as file pixels."""
    return (size[0] * RES, size[1] * RES)


def glow_frame(sheet, center_x, top, window, size):
    """Cut one frame from a sheet with a glowing dark background and scale it to `size` game pixels."""
    w, h = window
    cut = cut_out_gradient(sheet.crop((center_x - w // 2, top, center_x + w // 2, top + h)))
    small = cut.resize(larger(size), Image.Resampling.BOX)
    alpha = keep_largest_shape(small.getchannel("A").point(lambda a: 255 if a > 90 else 0))
    color = limit_palette(small.convert("RGB"), 48).convert("RGBA")
    color.putalpha(alpha)
    return color


def chicken_strips(out_world):
    sheet = load("chicken_sheet.png")
    for name, (top, bottom) in CHICKEN_BANDS.items():
        window = (CHICKEN_WINDOW_W, bottom - top)
        size = (round(window[0] * CHICKEN_SCALE), round(window[1] * CHICKEN_SCALE))
        frames = [glow_frame(sheet, x, top, window, size) for x in CHICKEN_COLUMNS]
        cut_strip(frames, larger(size)).save(f"{out_world}/{name}.png")


def moped_cell(sheet, mask, box, scale, baseline):
    """One figure on the moped in a cell: wheels on the cell's bottom, centred, with the sprite outline."""
    own = Image.new("L", mask.size, 0)
    own.paste(mask.crop(box), box[:2])
    figure = sheet.convert("RGBA")
    figure.putalpha(own)
    w, h = MOPED_FRAME
    cx = (box[0] + box[2]) / 2
    window = (cx - w / 2 / scale, baseline + 2 / scale - h / scale, cx + w / 2 / scale, baseline + 2 / scale)
    small = figure.resize(larger(MOPED_FRAME), Image.Resampling.BOX, box=window)
    return outlined_sprite(small, 64)


def moped_riding(out_world):
    sheet = load(MOPED_SHEET)
    mask = flat_background_mask(sheet, 20)
    city, sport, views = figures_in_rows(mask)
    for name, side, (back, front) in (("city", city, views[0:2]), ("sport", sport, views[2:4])):
        scale = MOPED_SIDE_LENGTH / (side[0][2] - side[0][0])
        baseline = max(box[3] for box in side)
        right = [moped_cell(sheet, mask, box, scale, baseline) for box in side]
        left = [cell.transpose(Image.Transpose.FLIP_LEFT_RIGHT) for cell in right]
        view_scale = MOPED_FRONT_HEIGHT / (front[3] - front[1])
        up = moped_cell(sheet, mask, back, view_scale, back[3])
        down = moped_cell(sheet, mask, front, view_scale, front[3])
        fw, fh = larger(MOPED_FRAME)
        result = Image.new("RGBA", (fw * 6, fh * 4))
        for r, frames in enumerate([right, left, [up], [down]]):
            for c, frame in enumerate(frames):
                result.alpha_composite(frame, (c * fw, r * fh))
        result.save(f"{out_world}/hero_moped_{name}.png")


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
    """The well (drawn without bucket and crank), plus the front of the ring as a separate layer."""
    scene = load(WELL_SCENE)

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
    size = larger((SCENE_WIDTH, round(background.height * SCENE_WIDTH / background.width)))
    background = limit_palette(background.resize(size, Image.Resampling.BOX), 128)
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
    color = limit_palette(small.convert("RGB"), 32).convert("RGBA")
    color.putalpha(alpha)
    return color


def own_figure(sheet, mask, box):
    """The sheet with only the figure inside box visible: neighbours on a crowded sheet are left out."""
    own = Image.new("L", mask.size, 0)
    own.paste(mask.crop(box), box[:2])
    figure = sheet.convert("RGBA")
    figure.putalpha(own)
    return figure


def well_crank_frames():
    sheet = load(WELL_PARTS)
    mask = flat_background_mask(sheet, 20)
    boxes = figures_in_rows(mask)[0]
    left, up, right, down = CRANK_WINDOW
    size = larger((round((left + right) * CRANK_SCALE), round((up + down) * CRANK_SCALE)))
    frames = []
    for (hx, hy), box in zip(CRANK_HUBS, boxes):
        window = own_figure(sheet, mask, box).crop((hx - left, hy - up, hx + right, hy + down))
        frames.append(solid_sprite(window, size))
    return cut_strip(frames, size)


def well_bucket_frames():
    sheet = load(WELL_PARTS)
    left, right, height = BUCKET_WINDOW
    size = larger((round((left + right) * BUCKET_SCALE), round(height * BUCKET_SCALE)))
    frames = []
    mask = flat_background_mask(sheet, 20)
    boxes = figures_in_rows(mask)[1]
    for chain, box in zip(BUCKET_CHAINS, boxes):
        window = own_figure(sheet, mask, box).crop((chain - left, BUCKET_TOP, chain + right, BUCKET_TOP + height))
        frames.append(solid_sprite(window, size))
    return cut_strip(frames, size)


# The potato-beetle mini-game: the plot (incoming/garden_closeup.png) and its parts
# (incoming/garden_parts.png): the glass jar and the beetle, big and small. The game moves the jar itself:
# the owner found a drawn hand creepy, so the hands on that sheet are not used.
GARDEN_PICTURE = "incoming/garden_closeup.png"
GARDEN_PARTS = "incoming/garden_parts.png"
# (box in the parts sheet, cell in game pixels, the box's point placed at the cell's point, or None to centre)
JAR_BOX, JAR_CELL = (670, 372, 866, 668), (26, 32)
BEETLE_BIG_BOX, BEETLE_BIG_CELL = (300, 715, 555, 980), (12, 12)
BEETLE_SMALL_BOX, BEETLE_SMALL_CELL = (712, 792, 838, 924), (6, 6)


def fitted(img, cell, colors=48):
    """A cut-out scaled to fit a cell of game pixels, centred, alpha made hard."""
    cut = img.crop(img.getchannel("A").getbbox())
    width, height = larger(cell)
    scale = min(width / cut.width, height / cut.height)
    small = cut.resize((max(1, round(cut.width * scale)), max(1, round(cut.height * scale))), Image.Resampling.LANCZOS)
    alpha = small.getchannel("A").point(lambda a: 255 if a > 110 else 0)
    color = limit_palette(small.convert("RGB"), colors).convert("RGBA")
    color.putalpha(alpha)
    result = Image.new("RGBA", (width, height))
    result.alpha_composite(color, ((width - color.width) // 2, (height - color.height) // 2))
    return result


def garden_scene(out_scenes, out_world):
    scene(load(GARDEN_PICTURE)).save(f"{out_scenes}/garden.png")
    parts = load(GARDEN_PARTS)
    fitted(cut_out(parts.crop(JAR_BOX), 30), JAR_CELL, 64).save(f"{out_scenes}/jar.png")
    fitted(cut_out(parts.crop(BEETLE_BIG_BOX), 30), BEETLE_BIG_CELL).save(f"{out_scenes}/beetle.png")
    fitted(cut_out(parts.crop(BEETLE_SMALL_BOX), 30), BEETLE_SMALL_CELL).save(f"{out_world}/beetle.png")


def icon(img):
    height = ICON_HEIGHT * RES
    width = round(img.width * height / img.height)
    return limit_palette(img.resize((width, height), Image.Resampling.BOX), 48)


def build(out_scenes, out_world, out_ui, out_icons):
    for name, (file, box) in SCENES.items():
        img = load(file)
        if box:
            img = img.crop(box)
        scene(img).save(f"{out_scenes}/{name}.png")

    # The "Карта" screen shows the whole map with its legend and markers, as sharp as the source allows.
    village = load("village_map.png")
    scale = min(1, MAP_SCALE * RES)
    size = (round(village.width * scale), round(village.height * scale))
    village.resize(size, Image.Resampling.BOX).save(f"{out_ui}/village_map.png")

    for name, (file, box, height, tolerance) in SPRITES.items():
        cut = cut_out(load(file).crop(box), tolerance)
        if name in SPRITE_LIFT:
            cut = lifted(cut, SPRITE_LIFT[name])
        sprite(cut, height).save(f"{out_world}/{name}.png")

    for name, (file, box) in ICONS.items():
        icon(load(file).crop(box)).save(f"{out_ui}/{name}.png")

    for name, (file, side_faces, side_walk_row) in HERO_SHEETS.items():
        hero_animation(file, side_faces, side_walk_row).save(f"{out_world}/{name}.png")

    app_icons(out_icons)
    chicken_strips(out_world)
    moped_riding(out_world)

    background, front = well_pictures()
    background.save(f"{out_scenes}/well.png")
    front.save(f"{out_scenes}/well_front.png")
    well_crank_frames().save(f"{out_scenes}/crank.png")
    well_bucket_frames().save(f"{out_scenes}/bucket.png")
    garden_scene(out_scenes, out_world)
