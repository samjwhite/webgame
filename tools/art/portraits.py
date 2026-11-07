"""Large dialog portraits, 64x80. Frames: normal, blink, talking."""

import math
from lib import Sprite, strip

SKIN = ["skin_dark", "skin_shade", "skin", "skin"]
OLD_SKIN = ["skin_dark", "skin_shade", "skin_shade", "skin"]


def torso(s, colors, collar=None):
    s.shaded_ellipse(32, 92, 30, 30, colors, light=(-0.7, -0.6))
    s.rect(27, 54, 10, 10, "skin_shade")
    if collar:
        s.rect(24, 60, 16, 4, collar)


def eyes(s, y, blink, iris="outline", lashes=False, shadow=None):
    for x in (24, 40):
        if shadow:
            s.rect(x - 3, y - 3, 7, 2, shadow)
        if blink:
            s.rect(x - 3, y, 7, 1, "skin_dark")
            continue
        s.rect(x - 3, y - 1, 7, 3, "white")
        s.rect(x - 1, y - 1, 3, 3, iris)
        s.px(x, y, "outline")
        s.px(x - 1, y - 1, "white")
        s.rect(x - 3, y - 2, 7, 1, "outline")
        if lashes:
            s.px(x - 4, y - 2, "outline")
            s.px(x + 4, y - 2, "outline")


def brows(s, y, color, raised=0):
    s.rect(20, y - raised, 8, 2, color)
    s.rect(37, y - raised, 8, 2, color)


def nose(s, y):
    s.rect(33, y - 6, 1, 6, "skin_shade")
    s.rect(30, y, 5, 2, "skin_shade")
    s.px(30, y, "skin_dark")
    s.px(34, y, "skin_dark")


def mouth(s, y, talking, lips="red_dark", width=8):
    x = 32 - width // 2
    if talking:
        s.rect(x + 1, y - 1, width - 2, 4, "outline")
        s.rect(x + 2, y + 1, width - 4, 2, "red")
        s.rect(x + 2, y - 1, width - 4, 1, "white")
    else:
        s.rect(x, y, width, 1, lips)
        s.px(x - 1, y - 1, lips)
        s.px(x + width, y - 1, lips)


def blush(s, y):
    for x in (19, 41):
        s.rect(x, y, 5, 2, "blush")


def grandma(frame):
    s = Sprite(64, 80)
    torso(s, ["purple_dark", "purple", "purple_light"])
    # apron straps and embroidered collar
    s.rect(18, 66, 6, 14, "white")
    s.rect(40, 66, 6, 14, "white")
    for x in range(24, 41, 3):
        s.px(x, 63, "red")
    s.shaded_ellipse(32, 36, 17, 20, OLD_SKIN)
    # wrinkles
    for x in (17, 45):
        s.px(x, 42, "skin_dark")
    s.rect(20, 46, 3, 1, "skin_shade")
    s.rect(42, 46, 3, 1, "skin_shade")
    eyes(s, 38, frame == 1, iris="blue_dark")
    brows(s, 33, "gray")
    nose(s, 46)
    blush(s, 44)
    mouth(s, 51, frame == 2, lips="red_dark", width=10)
    # red flowered headscarf
    s.shaded_ellipse(32, 22, 23, 15, ["red_dark", "red", "red_light"])
    s.rect(9, 22, 7, 30, "red")
    s.rect(9, 22, 2, 30, "red_light")
    s.rect(48, 22, 7, 30, "red_dark")
    s.shaded_ellipse(32, 33, 15, 8, OLD_SKIN)
    # flowers on the scarf
    for fx, fy in ((20, 14), (34, 10), (46, 18), (12, 34), (52, 40), (28, 18)):
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            s.px(fx + dx, fy + dy, "yellow_light" if fx % 2 else "white")
        s.px(fx, fy, "leaf_mid")
    # knot under the chin
    s.shaded_ellipse(32, 60, 6, 3, ["red_dark", "red", "red_light"])
    s.rect(26, 61, 3, 7, "red")
    s.rect(36, 61, 3, 7, "red_dark")
    eyes(s, 38, frame == 1, iris="blue_dark")
    brows(s, 33, "gray")
    s.outline()
    return s


