"""TEMPORARY location art until the art designer's pictures arrive (docs/ART_HANDOFF_LOCATIONS.md).

Outdoor locations are crops of reference/village_map.png scaled by LOCATION_SCALE, which makes a
door a little taller than the 44 px hero. The house interior is drawn here, one sprite per object.
Coordinates in js/map.js are game pixels of these scaled pictures.
"""

import os
from PIL import Image, ImageDraw, ImageFilter

from lib import Sprite
from reference import MAP_PATCHES, cut_out, load, limit_palette

LOCATION_SCALE = 0.65

# Location name -> crop box in reference/village_map.png. All tall enough to fill a phone screen.
CROPS = {
    "club": (680, 60, 1120, 524),
    "stop": (1070, 592, 1536, 1024),
    "pond": (0, 592, 650, 1024),
}

# Parts of a picture drawn again over characters behind them: name -> (box in game pixels, shapes).
# Only the object itself is kept, not the ground around it, so the hero vanishes behind its real shape.
# Shapes are relative to the box: ("rect", box), ("poly", points) or ("ellipse", box).
# None means the object is told from its background by colour (the statue on the plain paving).
WELL_SHAPE = [
    ("poly", [(14, 0), (64, 0), (78, 28), (0, 28)]),  # roof
    ("rect", (13, 28, 20, 66)),  # posts
    ("rect", (60, 28, 67, 66)),
    ("rect", (20, 34, 60, 42)),  # crank axle
    ("rect", (39, 42, 47, 68)),  # bucket
    ("ellipse", (20, 57, 67, 75)),  # ring: top, body, bottom
    ("rect", (20, 66, 67, 88)),
    ("ellipse", (20, 80, 67, 94)),
]


OCCLUDERS = {
    "yard": {
        "occlude_yard_well": ((161, 193, 239, 287), WELL_SHAPE),
    },
    "club": {"occlude_club_statue": ((144, 156, 170, 212), None)},
}

# Bits of a crop covered with another bit of it, before scaling: location -> [(from box, to corner)].
PATCHES = {}

# Approved art: the village road, three pictures joined side by side with soft seams.
# (file, left, right) in each picture's pixels. All share one road height and the yard's scale.
ROAD_PANELS = [
    ("road_west.png", 0, 1536),
    ("road_at_yard.png", 250, 1250),
    ("road_east.png", 0, 1536),
]
ROAD_SEAM = 60
ROAD_BENCH = (825, 695, 1115, 820)
ROAD_BENCH_GRASS = (620, 700, 800, 800)
ROAD_BENCH_SCALE = 0.5
ROAD_SIGN = ((1614, 253, 1643, 290), [("rect", (0, 0, 29, 30)), ("rect", (12, 30, 18, 37))])

# Approved art: grandma's yard. Scaled so her door is a little taller than the hero; the road is cut off.
YARD_SCALE = 0.43
YARD_BOTTOM = 945


# Paths painted on the village picture, so they show the same in every location that sees them.
# (where, in reference/village_map.png pixels). They are filled with the bare earth at PATH_SAMPLE.
PATH_SAMPLE = (320, 676, 420, 694)
PAINTED_PATHS = [
    (350, 600, 376, 684),  # from the road down to Did Petro, between the bench and the tree
]


def tile(sample, width, height):
    """Cover an area with a sample, mirrored every other time to hide the repeat."""
    result = Image.new("RGB", (width, height))
    for row, y in enumerate(range(0, height, sample.height)):
        for column, x in enumerate(range(0, width, sample.width)):
            piece = sample
            if column % 2:
                piece = piece.transpose(Image.FLIP_LEFT_RIGHT)
            if row % 2:
                piece = piece.transpose(Image.FLIP_TOP_BOTTOM)
            result.paste(piece, (x, y))
    return result


