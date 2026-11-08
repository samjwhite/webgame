// Close-up scenes: pictures (dialogs, title, story moments) and the well, garden and fence mini-games.
// Mini-game scenes are 192x144; picture scenes take the size of their picture.
const STAGE_W = 192;
const STAGE_H = 144;

const TALK_PICTURES = {
  grandma: "talkGrandma",
  valya: "talkSeller",
  grandpa: "talkGrandpa",
  lads: "talkLads",
};

// The potato bushes of the garden picture (tools/art/reference.py, GARDEN_PICTURE): [x, y, size].
const GARDEN_BUSHES = [
  [35, 45, 20], [81, 45, 20], [128, 45, 20], [174, 45, 20],
  [15, 74, 34], [67, 74, 34], [119, 74, 34], [172, 74, 34],
  [51, 114, 44], [103, 114, 44], [162, 114, 44],
];
// The jar moves by itself to a beetle and scoops it up (the owner found a drawn hand creepy).
// Positions are the jar's mouth; the jar picture hangs below it.
const JAR_REST = { x: 17, y: 112 };
const JAR_MOUTH_OFFSET = { x: 13, y: 4 }; // from the jar picture's corner to its mouth
// A soft light under each beetle, so it stands out on the soil and the leaves.
const BEETLE_GLOW = { radius: 12, low: 0.5, high: 0.85, period: 900 };

const closeup = {
  type: null,
  picture: null,
  effect: null,
  crank: 0,
  crankTarget: 0,
  done: false,
  beetles: [],
  caught: 0,
  jar: null,
};

// effect: null, "disco" (moving lights), "hit" (red flashes),
// "tv" (the news on the screen), "sleep" or "dawn" (the bedroom at night or at sunrise).
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
// The concrete-ring well (tools/art/reference.py, WELL_*): the crank on the axle of the right post, the
// bucket on its chain under the drum, sinking behind the front of the ring.
const WELL_CRANK = { frameWidth: 38, x: 118, y: 29 };
const WELL_BUCKET = { frameWidth: 22, x: 88, topY: 56, deepY: 84 };
const WELL_ROPE = { x: 98, y: 54 };
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

// The beds after spraying: no beetles, no jar, no hand. The sprayer itself still needs the
// designer's art (docs/ART_HANDOFF_SUMMER.md), so the dialog tells the spraying.
function startSprayScene() {
  closeup.type = "garden";
  closeup.sprayed = true;
  closeup.caught = 0;
  closeup.done = true;
  closeup.beetles = [];
  closeup.jar = { state: "idle", t: 0, from: JAR_REST, to: JAR_REST, beetle: null };
}

function startGardenScene() {
  closeup.type = "garden";
  closeup.sprayed = false;
  closeup.caught = 0;
  closeup.done = false;
  closeup.jar = { state: "idle", t: 0, from: JAR_REST, to: JAR_REST, beetle: null };
  const spots = [];
  GARDEN_BUSHES.forEach(([x, y, size]) => {
    spots.push({ x: x - size * 0.3, y: y - size * 0.1 });
    spots.push({ x: x + size * 0.35, y: y + size * 0.15 });
  });
  const usable = spots.filter((s) => s.x > 30 && s.x < 186 && s.y > 30 && s.y < 136);
  closeup.beetles = usable.sort(() => Math.random() - 0.5).slice(0, BEETLE_COUNT);
}

// The fence: five mismatched boards go across the hole, one after another, with a nail through each
// rail. The hammer moves by itself, like the jar: no hand. tools/art/reference.py, FENCE_*.
// x: the board's middle at the ground, dy: lower than the ground line, angle: how crooked, in degrees.
const FENCE_BOARDS = [
  { x: 56, dy: 0, angle: -1.5 },
  { x: 76, dy: 3, angle: 2 },
  { x: 95, dy: -2, angle: -2.5 },
  { x: 116, dy: 4, angle: 1 },
  { x: 136, dy: 0, angle: 3 },
];
const FENCE_BOARD_CELL = { w: 20, h: 94 };
const FENCE_GROUND = 112;
const FENCE_RAILS = [41, 89]; // the rails of the picture, where the nails go
const FENCE_NAIL_W = 8;
const FENCE_NAIL_HEAD = 3; // from the top of a nail's frame to the middle of its head
const NAIL_STAGES = { out: 0, half: 1, flush: 2, bent: 3 };
// One nail always bends on the first hit and stays that way: the patch is not perfect.
const FENCE_BENT_NAIL = { board: 2, rail: 1 };
const FENCE_NAILS_TOTAL = FENCE_BOARDS.length * FENCE_RAILS.length;
const FENCE_REST = { x: 176, y: 122 };
const FENCE_HAMMER_FACE = { x: -8, y: -29 }; // the head's striking face, from the end of the handle
const FENCE_HAMMER_REST_ANGLE = 38; // degrees, the head away from the nail
const FENCE_TIMES = { reach: 0.12, swing: 0.07, lift: 0.09 }; // seconds
const FENCE_BOARD_DROP = { height: 16, time: 0.2 };
const FENCE_THUMP_TIME = 0.08;

