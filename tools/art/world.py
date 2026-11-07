"""Top-down world art: ground tiles and objects."""

import math
import random
from lib import Sprite, strip, dither

LEAVES = ["leaf_dark", "leaf", "leaf_mid", "leaf_light"]


def grass_tile(seed):
    rng = random.Random(seed)
    s = Sprite(16, 16, "grass")
    for y in range(16):
        for x in range(16):
            n = math.sin((x + seed * 7) * 0.9) + math.cos((y + seed * 3) * 0.7)
            if n > 1.1 and dither(x, y, 0.5):
                s.px(x, y, "grass_mid")
            elif n < -1.2 and dither(x, y, 0.4):
                s.px(x, y, "grass_dark")
    for _ in range(5):
        x, y = rng.randrange(1, 15), rng.randrange(2, 15)
        s.px(x, y, "grass_dark")
        s.px(x - 1, y - 1, "grass_mid")
        s.px(x + 1, y - 1, "grass_light")
        s.px(x, y - 1, "grass_mid")
    return s


def flower_tile(seed):
    s = grass_tile(seed + 20)
    rng = random.Random(seed)
    petals = [("white", "yellow"), ("red_light", "yellow"), ("blue_light", "white"), ("yellow", "yellow_dark")]
    for _ in range(4):
        x, y = rng.randrange(2, 14), rng.randrange(2, 14)
        petal, center = rng.choice(petals)
        s.px(x, y + 1, "grass_dark")
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            s.px(x + dx, y + dy, petal)
        s.px(x, y, center)
    return s


def road_tile(seed):
    rng = random.Random(seed)
    s = Sprite(16, 16, "road")
    for y in range(16):
        for x in range(16):
            n = math.sin(x * 0.6 + seed) * math.cos(y * 0.5 + seed * 2)
            if n > 0.45 and dither(x, y, 0.5):
                s.px(x, y, "road_light")
            elif n < -0.5 and dither(x, y, 0.5):
                s.px(x, y, "road_dark")
    for _ in range(4):
        x, y = rng.randrange(1, 15), rng.randrange(1, 15)
        s.px(x, y, "stone_light")
        s.px(x + 1, y, "road_dark")
        s.px(x, y + 1, "road_dark")
    # wheel ruts
    for x in range(16):
        if dither(x, 4, 0.7):
            s.px(x, 4, "road_dark")
        if dither(x, 11, 0.7):
            s.px(x, 11, "road_dark")
    return s


def soil_tile():
    s = Sprite(16, 16, "soil")
    for y in range(16):
        for x in range(16):
            band = y % 8
            if band in (0, 1):
                s.px(x, y, "soil_dark")
            elif band == 2 and dither(x, y, 0.5):
                s.px(x, y, "soil_dark")
            elif band in (4, 5) and dither(x, y, 0.35):
                s.px(x, y, "soil_light")
    s.speckle(0, 0, 16, 16, ["soil_light", "soil_dark"], 0.06, 3)
    return s


def potato_plant(frame):
    s = Sprite(14, 14)
    sway = frame
    s.shaded_ellipse(7, 9, 6, 4, LEAVES)
    s.shaded_ellipse(5 + sway, 6, 4, 3, LEAVES)
    s.shaded_ellipse(9 + sway, 5, 4, 3, LEAVES)
    for x, y in ((3 + sway, 4), (10 + sway, 3), (7, 9)):
        s.px(x, y, "leaf_light")
    s.px(7 + sway, 2, "white")
    s.px(8 + sway, 3, "purple_light")
    s.px(6 + sway, 3, "white")
    s.px(7 + sway, 3, "yellow")
    s.outline("leaf_dark")
    return s


def water_tile(frame):
    s = Sprite(16, 16, "water")
    for y in range(16):
        for x in range(16):
            wave = math.sin((x + frame * 5) * 0.8 + y * 1.7) + math.sin(y * 0.9 - frame * 2)
            if wave > 1.3:
                s.px(x, y, "water_light")
            elif wave < -1.4 and dither(x, y, 0.6):
                s.px(x, y, "water_dark")
    for i in range(3):
        x = (i * 6 + frame * 3) % 16
        y = (i * 5 + 2) % 16
        s.px(x, y, "water_shine")
        s.px(x + 1, y, "water_shine")
    return s


