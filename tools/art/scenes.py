"""Close-up scenes (192x144, side view) shown during dialogs and actions."""

import math
import random
from lib import Sprite, strip
from world import wattle, LEAVES

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


def well_background():
    s = Sprite(W, H)
    treeline(s, 64, 21)
    grass_ground(s, 68, H, 22)
    s.blit(wattle(W, 14), 0, 70)
    # posts and roof
    s.rect(44, 20, 8, 100, "wood")
    s.rect(44, 20, 2, 100, "wood_light")
    s.rect(140, 20, 8, 100, "wood")
    s.rect(140, 20, 2, 100, "wood_light")
    s.rect(43, 20, 1, 100, "outline")
    s.rect(148, 20, 1, 100, "outline")
    for y in range(22):
        width = 64 + y * 5.5
        x = 96 - width / 2
        s.rect(x, y, width, 1, "wood_light" if y % 4 == 0 else "wood" if y % 4 < 3 else "wood_dark")
    s.rect(30, 22, 132, 1, "outline")
    s.rect(34, 23, 124, 2, (0, 0, 0, 80))
    # drum with rope wound around it
    s.rect(52, 38, 88, 14, "wood")
    s.rect(52, 38, 88, 3, "wood_light")
    s.rect(52, 49, 88, 3, "wood_dark")
    for x in range(78, 114, 2):
        s.rect(x, 39, 1, 12, "hay_dark")
    # dark well opening
    s.ellipse(96, 96, 40, 8, "outline")
    s.ellipse(96, 96, 37, 6, "#1d2a30")
    return s


def well_front():
    s = Sprite(W, H)
    for row in range(5):
        y = 96 + row * 10
        s.rect(52, y, 88, 10, "wood")
        s.rect(52, y, 88, 2, "wood_light")
        s.rect(52, y + 8, 88, 2, "wood_dark")
        s.shaded_ellipse(52, y + 5, 5, 5, ["wood_dark", "wood", "hay"])
        s.shaded_ellipse(140, y + 5, 5, 5, ["wood_dark", "wood", "hay"])
        s.px(52, y + 5, "wood_dark")
        s.px(140, y + 5, "wood_dark")
    tall_grass(s, 120, 31, 50)
    return s


def crank(frame):
    s = Sprite(40, 40)
    angle = frame / 4 * math.tau
    cx, cy = 8, 20
    hx = cx + math.cos(angle) * 14
    hy = cy + math.sin(angle) * 14
    for t in range(16):
        x = cx + (hx - cx) * t / 15
        y = cy + (hy - cy) * t / 15
        s.rect(x - 1, y - 1, 3, 3, "gray_dark")
    s.shaded_ellipse(cx, cy, 4, 4, ["gray_dark", "gray", "gray_light"])
    s.rect(hx, hy - 2, 12, 4, "wood")
    s.rect(hx, hy - 2, 12, 1, "wood_light")
    s.outline()
    return s


def bucket(full):
    s = Sprite(24, 22)
    for y in range(16):
        w = 20 - y * 0.35
        x = 12 - w / 2
        s.rect(x, 5 + y, w, 1, "gray_light" if y < 3 else "gray")
        s.px(x, 5 + y, "gray_light")
        s.px(x + w - 1, 5 + y, "gray_dark")
    s.rect(2, 8, 20, 1, "gray_dark")
    s.rect(3, 16, 18, 1, "gray_dark")
    if full:
        s.rect(3, 5, 18, 2, "water_light")
        s.px(6, 5, "water_shine")
    for i in range(9):
        a = math.pi + i / 8 * math.pi
        s.px(12 + math.cos(a) * 10, 5 + math.sin(a) * 5, "gray_dark")
    s.outline()
    return s


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


def marshrutka():
    """Yellow minibus that brings you to the village."""
    s = Sprite(72, 40)
    s.ellipse(36, 37, 34, 3, (0, 0, 0, 80))
    s.rect(2, 8, 68, 24, "yellow")
    s.rect(6, 4, 52, 6, "yellow")
    s.rect(6, 4, 52, 1, "yellow_light")
    s.rect(2, 8, 68, 1, "yellow_light")
    s.rect(2, 26, 68, 6, "yellow_dark")
    for x in (8, 22, 36):
        s.rect(x, 11, 12, 9, "glass_dark")
        s.rect(x, 11, 12, 3, "glass")
        s.px(x + 1, 12, "glass_shine")
    s.rect(52, 11, 16, 11, "glass_dark")
    s.rect(52, 11, 16, 3, "glass")
    s.rect(50, 10, 1, 22, "yellow_dark")
    s.rect(4, 22, 66, 1, "red")
    s.rect(64, 24, 5, 3, "yellow_light")
    for x in (16, 54):
        s.shaded_ellipse(x, 32, 6, 6, ["outline", "gray_dark", "gray"])
        s.shaded_ellipse(x, 32, 2, 2, ["gray", "gray_light", "white"])
    s.outline()
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
    sky(["sky_top", "sky_mid", "sky_haze"]).save(f"{out}/sky_day.png")
    clouds_layer().save(f"{out}/clouds.png")
    well_background().save(f"{out}/well.png")
    well_front().save(f"{out}/well_front.png")
    strip([crank(f) for f in range(4)]).save(f"{out}/crank.png")
    strip([bucket(False), bucket(True)]).save(f"{out}/bucket.png")
    garden().save(f"{out}/garden.png")
    beetle_big().save(f"{out}/beetle.png")
    strip([hand(False), hand(True)]).save(f"{out}/hand.png")
    jar().save(f"{out}/jar.png")
    marshrutka().save(f"{out}/marshrutka.png")
    groceries().save(f"{out}/groceries.png")
