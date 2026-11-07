"""Draw candidate artwork with Codex CLI, using the human's ChatGPT login (no API key).

Every result is a *candidate*: it is saved under tools/art/reference/generated/ with a
metadata file next to it and never overwrites an existing file. Use promote.py (after
human approval) to turn a candidate into a reference asset.

Usage:
  python tools/art/codex_art.py generate NAME "what to draw" [--reference PATH ...] [--dry-run]
  python tools/art/codex_art.py inspect PATH

Codex runs read-only from an empty temporary folder, so it cannot change the repository.
Its image tool saves into the Codex image store, and this script copies the file from
there. Setup and limits: docs/CODEX_SETUP.md.
"""

import argparse
import datetime
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
REFERENCE = os.path.join(HERE, "reference")
GENERATED = os.path.join(REFERENCE, "generated")
BIBLE = os.path.join(ROOT, "docs", "ART_BIBLE.md")
TIMEOUT_SECONDS = 600
UNAVAILABLE = "IMAGE_TOOL_UNAVAILABLE"


def codex_home():
    return os.environ.get("CODEX_HOME") or os.path.join(os.path.expanduser("~"), ".codex")


def rel(path):
    return os.path.relpath(path, ROOT).replace(os.sep, "/")


def free_stem(name, folder=None):
    """A stem where neither .png nor .json exists yet: NAME, NAME-2, NAME-3..."""
    folder = folder or GENERATED
    stem, number = name, 2
    while os.path.exists(os.path.join(folder, stem + ".png")) or os.path.exists(os.path.join(folder, stem + ".json")):
        stem, number = f"{name}-{number}", number + 1
    return stem


def save_new(source, name, folder=None):
    """Copy source to a new NAME.png. Exclusive create, so an existing file can never be replaced."""
    folder = folder or GENERATED
    os.makedirs(folder, exist_ok=True)
    with open(source, "rb") as f:
        data = f.read()
    while True:
        path = os.path.join(folder, free_stem(name, folder) + ".png")
        try:
            with open(path, "xb") as f:
                f.write(data)
            return path
        except FileExistsError:
            continue


def describe(path):
    """Facts to check before using an image: size, mode, transparency, background corners."""
    img = Image.open(path)
    rgba = img.convert("RGBA")
    w, h = img.size
    corners = [rgba.getpixel(p) for p in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1))]
    info = {
        "path": rel(path),
        "format": img.format,
        "size": [w, h],
        "mode": img.mode,
        "has_transparency": rgba.getchannel("A").getextrema()[0] < 255,
        "corners": ["#%02x%02x%02x" % c[:3] if c[3] else "transparent" for c in corners],
    }
    return info


def references(paths):
    """Absolute paths of reference images; only files inside tools/art/reference/ are accepted."""
    result = []
    for path in paths or []:
        full = os.path.abspath(path)
        if os.path.commonpath([full, REFERENCE]) != REFERENCE or not os.path.isfile(full):
            sys.exit(f"Reference must be an existing file in tools/art/reference/: {path}")
        result.append(full)
    return result


def build_prompt(request, refs):
    with open(BIBLE, encoding="utf-8") as f:
        bible = f.read().strip()
    attached = "\n".join(f"- {os.path.basename(p)}" for p in refs) or "- none"
    return (
        "Use your built-in image generation tool exactly once to draw the asset below. Do not draw it with "
        "code, Pillow, SVG or any script. Do not run commands and do not create or change any file: the image "
        "tool's own output is collected automatically.\n"
        f"If no image generation tool is available, make no substitute: reply exactly {UNAVAILABLE} and stop.\n\n"
        f"# Art bible\n\n{bible}\n\n"
        f"# Attached reference images (match their style and keep their approved designs)\n\n{attached}\n\n"
        f"# Asset to draw\n\n{request}\n"
    )


def codex_command(codex, refs, workdir):
    command = [codex, "exec", "-C", workdir, "-s", "read-only", "--skip-git-repo-check",
               "--ignore-user-config", "--enable", "image_generation", "--json"]
    # --image takes several values, so the prompt goes through stdin rather than as a positional argument.
    for path in refs:
        command += ["--image", path]
    return command


def child_environment():
    """Keys are removed so Codex can only use the ChatGPT login and can never bill an API account."""
    return {k: v for k, v in os.environ.items() if k.upper() not in ("OPENAI_API_KEY", "CODEX_API_KEY")}


def find_codex():
    codex = shutil.which("codex")
    if not codex:
        sys.exit("Codex CLI not found. See docs/CODEX_SETUP.md.")
    return codex


def require_chatgpt_login(codex):
    done = subprocess.run([codex, "login", "status"], capture_output=True, encoding="utf-8", errors="replace",
                          stdin=subprocess.DEVNULL, env=child_environment())
    status = (done.stdout + done.stderr).strip()
    if "ChatGPT" not in status:
        sys.exit(f"Codex must be logged in with ChatGPT (run: codex login). It says: {status}")


