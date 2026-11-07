# Option A — local art generation with Codex CLI

Goal: Claude Code running on the human's Windows PC asks **Codex CLI** (logged in with the human's **ChatGPT Plus** account, not an API key) to draw art, and the result lands in the local checkout as a reviewable candidate. GitHub `main` stays the source of truth.

Status: **not verified yet.** Whether Codex CLI can generate images non-interactively has to be tested (step 4). If it can't, use option B in [ART_WORKFLOW.md](ART_WORKFLOW.md) and stop.

## 1. Workspace (ask before installing anything)

```powershell
git --version                  # if missing: ask, then  winget install --id Git.Git -e
mkdir C:\Projects -Force
git clone https://github.com/samjwhite/webgame C:\Projects\webgame
cd C:\Projects\webgame
python --version               # Python 3 + Pillow are needed for tools/art/build.py
python -m pip install pillow
```

Read `AGENTS.md`, `CLAUDE.md`, `docs/ART_WORKFLOW.md` and `docs/ART_BIBLE.md` before changing anything.

## 2. Codex CLI (ask before installing)

```powershell
node --version                 # if missing: ask, then  winget install OpenJS.NodeJS.LTS
npm install -g @openai/codex
codex --version
codex login                    # choose "Sign in with ChatGPT" and use the Plus account
```

Do not create or store an OpenAI API key for this route.

## 3. Check what Codex offers

```powershell
codex --help
codex exec --help
```

Look for an image generation tool, feature flag or skill, and note the exact options. Do not guess flags.

## 4. Smoke test with a disposable asset

Run one non-interactive request that asks Codex to generate a small throw-away image (for example a weathered aluminium milk can on a flat `#26222f` background) and save it to `tools/art/reference/generated/test_milk_can.png`.

It passes only if all of these hold:
- the command finishes without manual clicks,
- a real PNG appears at the given path (check size and that Pillow opens it),
- no file outside `tools/art/reference/generated/` changed (`git status`),
- usage stayed within the Plus plan (no API billing).

Delete the test image afterwards. Do not commit it.

## 5. If the test passes

- Add a small wrapper (for example `tools/art/codex_art.py`) that builds the prompt from `docs/ART_BIBLE.md` plus the asset spec, passes reference images from `tools/art/reference/`, calls Codex, and saves `generated/NAME.png` with a `NAME.json` (prompt, references, command, date). It must never overwrite an existing file.
- Point the `/art` skill (`.claude/skills/art/SKILL.md`) at this wrapper. A draft skill with an API-key backend exists on branch `claude/cool-cannon-g86san` (commit "WIP: /art skill…"). Reuse its review step (`tools/art/promote.py`: side-by-side comparison, replace only with `--approve`) and its `.gitignore` rules.
- Test once more, then commit, push a branch and open a PR.

## 6. If the test fails

Stop. Report what Codex printed, which step failed, and why image generation can't be driven from Claude Code. Continue with option B.

## Review rule (both options)

Every generated image is a candidate in `tools/art/reference/generated/` (ignored by Git). The human sees the image and a comparison with the current art. Only after an explicit "approve" does it move into `tools/art/reference/` and get committed through a PR.
