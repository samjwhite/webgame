const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const objectiveBox = document.getElementById("objective");
const objectiveText = document.getElementById("objective-text");
const moneyText = document.getElementById("money");
const checklist = document.getElementById("checklist");
const checkBeer = document.getElementById("check-beer");
const checkSuit = document.getElementById("check-suit");
const checkMoped = document.getElementById("check-moped");
const objectiveToggle = document.getElementById("objective-toggle");
const objectiveBody = document.getElementById("objective-body");
const objectiveArrow = document.getElementById("objective-arrow");
const mapButton = document.getElementById("map-button");
const mapView = document.getElementById("map-view");
const mapMarker = document.getElementById("map-marker");
const HUD_COLLAPSED_KEY = "lito-v-seli-hud-collapsed";
const actionButton = document.getElementById("action-button");
const menu = document.getElementById("menu");
const continueButton = document.getElementById("continue-button");
const newGameButton = document.getElementById("new-game-button");
const locationName = document.getElementById("location-name");
const dayText = document.getElementById("day-text");
const bagText = document.getElementById("bag-text");
const mapLabels = document.getElementById("map-labels");

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

// speaker: who says the lines that do not name anyone (see readLine in dialog.js).
function showPicture(picture, lines, onClose, effect, speaker) {
  mode = "closeup";
  startPictureScene(picture, effect);
  openDialog(lines, onClose || finishCloseup, speaker);
}

// Who speaks in each talk picture, unless a line names someone else.
const TALK_SPEAKERS = { grandma: "grandma", grandpa: "grandpa", valya: "valya" };

function startNewGame() {
  clearSave();
  Object.assign(quest, newQuest());
  enterLocation(START.location, START);
  resetChickens();
  menu.hidden = true;
  showPicture("intro", T().intro);
}

function continueGame() {
  const saved = loadSave();
  Object.assign(quest, newQuest(), saved.quest);
  if (saved.version === SAVE_VERSION && LOCATIONS[saved.location]) {
    enterLocation(saved.location, saved.player, saved.player.dir);
  } else {
    // A save with coordinates from an older layout: keep the progress, restart from grandma's yard.
    enterLocation(WAKE_UP_SPOT.location, WAKE_UP_SPOT);
    quest.moped = { ...newQuest().moped };
    quest.riding = false;
    if (quest.discoDone) quest.time = "night";
  }
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
  showPicture("talkLads", T().beaten, () => {
    quest.beatings += 1;
    if (quest.riding) {
      quest.riding = false;
      quest.moped = { ...CLUB_PARKING };
    }
    enterLocation(WAKE_UP_SPOT.location, WAKE_UP_SPOT);
    heroSay([T().hero.afterBeating]);
    showPicture("talkGrandma", wakeUpLines(), null, null, "grandma");
  }, "hit");
}

// In the garden grandma sees the hero picking beetles by hand and sends him to grandpa for the sprayer.
function grandmaStopsHandPicking() {
  showPicture("talkGrandma", stopPicking(), finishCloseup, null, "grandma");
}

// The hero is ready before the evening: he may wait for it by the club. The day stays the same.
function offerEvening() {
  openChoice(T().ui.waitTitle, [
    {
      label: T().ui.waitEvening,
      pick: () => {
        advancePhase("evening");
        saveGame();
        showPicture("nightfall", T().evening, () => showPicture("talkLads", T().lads.welcome, goToDisco));
      },
    },
    { label: T().ui.notYet, pick: finishCloseup },
  ]);
}

// The lads let the hero in. Inside he notices a girl he does not know and chooses what to do.
// The disco ends at night; the day changes only after sleeping.
function goToDisco() {
  const text = T().disco;
  showPicture("disco", [...text.start, ...noticeSvetka()], () => {
    openChoice(text.choiceTitle, [
      { label: text.goOver, pick: () => showPicture("discoSvetka", discoApproach(), chooseAfterDance) },
      { label: text.keepDancing, pick: () => showPicture("disco", discoStayWithLads(), endDisco, "disco") },
    ]);
  }, "disco");
}

