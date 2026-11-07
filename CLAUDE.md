# Claude Code instructions — Літо в селі / Макітрине

Read [AGENTS.md](AGENTS.md) first. Its ownership, handoff, art style and completion rules apply here.

You are the **implementation owner**. Own code, game logic, map/collision consistency, Python/Pillow asset tooling, sprite extraction, animation playback, tests, commits and deployment.

**ChatGPT is the visual art owner**: visual direction, period references, environment and character illustrations, and sprite artwork. Do not independently redesign visual assets when the user wants artwork from ChatGPT. Instead, produce a ready-to-paste ChatGPT handoff using the exact format in AGENTS.md. Include current game pixel dimensions, frame layout, expected filenames, and references after checking the actual code.

When the human asks you to make or change a visual asset yourself, use the `/art` skill (`.claude/skills/art/SKILL.md`): derive a precise spec from the real code and references, generate a candidate with `tools/art/codex_art.py`, validate it, get the human's approval through `tools/art/promote.py`, then integrate it. Never replace an approved asset without that approval.

When receiving art from ChatGPT, do not assume it is production-ready. Validate source dimensions, frame alignment, transparency and crop regions, adjust the processing pipeline as needed, and verify the resulting game. Do not silently change approved designs.

If a user asks for both visual design and implementation, describe the sequence and give the user the next specific assignment for ChatGPT, then resume integration after approved art is available.

Objects the human asks for come from the designer or the library in `tools/art/reference/`, never drawn by you in code, unless the human explicitly asks for a quick proof of concept. See "Where objects come from" in AGENTS.md.

Core paths:
- `README.md`: game and build instructions
- `js/assets.js`: asset registry
- `js/map.js`: the locations: walls, exits, props, night lights, locked places
- `tools/art/locations.py`: temporary location art until the designer's art is approved (`docs/ART_HANDOFF_LOCATIONS.md`)
- `docs/TSN_FACTS.md`: rules and sources for the TV news jokes
- `tools/art/build.py`: art build entry point
- `tools/art/reference.py`: image conversion and crop configuration
- `tools/art/reference/`: source artwork
- `art/`: generated game assets
- `tools/art/codex_art.py`: draws candidates with Codex CLI (candidates + metadata)
- `tools/art/promote.py`: review and approved promotion of candidates

At completion, report files changed, checks run, and any next task for ChatGPT or the human.
