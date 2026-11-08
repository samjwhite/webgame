const WALK_SPEED = 55;
const MOPED_SPEED = 95;
const TALK_DISTANCE = 22;
const START = { location: "stop", x: 163, y: 109 };
const WAKE_UP_SPOT = { location: "yard", x: 245, y: 250 };
const MORNING_SPOT = { location: "house", x: 110, y: 200 };
const CLUB_PARKING = { location: "club", x: 172, y: 268 };
const SHED_DOOR = { x: 420, y: 100 };
const CHICKEN_YARD = { left: 202, right: 271, top: 185, bottom: 275 };
const SHOP_STEPS = [78, 124, 147, 161]; // the shop's steps and door, plus a stride in front of them
const FADE_TIME = 0.18;
// The half-finished bottle on the far table outside the shop.
const BEER_BOTTLE = { x: 268, y: 139, sortY: 181 };
let DEBUG = location.search.includes("debug");

// walked: ground covered since the hero started walking, in px (0 while standing).
const player = { x: START.x, y: START.y, dir: "down", moving: false, walked: 0, toldExit: null };

let currentLocation = START.location;

function here() {
  return LOCATIONS[currentLocation];
}

// dayOnly: goes home for the night.
const npcs = [
  { id: "grandma", location: "yard", sprite: "grandma", x: 228, y: 194, talk: talkToGrandma, dayOnly: true, passable: true, walker: true, dir: "down", walking: false },
  { id: "valya", location: "shop", sprite: "seller", x: 112, y: 150, area: SHOP_STEPS, inWindow: true, passable: true, talk: talkToValya, dayOnly: true },
  { id: "grandpa", location: "pond", sprite: "grandpa", x: 212, y: 50, talk: talkToGrandpa, dayOnly: true },
  { id: "lads", location: "club", sprite: "tolik", x: 120, y: 163, talk: talkToLads },
  { id: "lads", location: "club", sprite: "sanya", x: 192, y: 164, talk: talkToLads },
  { id: "lads", location: "club", sprite: "vovchik", x: 234, y: 163, talk: talkToLads },
  // By the far table of the beer garden, from the day after the first disco.
  { id: "svetka", location: "shop", sprite: "svetka", x: 262, y: 200, talk: talkToSvetka, when: isSvetkaAround },
];

// when: a test that says whether the person is here now (dayOnly people also go home for the night).
function npcsHere() {
  return npcs.filter((npc) => npc.location === currentLocation && !(npc.dayOnly && isNight()) && (!npc.when || npc.when()));
}

const places = {
  well: { id: "well", location: "yard", x: 176, y: 256 },
  shed: { id: "shed", location: "yard", x: SHED_DOOR.x, y: SHED_DOOR.y },
  backpack: { id: "backpack", location: "yard", x: 365, y: 118 },
  truck: { id: "truck", location: "shop", x: 112, y: 208 },
  statue: { id: "statue", location: "club", x: 157, y: 260 },
  shopDoor: { id: "shopDoor", location: "shop", x: 112, y: 150, area: SHOP_STEPS },
  bed: { id: "bed", location: "house", x: 70, y: 202 },
  tv: { id: "tv", location: "house", x: 130, y: 170 },
  borscht: { id: "borscht", location: "house", x: 225, y: 170 },
  fridge: { id: "fridge", location: "house", x: 300, y: 172 },
  varenyky: { id: "varenyky", location: "house", x: 250, y: 216 },
  beerBottle: { id: "beerBottle", location: "shop", x: 268, y: 186 },
};

let chickens = [];
let butterflies = [];
let cloudShadows = [];

// Cats and dogs, cut by tools/art/animals.py. Grids of one row per coat, one column per pose; they face right.
const CAT_CELL = { w: 24, h: 16 };
const DOG_CELL = { w: 24, h: 21 };
const CAT_COAT = { tabby: 0, cream: 1, calico: 2 };
const CAT_POSE = { stand: 0, sit: 1, sleep: 2, walkA: 3, walkB: 4, washA: 5, washB: 6 };
const CAT_WALK_SPEED = 11;
const CAT_NOTICES_HERO = 75;
const CAT_STOPS_FROM_HERO = 14;
const CAT_STROLL = 30;
const DOG_COAT = { ginger: 0, blackTan: 1, white: 2, grey: 3 };
const DOG_POSE = { stand: 0, sit: 1, sleep: 2, walkA: 3, walkB: 4, sniff: 5, bark: 6 };
const DOG_WALK_SPEED = 16;
const DOG_BARK_DISTANCE = 34;

// behaviour: none = stays in its pose; "guard" barks at a hero who comes close; "wander" walks along a line.
const animals = [
  { kind: "cat", location: "pond", coat: CAT_COAT.calico, pose: CAT_POSE.sit, x: 190, y: 58, behaviour: "cat", friendly: true },
  { kind: "cat", location: "yard", coat: CAT_COAT.cream, pose: CAT_POSE.sleep, x: 344, y: 129, behaviour: "cat", friendly: true },
  { kind: "cat", location: "club", coat: CAT_COAT.calico, pose: CAT_POSE.sit, x: 76, y: 262, behaviour: "cat", friendly: true },
  { kind: "cat", location: "street", coat: CAT_COAT.tabby, pose: CAT_POSE.stand, x: 533, y: 168, flip: true, behaviour: "cat" },
  { kind: "dog", location: "yard", coat: DOG_COAT.blackTan, pose: DOG_POSE.sit, x: 146, y: 185, behaviour: "guard" },
  { kind: "dog", location: "club", coat: DOG_COAT.white, pose: DOG_POSE.sleep, x: 236, y: 250 },
  { kind: "dog", location: "street", coat: DOG_COAT.grey, pose: DOG_POSE.stand, x: 860, y: 234, behaviour: "wander", from: 826, to: 1007, wait: 1 },
  { kind: "dog", location: "stop", coat: DOG_COAT.ginger, pose: DOG_POSE.sit, x: 60, y: 125, behaviour: "wander", from: 40, to: 150, wait: 3 },
];

