"""Close-up scenes (192x144, side view) shown during dialogs and actions."""

import math
import random
from lib import Sprite, strip, dither
from world import wattle, LEAVES

W, H = 192, 144
WHEAT = ["hay_dark", "hay", "hay_light", "yellow_light"]


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


def far_poplars(s, xs, base, color="#4a7560"):
    for x in xs:
        s.shaded_ellipse(x, base - 14, 3, 14, [color, "#5f8a6c", "#77a27a"])


def field_rows(s, top, bottom, colors):
    """Distant fields with stripes that get thicker toward the viewer."""
    y = top
    i = 0
    while y < bottom:
        h = 1 + (y - top) // 6
        s.rect(0, y, W, h, colors[i % len(colors)])
        y += h
        i += 1


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


def big_sunflower(s, x, base, height, tilt=0):
    s.rect(x, base - height, 3, height, "leaf_mid")
    s.rect(x, base - height, 1, height, "leaf_light")
    for i, y in enumerate(range(base - height + 14, base, 12)):
        side = -1 if i % 2 else 1
        s.shaded_ellipse(x + 1 + side * 6, y, 6, 3, LEAVES)
    hx, hy = x + 1 + tilt, base - height - 4
    for a in range(16):
        angle = a / 16 * math.tau
        s.shaded_ellipse(hx + math.cos(angle) * 8, hy + math.sin(angle) * 8, 3.5, 3.5,
                         ["yellow_dark", "yellow", "yellow_light"])
    s.shaded_ellipse(hx, hy, 6, 6, ["soil_dark", "soil", "wood_light"])
    for i in range(10):
        a = i * 2.4
        s.px(hx + math.cos(a) * i * 0.5, hy + math.sin(a) * i * 0.5, "soil_dark")


