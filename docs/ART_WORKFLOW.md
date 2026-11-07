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

## Rules

- No chat-to-chat communication or automatic image synchronization is assumed.
- Always reference exact filenames and the current repository revision where practical.
- Keep generated art separate from original reference sources.
- Avoid manual sprite cropping without recording the crop/layout in the pipeline.
- Do not infer production readiness from a sprite-sheet preview.
- Use the AGENTS.md handoff format whenever a task crosses agent boundaries.