function chooseAfterDance() {
  const text = T().disco;
  openChoice(text.afterTitle, ["stayed", "warned", "left"].map((id) => ({
    label: text.afterOptions[id],
    pick: () => showPicture("discoSvetka", discoAfterDance(id), endDisco),
  })));
}

function endDisco() {
  quest.time = "night";
  quest.discoDone = true;
  finishCloseup();
  openDialog(T().afterDisco, saveGame);
}

// After their talk by the shop the hero chooses whether to ask Svetka to the river now.
function offerDateInvite() {
  const text = T().svetka;
  openChoice(text.inviteTitle, [
    { label: text.inviteRiver, pick: () => openDialog(inviteToRiver(), saveGame) },
    { label: text.inviteLater, pick: () => openDialog([text.notNow], saveGame) },
  ]);
}

// Everything is ready but it is still day: he may wait with her for the evening. The day stays the same.
function offerDateEvening() {
  const text = T().svetka;
  openChoice(text.waitTitle, [
    {
      label: text.waitHere,
      pick: () => {
        advancePhase("evening");
        saveGame();
        openDialog(text.eveningFalls, goToRiver);
      },
    },
    { label: T().ui.notYet, pick: saveGame },
  ]);
}

// The date: the ride, the bank, his tapes, and one choice: say something or keep quiet.
function goToRiver() {
  const text = T().river;
  showPicture("riverDate", text.start, () => {
    openChoice(text.choiceTitle, [
      { label: text.speakChoice, pick: () => showPicture("riverDate", riverDate("spoke"), endDate) },
      { label: text.silentChoice, pick: () => showPicture("riverDate", riverDate("silent"), endDate) },
    ]);
  });
}

// He takes her home and rolls the moped into grandma's yard: night, time for bed.
function endDate() {
  quest.time = "night";
  quest.riding = false;
  quest.moped = { ...newQuest().moped };
  enterLocation(WAKE_UP_SPOT.location, WAKE_UP_SPOT);
  finishCloseup();
  openDialog(T().river.home, saveGame);
}

function goToSleep() {
  showPicture("sleep", T().sleep, () => {
    startNewDay();
    enterLocation(MORNING_SPOT.location, MORNING_SPOT);
    heroSay([T().hero.morning]);
    showPicture("sleep", T().morning(quest.day), finishCloseup, "dawn");
  }, "sleep");
}

// What happens after a dialog, as named by the story (see story.js).
function afterTalk(next) {
  if (next === "beaten") getBeaten();
  else if (next === "disco") goToDisco();
  else if (next === "waitEvening") offerEvening();
  else if (next === "shop") openShopMenu();
  else if (next === "invite") offerDateInvite();
  else if (next === "dateWait") offerDateEvening();
  else if (next === "riverDate") goToRiver();
  else if (next === "catfishChoice") chooseCatfishWay();
  else if (next === "rodWait") offerNight(goRodCatch);
  else if (next === "rodCatch") goRodCatch();
  else if (next === "carWait") offerNight(() => showAction(useCar()));
  else if (next === "boardwalkWait") offerNight(() => showAction(useBoardwalk()));
  else finishCloseup();
}

// ---------- The catfish ----------

// Grandpa has told both ways: the hero chooses one.
function chooseCatfishWay() {
  const text = T().catfish;
  openChoice(text.choiceTitle, ["rod", "electro"].map((way) => ({
    label: text[way],
    pick: () => showPicture("talkGrandpa", chooseCatfish(way), finishCloseup),
  })));
}

// The catfish comes out at night: the hero may wait for it where he is. The day stays the same.
function offerNight(onWait) {
  const text = T().catfish;
  openChoice(text.nightTitle, [
    {
      label: text.waitNight,
      pick: () => {
        advancePhase("night");
        saveGame();
        onWait();
      },
    },
    { label: T().ui.notYet, pick: finishCloseup },
  ]);
}

function goRodCatch() {
  showPicture("catfishRod", catchWithRod(), finishCloseup);
}

