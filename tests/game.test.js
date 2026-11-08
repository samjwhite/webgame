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
    Object.assign(quest, { stage: "done", mopedFound: true, backpackShown: true, unload: "working", unlocked: { mykola: true } });
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
    quest.unlocked = {};
    for (const id of ["toMykola", "lockedLyuba", "lockedSvitka"]) {
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
      for (const time of PHASES) {
        quest.time = time;
        kitGo(id);
        draw(1000);
      }
    }
    quest.time = "day";
    for (const [picture, effect] of [["tsn", "tv"], ["sleep", "sleep"], ["sleep", "dawn"], ["nightfall"], ["disco", "disco"], ["discoSvetka"], ["riverDate"], ["fridgeOpen", "fridge"], ["talkLads", "hit"]]) {
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
      if ((frame + 1) * NEWS_SCREEN.w > ART.newsFrames.w) problems.push("no news picture " + frame);
    });
    return problems;
  }`);
  assert.deepStrictEqual(problems, []);
});

test("what is bought stands on the shop's counter", () => {
  const result = game.inGame(`() => {
    kitGo("shop");
    Object.assign(quest, { stage: "shop", money: 5 });
    kitUse("valya");
    const groceries = sellerCounter;
    draw(1000);
    kitFinishDialogs();
    Object.assign(quest, { stage: "done", metLads: true, unload: "done", money: 2, beersDrunk: 0 });
    kitUse("valya");
    const stock = sellerCounter;
    kitFinishDialogs();
    const opened = shopMenu.open;
    shopChoose(shopMenu.rows.findIndex((g) => g.id === "beer"));
    const beer = sellerCounter;
    draw(1000);
    kitFinishDialogs();
    closeShopMenu();
    const missing = [...Object.values(COUNTER_GOODS).flat().map(([art]) => art), ...SHOP_GOODS.map((g) => g.art)].filter((art) => !ART[art]);
    const noCounter = SHOP_GOODS.filter((g) => !COUNTER_GOODS[g.id]).map((g) => g.id);
    return [groceries, opened, beer, stock, missing, noCounter];
  }`);
  assert.deepStrictEqual(result, ["groceries", true, "beer", "stock", [], []]);
});

test("the shop's list: prices, money, the bag, and beer only once it is asked for", () => {
  const result = game.inGame(`() => {
    kitGo("shop");
    Object.assign(quest, { stage: "done", unload: "done", money: 3 });
    kitUse("valya");
    kitFinishDialogs();
    const noBeerYet = !shopMenu.rows.some((g) => g.id === "beer");
    const tapIgnored = (() => {
      input.tap = { x: 100, y: 100 };
      update(0.02);
      return quest.money === 3 && shopMenu.open;
    })();
    shopChoose(shopMenu.rows.findIndex((g) => g.id === "bread"));
    kitFinishDialogs();
    const afterBread = [quest.money, quest.bag.bread];
    shopChoose(shopMenu.rows.findIndex((g) => g.id === "sausage"));
    const tooDear = [quest.money, quest.bag.sausage === undefined, sellerCounter];
    kitFinishDialogs();
    shopMenu.index = shopMenu.rows.length;
    kitPress();
    const closed = !shopMenu.open && mode === "world";
    const bag = bagLine();
    quest.metLads = true;
    const beerOffered = goodsOnOffer().some((g) => g.id === "beer");
    quest.beersDrunk = BEERS_NEEDED;
    const beerGone = !goodsOnOffer().some((g) => g.id === "beer");
    return [noBeerYet, tapIgnored, afterBread, tooDear, closed, bag === T().shop.goods.bread, beerOffered, beerGone];
  }`);
  assert.deepStrictEqual(result, [true, true, [2, 1], [2, true, "bread"], true, true, true, true]);
});

test("every good has a name and a line from the seller in every language", () => {
  const missing = game.inGame(`() => LANGUAGES.flatMap((l) => SHOP_GOODS.filter((g) => !TEXTS[l].shop.goods[g.id] || !TEXTS[l].shop.sold[g.id]).map((g) => l + ":" + g.id))`);
  assert.deepStrictEqual(missing, []);
});

test("no moon is drawn over the world at night", () => {
  assert.strictEqual(game.inGame("() => typeof drawMoon"), "undefined");
});

test("the news stays in summer, and no beer brand is named", () => {
  const texts = ["uk", "en", "it"].map((l) => fs.readFileSync(path.join(ROOT, "js/text", l + ".js"), "utf8"));
  for (const text of texts) {
    assert.ok(!/Славутич|Slavutych/.test(text), "a beer brand is named");
  }
  const news = game.inGame("() => LANGUAGES.map((l) => TEXTS[l].tsn.flat().join(' '))");
  for (const text of news) {
    assert.ok(!/морозк|вимерзл|зими|frost|froze|winter|gelat|invern/i.test(text), "winter in summer news");
  }
});

test("the bottle on the far table: only once the lads asked, once, and it counts", () => {
  const result = game.inGame(`() => {
    kitGo("shop");
    const before = isPlaceAvailable(places.beerBottle);
    quest.metLads = true;
    const asked = isPlaceAvailable(places.beerBottle);
    draw(1000);
    kitUse("beerBottle");
    const spoke = heroSpeech.text;
    const noDialog = !dialog.open;
    const count = quest.beersDrunk;
    const after = isPlaceAvailable(places.beerBottle);
    draw(1000);
    heroSpeech.queue = [];
    heroSpeech.text = "";
    return [before, asked, spoke === T().hero.foundBeer[0], noDialog, count, after];
  }`);
  assert.deepStrictEqual(result, [false, true, true, true, 1, false]);
});

test("at night he says it is time to go home only away from home", () => {
  const result = game.inGame(`() => {
    kitCheckpoint("Ніч: у хаті, новини, сон");
    quest.heroSaid = { house: true, yard: true, club: true, ["tv" + quest.day]: true };
    heroSpeech.queue = [];
    nextHeroLine();
    updateHeroSpeech(0.02);
    const atHome = heroSpeech.text;
    kitGo("yard");
    updateHeroSpeech(0.02);
    const inYard = heroSpeech.text;
    kitGo("club");
    updateHeroSpeech(0.02);
    return [atHome, inYard, heroSpeech.text === T().hero.night];
  }`);
  assert.deepStrictEqual(result, ["", "", true]);
  game.inGame("() => clearSave()");
});

test("the hero remarks once on each place, in a bubble that does not stop the game", () => {
  const result = game.inGame(`() => {
    heroSpeech.queue = [];
    heroSpeech.text = "";
    kitGo("pond");
    update(0.02);
    const first = heroSpeech.text;
    const walking = mode === "world" && !dialog.open;
    draw(1000);
    for (let i = 0; i < 400; i++) {
      update(0.05);
      draw(1000);
    }
    const cleared = heroSpeech.text;
    update(0.02);
    const again = heroSpeech.text;
    // The road has no remark (the owner removed it); every other place has one in every language.
    const missing = LANGUAGES.flatMap((l) => Object.keys(LOCATIONS).filter((id) => id !== "street" && !TEXTS[l].hero.places[id]).map((id) => l + ":" + id));
    return [first === T().hero.places.pond, walking, cleared, again, missing];
  }`);
  assert.deepStrictEqual(result, [true, true, "", "", []]);
});

test("a remark stays long enough to read, and only counts down while it can be seen whole", () => {
  const result = game.inGame(`() => {
    kitGo("yard");
    quest.heroSaid = Object.fromEntries(Object.keys(LOCATIONS).map((id) => [id, true]));
    const short = readingTime("Ой.");
    const long = readingTime(T().hero.foundBeer[0]);
    heroInterrupt([T().hero.foundBeer[0]]);
    const start = heroSpeech.time;
    openDialog(["x"]);
    for (let i = 0; i < 40; i++) {
      update(0.05);
      draw(1000);
    }
    const waitedForDialog = heroSpeech.time === start;
    kitFinishDialogs();
    draw(1000);
    const aboveHead = heroSpeech.visible && heroSpeech.box[3] <= player.y - 40;
    // A panel over his head: the remark moves under his feet.
    const panel = document.getElementById("objective");
    panel.hidden = false;
    const zoom = worldZoom();
    const camY = cameraOffset(player.y, view.height / zoom, ART[locationArt(here())].height);
    const top = (player.y - 70 - camY) * view.scale * zoom;
    panel.rect = { left: 0, right: 5000, top, bottom: top + 30 * view.scale * zoom, width: 5000, height: 30 * view.scale * zoom };
    draw(1000);
    const underFeet = heroSpeech.visible && heroSpeech.box[1] >= player.y;
    // Panels over and under him: it waits, and its time does not run.
    panel.rect = { left: 0, right: 5000, top: -100000, bottom: 100000, width: 5000, height: 200000 };
    draw(1000);
    const before = heroSpeech.time;
    update(0.5);
    const hiddenWaits = !heroSpeech.visible && heroSpeech.time === before;
    panel.rect = null;
    panel.hidden = true;
    heroSpeech.queue = [];
    heroSpeech.text = "";
    return [short >= 3, long > 6, waitedForDialog, aboveHead, underFeet, hiddenWaits];
  }`);
  assert.deepStrictEqual(result, [true, true, true, true, true, true]);
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
    expect(quest.day === 1 && quest.time === "morning", "the first morning");

    // Grandma's errands.
    kitGo("yard");
    kitTalk("grandma");
    expect(quest.stage === "water", "grandma asks for water");
    kitCrankWell();
    expect(quest.hasWater, "water from the well");
    kitTalk("grandma");
    expect(quest.stage === "beetles", "grandma asks for beetles");
    expect(isClubOpen(), "the club square opens after the first errand");

    kitUseGarden();
    expect(quest.stage === "sprayer", "grandma stops the hand-picking and sends for the sprayer");
    kitGo("pond");
    kitTalk("grandpa");
    expect(quest.hasSprayer && quest.deeds.heardCatfish, "grandpa lends the sprayer and mentions the catfish");
    kitGo("yard");
    kitTalk("grandma");
    expect(quest.stage === "spray", "grandma says to spray");
    kitUseGarden();
    expect(quest.sprayed && quest.time === "day" && quest.day === 1, "the potatoes sprayed by midday");
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
    kitUseGarden();
    expect(quest.money === 2, "a jar of beetles from the neighbours earns money");

    kitGo("shop");
    kitTalk("valya");
    expect(quest.unload === "working", "the seller asks for help with the truck");
    for (let crate = 0; crate < CRATE_COUNT; crate++) {
      kitUse("truck");
      kitFinishDialogs();
      kitTalk("valya");
    }
    expect(quest.unload === "done" && quest.money === 6, "truck unloaded and paid");
    for (let beer = 0; beer < BEERS_NEEDED; beer++) kitBuy("beer");
    expect(quest.beersDrunk === BEERS_NEEDED, "three beers");

    kitGo("yard");
    kitUse("moped");
    kitFinishDialogs();
    expect(quest.riding, "riding the moped");

    // A save in the middle of the day keeps the whole story.
    saveGame();
    const saved = JSON.stringify(quest);
    Object.assign(quest, newQuest());
    continueGame();
    expect(JSON.stringify(quest) === saved && currentLocation === "yard", "saved and continued without losing anything");

    // Ready before the evening: the lads say to come back later, or wait with them.
    kitGo("club");
    kitUse("lads");
    expect(closeup.picture === "talkLads", "the lads talk");
    kitFinishDialogs();
    expect(choice.open && quest.time === "day", "the disco is in the evening: wait for it?");
    kitChoose(1);
    expect(mode === "world" && quest.time === "day", "not yet: still midday");
    kitUse("lads");
    kitFinishDialogs();
    kitChoose(0);
    expect(quest.time === "evening" && quest.day === 1, "waiting for the evening keeps the same day");
    kitFinishDialogs();
    expect(choice.open && quest.deeds.svetkaSeen === "disco" && !quest.discoDone, "inside, a girl he does not know");
    kitChoose(1);
    kitFinishDialogs();
    expect(quest.discoDone && isNight() && quest.day === 1, "the disco ends at night, on the same day");
    expect(quest.deeds.svetkaNamed && !quest.deeds.dancedWithSvetka && quest.deeds.svetkaDisco === "lads", "stayed with the lads and learned her name");
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
    expect(quest.day === 2 && quest.time === "morning" && !quest.ateVarenyky, "sleep brings the second morning");

    kitGo("yard");
    kitUse("grandma");
    expect(quest.metGrandmaToday, "grandma greets the new day");
    kitFinishDialogs();
    expect(currentObjective() === T().objective.meetSvetka, "the task: meet Svetka by the shop");

    kitGo("shop");
    kitTalk("svetka");
    expect(quest.deeds.svetkaMet === "shop" && quest.deeds.wantsDate && !quest.deeds.dancedWithSvetka, "meets Svetka by the shop and wants a date");
    expect(currentObjective() === T().objective.dateNext, "next: ask her on a date");

    // The date: asked to the river tonight; the player is in the backpack, the moped by the club.
    kitChoose(0);
    kitFinishDialogs();
    expect(quest.deeds.dateInvited === 2 && currentObjective() === T().objective.datePlayer, "asked her to the river; the task: the player");
    kitGo("yard");
    kitTalk("backpack");
    expect(quest.hasPlayer && currentObjective() === T().objective.dateEvening, "took the player; the task: come on the moped tonight");
    kitGo("club");
    kitTalk("moped");
    kitGo("shop");
    kitUse("svetka");
    kitFinishDialogs();
    kitChoose(0); // wait with her for the evening
    kitFinishDialogs();
    expect(closeup.picture === "riverDate" && quest.time === "evening" && quest.day === 2, "the river, the same evening");
    kitChoose(1); // keep quiet, like the song
    kitFinishDialogs();
    expect(quest.deeds.riverDate === "silent" && isNight() && currentLocation === "yard" && !quest.riding, "home at night, the moped in the yard");
    kitGo("house");
    kitUse("bed");
    kitFinishDialogs();
    kitGo("yard");
    kitUse("grandma");
    expect(dialog.text === T().grandma.morningCatfish[0], "the third morning: grandpa wants to show the catfish");
    kitFinishDialogs();
    expect(quest.day === 3 && currentObjective() === T().objective.catfishGrandpa, "the task: grandpa at the pond");
    log.push("the date at the river");

    // The catfish with grandpa: the choice, worms, waiting for the night, the catch, the village's news.
    kitGo("pond");
    kitTalk("grandpa");
    kitChoose(0);
    kitFinishDialogs();
    expect(quest.deeds.catfishPlan === "rod" && currentObjective() === T().objective.worms, "with grandpa: dig worms first");
    kitTalk("grandpa");
    expect(!quest.hasWorms && quest.time !== "night", "no night without worms");
    kitGo("yard");
    kitTalk("worms");
    expect(quest.hasWorms && currentObjective() === T().objective.rodNight, "worms in a jar");
    kitGo("pond");
    const moneyBefore = quest.money;
    kitTalk("grandpa");
    kitChoose(0); // wait here for the night
    expect(closeup.picture === "catfishRod" && isNight() && quest.day === 3, "the catch, the same night");
    kitFinishDialogs();
    expect(quest.deeds.catfishWay === "rod" && quest.money === moneyBefore, "caught on the rod, no money");
    expect(npcsHere().some((n) => n.id === "grandpa"), "grandpa is still on his bench at night");
    kitGo("house");
    kitUse("bed");
    kitFinishDialogs();
    kitGo("yard");
    kitUse("grandma");
    expect(dialog.text === T().grandma.morningRod[0] && quest.trust.grandpa === 2 && quest.trust.valya === 1, "the village has heard");
    kitFinishDialogs();
    expect(currentObjective() === T().objective.grandmaNews, "the summer goes on: grandma has news");
    log.push("the catfish with grandpa");
    return log;
  }`);
  assert.ok(log.length > 20, `played ${log.length} steps`);
});

