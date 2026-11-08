"""Location pictures, from the approved yard style (docs/ART_HANDOFF_LOCATIONS.md).

Every location is a picture scaled to game pixels (each with its own scale, so people come out 40 px
tall), plus the objects cut from it that a hero walks behind. The house interior has one sprite per
object. Coordinates in js/map.js are game pixels of these scaled pictures. Sizes, boxes and shapes here are
game pixels too, unless they say they are in a source picture; every file is built RES times larger
(lib.RES), straight from the source picture, so it keeps RES times more of its detail.
"""

import os
from PIL import Image, ImageDraw, ImageFilter

from lib import OUTLINE, RES
from animals import remove_enclosed_background
from reference import cut_out, load, limit_palette, scene

PICTURE_COLORS = 256  # the most limit_palette can keep: the locations are painted, not pixel art


def larger(size):
    """A size, box or point in game pixels as file pixels."""
    return tuple(value * RES for value in size)


def resample(img, size):
    """A source picture scaled straight to `size` file pixels: averaged when it shrinks, LANCZOS when it grows."""
    growing = size[0] > img.width or size[1] > img.height
    return img.resize(size, Image.Resampling.LANCZOS if growing else Image.Resampling.BOX)

# Locations drawn by Codex in the approved style of loc_yard.png: name -> (source, scale). Each scale
# makes a person 40 px tall next to the picture's doors, benches and trees (docs/PROPORTIONS.md).
# Approved by the owner.
LOCATION_PICTURES = {
    "club": ("incoming/loc_club_v2.png", 0.40),
    "stop": ("incoming/loc_stop.png", 0.27),
    "pond": ("incoming/loc_pond.png", 0.30),
}

# Parts of a picture drawn again over characters behind them: name -> (box in game pixels, shapes).
# Only the object itself is kept, not the ground around it, so the hero vanishes behind its real shape.
# Shapes are relative to the box: ("rect", box), ("poly", points) or ("ellipse", box).
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
    "club": {
        "occlude_club_statue": ((300, 178, 354, 297), [
            ("rect", (19, 1, 35, 17)),  # head
            ("poly", [(9, 18), (46, 18), (47, 40), (38, 54), (16, 54), (10, 40)]),  # coat
            ("rect", (12, 52, 50, 75)),  # legs and base
            ("rect", (2, 72, 52, 119)),  # pedestal
        ]),
    },
    "stop": {
        "occlude_stop_sign": ((341, 76, 364, 181), [("rect", (0, 0, 23, 22)), ("rect", (10, 20, 16, 105))]),
    },
}

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
    return limit_palette(resample(road, larger(size)), PICTURE_COLORS)


SHOP_FADE = 10  # game pixels of the scene's bottom edge that fade into the grass


def shop_scene():
    scene = load(SHOP_SCENE)
    size = (round(scene.width * SHOP_SCALE), round(SHOP_SCENE_BOTTOM * SHOP_SCALE))
    # The bottle painted on the near table goes: the only bottle is the one the hero can drink.
    scene.paste(scene.crop(SHOP_TABLE_CLEAN), SHOP_BAKED_BOTTLE[:2])
    top = resample(scene.crop((0, 0, scene.width, SHOP_SCENE_BOTTOM)), larger(size))
    picture = Image.new("RGB", larger(SHOP_SIZE))
    ground = load(SHOP_GROUND)
    ground = ground.crop((0, SHOP_GROUND_TOP, ground.width, ground.height))
    ground = resample(ground, larger((SHOP_SIZE[0], round(ground.height * SHOP_SCALE))))
    picture.paste(ground, (0, (size[1] - 12) * RES))
    fade = Image.new("L", top.size, 255)
    draw_fade = ImageDraw.Draw(fade)
    rows = SHOP_FADE * RES
    for row in range(rows):
        draw_fade.line((0, top.height - 1 - row, top.width, top.height - 1 - row), fill=round(255 * row / rows))
    picture.paste(top, (0, 0), fade)
    return limit_palette(picture, PICTURE_COLORS)


