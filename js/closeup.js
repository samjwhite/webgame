// Close-up scenes: pictures (dialogs, title, story moments) and the well and garden mini-games.
// Mini-game scenes are 192x144; picture scenes take the size of their picture.
const STAGE_W = 192;
const STAGE_H = 144;

const TALK_PICTURES = {
  grandma: "talkGrandma",
  valya: "talkSeller",
  grandpa: "talkGrandpa",
  lads: "talkLads",
};

// Same bush list as GARDEN_BUSHES in tools/art/scenes.py: [x, y, size].
const GARDEN_BUSHES = [
  [30, 52, 16], [80, 50, 16], [130, 52, 16], [176, 50, 16],
  [8, 84, 24], [60, 86, 24], [114, 84, 24], [166, 86, 24],
  [34, 122, 30], [100, 124, 30], [160, 122, 30],
];
const HAND_REST = { x: 172, y: 150 };
const JAR_POSITION = { x: 4, y: 104 };
const JAR_MOUTH = { x: 17, y: 108 };

const closeup = {
  type: null,
  picture: null,
  effect: null,
  crank: 0,
  crankTarget: 0,
  done: false,
  beetles: [],
  caught: 0,
  hand: null,
};

// effect: null, "disco" (moving lights) or "hit" (red flashes).
function startPictureScene(picture, effect) {
  closeup.type = "picture";
  closeup.picture = picture;
  closeup.effect = effect || null;
}

function startTalkScene(npcId) {
  startPictureScene(TALK_PICTURES[npcId]);
}

// The well: each tap turns the crank a quarter, WELL_TURN_FRAMES crank frames move the bucket all the way.
const WELL_TURN_FRAMES = 16;
const WELL_CRANK_SPEED = 10; // crank frames per second
const WELL_CRANK = { frameWidth: 39, x: 129, y: 35 };
const WELL_BUCKET = { frameWidth: 17, x: 87, topY: 61, deepY: 98 };
const WELL_ROPE = { x: 95, y: 54 };
const BUCKET_FRAMES = { empty: 0, water: 1, splash: 3 };

// direction "raise" pulls a full bucket up; "lower" lets an empty bucket down (for grandpa's future quest).
// onDone runs once the bucket gets all the way.
function startWellScene(direction, onDone) {
  closeup.type = "well";
  closeup.wellDirection = direction;
  closeup.onWellDone = onDone;
  closeup.crank = 0;
  closeup.crankTarget = 0;
  closeup.done = false;
  closeup.sinceDone = 0;
}

// The well with the bucket already up, just to look at.
function showWellAtRest(lines) {
  startWellScene("raise", null);
  closeup.crank = WELL_TURN_FRAMES;
  closeup.done = true;
  closeup.sinceDone = 1;
  openDialog(lines, finishCloseup);
}

function startGardenScene() {
  closeup.type = "garden";
  closeup.caught = 0;
  closeup.done = false;
  closeup.hand = { state: "idle", t: 0, from: HAND_REST, to: HAND_REST, beetle: null };
  const spots = [];
  GARDEN_BUSHES.forEach(([x, y, size]) => {
    spots.push({ x: x - size * 0.3, y: y - size * 0.1 });
    spots.push({ x: x + size * 0.35, y: y + size * 0.15 });
  });
  const usable = spots.filter((s) => s.x > 30 && s.x < 186 && s.y > 30 && s.y < 136);
  closeup.beetles = usable.sort(() => Math.random() - 0.5).slice(0, BEETLE_COUNT);
}

function stageSize() {
  if (closeup.type === "well") return { w: ART.sceneWell.width, h: ART.sceneWell.height };
  if (closeup.type === "picture") {
    const picture = ART[closeup.picture];
    return { w: picture.width, h: picture.height };
  }
  return { w: STAGE_W, h: STAGE_H };
}

// ---------- update ----------

