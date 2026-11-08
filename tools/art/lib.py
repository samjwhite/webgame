"""Small pixel art toolkit used by the art scripts. Run build.py to regenerate art/."""

import math
import random
from PIL import Image

# Art files are RES times finer than the game's pixels: a person 40 game pixels tall is 120 pixels in
# the file. Positions, walls and sizes in the game stay in game pixels; js/assets.js (ART_RES) draws
# every file at 1/RES of its size. Pictures made from large sources keep RES times more of their detail.
RES = 3
# Dark outlines around sprites, in file pixels: finer than one game pixel, still clear on a phone.
OUTLINE = 2


def upscale(img):
    """Pixel art drawn at game size, made RES times larger with hard pixel edges."""
    return img.resize((img.width * RES, img.height * RES), Image.Resampling.NEAREST)

PAL = {
    "outline": "#2a1d17",
    "sky_top": "#6fb3e0", "sky_mid": "#a9d4ea", "sky_haze": "#f4e4c1",
    "cloud": "#fdfbf4", "cloud_shade": "#d6e2ea",
    "grass_dark": "#3d6b35", "grass": "#5e9442", "grass_mid": "#79ad4f",
    "grass_light": "#a3c95e", "grass_sun": "#c9dc79",
    "leaf_dark": "#24452a", "leaf": "#366b34", "leaf_mid": "#4f8a3c", "leaf_light": "#7cb24a",
    "soil_dark": "#4a2f20", "soil": "#6b4530", "soil_light": "#8a5d3c",
    "road_dark": "#9a7650", "road": "#b8936a", "road_light": "#d2b285",
    "wood_dark": "#4a2e1c", "wood": "#7a4f2d", "wood_light": "#a8774a",
    "wall": "#f3eee0", "wall_shade": "#d9d0bc", "wall_dark": "#b5aa94",
    "blue": "#3d6fb6", "blue_light": "#6b9bd8", "blue_dark": "#284b80",
    "glass_dark": "#2c4a66", "glass": "#4f7a9a", "glass_shine": "#b9dcef",
    "slate": "#8f9a92", "slate_dark": "#6c766f", "slate_light": "#b0b9b0",
    "red": "#c4473a", "red_dark": "#8e2f28", "red_light": "#e2735c",
    "yellow": "#f0c64a", "yellow_dark": "#c8952e", "yellow_light": "#f8e08a",
    "skin": "#f1c6a0", "skin_shade": "#d39c78", "skin_dark": "#a8714f", "blush": "#e8968a",
    "water_dark": "#2f6a8a", "water": "#3f89a8", "water_light": "#6fb6c9", "water_shine": "#c4ecef",
    "stone": "#a7a29a", "stone_dark": "#7b766f", "stone_light": "#c9c4ba",
    "white": "#fbf6ea", "black": "#1b1412",
    "purple": "#7a4a8c", "purple_dark": "#563366", "purple_light": "#9c6bb0",
    "gray": "#8a8a86", "gray_dark": "#5c5c5a", "gray_light": "#b8b8b2",
    "hay": "#d9b45a", "hay_dark": "#a9823a", "hay_light": "#efd58c",
    "pink": "#e9a0b4",
}

BAYER = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
]


def rgba(color):
    if color is None:
        return (0, 0, 0, 0)
    if isinstance(color, tuple):
        return color
    color = PAL.get(color, color)
    value = color.lstrip("#")
    return (int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16), 255)


def dither(x, y, amount):
    """True when the pixel should take the second color, for amount in 0..1."""
    return BAYER[y % 4][x % 4] < amount * 16


class Sprite:
    def __init__(self, width, height, background=None):
        self.w = width
        self.h = height
        self.img = Image.new("RGBA", (width, height), rgba(background))

    def px(self, x, y, color):
        x, y = int(x), int(y)
        if 0 <= x < self.w and 0 <= y < self.h:
            self.img.putpixel((x, y), rgba(color))

    def get(self, x, y):
        if 0 <= x < self.w and 0 <= y < self.h:
            return self.img.getpixel((x, y))
        return (0, 0, 0, 0)

    def rect(self, x, y, w, h, color):
        for yy in range(int(y), int(y + h)):
            for xx in range(int(x), int(x + w)):
                self.px(xx, yy, color)

    def ellipse(self, cx, cy, rx, ry, color):
        for yy in range(int(cy - ry - 1), int(cy + ry + 2)):
            for xx in range(int(cx - rx - 1), int(cx + rx + 2)):
                if ((xx + 0.5 - cx) / rx) ** 2 + ((yy + 0.5 - cy) / ry) ** 2 <= 1:
                    self.px(xx, yy, color)

    def shaded_ellipse(self, cx, cy, rx, ry, colors, light=(-0.6, -0.8)):
        """Fill an ellipse lit from the top-left. colors: dark -> light."""
        steps = len(colors) - 1
        for yy in range(int(cy - ry - 1), int(cy + ry + 2)):
            for xx in range(int(cx - rx - 1), int(cx + rx + 2)):
                nx = (xx + 0.5 - cx) / rx
                ny = (yy + 0.5 - cy) / ry
                d = nx * nx + ny * ny
                if d > 1:
                    continue
                nz = math.sqrt(1 - d)
                lit = max(0.0, nx * light[0] + ny * light[1] + nz * 0.55)
                level = min(steps, lit * steps * 1.15)
                base = int(level)
                frac = level - base
                index = base + 1 if base < steps and dither(xx, yy, frac) else base
                self.px(xx, yy, colors[index])

    def gradient(self, x, y, w, h, colors, vertical=True):
        """Dithered gradient through a list of colors."""
        length = h if vertical else w
        for i in range(int(length)):
            t = i / max(1, length - 1) * (len(colors) - 1)
            base = min(int(t), len(colors) - 2)
            frac = t - base
            for j in range(int(w if vertical else h)):
                xx = x + (j if vertical else i)
                yy = y + (i if vertical else j)
                self.px(xx, yy, colors[base + 1] if dither(xx, yy, frac) else colors[base])

    def speckle(self, x, y, w, h, colors, density, seed):
        rng = random.Random(seed)
        for _ in range(int(w * h * density)):
            self.px(x + rng.randrange(w), y + rng.randrange(h), rng.choice(colors))

    def blit(self, other, x, y):
        self.img.alpha_composite(other.img, (int(x), int(y)))

    def outline(self, color="outline"):
        """Draw a 1px outline around every opaque pixel."""
        src = self.img.copy()
        for yy in range(self.h):
            for xx in range(self.w):
                if src.getpixel((xx, yy))[3] > 0:
                    continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = xx + dx, yy + dy
                    if 0 <= nx < self.w and 0 <= ny < self.h and src.getpixel((nx, ny))[3] > 0:
                        self.px(xx, yy, color)
                        break

    def mirrored(self):
        copy = Sprite(self.w, self.h)
        copy.img = self.img.transpose(Image.FLIP_LEFT_RIGHT)
        return copy

    def save(self, path):
        self.img.save(path)


def strip(frames):
    """Join same-size frames side by side into one image."""
    sheet = Sprite(frames[0].w * len(frames), frames[0].h)
    for i, frame in enumerate(frames):
        sheet.blit(frame, i * frame.w, 0)
    return sheet


def grid(rows):
    """Join rows of frames into one sheet (rows top to bottom)."""
    fw, fh = rows[0][0].w, rows[0][0].h
    sheet = Sprite(fw * max(len(r) for r in rows), fh * len(rows))
    for r, frames in enumerate(rows):
        for c, frame in enumerate(frames):
            sheet.blit(frame, c * fw, r * fh)
    return sheet
