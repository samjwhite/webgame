"""Regenerate all game art into ../../art. Run: python3 tools/art/build.py"""

import os
import animals
import locations
import reference
import world

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "art")

os.makedirs(os.path.join(ROOT, "scenes"), exist_ok=True)
os.makedirs(os.path.join(ROOT, "world"), exist_ok=True)
world.build(os.path.join(ROOT, "world"))
print("built world")

os.makedirs(os.path.join(ROOT, "ui"), exist_ok=True)
ICONS = os.path.join(ROOT, "..", "icons")
reference.build(os.path.join(ROOT, "scenes"), os.path.join(ROOT, "world"), os.path.join(ROOT, "ui"), ICONS)
reference.portraits(os.path.join(ROOT, "portraits"))
print("built reference art")

locations.build(os.path.join(ROOT, "world"))
print("built locations")

animals.build(os.path.join(ROOT, "world"))
print("built animals")
