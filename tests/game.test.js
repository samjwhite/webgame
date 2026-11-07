// What must keep working after any change. Run: npm test
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { startGame, ROOT } = require("./harness");

let game;
test.before(async () => {
  game = await startGame();
});
test.beforeEach(() => {
  game.inGame(`() => {
    Object.assign(quest, newQuest());
    enterLocation(START.location, START);
    resetChickens();
    keysDown.clear();
    dialog.open = false;
    closeup.type = null;
    travel.active = false;
    menu.hidden = true;
    mode = "world";
    grandmaWalk.wait = 1e9;
    grandmaWalk.next = 1;
    npcs[0].x = GRANDMA_ROUTE[0].x;
    npcs[0].y = GRANDMA_ROUTE[0].y;
  }`);
});

test("all art the game asks for is there", () => {
  const files = game.inGame("() => Object.values(ART_FILES)");
  const missing = files.filter((file) => !fs.existsSync(path.join(ROOT, "art", file)));
  assert.deepStrictEqual(missing, []);
});

test("every location: all ways in, ways out, people and things can be reached", () => {
  const problems = game.inGame(`() => {
    const problems = [];
    Object.assign(quest, { stage: "done", mopedFound: true, backpackShown: true, unload: "working" });
    for (const id of Object.keys(LOCATIONS)) {
      currentLocation = id;
      const points = kitWalkable();
      const near = (s, r) => points.some(([x, y]) => Math.hypot(x - s.x, y - s.y) < r);
      Object.values(LOCATIONS).flatMap((l) => l.exits).filter((e) => e.to === id).forEach((e) => {
        if (isBlocked(e.spawn.x, e.spawn.y)) problems.push(id + ": arrival inside a wall " + e.id);
        if (!near(e.spawn, 3)) problems.push(id + ": arrival cut off " + e.id);
      });
      here().exits.filter((e) => e.to).forEach((e) => {
        if (!points.some(([x, y]) => isInside(x, y, e.area))) problems.push(id + ": cannot reach exit " + e.id);
      });
      [...npcsHere(), ...Object.values(places).filter((p) => p.location === id)].forEach((t) => {
        if (!points.some((p) => kitCanUse(p, t))) problems.push(id + ": cannot reach " + (t.sprite || t.id));
      });
      animals.filter((a) => a.location === id).forEach((a) => {
        if (!near(a, 12)) problems.push(id + ": animal off the ground at " + a.x + "," + a.y);
      });
      for (const [name, s] of Object.entries({ START, WAKE_UP_SPOT, MORNING_SPOT, CLUB_PARKING, moped: newQuest().moped })) {
        if (s.location === id && !near(s, 3)) problems.push(name + " is inside a wall");
      }
    }
    return problems;
  }`);
  assert.deepStrictEqual(problems, []);
});

test("walking along the road never opens a closed way or leaves the road", () => {
  const problems = game.inGame(`() => {
    currentLocation = "street";
    const problems = [];
    for (const [x, y] of kitWalkable()) {
      if (y < 163 || y > 249) continue;
      player.x = x;
      player.y = y;
      for (const dx of [1, -1]) {
        const closed = closedExitAhead(dx, 0);
        if (closed) problems.push(closed.id + " opens when passing at " + x + "," + y);
      }
      const open = here().exits.find((e) => e.to && isInside(x, y, e.area));
      if (open && y >= 163 && y <= 249) problems.push(open.id + " catches a hero on the road at " + x + "," + y);
    }
    return problems.slice(0, 10);
  }`);
  assert.deepStrictEqual(problems, []);
});

test("walking straight at a closed gate says why", () => {
  const said = game.inGame(`() => {
    const results = [];
    currentLocation = "street";
    for (const id of ["lockedMykola", "lockedLyuba", "lockedSvitka"]) {
      const area = here().exits.find((e) => e.id === id).area;
      const fromAbove = id === "lockedSvitka";
      player.x = (area[0] + area[2]) / 2;
      player.y = fromAbove ? area[1] - 1 : area[3] + 3;
      results.push(Boolean(closedExitAhead(0, fromAbove ? 1 : -1)));
    }
    return results;
  }`);
  assert.deepStrictEqual(said, [true, true, true]);
});

