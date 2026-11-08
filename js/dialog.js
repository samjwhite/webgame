const TYPE_SPEED = 45;

const dialog = {
  open: false,
  lines: [],
  text: "",
  who: null,
  speaker: null,
  shown: 0,
  onClose: null,
  isHint: false,
};

const dialogBox = document.getElementById("dialog");
const dialogText = document.getElementById("dialog-text");
const dialogNext = document.getElementById("dialog-next");
const dialogName = document.getElementById("dialog-name");
const dialogPortrait = document.getElementById("dialog-portrait");
// If a portrait cannot be loaded (a bad connection), show the name only instead of a broken image.
let portraitFailed = "";
dialogPortrait.addEventListener("error", () => {
  portraitFailed = dialogPortrait.getAttribute("src") || "";
  dialogPortrait.hidden = true;
  dialogBox.classList.remove("with-portrait");
});

// Portraits come from PORTRAIT_FILES (js/assets.js); a speaker without one shows only a name.
// Svetka before the hero knows her name: her portrait, captioned "unknown girl".
const PORTRAIT_OF = { stranger: "svetka" };

// A line is a string or { who, text } (who: null is narration). A string "Name: text" is said by the
// person with that name in T().speakers; any other string belongs to the dialog's speaker, if any.
function readLine(raw, speaker) {
  if (typeof raw !== "string") return { who: raw.who, text: raw.text };
  const found = Object.entries(T().speakers).find(([, name]) => raw.startsWith(`${name}: `));
  if (found) return { who: found[0], text: raw.slice(found[1].length + 2) };
  return { who: speaker || null, text: raw };
}

function openDialog(lines, onClose, speaker) {
  dialog.open = true;
  dialog.isHint = false;
  dialog.lines = [...lines];
  dialog.speaker = speaker || null;
  dialog.onClose = onClose || null;
  nextLine();
}

// A hint stays on screen and does not react to taps (used during mini-games).
function showHint(text) {
  dialog.open = true;
  dialog.isHint = true;
  dialog.text = text;
  dialog.who = null;
  dialog.shown = text.length;
  dialog.onClose = null;
}

function closeDialog() {
  dialog.open = false;
  const onClose = dialog.onClose;
  dialog.onClose = null;
  if (onClose) onClose();
}

function nextLine() {
  const { who, text } = readLine(dialog.lines.shift(), dialog.speaker);
  dialog.who = who;
  dialog.text = text;
  dialog.shown = 0;
}

function isTyping() {
  return dialog.open && dialog.shown < dialog.text.length;
}

function advanceDialog() {
  if (dialog.isHint) return;
  if (isTyping()) {
    dialog.shown = dialog.text.length;
  } else if (dialog.lines.length > 0) {
    nextLine();
  } else {
    closeDialog();
  }
}

function showSpeaker() {
  const name = dialog.who ? T().speakers[dialog.who] : "";
  if (dialogName.textContent !== name) dialogName.textContent = name;
  dialogName.hidden = !name;
  const file = dialog.who && PORTRAIT_FILES[PORTRAIT_OF[dialog.who] || dialog.who];
  const src = file ? `art/${file}?v=${ART_VERSION}` : "";
  if (dialogPortrait.getAttribute("src") !== src) {
    if (src) dialogPortrait.setAttribute("src", src);
    else dialogPortrait.removeAttribute("src");
  }
  const shown = Boolean(src) && src !== portraitFailed;
  dialogPortrait.hidden = !shown;
  dialogBox.classList.toggle("with-portrait", shown);
}

function updateDialog(dt) {
  if (isTyping()) {
    dialog.shown = Math.min(dialog.text.length, dialog.shown + TYPE_SPEED * dt);
  }
  dialogBox.hidden = !dialog.open;
  showSpeaker();
  const visible = dialog.text.slice(0, Math.floor(dialog.shown));
  if (dialogText.textContent !== visible) dialogText.textContent = visible;
  dialogNext.hidden = dialog.isHint || isTyping();
}

// ---------- Choices ----------

// A short list of what the hero may do, shown under the picture: arrows or the joystick move, A picks.
const choice = { open: false, index: 0, options: [], moved: false };
const choiceBox = document.getElementById("choice-menu");
const choiceTitle = document.getElementById("choice-title");
const choiceList = document.getElementById("choice-list");

// options: [{ label, pick }]; pick() runs once the list is closed.
function openChoice(title, options) {
  choice.open = true;
  choice.index = 0;
  choice.options = options;
  choice.moved = false;
  choiceTitle.textContent = title;
  choiceList.textContent = "";
  options.forEach((option, index) => {
    const row = document.createElement("button");
    row.className = "choice-row";
    row.textContent = option.label;
    row.addEventListener("click", () => pickChoice(index));
    choiceList.append(row);
  });
  markChoice();
}

function markChoice() {
  Array.from(choiceList.children || []).forEach((row, index) => row.classList.toggle("selected", index === choice.index));
}

function pickChoice(index) {
  if (!choice.open || dialog.open) return;
  const option = choice.options[index];
  if (!option) return;
  choice.open = false;
  option.pick();
}

function updateChoice(action) {
  const step = Math.abs(input.moveY) > 0.5 ? Math.sign(input.moveY) : 0;
  if (!step) {
    choice.moved = false;
  } else if (!choice.moved) {
    choice.moved = true;
    choice.index = (choice.index + step + choice.options.length) % choice.options.length;
    markChoice();
  }
  if (action) pickChoice(choice.index);
}
