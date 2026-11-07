"""Regenerate all game art into ../../art. Run: python3 tools/art/build.py"""

import os
import characters
import portraits
import scenes
import world

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "art")

for folder, module in (("world", world), ("characters", characters), ("scenes", scenes), ("portraits", portraits)):
    path = os.path.join(ROOT, folder)
    os.makedirs(path, exist_ok=True)
    module.build(path)
    print("built", folder)
