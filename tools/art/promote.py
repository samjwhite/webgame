"""Review a generated candidate and, only after human approval, make it a reference asset.

  python tools/art/promote.py tools/art/reference/generated/NAME.png TARGET.png
      Makes a side-by-side comparison with the current tools/art/reference/TARGET.png
      (if there is one) as a new file and prints both images' facts. Changes no art.

  python tools/art/promote.py tools/art/reference/generated/NAME.png TARGET.png --approve
      Only after the human approved the comparison: backs up the old TARGET.png to
      tools/art/reference/replaced/, copies the candidate to tools/art/reference/TARGET.png
      and stores its generation metadata as TARGET.meta.json.
"""

import argparse
import datetime
import json
import os
import shutil
import sys

from PIL import Image

from codex_art import ROOT, describe, rel, save_new

REFERENCE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reference")
GENERATED = os.path.join(REFERENCE, "generated")
REVIEW = os.path.join(GENERATED, "review")
REPLACED = os.path.join(REFERENCE, "replaced")


def comparison(old_path, new_path, name):
    """Old and new side by side, saved under a new name in generated/review/."""
    images = [Image.open(p).convert("RGBA") for p in (old_path, new_path) if p]
    height = 512
    scaled = [img.resize((round(img.width * height / img.height), height)) for img in images]
    sheet = Image.new("RGBA", (sum(i.width for i in scaled) + 16 * (len(scaled) + 1), height + 32), (38, 34, 47, 255))
    x = 16
    for img in scaled:
        sheet.alpha_composite(img, (x, 16))
        x += img.width + 16
    temporary = os.path.join(GENERATED, f".{name}-compare-{os.getpid()}.tmp.png")
    sheet.save(temporary)
    try:
        return save_new(temporary, name + "-compare", REVIEW)
    finally:
        os.remove(temporary)


def backup(path, stamp):
    """Copy path into replaced/ under a new name. Never replaces an earlier backup."""
    os.makedirs(REPLACED, exist_ok=True)
    stem, extension = os.path.splitext(os.path.basename(path))
    number = 1
    while True:
        suffix = "" if number == 1 else f"-{number}"
        destination = os.path.join(REPLACED, f"{stem}-{stamp}{suffix}{extension}")
        try:
            with open(destination, "xb") as out, open(path, "rb") as source:
                shutil.copyfileobj(source, out)
            return destination
        except FileExistsError:
            number += 1


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("candidate", help="a PNG in tools/art/reference/generated/")
    parser.add_argument("target", help="file name to create or replace in tools/art/reference/")
    parser.add_argument("--approve", action="store_true", help="the human approved this replacement")
    args = parser.parse_args()

    candidate = os.path.abspath(args.candidate)
    if not os.path.isfile(candidate) or os.path.commonpath([candidate, GENERATED]) != GENERATED:
        sys.exit(f"Candidate must be an existing file in tools/art/reference/generated/: {args.candidate}")
    target_name = os.path.basename(args.target)
    if not target_name.lower().endswith(".png"):
        sys.exit("TARGET must be a .png file name.")
    target = os.path.join(REFERENCE, target_name)
    old = target if os.path.exists(target) else None
    stem = os.path.splitext(target_name)[0]

    if not args.approve:
        out = comparison(old, candidate, stem)
        report = {"current": describe(old) if old else None, "candidate": describe(candidate), "comparison": rel(out)}
        print(json.dumps(report, ensure_ascii=False, indent=2))
        print("No art changed. Show the comparison to the human; rerun with --approve only after they approve.")
        return

    stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    target_meta = os.path.join(REFERENCE, stem + ".meta.json")
    if old:
        print(f"backed up old asset to {rel(backup(old, stamp))}")
    if os.path.exists(target_meta):
        print(f"backed up old metadata to {rel(backup(target_meta, stamp))}")
    shutil.copy2(candidate, target)

    meta_path = candidate[:-4] + ".json"
    if os.path.exists(meta_path):
        with open(meta_path, encoding="utf-8") as f:
            meta = json.load(f)
        meta["status"] = f"approved by the human and promoted to tools/art/reference/{target_name}"
        meta["promoted"] = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")
        with open(target_meta, "w", encoding="utf-8") as f:
            json.dump(meta, f, ensure_ascii=False, indent=2)
    print(f"promoted to {rel(target)}")


if __name__ == "__main__":
    main()