def shop_closed():
    """Drawn over the shop at night. Lands at the scaled top-left corner of SHOP_CLOSED_BOX.
    The scene's parts are composed in its own pixels; the padlock and the cardboard are drawn after
    scaling, so their outlines are OUTLINE file pixels like every other outline."""
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
    size = (round(part.width * SHOP_SCALE), round(part.height * SHOP_SCALE))
    result = part.resize(larger(size), Image.Resampling.BOX)
    result.putalpha(result.getchannel("A").point(lambda a: 255 if a > 127 else 0))
    # The padlock and a piece of cardboard, given in the scene's pixels like the boxes.
    scale_x, scale_y = result.width / part.width, result.height / part.height

    def at(x, y):
        return round(x * scale_x), round(y * scale_y)

    paint = ImageDraw.Draw(result)
    cx = (SHOP_DOORWAY[0] + SHOP_DOORWAY[2]) // 2 - left
    paint.rectangle((*at(cx - 44, 48), *at(cx + 44, 100)), fill=(196, 172, 128, 255), outline=(70, 50, 34, 255), width=OUTLINE)
    for y in (60, 72, 84):
        (x0, y0), (x1, _) = at(cx - 32, y), at(cx + 32, y)
        paint.rectangle((x0, y0, x1, y0 + OUTLINE - 1), fill=(70, 50, 34, 255))
    paint.rectangle((*at(cx + 26, 118), *at(cx + 52, 146)), fill=(120, 120, 116, 255), outline=(30, 26, 26, 255), width=OUTLINE)
    return result


def occluder(picture, box, shapes):
    """The object inside box as a transparent overlay: the box's part of the picture (RES times the box),
    ground pixels removed. The box and the shapes are game pixels."""
    part = picture.crop(larger(box)).convert("RGBA")
    mask = Image.new("L", part.size, 0)
    draw = ImageDraw.Draw(mask)
    for kind, shape in shapes:
        if kind == "poly":
            draw.polygon([larger(point) for point in shape], fill=255)
            continue
        left, top, right, bottom = larger(shape)
        if kind == "rect":
            draw.rectangle((left, top, right - 1, bottom - 1), fill=255)
        else:
            # An ellipse's box takes in its right and bottom game pixel, as draw.ellipse does.
            draw.ellipse((left, top, right + RES - 1, bottom + RES - 1), fill=255)
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
    """An object `height` game pixels tall (the file is RES times larger), with a hard edge."""
    item = cut_prop(sheet, box)
    size = (max(1, round(item.width * height / item.height)), height)
    small = resample(item, larger(size))
    alpha = small.getchannel("A").point(lambda a: 255 if a > 110 else 0)
    color = limit_palette(small.convert("RGB"), 96).convert("RGBA")
    color.putalpha(alpha)
    return color


def house_room():
    room = load("house_room.png")
    size = (round(room.width * HOUSE_SCALE), round(room.height * HOUSE_SCALE))
    return limit_palette(resample(room, larger(size)), PICTURE_COLORS)


# Shop goods (reference/shop_goods.png): box, and height on the counter in the seller close-up.
# That picture is near the viewer: her face is about 45 px, so a bottle a little taller than a face is 44.
GOODS = {
    "beer": ((130, 45, 245, 355), 44),
    "bread": ((395, 125, 685, 315), 26),
    "loaf": ((750, 135, 1065, 295), 20),
    "noodles": ((1165, 100, 1370, 330), 26),
    "sugar": ((90, 442, 285, 655), 34),
    "matches": ((485, 518, 600, 588), 8),
    "fish": ((785, 488, 1022, 618), 12),
    "chocolate": ((1140, 485, 1390, 618), 9),
    "sausage": ((50, 840, 320, 948), 13),
    "oil": ((485, 728, 600, 1038), 44),
    "seeds": ((812, 765, 990, 1025), 30),
    "cigarettes": ((1200, 778, 1335, 992), 18),
}
BEER_ON_TABLE = 11  # the same bottle out in the world, next to a person 40 px tall


# The TV close-up, with the screen see-through so the news shows behind it, and the news itself.
TV_SCREEN_AREA = (36, 26, 138, 106)
NEWS_FRAME = (96, 72)
NEWS_COLUMNS = [(14, 440), (454, 880), (894, 1320), (1334, 1760)]
NEWS_ROWS = [(70, 410), (468, 812)]
NEWS_HARVEST_FRAME = 1  # replaces the winter picture: the game is set in summer


