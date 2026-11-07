"""TEMPORARY location art until the art designer's pictures arrive (docs/ART_HANDOFF_LOCATIONS.md).

Outdoor locations are crops of reference/village_map.png scaled by LOCATION_SCALE, which makes a
door a little taller than the 44 px hero. The house interior is drawn here, one sprite per object.
Coordinates in js/map.js are game pixels of these scaled pictures.
"""

import os
from PIL import Image, ImageDraw, ImageFilter

from lib import Sprite
from animals import remove_enclosed_background
from reference import MAP_PATCHES, cut_out, load, limit_palette, scene

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
    ("poly", [(12, 0), (55, 0), (67, 24), (0, 24)]),  # roof
    ("rect", (11, 24, 17, 57)),  # posts
    ("rect", (52, 24, 58, 57)),
    ("rect", (17, 29, 52, 36)),  # crank axle
    ("rect", (34, 36, 40, 59)),  # bucket
    ("ellipse", (17, 49, 58, 65)),  # ring: top, body, bottom
    ("rect", (17, 57, 58, 76)),
    ("ellipse", (17, 69, 58, 81)),
]


OCCLUDERS = {
    "yard": {
        "occlude_yard_well": ((139, 166, 206, 247), WELL_SHAPE),
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
ROAD_SEAM = 60  # the pictures overlap this much; the blend is only its middle third, so nothing shows double
ROAD_PROPS = "road_props.png"
ROAD_STATUE = (45, 190, 290, 745)
ROAD_POPLAR = (390, 25, 630, 745)
ROAD_LIME = (665, 100, 1265, 745)
ROAD_ELDER = (1295, 380, 1730, 745)
# On the joined road, in picture pixels: (box, scale, centre x, foot y, mirrored). Trees and bushes stand on the seams.
ROAD_PLACED = [
    (ROAD_STATUE, 0.42, 2986, 385, False),
    (ROAD_POPLAR, 0.7, 1506, 432, False),
    (ROAD_LIME, 0.62, 2446, 432, False),
    (ROAD_ELDER, 0.8, 1506, 1000, False),
    (ROAD_ELDER, 0.8, 2446, 1000, True),
]
# Svetka's house stands half outside road_east.png: it goes, and only her path remains.
ROAD_EAST_COVER = [(0, 680, 368, 770), (0, 760, 452, 1024)]
ROAD_EAST_GRASS = (450, 690, 800, 760)
ROAD_BENCH = (825, 695, 1115, 820)
ROAD_BENCH_GRASS = (620, 700, 800, 800)
ROAD_SIGN = ((1389, 218, 1414, 250), [("rect", (0, 0, 25, 26)), ("rect", (10, 26, 16, 32))])

# Approved art: grandma's yard. The approved style's scale: a gate 2 m tall comes out about 1.3 times a person's
# height. The road in the yard picture is cut off.
YARD_SCALE = 0.37
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
SHOP_SCALE = 0.23  # makes the shop door a little taller than the 40 px people
SHOP_SCENE_BOTTOM = 905  # the road in the scene is cut off: the shop is reached by its own path
SHOP_SIZE = (333, 300)
SHOP_GROUND = "shop_redraw.png"  # natural grass and the footpath, from the redrawn scene
SHOP_GROUND_TOP = 590
SHOP_BAKED_BOTTLE = (881, 588)
SHOP_TABLE_CLEAN = (908, 588, 932, 648)
# Night: the door shut with a padlock and the seller gone from her window. Boxes in the scene's pixels.
SHOP_CLOSED_BOX = (400, 345, 790, 548)
SHOP_DOORWAY = (435, 345, 572, 545)
SHOP_DOOR_LEAF = (412, 360, 490, 550)
SHOP_WALL_BESIDE_DOOR = (345, 345, 405, 548)
SHOP_SELLER = (700, 368, 785, 446)
SHOP_SHELVES = (632, 368, 717, 446)


def shrink_road_bench(west):
    """The bench in road_west.png is far too wide for a person: it goes, and Did Petro's own sprite stands there."""
    lay_texture(west, ROAD_BENCH, west.crop(ROAD_BENCH_GRASS), 8, 5)
    return west


def road_picture():
    pieces = [load(name).crop((left, 0, right, 1024)) for name, left, right in ROAD_PANELS]
    pieces[0] = shrink_road_bench(pieces[0])
    grass = pieces[2].crop(ROAD_EAST_GRASS)
    for box in ROAD_EAST_COVER:
        lay_texture(pieces[2], box, grass, 8, 5)
    width = sum(p.width for p in pieces) - ROAD_SEAM * (len(pieces) - 1)
    road = Image.new("RGB", (width, 1024))
    x = 0
    for i, piece in enumerate(pieces):
        mask = Image.new("L", piece.size, 255)
        if i:
            draw = ImageDraw.Draw(mask)
            third = ROAD_SEAM // 3
            for column in range(ROAD_SEAM):
                draw.line((column, 0, column, piece.height), fill=max(0, min(255, round(255 * (column - third) / third))))
        road.paste(piece, (x, 0), mask)
        x += piece.width - ROAD_SEAM
    props = load(ROAD_PROPS)
    canvas = road.convert("RGBA")
    for box, scale, centre, foot, mirrored in ROAD_PLACED:
        item = cut_prop(props, box)
        small = item.resize((round(item.width * scale), round(item.height * scale)), Image.Resampling.BOX)
        if mirrored:
            small = small.transpose(Image.FLIP_LEFT_RIGHT)
        top = foot - small.height
        visible = small.crop((0, max(0, -top), small.width, small.height))
        canvas.alpha_composite(visible, (centre - small.width // 2, max(0, top)))
    road = canvas.convert("RGB")
    size = (round(road.width * YARD_SCALE), round(road.height * YARD_SCALE))
    return limit_palette(road.resize(size, Image.Resampling.BOX), 220)


def shop_scene():
    scene = load(SHOP_SCENE)
    size = (round(scene.width * SHOP_SCALE), round(SHOP_SCENE_BOTTOM * SHOP_SCALE))
    # The bottle painted on the near table goes: the only bottle is the one the hero can drink.
    scene.paste(scene.crop(SHOP_TABLE_CLEAN), SHOP_BAKED_BOTTLE[:2])
    top = scene.crop((0, 0, scene.width, SHOP_SCENE_BOTTOM)).resize(size, Image.Resampling.BOX)
    picture = Image.new("RGB", SHOP_SIZE)
    ground = load(SHOP_GROUND)
    ground = ground.crop((0, SHOP_GROUND_TOP, ground.width, ground.height))
    ground = ground.resize((SHOP_SIZE[0], round(ground.height * SHOP_SCALE)), Image.Resampling.BOX)
    picture.paste(ground, (0, size[1] - 12))
    # The scene's bottom edge fades into the grass.
    fade = Image.new("L", size, 255)
    draw_fade = ImageDraw.Draw(fade)
    for row in range(10):
        draw_fade.line((0, size[1] - 1 - row, size[0], size[1] - 1 - row), fill=round(255 * row / 10))
    picture.paste(top, (0, 0), fade)
    return limit_palette(picture, 200)


def beer_bottle():
    """A half-finished bottle of beer, for the far table."""
    s = Sprite(7, 11)
    s.rect(3, 1, 1, 3, "#4f2f14")
    s.rect(2, 4, 3, 6, "#5e3a18")
    s.rect(2, 4, 1, 5, "#9a6a30")
    s.rect(2, 6, 3, 2, "#e8dcb8")
    s.outline()
    return s


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


# ---------- the inside of grandma's house (approved art) ----------

HOUSE_SCALE = 0.25  # the doorway comes out a little taller than a person
# Each object is drawn large and to no common scale, so each has its own height in game pixels.
HOUSE_PROPS = {
    "bed": ((120, 58, 615, 500), 56),
    "tv": ((728, 90, 1030, 475), 34),
    "fridge": ((1160, 58, 1395, 472), 42),
    "stove": ((65, 585, 285, 952), 28),
    "table": ((325, 632, 698, 942), 28),
    "varenyky": ((738, 698, 972, 862), 9),
    "plate": ((1015, 725, 1220, 858), 8),
    "chair": ((1270, 578, 1472, 950), 26),
}
HOUSE_DOOR = ((156, 196, 216, 217), [("rect", (0, 0, 60, 6)), ("rect", (0, 0, 9, 21)), ("rect", (51, 0, 60, 21))])


def cut_prop(sheet, box):
    item = remove_enclosed_background(cut_out(sheet.crop(box), 30))
    return item.crop(item.getchannel("A").getbbox())


def house_prop(sheet, box, height):
    item = cut_prop(sheet, box)
    size = (max(1, round(item.width * height / item.height)), height)
    small = item.resize(size, Image.Resampling.BOX)
    alpha = small.getchannel("A").point(lambda a: 255 if a > 110 else 0)
    color = limit_palette(small.convert("RGB"), 48).convert("RGBA")
    color.putalpha(alpha)
    return color


def house_room():
    room = load("house_room.png")
    return limit_palette(room.resize((round(room.width * HOUSE_SCALE), round(room.height * HOUSE_SCALE)), Image.Resampling.BOX), 200)


# The TV close-up, with the screen see-through so the news shows behind it, and the news itself.
TV_SCREEN_AREA = (36, 26, 138, 106)
NEWS_FRAME = (96, 72)
NEWS_COLUMNS = [(14, 440), (454, 880), (894, 1320), (1334, 1760)]
NEWS_ROWS = [(70, 410), (468, 812)]
NEWS_HARVEST_FRAME = 1  # replaces the winter picture: the game is set in summer


def tv_picture():
    picture = scene(load("tv_closeup.png")).convert("RGBA")
    pixels = picture.load()
    left, top, right, bottom = TV_SCREEN_AREA
    for y in range(top, bottom):
        for x in range(left, right):
            if sum(pixels[x, y][:3]) < 40:
                pixels[x, y] = (0, 0, 0, 0)
    return picture


def news_strip():
    sheet = load("news_frames.png")
    w, h = NEWS_FRAME
    strip = Image.new("RGB", (w * len(NEWS_ROWS) * len(NEWS_COLUMNS), h))
    index = 0
    for top, bottom in NEWS_ROWS:
        for left, right in NEWS_COLUMNS:
            frame = sheet.crop((left, top, right, bottom)).resize(NEWS_FRAME, Image.Resampling.BOX)
            strip.paste(limit_palette(frame, 64), (index * w, 0))
            index += 1
    harvest = load("news_harvest.png").resize(NEWS_FRAME, Image.Resampling.BOX)
    strip.paste(limit_palette(harvest, 64), (NEWS_HARVEST_FRAME * w, 0))
    return strip


# ---------- close-ups, 192 wide ----------

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
    beer_bottle().save(f"{out_world}/beer_bottle.png")

    room = house_room()
    room.save(f"{out_world}/loc_house.png", optimize=True)
    occluder(room, *HOUSE_DOOR).save(f"{out_world}/occlude_house_door.png", optimize=True)
    furniture = load("house_props.png")
    for name, (box, height) in HOUSE_PROPS.items():
        house_prop(furniture, box, height).save(f"{out_world}/house_{name}.png")

    scenes_folder = os.path.join(out_world, "..", "scenes")
    tv_picture().save(os.path.join(scenes_folder, "tsn.png"))
    news_strip().save(os.path.join(scenes_folder, "news_frames.png"), optimize=True)
    scene(load("club_night.png")).save(os.path.join(scenes_folder, "nightfall.png"))
    sleep_scene().save(os.path.join(scenes_folder, "sleep.png"))
    fridge_scene().save(os.path.join(scenes_folder, "fridge_open.png"))
    fridge_items().save(os.path.join(scenes_folder, "fridge_items.png"))


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    build(os.path.join(here, "..", "..", "art", "world"))
    print("built locations")
