"""Regenerate all game art into ../../art. Run: python3 tools/art/build.py"""

import os
import animals
import locations
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
reference.portraits(os.path.join(ROOT, "portraits"))
print("built reference art")

locations.build(os.path.join(ROOT, "world"))
print("built locations")

animals.build(os.path.join(ROOT, "world"))
print("built animals")
