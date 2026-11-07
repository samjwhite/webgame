"""Regenerate all game art into ../../art. Run: python3 tools/art/build.py"""

import os
import characters
import reference
import scenes
import world

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "art")

for folder, module in (("world", world), ("characters", characters), ("scenes", scenes)):
    path = os.path.join(ROOT, folder)
    os.makedirs(path, exist_ok=True)
    module.build(path)
    print("built", folder)

os.makedirs(os.path.join(ROOT, "ui"), exist_ok=True)
reference.build(os.path.join(ROOT, "scenes"), os.path.join(ROOT, "world"), os.path.join(ROOT, "ui"))
print("built reference art")
