# Handoff to the art designer: separate village locations

**Assign to:** ChatGPT (art designer)

**Task:** Design the look of Makitryne's separate full-screen locations and draw the art listed below, starting with one approved test location (grandma's yard) before the rest.

**Context:** "Літо в селі" is a pixel-art quest game set in a village in Poltava region, Ukraine, in summer 2003. The village used to be one painted map. It is now split into separate locations joined by paths. Each location fills the phone screen, and only that location is visible. The engine already works with temporary art: crops of the old map, plus a rough interior drawn by code. All of that temporary art is to be replaced. Read `docs/ART_BIBLE.md`, `AGENTS.md`, `js/map.js` and `tools/art/locations.py`.

**Where to upload: the `dev` branch, not `main`.** `main` stays stable. The owner's decision, see `AGENTS.md`. Earlier uploads to `main` were only art in `incoming/` and are already on `dev` too.

**Status:** cats, dogs and the shop scene are delivered and in the game on `dev`. Every animal coat is used. Grandma's walking sheet is being done with Codex as a candidate. Other characters' movement comes later.

**Approved style:** `tools/art/reference/loc_yard.png`. The owner approved this yard and wants everything else in this style. It is in the game on `dev`.

**Done with Codex and in the game on `dev`:** the house room and furniture, the TV close-up with news pictures, the night picture of the club, the monument and roadside trees. Still wanted: **night versions of every location**. Night is still a blue tint with lamps by code; the owner asked for a drawn night village or a good filter.

## Art direction (from the product owner)

- **Our own look.** Do not copy Stardew Valley or Cast n Chill, or any other game. This has to be a design of its own.
- **A real Poltava yard, early 2000s.** Base yards on real ones. No tidy Japanese-style cute sheds and no neat decorative flowerbeds. Authentic and Ukrainian, with no "sharovary" kitsch: no folk-costume clichés, no decorative sunflowers and embroidery everywhere.
- **Exactly 2003.** Everything visible must really be there in 2003: not from the future, and not a Soviet museum either. Old Soviet-made things are fine when they are simply still in use, aged and repaired, like a 1979 fridge or a tired tractor. No Soviet slogans kept as decoration, except the statue joke below.
- **Lived-in.** Repairs made with whatever was at hand, peeling paint, things leaning against walls, grass where nobody walks and bare soil where they do.
- **Every object is its own sprite.** No object is baked into the ground picture.

### Plants: only what really grows in the Middle Dnieper and Poltava region

The owner's requirement: show the vegetation of this forest-steppe region, not random foliage from Japanese-style mini-games. The current art has many generic trees and fir trees, and they should not carry over. Starting list, from general knowledge, to check against real references:

- **Yard and orchard trees:** cherry, sour cherry, apple, pear, plum, apricot, mulberry, walnut
- **Village and roadside trees:** poplar, lime, ash, maple, white acacia (robinia), oak, a willow by water. Conifers only where there is a reason, such as one planted by the club, not scattered through the village.
- **Shrubs:** lilac, elder, guelder rose (калина), hazel
- **By the pond:** reeds, bulrush (рогіз), sweet flag (лепеха), willows, water lilies
- **Weeds where nobody walks:** nettle, burdock, wormwood, goosefoot, knotgrass on paths
- **Garden and flowers, kept untidy:** potatoes, beans on poles, maize, a few sunflowers, pumpkins on the compost heap, hollyhocks (мальви) and marigolds by the fence
- **Season:** high summer, with some dry yellowing grass

### What a real yard of the time could contain

Suggestions to check against real references, not a required list:

- Whitewashed or plastered house with wavy asbestos-slate roof, blue window frames, patched plaster, a small enclosed porch (веранда)
- Separate summer kitchen, shed, chicken coop, root cellar mound (погріб), outdoor toilet, woodpile, coal or firewood heap
- Yellow gas pipe along the fence, gas meter, single overhead wire from the pole to the house, TV aerial on a pole
- Fence that changes along its length: old pickets, slab wood, wire mesh (рабиця), sheet metal, a welded gate
- Potato rows, a few tomatoes tied to sticks, cabbages, cherry and apple trees, a grapevine over a pipe frame
- Washing line, enamel buckets, plastic bottles on sticks, a rusty barrel for rainwater, an old pram used as a cart, a bicycle against the wall

**Reference gap:** my web search found text descriptions but no usable photos of real Poltava yards from that time. The closest lead is the Poltava section of the Pyrohiv open-air museum, which shows older traditional houses rather than 2003. Please use real photographs where you can find them, and tell the human which ones you used. The human may also provide family or village photos.

## Technical requirements