test("the disco's other way: he asks the unknown girl to dance, and learns she is Svetka", () => {
  const result = game.inGame(`() => {
    kitCheckpoint("Усе для дискотеки: вечір");
    kitUse("lads");
    kitFinishDialogs();
    kitChoose(0);
    const speakers = [];
    for (let i = 0; i < 40 && dialog.open; i++) {
      speakers.push(dialog.who);
      kitPress();
      kitPress();
    }
    const afterTitle = choice.open && choiceTitle.textContent;
    kitChoose(0);
    kitFinishDialogs();
    const deeds = { ...quest.deeds };
    // The danced or not is kept for the later quarrel, also across saving.
    saveGame();
    quest.deeds = {};
    continueGame();
    return {
      speakers,
      named: speakers.indexOf("svetka") > speakers.indexOf("vovchik") && speakers.indexOf("stranger") < speakers.indexOf("vovchik"),
      afterTitle: afterTitle === T().disco.afterTitle,
      deeds,
      kept: JSON.stringify(quest.deeds) === JSON.stringify(deeds),
      night: isNight() && quest.day === 1 && quest.discoDone,
    };
  }`);
  assert.ok(result.speakers.includes("hero") && result.speakers.includes("stranger"), JSON.stringify(result.speakers));
  assert.ok(result.named, `"Unknown girl" until Vovchik calls her name: ${result.speakers}`);
  assert.ok(result.afterTitle);
  assert.deepStrictEqual(
    [result.deeds.dancedWithSvetka, result.deeds.svetkaMet, result.deeds.svetkaDisco, result.deeds.wantsDate],
    [true, "disco", "stayed", true],
  );
  assert.ok(result.kept && result.night);
  game.inGame("() => clearSave()");
});

