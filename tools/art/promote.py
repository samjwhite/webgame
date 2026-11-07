"""Review a generated candidate and, only after human approval, make it a reference asset.

  python3 tools/art/promote.py tools/art/reference/generated/NAME.png TARGET.png
      Makes a side-by-side comparison with the current tools/art/reference/TARGET.png
      (if there is one) and prints both images' facts. Changes nothing.

  python3 tools/art/promote.py tools/art/reference/generated/NAME.png TARGET.png --approve
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

from imagegen import ROOT, describe

REFERENCE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reference")
REVIEW = os.path.join(REFERENCE, "generated", "review")
REPLACED = os.path.join(REFERENCE, "replaced")


def comparison(old_path, new_path, out_path):
    images = [Image.open(p).convert("RGBA") for p in (old_path, new_path) if p]
    height = 512
    scaled = [img.resize((round(img.width * height / img.height), height)) for img in images]
    sheet = Image.new("RGBA", (sum(i.width for i in scaled) + 16 * (len(scaled) + 1), height + 32), (38, 34, 47, 255))
    x = 16
    for img in scaled:
        sheet.alpha_composite(img, (x, 16))
        x += img.width + 16
    sheet.save(out_path)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("candidate", help="a PNG in tools/art/reference/generated/")
    parser.add_argument("target", help="file name to create or replace in tools/art/reference/")
    parser.add_argument("--approve", action="store_true", help="the human approved this replacement")
    args = parser.parse_args()

    candidate = os.path.abspath(args.candidate)
    if not os.path.exists(candidate):
        sys.exit(f"No such candidate: {args.candidate}")
    target_name = os.path.basename(args.target)
    target = os.path.join(REFERENCE, target_name)
    old = target if os.path.exists(target) else None

    if not args.approve:
        os.makedirs(REVIEW, exist_ok=True)
        out = os.path.join(REVIEW, os.path.splitext(target_name)[0] + "-compare.png")
        comparison(old, candidate, out)
        report = {"current": describe(old) if old else None, "candidate": describe(candidate),
                  "comparison": os.path.relpath(out, ROOT)}
        print(json.dumps(report, ensure_ascii=False, indent=2))
        print("Nothing changed. Show the comparison to the human; rerun with --approve only after they approve.")
        return

    if old:
        os.makedirs(REPLACED, exist_ok=True)
        stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
        backup = os.path.join(REPLACED, f"{os.path.splitext(target_name)[0]}-{stamp}.png")
        shutil.copy2(old, backup)
        print(f"backed up old asset to {os.path.relpath(backup, ROOT)}")
    shutil.copy2(candidate, target)

    meta_path = candidate[:-4] + ".json"
    if os.path.exists(meta_path):
        with open(meta_path, encoding="utf-8") as f:
            meta = json.load(f)
        meta["status"] = f"approved by the human and promoted to tools/art/reference/{target_name}"
        meta["promoted"] = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")
        with open(os.path.join(REFERENCE, os.path.splitext(target_name)[0] + ".meta.json"), "w", encoding="utf-8") as f:
            json.dump(meta, f, ensure_ascii=False, indent=2)
    print(f"promoted to {os.path.relpath(target, ROOT)}")


if __name__ == "__main__":
    main()
