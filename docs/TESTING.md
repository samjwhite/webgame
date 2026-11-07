# Testing

## Automatic tests

```
npm test
```

They need only Node 22 or newer, with nothing to install, and take a few seconds. GitHub runs them on every push to `dev` and on every pull request, and `main` will not publish to players if they fail.

They run the real game code without a browser (`tests/harness.js`) and play it the way a player does: stand somewhere and press A (`tests/kit.js`).

| What is checked | Where | Protects against |
|---|---|---|
| The whole story, bus to second morning and Svetka by the shop, in order: sprayer, beating, saving midway, waiting for the evening | `game.test.js` | A change that makes the game impossible to finish |
| The disco's other way: asking the unknown girl to dance, every choice after the dance, saved and continued | `game.test.js` | A branch that cannot be finished or forgets what happened |
| Day parts: shown as "День 1 / 92 · Ранок", only forward, waiting only at a ready scene, a new day only after sleep | `game.test.js` | Free rewinding, or an evening scene that spends a day |
| Saves from before the summer story load and go on | `game.test.js` | Old players stuck after an update |
| Dialogs name who speaks | `game.test.js` | Lines given to the wrong person |
| Every location: arrivals, exits, people and things reachable; nothing starts inside a wall | `game.test.js` | Walls moved by new art cutting off a path |
| Walking along the road never triggers a gate or an exit | `game.test.js` | Dialogs popping up when just passing by |
| Closed gates still say why when walked into | `game.test.js` | Silent walls |
| Dialogs move on with A only | `game.test.js` | Accidental skipping |
| Grandma never blocks the hero or takes A from an object; she walks and waits | `game.test.js` | Moving characters blocking quests |
| The garden works only standing on it; the shop works from its steps | `game.test.js` | Actions firing from the wrong place |
| Everything draws, day and night, every picture | `game.test.js` | Missing or misnamed art |
| News has a picture for every line, in every language | `game.test.js` | Text and pictures drifting apart |
| The hero's remarks last long enough to read and wait while a dialog or a panel would hide them | `game.test.js` | Text cut off or hidden under buttons |
| All languages have the same texts | `game.test.js` | Missing translations |
| The shop's list: prices, not enough money, the bag, beer only when asked for | `game.test.js` | Spending money wrongly, goods with no art or text |
| Saves load, and old saves land safely | `game.test.js` | Heroes stuck in walls after an update |
| Developer checkpoints still work | `game.test.js` | The panel going stale |
| Sizes follow `docs/PROPORTIONS.md` | `proportions.test.js` | Art at the wrong scale |

**Fixing a bug? Add its test first.** The list above is mostly bugs that really happened.

## What tests cannot see

These still need a person, ideally on a phone:

- whether art looks right, fits the place and feels of the time;
- whether a sprite is readable, and whether cuts are clean;
- real touch controls, speed and smoothness on a phone;
- whether jokes land and whether the news is accurate (`docs/TSN_FACTS.md`).

A later step could add a real browser with screenshot comparison (for example Playwright). It would catch unwanted visual changes and touch problems, but it needs an installed browser and slows the checks, so it is not set up yet.

## Developer panel

Open the game with `?dev` at the end of the address. A red **DEV** button appears with:

- a jump to each point of the story, from the bus to the second morning;
- the next part of the day (morning, day, evening, night; developers only, players never go back), +10 UAH and showing the walls.

Add a checkpoint to `DEV_CHECKPOINTS` in `js/dev.js` whenever a quest is added. The tests check each one automatically. Jumping overwrites the save in that browser, and players never see the panel.
