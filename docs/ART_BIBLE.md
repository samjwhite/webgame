# Art bible — Літо в селі / Makitryne

The shared design memory for every agent that draws or integrates art (ChatGPT, Codex, Claude Code). Read it together with [AGENTS.md](../AGENTS.md) and [ART_WORKFLOW.md](ART_WORKFLOW.md). The approved images in `tools/art/reference/` on GitHub `main` are the source of truth; this file describes them and the decisions behind them.

## Setting and tone

- Village of **Makitryne**, Poltava region, Ukraine, **summer 2003** (Kuchma era).
- **Lived in, not ruined (the owner, November 2026).** People live here and keep things in order as well as they can: whitewash renewed, fences mended, yards swept, flowers by the house. Some wear and an old patch are fine; holes in roofs, rust everywhere, cracked and crumbling everything, abandoned-looking places and an "apocalypse" mood are not. Neither a postcard nor a ruin. (Repairing things may become a game feature later, so do not make everything neglected.)
- **Real Poltava village objects only:** a well is a grey concrete ring (often whitewashed) with a lid, a drum and a chain, never a stone or brick well with a storybook roof. Nothing from Stardew Valley, Japanese games or fairy tales: no cute tidy crops in neat rows, no bright cartoon colours.
- Lived-in and weathered but cared for: whitewashed houses with blue window frames, wavy asbestos-slate roofs with moss, chipped plaster showing brick, wooden picket fences, yellow gas pipes, concrete bus stop with a faded mosaic, Soviet-era vehicles. Signs are in Ukrainian ("Продукти", "Будинок культури").
- Warm, nostalgic, gently ironic. Never grim, never "gopnik" or criminal. Never a Japanese or fairy-tale village.
- **Approved style reference:** `tools/art/reference/loc_yard.png`, grandma's yard. The owner's words: more sense than the old map, and the patchwork fence and the gas pipe along it look truly authentic. Draw new locations to match it.
- Our own look, not a copy of *Stardew Valley*, *Cast n Chill* or any other game: visible pixels, soft dithering, earthy palette (ochre, dusty green, faded blue, whitewash, rust), late-afternoon light, dark outlines on characters and props.
- Yards are inspired by real Poltava village yards: authentic and Ukrainian, with no folk-costume kitsch ("шароварщина"), no cute tidy sheds and no neat decorative flowerbeds.
- Plants and trees are those of the Middle Dnieper and Poltava region (forest-steppe), not generic game foliage or anything from Japanese-style games. The list is in [ART_HANDOFF_LOCATIONS.md](ART_HANDOFF_LOCATIONS.md).
- Everything seen or mentioned exists in 2003: nothing from later, and nothing kept from the Soviet past as decoration. Old Soviet-made things are fine when they are simply still in use, aged and repaired.
- Avoid: photorealism, smooth vector shading, blurry anti-aliased edges, glossy or new-looking objects, anything after 2003, text except short Ukrainian signs.
- The village is a set of separate full-screen locations, each with its own art and every object as its own sprite. The current request for the designer: [ART_HANDOFF_LOCATIONS.md](ART_HANDOFF_LOCATIONS.md). Every open location (yard, house, road, shop, club, bus stop, pond) is now approved art; the locked houses and the summer story's new places are still to come.

## Characters (approved looks)

