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
    bench().save(f"{out}/bench.png")
    strip([stork_nest(0), stork_nest(1)]).save(f"{out}/stork.png")
    strip([gas_pipe("plain"), gas_pipe("post")]).save(f"{out}/gas_pipe.png")
    strip([chicken(f) for f in range(3)]).save(f"{out}/chicken.png")
    strip([cat(0), cat(1)]).save(f"{out}/cat.png")
    strip([butterfly(0), butterfly(1)]).save(f"{out}/butterfly.png")
    beetle_small().save(f"{out}/beetle.png")