function nailsOfBoard(boardIndex) {
  const board = FENCE_BOARDS[boardIndex];
  const ground = FENCE_GROUND + board.dy;
  const lean = Math.sin((board.angle * Math.PI) / 180);
  return FENCE_RAILS.map((y, rail) => ({
    x: board.x + lean * (ground - y),
    y,
    stage: NAIL_STAGES.out,
    bends: FENCE_BENT_NAIL.board === boardIndex && FENCE_BENT_NAIL.rail === rail,
  }));
}

function startFenceScene() {
  closeup.type = "fence";
  closeup.done = false;
  closeup.fence = {
    board: 0,
    nails: nailsOfBoard(0),
    drop: 0,
    thump: 0,
    hammer: { state: "idle", t: 0, from: FENCE_REST, to: FENCE_REST, nail: null },
  };
}

function isNailDriven(nail) {
  return nail.stage === NAIL_STAGES.flush || nail.stage === NAIL_STAGES.bent;
}

// The end of the hammer's handle, where its head strikes this nail.
function hammerSpot(nail) {
  return { x: nail.x - FENCE_HAMMER_FACE.x, y: nail.y - FENCE_HAMMER_FACE.y };
}

function hammerPosition() {
  const { from, to, t, state } = closeup.fence.hammer;
  return state === "reach" ? lerp(from, to, Math.min(1, t)) : to;
}

function pickNail(tap) {
  const free = closeup.fence.nails.filter((nail) => !isNailDriven(nail));
  if (!tap) return free[0];
  return free.find((nail) => Math.hypot(nail.x - tap.x, nail.y - tap.y) < 14);
}

function hitNail(nail) {
  if (nail.bends) nail.stage = NAIL_STAGES.bent;
  else nail.stage = nail.stage === NAIL_STAGES.out ? NAIL_STAGES.half : NAIL_STAGES.flush;
  closeup.fence.thump = FENCE_THUMP_TIME;
}

function updateFence(dt, action, tap) {
  const fence = closeup.fence;
  if (closeup.done) return;
  fence.thump = Math.max(0, fence.thump - dt);
  showHint(T().ui.fence(fence.nails.filter(isNailDriven).length, FENCE_NAILS_TOTAL));
  // The new board comes down onto the rails first.
  if (fence.drop < 1) {
    fence.drop = Math.min(1, fence.drop + dt / FENCE_BOARD_DROP.time);
    return;
  }

  const hammer = fence.hammer;
  if (hammer.state === "idle") {
    const nail = (tap || action) && pickNail(tap);
    if (nail) {
      Object.assign(hammer, { state: "reach", t: 0, from: hammerPosition(), to: hammerSpot(nail), nail });
    }
    return;
  }

  hammer.t += dt / FENCE_TIMES[hammer.state];
  if (hammer.t < 1) return;
  hammer.t = 0;
  if (hammer.state === "reach") {
    hammer.state = "swing";
  } else if (hammer.state === "swing") {
    hitNail(hammer.nail);
    hammer.state = "lift";
  } else {
    hammer.state = "idle";
    if (fence.nails.every(isNailDriven)) nextFenceBoard();
  }
}

function nextFenceBoard() {
  const fence = closeup.fence;
  if (fence.board + 1 < FENCE_BOARDS.length) {
    fence.board += 1;
    fence.nails.push(...nailsOfBoard(fence.board));
    fence.drop = 0;
    return;
  }
  closeup.done = true;
  openDialog(mendFence(), finishCloseup);
}