test("each way out of the dance is remembered, and Svetka by the shop knows they danced", () => {
  const result = game.inGame(`() => {
    const choices = ["stayed", "warned", "left"].map((id, index) => {
      kitCheckpoint("Усе для дискотеки: вечір");
      kitUse("lads");
      kitFinishDialogs();
      kitChoose(0);
      kitFinishDialogs();
      kitChoose(index);
      kitFinishDialogs();
      return quest.deeds.svetkaDisco === id && quest.deeds.dancedWithSvetka;
    });
    kitCheckpoint("День 2: Свєтка (танцювали)");
    kitUse("svetka");
    const firstLine = dialog.text;
    kitFinishDialogs();
    kitChoose(1); // not now
    kitFinishDialogs();
    const again = (kitUse("svetka"), dialog.who);
    kitFinishDialogs();
    kitChoose(1);
    kitFinishDialogs();
    return [choices, firstLine === T().svetka.afterDance[0], again, quest.deeds.svetkaMet];
  }`);
  assert.deepStrictEqual(result, [[true, true, true], true, "svetka", "disco"]);
  game.inGame("() => clearSave()");
});

test("the day and its parts: shown on screen, only forward, and a new day only after sleep", () => {
  const result = game.inGame(`() => {
    Object.assign(quest, newQuest());
    kitGo("yard");
    draw(1000);
    const shown = document.getElementById("day-text").textContent;
    advancePhase("evening");
    advancePhase("day");
    const noBack = quest.time === "evening" && quest.day === 1;
    // Away from a ready scene nothing offers to wait: the lads only offer it once he is ready.
    kitCheckpoint("Клуб: познайомитись");
    kitUse("lads");
    kitFinishDialogs();
    const noOfferWhenNotReady = !choice.open && quest.time === "day";
    kitCheckpoint("Усе для дискотеки: вдень");
    kitUse("lads");
    kitFinishDialogs();
    const offered = choice.open;
    kitChoose(0);
    const sameDay = quest.day === 1 && quest.time === "evening";
    for (let i = 0; i < 400 && !choice.open; i++) kitPress();
    kitChoose(1);
    kitFinishDialogs();
    const nightSameDay = quest.day === 1 && isNight();
    kitGo("house");
    kitUse("bed");
    kitFinishDialogs();
    return [shown, noBack, noOfferWhenNotReady, offered, sameDay, nightSameDay, quest.day, quest.time];
  }`);
  assert.deepStrictEqual(result, ["День 1 / 92 · Ранок", true, true, true, true, true, 2, "morning"]);
  game.inGame("() => clearSave()");
});

