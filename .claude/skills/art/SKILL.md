---
name: art
description: Generate source artwork for "Літо в селі" with Codex CLI on the human's ChatGPT Plus login (no API key), then review, process and integrate it through the existing Pillow pipeline. Use when the human asks Claude Code to create or redraw a visual asset (sprite, sprite sheet, scene, map piece, icon) instead of handing it to ChatGPT.
argument-hint: "<what to draw or change, and where it is used>"
---

# /art: generate a visual asset

The human's request: $ARGUMENTS

Read `AGENTS.md`, `CLAUDE.md`, `docs/ART_WORKFLOW.md`, `docs/ART_BIBLE.md` and `docs/CODEX_SETUP.md` first. Generated images are **candidates**: they never replace approved art without the human's explicit approval.

## 1. Understand the asset

- Find where the asset is used: `js/assets.js` (loaded art), `tools/art/reference.py` (crop boxes, frame sizes, scales), `js/map.js` / `js/world.js` (placement), `js/closeup.js` (close-up scenes).
- Write down the technical spec from the real code: final game pixel size, frame count and layout, directions, ground line, background (flat `#26222f` for cut-out sheets), the source file name in `tools/art/reference/`. Never invent dimensions; mark unknowns.
- Pick existing references from `tools/art/reference/` that show the same character, place or style (the tables in `docs/ART_BIBLE.md` list them).

If the request is unclear or would change an approved design, ask the human before generating.

## 2. Write the asset spec

`tools/art/codex_art.py` automatically adds all of `docs/ART_BIBLE.md` to the prompt. Your request text adds only the specific asset:
- the subject and its period details,
- the view (top-down map, side view, close-up), pose or action, framing,
- the technical layout from step 1: frames per row, equal spacing, same scale and ground line, background,
- which attached references to match and what to keep from them.

## 3. Generate

```
python tools/art/codex_art.py generate NAME "ASSET SPEC" [--reference tools/art/reference/REF.png ...] [--dry-run]
```

- Each real run spends the human's ChatGPT Plus Codex allowance, so make one candidate at a time. `--dry-run` shows the full prompt and command without calling Codex.
- The result is saved as `tools/art/reference/generated/NAME.png` (never overwriting; it adds `-2`, `-3`...) with `NAME.json` holding the prompt, references, command, date, plan and usage.
- Codex offers no flags for image size, seed or transparency, so anything in the spec is a request, not a guarantee. Step 4 checks what actually came back.
- If the script reports no image, stop and show the human its output. Do not substitute an image drawn with code. Do not create or use an OpenAI API key.

## 4. Validate

- `python tools/art/codex_art.py inspect PATH` prints size, mode, transparency and background corners.
- Look at the image yourself (Read the PNG). Check the spec: frame count, separation, alignment, scale, background, period details, no stray text. Do not infer production readiness from an attractive picture.
- If it fails, refine the spec and generate again; report what you changed.

## 5. Human review

Show the candidate to the human with the facts from `inspect` and what it is meant to replace. Then run the review, which changes no art:

```
python tools/art/promote.py tools/art/reference/generated/NAME.png TARGET.png
```

Send the comparison image it writes. **Only after the human explicitly approves that comparison**, run the same command with `--approve`. It backs up the old file to `tools/art/reference/replaced/` and stores the generation metadata as `TARGET.meta.json`.

## 6. Integrate

- Add or adjust crop boxes, frame sizes and scales in `tools/art/reference.py`; add new outputs to `js/assets.js`; adjust collisions in `js/map.js` if a map picture changed.
- Run `python tools/art/build.py`, check the generated PNGs in `art/`, run the game and take screenshots.
- Commit the approved reference, its `.meta.json`, the pipeline changes and the rebuilt `art/` on a branch and open a PR. Candidates in `generated/` and backups in `replaced/` stay out of Git.

## Report

Finish with the AGENTS.md completion block plus the plan and usage from the `.json` file. If a candidate was not approved, say that it has not been committed.