// Shows what using a thing gave: over its close-up picture, or as a dialog over the world.
function showAction(result) {
  if (result.picture) {
    showPicture(result.picture, result.lines, () => afterTalk(result.next));
  } else if (result.next) {
    openDialog(result.lines, () => afterTalk(result.next));
  } else {
    openDialog(result.lines, finishCloseup);
  }
}

const TALK_ACTIONS = {
  backpack: useBackpack,
  shed: useShed,
  truck: useTruck,
  moped: useMoped,
  statue: useStatue,
  shopDoor: useShopDoor,
  bed: useBed,
  tv: useTv,
  borscht: useBorscht,
  varenyky: useVarenyky,
  fridge: useFridge,
  beerBottle: useBeerBottle,
  svetka: talkToSvetka,
  worms: useWorms,
  car: useCar,
  boardwalk: useBoardwalk,
  driver: talkToDriver,
};

function useTarget(target) {
  if (target.id === "well") {
    mode = "closeup";
    if (needsWater()) {
      startWellScene("raise", () => {
        quest.hasWater = true;
        openDialog([T().ui.wellFull], finishCloseup);
      });
    } else {
      showWellAtRest([T().ui.wellCold]);
    }
    return;
  }
  if (target.id === "garden") {
    mode = "closeup";
    if (gardenJob() === "spray") {
      startSprayScene();
      openDialog(sprayPotatoes(), finishCloseup);
    } else {
      startGardenScene();
    }
    return;
  }

  if (TALK_ACTIONS[target.id]) {
    const result = TALK_ACTIONS[target.id]();
    if (result.picture) {
      showAction(result);
    } else if (result.next === "ride") {
      showPicture("road", result.lines);
    } else if (result.next === "speak") {
      heroInterrupt(result.lines);
      saveGame();
    } else if (result.next === "sleep") {
      openDialog(result.lines, goToSleep);
    } else if (result.next === "fridge") {
      showPicture("fridgeOpen", result.lines, finishCloseup, "fridge");
    } else if (result.next === "tv") {
      showPicture("tsn", result.lines, finishCloseup, "tv");
    } else if (result.next) {
      openDialog(result.lines, () => afterTalk(result.next));
    } else {
      openDialog(result.lines, saveGame);
    }
    return;
  }

  if (target.id === "lads") quest.arrivedOnMoped = isMopedNearLads();
  const result = target.talk();
  showPicture(TALK_PICTURES[target.id], result.lines, () => afterTalk(result.next), null, TALK_SPEAKERS[target.id]);
}