Everything in game pixels. **Real-world proportions matter most: the owner rejected art where the hero looked like a small child next to the objects.** The hero and grandma are about 40–44 tall. So a door is a little taller than the hero (about 24 wide and 50 tall), a bench about 47 wide, a well ring about 38 wide, a window sill below the hero's shoulders. Check every object next to the hero before delivering. Measured rule: approved pictures go into the game at 0.37, so in a 1536×1024 picture a person is about 108 px tall and **a door or gate 2 m tall should be about 125 px, not 140 or more**. Draw to that from the start.

Sizes in the game, against people 40 px tall: a sitting cat about 12 tall and a standing cat about 18 long, a dog about 16 tall, a hen about 10 tall, a moped about 39 long. **A tree should be three or four times a person's height**: on the old map trees are barely one and a half, and the owner noticed. Did Petro also needs a real sitting sprite for his bench; he is only squashed by code for now.

- **Location picture:** 768×512 (draw at 1536×1024, the pipeline scales by 0.5). Top-down view with the same camera angle as the current art. Minimum height 290 so a phone screen is filled. The game is played in portrait, so important things should not sit only at the far edges.
- **Ground layer:** the location picture contains only what the hero walks on or never walks behind: ground, paths, water, grass.
- **Object sprites:** each on a flat `#26222f` background or transparency, clearly separated, with no labels. Say where each object's foot line is. The hero walks behind anything above that line, and clean separate sprites are what make him disappear behind an object's real outline rather than a square.
- **Sheets:** every frame the same scale and ground line, frames not touching, no labels.
- **Night:** see "Night" below. Prefer separate night versions of windows, lamps and doors, because the whole picture gets darkened by code.
- **Paths:** each location needs clear paths leaving it at the points listed, so the player sees where to walk. The game also shows a still yellow arrow at every open way out, with no text and no animation (the owner rejected both as visual clutter). It is drawn by code for now.
- **Text in art:** only short Ukrainian signs. Any text must be spelled correctly.
- **Not guaranteed by image generation:** exact sizes, exact background colour and pixel grid. Flag what you could not hold to. Claude Code will crop and validate.

## What to draw

Priority: **A** needed for the next test, **B** soon after, **C** later.

### 1. Grandma's yard: house, potato garden, well (A, draw first as the style test)

Exits: path south towards the road. Door into the house.

Sprites: house with a door that opens or closes, shed (closed and open, chickens go in here, moped under tarp inside), well (ring, posts, roof, crank; the close-up scene already exists), fence pieces and gate, power pole, potato beds, woodpile, summer kitchen, cellar mound, washing line, bench, gas pipe. Existing characters and chickens stay as approved.

### 2. Inside the house (A)

Exit: door to the yard. Interior around 320×300 to 480×360. Painted floor, whitewashed walls, window to the yard.

Sprites, each separate: **bed** (metal frame, wall rug above it), **TV** (old wooden-case set on a cabinet with a doily), **fridge** (1979 "Дніпро", humming, already mentioned in dialogue), **stove with a pot of borscht**, **table with oilcloth**, **plate of varenyky under a towel** (full and empty versions), plus an icon corner with a rushnyk kept modest, a wall calendar for 2003, and a sideboard. Also an **open fridge close-up** (192 wide, shelves and door interior): the game shows the food on it with captions under each item.

### 3. Club and square (A)

Exit: gate in the fence south to the road.

Sprites: Будинок культури as one piece, including a door that can look open and lit at night, statue with pedestal (repainted Lenin-to-Shevchenko joke stays, see the art bible), flower bed that looks neglected, benches, fence and gate, faded posters, disco poster, working street lamp.

### 4. Shop "Продукти" (A)

**To redraw, from the owner:** the proportions of this scene are off and the grass and path are placeholders. Chairs are nearly as tall as the 44 px hero when they should reach his waist, and the tables are too large with them. Keep the design, but make the furniture human-sized against the door, and draw real grass and a real earth path of some length leading up from the south into a roomier yard, with the shop further back to the north and no road in the picture.

**Delivered and in the game:** `incoming/village_shop_beer_garden.png`, with its road cut off and a temporary path added, because the owner wants a path leading up into the yard, the shop set back to the north. Please redraw that south edge properly: a path of some length from the road into the yard. Still wanted as separate sprites, because they are baked into the scene: seller in the window, dog, tables and chairs (delivered in `shop_beer_garden_props.png`, not used yet), and a closed door with padlock (a rough one is painted by code).

Exit: path south to the road.

Sprites: shop building with **open door by day, closed door with padlock and cardboard sign by night**, porch steps, crates, barrel, bench, delivery truck (already exists, may be redrawn), barn, fence. Ukrainian sign stays "Продукти".

### 5. Bus stop (B)

Exit: path north to the road.

Sprites: concrete shelter with faded mosaic, bench, bus sign, timetable, bin, old notices, a yellow "Богдан" bus for the arrival scene (optional).

### 6. Pond with Did Petro (B)