def parse_events(stdout):
    """Thread id, token usage, agent messages and errors from the --json event stream."""
    result = {"thread_id": None, "usage": None, "messages": [], "errors": []}
    for line in stdout.splitlines():
        try:
            event = json.loads(line)
        except ValueError:
            continue
        kind, item = event.get("type"), event.get("item") or {}
        if kind == "thread.started":
            result["thread_id"] = event.get("thread_id")
        elif kind == "turn.completed":
            result["usage"] = event.get("usage")
        elif kind == "item.completed" and item.get("type") == "agent_message":
            result["messages"].append(item.get("text", ""))
        elif kind in ("error", "turn.failed"):
            result["errors"].append(event.get("message") or event.get("error"))
    return result


def stored_images(thread_id, home=None):
    folder = os.path.join(home or codex_home(), "generated_images", thread_id)
    if not os.path.isdir(folder):
        return []
    files = [os.path.join(folder, n) for n in os.listdir(folder) if n.lower().endswith(".png")]
    return sorted(files, key=os.path.getmtime)


def plan_facts(thread_id, home=None):
    """Plan and credits Codex recorded for this session. Reads only the rate-limit events."""
    sessions = os.path.join(home or codex_home(), "sessions")
    limits = None
    for folder, _, names in os.walk(sessions):
        for name in names:
            if thread_id in name:
                with open(os.path.join(folder, name), encoding="utf-8") as f:
                    for line in f:
                        payload = json.loads(line).get("payload") or {}
                        if payload.get("type") == "token_count" and payload.get("rate_limits"):
                            limits = payload["rate_limits"]
    if not limits:
        return None
    return {
        "plan_type": limits.get("plan_type"),
        "credits": limits.get("credits"),
        "used_percent_5h": (limits.get("primary") or {}).get("used_percent"),
        "used_percent_week": (limits.get("secondary") or {}).get("used_percent"),
    }


def generate(args):
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]*", args.name):
        sys.exit("NAME may contain only letters, digits, _ and - (no folders or extension).")
    refs = references(args.reference)
    prompt = build_prompt(args.request, refs)
    # Recorded in metadata that may be committed, so it holds no local absolute paths.
    display_command = codex_command("codex", [rel(p) for p in refs], "<empty temp folder>")

    if args.dry_run:
        print(json.dumps({"command": display_command, "would_save": rel(os.path.join(GENERATED, free_stem(args.name) + ".png")),
                          "prompt": prompt}, ensure_ascii=False, indent=2))
        return

    codex = find_codex()
    require_chatgpt_login(codex)
    started = time.time()
    with tempfile.TemporaryDirectory(prefix="codex_art_") as workdir:
        try:
            done = subprocess.run(codex_command(codex, refs, workdir), input=prompt, capture_output=True,
                                  encoding="utf-8", errors="replace", timeout=TIMEOUT_SECONDS, cwd=workdir,
                                  env=child_environment())
        except subprocess.TimeoutExpired:
            sys.exit(f"Codex did not finish in {TIMEOUT_SECONDS} s. Nothing was saved.")
    events = parse_events(done.stdout)
    message = "\n".join(events["messages"]).strip()

    images = stored_images(events["thread_id"]) if events["thread_id"] else []
    if not images:
        sys.exit(f"Codex produced no image (exit {done.returncode}). Nothing was saved.\n"
                 f"Message: {message}\nErrors: {events['errors']}\nStderr: {done.stderr.strip()[-2000:]}")

    source = images[-1]
    path = save_new(source, args.name)
    with open(path, "rb") as f:
        digest = hashlib.sha256(f.read()).hexdigest()
    plan = plan_facts(events["thread_id"])
    metadata = {
        "created": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
        "status": "candidate: needs human review before it replaces any asset",
        "user_request": args.request,
        "prompt": prompt,
        "references": [rel(p) for p in refs],
        "command": display_command,
        "codex_thread": events["thread_id"],
        "images_produced": len(images),
        "seconds": round(time.time() - started),
        "usage": events["usage"],
        "plan": plan,
        "sha256": digest,
        "output": describe(path),
    }
    # The .png was created first, so this name is reserved; "x" still refuses to replace a file.
    with open(path[:-4] + ".json", "x", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

    print(f"saved {rel(path)}")
    print(f"metadata {rel(path[:-4] + '.json')}")
    print(json.dumps({"output": metadata["output"], "plan": plan, "images_produced": len(images)}, indent=2))
    if not plan or plan.get("plan_type") != "plus":
        print(f"WARNING: expected the ChatGPT Plus plan, Codex reports: {plan}")


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    commands = parser.add_subparsers(dest="command", required=True)

    make = commands.add_parser("generate", help="draw a new candidate")
    make.add_argument("name", help="short file name for the candidate, e.g. well_scene_dusk")
    make.add_argument("request", help="asset spec: what to draw, layout, size, background")
    make.add_argument("--reference", action="append", help="image in tools/art/reference/ to attach (repeatable)")
    make.add_argument("--dry-run", action="store_true", help="print the prompt and command without calling Codex")

    inspect = commands.add_parser("inspect", help="print an image's size, mode and background corners")
    inspect.add_argument("path")

    args = parser.parse_args()
    if args.command == "inspect":
        print(json.dumps(describe(os.path.abspath(args.path)), indent=2))
    else:
        generate(args)


if __name__ == "__main__":
    main()
