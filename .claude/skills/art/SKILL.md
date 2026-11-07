---
name: art
description: Generate or edit source artwork for "Літо в селі" with OpenAI's GPT Image API, then review, process and integrate it through the existing Pillow pipeline. Use when the human asks Claude Code to create, redraw or edit a visual asset (sprite, sprite sheet, scene, map piece, icon) instead of handing it to ChatGPT.
argument-hint: "<what to draw or change, and where it is used>"
---

# /art — generate a visual asset

The human's request: $ARGUMENTS

Read `AGENTS.md`, `CLAUDE.md` and `docs/ART_WORKFLOW.md` first. Generated images are **candidates**: they never replace approved art without the human's explicit approval.

## 1. Understand the asset

- Find where the asset is used: `js/assets.js` (loaded art), `tools/art/reference.py` (crop boxes, frame sizes, scales), `js/map.js` / `js/world.js` (placement), `js/closeup.js` (close-up scenes).
- Write down the technical spec from the real code: final game pixel size, frame count and layout, directions, ground line, background (transparent or flat `#26222f` for cut-out sheets), the source file name in `tools/art/reference/`. Never invent dimensions; mark unknowns.
- Pick existing references from `tools/art/reference/` that show the same character, place or style (for example `collage.png` for people, `village_map.png` for buildings, `well_scene.png` for close-ups).

If the request is unclear or would change an approved design, ask the human before calling the API.

## 2. Write the prompt

`tools/art/imagegen.py` automatically prepends `tools/art/style_prompt.txt` (setting, era, palette, what to avoid). Your request text adds only the specific asset:
- the subject and its period details (Poltava village, summer 2003),
- the view (top-down map, side view, close-up), pose or action, framing,
- the technical layout from step 1: frames per row, equal spacing, same scale and ground line, background,
- which reference images to match and what to keep from them.

Show the human the request text and the chosen model/size/quality before the first call when the asset is large or costly (quality `high`, several candidates, or an edit with many references).

## 3. Generate

```
python3 tools/art/imagegen.py generate NAME "REQUEST" [--size 1536x1024] [--quality low|medium|high] [--background transparent] [--n 2]
python3 tools/art/imagegen.py edit NAME "REQUEST" --image tools/art/reference/REF.png [--image ...] [--mask MASK.png]
```

- Use `edit` with `--image` whenever an existing reference must be matched or changed (up to 16 images).
- Default model is `gpt-image-2.5-sunburst`; `--model gpt-image-2.5-flare` is faster for rough drafts. Older models are refused.
- Start with `--quality low` or `medium` for drafts; use `high` only for the final candidate.
- Add `--dry-run` to check the full prompt without spending money.
- The result is saved as `tools/art/reference/generated/NAME.png` (never overwriting; it adds `-2`, `-3`...) with `NAME.json` holding the prompt, model, options, inputs, token usage and estimated cost.
- The key comes from `OPENAI_API_KEY` or `tools/art/.env.local`. Never print, commit or paste the key. If it is missing, ask the human to set it.

## 4. Validate

- `python3 tools/art/imagegen.py inspect PATH` prints size, mode, transparency and content box.
- Look at the image yourself (Read the PNG). Check the spec: frame count, separation, alignment, scale, background, period details, no stray text.
- If it fails, refine the request and generate again; report what you changed.

## 5. Human review

Show the candidate to the human (send the PNG) with the facts from `inspect`, the estimated cost and what it is meant to replace.

To replace or add a reference file, first run the review without changing anything:

```
python3 tools/art/promote.py tools/art/reference/generated/NAME.png TARGET.png
```

Send the comparison image it writes. Only after the human explicitly approves, run the same command with `--approve`. It backs up the old file to `tools/art/reference/replaced/` and stores the generation metadata as `TARGET.meta.json`.

## 6. Integrate

- Add or adjust crop boxes, frame sizes and scales in `tools/art/reference.py`; add new outputs to `js/assets.js`; adjust collisions in `js/map.js` if a map picture changed.
- Run `python3 tools/art/build.py`, check the generated PNGs in `art/`, run the game (Playwright, iPhone viewport) and take screenshots.
- Commit the approved reference, its `.meta.json`, the pipeline changes and the rebuilt `art/`. Candidates in `generated/` and backups in `replaced/` stay out of Git.

## Report

Finish with the AGENTS.md completion block plus: model, number of API calls, token usage and estimated cost from the `.json` files (the API reports tokens, not billed dollars; say so).