test("the catfish at night: the driver's battery, the flash, Valya's hundred, a new battery and silence", () => {
  const result = game.inGame(`() => {
    const out = {};
    kitCheckpoint("Сом: дід кличе на ставок");
    kitTalk("grandpa");
    kitChoose(1); // alone, at night, with a battery
    kitFinishDialogs();
    out.plan = quest.deeds.catfishPlan === "electro" && currentObjective() === T().objective.battery;
    // By day the car is watched: he waits for the night by it.
    kitGo("street");
    kitUse("car");
    kitFinishDialogs();
    out.notByDay = choice.open && !quest.hasBattery;
    kitChoose(0);
    kitFinishDialogs();
    out.took = quest.hasBattery && isNight() && quest.deeds.batteryStolen === 3 && currentObjective() === T().objective.electroNight;
    kitGo("pond");
    out.alone = !npcsHere().some((n) => n.id === "grandpa");
    kitUse("boardwalk");
    out.flash = closeup.picture === "catfishNight";
    kitFinishDialogs();
    out.fish = quest.hasCatfish && !quest.hasBattery && currentObjective() === T().objective.sellCatfish;
    const money = quest.money;
    kitGo("shop");
    kitUse("shopDoor");
    out.sale = closeup.picture === "catfishSale";
    kitFinishDialogs();
    out.paid = quest.money - money === CATFISH_PRICE && quest.deeds.catfishWay === "electro";
    kitGo("house");
    kitUse("bed");
    kitFinishDialogs();
    // The morning after: the theft is news, the car stands open and empty, the trip is off.
    kitGo("yard");
    kitUse("grandma");
    out.news = dialog.text === T().grandma.morningTheft[0];
    kitFinishDialogs();
    out.task = currentObjective() === T().objective.buyBattery && carState() === "empty";
    kitGo("street");
    kitUse("driver");
    out.robbed = dialog.text === T().driver.robbed[0].replace(T().speakers.driver + ": ", "");
    kitFinishDialogs();
    kitGo("shop");
    kitUse("valya");
    kitFinishDialogs();
    out.bought = quest.hasNewBattery && quest.money === money && currentObjective() === T().objective.giveBattery;
    kitGo("street");
    kitUse("driver");
    out.rant = closeup.picture === "batteryRant";
    kitFinishDialogs();
    out.after = quest.deeds.batteryReturned && carState() === "closed" && currentObjective() === T().objective.grandmaNews;
    saveGame();
    quest.deeds = {};
    continueGame();
    out.kept = quest.deeds.batteryReturned && quest.deeds.catfishWay === "electro";
    return out;
  }`);
  assert.deepStrictEqual(result, {
    plan: true, notByDay: true, took: true, alone: true, flash: true, fish: true, sale: true, paid: true,
    news: true, task: true, robbed: true, bought: true, rant: true, after: true, kept: true,
  });
  game.inGame("() => clearSave()");
});

