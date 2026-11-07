# Shared art workflow

See [AGENTS.md](../AGENTS.md) for agent ownership and the required handoff template.

## Flow

1. **Claude Code** reads the current game code and prepares a precise asset request: use case, dimensions, direction, frames, placement, source path, target path and acceptance checks.
2. **ChatGPT** reads relevant repository specifications and creates/revises the visual asset. If needed, it explains which technical requirements are not guaranteed by image generation.
3. **Human** approves the result and arranges for the final image to be placed in `tools/art/reference/` (or explicitly authorizes a supported repository upload). A generated chat image is not automatically a repository file.
4. **Claude Code** verifies the source file, adjusts crop/layout parameters in `tools/art/reference.py`, runs `python3 tools/art/build.py`, checks the generated PNGs and game, and integrates any map/collision or animation changes.
5. **Human** reviews the in-game result. If it fails visually, Claude Code creates a focused correction request for ChatGPT; if technically, Claude Code fixes the pipeline.

## Local route (option A)

Claude Code on the human's PC can drive Codex CLI (ChatGPT login) to draw candidates directly into the checkout. Setup, smoke test and limits: [CODEX_SETUP.md](CODEX_SETUP.md). Same review rule: candidates first, human approval, then a PR.

## API route (`/art` skill, draft — not tested against the API)

When the human asks Claude Code to produce the art:

1. **Claude Code** writes the technical spec from the code, then runs `tools/art/imagegen.py generate|edit` with existing references. The candidate lands in `tools/art/reference/generated/` with a `.json` file (prompt, model, inputs, token usage, estimated cost).
2. **Claude Code** validates it (`imagegen.py inspect`, visual check) and regenerates if it misses the spec.
3. **Human** reviews the candidate and the comparison from `tools/art/promote.py CANDIDATE TARGET.png`.
4. Only after explicit approval: `promote.py ... --approve` copies it into `tools/art/reference/` (old file backed up to `replaced/`, metadata saved as `TARGET.meta.json`).
5. **Claude Code** integrates it through `tools/art/reference.py` and `tools/art/build.py`, as in step 4 above.

Keys: `OPENAI_API_KEY` from the environment or `tools/art/.env.local` (ignored by Git). Candidates and backups are ignored by Git too.

## Rules

- No chat-to-chat communication or automatic image synchronization is assumed.
- Always reference exact filenames and the current repository revision where practical.
- Keep generated art separate from original reference sources.
- Avoid manual sprite cropping without recording the crop/layout in the pipeline.
- Do not infer production readiness from a sprite-sheet preview.
- Use the AGENTS.md handoff format whenever a task crosses agent boundaries.