def lay_texture(picture, box, sample, margin=3, blur=2):
    """Fill box with a repeated sample, soft at the edges, so it does not look like a pasted rectangle."""
    width, height = box[2] - box[0], box[3] - box[1]
    texture = tile(sample, width, height)
    mask = Image.new("L", (width, height), 0)
    ImageDraw.Draw(mask).rectangle((margin, margin, width - margin - 1, height - margin - 1), fill=255)
    picture.paste(texture, box[:2], mask.filter(ImageFilter.GaussianBlur(blur)))


def paint_paths(village):
    earth = village.crop(PATH_SAMPLE)
    for box in PAINTED_PATHS:
        lay_texture(village, box, earth)


# ---------- the shop, from the designer's scene ----------

SHOP_SCENE = "incoming/village_shop_beer_garden.png"
SHOP_SCALE = 0.26  # makes the shop door a little taller than the 44 px hero
SHOP_SCENE_BOTTOM = 905  # the road in the scene is cut off: the shop is reached by its own path
SHOP_SIZE = (376, 300)
SHOP_PATH = (150, 226, 190, 300)
# Night: the door shut with a padlock and the seller gone from her window. Boxes in the scene's pixels.
SHOP_CLOSED_BOX = (400, 345, 790, 548)
SHOP_DOORWAY = (435, 345, 572, 545)
SHOP_DOOR_LEAF = (412, 360, 490, 550)
SHOP_WALL_BESIDE_DOOR = (345, 345, 405, 548)
SHOP_SELLER = (700, 368, 785, 446)
SHOP_SHELVES = (632, 368, 717, 446)


