"""Close-up scenes (192x144, side view) shown during dialogs and actions.

Drawn at game size and saved RES times larger with hard pixel edges (world.save)."""

import math
import random
from lib import Sprite, strip
from world import LEAVES, save

W, H = 192, 144


def sky(colors):
    s = Sprite(W, H, colors[-1])
    s.gradient(0, 0, W, 72, list(colors))
    return s


def cloud(s, cx, cy, size):
    for dx, dy, r in ((0, 0, 1.0), (-0.9, 0.25, 0.7), (0.9, 0.25, 0.75), (0.4, -0.35, 0.65)):
        s.shaded_ellipse(cx + dx * size, cy + dy * size, r * size * 1.2, r * size * 0.75,
                         ["cloud_shade", "cloud", "cloud"], light=(-0.3, -0.9))


def clouds_layer():
    s = Sprite(W * 2, 44)
    for cx, cy, size in ((30, 22, 9), (110, 14, 6), (190, 26, 10), (290, 16, 7), (350, 24, 5)):
        cloud(s, cx, cy, size)
    return s


def treeline(s, y, seed, colors=("#4f7a62", "#5f8a6c", "#77a27a")):
    rng = random.Random(seed)
    x = -6
    while x < W + 6:
        r = rng.randint(5, 10)
        s.shaded_ellipse(x, y - r * 0.4, r, r * 0.9, list(colors), light=(-0.6, -0.8))
        x += r
    s.rect(0, y, W, 6, colors[0])