function stageSize() {
  if (closeup.type === "well") return { w: ART.sceneWell.w, h: ART.sceneWell.h };
  if (closeup.type === "fence") return { w: ART.sceneFence.w, h: ART.sceneFence.h };
  if (closeup.type === "picture") {
    const picture = ART[closeup.picture];
    return { w: picture.w, h: picture.h };
  }
  return { w: STAGE_W, h: STAGE_H };
}

// ---------- update ----------

function updateCloseup(dt, action, tap) {
  if (closeup.type === "well") updateWell(dt, action, tap);
  if (closeup.type === "garden") updateGarden(dt, action, tap);
  if (closeup.type === "fence") updateFence(dt, action, tap);
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
  if (!tap) {
    // With the A button the jar goes to the nearest beetle.
    const at = jarPosition();
    return free.sort((a, b) => Math.hypot(a.x - at.x, a.y - at.y) - Math.hypot(b.x - at.x, b.y - at.y))[0];
  }
  return free.find((b) => Math.hypot(b.x - tap.x, b.y - tap.y) < 14);
}

function moveJar(state, to) {
  const jar = closeup.jar;
  jar.from = jarPosition();
  jar.to = to;
  jar.state = state;
  jar.t = 0;
}

function jarPosition() {
  const jar = closeup.jar;
  return lerp(jar.from, jar.to, Math.min(1, jar.t));
}

function updateGarden(dt, action, tap) {
  const jar = closeup.jar;
  if (closeup.done) return;
  showHint(T().ui.garden(closeup.caught, BEETLE_COUNT));

  // The jar goes to the beetle tapped (or the nearest one), scoops it in, and stays there.
  if (jar.state === "idle") {
    const beetle = (tap || action) && pickBeetle(tap);
    if (beetle) {
      jar.beetle = beetle;
      moveJar("reach", { x: beetle.x, y: beetle.y + 2 });
    }
    return;
  }

  const durations = { reach: 0.25, scoop: 0.18 };
  jar.t += dt / durations[jar.state];
  if (jar.t < 1) return;

  if (jar.state === "reach") {
    jar.beetle.held = true;
    jar.from = jar.to;
    jar.state = "scoop";
    jar.t = 0;
    return;
  }
  closeup.beetles = closeup.beetles.filter((b) => b !== jar.beetle);
  jar.beetle = null;
  jar.state = "idle";
  closeup.caught += 1;
  if (grandmaStopsPicking(closeup.caught)) {
    closeup.done = true;
    grandmaStopsHandPicking();
    return;
  }
  if (closeup.caught >= BEETLE_COUNT) {
    closeup.done = true;
    openDialog(finishBeetleJar(), finishCloseup);
  }
}

// ---------- drawing ----------

function drawPictureScene(ctx, time) {
  const picture = ART[closeup.picture];
  if (closeup.effect === "tv") drawNewsScreen(ctx, time);
  drawArt(ctx, picture, 0, 0);
  if (closeup.picture === "talkSeller") drawCounterGoods(ctx);

  if (closeup.effect === "disco") {
    const colors = ["255, 60, 200", "60, 200, 255", "255, 220, 60"];
    ctx.globalCompositeOperation = "lighter";
    colors.forEach((color, i) => {
      const x = picture.w / 2 + Math.sin(time / 500 + i * 2.1) * picture.w * 0.4;
      const y = picture.h * 0.6 + Math.cos(time / 700 + i) * picture.h * 0.25;
      const light = ctx.createRadialGradient(x, y, 0, x, y, 30);
      light.addColorStop(0, `rgba(${color}, 0.35)`);
      light.addColorStop(1, `rgba(${color}, 0)`);
      ctx.fillStyle = light;
      ctx.fillRect(0, 0, picture.w, picture.h);
    });
    ctx.globalCompositeOperation = "source-over";
  }

  if (closeup.effect === "fridge") drawFridgeShelves(ctx);
  if (closeup.effect === "sleep") drawSleeping(ctx, picture, time);
  if (closeup.effect === "dawn") drawDawn(ctx, picture);

  if (closeup.effect === "hit" && Math.floor(time / 120) % 3 === 0) {
    ctx.fillStyle = "rgba(200, 20, 20, 0.45)";
    ctx.fillRect(0, 0, picture.w, picture.h);
  }
}

