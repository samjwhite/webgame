"""Village cats and dogs, cut from the designer's sheets in reference/incoming/.

Each output is a grid of equal cells: one row per coat, one column per pose, feet on the bottom of the
cell, facing right. js/world.js reads the same layout (CAT_* and DOG_* constants).
"""

import os
from PIL import Image, ImageFilter

from reference import cut_out, keep_largest_shape, limit_palette, load

BACKGROUND_TOLERANCE = 30
ENCLOSED_TOLERANCE = 22

# cats_animated.png, the same coats as the designer's yard_cats_v3.png.
# Rows: tabby, cream with a black cap, calico.
# Columns: standing, seated, curled asleep, walking x2, washing x2.
CAT_SHEET = "cats_animated.png"
CAT_ROWS = [(50, 232), (305, 495), (560, 755)]
CAT_COLUMNS = [(40, 305), (360, 545), (598, 810), (842, 1108), (1130, 1395), (1430, 1615), (1675, 1868)]
# Sizes against people, who are 40 px tall: a sitting cat comes to about their knee.
CAT_SCALE = 0.07
CAT_CELL = (24, 16)
# The picture around them is warm, late-afternoon light: animals get the same light and a soft outline.
WARM_LIGHT = (1.05, 0.97, 0.8)
SOFT_OUTLINE = (58, 38, 24)

# village_dogs_sheet.png. Rows: ginger, black and tan, white with brown, grey shaggy.
# Columns: standing, seated, asleep, walk 1, walk 2, sniffing, barking, standing again.
DOG_SHEET = "incoming/village_dogs_sheet.png"
DOG_ROWS = [(118, 256), (328, 492), (562, 726), (788, 952)]
DOG_COLUMNS = [(22, 197), (205, 358), (362, 535), (540, 718), (722, 902), (908, 1062), (1066, 1212), (1252, 1424)]
DOG_SCALE = 0.11
DOG_CELL = (24, 21)
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


def warmed(cell):
    """The same late-afternoon light as the locations."""
    r, g, b, alpha = cell.split()
    r, g, b = (band.point(lambda v, f=factor: min(255, round(v * f))) for band, factor in zip((r, g, b), WARM_LIGHT))
    return Image.merge("RGBA", (r, g, b, alpha))


def outlined(cell):
    """A thin soft outline in the picture's own dark brown, half see-through, so an animal is not a sticker."""
    alpha = cell.getchannel("A").point(lambda a: 255 if a else 0)
    edge = Image.new("RGBA", cell.size, SOFT_OUTLINE + (0,))
    edge.putalpha(alpha.filter(ImageFilter.MaxFilter(3)).point(lambda a: 150 if a else 0))
    edge.alpha_composite(cell)
    return edge


def animal_grid(file, rows, columns, scale, cell, clean=None, outline=True):
    sheet = load(file)
    w, h = cell
    result = Image.new("RGBA", (w * len(columns), h * len(rows)))
    for r, (top, bottom) in enumerate(rows):
        for c, (left, right) in enumerate(columns):
            picture = frame(sheet, (left, top, right, bottom), scale, cell, clean)
            picture = warmed(picture)
            result.alpha_composite(outlined(picture) if outline else picture, (c * w, r * h))
    return result


# Did Petro on his bench (reference/petro_bench.png): sitting still, raising the cigarette, smoking, lowering it.
PETRO_SHEET = "petro_bench.png"
PETRO_ROW = (120, 630)
PETRO_COLUMNS = [(50, 485), (592, 1027), (1135, 1570), (1678, 2125)]
PETRO_SCALE = 0.072
PETRO_CELL = (36, 38)


def petro_strip():
    sheet = load(PETRO_SHEET)
    top, bottom = PETRO_ROW
    w, h = PETRO_CELL
    strip = Image.new("RGBA", (w * len(PETRO_COLUMNS), h))
    for c, (left, right) in enumerate(PETRO_COLUMNS):
        strip.alpha_composite(frame(sheet, (left, top, right, bottom), PETRO_SCALE, PETRO_CELL), (c * w, 0))
    return strip


def build(out_world):
    grandma_sheet(out_world).save(f"{out_world}/grandma_walk.png")
    petro_strip().save(f"{out_world}/petro_bench.png")
    animal_grid(CAT_SHEET, CAT_ROWS, CAT_COLUMNS, CAT_SCALE, CAT_CELL).save(f"{out_world}/cats.png")
    animal_grid(DOG_SHEET, DOG_ROWS, DOG_COLUMNS, DOG_SCALE, DOG_CELL, remove_ground, outline=False).save(f"{out_world}/dogs.png")


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    build(os.path.join(here, "..", "..", "art", "world"))
    print("built animals")