test("stage 3: piglet money from the player, grandpa's tool box from Mykola, kung fu over beer", () => {
  const result = game.inGame(`() => {
    const out = {};
    kitCheckpoint("Поросята: баба просить гроші");
    quest.money = 3;
    kitTalk("grandma");
    out.asked = quest.deeds.pigletAsked === 4 && currentObjective() === T().objective.sellPlayer;
    // Vovchik offers fifty; not now. Valya offers fifty; sold, the Skriabin tape stays.
    kitGo("club");
    kitUse("lads");
    kitFinishDialogs();
    kitChoose(1);
    kitFinishDialogs();
    out.kept = quest.hasPlayer && !quest.deeds.playerSoldTo;
    kitGo("shop");
    kitUse("valya");
    kitFinishDialogs();
    kitChoose(0);
    kitFinishDialogs();
    out.sold = !quest.hasPlayer && quest.deeds.playerSoldTo === "valya" && quest.money === 3 + PLAYER_PRICE + TAPE_PRICE;
    kitGo("yard");
    kitTalk("grandma");
    out.paid = quest.deeds.pigletMoney && quest.money === 3 + PLAYER_PRICE + TAPE_PRICE - PIGLET_SHARE && currentObjective() === T().objective.askTool;
    // Grandpa: the tool box is at Mykola's; his gate opens.
    kitGo("street");
    const gateShut = Boolean(closedExitAhead(0, -1)) || isClosedExit(here().exits.find((e) => e.id === "toMykola"));
    kitGo("pond");
    kitTalk("grandpa");
    out.toMykola = quest.unlocked.mykola && currentObjective() === T().objective.toMykola && gateShut;
    kitGo("mykola");
    out.asleep = !npcsHere().some((n) => n.id === "mykola");
    kitUse("mykolaDoor");
    kitFinishDialogs();
    kitChoose(0); // wait for the evening
    kitFinishDialogs();
    out.evening = quest.time === "evening" && quest.day === 4 && npcsHere().some((n) => n.id === "mykola");
    kitTalk("mykola");
    out.tool = quest.hasTool && quest.deeds.mykolaMet && currentObjective() === T().objective.toolHome;
    kitTalk("mykola");
    out.dry = !quest.deeds.kungfu;
    kitGo("yard");
    kitTalk("grandma");
    out.home = quest.deeds.toolHome && !quest.hasTool && currentObjective() === T().objective.fixFence;
    // Grandma sends him to the hole in the fence; he mends it and she has her say.
    kitMendFence();
    out.mended = quest.deeds.fenceMended === 4 && currentObjective() === T().objective.beerForMykola;
    kitTalk("grandma");
    out.fenceThanks = quest.deeds.fenceThanked === true;
    // Beer for Mykola goes into the bag, not into the hero.
    quest.money = 10;
    kitGo("shop");
    out.beerOffered = goodsOnOffer().some((g) => g.id === "beer");
    const drunk = quest.beersDrunk;
    for (let i = 0; i < MYKOLA_BEERS; i++) buyGood("beer");
    out.bag = quest.bag.beer === MYKOLA_BEERS && quest.beersDrunk === drunk && !goodsOnOffer().some((g) => g.id === "beer");
    kitGo("mykola");
    kitUse("mykola");
    out.lesson = closeup.picture === "mykolaKungfu";
    kitFinishDialogs();
    out.after = quest.deeds.kungfu && !quest.bag.beer && currentObjective() === T().objective.afterMykola;
    saveGame();
    quest.deeds = {};
    continueGame();
    out.saved = quest.deeds.kungfu && quest.deeds.playerSoldTo === "valya";
    return out;
  }`);
  assert.deepStrictEqual(result, {
    asked: true, kept: true, sold: true, paid: true, toMykola: true, asleep: true, evening: true,
    tool: true, dry: true, home: true, mended: true, fenceThanks: true, beerOffered: true, bag: true, lesson: true, after: true, saved: true,
  });
  game.inGame("() => clearSave()");
});

test("the tool box from Mykola before the piglet money: he sees it in the bag and grandma takes it", () => {
  const result = game.inGame(`() => {
    const out = {};
    kitCheckpoint("Поросята: баба просить гроші");
    quest.money = 0;
    kitTalk("grandma");
    // Grandma said grandpa has the tool, so he goes for it before he has the money.
    kitGo("pond");
    kitTalk("grandpa");
    out.sent = quest.unlocked.mykola === true;
    kitGo("mykola");
    kitUse("mykolaDoor");
    kitFinishDialogs();
    kitChoose(0);
    kitFinishDialogs();
    kitUse("mykola");
    const said = [];
    for (let i = 0; i < 40 && dialog.open; i++) { said.push(dialog.text); kitPress(); kitPress(); }
    out.handed = said.some((text) => text === T().mykola.firstMeet[3]);
    out.carried = quest.hasTool && bagLine().includes(T().shop.carried.toolBox) && currentObjective() === T().objective.toolHome;
    kitGo("yard");
    kitTalk("grandma");
    out.home = quest.deeds.toolHome && !quest.hasTool && !bagLine().includes(T().shop.carried.toolBox);
    out.fenceFirst = quest.deeds.fenceAsked === true && currentObjective() === T().objective.fixFence;
    kitMendFence();
    out.stillMoney = !quest.deeds.pigletMoney && currentObjective() === T().objective.sellPlayer;
    // With the money she takes it; the tool needs no second trip to Mykola.
    quest.money = PIGLET_SHARE;
    kitTalk("grandma");
    out.paid = quest.deeds.pigletMoney && quest.money === 0 && currentObjective() === T().objective.beerForMykola;
    return out;
  }`);
  assert.deepStrictEqual(result, { sent: true, handed: true, carried: true, home: true, fenceFirst: true, stillMoney: true, paid: true });
  game.inGame("() => clearSave()");
});

test("people grow nearer the bottom of a picture painted in perspective, and their steps keep up", () => {
  const result = game.inGame(`() => {
    const out = {};
    // Every depth grows downwards and stays within what still reads as the same person.
    out.bad = Object.entries(LOCATIONS).filter(([, l]) => l.depth).filter(([, l]) => {
      const [[farY, far], [nearY, near]] = l.depth;
      return !(farY < nearY && far <= near && far >= 0.6 && near <= 1.5);
    }).map(([name]) => name);
    out.flat = Object.entries(LOCATIONS).filter(([, l]) => !l.depth).every(([name]) => depthScale(999, LOCATIONS[name]) === 1);
    // Up the path to the stop he is drawn smaller, walks slower and takes as many steps for his stride.
    currentLocation = "stop";
    const walk = (x, y) => {
      player.x = x;
      player.y = y;
      player.walked = 0;
      input.moveX = 0;
      input.moveY = -1;
      updatePlayer(0.05);
      input.moveY = 0;
      return { moved: y - player.y, walked: player.walked };
    };
    const far = walk(152, 30);
    const near = walk(200, 200);
    out.smaller = depthScale(30) < 0.7 && depthScale(200) === 1;
    out.slower = far.moved > 0 && far.moved < near.moved * 0.8;
    out.sameSteps = Math.abs(far.walked - near.walked) < 0.001;
    return out;
  }`);
  assert.deepStrictEqual(result, { bad: [], flat: true, smaller: true, slower: true, sameSteps: true });
  game.inGame("() => clearSave()");
});