// The news shows through the see-through screen of tsn.png. news_frames.png is a strip of pictures:
// 0 newsreader, 1 poor harvest, 2 flour queue, 3 peacekeepers, 4 penalty, 5 song contest, 6 summit, 7 weather.
// One picture for each line of each bulletin in the text files.
const NEWS_SCREEN = { x: 39, y: 30, w: 96, h: 72 };
const NEWS_PLAN = [
  [0, 1, 2, 2, 3, 3],
  [0, 4, 5, 5, 6, 7],
];

function drawNewsScreen(ctx, time) {
  const { x, y, w, h } = NEWS_SCREEN;
  const plan = NEWS_PLAN[Math.max(0, quest.newsWatched - 1)] || NEWS_PLAN[0];
  const line = Math.max(0, Math.min(plan.length - 1, plan.length - 1 - dialog.lines.length));
  drawArtPart(ctx, ART.newsFrames, plan[line] * w, 0, w, h, x, y);
  ctx.fillStyle = "#c8323c";
  ctx.fillRect(x + 8, y + h - 16, 22, 9);
  ctx.fillStyle = "#fff8e8";
  ctx.font = "bold 8px monospace";
  ctx.textBaseline = "top";
  ctx.fillText("ТСН", x + 10, y + h - 16);
  ctx.fillText("1+1", x + w - 28, y + 6);
  // Old set: a dark band rolls down the screen and the picture has lines across it.
  ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
  ctx.fillRect(x, y + Math.floor(time / 40) % h, w, 6);
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  for (let row = 0; row < h; row += 2) ctx.fillRect(x, y + row, w, 1);
}

// What is in the fridge: fridge_items.png is a strip of 40x40 pictures, captions come from the text files.
const FRIDGE_ITEM = 40;
const FRIDGE_COLUMNS = [24, 76, 128];
const FRIDGE_ROWS = [21, 73];

function drawFridgeShelves(ctx) {
  ctx.font = "bold 8px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  T().house.fridgeItems.forEach((caption, i) => {
    const x = FRIDGE_COLUMNS[i % 3];
    const y = FRIDGE_ROWS[Math.floor(i / 3)];
    drawFrame(ctx, ART.fridgeItems, i, FRIDGE_ITEM, x, y);
    ctx.fillStyle = "#2a1d17";
    ctx.fillRect(x - 5, y + 42, FRIDGE_ITEM + 10, 10);
    ctx.fillStyle = "#fff8e8";
    ctx.fillText(caption, x + FRIDGE_ITEM / 2, y + 43);
  });
  ctx.textAlign = "left";
}

// Goods on the seller's counter: art and centre x. They stand on the counter's front edge,
// between her abacus and the scales.
const COUNTER_FRONT = 148;
const COUNTER_GOODS = {
  beer: [["goodsBeer", 124]],
  bread: [["goodsBread", 120]],
  loaf: [["goodsLoaf", 120]],
  noodles: [["goodsNoodles", 124]],
  seeds: [["goodsSeeds", 124]],
  matches: [["goodsMatches", 124]],
  cigarettes: [["goodsCigarettes", 124]],
  sugar: [["goodsSugar", 124]],
  fish: [["goodsFish", 124]],
  oil: [["goodsOil", 124]],
  chocolate: [["goodsChocolate", 122]],
  sausage: [["goodsSausage", 120]],
  groceries: [["goodsBread", 106], ["goodsNoodles", 134]],
  stock: [["goodsLoaf", 106], ["goodsSugar", 132], ["goodsMatches", 146]],
};

// The shop's list: a row for each thing on offer and a last one to leave.
const SHOP_COLUMNS = 2;
const shopMenu = { open: false, index: 0, rows: [], moved: false };
const shopMenuBox = document.getElementById("shop-menu");
const shopMenuMoney = document.getElementById("shop-money");
const shopMenuList = document.getElementById("shop-list");

function fillShopMenu() {
  shopMenu.rows = goodsOnOffer();
  shopMenu.index = Math.min(shopMenu.index, shopMenu.rows.length);
  shopMenuMoney.textContent = T().ui.money(quest.money);
  shopMenuList.textContent = "";
  shopMenu.rows.forEach((good, index) => {
    const row = document.createElement("button");
    row.className = "shop-row";
    const picture = document.createElement("img");
    picture.src = `art/${ART_FILES[good.art]}?v=${ART_VERSION}`;
    picture.alt = "";
    const name = document.createElement("span");
    name.textContent = T().shop.goods[good.id];
    const price = document.createElement("b");
    price.textContent = T().shop.price(good.price);
    row.append(picture, name, price);
    if (quest.money < good.price) row.classList.add("too-dear");
    row.addEventListener("click", () => shopChoose(index));
    shopMenuList.append(row);
  });
  const leave = document.createElement("button");
  leave.className = "shop-row shop-leave";
  leave.textContent = T().shop.leave;
  leave.addEventListener("click", () => shopChoose(shopMenu.rows.length));
  shopMenuList.append(leave);
  markShopRow();
}

