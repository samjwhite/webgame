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

reference.build(os.path.join(ROOT, "scenes"), os.path.join(ROOT, "world"))
print("built reference art")
