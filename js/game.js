const PLAYER_SPEED = 55;
const TALK_DISTANCE = 22;
const BEETLE_PICK_DISTANCE = 10;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const objectiveBox = document.getElementById("objective");
const dialogBox = document.getElementById("dialog");
const dialogText = document.getElementById("dialog-text");
const actionButton = document.getElementById("action-button");

const mapImage = renderMap();

const player = { x: 28 * TILE + 8, y: 12 * TILE + 10, moving: false };

const npcs = [
  { sprite: SPRITES.grandma, x: 5 * TILE + 8, y: 6 * TILE - 2, talk: talkToGrandma },
  { sprite: SPRITES.valya, x: 21 * TILE + 8, y: 17 * TILE + 12, talk: talkToValya },
  { sprite: SPRITES.grandpa, x: 27 * TILE + 8, y: 16 * TILE + 12, talk: talkToGrandpa },
];

const well = { x: 11 * TILE + 8, y: 5 * TILE, talk: useWell };

const bus = { x: 26 * TILE, y: 13 * TILE, leaving: false };

let beetles = [];
let dialogLines = [];
let view = { width: 0, height: 0, scale: 1 };

function spawnBeetles() {
  const garden = findTiles("P").sort(() => Math.random() - 0.5);
  beetles = garden.slice(0, BEETLE_COUNT).map((tile) => ({
    x: tile.col * TILE + 4 + Math.random() * 8,
    y: tile.row * TILE + 4 + Math.random() * 8,
  }));
}

function openDialog(lines, onClose) {
  dialogLines = [...lines];
  dialogBox.onClose = onClose;
  dialogText.textContent = dialogLines.shift();
  dialogBox.hidden = false;
}

function advanceDialog() {
  if (dialogLines.length > 0) {
    dialogText.textContent = dialogLines.shift();
    return;
  }
  dialogBox.hidden = true;
  if (dialogBox.onClose) dialogBox.onClose();
  dialogBox.onClose = null;
}

function isBlocked(x, y) {
  const corners = [
    [x - 5, y - 4],
    [x + 5, y - 4],
    [x - 5, y],
    [x + 5, y],
  ];
  if (corners.some(([cx, cy]) => isSolidAt(cx, cy))) return true;
  return npcs.some((npc) => Math.hypot(npc.x - x, npc.y - y) < 10);
}

function movePlayer(dt) {
  const dx = input.moveX * PLAYER_SPEED * dt;
  const dy = input.moveY * PLAYER_SPEED * dt;
  player.moving = dx !== 0 || dy !== 0;

  if (!isBlocked(player.x + dx, player.y)) player.x += dx;
  if (!isBlocked(player.x, player.y + dy)) player.y += dy;
}

function nearestTarget() {
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

function catchBeetles() {
  const before = beetles.length;
  beetles = beetles.filter((b) => Math.hypot(b.x - player.x, b.y - player.y) > BEETLE_PICK_DISTANCE);
  quest.beetlesCaught += before - beetles.length;
}

function update(dt) {
  readMovement();
  const actionPressed = consumeAction();

  if (!dialogBox.hidden) {
    if (actionPressed) advanceDialog();
    return;
  }

  movePlayer(dt);
  if (quest.stage === "beetles") catchBeetles();

  const target = nearestTarget();
  actionButton.classList.toggle("ready", target !== null);
  if (actionPressed && target) {
    openDialog(target.talk());
  }

  if (bus.leaving) bus.x += 70 * dt;
}

function cameraOffset(playerPos, viewSize, mapSize) {
  if (mapSize <= viewSize) return Math.round((mapSize - viewSize) / 2);
  const offset = playerPos - viewSize / 2;
  return Math.round(Math.max(0, Math.min(offset, mapSize - viewSize)));
}

function drawPerson(sprite, x, y, bob) {
  ctx.drawImage(sprite, Math.round(x - 8), Math.round(y - 16 + bob));
}

function drawHint(target) {
  const x = Math.round(target.x) - 3;
  const y = Math.round(target.y) - 26;
  ctx.fillStyle = COLORS.outline;
  ctx.fillRect(x - 1, y - 1, 8, 10);
  ctx.fillStyle = COLORS.white;
  ctx.fillRect(x, y, 6, 8);
  ctx.fillStyle = COLORS.outline;
  ctx.fillRect(x + 2, y + 1, 2, 4);
  ctx.fillRect(x + 2, y + 6, 2, 1);
}

function drawJoystick() {
  const stick = input.joystick;
  if (!stick) return;
  const cx = stick.startX / view.scale;
  const cy = stick.startY / view.scale;
  const length = Math.hypot(stick.dx, stick.dy) || 1;
  const reach = Math.min(length, JOYSTICK_RADIUS) / view.scale;

  ctx.globalAlpha = 0.5;
  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.arc(cx, cy, JOYSTICK_RADIUS / view.scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.outline;
  ctx.beginPath();
  ctx.arc(cx + (stick.dx / length) * reach, cy + (stick.dy / length) * reach, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function draw(time) {
  const camX = cameraOffset(player.x, view.width, mapImage.width);
  const camY = cameraOffset(player.y, view.height, mapImage.height);

  ctx.fillStyle = COLORS.outline;
  ctx.fillRect(0, 0, view.width, view.height);

  ctx.save();
  ctx.translate(-camX, -camY);
  ctx.drawImage(mapImage, 0, 0);

  beetles.forEach((b) => ctx.drawImage(SPRITES.beetle, Math.round(b.x - 3), Math.round(b.y - 3)));
  drawBus(ctx, Math.round(bus.x), bus.y);

  const walkBob = player.moving ? Math.floor(time / 120) % 2 : 0;
  const people = [...npcs, player].sort((a, b) => a.y - b.y);
  people.forEach((person) => {
    const sprite = person === player ? SPRITES.player : person.sprite;
    drawPerson(sprite, person.x, person.y, person === player ? walkBob : 0);
  });

  const target = dialogBox.hidden ? nearestTarget() : null;
  if (target) drawHint(target);
  ctx.restore();

  drawJoystick();

  const objective = currentObjective();
  if (objectiveBox.textContent !== objective) objectiveBox.textContent = objective;
}

function resize() {
  const scale = Math.max(2, Math.floor(Math.min(window.innerWidth, window.innerHeight) / 180));
  view = {
    scale,
    width: Math.ceil(window.innerWidth / scale),
    height: Math.ceil(window.innerHeight / scale),
  };
  canvas.width = view.width;
  canvas.height = view.height;
  ctx.imageSmoothingEnabled = false;
}

let lastTime = 0;
function loop(time) {
  const dt = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;
  update(dt);
  draw(time);
  requestAnimationFrame(loop);
}

window.addEventListener("resize", resize);
resize();
setupTouchControls(canvas, actionButton, dialogBox);
openDialog(INTRO_LINES, () => {
  bus.leaving = true;
});
requestAnimationFrame((time) => {
  lastTime = time;
  loop(time);
});
