// Helpers that run inside the game. They play the game the way a player does: stand somewhere and press A.

function kitFail(message) {
  throw new Error(message);
}

function kitPress() {
  input.actionPressed = true;
  update(0.02);
}

// Every point the hero's feet can reach in the current location, from where its ways in arrive.
function kitWalkable() {
  const arrivals = Object.values(LOCATIONS).flatMap((l) => l.exits).filter((e) => e.to === currentLocation).map((e) => e.spawn);
  const start = arrivals[0];
  const key = (x, y) => `${x},${y}`;
  const first = [Math.round(start.x / 2) * 2, Math.round(start.y / 2) * 2];
  const seen = new Set([key(...first)]);
  const queue = [first];
  const points = [first];
  const keep = { x: player.x, y: player.y };
  while (queue.length) {
    const [x, y] = queue.pop();
    for (const [dx, dy] of [[2, 0], [-2, 0], [0, 2], [0, -2]]) {
      const next = key(x + dx, y + dy);
      if (seen.has(next)) continue;
      player.x = x;
      player.y = y;
      if (isBlocked(x + dx, y + dy)) continue;
      seen.add(next);
      queue.push([x + dx, y + dy]);
      points.push([x + dx, y + dy]);
    }
  }
  player.x = keep.x;
  player.y = keep.y;
  return points;
}

function kitCanUse(point, target) {
  if (target.area) return isInside(point[0], point[1], target.area);
  return Math.hypot(point[0] - target.x, point[1] - target.y) < TALK_DISTANCE;
}

function kitFinishDialogs() {
  for (let i = 0; i < 400 && dialog.open && !dialog.isHint; i++) kitPress();
  if (dialog.open && !dialog.isHint) kitFail(`Dialog never closed: ${dialog.text}`);
}

function kitTarget(id) {
  const target = [...npcsHere(), ...Object.values(places).filter((p) => p.location === currentLocation), ...(isMopedHere() ? [{ id: "moped", x: quest.moped.x, y: quest.moped.y }] : [])]
    .find((t) => t.id === id);
  if (!target) kitFail(`${id} is not in ${currentLocation}`);
  return target;
}

// Walks up to something (the nearest spot a hero can really stand) and presses A.
function kitUse(id) {
  grandmaWalk.wait = 1e9;
  const target = kitTarget(id);
  const spots = kitWalkable().filter((p) => kitCanUse(p, target));
  if (!spots.length) kitFail(`Cannot reach ${id} in ${currentLocation}`);
  const spot = spots.reduce((best, p) => (Math.hypot(p[0] - target.x, p[1] - target.y) < Math.hypot(best[0] - target.x, best[1] - target.y) ? p : best));
  player.x = spot[0];
  player.y = spot[1];
  const found = nearestTarget();
  if (!found || found.id !== id) kitFail(`Standing at ${id}, A would use ${found && found.id}`);
  kitPress();
}

function kitTalk(id) {
  kitUse(id);
  kitFinishDialogs();
}

function kitGo(location) {
  const arrival = Object.values(LOCATIONS).flatMap((l) => l.exits).find((e) => e.to === location);
  enterLocation(location, arrival.spawn);
  update(0.02);
}

function kitCrankWell() {
  kitUse("well");
  for (let i = 0; i < 400 && closeup.type === "well" && !closeup.done; i++) kitPress();
  kitFinishDialogs();
}

function kitFillJar() {
  grandmaWalk.wait = 1e9;
  const inside = kitWalkable().find((p) => isInside(p[0], p[1], GARDEN_AREA));
  if (!inside) kitFail("Cannot walk onto the garden");
  player.x = inside[0];
  player.y = inside[1];
  const found = nearestTarget();
  if (!found || found.id !== "garden") kitFail(`On the garden, A would use ${found && found.id}`);
  kitPress();
  for (let i = 0; i < 2000 && closeup.type === "garden" && !(dialog.open && !dialog.isHint); i++) kitPress();
  kitFinishDialogs();
}

function kitHerdChickens() {
  for (let i = 0; i < 6000 && quest.stage === "chickens"; i++) {
    const hen = chickens.find((c) => c.herdable && !c.running);
    if (hen) {
      player.x = hen.x;
      player.y = hen.y;
    } else {
      player.x = 20 + SHED_DOOR.x;
      player.y = 20 + SHED_DOOR.y;
    }
    update(0.05);
  }
  if (quest.stage !== "moped") kitFail(`Chickens not herded: stage ${quest.stage}, herded ${quest.chickensHerded}`);
  kitFinishDialogs();
}

// Talks to the seller and buys one thing from her list, then leaves the shop's list.
function kitBuy(id) {
  kitUse("valya");
  kitFinishDialogs();
  if (!shopMenu.open) kitFail("The shop's list did not open");
  const index = shopMenu.rows.findIndex((good) => good.id === id);
  if (index < 0) kitFail(`${id} is not on offer`);
  shopMenu.index = index;
  kitPress();
  kitFinishDialogs();
  shopMenu.index = shopMenu.rows.length;
  kitPress();
  if (shopMenu.open) kitFail("The shop's list did not close");
}
