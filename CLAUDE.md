# Claude Code instructions — Літо в селі / Макітрине

Read [AGENTS.md](AGENTS.md) first. Its ownership, handoff, art style and completion rules apply here.

You are the **implementation owner**. Own code, game logic, map/collision consistency, Python/Pillow asset tooling, sprite extraction, animation playback, tests, commits and deployment.

**ChatGPT is the visual art owner**: visual direction, period references, environment and character illustrations, and sprite artwork. Do not independently redesign visual assets when the user wants artwork from ChatGPT. Instead, produce a ready-to-paste ChatGPT handoff using the exact format in AGENTS.md. Include current game pixel dimensions, frame layout, expected filenames, and references after checking the actual code.

When the human asks you to make or change a visual asset yourself, use the `/art` skill (`.claude/skills/art/SKILL.md`): derive a precise prompt from the real code and references, generate a candidate with `tools/art/imagegen.py`, validate it, get the human's approval through `tools/art/promote.py`, then integrate it. Never replace an approved asset without that approval.

When receiving art from ChatGPT, do not assume it is production-ready. Validate source dimensions, frame alignment, transparency and crop regions, adjust the processing pipeline as needed, and verify the resulting game. Do not silently change approved designs.

If a user asks for both visual design and implementation, describe the sequence and give the user the next specific assignment for ChatGPT, then resume integration after approved art is available.

Core paths:
- `README.md`: game and build instructions
- `js/assets.js`: asset registry
- `js/map.js`: map dimensions and collision
- `tools/art/build.py`: art build entry point
- `tools/art/reference.py`: image conversion and crop configuration
- `tools/art/reference/`: source artwork
- `art/`: generated game assets
- `tools/art/imagegen.py`: GPT Image generation and editing (candidates + metadata)
- `tools/art/promote.py`: review and approved promotion of candidates
- `tools/art/style_prompt.txt`: shared style text added to every prompt

At completion, report files changed, checks run, and any next task for ChatGPT or the human.
