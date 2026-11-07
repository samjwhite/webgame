const PLAYER_SPEED = 55;
const TALK_DISTANCE = 22;
const START_POSITION = { x: 28 * TILE + 8, y: 12 * TILE + 10 };
const DIRECTIONS = ["down", "left", "right", "up"];
const YARD = { left: 146, right: 222, top: 90, bottom: 156 };

const player = { x: START_POSITION.x, y: START_POSITION.y, dir: "down", moving: false, walkTime: 0 };

const npcs = [
  { id: "grandma", x: 5 * TILE + 8, y: 6 * TILE - 2, dir: "down", talk: talkToGrandma },
  { id: "valya", x: 21 * TILE + 8, y: 17 * TILE + 12, dir: "down", talk: talkToValya },
  { id: "grandpa", x: 27 * TILE + 8, y: 16 * TILE + 12, dir: "down", talk: talkToGrandpa },
];

const well = { id: "well", x: 11 * TILE + 8, y: 5 * TILE + 4 };

let ground = null;
let objects = [];
let chickens = [];
let butterflies = [];
let cloudShadows = [];
const cat = { x: 2 * TILE + 8, y: 9 * TILE + 12 };

function initWorld() {
  ground = renderGround();
  objects = buildObjects();
  chickens = [0, 1, 2].map((i) => {
    const x = 160 + i * 20;
    const y = 100 + i * 18;
    return { x, y, targetX: x, targetY: y, wait: i, flip: false, peck: false };
  });
  butterflies = [
    { x: 23 * TILE, y: 3 * TILE, phase: 0 },
    { x: 17 * TILE, y: 8 * TILE, phase: 2 },
    { x: 12 * TILE, y: 22 * TILE, phase: 4 },
    { x: 6 * TILE, y: 17 * TILE, phase: 1 },
  ];
  cloudShadows = [
    { x: 40, y: 60, rx: 70, ry: 34, speed: 6 },
    { x: 300, y: 260, rx: 90, ry: 40, speed: 5 },
    { x: 520, y: 400, rx: 60, ry: 28, speed: 7 },
  ];
}

function resetPlayer(saved) {
  player.x = saved ? saved.x : START_POSITION.x;
  player.y = saved ? saved.y : START_POSITION.y;
  player.dir = saved ? saved.dir : "down";
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
  if (npcs.some((npc) => Math.hypot(npc.x - x, npc.y - y) < 10)) return true;
  return objects.some((o) => o.solid && x + 5 > o.solid.x && x - 5 < o.solid.x + o.solid.w && y > o.solid.y && y - 4 < o.solid.y + o.solid.h);
}

function updatePlayer(dt) {
  const dx = input.moveX * PLAYER_SPEED * dt;
  const dy = input.moveY * PLAYER_SPEED * dt;
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

function faceTowards(who, x, y) {
  const dx = x - who.x;
  const dy = y - who.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    who.dir = dx < 0 ? "left" : "right";
  } else {
    who.dir = dy < 0 ? "up" : "down";
  }
}

function updateNpcs() {
  npcs.forEach((npc) => {
    if (Math.hypot(npc.x - player.x, npc.y - player.y) < 48) {
      faceTowards(npc, player.x, player.y);
    } else {
      npc.dir = "down";
    }
  });
}

function updateChickens(dt) {
  chickens.forEach((c) => {
    if (c.wait > 0) {
      c.wait -= dt;
      return;
    }
    const dx = c.targetX - c.x;
    const dy = c.targetY - c.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 1) {
      c.targetX = YARD.left + Math.random() * (YARD.right - YARD.left);
      c.targetY = YARD.top + Math.random() * (YARD.bottom - YARD.top);
      c.wait = 0.5 + Math.random() * 2.5;
      c.peck = Math.random() < 0.6;
      return;
    }
    const step = Math.min(distance, 14 * dt);
    const nextX = c.x + (dx / distance) * step;
    const nextY = c.y + (dy / distance) * step;
    if (isSolidTile(nextX, nextY) || isSolidTile(nextX, nextY - 3)) {
      c.targetX = c.x;
      c.targetY = c.y;
      return;
    }
    c.x = nextX;
    c.y = nextY;
    c.flip = dx > 0;
    c.peck = false;
  });
}

function updateWorld(dt) {
  updatePlayer(dt);
  updateNpcs();
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
      if (tileAt(col + dx, row + dy) === "P") return true;
    }
  }
  return false;
}

