const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const objectiveBox = document.getElementById("objective");
const objectiveText = document.getElementById("objective-text");
const moneyText = document.getElementById("money");
const checklist = document.getElementById("checklist");
const checkBeer = document.querySelector("#check-beer span");
const checkSuit = document.querySelector("#check-suit span");
const checkMoped = document.querySelector("#check-moped span");
const actionButton = document.getElementById("action-button");
const menu = document.getElementById("menu");
const continueButton = document.getElementById("continue-button");
const newGameButton = document.getElementById("new-game-button");

// "title", "world" or "closeup"
let mode = "title";
let view = { width: 0, height: 0, scale: 2 };
let stage = { x: 0, y: 0 };
let saveTimer = 0;

function finishCloseup() {
  closeup.type = null;
  mode = "world";
  saveGame();
}

function showPicture(picture, lines, onClose, effect) {
  mode = "closeup";
  startPictureScene(picture, effect);
  openDialog(lines, onClose || finishCloseup);
}

function startNewGame() {
  clearSave();
  Object.assign(quest, newQuest());
  placePlayer(START_POSITION);
  resetChickens();
  menu.hidden = true;
  showPicture("intro", INTRO_LINES);
}

function continueGame() {
  const saved = loadSave();
  Object.assign(quest, newQuest(), saved.quest);
  placePlayer(saved.player);
  resetChickens();
  menu.hidden = true;
  closeup.type = null;
  mode = "world";
}

function onAllChickensHerded() {
  quest.stage = "moped";
  quest.mopedFound = true;
  showPicture("shed", shedFoundLines());
}

function getBeaten() {
  showPicture("talkLads", BEATEN_LINES, () => {
    quest.beatings += 1;
    if (quest.riding) {
      quest.riding = false;
      quest.moped = { ...CLUB_PARKING };
    }
    placePlayer(WAKE_UP_POSITION);
    showPicture("talkGrandma", wakeUpLines());
  }, "hit");
}

function goToDisco() {
  showPicture("disco", DISCO_LINES, () => {
    quest.discoDone = true;
    finishCloseup();
  }, "disco");
}

// What happens after a dialog, as named by the story (see story.js).
function afterTalk(next) {
  if (next === "beaten") getBeaten();
  else if (next === "disco") goToDisco();
  else finishCloseup();
}

const TALK_ACTIONS = {
  backpack: useBackpack,
  shed: useShed,
  truck: useTruck,
  moped: useMoped,
  statue: useStatue,
};

function useTarget(target) {
  if (target.id === "well") {
    mode = "closeup";
    if (needsWater()) {
      startWellScene("raise", () => {
        quest.hasWater = true;
        openDialog(["Повне відро холодної води! Аж зуби ломить."], finishCloseup);
      });
    } else {
      showWellAtRest(["Вода в криниці холодна-холодна."]);
    }
    return;
  }
  if (target.id === "garden") {
    mode = "closeup";
    startGardenScene();
    return;
  }

  if (TALK_ACTIONS[target.id]) {
    const result = TALK_ACTIONS[target.id]();
    if (result.next === "ride") {
      showPicture("road", result.lines);
    } else {
      openDialog(result.lines, saveGame);
    }
    return;
  }

  if (target.id === "lads") quest.arrivedOnMoped = isMopedNearLads();
  const result = target.talk();
  showPicture(TALK_PICTURES[target.id], result.lines, () => afterTalk(result.next));
}

function getOffMoped() {
  quest.riding = false;
  quest.moped = { x: player.x, y: player.y + 1 };
  saveGame();
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
    else if (action && quest.riding) getOffMoped();

    saveTimer += dt;
    if (saveTimer > 5) {
      saveTimer = 0;
      saveGame();
    }
  } else {
    actionButton.classList.remove("ready");
    updateCloseup(dt, action, tapOnStage(tap));
  }

  updateDialog(dt);
}

function draw(time) {
  ctx.setTransform(PIXEL, 0, 0, PIXEL, 0, 0);
  ctx.imageSmoothingEnabled = false;
  placeStage();
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
  updateHud();
  actionButton.hidden = mode === "title";
}

function setText(element, text) {
  if (element.textContent !== text) element.textContent = text;
}

function updateHud() {
  setText(objectiveText, currentObjective());
  setText(moneyText, quest.money > 0 || quest.metLads ? `Гроші: ${quest.money} грн` : "");
  checklist.hidden = !quest.metLads || quest.discoDone;
  setText(checkBeer, `${quest.beersDrunk >= BEERS_NEEDED ? "☑" : "☐"} Випити 3 «Славутича» (${quest.beersDrunk}/${BEERS_NEEDED})`);
  setText(checkSuit, `${quest.outfit === "sport" ? "☑" : "☐"} Вдягти спортивний костюм`);
  setText(checkMoped, `${quest.riding ? "☑" : "☐"} Приїхати на мопеді «Карпати»`);
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
  PIXEL = Math.max(1, Math.round(scale * (window.devicePixelRatio || 1)));
  canvas.width = view.width * PIXEL;
  canvas.height = view.height * PIXEL;

}

// Keeps the close-up picture centered above the dialog box.
function placeStage() {
  const { w, h } = stageSize();
  const dialogSpace = Math.ceil(230 / view.scale);
  stage = {
    x: Math.floor((view.width - w) / 2),
    y: Math.max(4, Math.floor((view.height - dialogSpace - h) / 2)),
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
  mode = "title";
  startPictureScene("title");
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
