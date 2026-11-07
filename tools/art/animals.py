"""Village cats and dogs, cut from the designer's sheets in reference/incoming/.

Each output is a grid of equal cells: one row per coat, one column per pose, feet on the bottom of the
cell, facing right. js/world.js reads the same layout (CAT_* and DOG_* constants).
"""

import os
from PIL import Image, ImageFilter

from reference import cut_out, keep_largest_shape, limit_palette, load

BACKGROUND_TOLERANCE = 30
ENCLOSED_TOLERANCE = 22

# yard_cats_v3.png. Rows: tabby, cream with a black cap, calico. Columns: standing, seated, curled asleep.
# The game's sheet adds walking and washing frames, TEMPORARILY made by moving parts of those poses.
CAT_SHEET = "incoming/yard_cats_v3.png"
CAT_ROWS = [(30, 305), (345, 640), (680, 975)]
CAT_COLUMNS = [(60, 480), (600, 900), (1065, 1435)]
CAT_SCALE = 0.08
CAT_CELL = (36, 26)
CAT_OUTLINE = (34, 24, 20, 255)

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


def outlined(cell):
    """A dark 1 px outline, so a cat stands out from any ground."""
    alpha = cell.getchannel("A").point(lambda a: 255 if a else 0)
    edge = Image.new("RGBA", cell.size, CAT_OUTLINE)
    edge.putalpha(alpha.filter(ImageFilter.MaxFilter(3)))
    edge.alpha_composite(cell)
    return edge


def moved(cell, split, top_shift, bottom_shift):
    """The cell with the part above split and the part below it moved by (x, y)."""
    w, h = cell.size
    result = Image.new("RGBA", cell.size)
    result.alpha_composite(cell.crop((0, split, w, h)), (max(0, bottom_shift[0]), split + bottom_shift[1]))
    result.alpha_composite(cell.crop((0, 0, w, split)), (max(0, top_shift[0]), max(0, top_shift[1])))
    return result


def cat_sheet():
    """Rows by coat. Columns: stand, sit, sleep, walk A, walk B, wash A, wash B."""
    sheet = load(CAT_SHEET)
    w, h = CAT_CELL
    result = Image.new("RGBA", (w * 7, h * len(CAT_ROWS)))
    legs = h - 8
    head = h - 12
    for r, (top, bottom) in enumerate(CAT_ROWS):
        stand, sit, sleep = [frame(sheet, (left, top, right, bottom), CAT_SCALE, CAT_CELL) for left, right in CAT_COLUMNS]
        cells = [
            stand, sit, sleep,
            moved(stand, legs, (0, 0), (1, 0)),
            moved(stand, legs, (1, 0), (0, 0)),
            moved(sit, head, (0, 1), (0, 0)),
            moved(sit, head, (1, 2), (0, 0)),
        ]
        for c, cell in enumerate(cells):
            result.alpha_composite(outlined(cell), (c * w, r * h))
    return result


def build(out_world):
    grandma_sheet(out_world).save(f"{out_world}/grandma_walk.png")
    cat_sheet().save(f"{out_world}/cats.png")
    grid(DOG_SHEET, DOG_ROWS, DOG_COLUMNS, DOG_SCALE, DOG_CELL, remove_ground).save(f"{out_world}/dogs.png")


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    build(os.path.join(here, "..", "..", "art", "world"))
    print("built animals")