function markShopRow() {
  Array.from(shopMenuList.children || []).forEach((row, index) => row.classList.toggle("selected", index === shopMenu.index));
}

function openShopMenu() {
  sellerCounter = null;
  shopMenu.open = true;
  shopMenu.index = 0;
  fillShopMenu();
}

function closeShopMenu() {
  shopMenu.open = false;
  sellerCounter = null;
  finishCloseup();
}

function shopChoose(index) {
  if (!shopMenu.open || dialog.open) return;
  const good = shopMenu.rows[index];
  if (!good) {
    closeShopMenu();
    return;
  }
  shopMenu.index = index;
  openDialog(buyGood(good.id), () => {
    saveGame();
    fillShopMenu();
  });
}

// Arrow keys or the joystick move the selection; A buys what is selected.
function updateShopMenu(action) {
  const count = shopMenu.rows.length + 1;
  const stepX = Math.abs(input.moveX) > 0.5 ? Math.sign(input.moveX) : 0;
  const stepY = Math.abs(input.moveY) > 0.5 ? Math.sign(input.moveY) : 0;
  if (!stepX && !stepY) {
    shopMenu.moved = false;
  } else if (!shopMenu.moved) {
    shopMenu.moved = true;
    const next = shopMenu.index + stepX + stepY * SHOP_COLUMNS;
    if (next >= 0 && next < count) {
      shopMenu.index = next;
      markShopRow();
    }
  }
  if (action) shopChoose(shopMenu.index);
}

function drawCounterGoods(ctx) {
  (COUNTER_GOODS[sellerCounter] || []).forEach(([art, x]) => {
    const image = ART[art];
    drawArt(ctx, image, Math.round(x - image.w / 2), COUNTER_FRONT - image.h);
  });
}

function drawSleeping(ctx, picture, time) {
  ctx.fillStyle = "#c8d6ff";
  ctx.font = "bold 10px monospace";
  ctx.textBaseline = "top";
  ["z", "Z", "z"].forEach((letter, i) => {
    const rise = (time / 60 + i * 14) % 42;
    ctx.fillText(letter, 48 + i * 9 + Math.sin(rise / 6) * 2, 60 - rise);
  });
}

function drawDawn(ctx, picture) {
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "rgba(255, 170, 90, 0.42)";
  ctx.fillRect(0, 0, picture.w, picture.h);
  ctx.globalCompositeOperation = "source-over";
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

  drawArt(ctx, ART.sceneWell, 0, 0);
  ctx.fillStyle = "#4a3a2c"; // the chain
  ctx.fillRect(WELL_ROPE.x, WELL_ROPE.y, 1, bucketY + 1 - WELL_ROPE.y);
  drawFrame(ctx, ART.bucket, bucketFrame, WELL_BUCKET.frameWidth, WELL_BUCKET.x, bucketY);
  drawArt(ctx, ART.wellFront, 0, 0);
  drawFrame(ctx, ART.crank, crankFrame, WELL_CRANK.frameWidth, WELL_CRANK.x, WELL_CRANK.y);
}

