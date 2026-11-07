// Close-up scenes: dialogs, the well, the garden and the title screen.
const STAGE_W = 192;
const STAGE_H = 144;

const TALK_SCENES = {
  grandma: { background: "sceneYard", sky: "skyDay", portrait: "portraitGrandma", x: 120, y: 64 },
  valya: { background: "sceneShop", portrait: "portraitValya", front: "shopCounter", x: 104, y: 36 },
  grandpa: { background: "sceneStreet", sky: "skyWarm", portrait: "portraitGrandpa", x: 118, y: 64 },
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
  npcId: null,
  crank: 0,
  crankTarget: 0,
  done: false,
  beetles: [],
  caught: 0,
  hand: null,
  busX: 104,
  busLeaving: false,
};

function startTalkScene(npcId) {
  closeup.type = "talk";
  closeup.npcId = npcId;
}

function startWellScene() {
  closeup.type = "well";
  closeup.done = !needsWater();
  closeup.crank = closeup.done ? 8 : 0;
  closeup.crankTarget = closeup.crank;
  if (closeup.done) {
    openDialog(["Вода в криниці холодна-холодна."], finishCloseup);
  }
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

function startTitleScene() {
  closeup.type = "title";
  closeup.busX = 104;
  closeup.busLeaving = false;
}

// ---------- update ----------

function updateCloseup(dt, action, tap) {
  if (closeup.type === "well") updateWell(dt, action, tap);
  if (closeup.type === "garden") updateGarden(dt, action, tap);
  if (closeup.type === "title" && closeup.busLeaving) {
    closeup.busX += 70 * dt;
    if (closeup.busX > STAGE_W + 10) finishIntro();
  }
}

function updateWell(dt, action, tap) {
  if (closeup.done) return;
  if (action || tap) closeup.crankTarget = Math.min(8, closeup.crankTarget + 1);
  closeup.crank = Math.min(closeup.crankTarget, closeup.crank + 6 * dt);
  showHint("Крути корбу: тисни A або торкайся екрана.");
  if (closeup.crank >= 8) {
    closeup.done = true;
    quest.hasWater = true;
    openDialog(["Повне відро холодної води! Аж зуби ломить."], finishCloseup);
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
  showHint(`Збирай колорадів у банку: ${closeup.caught}/${BEETLE_COUNT}`);

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
      quest.beetlesCaught = BEETLE_COUNT;
      closeup.done = true;
      openDialog(["Банка повна колорадів! Треба показати бабусі."], finishCloseup);
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

function portraitFrame(time) {
  if (time % 3400 < 140) return 1;
  if (isTyping() && Math.floor(time / 110) % 2 === 0) return 2;
  return 0;
}

function drawTalkScene(ctx, time) {
  const scene = TALK_SCENES[closeup.npcId];
  if (scene.sky) drawSky(ctx, scene.sky, time);
  ctx.drawImage(ART[scene.background], 0, 0);
  const breathe = Math.round(Math.sin(time / 700));
  drawFrame(ctx, ART[scene.portrait], portraitFrame(time), 64, scene.x, scene.y + breathe);
  if (scene.front) ctx.drawImage(ART[scene.front], 0, 0);
  if (closeup.npcId === "valya" && quest.hasGroceries) ctx.drawImage(ART.groceries, 60, 92);
  if (closeup.npcId === "grandma" && quest.stage === "done") {
    ctx.fillStyle = "rgba(255, 110, 40, 0.22)";
    ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  }
}

function drawWellScene(ctx, time) {
  drawSky(ctx, "skyDay", time);
  ctx.drawImage(ART.sceneWell, 0, 0);
  const progress = closeup.crank / 8;
  const bucketY = Math.round(116 - progress * 60);
  ctx.fillStyle = "#a9823a";
  ctx.fillRect(96, 52, 1, bucketY - 50);
  drawFrame(ctx, ART.bucket, closeup.done ? 1 : 0, 24, 84, bucketY);
  ctx.drawImage(ART.wellFront, 0, 0);
  drawFrame(ctx, ART.crank, Math.floor(closeup.crank * 2) % 4, 40, 138, 25);
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

function drawTitleScene(ctx, time) {
  drawSky(ctx, "skyWarm", time);
  ctx.drawImage(ART.sceneTitle, 0, 0);
  const bounce = closeup.busLeaving ? Math.floor(time / 90) % 2 : 0;
  ctx.drawImage(ART.marshrutka, Math.round(closeup.busX), 74 - bounce);
}

function drawStage(ctx, stage, time) {
  ctx.fillStyle = "#2a1d17";
  ctx.fillRect(stage.x - 3, stage.y - 3, STAGE_W + 6, STAGE_H + 6);
  ctx.fillStyle = "#fbf6ea";
  ctx.fillRect(stage.x - 2, stage.y - 2, STAGE_W + 4, STAGE_H + 4);

  ctx.save();
  ctx.translate(stage.x, stage.y);
  ctx.beginPath();
  ctx.rect(0, 0, STAGE_W, STAGE_H);
  ctx.clip();
  if (closeup.type === "talk") drawTalkScene(ctx, time);
  if (closeup.type === "well") drawWellScene(ctx, time);
  if (closeup.type === "garden") drawGardenScene(ctx, time);
  if (closeup.type === "title") drawTitleScene(ctx, time);
  ctx.fillStyle = "rgba(255, 196, 120, 0.06)";
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  ctx.restore();
}