def valya(frame):
    s = Sprite(64, 80)
    # big permed hair behind the head
    for cx, cy, r in ((14, 30, 9), (50, 30, 9), (12, 46, 8), (52, 46, 8), (16, 58, 7), (48, 58, 7)):
        s.shaded_ellipse(cx, cy, r, r, ["yellow_dark", "yellow", "yellow_light"])
    torso(s, ["red_dark", "red", "red_light"], collar="white")
    s.rect(20, 68, 24, 12, "blue_light")
    s.rect(20, 68, 24, 1, "white")
    s.shaded_ellipse(32, 38, 16, 19, SKIN)
    eyes(s, 39, frame == 1, iris="blue", lashes=True, shadow="blue_light")
    brows(s, 33, "yellow_dark", raised=1)
    nose(s, 47)
    blush(s, 45)
    mouth(s, 52, frame == 2, lips="red", width=8)
    if frame != 2:
        s.rect(28, 52, 8, 1, "red")
        s.rect(29, 53, 6, 1, "red_dark")
    # golden earrings
    s.shaded_ellipse(15, 50, 2, 2, ["yellow_dark", "yellow", "yellow_light"])
    s.shaded_ellipse(49, 50, 2, 2, ["yellow_dark", "yellow", "yellow_light"])
    # curls on top
    for cx, cy, r in ((20, 18, 8), (32, 14, 9), (44, 18, 8), (14, 26, 6), (50, 26, 6), (26, 22, 5), (38, 22, 5)):
        s.shaded_ellipse(cx, cy, r, r, ["yellow_dark", "yellow", "yellow_light"])
    s.outline()
    return s


def grandpa(frame):
    s = Sprite(64, 80)
    torso(s, ["wood_dark", "soil", "soil_light"])
    s.rect(26, 60, 12, 20, "white")
    s.rect(31, 60, 2, 20, "gray_light")
    s.rect(22, 62, 6, 18, "soil_light")
    s.rect(36, 62, 6, 18, "soil")
    # medal on the jacket
    s.rect(44, 66, 3, 3, "red")
    s.shaded_ellipse(45.5, 71, 2.5, 2.5, ["yellow_dark", "yellow", "yellow_light"])
    s.shaded_ellipse(32, 38, 16, 19, OLD_SKIN)
    s.rect(15, 26, 4, 14, "gray_light")
    s.rect(45, 26, 4, 14, "gray_light")
    eyes(s, 39, frame == 1, iris="wood_dark")
    brows(s, 33, "gray_light")
    s.rect(19, 32, 10, 2, "white")
    s.rect(36, 32, 10, 2, "white")
    nose(s, 47)
    s.rect(29, 47, 7, 3, "skin_shade")
    blush(s, 45)
    mouth(s, 53, frame == 2, lips="skin_dark", width=8)
    # grey moustache
    s.shaded_ellipse(28, 50, 5, 2, ["gray", "gray_light", "white"])
    s.shaded_ellipse(37, 50, 5, 2, ["gray", "gray_light", "white"])
    # flat cap
    s.shaded_ellipse(32, 22, 19, 9, ["gray_dark", "gray", "gray_light"])
    s.rect(13, 24, 38, 4, "gray")
    s.rect(14, 28, 36, 3, "gray_dark")
    s.rect(30, 14, 4, 2, "gray_light")
    s.outline()
    return s


def build(out):
    strip([grandma(f) for f in range(3)]).save(f"{out}/grandma.png")
    strip([valya(f) for f in range(3)]).save(f"{out}/valya.png")
    strip([grandpa(f) for f in range(3)]).save(f"{out}/grandpa.png")