test("dialogs move on with the A button only", () => {
  const result = game.inGame(`() => {
    openDialog(["one", "two"]);
    dialog.shown = dialog.text.length;
    input.tap = { x: 100, y: 100 };
    update(0.02);
    const afterTap = dialog.text;
    kitPress();
    return [afterTap, dialog.text];
  }`);
  assert.deepStrictEqual(result, ["one", "two"]);
});

test("grandma never blocks: the hero walks through her, and things beat her at A", () => {
  const problems = game.inGame(`() => {
    const problems = [];
    kitGo("yard");
    const grandma = npcs[0];
    Object.assign(quest, { stage: "done", backpackShown: true });
    const spots = GRANDMA_ROUTE.filter((p) => p.stop);
    if (spots.length < 3) problems.push("she has fewer than 3 stops");
    for (const stop of spots) {
      grandma.x = stop.x;
      grandma.y = stop.y;
      player.x = stop.x;
      player.y = stop.y + 3;
      if (isBlocked(stop.x, stop.y)) problems.push("hero blocked by her at " + stop.x);
      for (const id of ["shed", "backpack", "well"]) {
        const t = places[id];
        if (Math.hypot(t.x - stop.x, t.y - stop.y) < TALK_DISTANCE) problems.push("stop at " + stop.x + " crowds " + id);
        const spot = kitWalkable().filter((p) => kitCanUse(p, t)).sort((a, b) => Math.hypot(a[0] - t.x, a[1] - t.y) - Math.hypot(b[0] - t.x, b[1] - t.y))[0];
        player.x = spot[0];
        player.y = spot[1];
        const found = nearestTarget();
        if (!found || found.id !== id) problems.push("at " + id + " A uses " + (found && found.id));
      }
      player.x = stop.x + 6;
      player.y = stop.y + 4;
      const near = nearestTarget();
      if (!near || near.id !== "grandma") problems.push("beside her A uses " + (near && near.id));
    }
    return problems;
  }`);
  assert.deepStrictEqual(problems, []);
});

test("grandma walks her route and waits for a hero who is near", () => {
  const result = game.inGame(`() => {
    kitGo("yard");
    const grandma = npcs[0];
    player.x = 40;
    player.y = 200;
    grandmaWalk.wait = 0;
    grandmaWalk.next = 1;
    const start = [grandma.x, grandma.y];
    for (let i = 0; i < 60; i++) updateGrandma(0.05);
    const moved = grandma.x !== start[0] || grandma.y !== start[1];
    player.x = grandma.x + 5;
    player.y = grandma.y;
    const here = [grandma.x, grandma.y];
    for (let i = 0; i < 60; i++) updateGrandma(0.05);
    return [moved, grandma.x === here[0] && grandma.y === here[1]];
  }`);
  assert.deepStrictEqual(result, [true, true]);
});

test("the garden works only when standing on it", () => {
  const result = game.inGame(`() => {
    kitGo("yard");
    quest.stage = "beetles";
    const [left, top, right, bottom] = GARDEN_AREA;
    const beside = kitWalkable().filter(([x, y]) => !isInside(x, y, GARDEN_AREA) && Math.abs(x - left) < 10 && y > top && y < bottom);
    const wrong = beside.filter(([x, y]) => {
      player.x = x;
      player.y = y;
      const t = nearestTarget();
      return t && t.id === "garden";
    }).length;
    player.x = left + 20;
    player.y = top + 40;
    return [wrong, nearestTarget().id];
  }`);
  assert.deepStrictEqual(result, [0, "garden"]);
});

test("the shop's seller works from the steps and the door, and not from far away", () => {
  const result = game.inGame(`() => {
    kitGo("shop");
    const at = (x, y) => {
      player.x = x;
      player.y = y;
      const t = nearestTarget();
      return t && t.id;
    };
    return [at(112, 146), at(112, 158), at(140, 150), at(200, 200)];
  }`);
  assert.deepStrictEqual(result, ["valya", "valya", "valya", null]);
});