def tv_picture():
    picture = scene(load("tv_closeup.png")).convert("RGBA")  # RES times the game size, like every scene
    pixels = picture.load()
    left, top, right, bottom = larger(TV_SCREEN_AREA)
    for y in range(top, bottom):
        for x in range(left, right):
            if sum(pixels[x, y][:3]) < 40:
                pixels[x, y] = (0, 0, 0, 0)
    return picture


def news_strip():
    sheet = load("news_frames.png")
    size = larger(NEWS_FRAME)
    w, h = size
    strip = Image.new("RGB", (w * len(NEWS_ROWS) * len(NEWS_COLUMNS), h))
    index = 0
    for top, bottom in NEWS_ROWS:
        for left, right in NEWS_COLUMNS:
            frame = resample(sheet.crop((left, top, right, bottom)), size)
            strip.paste(limit_palette(frame, 128), (index * w, 0))
            index += 1
    harvest = resample(load("news_harvest.png"), size)
    strip.paste(limit_palette(harvest, 128), (NEWS_HARVEST_FRAME * w, 0))
    return strip


# ---------- close-ups, 192 wide ----------

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
    """Six 40x40 pictures side by side, standing on the bottom edge of their cell (RES times larger in the file)."""
    sheet = load("fridge_items.png")
    strip = Image.new("RGBA", larger((FRIDGE_ITEM * len(FRIDGE_BOXES), FRIDGE_ITEM)))
    for i, box in enumerate(FRIDGE_BOXES):
        item = cut_out(sheet.crop(box), 30)
        item = item.crop(item.getchannel("A").getbbox())
        ratio = FRIDGE_ITEM / max(item.size)
        size = (max(1, round(item.width * ratio)), max(1, round(item.height * ratio)))
        small = resample(item, larger(size))
        alpha = small.getchannel("A").point(lambda a: 255 if a > 110 else 0)
        small = limit_palette(small.convert("RGB"), 64).convert("RGBA")
        small.putalpha(alpha)
        corner = (i * FRIDGE_ITEM + (FRIDGE_ITEM - size[0]) // 2, FRIDGE_ITEM - size[1])
        strip.alpha_composite(small, larger(corner))
    return strip


def build(out_world):
    for name, (file, scale) in LOCATION_PICTURES.items():
        source = load(file)
        size = (round(source.width * scale), round(source.height * scale))
        picture = limit_palette(resample(source, larger(size)), PICTURE_COLORS)
        picture.save(f"{out_world}/loc_{name}.png", optimize=True)
        for art, (part, shapes) in OCCLUDERS.get(name, {}).items():
            occluder(picture, part, shapes).save(f"{out_world}/{art}.png", optimize=True)

    yard = load("loc_yard.png")
    yard = yard.crop((0, 0, yard.width, YARD_BOTTOM))
    size = (round(yard.width * YARD_SCALE), round(YARD_BOTTOM * YARD_SCALE))
    yard = limit_palette(resample(yard, larger(size)), PICTURE_COLORS)
    yard.save(f"{out_world}/loc_yard.png", optimize=True)
    for art, (part, shapes) in OCCLUDERS["yard"].items():
        occluder(yard, part, shapes).save(f"{out_world}/{art}.png", optimize=True)

    road = road_picture()
    road.save(f"{out_world}/loc_street.png", optimize=True)
    occluder(road, *ROAD_SIGN).save(f"{out_world}/occlude_street_sign.png", optimize=True)

    shop_scene().save(f"{out_world}/loc_shop.png", optimize=True)
    shop_closed().save(f"{out_world}/shop_closed.png", optimize=True)
    goods = load("shop_goods.png")
    house_prop(goods, GOODS["beer"][0], BEER_ON_TABLE).save(f"{out_world}/beer_bottle.png")

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
    scene(load("sleep_room.png")).save(os.path.join(scenes_folder, "sleep.png"))
    scene(load("fridge_inside.png")).save(os.path.join(scenes_folder, "fridge_open.png"))
    for name, (box, height) in GOODS.items():
        house_prop(goods, box, height).save(os.path.join(scenes_folder, f"goods_{name}.png"))
    fridge_items().save(os.path.join(scenes_folder, "fridge_items.png"))


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    build(os.path.join(here, "..", "..", "art", "world"))
    print("built locations")