def grass_ground(s, top, bottom, seed):
    s.gradient(0, top, W, bottom - top, ["grass_light", "grass_mid", "grass", "grass_dark"])
    rng = random.Random(seed)
    for _ in range((bottom - top) * 6):
        x = rng.randrange(W)
        y = rng.randrange(top, bottom)
        depth = (y - top) / max(1, bottom - top)
        length = 1 + int(depth * 4)
        color = rng.choice(["grass_dark", "grass", "grass_mid", "grass_sun"])
        for i in range(length):
            s.px(x + (i // 2 if rng.random() < 0.5 else 0), y - i, color)


def tall_grass(s, top, seed, count=120):
    rng = random.Random(seed)
    for _ in range(count):
        x = rng.randrange(-4, W + 4)
        base = rng.randrange(top + 6, H + 4)
        height = rng.randrange(6, 18)
        lean = rng.choice([-1, 0, 1])
        color = rng.choice(["grass_dark", "leaf", "leaf_mid", "grass", "grass_mid"])
        for i in range(height):
            s.px(x + lean * (i * i) // (height * 2), base - i, color)
        if rng.random() < 0.15:
            s.px(x + lean * height // 2, base - height, rng.choice(["white", "yellow", "red_light", "blue_light"]))


def potato_bush(s, cx, cy, size, seed):
    rng = random.Random(seed)
    s.rect(cx - 1, cy, 3, size, "leaf_dark")
    for i in range(7):
        a = -math.pi / 2 + (i - 3) * 0.55
        stem_len = size * rng.uniform(0.7, 1.0)
        ex = cx + math.cos(a) * stem_len
        ey = cy + math.sin(a) * stem_len * 0.6 + size * 0.3
        for t in range(10):
            s.px(cx + (ex - cx) * t / 10, cy + size * 0.4 + (ey - cy - size * 0.4) * t / 10, "leaf_dark")
        for j in range(3):
            lx = cx + (ex - cx) * (0.5 + j * 0.25) + rng.uniform(-2, 2)
            ly = cy + size * 0.4 + (ey - cy - size * 0.4) * (0.5 + j * 0.25)
            s.shaded_ellipse(lx, ly, size * 0.22, size * 0.15, LEAVES)
    for _ in range(3):
        fx = cx + rng.uniform(-size * 0.4, size * 0.4)
        fy = cy - size * 0.2 + rng.uniform(-3, 3)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            s.px(fx + dx, fy + dy, "white" if seed % 2 else "purple_light")
        s.px(fx, fy, "yellow")


GARDEN_BUSHES = [
    (30, 52, 16), (80, 50, 16), (130, 52, 16), (176, 50, 16),
    (8, 84, 24), (60, 86, 24), (114, 84, 24), (166, 86, 24),
    (34, 122, 30), (100, 124, 30), (160, 122, 30),
]


def garden():
    s = Sprite(W, H)
    treeline(s, 34, 41)
    s.rect(0, 36, W, H - 36, "soil")
    y = 36
    i = 0
    while y < H:
        h = 2 + (y - 36) // 8
        s.rect(0, y, W, h, "soil_dark" if i % 2 else "soil")
        if i % 2 == 0:
            s.speckle(0, y, W, h, ["soil_light"], 0.06, i)
        y += h
        i += 1
    for n, (cx, cy, size) in enumerate(GARDEN_BUSHES):
        potato_bush(s, cx, cy, size, n)
    return s


def beetle_big():
    s = Sprite(12, 12)
    s.shaded_ellipse(6, 7, 4.5, 4, ["yellow_dark", "yellow", "yellow_light"])
    for x in (3, 5, 7, 9):
        s.rect(x, 4, 1, 6, "outline")
    s.shaded_ellipse(6, 2.5, 2.5, 1.8, ["red_dark", "red", "red_light"])
    s.px(5, 2, "outline")
    s.px(7, 2, "outline")
    for y in (5, 7, 9):
        s.px(1, y, "outline")
        s.px(11, y, "outline")
    s.outline()
    return s


def hand(closed):
    s = Sprite(22, 30)
    s.rect(6, 14, 11, 16, "skin")
    s.rect(6, 14, 3, 16, "skin_shade")
    s.rect(6, 22, 11, 8, "blue")
    s.rect(6, 22, 11, 1, "blue_light")
    s.rect(6, 22, 1, 8, "white")
    if closed:
        s.shaded_ellipse(11, 12, 6, 5, ["skin_shade", "skin", "skin"])
        s.rect(9, 5, 3, 6, "skin")
        s.rect(12, 6, 3, 5, "skin_shade")
    else:
        s.shaded_ellipse(11, 13, 6, 5, ["skin_shade", "skin", "skin"])
        for i, x in enumerate((6, 9, 12, 15)):
            s.rect(x, 2 + abs(i - 1.5), 2, 9, "skin" if i < 3 else "skin_shade")
        s.rect(2, 11, 5, 2, "skin")
    s.outline()
    return s


def jar():
    s = Sprite(26, 32)
    s.rect(3, 6, 20, 26, "outline")
    s.gradient(4, 7, 18, 24, ["#d8ecf0", "#b6d6de"])
    s.rect(5, 8, 2, 20, "white")
    s.rect(2, 1, 22, 6, "outline")
    s.rect(3, 2, 20, 4, "gray_light")
    s.rect(3, 2, 20, 1, "white")
    s.rect(3, 5, 20, 1, "gray")
    return s


def groceries():
    s = Sprite(36, 14)
    s.shaded_ellipse(10, 8, 10, 5, ["wood_dark", "wood", "hay"])
    for x in (5, 9, 13):
        s.rect(x, 5, 2, 1, "hay_light")
    s.rect(23, 1, 12, 12, "yellow")
    s.rect(23, 5, 12, 4, "red")
    s.rect(24, 2, 3, 1, "yellow_light")
    s.outline()
    return s


def build(out):
    save(sky(["sky_top", "sky_mid", "sky_haze"]), f"{out}/sky_day.png")
    save(clouds_layer(), f"{out}/clouds.png")
    save(garden(), f"{out}/garden.png")
    save(beetle_big(), f"{out}/beetle.png")
    save(strip([hand(False), hand(True)]), f"{out}/hand.png")
    save(jar(), f"{out}/jar.png")
    save(groceries(), f"{out}/groceries.png")