// Grandma goes about her yard. The hero walks through her, she waits while he is close, and her stops
// keep clear of everything he has to use: the shed, the backpack spot, the well and the door.
// stop: seconds range she stays there. The other points only lead her round the fence.
const GRANDMA_ROUTE = [
  { x: 228, y: 194, stop: true }, // her usual spot on the path
  { x: 272, y: 172 },
  { x: 272, y: 213, stop: true }, // by the potatoes
  { x: 272, y: 172 },
  { x: 361, y: 153, stop: true }, // towards the shed
  { x: 272, y: 172 },
];
const GRANDMA_SPEED = 20;
const GRANDMA_WAITS_FOR_HERO = 28;
const grandmaWalk = { next: 1, wait: 4 };

function updateGrandma(dt) {
  const grandma = npcs[0];
  grandma.walking = false;
  if (currentLocation !== grandma.location || isNight()) return;
  if (Math.hypot(grandma.x - player.x, grandma.y - player.y) < GRANDMA_WAITS_FOR_HERO) return;
  if (grandmaWalk.wait > 0) {
    grandmaWalk.wait -= dt;
    return;
  }
  const point = GRANDMA_ROUTE[grandmaWalk.next];
  const dx = point.x - grandma.x;
  const dy = point.y - grandma.y;
  const distance = Math.hypot(dx, dy);
  const step = GRANDMA_SPEED * dt;
  if (distance <= step) {
    grandma.x = point.x;
    grandma.y = point.y;
    if (point.stop) {
      grandmaWalk.wait = 4 + Math.random() * 6;
      grandma.dir = "down";
    }
    grandmaWalk.next = (grandmaWalk.next + 1) % GRANDMA_ROUTE.length;
    return;
  }
  grandma.x += (dx / distance) * step;
  grandma.y += (dy / distance) * step;
  grandma.walking = true;
  if (Math.abs(dx) > Math.abs(dy)) grandma.dir = dx < 0 ? "left" : "right";
  else grandma.dir = dy < 0 ? "up" : "down";
}

// Sheet from tools/art/animals.py: rows walking down, up, left, right, then standing; four columns.
const GRANDMA_ROWS = { down: 0, up: 1, left: 2, right: 3 };
const GRANDMA_IDLE_ROW = 4;

function drawGrandma(ctx, grandma, time) {
  const sheet = ART.grandmaWalk;
  const w = sheet.width / 4;
  const h = sheet.height / 5;
  const row = grandma.walking ? GRANDMA_ROWS[grandma.dir] : GRANDMA_IDLE_ROW;
  const col = Math.floor(time / (grandma.walking ? 200 : 450)) % 4;
  ctx.drawImage(sheet, col * w, row * h, w, h, snap(grandma.x - w / 2), snap(grandma.y - h + 2), w, h);
}

// The hero's own remarks, in a bubble over his head. They never stop the game.
// A remark stays as long as it takes to read, and its time runs only while all of it can be seen:
// it waits while a dialog, a close-up or the screen's buttons and panels would hide it.
const SPEECH_BASE_SECONDS = 1.5;
const SPEECH_SECONDS_PER_LETTER = 0.085;
const SPEECH_MIN_SECONDS = 3;
const SPEECH_WIDTH = 104;
const SPEECH_FONT = 7;
const SPEECH_LINE = 9;
const SPEECH_GAP = 4;
// Page elements drawn over the game; a remark is never placed under them.
const SPEECH_COVERED_BY = ["objective", "map-button", "action-button", "location-name", "dev-toggle", "dev-panel", "dialog"];
const heroSpeech = { queue: [], text: "", time: 0, visible: false, box: null };

function heroSay(lines) {
  heroSpeech.queue.push(...lines);
  if (!heroSpeech.text) nextHeroLine();
}

// A reaction to what the hero just did comes at once, over anything he was saying.
function heroInterrupt(lines) {
  heroSpeech.queue = [...lines];
  nextHeroLine();
}

function readingTime(text) {
  return Math.max(SPEECH_MIN_SECONDS, SPEECH_BASE_SECONDS + text.length * SPEECH_SECONDS_PER_LETTER);
}

function nextHeroLine() {
  heroSpeech.text = heroSpeech.queue.shift() || "";
  heroSpeech.time = heroSpeech.text ? readingTime(heroSpeech.text) : 0;
  heroSpeech.visible = false;
}

// Says something the first time he comes somewhere, once per game.
function heroRemark(key, line) {
  if (quest.heroSaid[key] || !line) return;
  quest.heroSaid[key] = true;
  heroSay([line]);
}

function updateHeroSpeech(dt) {
  heroRemark(currentLocation, T().hero.places[currentLocation]);
  if (isNearGarden()) heroRemark("garden", T().hero.garden);
  if (isNight() && quest.discoDone) heroRemark("night", T().hero.night);
  if (heroSpeech.text && heroSpeech.visible) {
    heroSpeech.time -= dt;
    if (heroSpeech.time <= 0) nextHeroLine();
  }
}

function wrapSpeech(ctx, text) {
  const lines = [];
  let line = "";
  text.split(" ").forEach((word) => {
    const longer = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(longer).width > SPEECH_WIDTH) {
      lines.push(line);
      line = word;
    } else {
      line = longer;
    }
  });
  lines.push(line);
  return lines;
}