def shrink_road_bench(west):
    """The bench in road_west.png is drawn far too wide for a person: cover it with grass, redraw it smaller."""
    left, top, right, bottom = ROAD_BENCH
    bench = west.crop(ROAD_BENCH)
    grass = west.crop(ROAD_BENCH_GRASS)
    lay_texture(west, ROAD_BENCH, grass, 8, 5)
    width, height = round(bench.width * ROAD_BENCH_SCALE), round(bench.height * ROAD_BENCH_SCALE)
    small = bench.resize((width, height), Image.Resampling.BOX)
    mask = Image.new("L", small.size, 0)
    ImageDraw.Draw(mask).rectangle((4, 4, width - 5, height - 5), fill=255)
    west.paste(small, ((left + right - width) // 2, bottom - height - 4), mask.filter(ImageFilter.GaussianBlur(2)))
    return west


def road_picture():
    pieces = [load(name).crop((left, 0, right, 1024)) for name, left, right in ROAD_PANELS]
    pieces[0] = shrink_road_bench(pieces[0])
    width = sum(p.width for p in pieces) - ROAD_SEAM * (len(pieces) - 1)
    road = Image.new("RGB", (width, 1024))
    x = 0
    for i, piece in enumerate(pieces):
        mask = Image.new("L", piece.size, 255)
        if i:
            draw = ImageDraw.Draw(mask)
            for column in range(ROAD_SEAM):
                draw.line((column, 0, column, piece.height), fill=round(255 * column / ROAD_SEAM))
        road.paste(piece, (x, 0), mask)
        x += piece.width - ROAD_SEAM
    size = (round(road.width * YARD_SCALE), round(road.height * YARD_SCALE))
    return limit_palette(road.resize(size, Image.Resampling.BOX), 220)


def shop_scene():
    scene = load(SHOP_SCENE)
    size = (round(scene.width * SHOP_SCALE), round(SHOP_SCENE_BOTTOM * SHOP_SCALE))
    top = scene.crop((0, 0, scene.width, SHOP_SCENE_BOTTOM)).resize(size, Image.Resampling.BOX)
    picture = Image.new("RGB", SHOP_SIZE)
    strip = Sprite(SHOP_SIZE[0], SHOP_SIZE[1] - size[1] + 12, "#7f8a3c")
    strip.speckle(0, 0, strip.w, strip.h, ["#6f7c34", "#8d9745", "#5f6e30"], 0.35, 5)
    picture.paste(strip.img.convert("RGB"), (0, size[1] - 12))
    # The scene's bottom edge fades into the grass.
    fade = Image.new("L", size, 255)
    draw_fade = ImageDraw.Draw(fade)
    for row in range(10):
        draw_fade.line((0, size[1] - 1 - row, size[0], size[1] - 1 - row), fill=round(255 * row / 10))
    picture.paste(top, (0, 0), fade)
    width, height = SHOP_PATH[2] - SHOP_PATH[0], SHOP_PATH[3] - SHOP_PATH[1]
    earth = Sprite(width, height, "#a8794e")
    earth.speckle(0, 0, width, height, ["#9a6d45", "#b58a5e", "#8f6440"], 0.3, 9)
    lay_texture(picture, SHOP_PATH, earth.img.convert("RGB"), 3, 2)
    return limit_palette(picture, 200)


def shop_closed():
    """Drawn over the shop at night. Lands at the scaled top-left corner of SHOP_CLOSED_BOX."""
    scene = load(SHOP_SCENE)
    left, top, right, bottom = SHOP_CLOSED_BOX
    part = Image.new("RGBA", (right - left, bottom - top))
    def put(image, x, y):
        part.paste(image, (x - left, y - top))
    # The wall where the open door leaf stood, then the door shut across the doorway.
    wall = scene.crop(SHOP_WALL_BESIDE_DOOR)
    put(wall.resize((SHOP_DOORWAY[0] - left, bottom - top)), left, top)
    door = scene.crop(SHOP_DOOR_LEAF).resize((SHOP_DOORWAY[2] - SHOP_DOORWAY[0], SHOP_DOORWAY[3] - SHOP_DOORWAY[1]))
    put(door, SHOP_DOORWAY[0], SHOP_DOORWAY[1])
    put(scene.crop(SHOP_SHELVES), SHOP_SELLER[0], SHOP_SELLER[1])
    # Keep only those three parts; the rest of the box stays see-through.
    mask = Image.new("L", part.size, 0)
    draw = ImageDraw.Draw(mask)
    for box in ((left, top, SHOP_DOORWAY[2], SHOP_DOORWAY[3]), SHOP_SELLER):
        draw.rectangle((box[0] - left, box[1] - top, box[2] - left - 1, box[3] - top - 1), fill=255)
    part.putalpha(mask)
    # The padlock and a piece of cardboard.
    paint = ImageDraw.Draw(part)
    cx = (SHOP_DOORWAY[0] + SHOP_DOORWAY[2]) // 2 - left
    paint.rectangle((cx - 44, 48, cx + 44, 100), fill=(196, 172, 128, 255), outline=(70, 50, 34, 255), width=4)
    for y in (60, 72, 84):
        paint.rectangle((cx - 32, y, cx + 32, y + 4), fill=(70, 50, 34, 255))
    paint.rectangle((cx + 26, 118, cx + 52, 146), fill=(120, 120, 116, 255), outline=(30, 26, 26, 255), width=3)
    size = (round(part.width * SHOP_SCALE), round(part.height * SHOP_SCALE))
    return part.resize(size, Image.Resampling.NEAREST)


def is_object_pixel(color):
    """Grass and paths are warm and bright; posts, stone, slate and bronze are dark or grey."""
    r, g, b = color[:3]
    return (r + g + b) / 3 < 95 or r - b < 38


def occluder(picture, box, shapes):
    """The object inside box as a transparent overlay: same size as box, ground pixels removed."""
    part = picture.crop(box).convert("RGBA")
    mask = Image.new("L", part.size, 0)
    if shapes:
        draw = ImageDraw.Draw(mask)
        for kind, shape in shapes:
            if kind == "rect":
                draw.rectangle((shape[0], shape[1], shape[2] - 1, shape[3] - 1), fill=255)
            elif kind == "ellipse":
                draw.ellipse(shape, fill=255)
            else:
                draw.polygon(shape, fill=255)
    else:
        source = part.load()
        for y in range(part.height):
            for x in range(part.width):
                if is_object_pixel(source[x, y]):
                    mask.putpixel((x, y), 255)
        # Close small holes in the object and drop lone specks.
        mask = mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
        mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
    part.putalpha(mask)
    return part


# ---------- the inside of grandma's house (temporary, simple on purpose) ----------

ROOM_W, ROOM_H = 260, 285
ROOM_WALL_H = 72
FURNITURE_SCALE = 0.68


def room_background():
    room = Sprite(ROOM_W, ROOM_H, "#7a5a3c")
    # Painted floorboards, brown-red like most village floors.
    for x in range(0, ROOM_W, 14):
        room.rect(x, ROOM_WALL_H, 1, ROOM_H, "#5c4029")
    room.speckle(0, ROOM_WALL_H, ROOM_W, ROOM_H - ROOM_WALL_H, ["#6d4f33", "#86654a"], 0.05, 7)
    # Whitewashed walls, a blue strip at the bottom, patches where the lime came off.
    room.rect(0, 0, ROOM_W, ROOM_WALL_H, "#e4dcc8")
    room.speckle(0, 0, ROOM_W, ROOM_WALL_H, ["#d6cdb6", "#efe8d6"], 0.04, 3)
    room.rect(0, ROOM_WALL_H - 10, ROOM_W, 10, "#6d8fa8")
    room.rect(0, ROOM_WALL_H - 11, ROOM_W, 1, "#4f6d84")
    room.rect(0, ROOM_WALL_H, ROOM_W, 2, "#3f2d1e")
    # Window with blue frame and short curtains.
    room.rect(118, 10, 30, 30, "#3f6f97")
    room.rect(120, 12, 26, 26, "#3a4d78")
    room.rect(132, 10, 2, 30, "#3f6f97")
    room.rect(118, 24, 30, 2, "#3f6f97")
    room.rect(115, 8, 36, 2, "#7a4f2d")
    room.rect(118, 10, 7, 14, "#f3eee0")
    room.rect(141, 10, 7, 14, "#f3eee0")
    # Wall rug above the bed.
    room.rect(10, 8, 62, 42, "#7c2a26")
    room.rect(12, 10, 58, 38, "#a13d31")
    room.rect(20, 16, 42, 26, "#7c2a26")
    room.rect(28, 22, 26, 14, "#c8952e")
    # A runner on the floor.
    room.rect(60, 180, 84, 56, "#7c2a26")
    room.rect(63, 183, 78, 50, "#55603f")
    room.rect(69, 189, 66, 38, "#a13d31")
    # Doorway in the bottom wall.
    room.rect(0, ROOM_H - 6, ROOM_W, 6, "#3f2d1e")
    room.rect(108, ROOM_H - 6, 44, 6, "#b8936a")
    return room


def bed():
    s = Sprite(92, 60)
    s.rect(0, 2, 4, 56, "#5a5a60")
    s.rect(88, 2, 4, 56, "#5a5a60")
    s.rect(3, 12, 86, 40, "#a8a39a")
    s.rect(5, 12, 82, 40, "#6d4a7a")  # blanket
    s.rect(8, 12, 22, 20, "#f3eee0")  # pillow
    s.rect(8, 30, 76, 2, "#563366")
    s.outline()
    return s


def tv():
    s = Sprite(42, 54)
    s.rect(2, 36, 38, 16, "#6a4a2c")  # cabinet
    s.rect(3, 38, 36, 2, "#8a6840")
    s.rect(4, 0, 34, 34, "#3a2b20")  # wooden case
    s.rect(7, 3, 22, 22, "#22302c")  # screen
    s.rect(9, 5, 6, 3, "#51685e")
    s.rect(31, 5, 4, 4, "#8f8878")  # knobs
    s.rect(31, 12, 4, 4, "#8f8878")
    s.rect(10, 26, 20, 5, "#e4dcc8")  # lace doily hangs over the front
    s.outline()
    return s


def fridge():
    s = Sprite(34, 66)
    s.rect(2, 0, 30, 64, "#d9d3c0")
    s.rect(2, 16, 30, 1, "#8d8778")
    s.rect(27, 20, 2, 12, "#8d8778")
    s.rect(4, 2, 2, 12, "#efe9d8")
    s.rect(8, 6, 12, 3, "#8e2f28")  # worn badge
    s.outline()
    return s


def stove():
    s = Sprite(40, 46)
    s.rect(1, 8, 38, 36, "#d7d0bc")
    s.rect(4, 22, 32, 18, "#5c5c5a")
    s.rect(1, 6, 38, 4, "#3f3f3f")
    s.rect(1, 14, 38, 2, "#b5aa94")
    s.rect(6, 17, 2, 3, "#3f3f3f")
    s.rect(14, 17, 2, 3, "#3f3f3f")
    s.outline()
    return s


def borscht():
    s = Sprite(22, 18)
    s.rect(2, 4, 18, 13, "#8fa49b")  # enamel pot
    s.rect(1, 3, 20, 2, "#6f8379")
    s.rect(4, 3, 14, 2, "#a8322e")
    s.rect(0, 7, 2, 3, "#6f8379")
    s.rect(20, 7, 2, 3, "#6f8379")
    s.outline()
    return s


def table():
    s = Sprite(72, 44)
    s.rect(2, 2, 68, 24, "#6f8f77")  # oilcloth
    s.speckle(2, 2, 68, 24, ["#d7c781", "#c5664a"], 0.09, 11)
    s.rect(2, 24, 68, 4, "#4f6a58")
    s.rect(6, 28, 4, 14, "#5c3b22")
    s.rect(62, 28, 4, 14, "#5c3b22")
    s.outline()
    return s


def varenyky():
    s = Sprite(24, 14)
    s.ellipse(12, 8, 11, 5, "#efe9d8")
    for x, y in ((6, 6), (12, 5), (18, 6), (9, 9), (15, 9)):
        s.ellipse(x, y, 3, 2, "#f3e2b5")
    s.rect(10, 7, 2, 1, "#7c2a26")
    s.outline()
    return s


def furniture(sprite):
    """Furniture is drawn large here and scaled to fit the 44 px hero."""
    size = (round(sprite.w * FURNITURE_SCALE), round(sprite.h * FURNITURE_SCALE))
    return sprite.img.resize(size, Image.Resampling.NEAREST)


# ---------- close-ups, 192 wide ----------

def tv_scene():
    s = Sprite(192, 144, "#2a1d17")
    s.rect(0, 118, 192, 26, "#6a4a2c")
    s.rect(24, 8, 144, 110, "#3a2b20")
    s.rect(30, 14, 132, 98, "#201712")
    s.rect(160, 22, 6, 6, "#8f8878")
    s.rect(160, 34, 6, 6, "#8f8878")
    s.rect(70, 118, 52, 8, "#e4dcc8")
    return s


def sleep_scene():
    s = Sprite(192, 144, "#161a2e")
    s.rect(112, 12, 62, 60, "#28345c")
    s.rect(116, 16, 54, 52, "#10183a")
    s.rect(142, 16, 2, 52, "#28345c")
    s.rect(116, 40, 54, 2, "#28345c")
    s.ellipse(156, 28, 6, 6, "#f4efd2")
    s.rect(0, 96, 192, 48, "#3d2f4a")
    s.rect(18, 88, 58, 32, "#b8b3a6")
    s.rect(0, 112, 192, 32, "#563366")
    s.rect(40, 96, 34, 18, "#d6a782")
    s.ellipse(52, 96, 12, 8, "#4a2e1c")
    return s


def fridge_scene():
    """The open fridge: white enamel walls, two wire shelves, the little lamp on top."""
    s = Sprite(192, 142, "#efeadb")
    s.gradient(0, 0, 192, 142, ["#f7f3e6", "#dcd6c4"])
    s.rect(0, 0, 192, 4, "#b9b2a0")
    s.rect(0, 138, 192, 4, "#b9b2a0")
    s.rect(0, 0, 4, 142, "#c9c2b0")
    s.rect(188, 0, 4, 142, "#c9c2b0")
    s.rect(88, 4, 16, 5, "#f8e08a")
    for y in (64, 130):
        s.rect(4, y, 184, 2, "#8d8778")
        for x in range(8, 188, 8):
            s.rect(x, y, 1, 3, "#a8a39a")
    return s


# Approved art (reference/fridge_items.png): each item's box, in the order of fridgeItems in the text files.
FRIDGE_ITEM = 40
FRIDGE_BOXES = [
    (165, 170, 395, 480),  # sour cream
    (580, 40, 905, 500),  # pickles
    (1005, 185, 1470, 480),  # salo
    (120, 645, 465, 895),  # sausage
    (560, 630, 920, 900),  # eggs
    (1115, 545, 1360, 915),  # milk
]


def fridge_items():
    """Six 40x40 pictures side by side, standing on the bottom edge of their cell."""
    sheet = load("fridge_items.png")
    strip = Image.new("RGBA", (FRIDGE_ITEM * len(FRIDGE_BOXES), FRIDGE_ITEM))
    for i, box in enumerate(FRIDGE_BOXES):
        item = cut_out(sheet.crop(box), 30)
        item = item.crop(item.getchannel("A").getbbox())
        ratio = FRIDGE_ITEM / max(item.size)
        size = (max(1, round(item.width * ratio)), max(1, round(item.height * ratio)))
        small = item.resize(size, Image.Resampling.BOX)
        alpha = small.getchannel("A").point(lambda a: 255 if a > 110 else 0)
        small = limit_palette(small.convert("RGB"), 32).convert("RGBA")
        small.putalpha(alpha)
        strip.alpha_composite(small, (i * FRIDGE_ITEM + (FRIDGE_ITEM - size[0]) // 2, FRIDGE_ITEM - size[1]))
    return strip


def build(out_world):
    village = load("village_map.png")
    old = load("village_map_old.png")
    for box in MAP_PATCHES:
        village.paste(old.crop(box), box[:2])
    paint_paths(village)

    for name, box in CROPS.items():
        crop = village.crop(box)
        for source, corner in PATCHES.get(name, []):
            crop.paste(crop.crop(source), corner)
        size = (round(crop.width * LOCATION_SCALE), round(crop.height * LOCATION_SCALE))
        picture = limit_palette(crop.resize(size, Image.Resampling.BOX), 200)
        picture.save(f"{out_world}/loc_{name}.png", optimize=True)
        for art, (part, shapes) in OCCLUDERS.get(name, {}).items():
            occluder(picture, part, shapes).save(f"{out_world}/{art}.png", optimize=True)

    yard = load("loc_yard.png")
    yard = yard.crop((0, 0, yard.width, YARD_BOTTOM))
    yard = limit_palette(yard.resize((round(yard.width * YARD_SCALE), round(YARD_BOTTOM * YARD_SCALE)), Image.Resampling.BOX), 200)
    yard.save(f"{out_world}/loc_yard.png", optimize=True)
    for art, (part, shapes) in OCCLUDERS["yard"].items():
        occluder(yard, part, shapes).save(f"{out_world}/{art}.png", optimize=True)

    road = road_picture()
    road.save(f"{out_world}/loc_street.png", optimize=True)
    occluder(road, *ROAD_SIGN).save(f"{out_world}/occlude_street_sign.png", optimize=True)

    shop_scene().save(f"{out_world}/loc_shop.png", optimize=True)
    shop_closed().save(f"{out_world}/shop_closed.png", optimize=True)

    room_background().save(f"{out_world}/loc_house.png")
    for name, make in (("bed", bed), ("tv", tv), ("fridge", fridge), ("stove", stove),
                       ("borscht", borscht), ("table", table), ("varenyky", varenyky)):
        furniture(make()).save(f"{out_world}/house_{name}.png")

    scenes_folder = os.path.join(out_world, "..", "scenes")
    tv_scene().save(os.path.join(scenes_folder, "tsn.png"))
    sleep_scene().save(os.path.join(scenes_folder, "sleep.png"))
    fridge_scene().save(os.path.join(scenes_folder, "fridge_open.png"))
    fridge_items().save(os.path.join(scenes_folder, "fridge_items.png"))


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    build(os.path.join(here, "..", "..", "art", "world"))
    print("built locations")
