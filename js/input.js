const input = {
  moveX: 0,
  moveY: 0,
  actionPressed: false,
  tap: null,
  joystick: null,
};

const keysDown = new Set();
const JOYSTICK_DEAD_ZONE = 8;
const JOYSTICK_RADIUS = 40;

window.addEventListener("keydown", (event) => {
  if (["Space", "Enter", "KeyE"].includes(event.code) && !event.repeat) {
    input.actionPressed = true;
  }
  keysDown.add(event.code);
});

window.addEventListener("keyup", (event) => {
  keysDown.delete(event.code);
});

// A key released while the page is out of focus never reports it, and the hero would walk on alone.
window.addEventListener("blur", () => {
  keysDown.clear();
});

function setupTouchControls(canvas, actionButton) {
  canvas.addEventListener("pointerdown", (event) => {
    canvas.setPointerCapture(event.pointerId);
    input.tap = { x: event.clientX, y: event.clientY };
    input.joystick = { id: event.pointerId, startX: event.clientX, startY: event.clientY, dx: 0, dy: 0 };
  });

  canvas.addEventListener("pointermove", (event) => {
    const stick = input.joystick;
    if (!stick || stick.id !== event.pointerId) return;
    stick.dx = event.clientX - stick.startX;
    stick.dy = event.clientY - stick.startY;
  });

  const releaseStick = (event) => {
    if (input.joystick && input.joystick.id === event.pointerId) {
      input.joystick = null;
    }
  };
  canvas.addEventListener("pointerup", releaseStick);
  canvas.addEventListener("pointercancel", releaseStick);

  actionButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    input.actionPressed = true;
  });

}

function readMovement() {
  let x = 0;
  let y = 0;

  if (keysDown.has("ArrowLeft") || keysDown.has("KeyA")) x -= 1;
  if (keysDown.has("ArrowRight") || keysDown.has("KeyD")) x += 1;
  if (keysDown.has("ArrowUp") || keysDown.has("KeyW")) y -= 1;
  if (keysDown.has("ArrowDown") || keysDown.has("KeyS")) y += 1;

  const stick = input.joystick;
  if (stick) {
    const length = Math.hypot(stick.dx, stick.dy);
    if (length > JOYSTICK_DEAD_ZONE) {
      const strength = Math.min(length, JOYSTICK_RADIUS) / JOYSTICK_RADIUS;
      x = (stick.dx / length) * strength;
      y = (stick.dy / length) * strength;
    }
  }

  const length = Math.hypot(x, y);
  if (length > 1) {
    x /= length;
    y /= length;
  }
  input.moveX = x;
  input.moveY = y;
}

// Returns the action press and tap of this frame, then clears them.
function takeInput() {
  const result = { action: input.actionPressed, tap: input.tap };
  input.actionPressed = false;
  input.tap = null;
  return result;
}