def wattle(width, height):
    """Woven wattle fence (тин), seen from the front."""
    s = Sprite(width, height)
    for x in range(0, width, 5):
        s.rect(x + 1, 0, 2, height, "wood_dark")
        s.px(x + 1, 0, "wood")
    for row, y in enumerate(range(2, height - 1, 3)):
        for x in range(width):
            wave = 1 if ((x + row * 5) // 5) % 2 else 0
            s.px(x, y + wave, "wood")
            s.px(x, y + wave + 1, "wood_light" if dither(x, y, 0.4) else "wood")
    s.outline()
    return s


def fence_h(with_pot):
    s = Sprite(16, 16)
    s.rect(0, 13, 16, 2, (0, 0, 0, 60))
    s.blit(wattle(16, 11), 0, 3)
    if with_pot:
        s.shaded_ellipse(8, 3, 3, 3, ["red_dark", "red", "red_light"])
        s.rect(7, 0, 3, 1, "red_dark")
        s.px(7, 1, "red_light")
    return s


def fence_v():
    s = Sprite(16, 16)
    s.rect(9, 0, 2, 16, (0, 0, 0, 60))
    s.rect(6, 0, 4, 16, "wood")
    for y in range(0, 16, 3):
        s.rect(6, y, 4, 1, "wood_light")
        s.px(9, y + 1, "wood_dark")
    s.rect(5, 0, 1, 16, "outline")
    s.rect(10, 0, 1, 16, "outline")
    return s


def leafy_canopy(s, blobs, seed):
    rng = random.Random(seed)
    for cx, cy, rx, ry in blobs:
        s.shaded_ellipse(cx, cy, rx, ry, LEAVES)
    # ragged leafy edge
    for cx, cy, rx, ry in blobs:
        for _ in range(int(rx * ry)):
            a = rng.random() * math.tau
            x = cx + math.cos(a) * (rx + 0.5)
            y = cy + math.sin(a) * (ry + 0.5)
            s.px(x, y, "leaf_light" if math.sin(a) < -0.3 and math.cos(a) < 0.3 else "leaf_dark")


def round_tree(seed, berries=False):
    s = Sprite(32, 40)
    s.ellipse(16, 36, 11, 3, (0, 0, 0, 70))
    s.rect(14, 22, 4, 14, "wood")
    s.rect(14, 22, 1, 14, "wood_light")
    s.rect(17, 22, 1, 14, "wood_dark")
    s.px(13, 35, "wood_dark")
    s.px(18, 35, "wood_dark")
    leafy_canopy(s, [(16, 15, 12, 10), (10, 19, 7, 6), (22, 18, 8, 7), (15, 9, 8, 6)], seed)
    rng = random.Random(seed + 1)
    for _ in range(14):
        x, y = rng.randrange(6, 26), rng.randrange(6, 24)
        if s.get(x, y)[3]:
            s.px(x, y, "leaf_light" if rng.random() < 0.5 else "grass_light")
    if berries:
        for _ in range(16):
            x, y = rng.randrange(5, 27), rng.randrange(7, 25)
            if s.get(x, y)[3]:
                s.px(x, y, "red")
                s.px(x - 1, y - 1, "red_light")
    s.outline()
    return s


def poplar(seed):
    s = Sprite(20, 44)
    s.ellipse(10, 41, 7, 2, (0, 0, 0, 70))
    s.rect(9, 30, 3, 11, "wood")
    s.px(9, 30, "wood_light")
    leafy_canopy(s, [(10, 18, 6, 15), (10, 10, 4, 8), (10, 26, 6, 6)], seed)
    s.outline()
    return s


def roof_slate(s, x0, y0, w, h):
    """Wavy asbestos slate roof (шифер), shaded lower toward the front."""
    for y in range(h):
        for x in range(w):
            ridge = (x % 4)
            color = "slate_light" if ridge == 0 else "slate" if ridge in (1, 2) else "slate_dark"
            if y > h * 0.6 and dither(x, y, (y - h * 0.6) / (h * 0.4) * 0.6):
                color = "slate_dark" if color != "slate_light" else "slate"
            s.px(x0 + x, y0 + y, color)
    for x in range(w):
        s.px(x0 + x, y0, "slate_light")
        s.px(x0 + x, y0 + h - 1, "outline")
        s.px(x0 + x, y0 + h, (0, 0, 0, 90))


def window(s, x, y, w=12, h=12, frame="blue", shine=True):
    s.rect(x - 1, y - 1, w + 2, h + 2, "outline")
    s.rect(x, y, w, h, frame)
    s.rect(x + 1, y + 1, w - 2, h - 2, "glass_dark")
    s.gradient(x + 1, y + 1, w - 2, h - 2, ["glass_dark", "glass"])
    s.rect(x + w // 2, y, 1, h, frame)
    s.rect(x, y + h // 2 - 1, w, 1, frame)
    if shine:
        s.px(x + 2, y + 2, "glass_shine")
        s.px(x + 3, y + 2, "glass_shine")
        s.px(x + 2, y + 3, "glass_shine")
    # carved shutters
    s.rect(x - 4, y, 3, h, frame)
    s.rect(x + w + 1, y, 3, h, frame)
    s.px(x - 3, y + 2, "blue_light")
    s.px(x + w + 2, y + 2, "blue_light")


def house():
    s = Sprite(104, 72)
    s.rect(4, 68, 98, 4, (0, 0, 0, 70))
    # chimney and TV antenna
    s.rect(70, 2, 7, 14, "wall_dark")
    s.rect(70, 2, 7, 2, "wall_shade")
    s.rect(69, 0, 9, 2, "outline")
    s.rect(28, 0, 1, 14, "gray_dark")
    for i, y in enumerate((2, 5, 8)):
        s.rect(24 - i, y, 9 + i * 2, 1, "gray")
    roof_slate(s, 0, 12, 104, 34)
    # whitewashed walls with blue base (призьба)
    s.rect(4, 46, 96, 24, "wall")
    s.gradient(4, 46, 96, 5, ["wall_dark", "wall_shade", "wall"])
    s.rect(4, 64, 96, 5, "blue")
    s.rect(4, 64, 96, 1, "blue_light")
    s.rect(4, 69, 96, 1, "outline")
    s.rect(3, 46, 1, 24, "outline")
    s.rect(100, 46, 1, 24, "outline")
    window(s, 14, 50)
    window(s, 70, 50)
    # door with step
    s.rect(43, 49, 14, 20, "outline")
    s.rect(44, 50, 12, 19, "wood")
    s.rect(45, 51, 4, 17, "wood_light")
    s.rect(51, 51, 4, 17, "wood_dark")
    s.px(54, 60, "yellow")
    s.rect(41, 69, 18, 3, "stone")
    s.rect(41, 69, 18, 1, "stone_light")
    # flower pots and painted trim
    for x in (34, 88):
        s.rect(x, 62, 5, 2, "red")
        s.px(x + 1, 60, "red_light")
        s.px(x + 3, 61, "pink")
        s.px(x + 2, 61, "leaf_mid")
    return s


PIXEL_FONT = {
    "М": ["101", "111", "111", "101", "101"],
    "А": ["010", "101", "111", "101", "101"],
    "Г": ["111", "100", "100", "100", "100"],
    "З": ["110", "001", "010", "001", "110"],
    "И": ["101", "101", "111", "111", "101"],
    "Н": ["101", "101", "111", "101", "101"],
    "Х": ["101", "101", "010", "101", "101"],
    "Л": ["011", "101", "101", "101", "101"],
    "І": ["1", "1", "1", "1", "1"],
    "Б": ["111", "100", "110", "101", "110"],
}


def text(s, x, y, word, color):
    for letter in word:
        glyph = PIXEL_FONT[letter]
        for gy, row in enumerate(glyph):
            for gx, bit in enumerate(row):
                if bit == "1":
                    s.px(x + gx, y + gy, color)
        x += len(glyph[0]) + 1


def shop():
    s = Sprite(120, 72)
    s.rect(4, 68, 114, 4, (0, 0, 0, 70))
    # painted tin roof
    for y in range(30):
        for x in range(120):
            color = "red" if x % 6 else "red_dark"
            if x % 6 == 1:
                color = "red_light"
            if y > 20 and dither(x, y, (y - 20) / 10 * 0.6):
                color = "red_dark"
            s.px(x, 12 + y, color)
    s.rect(0, 12, 120, 1, "red_light")
    s.rect(0, 41, 120, 1, "outline")
    # plastered wall
    s.rect(4, 42, 112, 27, "hay_light")
    s.gradient(4, 42, 112, 4, ["hay_dark", "hay", "hay_light"])
    s.speckle(4, 46, 112, 22, ["hay", "wall"], 0.05, 9)
    s.rect(4, 64, 112, 5, "stone_dark")
    s.rect(4, 64, 112, 1, "stone")
    s.rect(3, 42, 1, 27, "outline")
    s.rect(116, 42, 1, 27, "outline")
    # sign board
    s.rect(34, 2, 52, 11, "outline")
    s.rect(35, 3, 50, 9, "blue")
    s.rect(35, 3, 50, 1, "blue_light")
    text(s, 42, 5, "МАГАЗИН", "white")
    s.rect(40, 13, 1, 4, "outline")
    s.rect(80, 13, 1, 4, "outline")
    # shop window with goods
    s.rect(11, 47, 30, 15, "outline")
    s.rect(12, 48, 28, 13, "glass_dark")
    s.rect(12, 54, 28, 1, "wood")
    for i, color in enumerate(("yellow", "red", "white", "leaf_mid", "yellow", "red", "blue_light")):
        s.rect(13 + i * 4, 51, 3, 3, color)
        s.rect(13 + i * 4, 57, 3, 4, ["wood_light", "red_light", "yellow_dark"][i % 3])
    s.px(13, 48, "glass_shine")
    s.px(14, 48, "glass_shine")
    window(s, 86, 48, 18, 13, frame="wood", shine=True)
    # glass door
    s.rect(53, 46, 16, 22, "outline")
    s.rect(54, 47, 14, 21, "blue")
    s.rect(56, 49, 10, 9, "glass_dark")
    s.px(57, 50, "glass_shine")
    s.rect(54, 47, 14, 1, "blue_light")
    s.rect(46, 47, 6, 8, "white")
    s.rect(47, 48, 4, 1, "red")
    s.rect(47, 50, 4, 1, "gray")
    s.rect(47, 52, 3, 1, "gray")
    s.rect(51, 68, 20, 3, "stone_light")
    return s


def well():
    s = Sprite(24, 34)
    s.ellipse(12, 31, 11, 3, (0, 0, 0, 80))
    # posts and little roof
    s.rect(4, 8, 2, 18, "wood_dark")
    s.rect(18, 8, 2, 18, "wood_dark")
    for y in range(9):
        w = 12 + y * 1.4
        s.rect(12 - w / 2, y, w, 1, "wood_light" if y % 3 == 0 else "wood")
    s.rect(3, 8, 18, 1, "outline")
    # crank shaft
    s.rect(5, 13, 14, 2, "wood_light")
    s.rect(5, 15, 14, 1, "wood_dark")
    s.rect(20, 12, 1, 5, "gray_dark")
    s.rect(20, 16, 3, 1, "gray_dark")
    s.rect(11, 15, 1, 6, "gray")
    # log box
    for row in range(4):
        y = 20 + row * 3
        s.rect(1, y, 22, 3, "wood")
        s.rect(1, y, 22, 1, "wood_light")
        s.px(1, y + 1, "wood_dark")
        s.px(22, y + 1, "wood_dark")
    s.rect(3, 20, 18, 2, "water_dark")
    s.rect(6, 20, 6, 1, "water_light")
    # bucket on the edge
    s.rect(15, 17, 5, 4, "gray")
    s.rect(15, 17, 5, 1, "gray_light")
    s.outline()
    return s


def bus_stop():
    s = Sprite(56, 40)
    s.rect(2, 36, 54, 4, (0, 0, 0, 70))
    s.rect(0, 2, 56, 5, "stone_light")
    s.rect(0, 6, 56, 2, "stone_dark")
    s.rect(2, 8, 52, 26, "stone")
    # soviet mosaic: sun over waves
    s.gradient(4, 10, 48, 18, ["blue_light", "blue"])
    s.shaded_ellipse(28, 20, 7, 7, ["yellow_dark", "yellow", "yellow_light"])
    for x in range(4, 52):
        y = 24 + round(math.sin(x * 0.5) * 1.5)
        s.rect(x, y, 1, 28 - y, "blue_dark")
    for x in range(4, 52, 3):
        for y in range(10, 28, 3):
            s.px(x, y, (255, 255, 255, 40))
    s.rect(4, 29, 48, 3, "wood")
    s.rect(4, 29, 48, 1, "wood_light")
    s.rect(6, 32, 2, 4, "wood_dark")
    s.rect(48, 32, 2, 4, "wood_dark")
    s.outline()
    return s


def bench():
    s = Sprite(24, 14)
    s.rect(1, 12, 22, 2, (0, 0, 0, 70))
    s.rect(1, 2, 22, 3, "wood")
    s.rect(1, 2, 22, 1, "wood_light")
    s.rect(1, 6, 22, 3, "wood")
    s.rect(1, 6, 22, 1, "wood_light")
    s.rect(3, 9, 2, 3, "wood_dark")
    s.rect(19, 9, 2, 3, "wood_dark")
    s.outline()
    return s


def sunflower(frame):
    s = Sprite(14, 32)
    s.ellipse(7, 30, 4, 1.5, (0, 0, 0, 70))
    s.rect(6, 10, 2, 20, "leaf_mid")
    s.rect(6, 10, 1, 20, "leaf_light")
    s.shaded_ellipse(3, 20, 3, 2, LEAVES)
    s.shaded_ellipse(10, 16, 3, 2, LEAVES)
    head_x = 7 + frame
    for a in range(12):
        angle = a / 12 * math.tau
        s.shaded_ellipse(head_x + math.cos(angle) * 4, 7 + math.sin(angle) * 4, 2, 2, ["yellow_dark", "yellow", "yellow_light"])
    s.shaded_ellipse(head_x, 7, 3, 3, ["soil_dark", "soil", "wood_light"])
    s.outline()
    return s


def haystack():
    s = Sprite(30, 26)
    s.ellipse(15, 23, 14, 3, (0, 0, 0, 80))
    s.shaded_ellipse(15, 15, 13, 10, ["hay_dark", "hay", "hay_light"])
    s.shaded_ellipse(15, 7, 7, 6, ["hay_dark", "hay", "hay_light"])
    rng = random.Random(4)
    for _ in range(40):
        x, y = rng.randrange(3, 27), rng.randrange(2, 24)
        if s.get(x, y)[3] == 255:
            s.px(x, y, rng.choice(["hay_dark", "hay_light"]))
    s.rect(14, 0, 2, 3, "wood_dark")
    s.outline()
    return s


def stork_nest(frame):
    s = Sprite(24, 56)
    s.ellipse(12, 54, 5, 1.5, (0, 0, 0, 80))
    s.rect(11, 14, 3, 40, "wood")
    s.rect(11, 14, 1, 40, "wood_light")
    s.shaded_ellipse(12, 13, 10, 4, ["wood_dark", "wood", "hay_dark"])
    rng = random.Random(8)
    for _ in range(20):
        a = rng.random() * math.tau
        s.px(12 + math.cos(a) * 10, 13 + math.sin(a) * 4, "wood_dark")
    # stork
    s.shaded_ellipse(12, 7, 5, 3, ["cloud_shade", "white", "white"])
    s.rect(14, 8, 4, 2, "black")
    neck_up = 0 if frame == 0 else 1
    s.rect(9, 1 + neck_up, 2, 5, "white")
    s.shaded_ellipse(9, 1 + neck_up, 2, 2, ["cloud_shade", "white", "white"])
    s.rect(4, 1 + neck_up, 4, 1, "red")
    s.px(9, 0 + neck_up, "black")
    s.outline()
    return s


def gas_pipe(kind):
    """Yellow village gas pipe on short posts (iconic in 2000s villages)."""
    s = Sprite(16, 16)
    s.rect(0, 13, 16, 2, (0, 0, 0, 60))
    if kind == "post":
        s.rect(7, 4, 2, 10, "gray_dark")
    s.rect(0, 3, 16, 3, "yellow")
    s.rect(0, 3, 16, 1, "yellow_light")
    s.rect(0, 5, 16, 1, "yellow_dark")
    s.rect(0, 2, 16, 1, "outline")
    s.rect(0, 6, 16, 1, "outline")
    return s


def chicken(frame):
    s = Sprite(12, 12)
    s.ellipse(6, 11, 4, 1, (0, 0, 0, 70))
    body_y = 6 if frame != 2 else 7
    s.shaded_ellipse(6, body_y, 4, 3, ["cloud_shade", "white", "white"])
    s.rect(9, body_y - 3, 1, 3, "white")
    head_x, head_y = (3, body_y - 3) if frame != 2 else (2, body_y + 1)
    s.shaded_ellipse(head_x, head_y, 2, 2, ["cloud_shade", "white", "white"])
    s.px(head_x, head_y - 2, "red")
    s.px(head_x + 1, head_y - 2, "red")
    s.px(head_x - 2, head_y, "yellow_dark")
    s.px(head_x - 1, head_y - 1, "black")
    legs = [(5, 7), (6, 6)][frame % 2]
    s.px(legs[0], 10, "yellow_dark")
    s.px(legs[1] + 1, 10, "yellow_dark")
    s.outline()
    return s


def cat(frame):
    s = Sprite(18, 12)
    s.ellipse(9, 10, 7, 1.5, (0, 0, 0, 70))
    breathe = frame
    s.shaded_ellipse(9, 7 - breathe * 0.5, 6, 3 + breathe * 0.5, ["red_dark", "yellow_dark", "hay"])
    s.shaded_ellipse(4, 6, 3, 3, ["red_dark", "yellow_dark", "hay"])
    s.px(2, 3, "yellow_dark")
    s.px(5, 3, "yellow_dark")
    s.px(3, 6, "black")
    s.px(5, 6, "black")
    for x in range(8, 15, 3):
        s.px(x, 5, "red_dark")
    s.rect(14, 8, 3, 1, "yellow_dark")
    s.outline()
    return s


def butterfly(frame):
    s = Sprite(7, 5)
    if frame == 0:
        s.rect(0, 0, 3, 3, "yellow_light")
        s.rect(4, 0, 3, 3, "yellow_light")
        s.px(0, 3, "yellow")
        s.px(6, 3, "yellow")
    else:
        s.rect(1, 1, 2, 2, "yellow")
        s.rect(4, 1, 2, 2, "yellow")
    s.rect(3, 1, 1, 3, "outline")
    return s


def beetle_small():
    s = Sprite(6, 6)
    s.shaded_ellipse(3, 3, 2.5, 2.5, ["yellow_dark", "yellow", "yellow_light"])
    s.px(2, 2, "black")
    s.px(2, 4, "black")
    s.px(4, 3, "black")
    s.outline()
    return s


def build(out):
    strip([grass_tile(i) for i in range(4)]).save(f"{out}/grass.png")
    strip([flower_tile(i) for i in range(2)]).save(f"{out}/flowers.png")
    strip([road_tile(i) for i in range(3)]).save(f"{out}/road.png")
    soil_tile().save(f"{out}/soil.png")
    strip([potato_plant(f) for f in range(2)]).save(f"{out}/potato.png")
    strip([water_tile(f) for f in range(3)]).save(f"{out}/water.png")
    strip([fence_h(False), fence_h(True), fence_v()]).save(f"{out}/fence.png")
    strip([round_tree(1), round_tree(2), round_tree(3, berries=True)]).save(f"{out}/trees.png")
    strip([poplar(5), poplar(6)]).save(f"{out}/poplars.png")
    house().save(f"{out}/house.png")
    shop().save(f"{out}/shop.png")
    well().save(f"{out}/well.png")
    bus_stop().save(f"{out}/bus_stop.png")
    bench().save(f"{out}/bench.png")
    strip([sunflower(0), sunflower(1)]).save(f"{out}/sunflower.png")
    haystack().save(f"{out}/haystack.png")
    strip([stork_nest(0), stork_nest(1)]).save(f"{out}/stork.png")
    strip([gas_pipe("plain"), gas_pipe("post")]).save(f"{out}/gas_pipe.png")
    strip([chicken(f) for f in range(3)]).save(f"{out}/chicken.png")
    strip([cat(0), cat(1)]).save(f"{out}/cat.png")
    strip([butterfly(0), butterfly(1)]).save(f"{out}/butterfly.png")
    beetle_small().save(f"{out}/beetle.png")