test("TSN is on from the evening, by day he may wait for it, and passing the TV he thinks of it until it is watched", () => {
  const result = game.inGame(`() => {
    const out = {};
    // Day 1: the evening comes with the disco, so no waiting at the TV.
    kitCheckpoint("Вода: набрати");
    currentLocation = "house";
    const dayOne = useTv();
    out.dayOne = dayOne.next === null && dayOne.lines[0] === T().house.tvDay;
    // Later days: by day it offers to wait, and the wait keeps the same day.
    kitCheckpoint("ТСН: вечір у хаті");
    quest.time = "day";
    kitUse("tv");
    kitFinishDialogs();
    out.offered = choice.open;
    kitChoose(0);
    out.evening = quest.time === "evening" && quest.day === 2;
    kitFinishDialogs();
    out.firstBulletin = quest.newsWatched === 1 && closeup.effect === "tv";
    finishCloseup();
    // In the evening it simply comes on.
    kitUse("tv");
    kitFinishDialogs();
    out.allWatched = quest.newsWatched === T().tsn.length && quest.deeds.tsnSeen === true;
    kitUse("tv");
    out.over = dialog.text === T().house.tvOver;
    kitFinishDialogs();
    // And from the evening he may go to bed.
    out.bed = useBed().next === "sleep";
    quest.time = "day";
    out.noBedByDay = useBed().next === null;
    return out;
  }`);
  assert.deepStrictEqual(result, {
    dayOne: true, offered: true, evening: true, firstBulletin: true, allWatched: true, over: true, bed: true, noBedByDay: true,
  });
  game.inGame("() => clearSave()");
});

test("the reminder of the news is only a thought by the TV: once a day, until it is all watched", () => {
  const result = game.inGame(`() => {
    const out = {};
    const says = () => [heroSpeech.text, ...heroSpeech.queue].includes(T().hero.tv);
    const hush = () => { heroSpeech.text = ""; heroSpeech.queue = []; };
    kitCheckpoint("ТСН: вечір у хаті");
    quest.heroSaid = { house: true };
    hush();
    // Across the room he thinks nothing; passing the TV he does, and only once that day.
    player.x = 320;
    player.y = 200;
    updateHeroSpeech(0.02);
    out.farAway = !says();
    player.x = places.tv.x;
    player.y = places.tv.y + 6;
    updateHeroSpeech(0.02);
    out.passing = says();
    hush();
    updateHeroSpeech(0.02);
    out.onceToday = !says();
    // Not watched yet: the next day he thinks of it again.
    startNewDay();
    updateHeroSpeech(0.02);
    out.nextDay = says();
    hush();
    // All watched: he never thinks of it again.
    quest.time = "evening";
    T().tsn.forEach(() => useTv());
    startNewDay();
    updateHeroSpeech(0.02);
    out.watched = quest.deeds.tsnSeen === true && !says();
    return out;
  }`);
  assert.deepStrictEqual(result, { farAway: true, passing: true, onceToday: true, nextDay: true, watched: true });
  game.inGame("() => clearSave()");
});

test("the fence: a hole until grandma has the tools and the hero mends it, not at night, and it stays mended", () => {
  const result = game.inGame(`() => {
    const out = {};
    kitCheckpoint("Паркан: принести ящик бабі");
    const patch = (art) => here().patches.find((p) => p.art === art).when();
    out.hole = patch("yardFenceHole") && !patch("yardFenceMended");
    out.noJobYet = !currentTargets().some((t) => t.id === "fence");
    kitTalk("grandma");
    out.asked = quest.deeds.fenceAsked === true && quest.hasTool === false && currentObjective() === T().objective.fixFence;
    out.job = currentTargets().some((t) => t.id === "fence");
    // At night he would wake the village.
    quest.time = "night";
    kitUse("fence");
    out.notAtNight = dialog.text === T().yard.fenceNight && closeup.type !== "fence";
    kitFinishDialogs();
    quest.time = "day";
    // Every nail gets driven, one of them bends, and the patch replaces the hole.
    kitUse("fence");
    out.started = closeup.type === "fence";
    const trust = quest.trust.grandma || 0;
    for (let i = 0; i < 4000 && closeup.type === "fence" && !(dialog.open && !dialog.isHint); i++) kitPress();
    out.nails = closeup.fence.nails.length === FENCE_NAILS_TOTAL && closeup.fence.nails.every(isNailDriven);
    out.bent = closeup.fence.nails.filter((n) => n.stage === NAIL_STAGES.bent).length === 1;
    out.said = dialog.text === T().yard.fenceDone[0];
    kitFinishDialogs();
    out.back = mode === "world" && quest.deeds.fenceMended === 4 && (quest.trust.grandma || 0) === trust + 1;
    out.patched = !patch("yardFenceHole") && patch("yardFenceMended");
    out.noMoreJob = !currentTargets().some((t) => t.id === "fence");
    saveGame();
    quest.deeds = {};
    continueGame();
    out.saved = quest.deeds.fenceMended === 4 && patch("yardFenceMended");
    return out;
  }`);
  assert.deepStrictEqual(result, {
    hole: true, noJobYet: true, asked: true, job: true, notAtNight: true, started: true, nails: true, bent: true,
    said: true, back: true, patched: true, noMoreJob: true, saved: true,
  });
  game.inGame("() => clearSave()");
});

test("the buyers of the player never hear which tape they get, and the two are sold separately", () => {
  const result = game.inGame(`() => {
    const names = Object.values(TEXTS).flatMap((lang) => [...lang.valya.playerOffer, ...lang.lads.playerOffer, lang.objective.sellPlayer, lang.grandma.pigletThought, lang.player.title]);
    const sold = Object.values(TEXTS).flatMap((lang) => [...lang.player.valya, ...lang.player.vovchik]);
    return {
      named: names.filter((text) => /Океан|Okean/.test(text)),
      soldNamed: sold.filter((text) => /Океан|Okean/.test(text)),
      skriabinKept: Object.values(TEXTS).every((lang) => /Скрябін|Skriabin/.test(lang.player.valya[0]) && /Скрябін|Skriabin/.test(lang.player.vovchik[0])),
      price: PLAYER_PRICE + TAPE_PRICE >= PIGLET_SHARE + MYKOLA_BEERS * 2,
    };
  }`);
  assert.deepStrictEqual(result, { named: [], soldNamed: [], skriabinKept: true, price: true });
});

test("the seller is inside the shop: nobody is drawn at its window", () => {
  const result = game.inGame(`() => {
    const valya = npcs.find((n) => n.id === "valya");
    return { inside: valya.inside === true, inWindow: "inWindow" in valya };
  }`);
  assert.deepStrictEqual(result, { inside: true, inWindow: false });
});