test("nothing fails to draw: every location by day and night, and every picture", () => {
  game.inGame(`() => {
    for (const id of Object.keys(LOCATIONS)) {
      for (const time of ["day", "night"]) {
        quest.time = time;
        kitGo(id);
        draw(1000);
      }
    }
    quest.time = "day";
    for (const [picture, effect] of [["tsn", "tv"], ["sleep", "sleep"], ["sleep", "dawn"], ["nightfall"], ["disco", "disco"], ["fridgeOpen", "fridge"], ["talkLads", "hit"]]) {
      showPicture(picture, ["x"], finishCloseup, effect);
      draw(1000);
      kitFinishDialogs();
    }
  }`);
});

test("the TV has a picture for every line of every bulletin, in every language", () => {
  const problems = game.inGame(`() => {
    const problems = [];
    for (const language of LANGUAGES) {
      TEXTS[language].tsn.forEach((bulletin, i) => {
        if (!NEWS_PLAN[i] || NEWS_PLAN[i].length !== bulletin.length) problems.push(language + " bulletin " + i);
      });
    }
    NEWS_PLAN.flat().forEach((frame) => {
      if ((frame + 1) * NEWS_SCREEN.w > ART.newsFrames.width) problems.push("no news picture " + frame);
    });
    return problems;
  }`);
  assert.deepStrictEqual(problems, []);
});

test("all languages have the same texts", () => {
  const problems = game.inGame(`() => {
    const paths = (o, p = "") => Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" && !Array.isArray(v) ? paths(v, p + k + ".") : [p + k]));
    const base = paths(TEXTS.uk);
    return LANGUAGES.flatMap((l) => {
      const keys = paths(TEXTS[l]);
      return [...base.filter((k) => !keys.includes(k)).map((k) => l + " lacks " + k), ...keys.filter((k) => !base.includes(k)).map((k) => l + " extra " + k)];
    });
  }`);
  assert.deepStrictEqual(problems, []);
});

test("saving and loading puts the hero back; an old save starts safely in the yard", () => {
  const result = game.inGame(`() => {
    kitGo("shop");
    player.x = 120;
    player.y = 170;
    quest.money = 7;
    saveGame();
    quest.money = 0;
    enterLocation("yard", DEV_YARD);
    continueGame();
    const same = [currentLocation, player.x, player.y, quest.money];
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, quest: { ...newQuest(), money: 9, moped: { x: 999, y: 999 } }, location: "pond", player: { x: 900, y: 900, dir: "up" } }));
    continueGame();
    const old = [currentLocation, quest.money, isBlocked(player.x, player.y), quest.moped.location];
    clearSave();
    return [same, old];
  }`);
  assert.deepStrictEqual(result, [["shop", 120, 170, 7], ["yard", 9, false, "yard"]]);
});

test("developer checkpoints: each one lands on free ground with a working task", () => {
  const problems = game.inGame(`() => {
    return DEV_CHECKPOINTS.flatMap((checkpoint, index) => {
      devJump(index);
      const problems = [];
      player.moving = false;
      if (isBlocked(player.x, player.y)) problems.push(checkpoint.name + ": inside a wall");
      if (!currentObjective()) problems.push(checkpoint.name + ": no task");
      update(0.02);
      draw(1000);
      return problems;
    });
  }`);
  assert.deepStrictEqual(problems, []);
  game.inGame("() => clearSave()");
});

test("developer panel appears only with ?dev", async () => {
  const devGame = await startGame({ search: "?dev" });
  assert.strictEqual(devGame.sandbox.document.body.children.length, 2);
  assert.strictEqual(game.sandbox.document.body.children.length, 0);
});

