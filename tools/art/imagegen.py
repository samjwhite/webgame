"""Generate or edit source artwork with OpenAI's GPT Image API.

Every result is a *candidate*: it is saved under tools/art/reference/generated/
with a metadata file next to it and never overwrites an existing file.
Use promote.py (after human approval) to turn a candidate into a reference asset.

Usage:
  python3 tools/art/imagegen.py generate NAME "what to draw" [options]
  python3 tools/art/imagegen.py edit NAME "what to change" --image tools/art/reference/well_scene.png [options]
  python3 tools/art/imagegen.py inspect tools/art/reference/generated/NAME.png

The API key is read from the OPENAI_API_KEY environment variable or from
tools/art/.env.local (one line: OPENAI_API_KEY=...). That file is ignored by Git.
"""

import argparse
import base64
import datetime
import json
import mimetypes
import os
import sys
import urllib.error
import urllib.request
import uuid

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
GENERATED = os.path.join(HERE, "reference", "generated")
STYLE_FILE = os.path.join(HERE, "style_prompt.txt")
ENV_FILE = os.path.join(HERE, ".env.local")
API = "https://api.openai.com/v1/images"

# Current GPT Image models. Older models (gpt-image-1, gpt-image-1-mini, gpt-image-1.5, dall-e-*)
# are deprecated or retiring and are refused on purpose.
MODELS = ["gpt-image-2.5-sunburst", "gpt-image-2.5-flare"]
DEFAULT_MODEL = "gpt-image-2.5-sunburst"

# Published USD prices per 1M tokens, used to estimate the cost of each call from its usage.
# Check https://openai.com/api/pricing/ if OpenAI changes them.
PRICE_PER_MILLION = {
    "text_input": 5.00,
    "image_input": 8.00,
    "cached_image_input": 2.00,
    "image_output": 30.00,
}


def read_api_key():
    key = os.environ.get("OPENAI_API_KEY")
    if not key and os.path.exists(ENV_FILE):
        with open(ENV_FILE, encoding="utf-8") as f:
            for line in f:
                name, _, value = line.strip().partition("=")
                if name == "OPENAI_API_KEY":
                    key = value.strip().strip('"')
    if not key:
        sys.exit("No API key: set OPENAI_API_KEY or put OPENAI_API_KEY=... in tools/art/.env.local")
    return key


def style_text():
    with open(STYLE_FILE, encoding="utf-8") as f:
        return f.read().strip()


def full_prompt(request, use_style):
    if not use_style:
        return request
    return f"{style_text()}\n\nAsset to create:\n{request}"


def free_path(name):
    """A path in generated/ that does not exist yet: NAME.png, NAME-2.png, NAME-3.png..."""
    os.makedirs(GENERATED, exist_ok=True)
    base = os.path.join(GENERATED, name)
    path = base + ".png"
    number = 2
    while os.path.exists(path):
        path = f"{base}-{number}.png"
        number += 1
    return path


def post_json(url, body, key):
    request = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    )
    return send(request)