function drawGardenScene(ctx, time) {
  drawArt(ctx, ART.sceneGarden, 0, 0);
  // A soft, slow light under each beetle, so it can be seen on the soil and the leaves.
  const glow = BEETLE_GLOW.low + (BEETLE_GLOW.high - BEETLE_GLOW.low) * (0.5 + 0.5 * Math.sin(time / BEETLE_GLOW.period));
  closeup.beetles.forEach((b, i) => {
    if (b.held) return;
    const light = ctx.createRadialGradient(b.x, b.y, 1, b.x, b.y, BEETLE_GLOW.radius);
    light.addColorStop(0, `rgba(255, 244, 190, ${glow})`);
    light.addColorStop(0.55, `rgba(255, 236, 160, ${glow * 0.5})`);
    light.addColorStop(1, "rgba(255, 236, 160, 0)");
    ctx.fillStyle = light;
    ctx.fillRect(b.x - BEETLE_GLOW.radius, b.y - BEETLE_GLOW.radius, BEETLE_GLOW.radius * 2, BEETLE_GLOW.radius * 2);
    const wiggle = Math.round(Math.sin(time / 150 + i * 2));
    drawArt(ctx, ART.beetleBig, Math.round(b.x - 6 + wiggle), Math.round(b.y - 6));
  });
  if (closeup.sprayed) return;

  // The jar with what it has caught; while scooping it tips toward the beetle.
  const jar = closeup.jar;
  const pos = jarPosition();
  const left = Math.round(pos.x - JAR_MOUTH_OFFSET.x);
  const top = Math.round(pos.y - JAR_MOUTH_OFFSET.y);
  ctx.save();
  if (jar.state === "scoop") {
    ctx.translate(pos.x, pos.y + 16);
    ctx.rotate(-0.35 * Math.sin(Math.PI * Math.min(1, jar.t)));
    ctx.translate(-pos.x, -(pos.y + 16));
  }
  drawArt(ctx, ART.jar, left, top);
  for (let i = 0; i < closeup.caught; i++) {
    drawArt(ctx, ART.beetleSmall, left + 6 + (i % 2) * 8, top + 24 - Math.floor(i / 2) * 5);
  }
  ctx.restore();
}

function drawFenceScene(ctx, time) {
  const fence = closeup.fence;
  ctx.save();
  // The whole fence jumps a little under a hit; rotated art is resampled smoothly.
  if (fence.thump > 0) ctx.translate(0, 1);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  drawArt(ctx, ART.sceneFence, 0, 0);
  FENCE_BOARDS.slice(0, fence.board + 1).forEach((board, index) => {
    const falling = index === fence.board ? (1 - fence.drop) * FENCE_BOARD_DROP.height : 0;
    ctx.save();
    ctx.translate(board.x, FENCE_GROUND + board.dy - falling);
    ctx.rotate((board.angle * Math.PI) / 180);
    drawFrame(ctx, ART.fenceBoards, index, FENCE_BOARD_CELL.w, -FENCE_BOARD_CELL.w / 2, -FENCE_BOARD_CELL.h);
    ctx.restore();
  });

  if (fence.drop >= 1 && !closeup.done) {
    // A soft, slow light on the nail that comes next, as on the beetles.
    const next = pickNail(null);
    if (next) {
      const glow = BEETLE_GLOW.low + (BEETLE_GLOW.high - BEETLE_GLOW.low) * (0.5 + 0.5 * Math.sin(time / BEETLE_GLOW.period));
      const light = ctx.createRadialGradient(next.x, next.y, 1, next.x, next.y, BEETLE_GLOW.radius);
      light.addColorStop(0, `rgba(255, 244, 190, ${glow})`);
      light.addColorStop(1, "rgba(255, 236, 160, 0)");
      ctx.fillStyle = light;
      ctx.fillRect(next.x - BEETLE_GLOW.radius, next.y - BEETLE_GLOW.radius, BEETLE_GLOW.radius * 2, BEETLE_GLOW.radius * 2);
    }
  }
  if (fence.drop >= 1 || fence.board > 0) {
    fence.nails.forEach((nail, index) => {
      // The nails of a board still coming down are not there yet.
      if (fence.drop < 1 && index >= fence.board * FENCE_RAILS.length) return;
      drawFrame(ctx, ART.fenceNails, nail.stage, FENCE_NAIL_W, nail.x - FENCE_NAIL_W / 2, nail.y - FENCE_NAIL_HEAD);
    });
  }

  if (!closeup.done) {
    // The hammer turns about the end of its handle: raised away from the nail, flat against it on a hit.
    const hammer = fence.hammer;
    const spot = hammerPosition();
    let raised = 1;
    if (hammer.state === "swing") raised = 1 - hammer.t;
    if (hammer.state === "lift") raised = hammer.t;
    ctx.translate(spot.x, spot.y);
    ctx.rotate((raised * FENCE_HAMMER_REST_ANGLE * Math.PI) / 180);
    drawArt(ctx, ART.hammer, -ART.hammer.w / 2, -ART.hammer.h);
  }
  ctx.restore();
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
  if (closeup.type === "fence") drawFenceScene(ctx, time);
  ctx.restore();
}
