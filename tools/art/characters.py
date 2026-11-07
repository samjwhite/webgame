"""Walking characters for the top-down world: 16x24 frames, rows = down, left, right, up."""

from lib import Sprite, grid

SKIN = ["skin_dark", "skin_shade", "skin"]

PEOPLE = {
    "player": {
        "hair": ["wood_dark", "wood", "wood_light"], "style": "short",
        "top": ["blue_dark", "blue", "blue_light"], "stripes": "white",
        "legs": ["outline", "blue_dark", "blue"], "shoes": "white", "skirt": False,
    },
    "grandma": {
        "hair": ["red_dark", "red", "red_light"], "style": "scarf",
        "top": ["purple_dark", "purple", "purple_light"], "apron": "white",
        "legs": ["purple_dark", "purple", "purple_light"], "shoes": "outline", "skirt": True,
    },
    "valya": {
        "hair": ["yellow_dark", "yellow", "yellow_light"], "style": "perm",
        "top": ["red_dark", "red", "red_light"], "apron": "blue_light",
        "legs": ["outline", "gray_dark", "gray"], "shoes": "outline", "skirt": True,
    },
    "grandpa": {
        "hair": ["gray_dark", "gray", "gray_light"], "style": "cap",
        "top": ["wood_dark", "soil", "soil_light"],
        "legs": ["outline", "gray_dark", "gray"], "shoes": "outline", "skirt": False,
    },
}


