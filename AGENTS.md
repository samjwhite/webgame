# AI agent collaboration — Літо в селі / Макітрине

These instructions apply to every AI agent working on this repository. Read this file before planning work. Claude Code should also read CLAUDE.md.

## Ownership

- **Claude Code (implementation owner):** JavaScript/HTML/CSS, gameplay and quests, map coordinates and collisions, build scripts, asset extraction, animation timing and integration, tests, debugging, Git commits and deployment.
- **ChatGPT (visual art owner):** art direction, visual references, pixel-art concepts, characters, environment and object designs, sprite-sheet artwork, and review of visual consistency. ChatGPT can inspect repository context via the GitHub connection, but generated images do not automatically land in the repo.
- **Human (product/art approver):** priorities, story and scope decisions, final visual approval, accepting gameplay changes, and transferring or authorizing transfer of approved image files.

**Automated image generation:** Claude Code can also draw source art with the project `/art` skill (`.claude/skills/art/SKILL.md`), which calls Codex CLI on the human's ChatGPT login through `tools/art/codex_art.py`. Use it when the human asks Claude Code for the visual work or approves this route; otherwise route visual design to ChatGPT as below. Generated images are candidates: they are saved in `tools/art/reference/generated/`, reviewed by the human, and only then promoted with `tools/art/promote.py --approve`.

Ownership means who should perform the primary task, not who is prohibited from advising. Both agents should flag dependencies and hand work to the other owner instead of independently recreating their work.

## Branches

- **`main` is the stable version** that players get (GitHub Pages publishes from it). Nothing goes there directly, art included. It changes only when the human asks for `dev` to be merged.
- **`dev` is where all new work goes**: code, docs and art, from every agent. Upload new art to `tools/art/reference/incoming/` on `dev`.

## Tests

Run `npm test` before every commit. A bug fix comes with a test. See [docs/TESTING.md](docs/TESTING.md). Open the game with `?dev` to jump to any point of the story.

## Design memory

[docs/PROPORTIONS.md](docs/PROPORTIONS.md) records the size rules: a person is 40 px and everything is judged against that. Read it before drawing, scaling or placing anything.


[docs/ART_BIBLE.md](docs/ART_BIBLE.md) records the approved style, characters, places, design decisions, reference files and sprite specs. Read it before drawing or integrating any art. Local image generation through Codex CLI (option A) is described in [docs/CODEX_SETUP.md](docs/CODEX_SETUP.md).

## Routing every request

Before executing a substantial task, decide whether it belongs to Claude Code, ChatGPT, or requires both. If the request is for the other agent, **say so clearly in the current chat** and provide a ready-to-paste handoff. Do not claim to have sent a message to the other agent or to have synchronized conversations.

- Visual appearance, historical references, drawing/repainting, image composition, sprites and visual style -> **ChatGPT**.
- Engine behavior, collision, map implementation, scripting, crop coordinates, image processing, spritesheet packing, animation playback, performance and deployment -> **Claude Code**.
- Tasks involving both -> split into sequential deliverables. For a new animation, Claude Code specifies frame dimensions/directions and integration constraints; ChatGPT draws the approved frames; Claude Code processes, validates and integrates them.
- When unclear, identify the concrete deliverable and choose the owner best equipped to produce it. The receiving agent may request a corrected spec.

## Mandatory handoff format

When routing work to the other agent, include a short, actionable block:

**Assign to:** ChatGPT | Claude Code
**Task:** one-sentence deliverable
**Context:** location/character, game moment, relevant repository paths
**Requirements:** visual/technical constraints, scale, frames, dimensions, transparency, existing art references as applicable
**Inputs:** exact source assets and paths; say when unavailable
**Output:** filename/path and format
**Acceptance criteria:** observable checks for completion
**Dependency/next owner:** who takes over after approval

Never invent dimensions, crop boxes, asset availability, or repository changes. Read actual project files first; mark unknowns explicitly.

## Project-specific constraints

- Setting: rural Poltava region, Ukraine, summer 2003. Art should feel lived-in and weathered, not pristine or stylized as a Japanese village.
- Preserve the existing HTML Canvas game and Python/Pillow art build pipeline unless explicitly asked to redesign them.
- The game currently loads PNG assets under `art/`, built from code and reference images in `tools/art/reference/` by `python3 tools/art/build.py`.
- The extraction pipeline in `tools/art/reference.py` uses hardcoded crop regions; an attractive image is not necessarily an import-ready spritesheet.
- Before replacing art, verify frame sizes, directions, consistent alignment, transparency, palette, and that existing crop regions still work.
- `js/assets.js` lists loaded art; `js/map.js` defines each location's walls, exits and sprites. Visual map changes may require corresponding collision changes.
- Treat repository files as the source of truth for current implementation. This chat's visual history is reference context, not automatically present in the repository.
- Never overwrite approved artwork or alter quest logic without explicit authorization. No agent should silently substitute a generated image for an approved asset.

## Completion and status

At the end of work, state: **Completed by**, **Files changed** (or none), **Verification performed**, **Next owner/task** (if any). If an image exists only in chat, explicitly state that it has not been committed to GitHub.
