const WALK_SPEED = 55;
const MOPED_SPEED = 95;
const TALK_DISTANCE = 22;
const START_POSITION = { x: 664, y: 380 };
const WAKE_UP_POSITION = { x: 256, y: 182 };
const CLUB_PARKING = { x: 472, y: 236 };
const SHED_DOOR = { x: 224, y: 136 };
const CHICKEN_YARD = { left: 212, right: 284, top: 150, bottom: 188 };
const DEBUG = location.search.includes("debug");

const player = { x: START_POSITION.x, y: START_POSITION.y, dir: "down", moving: false, walkTime: 0 };

const npcs = [
  { id: "grandma", sprite: "grandma", x: 256, y: 160, talk: talkToGrandma },
  { id: "valya", sprite: "seller", x: 648, y: 238, talk: talkToValya },
  { id: "grandpa", sprite: "grandpa", x: 184, y: 322, talk: talkToGrandpa },
  { id: "lads", sprite: "ladRed", x: 432, y: 154, talk: talkToLads },
  { id: "lads", sprite: "ladSquat", x: 488, y: 155, talk: talkToLads },
  { id: "lads", sprite: "ladCap", x: 520, y: 154, talk: talkToLads },
];

const places = {
  well: { id: "well", x: 296, y: 180 },
  shed: { id: "shed", x: SHED_DOOR.x, y: SHED_DOOR.y },
  backpack: { id: "backpack", x: 196, y: 152 },
  truck: { id: "truck", x: 720, y: 268 },
};

let chickens = [];
let butterflies = [];
let cloudShadows = [];
const cat = { x: 158, y: 312 };

function initWorld() {
  butterflies = [
    { x: 290, y: 90, phase: 0 },
    { x: 470, y: 200, phase: 2 },
    { x: 180, y: 300, phase: 4 },
    { x: 560, y: 420, phase: 1 },
  ];
  cloudShadows = [
    { x: 40, y: 80, rx: 80, ry: 36, speed: 6 },
    { x: 360, y: 300, rx: 100, ry: 44, speed: 5 },
    { x: 650, y: 460, rx: 70, ry: 30, speed: 7 },
  ];
  resetChickens();
}

function resetChickens() {
  const left = stageReached("moped") ? 0 : CHICKEN_COUNT - quest.chickensHerded;
  chickens = Array.from({ length: left }, (_, i) => {
    const x = CHICKEN_YARD.left + 10 + i * 22;
    const y = CHICKEN_YARD.top + 10 + (i % 2) * 18;
    return { x, y, targetX: x, targetY: y, wait: i, flip: false, peck: false, running: false };
  });
}

function placePlayer(position) {
  player.x = position.x;
  player.y = position.y;
  player.dir = "down";
}

// ---------- update ----------

function isBlocked(x, y) {
  const corners = [
    [x - 5, y - 4],
    [x + 5, y - 4],
    [x - 5, y],
    [x + 5, y],
  ];
  if (corners.some(([cx, cy]) => isSolidTile(cx, cy))) return true;
  return npcs.some((npc) => Math.hypot(npc.x - x, npc.y - y) < 10);
}

function updatePlayer(dt) {
  const speed = quest.riding ? MOPED_SPEED : WALK_SPEED;
  const dx = input.moveX * speed * dt;
  const dy = input.moveY * speed * dt;
  player.moving = dx !== 0 || dy !== 0;

  if (player.moving) {
    player.walkTime += dt;
    if (Math.abs(input.moveX) > Math.abs(input.moveY)) {
      player.dir = input.moveX < 0 ? "left" : "right";
    } else {
      player.dir = input.moveY < 0 ? "up" : "down";
    }
  } else {
    player.walkTime = 0;
  }

  if (!isBlocked(player.x + dx, player.y)) player.x += dx;
  if (!isBlocked(player.x, player.y + dy)) player.y += dy;
}