def body(s, p, direction, frame):
    bob = 1 if frame else 0
    top = p["top"]
    legs = p["legs"]

    # legs and feet
    if p["skirt"]:
        s.rect(4, 17 + bob, 8, 4, legs[1])
        s.rect(4, 17 + bob, 2, 4, legs[2])
        s.rect(10, 17 + bob, 2, 4, legs[0])
        feet = [(5, 21), (9, 21)]
        if frame == 1:
            feet = [(5, 21), (9, 20)]
        if frame == 2:
            feet = [(5, 20), (9, 21)]
        for fx, fy in feet:
            s.rect(fx, fy + bob, 2, 2, p["shoes"])
    else:
        if direction in ("down", "up"):
            left_len = 4 - (1 if frame == 1 else 0)
            right_len = 4 - (1 if frame == 2 else 0)
            s.rect(5, 17 + bob, 3, left_len, legs[1])
            s.rect(8, 17 + bob, 3, right_len, legs[2])
            s.rect(5, 17 + bob + left_len, 3, 1, p["shoes"])
            s.rect(8, 17 + bob + right_len, 3, 1, p["shoes"])
            if p.get("stripes"):
                s.rect(5, 17 + bob, 1, left_len, p["stripes"])
                s.rect(10, 17 + bob, 1, right_len, p["stripes"])
        else:
            spread = [0, 2, -2][frame]
            s.rect(7 - spread // 2, 17 + bob, 3, 4, legs[1])
            s.rect(7 + spread // 2, 17 + bob, 3, 4, legs[2])
            s.rect(6 - spread // 2, 21 + bob, 3, 1, p["shoes"])
            s.rect(6 + spread // 2, 21 + bob, 3, 1, p["shoes"])

    # torso
    if direction in ("down", "up"):
        s.rect(4, 11 + bob, 8, 7, top[1])
        s.rect(4, 11 + bob, 2, 7, top[2])
        s.rect(10, 11 + bob, 2, 7, top[0])
        swing = [0, 1, -1][frame]
        s.rect(3, 12 + bob + swing, 1, 5, top[1])
        s.rect(12, 12 + bob - swing, 1, 5, top[0])
        s.px(3, 17 + bob + swing, "skin")
        s.px(12, 17 + bob - swing, "skin_shade")
        if p.get("stripes"):
            s.rect(3, 12 + bob + swing, 1, 5, p["stripes"])
            s.rect(12, 12 + bob - swing, 1, 5, p["stripes"])
        if p.get("apron") and direction == "down":
            s.rect(6, 13 + bob, 4, 7, p["apron"])
            s.rect(6, 13 + bob, 4, 1, "white")
        if p.get("stripes") and direction == "down":
            s.rect(7, 12 + bob, 2, 5, "white")
            s.px(7, 12 + bob, top[1])
    else:
        s.rect(5, 11 + bob, 6, 7, top[1])
        s.rect(5, 11 + bob, 2, 7, top[2])
        s.rect(10, 11 + bob, 1, 7, top[0])
        swing = [0, 2, -2][frame]
        s.rect(7 + swing // 2, 12 + bob, 2, 5, top[0])
        s.px(7 + swing // 2, 17 + bob, "skin_shade")
        if p.get("apron"):
            s.rect(4, 13 + bob, 2, 7, p["apron"])
        if p.get("stripes"):
            s.rect(7 + swing // 2, 12 + bob, 1, 5, p["stripes"])


def head(s, p, direction, frame):
    bob = 1 if frame else 0
    hair = p["hair"]
    cy = 6 + bob
    s.shaded_ellipse(8, cy, 5, 5, SKIN)
    style = p["style"]

    if direction == "up":
        s.shaded_ellipse(8, cy - 0.5, 5.2, 5.2, hair)
    else:
        # hair or headwear on top
        if style == "scarf":
            s.shaded_ellipse(8, cy - 1, 5.5, 5, hair)
            if direction == "down":
                s.ellipse(8, cy + 1.5, 3.5, 3, "skin")
                s.rect(6, cy + 4, 4, 2, hair[1])
                s.px(5, cy - 2, "white")
                s.px(10, cy - 3, "yellow")
                s.px(8, cy - 4, "white")
            else:
                s.ellipse(6, cy + 1.5, 3, 3, "skin")
                s.rect(9, cy + 3, 3, 3, hair[1])
                s.px(10, cy - 2, "white")
                s.px(7, cy - 4, "yellow")
        elif style == "perm":
            for x, y in ((4, cy - 3), (7, cy - 5), (11, cy - 3), (3, cy), (12, cy), (9, cy - 5)):
                s.shaded_ellipse(x + 0.5, y + 0.5, 2.5, 2.5, hair)
            if direction == "down":
                s.shaded_ellipse(8, cy + 1.5, 3.5, 3, SKIN)
            else:
                s.shaded_ellipse(6, cy + 1.5, 3, 3, SKIN)
        elif style == "cap":
            s.shaded_ellipse(8, cy - 3, 5.5, 3, hair)
            if direction == "down":
                s.rect(4, cy - 1, 8, 1, hair[0])
            elif direction == "left":
                s.rect(1, cy - 1, 6, 1, hair[0])
        else:
            s.shaded_ellipse(8, cy - 2, 5.2, 3.6, hair)
            if direction == "down":
                s.rect(4, cy - 2, 2, 3, hair[1])
                s.rect(10, cy - 2, 2, 3, hair[0])
                s.px(7, cy - 1, hair[1])
                s.px(9, cy - 1, hair[1])
            elif direction == "left":
                s.rect(8, cy - 2, 5, 5, hair[1])
                s.rect(11, cy - 1, 2, 4, hair[0])

        # face
        eye = "outline"
        if direction == "down":
            s.px(6, cy + 1, eye)
            s.px(10, cy + 1, eye)
            s.px(5, cy + 3, "blush")
            s.px(11, cy + 3, "blush")
            if style == "cap":
                s.rect(6, cy + 3, 5, 1, "gray_light")
        elif direction == "left":
            s.px(5, cy + 1, eye)
            s.px(3, cy + 2, "skin_shade")
            s.px(5, cy + 3, "blush")
            if style == "cap":
                s.rect(3, cy + 3, 3, 1, "gray_light")


def frame_sprite(p, direction, frame):
    s = Sprite(16, 24)
    s.ellipse(8, 22.5, 5, 1.5, (0, 0, 0, 70))
    draw_dir = "left" if direction == "right" else direction
    figure = Sprite(16, 24)
    body(figure, p, draw_dir, frame)
    head(figure, p, draw_dir, frame)
    figure.outline()
    if direction == "right":
        figure = figure.mirrored()
    s.blit(figure, 0, 0)
    return s


def build(out):
    for name, p in PEOPLE.items():
        rows = [[frame_sprite(p, d, f) for f in range(3)] for d in ("down", "left", "right", "up")]
        grid(rows).save(f"{out}/{name}.png")