test("the player can only be sold after the date, so Skriabin always has something to play on", () => {
  const result = game.inGame(`() => {
    kitCheckpoint("Побачення: вдень, на мопеді");
    const beforeDate = canSellPlayer() || catfishDone() || catfishHookReady();
    kitCheckpoint("Плеєр: продати Валі");
    return { beforeDate, afterDate: Boolean(quest.deeds.riverDate) && canSellPlayer() };
  }`);
  assert.deepStrictEqual(result, { beforeDate: false, afterDate: true });
  game.inGame("() => clearSave()");
});

test("the driver calls the hero over on arrival, tells the year's news only once, and shows the way", () => {
  const result = game.inGame(`() => {
    const out = {};
    kitCheckpoint("Водій: перша зустріч");
    out.notYet = !quest.deeds.driverMet;
    player.x = 1262 + DRIVER_HAILS_WITHIN - 1;
    update(0.02);
    out.hailed = dialog.open && quest.deeds.driverMet === true && dialog.text === T().driver.firstMeet[0];
    const said = [];
    for (let i = 0; i < 60 && dialog.open; i++) { said.push(dialog.text); kitPress(); kitPress(); }
    out.news = said.includes(T().driver.firstMeet[4].replace(T().speakers.driver + ": ", ""));
    out.way = said.includes(T().driver.directions.replace(T().speakers.driver + ": ", ""));
    out.saturday = said.includes(T().driver.busy.replace(T().speakers.driver + ": ", ""));
    // Only once: later he talks about his car and the world, never the news again.
    const later = new Set();
    for (let i = 0; i < 80; i++) talkToDriver().lines.forEach((line) => later.add(line));
    out.onceOnly = !T().driver.firstMeet.some((line) => later.has(line));
    out.noPigletsYet = !later.has(T().driver.piglets);
    update(0.02);
    out.noSecondHail = !dialog.open;
    // Met later in the game, he leaves out the way to grandma's.
    kitCheckpoint("Сом: дід кличе на ставок");
    const met = talkToDriver().lines;
    out.lateNoWay = met.includes(T().driver.firstMeet[1]) && !met.includes(T().driver.directions);
    // Once grandma has spoken of the piglets he may mention the trip.
    quest.deeds.pigletAsked = quest.day;
    const trip = new Set();
    for (let i = 0; i < 200; i++) talkToDriver().lines.forEach((line) => trip.add(line));
    out.piglets = trip.has(T().driver.piglets);
    return out;
  }`);
  assert.deepStrictEqual(result, {
    notYet: true, hailed: true, news: true, way: true, saturday: true, onceOnly: true, noPigletsYet: true,
    noSecondHail: true, lateNoWay: true, piglets: true,
  });
  game.inGame("() => clearSave()");
});

test("every carried story thing has a name in the bag line in every language", () => {
  const result = game.inGame(`() => Object.values(CARRIED).filter((id) => Object.values(TEXTS).some((lang) => !lang.shop.carried[id]))`);
  assert.deepStrictEqual(result, []);
});

test("the player sold to Vovchik plays at the club", () => {
  const result = game.inGame(`() => {
    kitCheckpoint("Плеєр: продати Вовчикові");
    kitUse("lads");
    kitFinishDialogs();
    kitChoose(0);
    kitFinishDialogs();
    const sold = quest.deeds.playerSoldTo === "vovchik" && !quest.hasPlayer;
    const heard = new Set();
    for (let i = 0; i < 40; i++) {
      kitUse("lads");
      heard.add(dialog.text);
      kitFinishDialogs();
    }
    const plays = T().lads.playerPlays.some((l) => heard.has(l.replace(/^[^:]+: /, "")));
    return [sold, plays];
  }`);
  assert.deepStrictEqual(result, [true, true]);
  game.inGame("() => clearSave()");
});

test("a new battery costs exactly the hundred: without it Valya will not sell, and the shop still opens", () => {
  const result = game.inGame(`() => {
    kitCheckpoint("Сом струмом: новий акумулятор водієві");
    quest.money = 60;
    kitUse("valya");
    const refused = dialog.text === T().valya.batteryNoMoney;
    kitFinishDialogs();
    const shop = shopMenu.open;
    closeShopMenu();
    finishCloseup();
    return [refused, shop, quest.hasNewBattery, quest.money];
  }`);
  assert.deepStrictEqual(result, [true, true, false, 60]);
  game.inGame("() => clearSave()");
});

test("the date: the game says where to go and what to bring, and nothing blocks it", () => {
  const result = game.inGame(`() => {
    const out = {};
    kitCheckpoint("Побачення: плеєр у рюкзаку");
    out.player = currentObjective() === T().objective.datePlayer;
    kitTalk("backpack");
    out.took = quest.hasPlayer && currentObjective() === T().objective.dateEvening;
    // On foot she sends him for the moped; nothing else happens and the day does not move.
    kitGo("shop");
    kitTalk("svetka");
    out.onFoot = !choice.open && quest.time === "day";
    // On the moped in the daytime: wait with her, or not yet.
    kitCheckpoint("Побачення: вдень, на мопеді");
    kitUse("svetka");
    kitFinishDialogs();
    kitChoose(1);
    kitFinishDialogs();
    out.notYet = !choice.open && quest.time === "day" && mode === "world";
    kitUse("svetka");
    kitFinishDialogs();
    kitChoose(0);
    kitFinishDialogs();
    out.river = closeup.picture === "riverDate" && quest.time === "evening" && choice.open;
    kitChoose(0);
    kitFinishDialogs();
    out.after = [quest.deeds.riverDate, isNight(), quest.day, currentLocation, currentObjective() === T().objective.goHome];
    saveGame();
    quest.deeds = {};
    continueGame();
    out.kept = quest.deeds.riverDate;
    // Already evening: straight to the river.
    kitCheckpoint("Побачення: увечері, на мопеді");
    kitUse("svetka");
    kitFinishDialogs();
    out.evening = closeup.picture === "riverDate" && choice.open;
    return out;
  }`);
  assert.deepStrictEqual(result, {
    player: true,
    took: true,
    onFoot: true,
    notYet: true,
    river: true,
    after: ["spoke", true, 2, "yard", true],
    kept: "spoke",
    evening: true,
  });
  game.inGame("() => clearSave()");
});