test("the whole story can be played, from the bus to the second morning", () => {
  const log = game.inGame(`() => {
    const log = [];
    const expect = (condition, what) => {
      if (!condition) kitFail("Story broke at: " + what + " (stage " + quest.stage + ", in " + currentLocation + ")");
      log.push(what);
    };

    startNewGame();
    kitFinishDialogs();
    expect(mode === "world" && currentLocation === "stop", "arrive at the bus stop");

    // Grandma's errands.
    kitGo("yard");
    kitTalk("grandma");
    expect(quest.stage === "water", "grandma asks for water");
    kitCrankWell();
    expect(quest.hasWater, "water from the well");
    kitTalk("grandma");
    expect(quest.stage === "beetles", "grandma asks for beetles");

    kitFillJar();
    expect(quest.beetlesCaught === BEETLE_COUNT, "a jar of beetles");
    kitTalk("grandma");
    expect(quest.stage === "shop" && quest.money === 5, "grandma pays and sends to the shop");

    kitGo("shop");
    kitTalk("valya");
    expect(quest.hasGroceries && quest.money === 0, "groceries bought");
    kitGo("yard");
    kitTalk("grandma");
    expect(quest.stage === "evening", "grandma mentions the disco");

    // First try at the club goes badly.
    kitGo("club");
    kitUse("lads");
    kitFinishDialogs();
    expect(quest.metLads && quest.beatings === 1 && currentLocation === "yard", "beaten and back at grandma's");
    expect(quest.backpackShown, "grandma mentions the tracksuit");
    expect(!isBlocked(player.x, player.y), "wakes up on free ground");

    kitTalk("grandma");
    expect(quest.stage === "chickens", "grandma asks about the chickens");
    kitHerdChickens();
    expect(quest.mopedFound && quest.moped.location === "yard", "the moped found by the shed");
    kitTalk("grandma");
    expect(quest.stage === "done", "grandma gives the moped");

    // Getting ready.
    kitUse("backpack");
    kitFinishDialogs();
    expect(quest.outfit === "sport", "tracksuit on");
    kitFillJar();
    expect(quest.money === 2, "a second jar earns money");

    kitGo("shop");
    kitTalk("valya");
    expect(quest.unload === "working", "the seller asks for help with the truck");
    for (let crate = 0; crate < CRATE_COUNT; crate++) {
      kitUse("truck");
      kitFinishDialogs();
      kitTalk("valya");
    }
    expect(quest.unload === "done" && quest.money === 6, "truck unloaded and paid");
    for (let beer = 0; beer < BEERS_NEEDED; beer++) kitTalk("valya");
    expect(quest.beersDrunk === BEERS_NEEDED, "three beers");

    kitGo("yard");
    kitUse("moped");
    kitFinishDialogs();
    expect(quest.riding, "riding the moped");

    // The disco, and night falls.
    kitGo("club");
    kitUse("lads");
    expect(closeup.picture === "talkLads", "the lads talk");
    for (let i = 0; i < 400 && !quest.discoDone; i++) kitPress();
    expect(quest.discoDone && isNight(), "night falls and the disco happens");
    kitFinishDialogs();
    getOffMoped();

    kitGo("shop");
    expect(!npcsHere().some((n) => n.id === "valya"), "the seller has gone home");
    kitTalk("shopDoor");
    log.push("the shop is shut for the night");
    kitGo("yard");
    expect(!npcsHere().some((n) => n.id === "grandma"), "grandma has gone in");

    // At home.
    kitGo("house");
    for (let bulletin = 0; bulletin < T().tsn.length; bulletin++) {
      kitUse("tv");
      expect(closeup.picture === "tsn", "TV news " + (bulletin + 1));
      draw(1000);
      kitFinishDialogs();
    }
    kitTalk("borscht");
    expect(quest.ateBorscht, "borscht");
    kitTalk("varenyky");
    expect(quest.ateVarenyky, "varenyky");
    kitUse("fridge");
    expect(closeup.effect === "fridge", "the fridge opens");
    kitFinishDialogs();
    kitUse("bed");
    kitFinishDialogs();
    expect(quest.day === 2 && !isNight() && !quest.ateVarenyky, "sleep brings the second morning");

    kitGo("yard");
    kitUse("grandma");
    expect(quest.metGrandmaToday, "grandma greets the new day");
    kitFinishDialogs();
    expect(Boolean(currentObjective()), "there is a task on day 2");
    return log;
  }`);
  assert.ok(log.length > 20, `played ${log.length} steps`);
});
