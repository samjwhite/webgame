# Art bible — Літо в селі / Makitryne

The shared design memory for every agent that draws or integrates art (ChatGPT, Codex, Claude Code). Read it together with [AGENTS.md](../AGENTS.md) and [ART_WORKFLOW.md](ART_WORKFLOW.md). The approved images in `tools/art/reference/` on GitHub `main` are the source of truth; this file describes them and the decisions behind them.

## Setting and tone

- Village of **Makitryne**, Poltava region, Ukraine, **summer 2003** (Kuchma era).
- Lived-in and weathered but cared for: whitewashed houses with blue window frames, wavy asbestos-slate roofs with moss, chipped plaster showing brick, wooden picket fences, yellow gas pipes, concrete bus stop with a faded mosaic, Soviet-era vehicles. Signs are in Ukrainian ("Продукти", "Будинок культури").
- Warm, nostalgic, gently ironic. Never grim, never "gopnik" or criminal. Never a Japanese or fairy-tale village.
- Visual reference: cosy detailed pixel art in the spirit of *Cast n Chill* and *Stardew Valley*: visible pixels, soft dithering, earthy palette (ochre, dusty green, faded blue, whitewash, rust), late-afternoon light, dark outlines on characters and props.
- Avoid: photorealism, smooth vector shading, blurry anti-aliased edges, glossy or new-looking objects, anything after 2003, text except short Ukrainian signs.

## Characters (approved looks)

| Who | Look | Reference files |
|---|---|---|
| **Hero**, city grandson | Curly brown hair, white T-shirt, light jeans, olive backpack. Later a navy Adidas tracksuit with white stripes. | `hero_city_sheet.png`, `hero_sport_sheet.png`, `collage.png` |
| **Hero on the moped** | Orange Karpaty moped; the sheet shows a brown jacket and flat cap (a tracksuit version may replace it later). | `moped_sheet.png` |
| **Baba Hanya**, grandma | Headscarf, floral dress, apron, kind round face. | `grandma.png`, `collage.png` |
| **Valya**, shop seller | Red headscarf, pink blouse, blue checked apron, arms crossed, loud and warm. | `seller.png`, `collage.png` |
| **Did Petro**, grandpa | Flat cap, grey moustache, checked shirt, dark vest, rubber boots, cigarette, sits by the pond. | `grandpa_pond.png` (close-up). The world sprite is repainted from the hero idle frames; a full-height picture is still wanted. |
| **Tolik, Vovchyk, Seryi**, village lads | Ordinary village youth in tracksuits and caps, sunflower seeds, one squatting. Not gangsters. | `lads.png`, `collage.png` |
| Chickens | Rooster, white, ginger and black hens: walk, peck, flap. | `chicken_sheet.png` |

## Places

| Place | Reference files |
|---|---|
| Whole village map (top-down, 48×32 tiles of 32 px at source size) | `village_map.png` (current), `village_map_old.png` (used only to patch the legend) |
| Club square and Будинок культури | `club_square.png`, `club_topdown.png`, `disco.png` |
| Shop "Продукти", houses, bus stop, props | `props_sheet_1.png`, `props_sheet_2.png`, `props_sheet_3.png`, `sheet_club.png` |
| Well close-up and its animation parts | `well_scene.png`, `well_sheet.png` |
| Shed with the moped | `shed.png` |
| Title screen and app icon | `club_square.png`, `icon.png` |

## Design decisions to keep

- The statue on the square was Lenin, repainted into Shevchenko (moustache painted on, "В. І." showing under "Т. Г. Шевченко").
- The shop sign reads **"Продукти"** (some older pictures say "Магазин" or "Сільський магазин").
- Grandpa's clothes are old, not a real wedding suit. That's only a joke in his dialogue.
- The lads are village youth (haymaking, cows, fishing, football against Mykhailivka), not street toughs.
- Buildings keep their Ukrainian signs in every game language.

## Technical specs (game pixels after processing)

The game draws at 1 game pixel = several screen pixels; sources are drawn large and scaled down by `tools/art/reference.py`.

| Asset | Game size | Source layout expected |
|---|---|---|
| Village map | 768×512 (source 1536×1024, scale 0.5) | One top-down picture; changing layout means changing collisions in `js/map.js`. |
| Hero walk/idle | frames 28×44 | Rows: down, up, left, right × 8 frames, plus 4 idle frames to the right (see `HERO_*` in `reference.py`). |
| Hero on moped | frames 45×38 | Rows: right ×6, left ×6, one back view, one front view. |
| Standing NPCs | 40 px tall | Full figure, front view, separated on a flat dark background. |
| Chickens | ~16–20 px tall, 11 frames | idle, walk ×5, peck ×4, flap. |
| Close-up scenes | 192 px wide | Any landscape picture; framed and scaled automatically. |
| Checklist icons | 32 px tall | Object on dark background. |
| Well parts | crank 39×35 ×8 frames, bucket 17×22 ×4 | Separate parts on dark background (`well_sheet.png`). |

Sprite sheets: flat dark background `#26222f` (or transparency), every frame clearly separated, the same scale and ground line in all frames, no labels. Anything drawn as one picture with frames touching or labels inside needs manual crop work.

## How new art enters the game

1. A spec in the AGENTS.md handoff format (size, frames, filename, acceptance criteria).
2. An image produced by ChatGPT or by Codex (see [CODEX_SETUP.md](CODEX_SETUP.md)), saved as a **candidate**. Never overwrite a file in `tools/art/reference/`.
3. Human approval.
4. Claude Code adds it to `tools/art/reference/`, sets crops in `tools/art/reference.py`, runs `python3 tools/art/build.py`, tests the game and merges through a PR.
