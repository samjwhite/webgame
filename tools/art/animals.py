"""Village cats and dogs, cut from the designer's sheets in reference/incoming/.

Each output is a grid of equal cells: one row per coat, one column per pose, feet on the bottom of the
cell, facing right. js/world.js reads the same layout (CAT_* and DOG_* constants).
"""

import os
from PIL import Image

from reference import cut_out, keep_largest_shape, limit_palette, load

BACKGROUND_TOLERANCE = 30
ENCLOSED_TOLERANCE = 22

# yard_cats_v3.png. Rows: tabby, cream with a black cap, calico. Columns: standing, seated, curled asleep.
CAT_SHEET = "incoming/yard_cats_v3.png"
CAT_ROWS = [(30, 305), (345, 640), (680, 975)]
CAT_COLUMNS = [(60, 480), (600, 900), (1065, 1435)]
CAT_SCALE = 0.06
CAT_CELL = (26, 18)

# village_dogs_sheet.png. Rows: ginger, black and tan, white with brown, grey shaggy.
# Columns: standing, seated, asleep, walk 1, walk 2, sniffing, barking, standing again.
DOG_SHEET = "incoming/village_dogs_sheet.png"
DOG_ROWS = [(118, 256), (328, 492), (562, 726), (788, 952)]
DOG_COLUMNS = [(22, 197), (205, 358), (362, 535), (540, 718), (722, 902), (908, 1062), (1066, 1212), (1252, 1424)]
DOG_SCALE = 0.2
DOG_CELL = (36, 32)
# Every dog stands on a baked-in strip of earth and grass this many source pixels tall: it is removed.
DOG_GROUND_BAND = 16


def remove_enclosed_background(cut):
    """The flood fill cannot reach background shut in by legs and tails, so match it by colour."""
    pixels = cut.load()
    for y in range(cut.height):
        for x in range(cut.width):
            r, g, b, a = pixels[x, y]
            if a and abs(r - 41) + abs(g - 35) + abs(b - 47) < ENCLOSED_TOLERANCE:
                pixels[x, y] = (0, 0, 0, 0)
    return cut


def remove_ground(cut):
    """Drop the earth and grass under a dog's paws, keeping the paws themselves."""
    pixels = cut.load()
    bottom = cut.getchannel("A").getbbox()[3]
    for y in range(bottom - DOG_GROUND_BAND, bottom):
        for x in range(cut.width):
            r, g, b, a = pixels[x, y]
            if a and (g >= r or (r + g + b) / 3 < 80):
                pixels[x, y] = (0, 0, 0, 0)
    return cut


def frame(sheet, box, scale, cell, clean=None):
    """One pose: background removed, scaled, stray bits dropped, standing on the cell's bottom edge."""
    cut = remove_enclosed_background(cut_out(sheet.crop(box), BACKGROUND_TOLERANCE))
    if clean:
        cut = clean(cut)
    cut = cut.crop(cut.getchannel("A").getbbox())
    size = (max(1, round(cut.width * scale)), max(1, round(cut.height * scale)))
    small = cut.resize(size, Image.Resampling.BOX)
    # A low threshold keeps the thin dark outline; the largest shape drops the lines drawn around a bark.
    alpha = keep_largest_shape(small.getchannel("A").point(lambda a: 255 if a > 90 else 0))
    color = limit_palette(small.convert("RGB"), 32).convert("RGBA")
    color.putalpha(alpha)
    color = color.crop(alpha.getbbox())
    if color.width > cell[0] or color.height > cell[1]:
        raise ValueError(f"Frame {color.size} from {box} does not fit the cell {cell}")
    result = Image.new("RGBA", cell)
    result.alpha_composite(color, ((cell[0] - color.width) // 2, cell[1] - color.height))
    return result


def grid(file, rows, columns, scale, cell, clean=None):
    sheet = load(file)
    result = Image.new("RGBA", (cell[0] * len(columns), cell[1] * len(rows)))
    for r, (top, bottom) in enumerate(rows):
        for c, (left, right) in enumerate(columns):
            result.alpha_composite(frame(sheet, (left, top, right, bottom), scale, cell, clean), (c * cell[0], r * cell[1]))
    return result


# Grandma, TEMPORARY until a drawn sheet is approved: made by moving parts of her one standing sprite.
# Rows: walking down, up, left, right, then standing and alive. Four columns each.
GRANDMA_LEGS = 0.72  # the part of her height below this moves on its own when she walks
GRANDMA_MARGIN = 2


def grandma_frame(figure, body_y, legs_x):
    """Her figure with the upper body moved by body_y and the skirt and feet moved by legs_x."""
    w, h = figure.size
    split = round(h * GRANDMA_LEGS)
    cell = Image.new("RGBA", (w + GRANDMA_MARGIN * 2, h + GRANDMA_MARGIN))
    cell.alpha_composite(figure.crop((0, split, w, h)), (GRANDMA_MARGIN + legs_x, GRANDMA_MARGIN + split))
    cell.alpha_composite(figure.crop((0, 0, w, split)), (GRANDMA_MARGIN, GRANDMA_MARGIN + body_y))
    return cell


def grandma_sheet(out_world):
    figure = Image.open(f"{out_world}/grandma.png").convert("RGBA")
    walk = [(0, -1), (1, 0), (0, 1), (1, 0)]
    idle = [(0, 0), (0, 0), (1, 0), (1, 0)]
    rows = [
        [grandma_frame(figure, body, legs) for body, legs in walk],
        [grandma_frame(figure, body, legs) for body, legs in walk],
        [grandma_frame(figure, body, legs).transpose(Image.FLIP_LEFT_RIGHT) for body, legs in walk],
        [grandma_frame(figure, body, legs) for body, legs in walk],
        [grandma_frame(figure, body, legs) for body, legs in idle],
    ]
    w, h = rows[0][0].size
    sheet = Image.new("RGBA", (w * 4, h * len(rows)))
    for r, frames in enumerate(rows):
        for c, cell in enumerate(frames):
            sheet.alpha_composite(cell, (c * w, r * h))
    return sheet


def build(out_world):
    grandma_sheet(out_world).save(f"{out_world}/grandma_walk.png")
    grid(CAT_SHEET, CAT_ROWS, CAT_COLUMNS, CAT_SCALE, CAT_CELL).save(f"{out_world}/cats.png")
    grid(DOG_SHEET, DOG_ROWS, DOG_COLUMNS, DOG_SCALE, DOG_CELL, remove_ground).save(f"{out_world}/dogs.png")


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    build(os.path.join(here, "..", "..", "art", "world"))
    print("built animals")