function updateChickens(dt) {
  const herding = quest.stage === "chickens";
  chickens.forEach((c) => {
    if (herding && !c.running && Math.hypot(c.x - player.x, c.y - player.y) < 22) {
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
    c.flip = dx > 0;
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
  const mapWidth = MAP_COLS * TILE;
  cloudShadows.forEach((cloud) => {
    cloud.x += cloud.speed * dt;
    if (cloud.x - cloud.rx > mapWidth) cloud.x = -cloud.rx;
  });
}

function isNearGarden() {
  const col = Math.floor(player.x / TILE);
  const row = Math.floor((player.y - 2) / TILE);
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (isGardenTile(col + dx, row + dy)) return true;
    }
  }
  return false;
}

function isMopedNearLads() {
  const near = (p) => Math.hypot(p.x - CLUB_PARKING.x, p.y - CLUB_PARKING.y) < 90;
  return quest.riding ? near(player) : quest.mopedFound && near(quest.moped);
}

// Everything the player can use right now, as targets with a world position.
function currentTargets() {
  const targets = [...npcs, places.well, places.shed];
  if (quest.backpackDropped) targets.push(places.backpack);
  if (quest.unload === "working") targets.push(places.truck);
  if (quest.mopedFound && !quest.riding) targets.push({ id: "moped", x: quest.moped.x, y: quest.moped.y });
  return targets;
}

function nearestTarget() {
  if (canCollectBeetles() && isNearGarden()) {
    return { id: "garden", x: player.x, y: player.y - 4 };
  }
  let best = null;
  let bestDistance = TALK_DISTANCE;
  for (const target of currentTargets()) {
    const distance = Math.hypot(target.x - player.x, target.y - player.y);
    if (distance < bestDistance) {
      best = target;
      bestDistance = distance;
    }
  }
  return best;
}

// ---------- drawing ----------

function cameraOffset(center, viewSize, mapSize) {
  if (mapSize <= viewSize) return Math.round((mapSize - viewSize) / 2);
  return Math.round(Math.max(0, Math.min(center - viewSize / 2, mapSize - viewSize)));
}

// Draws a sprite standing with its feet at (x, y).
function drawStanding(ctx, img, x, y, flip, bob) {
  const left = Math.round(x - img.width / 2);
  const top = Math.round(y - img.height + 2 - (bob || 0));
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

function playerSprite() {
  if (quest.riding) return ART.heroMoped;
  return quest.outfit === "sport" ? ART.heroSport : ART.heroCity;
}

function drawPlayer(ctx, time) {
  const bob = player.moving ? Math.floor(player.walkTime * 8) % 2 : 0;
  const flip = player.dir === "left";
  const img = playerSprite();
  drawStanding(ctx, img, player.x, player.y, flip, quest.riding ? 0 : bob);
  if (quest.carrying) {
    ctx.drawImage(ART.crate, Math.round(player.x - 5), Math.round(player.y - img.height - 6));
  }
}

function drawNpc(ctx, npc) {
  if (npc.sprite === "grandpa") {
    // Grandpa is still the small hand-drawn sprite, so draw him at the height of the others.
    ctx.drawImage(ART.grandpa, 0, 0, 16, 24, Math.round(npc.x - 13), Math.round(npc.y - 37), 26, 39);
    return;
  }
  drawStanding(ctx, ART[npc.sprite], npc.x, npc.y, npc.x > player.x + 30);
}

function drawWorld(ctx, view, time, target) {
  const camX = cameraOffset(player.x, view.width, ART.map.width);
  const camY = cameraOffset(player.y, view.height, ART.map.height);

  ctx.fillStyle = "#24452a";
  ctx.fillRect(0, 0, view.width, view.height);
  ctx.save();
  ctx.translate(-camX, -camY);
  ctx.drawImage(ART.map, 0, 0);

  if (stageReached("moped")) drawStanding(ctx, ART.shedOpen, 224, 126);

  const drawables = [];
  const add = (y, draw) => drawables.push({ y, draw });

  npcs.forEach((npc) => add(npc.y, () => drawNpc(ctx, npc)));
  add(player.y, () => drawPlayer(ctx, time));
  if (quest.backpackDropped) add(places.backpack.y, () => drawStanding(ctx, ART.backpack, places.backpack.x, places.backpack.y));
  if (quest.mopedFound && !quest.riding) add(quest.moped.y, () => drawStanding(ctx, ART.moped, quest.moped.x, quest.moped.y));
  if (quest.unload === "working") add(places.truck.y, () => drawStanding(ctx, ART.truck, places.truck.x, places.truck.y));
  add(cat.y, () => drawFrame(ctx, ART.cat, Math.floor(time / 1200) % 2, 18, cat.x - 9, cat.y - 11));

  chickens.forEach((c) => {
    add(c.y, () => {
      let frame = c.peck && Math.floor(time / 300) % 3 === 0 ? 2 : Math.floor(time / 150) % 2;
      if (c.wait > 0 && !c.peck) frame = 0;
      ctx.save();
      ctx.translate(Math.round(c.x), Math.round(c.y - 11));
      if (c.flip) ctx.scale(-1, 1);
      drawFrame(ctx, ART.chicken, frame, 12, -6, 0);
      ctx.restore();
    });
  });

  if (canCollectBeetles()) {
    [[250, 72], [282, 88], [266, 110], [298, 118]].forEach(([x, y], i) => {
      add(y, () => ctx.drawImage(ART.beetleSmall, x, y + (Math.floor(time / 500 + i) % 2)));
    });
  }

  drawables.sort((a, b) => a.y - b.y).forEach((d) => d.draw());

  butterflies.forEach((b) => {
    const t = time / 1000 + b.phase;
    const x = b.x + Math.sin(t * 0.7) * 24 + Math.sin(t * 2.3) * 4;
    const y = b.y + Math.sin(t * 1.1) * 12 - Math.abs(Math.sin(t * 3)) * 4;
    drawFrame(ctx, ART.butterfly, Math.floor(time / 120) % 2, 7, x, y);
  });

  ctx.fillStyle = "rgba(20, 30, 40, 0.08)";
  cloudShadows.forEach((cloud) => {
    ctx.beginPath();
    ctx.ellipse(cloud.x, cloud.y, cloud.rx, cloud.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  if (DEBUG) drawSolidGrid(ctx);
  if (target) drawHint(ctx, target, time);
  ctx.restore();

  drawSunlight(ctx, view, time);
}

function drawSolidGrid(ctx) {
  ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      if (SOLID_GRID[row][col]) ctx.fillRect(col * TILE, row * TILE, TILE, TILE);
    }
  }
}

function drawHint(ctx, target, time) {
  const x = Math.round(target.x) - 3;
  const y = Math.round(target.y) - 50 + (Math.floor(time / 300) % 2);
  ctx.fillStyle = "#2a1d17";
  ctx.fillRect(x - 1, y - 1, 8, 11);
  ctx.fillStyle = "#fbf6ea";
  ctx.fillRect(x, y, 6, 9);
  ctx.fillStyle = "#c4473a";
  ctx.fillRect(x + 2, y + 1, 2, 5);
  ctx.fillRect(x + 2, y + 7, 2, 1);
}

function drawSunlight(ctx, view, time) {
  ctx.fillStyle = "rgba(255, 196, 120, 0.06)";
  ctx.fillRect(0, 0, view.width, view.height);
  const radius = Math.max(view.width, view.height) * 0.75;
  const cx = view.width / 2;
  const cy = view.height / 2;
  const vignette = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius);
  vignette.addColorStop(0, "rgba(40, 20, 10, 0)");
  vignette.addColorStop(1, "rgba(40, 20, 10, 0.3)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, view.width, view.height);

  // After a few beers the world sways a little.
  if (quest.beersDrunk > 0 && !quest.discoDone) {
    ctx.fillStyle = `rgba(255, 220, 150, ${0.03 * quest.beersDrunk * (1 + Math.sin(time / 600))})`;
    ctx.fillRect(0, 0, view.width, view.height);
  }
}
