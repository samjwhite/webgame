"""Small animated world sprites drawn in code: animals, beetles, crates."""

from lib import Sprite, strip, dither

LEAVES = ["leaf_dark", "leaf", "leaf_mid", "leaf_light"]


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


def crate():
    s = Sprite(10, 8)
    s.rect(0, 0, 10, 8, "wood")
    s.rect(0, 0, 10, 1, "wood_light")
    s.rect(0, 4, 10, 1, "wood_dark")
    s.rect(4, 0, 1, 8, "wood_dark")
    s.outline()
    return s


def build(out):
    strip([chicken(f) for f in range(3)]).save(f"{out}/chicken.png")
    strip([cat(0), cat(1)]).save(f"{out}/cat.png")
    strip([butterfly(0), butterfly(1)]).save(f"{out}/butterfly.png")
    beetle_small().save(f"{out}/beetle.png")
    crate().save(f"{out}/crate.png")
