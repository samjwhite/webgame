"""Regenerate all game art into ../../art. Run: python3 tools/art/build.py"""

import os
import grandpa
import reference
import scenes
import world

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "art")

for folder, module in (("world", world), ("scenes", scenes)):
    path = os.path.join(ROOT, folder)
    os.makedirs(path, exist_ok=True)
    module.build(path)
    print("built", folder)

os.makedirs(os.path.join(ROOT, "ui"), exist_ok=True)
ICONS = os.path.join(ROOT, "..", "icons")
reference.build(os.path.join(ROOT, "scenes"), os.path.join(ROOT, "world"), os.path.join(ROOT, "ui"), ICONS)
print("built reference art")

# Grandpa is repainted from the hero's idle frames, so this runs after the hero is built.
grandpa.build(os.path.join(ROOT, "world", "hero_city.png"), os.path.join(ROOT, "world", "grandpa.png"))
print("built grandpa")
