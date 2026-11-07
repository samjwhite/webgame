const TYPE_SPEED = 45;

const dialog = {
  open: false,
  lines: [],
  text: "",
  shown: 0,
  onClose: null,
  isHint: false,
};

const dialogBox = document.getElementById("dialog");
const dialogText = document.getElementById("dialog-text");
const dialogNext = document.getElementById("dialog-next");

function openDialog(lines, onClose) {
  dialog.open = true;
  dialog.isHint = false;
  dialog.lines = [...lines];
  dialog.onClose = onClose || null;
  nextLine();
}

// A hint stays on screen and does not react to taps (used during mini-games).
function showHint(text) {
  dialog.open = true;
  dialog.isHint = true;
  dialog.text = text;
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
  dialog.text = dialog.lines.shift();
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

function updateDialog(dt) {
  if (isTyping()) {
    dialog.shown = Math.min(dialog.text.length, dialog.shown + TYPE_SPEED * dt);
  }
  dialogBox.hidden = !dialog.open;
  const visible = dialog.text.slice(0, Math.floor(dialog.shown));
  if (dialogText.textContent !== visible) dialogText.textContent = visible;
  dialogNext.hidden = dialog.isHint || isTyping();
}