Exit: north, straight onto the road, right by Did Petro's bench. This is the only way in. The owner found the place hard to find, so the pond, the bench and Did Petro must be visible from the road. Please redraw this entrance: the path on the temporary art is painted on as a stopgap, and it may be shorter or gone if he is simply reached from the road. The older path further east along the pond is not a way to Did Petro; it leads to Svetka's house.

Sprites: pier, boat, reeds, willow, fence, bench, fishing rod and bucket, **a full-height Did Petro** (the bible lists this as still wanted), water lilies.

### 7. The road through the village (A: start at grandma's gate)

**Done with Codex and in the game on `dev`:** the whole road, in `reference/road_west.png`, `road_at_yard.png` and `road_east.png`, joined in `tools/art/locations.py`. The task below is kept as the reason. Each location still in the old style needs to meet its gateway here.

**Priority task from the owner: the way from the road to grandma's yard.** It still looks like the old design, and then the yard opens in a completely different one, with nothing joining them. Redraw the part of the road in front of the yard in the approved style so the two read as one place. The bottom of `tools/art/reference/loc_yard.png` already shows this spot: the same rusty double gate, patchwork fence, yellow gas pipe and cracked road must be visible from the road. Walking through that gate is where the location changes, so what the player sees just before and just after has to match. The gate stands at the middle of the yard's south fence; on the road location its turn-off is on the north side. Do the same for the other turn-offs as each location gets redrawn.

This is the joining location, which the owner did not list: the paths to all locations start here. It is a long strip, currently 1536×290 in temporary art. It may become wider or shorter if you have a better layout. It needs a cracked road, poles and wires, fences, and visible turn-offs to each place.

### 8. Locked houses (C for interiors, B for the outside)

Three houses not in the story yet, closed for now and shown as closed on the map. They open later in the story:

- Grandpa Mykola's yard (gate on the north side of the road, west)
- Granny Lyuba's yard (north side of the road)
- Svetka's house (south side of the road, with a greenhouse and vegetable beds; reached by the path that runs east of the pond)

Names are working titles. Needed now: only what shows from the road (gate, fence, roof).

### 9. Village map screen (A)

768×512 top-down, same places. Remove the legend's quest markers and the "!" above the shop. Provide each locked house so that it can look closed, for example a **separate greyed-out overlay per house**, and a marker for "you are here".

### 10. Night (A)

The owner wants night to be obvious. Please define the night look and draw at least:

- The moon, as a sprite, and a **nightfall scene** (192 wide) of the village or club at dusk with the moon up and lights coming on
- Glowing windows and lamps for the yard, club, road and bus stop
- Closed shop door with padlock and sign (see above)
- If a colour tint is not enough, full night versions of each location

### 11. Story screens (A)

Close-ups, 192 wide, any landscape height:

- **Sleep screen.** The owner left this to you: how sleeping is shown, then how morning comes. It should work for every night in the game.
- **TSN news on the TV**, showing 2003-era TV news on an old set. Claude Code currently paints "ТСН" and "1+1" on a plain screen by code. Avoid copying the real channel's logo exactly unless the human approves it.
- Close-ups for eating borscht and varenyky (optional, **C**)

## Inputs

- `tools/art/reference/*.png`: approved art. `village_map.png` shows the current layout. `collage.png`, `grandma.png`, `seller.png`, `lads.png` and the hero sheets show approved characters. Keep characters as they are unless the human says otherwise.
- `js/map.js`: exits, walls and light positions of each location.
- `tools/art/locations.py`: temporary crops.

## Output

- Source pictures for `tools/art/reference/`, suggested names: `loc_yard.png`, `loc_house.png`, `loc_club.png`, `loc_shop.png`, `loc_stop.png`, `loc_pond.png`, `loc_street.png`, `props_yard.png`, `props_house.png`, and so on, `night_sheet.png`, `sleep.png`, `tsn.png`, `village_map_v2.png`.
- PNG. Never overwrite an existing file in `tools/art/reference/`. New art comes in as candidates first, then human approval.

## Acceptance criteria

- The human approves the grandma's yard style test before the other locations are drawn.
- It reads as a Poltava village yard in 2003: not as another game's style, not a fairy tale and not a museum.
- Nothing from after 2003, and no Soviet items used as decoration. Old items are visibly in use.
- Every interactive or walk-behind object is a separate sprite with a clear foot line, at a size consistent with a 28×44 hero.
- Exits from each location are visible as paths.
- Text is correct Ukrainian.
- Open questions and things image generation could not guarantee are listed with the delivery.

## Dependency / next owner

The human reviews and approves. Then **Claude Code** adds the approved files to `tools/art/reference/`, replaces the temporary crops, updates walls, exits and foot lines in `js/map.js`, adds the sprites, and tests the game on a phone-sized screen.
