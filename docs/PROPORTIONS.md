# Decision record: sizes and proportions

Written so the game can be rebuilt in any language or engine. Nothing here depends on JavaScript, canvas or Python. Sizes are in **game pixels**, the unit the world is authored in; the screen then scales everything together.

Status: decided by the owner through playtesting, November 2026. The sizes in the tables are enforced by `tests/proportions.test.js`, and that file is the check to run after any art change.

## The one rule

**A person is the yardstick: 40 game pixels tall.** That stands for about 1.75 m, so **1 metre is about 23 px**. Every object is judged against a person standing next to it. If it would look wrong in real life, it is wrong in the game.

Do not fix a wrong-looking object alone. First check whether the whole picture is at the wrong scale. Scaling one bench made it look foreign; scaling the whole picture fixed the bench and everything else.

## Sizes

| Thing | Size in px | Real size it stands for | Note |
|---|---|---|---|
| Person standing | 38–42 tall, about 16 wide | 1.75 m | Hero, grandma, seller, lads. Sprite cell 28×44. |
| Person sitting on a bench, with the bench | 30–38 tall, 24–34 wide | | Never taller than a standing person. |
| Door or gate | about 50 tall | 2 m | A little taller than a person, not much more. |
| Bench | about 40–50 wide | 1.7 m | |
| Well ring | about 40 wide | 1 m plus exaggeration | |
| Tree | 3–4 people tall, 120–160 | 5–7 m | On the old map they were only 1.5 people, and it looked like a toy. |
| Cat sitting | 10–15 tall | 0.3 m | Reaches a person's knee. |
| Cat standing | 14–22 long, about 11 tall | 0.45 m | Deliberately a little larger than life to stay readable. |
| Dog sitting | 12–19 tall | 0.5–0.6 m | |
| Dog standing | 14–24 long | | |
| Hen, rooster | 11–16 tall | 0.4 m | About as tall as a sitting cat. |
| Moped | 36–46 long | 1.8 m | |
| Truck | 46–58 tall | 2.5 m | |
| Fridge | 36–46 tall | 1.5 m | |
| Stove | 22–32 tall | 0.85 m | Slightly exaggerated. |
| TV on its cabinet | 28–38 tall | 1.2 m | |
| Bed | 50–74 long | 2 m, seen at an angle | |
| Table | 22–32 tall | 0.75 m | Slightly exaggerated. |
| Bottle on a table | 8–12 tall | 0.25 m | Twice life size, or it cannot be seen. |

Small things are drawn slightly larger than life on purpose, because below about 10 px they stop reading. People's height and door height are not flexible; animals may go up only until they compete with a person. The owner rejected a cat at 24 px sitting (taller than half of grandpa) and rejected hens at 11 px once cats were reduced, so both are bounded from the two sides.

## Scaling source pictures into the game

Pictures are generated large and scaled down. Measure a known object, then pick the scale:

`scale = wanted game pixels / pixels in the source picture`

| Source | Scale | Result | Check |
|---|---|---|---|
| Approved style outdoors, 1536×1024 (yard, road) | **0.37** | A gate 140 px tall in the source becomes 52 | Gate is 1.3 people. |
| House room, 1536×1024 | 0.25 | Doorway 190 px becomes 47 | Room is about 384×256. |
| Shop scene, 1448×1086 | 0.23 | Door 200 px becomes 46 | Furniture in this scene is still too big and is to be redrawn. |
| Old map crops (club, stop, pond) | 0.65 | Door about 75 px becomes 49 | To be replaced by the approved style. |
| Furniture and prop sheets | per object | Each object gets its own target height | Image generation does not hold one scale inside a sheet. |

When ordering art at 1536×1024 for a 0.37 scale, ask for a person of about 108 px and a door of about 125 px. Image generation drifts, so always measure the result.

## How objects meet

- **Feet line.** A thing's position is the point where it touches the ground. Everything in a location is drawn in order of feet line, top to bottom, so nearer things cover farther ones. This is what makes people walk behind things correctly.
- **Walls are about feet, not bodies.** The hero collides as a small box round the feet, 8 wide and 3 deep. Only the base of an object is a wall. The upper body overlaps the wall behind it, and that is right for this camera.
- **Walk-behind objects** are drawn again over the hero, cut to their **real outline**, never a rectangle. A rectangle makes the hero vanish behind empty air.
- **Fitting into the picture.** Sprites placed on a painted picture need the picture's light and a soft shadow on the ground, otherwise they look like stickers. Here animals get a warm tint (red ×1.05, green ×0.97, blue ×0.8), a thin half-transparent dark brown outline where needed, and an ellipse shadow at the feet.

## Screen

- Portrait phone first: 375–430 px wide, 800+ px tall. Location pictures should be at least 270 game px tall to fill it.
- The world zoom is chosen per location to cover the screen, never showing fewer than 120 game px across. The zoom is a whole number of screen pixels per game pixel on high-density phones, so pixels stay square.
- Moving at 55 px per second on foot and 95 on the moped, a person crosses a screen width in about 2.5 seconds.

## If you rebuild the game

Keep the yardstick, the feet line and the walls at the feet. With those three the world will feel the same at any resolution: if the new engine draws a person at 80 px, multiply every number here by two.
