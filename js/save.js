const SAVE_KEY = "lito-v-seli-save";

// Storage can be blocked (private mode), so every call is wrapped and failures are ignored.
function saveGame() {
  try {
    const data = { quest, player: { x: player.x, y: player.y, dir: player.dir } };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Game not saved", error);
  }
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.warn("Save not cleared", error);
  }
}