function updateCloseup(dt, action, tap) {
  if (closeup.type === "well") updateWell(dt, action, tap);
  if (closeup.type === "garden") updateGarden(dt, action, tap);
}

function updateWell(dt, action, tap) {
  if (closeup.done) {
    closeup.sinceDone += dt;
    return;
  }
  if (action || tap) closeup.crankTarget = Math.min(WELL_TURN_FRAMES, closeup.crankTarget + 2);
  closeup.crank = Math.min(closeup.crankTarget, closeup.crank + WELL_CRANK_SPEED * dt);
  showHint(closeup.wellDirection === "raise"
    ? T().ui.wellRaise
    : T().ui.wellLower);
  if (closeup.crank >= WELL_TURN_FRAMES) {
    closeup.done = true;
    if (closeup.onWellDone) closeup.onWellDone();
  }
}

function lerp(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function pickBeetle(tap) {
  const free = closeup.beetles.filter((b) => !b.held);
  if (!tap) return free[0];
  return free.find((b) => Math.hypot(b.x - tap.x, b.y - tap.y) < 14);
}

function moveHand(state, to) {
  const hand = closeup.hand;
  hand.from = handPosition();
  hand.to = to;
  hand.state = state;
  hand.t = 0;
}

function handPosition() {
  const hand = closeup.hand;
  return lerp(hand.from, hand.to, Math.min(1, hand.t));
}

function updateGarden(dt, action, tap) {
  const hand = closeup.hand;
  if (closeup.done) return;
  showHint(T().ui.garden(closeup.caught, BEETLE_COUNT));

  if (hand.state === "idle" || hand.state === "back") {
    const beetle = (tap || action) && pickBeetle(tap);
    if (beetle) {
      hand.beetle = beetle;
      moveHand("reach", beetle);
      return;
    }
  }
  if (hand.state === "idle") return;

  const durations = { reach: 0.22, grab: 0.12, carry: 0.25, back: 0.2 };
  hand.t += dt / durations[hand.state];
  if (hand.t < 1) return;

  if (hand.state === "reach") {
    hand.beetle.held = true;
    hand.from = hand.to;
    hand.state = "grab";
    hand.t = 0;
  } else if (hand.state === "grab") {
    moveHand("carry", JAR_MOUTH);
  } else if (hand.state === "carry") {
    closeup.beetles = closeup.beetles.filter((b) => b !== hand.beetle);
    hand.beetle = null;
    closeup.caught += 1;
    moveHand("back", HAND_REST);
  } else {
    hand.state = "idle";
    if (closeup.caught >= BEETLE_COUNT) {
      closeup.done = true;
      openDialog([finishBeetleJar()], finishCloseup);
    }
  }
}

// ---------- drawing ----------

function drawSky(ctx, skyName, time) {
  ctx.drawImage(ART[skyName], 0, 0);
  const offset = (time * 0.004) % ART.clouds.width;
  ctx.drawImage(ART.clouds, Math.round(-offset), 2);
  ctx.drawImage(ART.clouds, Math.round(ART.clouds.width - offset), 2);
}

function drawPictureScene(ctx, time) {
  const picture = ART[closeup.picture];
  ctx.drawImage(picture, 0, 0);
  if (closeup.picture === "talkSeller" && quest.hasGroceries) ctx.drawImage(ART.groceries, 98, 132);

  if (closeup.effect === "disco") {
    const colors = ["255, 60, 200", "60, 200, 255", "255, 220, 60"];
    ctx.globalCompositeOperation = "lighter";
    colors.forEach((color, i) => {
      const x = picture.width / 2 + Math.sin(time / 500 + i * 2.1) * picture.width * 0.4;
      const y = picture.height * 0.6 + Math.cos(time / 700 + i) * picture.height * 0.25;
      const light = ctx.createRadialGradient(x, y, 0, x, y, 30);
      light.addColorStop(0, `rgba(${color}, 0.35)`);
      light.addColorStop(1, `rgba(${color}, 0)`);
      ctx.fillStyle = light;
      ctx.fillRect(0, 0, picture.width, picture.height);
    });
    ctx.globalCompositeOperation = "source-over";
  }

  if (closeup.effect === "hit" && Math.floor(time / 120) % 3 === 0) {
    ctx.fillStyle = "rgba(200, 20, 20, 0.45)";
    ctx.fillRect(0, 0, picture.width, picture.height);
  }
}

function drawWellScene(ctx) {
  const raising = closeup.wellDirection === "raise";
  const progress = closeup.crank / WELL_TURN_FRAMES;
  const { topY, deepY } = WELL_BUCKET;
  const bucketY = raising ? deepY + (topY - deepY) * progress : topY + (deepY - topY) * progress;

  let bucketFrame = raising ? BUCKET_FRAMES.water : BUCKET_FRAMES.empty;
  if (raising && closeup.done && closeup.sinceDone < 0.6) bucketFrame = BUCKET_FRAMES.splash;

  // Raising turns the crank forward, lowering plays the same frames backwards.
  const step = Math.floor(closeup.crank) % 8;
  const crankFrame = raising ? step : (8 - step) % 8;

  ctx.drawImage(ART.sceneWell, 0, 0);
  ctx.fillStyle = "#a9823a";
  ctx.fillRect(WELL_ROPE.x, WELL_ROPE.y, 1, bucketY + 1 - WELL_ROPE.y);
  drawFrame(ctx, ART.bucket, bucketFrame, WELL_BUCKET.frameWidth, WELL_BUCKET.x, bucketY);
  ctx.drawImage(ART.wellFront, 0, 0);
  drawFrame(ctx, ART.crank, crankFrame, WELL_CRANK.frameWidth, WELL_CRANK.x, WELL_CRANK.y);
}

function drawGardenScene(ctx, time) {
  drawSky(ctx, "skyDay", time);
  ctx.drawImage(ART.sceneGarden, 0, 0);
  closeup.beetles.forEach((b, i) => {
    if (b.held) return;
    const wiggle = Math.round(Math.sin(time / 150 + i * 2));
    ctx.drawImage(ART.beetleBig, Math.round(b.x - 6 + wiggle), Math.round(b.y - 6));
  });

  ctx.drawImage(ART.jar, JAR_POSITION.x, JAR_POSITION.y);
  for (let i = 0; i < closeup.caught; i++) {
    ctx.drawImage(ART.beetleSmall, JAR_POSITION.x + 6 + (i % 2) * 8, JAR_POSITION.y + 24 - Math.floor(i / 2) * 5);
  }

  const hand = closeup.hand;
  const pos = handPosition();
  const closed = hand.state === "grab" || hand.state === "carry";
  ctx.fillStyle = "#3d6fb6";
  ctx.fillRect(Math.round(pos.x - 5), Math.round(pos.y + 26), 11, STAGE_H);
  drawFrame(ctx, ART.hand, closed ? 1 : 0, 22, pos.x - 11, pos.y - 3);
  if (closed && hand.beetle) {
    ctx.drawImage(ART.beetleSmall, Math.round(pos.x - 3), Math.round(pos.y - 2));
  }
}

function drawStage(ctx, stage, time) {
  const { w, h } = stageSize();
  ctx.fillStyle = "#2a1d17";
  ctx.fillRect(stage.x - 3, stage.y - 3, w + 6, h + 6);
  ctx.fillStyle = "#fbf6ea";
  ctx.fillRect(stage.x - 2, stage.y - 2, w + 4, h + 4);

  const shake = closeup.effect === "hit" ? Math.round(Math.sin(time / 25) * 2) : 0;
  ctx.save();
  ctx.translate(stage.x + shake, stage.y);
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();
  if (closeup.type === "picture") drawPictureScene(ctx, time);
  if (closeup.type === "well") drawWellScene(ctx);
  if (closeup.type === "garden") drawGardenScene(ctx, time);
  ctx.restore();
}