function getOffMoped() {
  quest.riding = false;
  quest.moped = { location: currentLocation, x: player.x, y: player.y + 1 };
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
  if (!mapView.hidden) return;

  if (travel.active) {
    updateTravel(dt);
    return;
  }

  // Dialogs move on with the A button only; a tap on the screen does nothing here.
  if (dialog.open && !dialog.isHint) {
    if (action) advanceDialog();
    action = false;
    tap = null;
  }
  if (shopMenu.open && !dialog.open) {
    updateShopMenu(action);
    action = false;
    tap = null;
  }
  if (choice.open && !dialog.open) {
    updateChoice(action);
    action = false;
    tap = null;
  }

  // A choice over the world (talking to Svetka) holds the hero in place until it is answered.
  if (mode === "world" && !dialog.open && !choice.open) {
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
  setArtSmoothing(ctx);
  placeStage();
  if (mode === "world") {
    const target = dialog.open || travel.active ? null : nearestTarget();
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
  mapButton.hidden = mode !== "world" || dialog.open;
  locationName.hidden = mapButton.hidden;
}

function setText(element, text) {
  if (element.textContent !== text) element.textContent = text;
}

function updateHud() {
  setText(objectiveText, currentObjective());
  setText(dayText, T().ui.day(quest.day, SUMMER_DAYS, T().ui.phases[quest.time]));
  setText(bagText, Object.keys(quest.bag).length ? T().shop.bag(bagLine()) : "");
  shopMenuBox.hidden = !shopMenu.open || dialog.open;
  choiceBox.hidden = !choice.open || dialog.open;
  setText(locationName, T().places[currentLocation]);
  setText(moneyText, quest.money > 0 || quest.metLads ? T().ui.money(quest.money) : "");
  checklist.hidden = !quest.metLads || quest.discoDone;
  setCheck(checkBeer, quest.beersDrunk >= BEERS_NEEDED, T().ui.checkBeer(quest.beersDrunk, BEERS_NEEDED));
  setCheck(checkSuit, quest.outfit === "sport", T().ui.checkSuit);
  setCheck(checkMoped, quest.riding, T().ui.checkMoped);
}

function setCheck(item, done, text) {
  item.classList.toggle("done", done);
  setText(item.querySelector(".label"), text);
}

function setHudCollapsed(collapsed) {
  objectiveBody.hidden = collapsed;
  objectiveBox.classList.toggle("collapsed", collapsed);
  objectiveArrow.textContent = collapsed ? "▼" : "▲";
  try {
    localStorage.setItem(HUD_COLLAPSED_KEY, collapsed ? "1" : "");
  } catch (error) {
    // Remembering the panel state is only a convenience.
  }
}

function loadHudCollapsed() {
  try {
    return localStorage.getItem(HUD_COLLAPSED_KEY) === "1";
  } catch (error) {
    return false;
  }
}

const VILLAGE_MAP_W = 768;
const VILLAGE_MAP_H = 512;

function mapLabel(className, text, leftPixel, topPixel) {
  const label = document.createElement("div");
  label.className = className;
  label.textContent = text;
  label.style.left = `${(leftPixel / VILLAGE_MAP_W) * 100}%`;
  label.style.top = `${(topPixel / VILLAGE_MAP_H) * 100}%`;
  return label;
}

function fillMapLabels() {
  mapLabels.textContent = "";
  Object.entries(OPEN_PLACES).forEach(([id, { x, y }]) => {
    mapLabels.append(mapLabel("map-label", T().places[id], x, y));
  });
  Object.entries(LOCKED_PLACES).forEach(([id, { box: [left, top, right, bottom] }]) => {
    if (isPlaceUnlocked(id)) {
      mapLabels.append(mapLabel("map-label", T().places[id], (left + right) / 2, (top + bottom) / 2));
      return;
    }
    const shade = document.createElement("div");
    shade.className = "map-locked";
    shade.style.left = `${(left / VILLAGE_MAP_W) * 100}%`;
    shade.style.top = `${(top / VILLAGE_MAP_H) * 100}%`;
    shade.style.width = `${((right - left) / VILLAGE_MAP_W) * 100}%`;
    shade.style.height = `${((bottom - top) / VILLAGE_MAP_H) * 100}%`;
    shade.textContent = `${T().places[id]}\n${T().places.closed}`;
    mapLabels.append(shade);
  });
}

function openMap() {
  const { mapSpot, mapLine } = here();
  // The road is one long picture, so only the hero's position along it counts on the map.
  const spot = mapSpot || { x: player.x * mapLine.scale, y: mapLine.y };
  mapMarker.style.left = `${(spot.x / VILLAGE_MAP_W) * 100}%`;
  mapMarker.style.top = `${(spot.y / VILLAGE_MAP_H) * 100}%`;
  fillMapLabels();
  mapView.hidden = false;
  input.joystick = null;
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
objectiveToggle.addEventListener("click", () => setHudCollapsed(!objectiveBody.hidden));
mapButton.addEventListener("click", openMap);
mapView.addEventListener("click", () => {
  mapView.hidden = true;
});
setHudCollapsed(loadHudCollapsed());
newGameButton.addEventListener("click", startNewGame);
document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.language);
    applyLanguageToPage();
  });
});
applyLanguageToPage();

loadArt().then(() => {
  initWorld();
  resize();
  setupTouchControls(canvas, actionButton);
  showTitle();
  requestAnimationFrame((time) => {
    lastTime = time;
    loop(time);
  });
});
