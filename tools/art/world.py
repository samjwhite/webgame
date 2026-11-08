"""Small world sprites drawn in code: cat, butterflies, beetles, crates.

They are drawn at game size and saved RES times larger with hard pixel edges (lib.upscale)."""

from lib import Sprite, strip, upscale

LEAVES = ["leaf_dark", "leaf", "leaf_mid", "leaf_light"]


def save(sprite, path):
    """Save a sprite drawn at game size as a file RES times larger, pixel for pixel."""
    upscale(sprite.img).save(path)


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
    save(strip([cat(0), cat(1)]), f"{out}/cat.png")
    save(strip([butterfly(0), butterfly(1)]), f"{out}/butterfly.png")
    save(beetle_small(), f"{out}/beetle.png")
    save(crate(), f"{out}/crate.png")
