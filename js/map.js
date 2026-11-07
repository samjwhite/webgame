// Legend:
// .  grass         ,  flowers       =  dirt road      T  tree
// #  fence         R  house roof    H  house wall     D  house door
// r  shop roof     h  shop wall     d  shop door      P  potato garden
// W  well          B  bus stop      ~  pond           b  bench
const MAP = [
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "T##############....T.......,...T",
  "T#.RRRRRR.....#........,.......T",
  "T#.RRRRRR.....#....,.......T...T",
  "T#.HHDHHH..W..#................T",
  "T#............#.....T..........T",
  "T#.PPPPPPPP...#...........,....T",
  "T#.PPPPPPPP...#..,.............T",
  "T#.PPPPPPPP...#.......T........T",
  "T#............#................T",
  "T######..######.....,..........T",
  "T......==..............,...BBB.T",
  "================================",
  "================================",
  "T.................rrrrrrr......T",
  "T..T..............rrrrrrr......T",
  "T.................hhhdhhh.b....T",
  "T..~~~~.........,..............T",
  "T.~~~~~~...T...................T",
  "T..~~~~..........,.........T...T",
  "T..............................T",
  "T.....,.........T..............T",
  "T..T.............,.......T.....T",
  "T.........,....................T",
  "T...................,.....,....T",
  "T......T.....,.................T",
  "T..,..............T........T...T",
  "T..........,...................T",
  "T....T...........,.............T",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
];

const MAP_COLS = MAP[0].length;
const MAP_ROWS = MAP.length;
const SOLID_TILES = "T#RHDrhdWB~b";

function tileAt(col, row) {
  if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) {
    return "T";
  }
  return MAP[row][col];
}

function isSolidTile(px, py) {
  return SOLID_TILES.includes(tileAt(Math.floor(px / TILE), Math.floor(py / TILE)));
}

function findTiles(letter) {
  const found = [];
  MAP.forEach((line, row) => {
    [...line].forEach((ch, col) => {
      if (ch === letter) found.push({ col, row });
    });
  });
  return found;
}

// Same pseudo-random number for the same tile every time.
function tileNoise(col, row) {
  const n = Math.sin(col * 12.9898 + row * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function renderGround() {
  const canvas = document.createElement("canvas");
  canvas.width = MAP_COLS * TILE;
  canvas.height = MAP_ROWS * TILE;
  const ctx = canvas.getContext("2d");

  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      const letter = MAP[row][col];
      const x = col * TILE;
      const y = row * TILE;
      const variant = Math.floor(tileNoise(col, row) * 4);

      if (letter === "=") {
        drawFrame(ctx, ART.road, variant % 3, TILE, x, y);
        drawRoadEdges(ctx, col, row);
      } else if (letter === "P") {
        drawFrame(ctx, ART.soil, 0, TILE, x, y);
      } else if (letter === ",") {
        drawFrame(ctx, ART.flowers, variant % 2, TILE, x, y);
      } else {
        drawFrame(ctx, ART.grass, variant, TILE, x, y);
      }
    }
  }
  return canvas;
}

function drawRoadEdges(ctx, col, row) {
  const x = col * TILE;
  const y = row * TILE;
  ctx.fillStyle = "#5e9442";
  for (let i = 0; i < TILE; i += 2) {
    const tuft = 1 + Math.floor(tileNoise(col + i, row) * 3);
    if (tileAt(col, row - 1) !== "=") ctx.fillRect(x + i, y, 2, tuft);
    if (tileAt(col, row + 1) !== "=") ctx.fillRect(x + i, y + TILE - tuft, 2, tuft);
  }
}

function drawPondEdges(ctx, col, row) {
  const x = col * TILE;
  const y = row * TILE;
  if (tileAt(col, row - 1) !== "~") {
    ctx.fillStyle = "#2f6a8a";
    ctx.fillRect(x, y, TILE, 3);
  }
  ctx.fillStyle = "#d2b285";
  if (tileAt(col, row + 1) !== "~") ctx.fillRect(x, y + TILE - 2, TILE, 2);
  if (tileAt(col - 1, row) !== "~") ctx.fillRect(x, y, 2, TILE);
  if (tileAt(col + 1, row) !== "~") ctx.fillRect(x + TILE - 2, y, 2, TILE);
}

// Objects are drawn sorted by baseY so characters can walk behind them.
function sprite(img, frameWidth, x, y, baseY, extra) {
  return { img, frameWidth, x, y, baseY, frame: 0, ...extra };
}

function buildObjects() {
  const objects = [];

  findTiles("T").forEach(({ col, row }) => {
    const baseY = row * TILE + 14;
    if (tileNoise(col, row) < 0.25) {
      objects.push(sprite(ART.poplars, 20, col * TILE - 2, row * TILE - 26, baseY, { frame: col % 2 }));
    } else {
      objects.push(sprite(ART.trees, 32, col * TILE - 8, row * TILE - 22, baseY, { frame: (col + row) % 2 }));
    }
  });

  findTiles("#").forEach(({ col, row }) => {
    const horizontal = tileAt(col - 1, row) === "#" || tileAt(col + 1, row) === "#";
    let frame = 2;
    if (horizontal) frame = tileNoise(col, row) < 0.2 ? 1 : 0;
    objects.push(sprite(ART.fence, 16, col * TILE, row * TILE, row * TILE + 13, { frame }));
  });

  findTiles("P").forEach(({ col, row }) => {
    objects.push(sprite(ART.potato, 14, col * TILE + 1, row * TILE + 1, row * TILE + 12, { animate: 900 }));
  });

  // Big objects: [image, center x, bottom y]. Their solid area comes from the map letters.
  const buildings = [
    [ART.house, 96, 82],
    [ART.shopBuilding, 344, 274],
    [ART.wellBuilding, 184, 82],
    [ART.busStop, 456, 192],
    [ART.bench, 424, 270],
  ];
  buildings.forEach(([img, centerX, bottomY]) => {
    objects.push(sprite(img, img.width, centerX - img.width / 2, bottomY - img.height, bottomY - 2));
  });

  // Small decorations standing on a tile: [image, col, row, frame width, animation speed]
  const decorations = [
    [ART.sunflowers, 10, 2],
    [ART.sunflowers, 12, 2],
    [ART.mallows, 13, 3],
    [ART.mallows, 2, 5],
    [ART.logs, 9, 3],
    [ART.appleTree, 12, 7],
    [ART.haystack, 17, 7],
    [ART.haystack, 8, 23],
    [ART.bush, 16, 3],
    [ART.bush, 5, 20],
    [ART.bush, 20, 25],
    [ART.stork, 24, 5, 24, 1800],
  ];
  decorations.forEach(([img, col, row, frameWidth, animate]) => {
    const width = frameWidth || img.width;
    const footX = col * TILE + 8;
    const footY = row * TILE + 14;
    objects.push(sprite(img, width, footX - width / 2, footY - img.height + 2, footY, {
      animate,
      solid: { x: footX - 5, y: footY - 6, w: 10, h: 7 },
    }));
  });

  for (let col = 1; col <= 16; col++) {
    objects.push(sprite(ART.gasPipe, 16, col * TILE, 14 * TILE - 4, 14 * TILE + 10, { frame: col % 3 === 0 ? 1 : 0 }));
  }

  return objects;
}