def cherry_branch(s, seed):
    """Foreground branch hanging from the top-left corner."""
    rng = random.Random(seed)
    points = [(0, 4), (14, 8), (30, 10), (46, 8), (58, 12)]
    for (x1, y1), (x2, y2) in zip(points, points[1:]):
        for t in range(20):
            x = x1 + (x2 - x1) * t / 20
            y = y1 + (y2 - y1) * t / 20
            s.rect(x, y, 2, 3, "wood_dark")
    for x, y in points[1:]:
        for _ in range(3):
            lx = x + rng.randint(-6, 6)
            ly = y + rng.randint(2, 8)
            s.shaded_ellipse(lx, ly, 4, 2.5, LEAVES)
        cx = x + rng.randint(-3, 3)
        for dx in (-2, 2):
            s.rect(cx + dx // 2, y + 2, 1, 6, "leaf_dark")
            s.shaded_ellipse(cx + dx, y + 10, 2, 2, ["red_dark", "red", "red_light"])
    s.rect(0, 0, 4, 8, "wood_dark")


def slate_roof_side(s, x0, y0, w, h, overhang):
    for y in range(h):
        inset = int((h - y) * overhang / h)
        for x in range(x0 + inset, x0 + w - inset):
            ridge = x % 5
            color = "slate_light" if ridge == 0 else "slate_dark" if ridge == 4 else "slate"
            if y > h * 0.65 and dither(x, y, 0.5):
                color = "slate_dark"
            s.px(x, y0 + y, color)
    s.rect(x0 + overhang, y0, w - overhang * 2, 1, "slate_light")
    s.rect(x0, y0 + h, w, 1, "outline")
    s.rect(x0 + 3, y0 + h + 1, w - 6, 2, (0, 0, 0, 70))


def big_window(s, x, y, w, h):
    s.rect(x - 7, y - 1, 6, h + 2, "outline")
    s.rect(x + w + 1, y - 1, 6, h + 2, "outline")
    s.rect(x - 6, y, 4, h, "blue")
    s.rect(x + w + 2, y, 4, h, "blue")
    for yy in range(y + 2, y + h - 1, 4):
        s.rect(x - 5, yy, 2, 2, "blue_light")
        s.rect(x + w + 3, yy, 2, 2, "blue_light")
    s.rect(x - 1, y - 1, w + 2, h + 2, "outline")
    s.rect(x, y, w, h, "blue")
    s.gradient(x + 1, y + 1, w - 2, h - 2, ["glass_dark", "glass", "glass_dark"])
    s.rect(x + w // 2, y, 1, h, "blue")
    s.rect(x, y + h // 3, w, 1, "blue")
    # lace curtain
    for xx in range(x + 1, x + w - 1):
        if xx % 2:
            s.px(xx, y + 1, "white")
        s.px(xx, y + 2, "white" if dither(xx, y, 0.5) else "wall_shade")
    s.px(x + 2, y + h // 3 + 2, "glass_shine")
    s.px(x + 3, y + h // 3 + 2, "glass_shine")
    s.px(x + 2, y + h // 3 + 3, "glass_shine")
    s.rect(x - 2, y + h + 1, w + 4, 2, "wall_shade")


def khata(s, x, y, w):
    """Whitewashed house seen from the side, as in the yard scene."""
    roof_h = 30
    slate_roof_side(s, x - 6, y, w + 12, roof_h, 14)
    wall_top = y + roof_h + 1
    wall_h = 38
    s.rect(x, wall_top, w, wall_h, "wall")
    s.gradient(x, wall_top, w, 6, ["wall_dark", "wall_shade", "wall"])
    s.speckle(x, wall_top + 6, w, wall_h - 12, ["wall_shade"], 0.03, 2)
    s.rect(x, wall_top + wall_h - 7, w, 7, "blue")
    s.rect(x, wall_top + wall_h - 7, w, 1, "blue_light")
    s.rect(x - 1, wall_top, 1, wall_h, "outline")
    s.rect(x + w, wall_top, 1, wall_h, "outline")
    big_window(s, x + 14, wall_top + 8, 16, 18)
    big_window(s, x + w - 32, wall_top + 8, 16, 18)
    # door
    dx = x + w // 2 - 6
    s.rect(dx - 1, wall_top + 6, 14, wall_h - 6, "outline")
    s.rect(dx, wall_top + 7, 12, wall_h - 7, "wood")
    s.rect(dx + 1, wall_top + 8, 4, wall_h - 9, "wood_light")
    s.rect(dx + 7, wall_top + 8, 4, wall_h - 9, "wood_dark")
    s.px(dx + 10, wall_top + 22, "yellow")
    # chimney and antenna
    s.rect(x + w - 24, y - 12, 8, 14, "wall_dark")
    s.rect(x + w - 25, y - 13, 10, 2, "outline")
    s.rect(x + 20, y - 22, 1, 23, "gray_dark")
    for i, yy in enumerate((-20, -16, -12)):
        s.rect(x + 14 - i, y + yy, 13 + i * 2, 1, "gray")
    return wall_top + wall_h


def wattle_with_pots(s, y, height, xs_pots):
    fence = wattle(W, height)
    s.blit(fence, 0, y)
    for x in xs_pots:
        s.rect(x, y - 2, 2, 6, "wood_dark")
        s.shaded_ellipse(x + 1, y - 6, 5, 5, ["red_dark", "red", "red_light"])
        s.rect(x - 2, y - 11, 6, 2, "red_dark")


def yard():
    s = Sprite(W, H)
    far_poplars(s, (150, 160, 176), 56)
    treeline(s, 56, 3)
    grass_ground(s, 60, H, 4)
    bottom = khata(s, 30, 22, 110)
    s.rect(24, bottom, 124, 3, (0, 0, 0, 60))
    big_sunflower(s, 160, 112, 52, tilt=-2)
    big_sunflower(s, 176, 116, 44, tilt=1)
    wattle_with_pots(s, 98, 18, (12, 60, 140))
    tall_grass(s, 104, 5)
    cherry_branch(s, 6)
    return s


def shop_interior():
    s = Sprite(W, H)
    s.rect(0, 0, W, 76, "wall")
    s.gradient(0, 0, W, 14, ["wall_dark", "wall_shade", "wall"])
    s.rect(0, 76, W, 68, "#5f8f86")
    s.rect(0, 76, W, 2, "#3f6a62")
    s.speckle(0, 0, W, 76, ["wall_shade"], 0.03, 7)
    rng = random.Random(11)
    for shelf_y in (26, 52, 78):
        s.rect(4, shelf_y, W - 8, 3, "wood")
        s.rect(4, shelf_y, W - 8, 1, "wood_light")
        s.rect(4, shelf_y + 3, W - 8, 1, (0, 0, 0, 80))
        x = 8
        while x < W - 16:
            kind = rng.choice(["bread", "noodles", "jar", "bottle", "bottle", "can", "noodles"])
            if kind == "bread":
                s.shaded_ellipse(x + 6, shelf_y - 4, 7, 4, ["wood_dark", "wood", "hay"])
                s.px(x + 4, shelf_y - 6, "hay_light")
                s.px(x + 7, shelf_y - 6, "hay_light")
                x += 15
            elif kind == "noodles":
                s.rect(x, shelf_y - 10, 10, 10, "outline")
                s.rect(x + 1, shelf_y - 9, 8, 9, "yellow")
                s.rect(x + 1, shelf_y - 6, 8, 3, "red")
                s.px(x + 2, shelf_y - 8, "yellow_light")
                x += 11
            elif kind == "jar":
                s.rect(x, shelf_y - 16, 12, 16, "outline")
                s.gradient(x + 1, shelf_y - 15, 10, 15, ["#c9e0d0", "#9fc2a8"])
                for i in range(5):
                    s.shaded_ellipse(x + 3 + (i % 2) * 5, shelf_y - 4 - i * 2.5, 2, 3, ["leaf_dark", "leaf_mid", "leaf_light"])
                s.rect(x + 1, shelf_y - 17, 10, 2, "gray_light")
                x += 14
            elif kind == "bottle":
                color = rng.choice([("wood_dark", "wood"), ("leaf_dark", "leaf_mid"), ("blue_dark", "blue")])
                s.rect(x + 1, shelf_y - 14, 6, 14, "outline")
                s.rect(x + 2, shelf_y - 13, 4, 13, color[1])
                s.rect(x + 2, shelf_y - 13, 1, 13, "glass_shine")
                s.rect(x + 3, shelf_y - 19, 2, 6, color[0])
                s.rect(x + 2, shelf_y - 9, 4, 4, "white")
                x += 8
            else:
                s.rect(x, shelf_y - 8, 8, 8, "outline")
                s.rect(x + 1, shelf_y - 7, 6, 7, "gray_light")
                s.rect(x + 1, shelf_y - 5, 6, 3, rng.choice(["red", "blue", "leaf_mid"]))
                x += 10
    # calendar 2003
    s.rect(150, 86, 30, 36, "outline")
    s.rect(151, 87, 28, 34, "white")
    s.gradient(152, 88, 26, 14, ["sky_top", "sky_mid"])
    s.rect(152, 98, 26, 4, "grass_mid")
    for row in range(4):
        for col in range(6):
            s.px(154 + col * 4, 106 + row * 3, "gray_dark" if col < 5 else "red")
    return s


def shop_counter():
    s = Sprite(W, H)
    top = 104
    s.rect(0, top, W, 5, "wood_light")
    s.rect(0, top, W, 1, "hay_light")
    s.rect(0, top + 5, W, 1, "outline")
    s.rect(0, top + 6, W, H - top - 6, "wood")
    for x in range(0, W, 12):
        s.rect(x, top + 6, 1, H, "wood_dark")
        s.rect(x + 1, top + 6, 1, H, "wood_light")
    # scales
    s.rect(14, 86, 34, 18, "outline")
    s.rect(15, 87, 32, 17, "white")
    s.rect(15, 100, 32, 4, "gray_light")
    s.shaded_ellipse(31, 94, 6, 6, ["gray_light", "white", "white"])
    s.rect(31, 89, 1, 5, "red")
    s.rect(10, 82, 42, 4, "gray")
    s.rect(10, 82, 42, 1, "gray_light")
    # abacus
    s.rect(64, 92, 28, 12, "outline")
    s.rect(65, 93, 26, 10, "wood_light")
    for row in range(3):
        y = 95 + row * 3
        s.rect(66, y, 24, 1, "gray_dark")
        for b in range(5):
            s.rect(67 + b * 3 + (row * 4 if b > 2 else 0), y - 1, 2, 3, "wood_dark" if b % 2 else "outline")
    return s


def street():
    s = Sprite(W, H)
    far_poplars(s, (12, 26, 40, 54, 68), 62)
    treeline(s, 62, 9)
    field_rows(s, 64, 80, ["hay", "grass_mid", "hay_light", "grass"])
    s.gradient(0, 80, W, 16, ["road_light", "road"])
    grass_ground(s, 96, H, 10)
    # painted picket fence (штахетник)
    for x in range(96, W, 6):
        s.rect(x, 52, 5, 34, "outline")
        s.rect(x + 1, 53, 3, 33, "leaf_mid")
        s.rect(x + 1, 53, 1, 33, "leaf_light")
        s.px(x + 2, 52, "leaf_mid")
    s.rect(96, 60, 96, 3, "leaf_dark")
    s.rect(96, 76, 96, 3, "leaf_dark")
    # yellow gas pipe with an arch over the gate
    s.rect(0, 46, 70, 4, "yellow")
    s.rect(0, 46, 70, 1, "yellow_light")
    s.rect(0, 49, 70, 1, "yellow_dark")
    s.rect(70, 26, 4, 24, "yellow")
    s.rect(70, 26, 1, 24, "yellow_light")
    s.rect(70, 26, 40, 4, "yellow")
    s.rect(70, 26, 40, 1, "yellow_light")
    s.rect(106, 26, 4, 24, "yellow")
    s.rect(110, 46, 82, 4, "yellow")
    s.rect(110, 46, 82, 1, "yellow_light")
    for x in (20, 50, 140, 175):
        s.rect(x, 50, 2, 36, "gray_dark")
    # bench in the foreground
    s.rect(100, 112, 90, 6, "wood")
    s.rect(100, 112, 90, 1, "wood_light")
    s.rect(100, 98, 90, 5, "wood")
    s.rect(100, 98, 90, 1, "wood_light")
    s.rect(104, 103, 3, 30, "wood_dark")
    s.rect(182, 103, 3, 30, "wood_dark")
    s.rect(100, 118, 90, 1, "outline")
    tall_grass(s, 110, 12, 90)
    return s


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


def title():
    s = Sprite(W, H)
    far_poplars(s, (120, 132, 144, 156, 168, 180), 60)
    treeline(s, 60, 51)
    field_rows(s, 62, 92, ["hay", "hay_light", "hay_dark", "yellow_light"])
    rng = random.Random(52)
    for _ in range(300):
        x = rng.randrange(W)
        y = rng.randrange(80, 96)
        s.px(x, y, rng.choice(WHEAT))
        s.px(x, y - 1, "hay_light")
    s.gradient(0, 92, W, 20, ["road_light", "road", "road_dark"])
    grass_ground(s, 112, H, 53)
    # bus stop with mosaic
    s.rect(8, 48, 70, 6, "stone_light")
    s.rect(8, 54, 70, 2, "stone_dark")
    s.rect(12, 56, 62, 40, "stone")
    s.gradient(15, 59, 56, 28, ["blue_light", "blue"])
    s.shaded_ellipse(43, 72, 9, 9, ["yellow_dark", "yellow", "yellow_light"])
    for x in range(15, 71):
        y = 78 + round(math.sin(x * 0.4) * 2)
        s.rect(x, y, 1, 87 - y, "blue_dark")
    for x in range(15, 71, 4):
        for y in range(59, 87, 4):
            s.px(x, y, (255, 255, 255, 50))
    s.rect(12, 96, 62, 2, (0, 0, 0, 80))
    tall_grass(s, 112, 54, 100)
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
    sky(["sky_top", "sky_mid", "sky_haze", "yellow_light"]).save(f"{out}/sky_warm.png")
    yard().save(f"{out}/yard.png")
    clouds_layer().save(f"{out}/clouds.png")
    shop_interior().save(f"{out}/shop.png")
    shop_counter().save(f"{out}/shop_counter.png")
    street().save(f"{out}/street.png")
    well_background().save(f"{out}/well.png")
    well_front().save(f"{out}/well_front.png")
    strip([crank(f) for f in range(4)]).save(f"{out}/crank.png")
    strip([bucket(False), bucket(True)]).save(f"{out}/bucket.png")
    garden().save(f"{out}/garden.png")
    beetle_big().save(f"{out}/beetle.png")
    strip([hand(False), hand(True)]).save(f"{out}/hand.png")
    jar().save(f"{out}/jar.png")
    title().save(f"{out}/title.png")
    marshrutka().save(f"{out}/marshrutka.png")
    groceries().save(f"{out}/groceries.png")