def post_multipart(url, fields, files, key):
    """fields: {name: value}; files: list of (field name, file path)."""
    boundary = uuid.uuid4().hex
    parts = []
    for name, value in fields.items():
        parts.append(
            f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode("utf-8")
        )
    for field, path in files:
        mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
        with open(path, "rb") as f:
            data = f.read()
        header = (
            f'--{boundary}\r\nContent-Disposition: form-data; name="{field}"; '
            f'filename="{os.path.basename(path)}"\r\nContent-Type: {mime}\r\n\r\n'
        )
        parts.append(header.encode("utf-8") + data + b"\r\n")
    parts.append(f"--{boundary}--\r\n".encode("utf-8"))
    request = urllib.request.Request(
        url,
        data=b"".join(parts),
        headers={"Authorization": f"Bearer {key}", "Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    return send(request)


def send(request):
    try:
        with urllib.request.urlopen(request, timeout=600) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        sys.exit(f"OpenAI API error {error.code}: {error.read().decode('utf-8', 'replace')}")
    except urllib.error.URLError as error:
        sys.exit(f"Cannot reach the OpenAI API: {error.reason}")


def estimate_cost(usage):
    """USD estimate from the token usage the API returns, or None when no usage is given."""
    if not usage:
        return None
    details = usage.get("input_tokens_details") or {}
    image_in = details.get("image_tokens", 0)
    text_in = details.get("text_tokens", usage.get("input_tokens", 0) - image_in)
    cached = details.get("cached_tokens", 0)
    out = usage.get("output_tokens", 0)
    cost = (
        text_in * PRICE_PER_MILLION["text_input"]
        + (image_in - cached) * PRICE_PER_MILLION["image_input"]
        + cached * PRICE_PER_MILLION["cached_image_input"]
        + out * PRICE_PER_MILLION["image_output"]
    ) / 1_000_000
    return round(cost, 5)


def describe(path):
    """Facts Claude Code checks before using an image: size, mode, transparency, content box."""
    img = Image.open(path)
    info = {"path": os.path.relpath(path, ROOT), "size": list(img.size), "mode": img.mode}
    if img.mode in ("RGBA", "LA") or "transparency" in img.info:
        alpha = img.convert("RGBA").getchannel("A")
        info["has_transparency"] = alpha.getextrema()[0] < 255
        info["opaque_box"] = list(alpha.point(lambda a: 255 if a > 0 else 0).getbbox() or [])
    else:
        info["has_transparency"] = False
    info["colors_sampled"] = len(img.convert("RGB").resize((128, 128)).getcolors(128 * 128) or [])
    return info


def save_results(response, name, metadata):
    saved = []
    for item in response.get("data", []):
        path = free_path(name)
        with open(path, "wb") as f:
            f.write(base64.b64decode(item["b64_json"]))
        meta = dict(metadata, output=describe(path))
        if item.get("revised_prompt"):
            meta["revised_prompt"] = item["revised_prompt"]
        with open(path[:-4] + ".json", "w", encoding="utf-8") as f:
            json.dump(meta, f, ensure_ascii=False, indent=2)
        saved.append(path)
    return saved


def run(args):
    if args.model not in MODELS:
        sys.exit(f"Model {args.model} is not supported here. Use one of: {', '.join(MODELS)}")
    prompt = full_prompt(args.request, not args.no_style)
    options = {"size": args.size, "quality": args.quality, "background": args.background,
               "output_format": "png", "n": args.n}
    metadata = {
        "created": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        "mode": args.command,
        "model": args.model,
        "user_request": args.request,
        "prompt": prompt,
        "options": options,
        "input_images": [os.path.relpath(p, ROOT) for p in (args.image or [])],
        "mask": os.path.relpath(args.mask, ROOT) if args.mask else None,
        "status": "candidate — needs human review before it replaces any asset",
    }

    if args.dry_run:
        print(json.dumps(metadata, ensure_ascii=False, indent=2))
        return

    key = read_api_key()
    if args.command == "generate":
        response = post_json(f"{API}/generations", {"model": args.model, "prompt": prompt, **options}, key)
    else:
        files = [("image[]", path) for path in args.image]
        if args.mask:
            files.append(("mask", args.mask))
        fields = {"model": args.model, "prompt": prompt, **{k: str(v) for k, v in options.items()}}
        response = post_multipart(f"{API}/edits", fields, files, key)

    metadata["usage"] = response.get("usage")
    metadata["estimated_cost_usd"] = estimate_cost(response.get("usage"))
    for path in save_results(response, args.name, metadata):
        print(f"saved {os.path.relpath(path, ROOT)}")
    print(f"usage: {json.dumps(metadata['usage'])}")
    print(f"estimated cost: ${metadata['estimated_cost_usd']}")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    commands = parser.add_subparsers(dest="command", required=True)

    for command in ("generate", "edit"):
        sub = commands.add_parser(command)
        sub.add_argument("name", help="short file name for the candidate, e.g. well_scene_dusk")
        sub.add_argument("request", help="what to draw or change, in plain words")
        sub.add_argument("--model", default=DEFAULT_MODEL, help=f"one of {', '.join(MODELS)}")
        sub.add_argument("--size", default="1536x1024", help="e.g. 1024x1024, 1536x1024, 1024x1536 or auto")
        sub.add_argument("--quality", default="medium", help="low, medium, high or auto")
        sub.add_argument("--background", default="auto", help="auto, opaque or transparent")
        sub.add_argument("--n", type=int, default=1, help="number of candidates")
        sub.add_argument("--no-style", action="store_true", help="do not prepend tools/art/style_prompt.txt")
        sub.add_argument("--dry-run", action="store_true", help="print the request without calling the API")
        if command == "edit":
            sub.add_argument("--image", action="append", required=True, help="input/reference image (repeatable)")
            sub.add_argument("--mask", help="PNG mask: transparent pixels mark the area to repaint")
        else:
            sub.add_argument("--image", action="append", help=argparse.SUPPRESS)
            sub.add_argument("--mask", help=argparse.SUPPRESS)

    inspect = commands.add_parser("inspect", help="print size, transparency and colours of an image")
    inspect.add_argument("path")

    args = parser.parse_args()
    if args.command == "inspect":
        print(json.dumps(describe(args.path), indent=2))
        return
    if args.command == "generate" and args.image:
        sys.exit("Reference images go with the edit command: imagegen.py edit NAME \"...\" --image PATH")
    run(args)


if __name__ == "__main__":
    main()