// The thing the player can talk to or use right now, or null.
function nearestTarget() {
  if (needsBeetles() && isNearGarden()) {
    return { id: "garden", x: player.x, y: player.y - 4 };
  }
  let best = null;
  let bestDistance = TALK_DISTANCE;
  for (const target of [...npcs, well]) {
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

function drawCharacter(ctx, img, who, frame) {
  const row = DIRECTIONS.indexOf(who.dir);
  ctx.drawImage(img, frame * 16, row * 24, 16, 24, Math.round(who.x - 8), Math.round(who.y - 22), 16, 24);
}

function playerFrame() {
  if (!player.moving) return 0;
  return [1, 0, 2, 0][Math.floor(player.walkTime * 8) % 4];
}

function drawWater(ctx, time, camX, camY, view) {
  const frame = Math.floor(time / 400) % 3;
  findTiles("~").forEach(({ col, row }) => {
    const x = col * TILE;
    const y = row * TILE;
    if (x + TILE < camX || x > camX + view.width || y + TILE < camY || y > camY + view.height) return;
    drawFrame(ctx, ART.water, (frame + col) % 3, TILE, x, y);
    drawPondEdges(ctx, col, row);
  });
}

function visibleObjects(camX, camY, view) {
  return objects.filter((o) => {
    return o.x + o.frameWidth > camX && o.x < camX + view.width && o.y + o.img.height > camY && o.y < camY + view.height;
  });
}

function drawWorld(ctx, view, time, target) {
  const camX = cameraOffset(player.x, view.width, ground.width);
  const camY = cameraOffset(player.y, view.height, ground.height);

  ctx.fillStyle = "#24452a";
  ctx.fillRect(0, 0, view.width, view.height);
  ctx.save();
  ctx.translate(-camX, -camY);
  ctx.drawImage(ground, 0, 0);
  drawWater(ctx, time, camX, camY, view);

  const drawables = visibleObjects(camX, camY, view).map((o) => ({
    baseY: o.baseY,
    draw: () => {
      const frame = o.animate ? (Math.floor(time / o.animate) + o.x) % 2 : o.frame;
      drawFrame(ctx, o.img, frame, o.frameWidth, o.x, o.y);
    },
  }));

  npcs.forEach((npc) => {
    drawables.push({ baseY: npc.y, draw: () => drawCharacter(ctx, ART[npc.id], npc, 0) });
  });
  drawables.push({ baseY: player.y, draw: () => drawCharacter(ctx, ART.player, player, playerFrame()) });

  chickens.forEach((c) => {
    drawables.push({
      baseY: c.y,
      draw: () => {
        let frame = c.peck && Math.floor(time / 300) % 3 === 0 ? 2 : Math.floor(time / 150) % 2;
        if (c.wait > 0 && !c.peck) frame = 0;
        ctx.save();
        ctx.translate(Math.round(c.x), Math.round(c.y - 11));
        if (c.flip) ctx.scale(-1, 1);
        drawFrame(ctx, ART.chicken, frame, 12, -6, 0);
        ctx.restore();
      },
    });
  });

  drawables.push({ baseY: cat.y, draw: () => drawFrame(ctx, ART.cat, Math.floor(time / 1200) % 2, 18, cat.x - 9, cat.y - 11) });

  if (needsBeetles()) {
    findTiles("P").forEach(({ col, row }, i) => {
      if (i % 3 !== 0) return;
      drawables.push({
        baseY: row * TILE + 13,
        draw: () => ctx.drawImage(ART.beetleSmall, col * TILE + 6, row * TILE + 4 + (Math.floor(time / 500 + i) % 2)),
      });
    });
  }

  drawables.sort((a, b) => a.baseY - b.baseY).forEach((d) => d.draw());

  butterflies.forEach((b) => {
    const t = time / 1000 + b.phase;
    const x = b.x + Math.sin(t * 0.7) * 24 + Math.sin(t * 2.3) * 4;
    const y = b.y + Math.sin(t * 1.1) * 12 - Math.abs(Math.sin(t * 3)) * 4;
    drawFrame(ctx, ART.butterfly, Math.floor(time / 120) % 2, 7, x, y);
  });

  ctx.fillStyle = "rgba(20, 30, 40, 0.10)";
  cloudShadows.forEach((cloud) => {
    ctx.beginPath();
    ctx.ellipse(cloud.x, cloud.y, cloud.rx, cloud.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  if (target) drawHint(ctx, target, time);
  ctx.restore();

  drawSunlight(ctx, view);
}

function drawHint(ctx, target, time) {
  const x = Math.round(target.x) - 3;
  const y = Math.round(target.y) - 32 + (Math.floor(time / 300) % 2);
  ctx.fillStyle = "#2a1d17";
  ctx.fillRect(x - 1, y - 1, 8, 11);
  ctx.fillStyle = "#fbf6ea";
  ctx.fillRect(x, y, 6, 9);
  ctx.fillStyle = "#c4473a";
  ctx.fillRect(x + 2, y + 1, 2, 5);
  ctx.fillRect(x + 2, y + 7, 2, 1);
}

function drawSunlight(ctx, view) {
  ctx.fillStyle = "rgba(255, 196, 120, 0.08)";
  ctx.fillRect(0, 0, view.width, view.height);
  const radius = Math.max(view.width, view.height) * 0.75;
  const vignette = ctx.createRadialGradient(view.width / 2, view.height / 2, radius * 0.4, view.width / 2, view.height / 2, radius);
  vignette.addColorStop(0, "rgba(40, 20, 10, 0)");
  vignette.addColorStop(1, "rgba(40, 20, 10, 0.35)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, view.width, view.height);
}
