const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const objectiveBox = document.getElementById("objective");
const actionButton = document.getElementById("action-button");
const menu = document.getElementById("menu");
const continueButton = document.getElementById("continue-button");
const newGameButton = document.getElementById("new-game-button");

// "title", "intro", "world" or "closeup"
let mode = "title";
let view = { width: 0, height: 0, scale: 2 };
let stage = { x: 0, y: 0 };
let saveTimer = 0;

function finishCloseup() {
  closeup.type = null;
  mode = "world";
  saveGame();
}

function finishIntro() {
  mode = "world";
  saveGame();
}

function startNewGame() {
  clearSave();
  Object.assign(quest, newQuest());
  resetPlayer(null);
  menu.hidden = true;
  mode = "intro";
  openDialog(INTRO_LINES, () => {
    closeup.busLeaving = true;
  });
}

function continueGame() {
  const saved = loadSave();
  Object.assign(quest, newQuest(), saved.quest);
  resetPlayer(saved.player);
  menu.hidden = true;
  closeup.type = null;
  mode = "world";
}

function useTarget(target) {
  mode = "closeup";
  if (target.id === "well") {
    startWellScene();
  } else if (target.id === "garden") {
    startGardenScene();
  } else {
    startTalkScene(target.id);
    openDialog(target.talk(), finishCloseup);
  }
}

// Converts a screen tap into stage pixel coordinates.
function tapOnStage(tap) {
  if (!tap || tap.x < 0) return null;
  return { x: tap.x / view.scale - stage.x, y: tap.y / view.scale - stage.y };
}

function update(dt) {
  readMovement();
  let { action, tap } = takeInput();

  if (dialog.open && !dialog.isHint && (action || tap)) {
    advanceDialog();
    action = false;
    tap = null;
  }

  if (mode === "world" && !dialog.open) {
    updateWorld(dt);
    const target = nearestTarget();
    actionButton.classList.toggle("ready", target !== null);
    if (action && target) useTarget(target);

    saveTimer += dt;
    if (saveTimer > 5) {
      saveTimer = 0;
      saveGame();
    }
  } else if (mode === "closeup" || mode === "intro" || mode === "title") {
    actionButton.classList.remove("ready");
    updateCloseup(dt, action, tapOnStage(tap));
  }

  updateDialog(dt);
}

function draw(time) {
  if (mode === "world") {
    const target = dialog.open ? null : nearestTarget();
    drawWorld(ctx, view, time, target);
    drawJoystick();
  } else if (mode === "closeup") {
    drawWorld(ctx, view, time, null);
    ctx.fillStyle = "rgba(20, 12, 8, 0.65)";
    ctx.fillRect(0, 0, view.width, view.height);
    drawStage(ctx, stage, time);
  } else {
    ctx.fillStyle = "#2a1d17";
    ctx.fillRect(0, 0, view.width, view.height);
    drawStage(ctx, stage, time);
  }

  objectiveBox.hidden = mode !== "world";
  const objective = currentObjective();
  if (objectiveBox.textContent !== objective) objectiveBox.textContent = objective;
  actionButton.hidden = mode === "title";
}

function drawJoystick() {
  const stick = input.joystick;
  if (!stick || dialog.open) return;
  const cx = stick.startX / view.scale;
  const cy = stick.startY / view.scale;
  const length = Math.hypot(stick.dx, stick.dy) || 1;
  const reach = Math.min(length, JOYSTICK_RADIUS) / view.scale;

  ctx.globalAlpha = 0.45;
  ctx.fillStyle = "#fbf6ea";
  ctx.beginPath();
  ctx.arc(cx, cy, JOYSTICK_RADIUS / view.scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a1d17";
  ctx.beginPath();
  ctx.arc(cx + (stick.dx / length) * reach, cy + (stick.dy / length) * reach, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function resize() {
  const scale = Math.max(2, Math.floor(Math.min(window.innerWidth / STAGE_W, window.innerHeight / 260)));
  view = {
    scale,
    width: Math.ceil(window.innerWidth / scale),
    height: Math.ceil(window.innerHeight / scale),
  };
  canvas.width = view.width;
  canvas.height = view.height;
  ctx.imageSmoothingEnabled = false;

  // Keep the close-up picture above the dialog box.
  const dialogSpace = Math.ceil(230 / scale);
  stage = {
    x: Math.floor((view.width - STAGE_W) / 2),
    y: Math.max(4, Math.floor((view.height - dialogSpace - STAGE_H) / 2)),
  };
}

let lastTime = 0;
function loop(time) {
  const dt = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;
  update(dt);
  draw(time);
  requestAnimationFrame(loop);
}

function showTitle() {
  startTitleScene();
  continueButton.hidden = !loadSave();
  menu.hidden = false;
}

window.addEventListener("resize", resize);
continueButton.addEventListener("click", continueGame);
newGameButton.addEventListener("click", startNewGame);

loadArt().then(() => {
  initWorld();
  resize();
  setupTouchControls(canvas, actionButton, document.getElementById("dialog"));
  showTitle();
  requestAnimationFrame((time) => {
    lastTime = time;
    loop(time);
  });
});