| Who | Look | Reference files |
|---|---|---|
| **Hero**, city grandson | Short straight dark-brown hair: an ordinary 2003 school haircut, short at the back and sides, a short flat fringe brushed forward (decided by the owner: no curls, no modern curly top). White T-shirt, clean new light jeans, white sneakers: the city look the lads call a dandy. Later his old school tracksuit, navy with three faded white stripes. A lanky 17-year-old with the same proportions as the approved lads (about 7.5 heads tall, a small head), never a big-headed child. No backpack: it stays by grandma's shed. | `incoming/hero_city_v5.png`, `incoming/hero_sport_v5.png`, portrait `incoming/hero_portrait_v2.png` (drawn by Codex in the proportions of `village_lads_everyday_v4.png` and the face of `dialogue_cast.png`, approved by the owner). The curly hair of `dialogue_cast.png`, `summer_key_moments_v2.png` and the old sheets is out of date. |
| **Hero on the moped** | The hero himself (no cap, his 2003 haircut) on grandpa's orange Karpaty, in city clothes or his tracksuit. | `incoming/hero_moped_v2.png`; `moped_sheet.png` shows the moped only |
| **Baba Hanya**, grandma | Headscarf, floral dress, apron, kind round face. | `incoming/talk_grandma_v2.png` (her close-up redrawn in the game's style with the same face), `grandma.png` (the old close-up), `collage.png` |
| **Valya**, shop seller | Sturdy build, red floral headscarf, gold earrings, maroon knitted sweater, blue checked apron, arms crossed, loud and warm. | `incoming/valya_character_v2.png` (approved by the human through ChatGPT: full figure and close-up). `seller.png`, the shop picture and `collage.png` still show the older pink-blouse look. |
| **Did Petro**, grandpa | Flat cap, grey moustache, checked shirt, dark vest, rubber boots, cigarette, sits by the pond. | `grandpa_pond.png` (close-up), `petro_bench.png` (on his bench in the game), portrait in `incoming/dialogue_cast.png`. `art/world/grandpa.png` is an old repaint of the first hero sheet, no longer built or used; a full-height picture is still wanted. |
| **Tolik, Vovchyk, Sanya** (Sashko), village lads (for a while the scenario called them Ostap, Stas and Seryoga; on 7 November the owner renamed them back to Tolik and Vovchyk, and Seryoga to Sanya) | Ordinary village youth, not gangsters, in worn everyday clothes: faded colours, stretched knees, nothing new or branded. **Tolik**, the leader: curly reddish-brown hair, a faded blue denim jacket over a brown patterned (Fair Isle) sweater, brown trousers. **Vovchyk**: a faded blue-grey cap, long curly hair, a small goatee, an olive canvas jacket over a navy zip-neck top. **Sanya**: short hair, a brown knitted zip-up sweater over a cream T-shirt, squats. They envy the hero's new city clothes a little but never say so. | `incoming/village_lads_everyday_v4.png` (approved by the human through ChatGPT; left to right Tolik, Vovchyk, Sanya, figures above and portraits below). `incoming/lads_porch_v2.png`: the club porch redrawn by Codex with this trio (approved by the owner). `lads.png`, `collage.png` and the lower row of `dialogue_cast.png` show the old tracksuit look. |
| **Svetka**, village girl | Chestnut wavy hair in a low ponytail with a red scrunchie, freckles, a dark red short-sleeved blouse, a faded denim knee-length skirt, sandals. | `incoming/summer_characters_concepts.png` (top left, approved by the human through ChatGPT), `incoming/summer_key_moments_v2.png` |
| **Mykola**, **the driver**, **the piglet seller** | Mykola: thin, balding, a stained vest and old tracksuit trousers, slippers. The driver: a stout man with a flat cap and moustache, a faded blue work shirt. The seller: an old woman in a floral headscarf, a cardigan over a floral dress, rubber boots. | `incoming/summer_characters_concepts.png` (approved concepts: figures above, portraits below) |
| **The driver** (no name, the owner's decision) | Stout, red-faced, grey moustache, flat grey cap, faded blue work shirt with rolled sleeves, brown trousers, a cigarette. He is to take grandma to the district market for piglets. His car: an old faded pale-blue Zhiguli ("копійка") with rust and a roof rack. | `incoming/summer_characters_concepts.png` (approved), car `incoming/driver_car.png`, scene `incoming/battery_rant_v2.png` (Codex) |
| **The river date** | Hero and Svetka on the grassy bank at sunset sharing one pair of wired earphones from the black cassette player; the orange moped parked on the path. The bank is the river of `summer_locations_concepts.png`. | `incoming/river_date_v4.png` (drawn by Codex from the approved concepts; approved by the owner) |
| Chickens | Rooster, white, ginger and black hens: walk, peck, flap. | `chicken_sheet.png` |

## Places

| Place | Reference files |
|---|---|
| Whole village map (top-down, 48×32 tiles of 32 px at source size) | `village_map.png` (current), `village_map_old.png` (used only to patch the legend) |
| Club square and Будинок культури | `incoming/loc_club_v2.png` (the location, approved), `club_square.png`, `disco.png`. `club_topdown.png` is the old festive look: layout only. |
| Bus stop | `incoming/loc_stop.png` (approved) |
| Pond | `incoming/loc_pond.png` (approved), `grandpa_pond.png` |
| Mykola's yard | `incoming/loc_mykola.png` (Codex, from the approved concept in `summer_locations_concepts.png`; approved by the owner). His room is the close-up `incoming/mykola_kungfu_v2.png` (the approved concept, the hero redrawn) |
| Shop "Продукти", houses, bus stop, props | `props_sheet_1.png`, `props_sheet_2.png`, `props_sheet_3.png`, `sheet_club.png` |
| Well close-up and its animation parts | `incoming/well_scene_v4.png` and `incoming/well_parts_v2.png`: a whitewashed concrete ring with a lid, a drum and a chain (the owner: a real Poltava well). The stone well of `well_scene.png` is out of date. The yard is `incoming/loc_yard_well_v2.png`, the approved yard with that well. |
| Potato-beetle mini-game | `incoming/garden_closeup.png` (the plot) and `incoming/garden_parts.png` (hand, jar, Colorado beetle) |
| Shed with the moped, the evening by the club | `incoming/shed_v2.png`, `incoming/nightfall_v2.png` (both liked by the owner: keep this shed and moped in later scenes) |
| Shed with the moped | `shed.png` |
| Title screen and app icon | `club_square.png`, `icon.png` |
| Summer story, approved concepts by ChatGPT | `incoming/summer_locations_concepts.png` (Mykola's yard and room, the district market, the river), `incoming/summer_key_moments_v2.png` (the disco, the night catfish sale, the morning after the break-up, the river with the lads), `incoming/pond_catfish_rod_v3.png`, `incoming/pond_catfish_night.png`, `incoming/mykola_vhs_kungfu.png`, `incoming/summer_props_concepts.png` (sprayer, cassette player, beer, battery, whitewash, fence, potatoes) |

## Design decisions to keep

- The statue on the square was Lenin, repainted into Shevchenko (moustache painted on, "В. І." showing under "Т. Г. Шевченко").
- The shop sign reads **"Продукти"** (some older pictures say "Магазин" or "Сільський магазин").
- Grandpa's clothes are old, not a real wedding suit. That's only a joke in his dialogue.
- The lads are village youth (haymaking, cows, fishing, football against Mykhailivka), not street toughs.
- Buildings keep their Ukrainian signs in every game language.

### Shop beer garden

- Beside the **Продукти** grocery shop, group simple outdoor tables under a faded green **Чернігівське** beer umbrella. Keep the furniture weathered and the setup modest, in keeping with Makitryne in summer 2003.
- Use a concrete lamp post, or a concrete base with a wooden upper section. Keep the shop frontage clear of crates and loose bottles.
- Place a seated mixed-breed village dog near the shop as part of the scene.

### Village dogs

- Draw several distinct mixed-breed yard dogs (дворняги). Vary their silhouettes, ear shapes, and coat markings so the dogs read as different individuals at game scale. Use the established earthy palette, dark outlines, and visible pixel clusters.
- Include a seated pose for the shop dog. Follow the shared sprite-sheet conventions below for separation, scale, and ground line. In the game they are cut by `tools/art/animals.py` at 36×32 cells, facing right.

### Village yard cats

- Ordinary semi-stray village cats have natural adult proportions, scruffy coats, muted colors, and irregular markings. The approved designs are a shaggy brown-gray tabby, a cream-white cat with a black cap and a dark spot beneath its nose, and a calico with uneven rust and charcoal patches.
- Awake cats generally have neutral expressions and relaxed ears. The standing tabby is the single angry variant, with narrowed eyes and ears angled outward. Sleeping cats look relaxed.
- The approved source sheet (`yard_cats_v3.png`, delivered in chat) is 1536×1024 with nine separated sprites on a dark background. Rows follow the coat order above. Columns show standing, seated, and curled sleeping poses. In the game they are cut by `tools/art/animals.py` from `incoming/yard_cats_v3.png` at 26×18 cells, facing right.

## Technical specs (game pixels after processing)

The game draws at 1 game pixel = several screen pixels; sources are drawn large and scaled down by `tools/art/reference.py`. The sizes below are game pixels; the built files are 3 times larger (`RES` in `tools/art/lib.py`), so a source should have at least 3 times the game size in detail: a person at least 120 px tall, a close-up at least 576 px wide.

| Asset | Game size | Source layout expected |
|---|---|---|
| Village map | 768×512 (source 1536×1024, scale 0.5) | One top-down picture; changing layout means changing collisions in `js/map.js`. |
| Hero walk/idle | frames 28×44, person 40 px tall | Source 1536×1024 on flat `#26222f`, no labels: rows walking toward the viewer, away, sideways (8 frames + 1 standing each), then 4 idle frames facing the viewer. Walk cycle: contact, down, passing, up, then the same with the other foot; arms swing against the legs. Figures are found automatically (see `HERO_*` in `reference.py`). |
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