test("daily work: two jars and one truck a day pay for the evening's beer, and come back the next day", () => {
  const result = game.inGame(`() => {
    kitCheckpoint("Гроші на пиво");
    quest.money = 0;
    kitGo("yard");
    kitUseGarden();
    kitUseGarden();
    const jars = quest.money;
    const noThirdJar = !canCollectBeetles();
    kitGo("shop");
    kitTalk("valya");
    for (let i = 0; i < CRATE_COUNT; i++) {
      kitTalk("truck");
      kitTalk("valya");
    }
    const dayOne = quest.money;
    startNewDay();
    const backTomorrow = canCollectBeetles() && quest.unload === "none";
    kitUse("valya");
    const askedAgain = dialog.text === T().valya.unloadAgain[0];
    kitFinishDialogs();
    return { jars, noThirdJar, enoughForBeer: dayOne >= BEER_PRICE * BEERS_NEEDED, more: dayOne > BEER_PRICE * BEERS_NEEDED, backTomorrow, askedAgain };
  }`);
  assert.deepStrictEqual(result, { jars: 4, noThirdJar: true, enoughForBeer: true, more: true, backTomorrow: true, askedAgain: true });
  game.inGame("() => clearSave()");
});

test("the hero's walk follows the ground he covers, and he stands still when he stops", () => {
  const result = game.inGame(`() => {
    kitCheckpoint("Вода: віднести");
    grandmaWalk.wait = 1e9;
    const open = kitWalkable().find(([x, y]) => [...Array(16)].every((_, i) => !isBlocked(x + i + 1, y)));
    player.x = open[0];
    player.y = open[1];
    input.moveX = 1;
    input.moveY = 0;
    const frames = [];
    for (let i = 0; i < 8; i++) {
      updatePlayer(0.02);
      frames.push(heroFrame(0));
    }
    input.moveX = 0;
    updatePlayer(0.02);
    // Near a diagonal the facing does not flick back to up/down.
    input.moveX = 0.7;
    input.moveY = 0.75;
    updatePlayer(0.02);
    const sticky = player.dir;
    input.moveX = 0;
    input.moveY = 0;
    updatePlayer(0.02);
    const covered = 8 * 0.02 * WALK_SPEED;
    return {
      rows: frames.every((f) => f.row === HERO_ROWS.right),
      poses: frames.every((f) => HERO_SIDE_POSES.includes(f.col) && f.col % 2 === 0),
      first: frames[0].col === 2,
      last: frames[7].col === HERO_SIDE_POSES[Math.floor((covered + HERO_WALK_START) / HERO_FRAME_PX) % 8],
      sticky,
      standing: heroFrame(0),
    };
  }`);
  assert.deepStrictEqual(result, { rows: true, poses: true, first: true, last: true, sticky: "right", standing: { row: 5, col: 3 } });
  game.inGame("() => clearSave()");
});

test("old saves from before the summer story load and go on", () => {
  const result = game.inGame(`() => {
    const load = (quest, location = "yard") => {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, quest, location, player: { ...DEV_YARD, dir: "down" } }));
      continueGame();
    };
    // A jar already full under the old rules: grandma now sends for the sprayer.
    const old = { ...newQuest(), stage: "beetles", beetlesCaught: BEETLE_COUNT, time: "day" };
    delete old.deeds;
    delete old.trust;
    delete old.hasSprayer;
    delete old.sprayed;
    load(old);
    const objective = currentObjective() === T().objective.beetlesDone;
    kitTalk("grandma");
    const sprayer = quest.stage === "sprayer" && typeof quest.deeds === "object";
    // The old second morning: Svetka was never seen, she introduces herself by the shop.
    load({ ...newQuest(), stage: "done", metLads: true, outfit: "sport", beersDrunk: 3, discoDone: true, day: 2, time: "day", metGrandmaToday: true, deeds: undefined });
    draw(1000);
    const dayShown = document.getElementById("day-text").textContent;
    kitGo("shop");
    kitUse("svetka");
    const stranger = dialog.who === "stranger" || dialog.lines.some((l) => typeof l === "string" && l.startsWith(T().speakers.stranger));
    kitFinishDialogs();
    clearSave();
    return [objective, sprayer, dayShown, stranger, quest.deeds.svetkaMet, quest.deeds.svetkaNamed];
  }`);
  assert.deepStrictEqual(result, [true, true, "День 2 / 92 · День", true, "shop", true]);
});

test("everyone who speaks has a portrait file that is really there", () => {
  const files = game.inGame(`() => Object.keys(T().speakers).map((id) => [id, PORTRAIT_FILES[PORTRAIT_OF[id] || id] || null])`);
  const missing = files.filter(([, file]) => !file || !require("fs").existsSync(require("path").join(__dirname, "..", "art", file)));
  assert.deepStrictEqual(missing, []);
});

test("dialogs name who speaks; the person talked to speaks unless a line names someone else", () => {
  const result = game.inGame(`() => {
    kitCheckpoint("Вода: віднести");
    kitUse("grandma");
    const grandma = dialog.who;
    const portrait = document.getElementById("dialog-portrait").getAttribute("src");
    if (!portrait || !portrait.startsWith("art/portraits/grandma.png")) throw new Error("grandma's portrait is not shown: " + portrait);
    kitFinishDialogs();
    draw(1000);
    kitCheckpoint("Клуб: познайомитись");
    kitUse("lads");
    const lads = [];
    for (let i = 0; i < 40 && dialog.open; i++) {
      lads.push(dialog.who);
      kitPress();
      kitPress();
    }
    kitFinishDialogs();
    const named = readLine("Толік: І Свєтку не чіпай.", "grandma");
    const told = readLine("Сонце сідає.", null);
    return [grandma, lads.includes("tolik") && lads.includes("vovchik") && lads.includes("sanya"), named, told];
  }`);
  assert.deepStrictEqual(result, ["grandma", true, { who: "tolik", text: "І Свєтку не чіпай." }, { who: null, text: "Сонце сідає." }]);
  game.inGame("() => clearSave()");
});