// The page's panels and buttons, in world pixels of the current view.
function speechBlockers(camX, camY, zoom) {
  const toWorld = view.scale * zoom;
  return SPEECH_COVERED_BY.map((id) => document.getElementById(id))
    .filter((element) => element && !element.hidden && element.getBoundingClientRect)
    .map((element) => element.getBoundingClientRect())
    .filter((r) => r.width > 0 && r.height > 0)
    .map((r) => [camX + r.left / toWorld, camY + r.top / toWorld, camX + r.right / toWorld, camY + r.bottom / toWorld]);
}

function boxesMeet([l1, t1, r1, b1], [l2, t2, r2, b2]) {
  return l1 < r2 && l2 < r1 && t1 < b2 && t2 < b1;
}

function drawHeroSpeech(ctx, worldView, camX, camY, zoom) {
  heroSpeech.visible = false;
  heroSpeech.box = null;
  if (!heroSpeech.text) return;
  ctx.font = `bold ${SPEECH_FONT}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const lines = wrapSpeech(ctx, heroSpeech.text);
  const width = Math.max(...lines.map((line) => ctx.measureText(line).width)) + 10;
  const height = lines.length * SPEECH_LINE + 6;
  const left = Math.max(camX + 2, Math.min(camX + worldView.width - width - 2, player.x - width / 2));
  const headTop = player.y - (quest.riding ? 40 : 44);
  const view = [camX + 1, camY + 1, camX + worldView.width - 1, camY + worldView.height - 1];
  const blockers = speechBlockers(camX, camY, zoom);
  // Over his head if it all fits there, else under his feet; if neither, it waits.
  const place = [{ top: headTop - height - SPEECH_GAP, above: true }, { top: player.y + SPEECH_GAP, above: false }].find(({ top }) => {
    const box = [left, top, left + width, top + height];
    const inView = box[0] >= view[0] && box[1] >= view[1] && box[2] <= view[2] && box[3] <= view[3];
    return inView && !blockers.some((b) => boxesMeet(box, [b[0] - 2, b[1] - 2, b[2] + 2, b[3] + 2]));
  });
  if (!place) {
    ctx.textAlign = "left";
    return;
  }
  const top = place.top;
  heroSpeech.visible = true;
  heroSpeech.box = [left, top, left + width, top + height];
  ctx.fillStyle = "rgba(28, 18, 12, 0.72)";
  ctx.fillRect(snap(left), snap(top), width, height);
  const tailX = snap(Math.max(left + 3, Math.min(left + width - 6, player.x - 1)));
  ctx.fillRect(tailX, snap(place.above ? top + height : top - 3), 3, 3);
  ctx.fillStyle = "#fff8e8";
  lines.forEach((line, i) => ctx.fillText(line, snap(left + width / 2), snap(top + 3 + i * SPEECH_LINE)));
  ctx.textAlign = "left";
}

function updateGuard(dog, time) {
  const near = Math.hypot(dog.x - player.x, dog.y - player.y) < DOG_BARK_DISTANCE;
  dog.frame = near && Math.floor(time / 220) % 2 === 0 ? DOG_POSE.bark : DOG_POSE.sit;
  if (near) dog.flip = player.x < dog.x;
}

// Walks to a point on its line, stops to sniff or sit for a while, then picks another.
function updateWanderer(dog, dt, time) {
  if (dog.wait > 0) {
    dog.wait -= dt;
    dog.frame = dog.idle === undefined ? DOG_POSE.sit : dog.idle;
    return;
  }
  if (dog.target === undefined) dog.target = dog.from + Math.random() * (dog.to - dog.from);
  const step = DOG_WALK_SPEED * dt;
  const left = dog.target - dog.x;
  if (Math.abs(left) <= step) {
    dog.target = undefined;
    dog.wait = 2 + Math.random() * 4;
    dog.idle = Math.random() < 0.5 ? DOG_POSE.sniff : DOG_POSE.sit;
    return;
  }
  dog.x += Math.sign(left) * step;
  dog.flip = left < 0;
  dog.frame = Math.floor(time / 180) % 2 === 0 ? DOG_POSE.walkA : DOG_POSE.walkB;
}

// Cats are slow: they sit, wash, nap, stroll a little, and the friendly ones come over to the hero.
// They are never solid, and they only walk where the ground is free.
function isGroundFree(x, y) {
  return !here().solids.some((area) => isInside(x, y, area));
}

function chooseCatMood(cat) {
  if (cat.home === undefined) cat.home = { x: cat.x, y: cat.y };
  const heroClose = Math.hypot(cat.x - player.x, cat.y - player.y) < CAT_NOTICES_HERO;
  const roll = Math.random();
  if (cat.friendly && heroClose && roll < 0.55) {
    cat.mood = "approach";
    cat.moodTime = 8;
  } else if (roll < 0.35) {
    cat.mood = "wash";
    cat.moodTime = 3 + Math.random() * 4;
  } else if (roll < 0.55) {
    cat.mood = "sleep";
    cat.moodTime = 6 + Math.random() * 8;
  } else if (roll < 0.8) {
    cat.mood = "stroll";
    cat.moodTime = 5;
    cat.strollX = cat.home.x + (Math.random() - 0.5) * CAT_STROLL * 2;
    cat.strollY = cat.home.y + (Math.random() - 0.5) * CAT_STROLL;
  } else {
    cat.mood = "sit";
    cat.moodTime = 3 + Math.random() * 3;
  }
}

function walkCat(cat, targetX, targetY, stopAt, dt, time) {
  const dx = targetX - cat.x;
  const dy = targetY - cat.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= stopAt) return false;
  const stepX = (dx / distance) * CAT_WALK_SPEED * dt;
  const stepY = (dy / distance) * CAT_WALK_SPEED * dt;
  if (!isGroundFree(cat.x + stepX, cat.y + stepY)) return false;
  cat.x += stepX;
  cat.y += stepY;
  cat.flip = dx < 0;
  cat.frame = Math.floor(time / 260) % 2 === 0 ? CAT_POSE.walkA : CAT_POSE.walkB;
  return true;
}

function updateCat(cat, dt, time) {
  cat.moodTime = (cat.moodTime || 0) - dt;
  if (cat.moodTime <= 0) chooseCatMood(cat);
  if (cat.mood === "approach") {
    if (!walkCat(cat, player.x, player.y, CAT_STOPS_FROM_HERO, dt, time)) {
      cat.frame = CAT_POSE.sit;
      cat.flip = player.x < cat.x;
    }
  } else if (cat.mood === "stroll") {
    if (!walkCat(cat, cat.strollX, cat.strollY, 2, dt, time)) cat.frame = CAT_POSE.stand;
  } else if (cat.mood === "wash") {
    cat.frame = Math.floor(time / 420) % 2 === 0 ? CAT_POSE.washA : CAT_POSE.washB;
  } else if (cat.mood === "sleep") {
    cat.frame = CAT_POSE.sleep;
  } else {
    cat.frame = CAT_POSE.sit;
  }
}

function updateAnimals(dt, time) {
  animals.forEach((animal) => {
    if (animal.location !== currentLocation || !animal.behaviour) return;
    if (isNight()) animal.frame = animal.kind === "cat" ? CAT_POSE.sleep : DOG_POSE.sleep;
    else if (animal.behaviour === "cat") updateCat(animal, dt, time);
    else if (animal.behaviour === "guard") updateGuard(animal, time);
    else updateWanderer(animal, dt, time);
  });
}

// A soft shadow on the ground, so an animal stands in the picture instead of floating over it.
function drawFootShadow(ctx, x, y, width) {
  ctx.fillStyle = "rgba(30, 18, 8, 0.32)";
  ctx.beginPath();
  ctx.ellipse(x, y, width, Math.max(1.5, width * 0.28), 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawAnimal(ctx, animal) {
  const sheet = animal.kind === "cat" ? ART.cats : ART.dogs;
  const { w, h } = animal.kind === "cat" ? CAT_CELL : DOG_CELL;
  const pose = animal.frame === undefined ? animal.pose : animal.frame;
  const left = snap(animal.x - w / 2);
  const top = snap(animal.y - h + 2);
  drawFootShadow(ctx, animal.x, animal.y + 1, w * 0.3);
  ctx.save();
  ctx.translate(animal.flip ? left + w : left, top);
  if (animal.flip) ctx.scale(-1, 1);
  ctx.drawImage(sheet, pose * w, animal.coat * h, w, h, 0, 0, w, h);
  ctx.restore();
}
const travel = { active: false, time: 0, exit: null, switched: false };

function initWorld() {
  decorateLocation();
  resetChickens();
}

// Butterflies and cloud shadows for the location just entered, scattered over its picture.
function decorateLocation() {
  const { width, height } = ART[here().art];
  butterflies = here().indoor ? [] : [0, 2, 4].map((phase) => ({
    x: width * (0.2 + Math.random() * 0.6),
    y: height * (0.3 + Math.random() * 0.5),
    phase,
  }));
  cloudShadows = here().indoor ? [] : [
    { x: width * 0.2, y: height * 0.3, rx: 90, ry: 40, speed: 6 },
    { x: width * 0.7, y: height * 0.7, rx: 70, ry: 30, speed: 5 },
  ];
}

function enterLocation(id, position, dir) {
  currentLocation = id;
  placePlayer(position);
  player.dir = dir || "down";
  player.toldExit = null;
  decorateLocation();
}

function resetChickens() {
  const left = stageReached("moped") ? 0 : CHICKEN_COUNT - quest.chickensHerded;
  const hens = ["henWhite", "henGinger", "henBlack"].slice(CHICKEN_COUNT - left);
  // The rooster always stays in the yard and is never herded.
  chickens = ["rooster", ...hens].map((sprite, i) => {
    const x = CHICKEN_YARD.left + 10 + i * 18;
    const y = CHICKEN_YARD.top + 10 + (i % 2) * 18;
    return { sprite, herdable: sprite !== "rooster", x, y, targetX: x, targetY: y, wait: i, flip: false, peck: false, running: false };
  });
}

function placePlayer(position) {
  player.x = position.x;
  player.y = position.y;
  player.dir = "down";
}

// ---------- update ----------

// Closed ways block like walls; open ones are walked into.
function isClosedExit(exit) {
  return Boolean(exit.closed && exit.closed());
}

function isBlocked(x, y) {
  // The hero only bumps into things with a small box around the feet.
  const corners = [
    [x - 4, y - 3],
    [x + 4, y - 3],
    [x - 4, y],
    [x + 4, y],
  ];
  const { width, height } = ART[here().art];
  const touches = (area) => corners.some(([cx, cy]) => isInside(cx, cy, area));
  if (x < 4 || x > width - 4 || y < 3 || y > height) return true;
  if (here().solids.some(touches)) return true;
  if (here().exits.some((exit) => isClosedExit(exit) && touches(exit.area))) return true;
  // People block only when walking closer, so nobody can ever get stuck inside one.
  return npcsHere().some((npc) => {
    if (npc.passable) return false;
    const distance = Math.hypot(npc.x - x, npc.y - y);
    return distance < 8 && distance < Math.hypot(npc.x - player.x, npc.y - player.y);
  });
}

// How far a corner can push the hero aside, so walking past one never catches.
const CORNER_SLIDE = 6;

// Moves along one axis. When a corner blocks the way, slides sideways round it.
function stepAxis(dx, dy, speed, dt) {
  if (!dx && !dy) return;
  if (!isBlocked(player.x + dx, player.y + dy)) {
    player.x += dx;
    player.y += dy;
    return;
  }
  const slide = speed * dt;
  for (let reach = 1; reach <= CORNER_SLIDE; reach++) {
    for (const side of [-1, 1]) {
      const sideX = dy ? side * reach : 0;
      const sideY = dx ? side * reach : 0;
      if (!isBlocked(player.x + dx + sideX, player.y + dy + sideY)) {
        const stepX = Math.sign(sideX) * slide;
        const stepY = Math.sign(sideY) * slide;
        if (!isBlocked(player.x + stepX, player.y + stepY)) {
          player.x += stepX;
          player.y += stepY;
        }
        return;
      }
    }
  }
}

function startTravel(exit) {
  travel.active = true;
  travel.time = 0;
  travel.exit = exit;
  travel.switched = false;
  player.moving = false;
  player.walked = 0;
}

// Fades to black, swaps the location, fades back.
function updateTravel(dt) {
  travel.time += dt;
  if (!travel.switched && travel.time >= FADE_TIME) {
    travel.switched = true;
    enterLocation(travel.exit.to, travel.exit.spawn, travel.exit.dir);
    saveGame();
  }
  if (travel.time >= FADE_TIME * 2) travel.active = false;
}

// The closed way the hero is walking straight into, if any. Passing alongside one does not count.
function closedExitAhead(dx, dy) {
  if (!dx && !dy) return null;
  const alongX = Math.abs(dx) >= Math.abs(dy);
  const x = player.x + (alongX ? Math.sign(dx) * 3 : 0);
  const y = player.y + (alongX ? 0 : Math.sign(dy) * 3);
  const feet = [[x - 4, y - 3], [x + 4, y - 3], [x - 4, y], [x + 4, y]];
  return here().exits.find((exit) => isClosedExit(exit) && feet.some(([cx, cy]) => isInside(cx, cy, exit.area)));
}

function checkExits(dx, dy) {
  // Bumping a closed way tells why, once, until the hero walks away from it.
  const closed = closedExitAhead(dx, dy);
  if (closed) {
    if (player.toldExit !== closed.id) {
      player.toldExit = closed.id;
      openDialog(closed.closed());
    }
    return;
  }
  if (player.toldExit) {
    const told = here().exits.find((exit) => exit.id === player.toldExit);
    if (!told || !isInside(player.x, player.y, [told.area[0] - 24, told.area[1] - 24, told.area[2] + 24, told.area[3] + 24])) {
      player.toldExit = null;
    }
  }
  const exit = here().exits.find((e) => e.to && !isClosedExit(e) && isInside(player.x, player.y, e.area));
  if (exit) startTravel(exit);
}

function updatePlayer(dt) {
  const speed = quest.riding ? MOPED_SPEED : WALK_SPEED;
  const dx = input.moveX * speed * dt;
  const dy = input.moveY * speed * dt;
  player.moving = dx !== 0 || dy !== 0;

  if (player.moving) {
    if (Math.abs(input.moveX) > Math.abs(input.moveY)) {
      player.dir = input.moveX < 0 ? "left" : "right";
    } else {
      player.dir = input.moveY < 0 ? "up" : "down";
    }
  }

  const fromX = player.x;
  const fromY = player.y;
  stepAxis(dx, 0, speed, dt);
  stepAxis(0, dy, speed, dt);
  // Walking into a wall leaves the hero standing, not walking on the spot.
  const covered = Math.hypot(player.x - fromX, player.y - fromY);
  player.walked = player.moving && covered > 0 ? player.walked + covered : 0;
  checkExits(dx, dy);
}

function updateChickens(dt) {
  if (currentLocation !== "yard") return;
  const herding = quest.stage === "chickens";
  chickens.forEach((c) => {
    if (herding && c.herdable && !c.running && Math.hypot(c.x - player.x, c.y - player.y) < 22) {
      c.running = true;
      c.targetX = SHED_DOOR.x;
      c.targetY = SHED_DOOR.y;
      c.wait = 0;
    }
    if (c.wait > 0) {
      c.wait -= dt;
      return;
    }
    const dx = c.targetX - c.x;
    const dy = c.targetY - c.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 2) {
      if (c.running) {
        c.gone = true;
        return;
      }
      c.targetX = CHICKEN_YARD.left + Math.random() * (CHICKEN_YARD.right - CHICKEN_YARD.left);
      c.targetY = CHICKEN_YARD.top + Math.random() * (CHICKEN_YARD.bottom - CHICKEN_YARD.top);
      c.wait = 0.5 + Math.random() * 2.5;
      c.peck = Math.random() < 0.6;
      return;
    }
    const step = Math.min(distance, (c.running ? 45 : 14) * dt);
    c.x += (dx / distance) * step;
    c.y += (dy / distance) * step;
    c.flip = dx < 0;
    c.peck = false;
  });

  const herded = chickens.filter((c) => c.gone).length;
  if (herded > 0) {
    chickens = chickens.filter((c) => !c.gone);
    quest.chickensHerded += herded;
    if (quest.chickensHerded >= CHICKEN_COUNT) onAllChickensHerded();
  }
}

function updateWorld(dt) {
  updatePlayer(dt);
  updateChickens(dt);
  updateAnimals(dt, performance.now());
  updateHeroSpeech(dt);
  updateGrandma(dt);
  const mapWidth = ART[here().art].width;
  cloudShadows.forEach((cloud) => {
    cloud.x += cloud.speed * dt;
    if (cloud.x - cloud.rx > mapWidth) cloud.x = -cloud.rx;
  });
}

// The beds work only when the hero is actually standing on them.
function isNearGarden() {
  return currentLocation === "yard" && isInside(player.x, player.y, GARDEN_AREA);
}

// The moped counts when it was ridden to the club and stands anywhere on the square.
function isMopedNearLads() {
  if (quest.riding) return currentLocation === CLUB_PARKING.location;
  return quest.mopedFound && quest.moped.location === CLUB_PARKING.location;
}

function isPlaceAvailable(place) {
  switch (place.id) {
    case "backpack": return quest.backpackShown || quest.outfit === "sport";
    case "truck": return quest.unload === "working" && !isNight();
    case "shopDoor": return isNight();
    case "varenyky": return !quest.ateVarenyky;
    case "beerBottle": return canFindBeer();
    default: return true;
  }
}

// Everything the player can use right now, as targets with a world position.
function currentTargets() {
  const targets = [
    ...npcsHere(),
    ...Object.values(places).filter((place) => place.location === currentLocation && isPlaceAvailable(place)),
  ];
  if (isMopedHere()) targets.push({ id: "moped", x: quest.moped.x, y: quest.moped.y });
  return targets;
}

const RIGHT_BESIDE = 14;
const WALKER_GIVES_WAY = 30;

function isMopedHere() {
  return quest.mopedFound && !quest.riding && quest.moped.location === currentLocation;
}

function nearestTarget() {
  const grandma = npcs[0];
  const besideGrandma = currentLocation === grandma.location && !isNight()
    && Math.hypot(grandma.x - player.x, grandma.y - player.y) < RIGHT_BESIDE;
  let best = null;
  let bestScore = Infinity;
  for (const target of currentTargets()) {
    // A target with an area is used from anywhere inside it, and only there.
    const distance = target.area
      ? (isInside(player.x, player.y, target.area) ? 0 : Infinity)
      : Math.hypot(target.x - player.x, target.y - player.y);
    if (distance >= TALK_DISTANCE) continue;
    // Someone who walks about never gets in the way of things that stay put.
    const score = target.walker && !besideGrandma ? distance + WALKER_GIVES_WAY : distance;
    if (score < bestScore) {
      best = target;
      bestScore = score;
    }
  }
  // Things that stay put come first, then grandma when right beside her, then the potato beds.
  if (best && (!best.walker || besideGrandma)) return best;
  if (canCollectBeetles() && isNearGarden()) return { id: "garden", x: player.x, y: player.y - 4 };
  return best;
}

// ---------- drawing ----------

function cameraOffset(center, viewSize, mapSize) {
  if (mapSize <= viewSize) return snap((mapSize - viewSize) / 2);
  // Snap the followed position first, so the hero stays on exactly the same screen pixel.
  return snap(Math.max(0, Math.min(snap(center) - snap(viewSize / 2), mapSize - viewSize)));
}

// Chicken strips: 0 idle, 1-5 walking, 6-9 pecking, 10 wings spread.
const CHICKEN_FRAMES = 11;

function chickenFrame(c, time) {
  if (c.running) return Math.floor(time / 150) % 3 === 0 ? 10 : 1 + (Math.floor(time / 70) % 5);
  if (c.wait <= 0) return 1 + (Math.floor(time / 120) % 5);
  if (c.peck) return 6 + (Math.floor(time / 160) % 4);
  return 0;
}

// Draws a sprite standing with its feet at (x, y).
function drawStanding(ctx, img, x, y, flip, bob) {
  const left = snap(x - img.width / 2);
  const top = snap(y - img.height + 2 - (bob || 0));
  if (!flip) {
    ctx.drawImage(img, left, top);
    return;
  }
  ctx.save();
  ctx.translate(left + img.width, top);
  ctx.scale(-1, 1);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

// Hero sheets (tools/art/reference.py, HERO_SHEETS): rows down, up, left, right (8 walking frames),
// then 4 idle frames facing the viewer, then standing still facing down, up, left, right.
const HERO_FRAME_W = 32;
const HERO_FRAME_H = 48; // room for a full stride, the bob of a step and a foot nearer the viewer
const HERO_SOLES = 45; // a standing hero's soles end above this row of the cell (HERO_SOLES in reference.py)
const HERO_ROWS = { down: 0, up: 1, left: 2, right: 3 };
const HERO_IDLE_ROW = 4;
const HERO_STAND_ROW = 5;
// The walk follows the ground covered, so the feet do not slide: a step is about 0.4 of a 40 px
// person, two steps make the 8 frames of a cycle.
const HERO_STEP_PX = 16;
const HERO_FRAME_PX = (HERO_STEP_PX * 2) / 8;

function heroFrame(time) {
  if (player.walked > 0) return { row: HERO_ROWS[player.dir], col: Math.floor(player.walked / HERO_FRAME_PX) % 8 };
  if (player.dir === "down") return { row: HERO_IDLE_ROW, col: Math.floor(time / 400) % 4 };
  return { row: HERO_STAND_ROW, col: HERO_ROWS[player.dir] };
}

// Moped sheet: rows right and left (6 frames each), then up and down (1 frame each).
const MOPED_FRAME_W = 45;
const MOPED_FRAME_H = 38;
const MOPED_ROWS = { right: 0, left: 1, up: 2, down: 3 };

function mopedFrame(time) {
  const row = MOPED_ROWS[player.dir];
  const sideways = row <= 1;
  if (sideways && player.moving) return { row, col: Math.floor(time / 90) % 6 };
  return { row, col: 0 };
}

function drawPlayer(ctx, time) {
  let top;
  if (quest.riding) {
    const { row, col } = mopedFrame(time);
    top = snap(player.y - MOPED_FRAME_H + 2);
    ctx.drawImage(ART.heroMoped, col * MOPED_FRAME_W, row * MOPED_FRAME_H, MOPED_FRAME_W, MOPED_FRAME_H,
      snap(player.x - MOPED_FRAME_W / 2), top, MOPED_FRAME_W, MOPED_FRAME_H);
  } else {
    const sheet = quest.outfit === "sport" ? ART.heroSport : ART.heroCity;
    const { row, col } = heroFrame(time);
    top = snap(player.y + 1 - HERO_SOLES);
    ctx.drawImage(sheet, col * HERO_FRAME_W, row * HERO_FRAME_H, HERO_FRAME_W, HERO_FRAME_H,
      snap(player.x - HERO_FRAME_W / 2), top, HERO_FRAME_W, HERO_FRAME_H);
  }
  if (quest.carrying) {
    ctx.drawImage(ART.crate, snap(player.x - 5), snap(top - 1));
  }
}

// Worldwide tint for the night: drawn after the characters, then lamps and windows glow through.
function drawNight(ctx, worldView, camX, camY) {
  const indoor = here().indoor;
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = indoor ? "#6f6a86" : "#3a4a86";
  ctx.fillRect(camX, camY, worldView.width, worldView.height);
  ctx.globalCompositeOperation = "lighter";
  here().lights.forEach(({ x, y, radius }) => {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, indoor ? "rgba(255, 190, 110, 0.32)" : "rgba(255, 196, 110, 0.42)");
    glow.addColorStop(1, "rgba(255, 196, 110, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  });
  ctx.globalCompositeOperation = "source-over";
}

// Evening: the low sun turns everything a little warmer and darker, while shadows stay cool
// (the designer's review: a strong amber wash made paving, grass and people one brown).
function drawEvening(ctx, worldView, camX, camY) {
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = here().indoor ? "#efe4d6" : "#f3d6b8";
  ctx.fillRect(camX, camY, worldView.width, worldView.height);
  ctx.globalCompositeOperation = "soft-light";
  ctx.fillStyle = "rgba(70, 90, 130, 0.18)";
  ctx.fillRect(camX, camY, worldView.width, worldView.height);
  ctx.globalCompositeOperation = "source-over";
}

// Did Petro on his bench: mostly sitting, now and then a pull on the cigarette.
const PETRO_FRAME_W = 36;
const PETRO_SMOKING = [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 3, 3, 0, 0, 0];

function drawNpc(ctx, npc, time) {
  if (npc.inWindow) return; // painted into the picture, seen in the shop window
  if (npc.walker) {
    drawGrandma(ctx, npc, time);
    return;
  }
  if (npc.sprite === "grandpa") {
    const beat = PETRO_SMOKING[Math.floor(time / 500) % PETRO_SMOKING.length];
    drawFrame(ctx, ART.petroBench, beat, PETRO_FRAME_W, npc.x - PETRO_FRAME_W / 2, npc.y - ART.petroBench.height + 2);
    return;
  }
  drawStanding(ctx, ART[npc.sprite], npc.x, npc.y, npc.x > player.x + 30);
}

// Picks the zoom for the current location: it fills the screen when it can, and the view never
// gets narrower than a comfortable width. Returns the location's view, in game pixels.
const MIN_WORLD_VIEW = 120;

function worldZoom() {
  const { width, height } = ART[here().art];
  const dpr = window.devicePixelRatio || 1;
  const cover = Math.ceil(Math.max(window.innerWidth / width, window.innerHeight / height));
  const limit = Math.floor(Math.min(window.innerWidth, window.innerHeight) / MIN_WORLD_VIEW);
  const scale = Math.max(view.scale, Math.min(cover, limit));
  return Math.max(1, Math.round(scale * dpr)) / PIXEL;
}

function drawWorld(ctx, view, time, target) {
  const location = here();
  const picture = ART[location.art];
  const zoom = worldZoom();
  const worldView = { width: view.width / zoom, height: view.height / zoom };

  // snap() rounds to real screen pixels, and those change with the zoom.
  const basePixel = PIXEL;
  PIXEL = basePixel * zoom;

  const camX = cameraOffset(player.x, worldView.width, picture.width);
  const camY = cameraOffset(player.y, worldView.height, picture.height);

  ctx.fillStyle = location.backdrop;
  ctx.fillRect(0, 0, view.width, view.height);
  ctx.save();
  ctx.scale(zoom, zoom);
  ctx.translate(-camX, -camY);
  ctx.drawImage(picture, 0, 0);

  const drawables = [];
  const add = (y, draw) => drawables.push({ y, draw });
  const addPlace = (place, art) => {
    if (place.location === currentLocation && isPlaceAvailable(place)) {
      add(place.y, () => drawStanding(ctx, art, place.x, place.y));
    }
  };

  location.props.forEach((prop) => add(prop.y, () => drawStanding(ctx, ART[prop.art], prop.x, prop.y)));
  if (currentLocation === "house") {
    // Food sits on the furniture, so it sorts just in front of it.
    const plate = quest.ateVarenyky ? ART.housePlate : ART.houseVarenyky;
    add(205.5, () => ctx.drawImage(plate, snap(250 - plate.width / 2), 182));
  }
  npcsHere().forEach((npc) => add(npc.y, () => drawNpc(ctx, npc, time)));
  (location.scenery || []).forEach((person) => {
    if (!(person.dayOnly && isNight())) add(person.y, () => drawNpc(ctx, person, time));
  });
  add(player.y, () => drawPlayer(ctx, time));
  addPlace(places.backpack, ART.backpack);
  addPlace(places.truck, ART.truck);
  if (isMopedHere()) add(quest.moped.y, () => drawStanding(ctx, ART.moped, quest.moped.x, quest.moped.y));
  animals.forEach((animal) => {
    if (animal.location === currentLocation) add(animal.y, () => drawAnimal(ctx, animal));
  });
  if (currentLocation === "shop" && canFindBeer()) {
    add(BEER_BOTTLE.sortY, () => drawStanding(ctx, ART.beerBottle, BEER_BOTTLE.x, BEER_BOTTLE.y));
  }
  if (isNight() && location.nightProps) {
    location.nightProps.forEach((prop) => ctx.drawImage(ART[prop.art], prop.x, prop.y));
  }

  if (currentLocation === "yard") chickens.forEach((c) => {
    add(c.y, () => {
      const img = ART[c.sprite];
      drawFootShadow(ctx, c.x, c.y + 1, 5);
      const frameWidth = img.width / CHICKEN_FRAMES;
      ctx.save();
      ctx.translate(snap(c.x), snap(c.y - img.height + 2));
      if (c.flip) ctx.scale(-1, 1);
      drawFrame(ctx, img, chickenFrame(c, time), frameWidth, -frameWidth / 2, 0);
      ctx.restore();
    });
  });

  if (canCollectBeetles() && currentLocation === "yard") {
    [[301, 191], [344, 207], [370, 185], [323, 215]].forEach(([x, y], i) => {
      add(y, () => ctx.drawImage(ART.beetleSmall, x, y + (Math.floor(time / 500 + i) % 2)));
    });
  }

  location.occluders.forEach((o) => add(o.baseY, () => ctx.drawImage(ART[o.art], o.x, o.y)));

  drawables.sort((a, b) => a.y - b.y).forEach((d) => d.draw());

  if (!isNight()) butterflies.forEach((b) => {
    const t = time / 1000 + b.phase;
    const x = b.x + Math.sin(t * 0.7) * 24 + Math.sin(t * 2.3) * 4;
    const y = b.y + Math.sin(t * 1.1) * 12 - Math.abs(Math.sin(t * 3)) * 4;
    drawFrame(ctx, ART.butterfly, Math.floor(time / 120) % 2, 7, x, y);
  });

  if (isNight()) {
    drawNight(ctx, worldView, camX, camY);
  } else {
    if (quest.time === "evening") drawEvening(ctx, worldView, camX, camY);
    ctx.fillStyle = "rgba(20, 30, 40, 0.08)";
    cloudShadows.forEach((cloud) => {
      ctx.beginPath();
      ctx.ellipse(cloud.x, cloud.y, cloud.rx, cloud.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawExitArrows(ctx);
  if (DEBUG) drawSolids(ctx);
  if (target) drawHint(ctx, target, time);
  if (mode === "world" && !dialog.open && !travel.active) drawHeroSpeech(ctx, worldView, camX, camY, zoom);
  else heroSpeech.visible = false;
  ctx.restore();
  PIXEL = basePixel;

  if (!isNight()) drawSunlight(ctx, view);
  if (travel.active) {
    ctx.fillStyle = `rgba(10, 8, 6, ${1 - Math.abs(travel.time / FADE_TIME - 1)})`;
    ctx.fillRect(0, 0, view.width, view.height);
  }
}

const ARROW_ANGLE = { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 };
const ARROW_STEP = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };
const ARROW_INSET = 14;

// One pixel-art chevron pointing up, centred on (0, 0).
function drawChevron(ctx, y, color) {
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = color;
    ctx.fillRect(-i - 1, y + i, 2, 2);
    ctx.fillRect(i - 1, y + i, 2, 2);
  }
}

// A still yellow arrow on every way out that is open, so the player sees where the paths lead.
function drawExitArrows(ctx) {
  here().exits.forEach((exit) => {
    if (!exit.to || isClosedExit(exit)) return;
    const [left, top, right, bottom] = exit.area;
    const [stepX, stepY] = ARROW_STEP[exit.dir];
    ctx.save();
    ctx.translate(snap((left + right) / 2 - stepX * ARROW_INSET), snap((top + bottom) / 2 - stepY * ARROW_INSET));
    ctx.rotate(ARROW_ANGLE[exit.dir]);
    [[-1, "#2a1d17"], [1, "#2a1d17"], [0, "#f0c64a"]].forEach(([shift, color]) => drawChevron(ctx, -2 + shift, color));
    ctx.restore();
  });
}

function drawSolids(ctx) {
  ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
  here().solids.forEach(([left, top, right, bottom]) => ctx.fillRect(left, top, right - left, bottom - top));
  here().exits.forEach((exit) => {
    const [left, top, right, bottom] = exit.area;
    ctx.fillStyle = isClosedExit(exit) ? "rgba(255, 160, 0, 0.6)" : "rgba(0, 255, 120, 0.6)";
    ctx.fillRect(left, top, right - left, bottom - top);
  });
}

function drawHint(ctx, target, time) {
  const x = snap(target.x) - 3;
  // High enough to clear the hair of a 40 px person.
  const y = snap(target.y) - 55 + (Math.floor(time / 300) % 2);
  ctx.fillStyle = "#2a1d17";
  ctx.fillRect(x - 1, y - 1, 8, 11);
  ctx.fillStyle = "#fbf6ea";
  ctx.fillRect(x, y, 6, 9);
  ctx.fillStyle = "#c4473a";
  ctx.fillRect(x + 2, y + 1, 2, 5);
  ctx.fillRect(x + 2, y + 7, 2, 1);
}

// Made once per screen size: building a full-screen gradient every frame is slow on phones.
let vignette = { key: "", gradient: null };

function drawSunlight(ctx, view) {
  ctx.fillStyle = "rgba(255, 196, 120, 0.06)";
  ctx.fillRect(0, 0, view.width, view.height);
  const key = `${view.width}x${view.height}`;
  if (vignette.key !== key) {
    const radius = Math.max(view.width, view.height) * 0.75;
    const cx = view.width / 2;
    const cy = view.height / 2;
    const gradient = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius);
    gradient.addColorStop(0, "rgba(40, 20, 10, 0)");
    gradient.addColorStop(1, "rgba(40, 20, 10, 0.3)");
    vignette = { key, gradient };
  }
  ctx.fillStyle = vignette.gradient;
  ctx.fillRect(0, 0, view.width, view.height);
  // Nothing here may pulse or flash: a pale wash that came and went after beer read as flicker.
}
