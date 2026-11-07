const TILE = 16;

const COLORS = {
  outline: "#2b1d14",
  skin: "#f2c29b",
  grass: "#6aa84f",
  grassDark: "#5a9440",
  grassLight: "#7cbc5c",
  road: "#b08a5a",
  roadDark: "#9a7448",
  wood: "#8a5a2b",
  woodDark: "#5a3a1b",
  leaves: "#2f6b2f",
  leavesLight: "#3f8a3f",
  slate: "#7a8088",
  slateDark: "#5e646c",
  tin: "#a0463a",
  tinDark: "#7e3329",
  wall: "#f0ece0",
  wallShade: "#d8d2c0",
  blue: "#3a6fd8",
  glass: "#9fd3f0",
  shopWall: "#d8c89a",
  shopWallDark: "#bfae7e",
  soil: "#5a3a22",
  potato: "#3f7a2f",
  stone: "#9a9a9a",
  stoneDark: "#6a6a6a",
  concrete: "#a8a8a0",
  concreteDark: "#7a7a72",
  water: "#3a7ac8",
  waterLight: "#6aa0e0",
  yellow: "#e8c547",
  red: "#c8323c",
  white: "#fff8e8",
};

// Pixel art templates. Each letter is a color slot, "." is transparent.
const PERSON_TEMPLATE = [
  "................",
  ".....kkkkkk.....",
  "....kHHHHHHk....",
  "....kHHHHHHk....",
  "....kSSSSSSk....",
  "....kSESSESk....",
  "....kSSSSSSk....",
  ".....kSSSSk.....",
  "....kTTTTTTk....",
  "...kSTTTTTTSk...",
  "...kSTTTTTTSk...",
  "....kTTTTTTk....",
  "....kLLLLLLk....",
  "....kLLkkLLk....",
  "....kLLkkLLk....",
  "....kkkkkkkk....",
];

const SCARF_TEMPLATE = [
  "................",
  ".....kkkkkk.....",
  "....kHHHHHHk....",
  "...kHHHHHHHHk...",
  "...kHSSSSSSHk...",
  "...kHSESSESHk...",
  "...kHSSSSSSHk...",
  "....kHSSSSHk....",
  "....kTTTTTTk....",
  "...kSTTWWTTSk...",
  "...kSTTWWTTSk...",
  "...kTTTWWTTTk...",
  "...kTTTWWTTTk...",
  "..kTTTTTTTTTTk..",
  "...kkSSkkSSkk...",
  "................",
];

const BEETLE_TEMPLATE = [
  "..kk..",
  ".kyyk.",
  "kykyyk",
  "kyykyk",
  ".kyyk.",
  "..kk..",
];

function makeSprite(template, palette) {
  const canvas = document.createElement("canvas");
  canvas.width = template[0].length;
  canvas.height = template.length;
  const ctx = canvas.getContext("2d");

  template.forEach((row, y) => {
    [...row].forEach((letter, x) => {
      const color = palette[letter];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    });
  });
  return canvas;
}

function personPalette(hair, top, legs) {
  return { k: COLORS.outline, S: COLORS.skin, E: COLORS.outline, H: hair, T: top, L: legs, W: COLORS.white };
}

const SPRITES = {
  player: makeSprite(PERSON_TEMPLATE, personPalette("#6b3e1f", COLORS.blue, "#2f3f7a")),
  grandma: makeSprite(SCARF_TEMPLATE, personPalette(COLORS.red, "#7a4a8c")),
  valya: makeSprite(PERSON_TEMPLATE, personPalette("#e8d070", COLORS.red, "#4a3a5a")),
  grandpa: makeSprite(PERSON_TEMPLATE, personPalette("#c8c8c8", "#6a7a5a", "#4a4a4a")),
  beetle: makeSprite(BEETLE_TEMPLATE, { k: COLORS.outline, y: COLORS.yellow }),
};

// Fixed pseudo-random number per tile, so the map looks the same every time.
function noise(col, row, salt) {
  const n = Math.sin(col * 12.9898 + row * 78.233 + salt * 37.719) * 43758.5453;
  return n - Math.floor(n);
}

function speckle(ctx, x, y, col, row, color, count) {
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const px = Math.floor(noise(col, row, i) * TILE);
    const py = Math.floor(noise(col, row, i + 50) * TILE);
    ctx.fillRect(x + px, y + py, 1, 1);
  }
}

function rect(ctx, color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawGrass(ctx, x, y, col, row) {
  rect(ctx, COLORS.grass, x, y, TILE, TILE);
  speckle(ctx, x, y, col, row, COLORS.grassDark, 6);
  speckle(ctx, x, y, col + 100, row, COLORS.grassLight, 4);
}

function drawTile(ctx, letter, col, row) {
  const x = col * TILE;
  const y = row * TILE;

  switch (letter) {
    case ".":
      drawGrass(ctx, x, y, col, row);
      break;

    case ",": {
      drawGrass(ctx, x, y, col, row);
      const flowerColors = [COLORS.red, COLORS.yellow, COLORS.white];
      for (let i = 0; i < 3; i++) {
        const px = 2 + Math.floor(noise(col, row, i + 7) * 11);
        const py = 2 + Math.floor(noise(col, row, i + 9) * 11);
        rect(ctx, flowerColors[i], x + px, y + py, 2, 2);
      }
      break;
    }

    case "=":
      rect(ctx, COLORS.road, x, y, TILE, TILE);
      speckle(ctx, x, y, col, row, COLORS.roadDark, 8);
      break;

    case "T":
      drawGrass(ctx, x, y, col, row);
      rect(ctx, COLORS.woodDark, x + 6, y + 10, 4, 6);
      rect(ctx, COLORS.leaves, x + 1, y + 1, 14, 11);
      rect(ctx, COLORS.leaves, x + 3, y, 10, 13);
      rect(ctx, COLORS.leavesLight, x + 4, y + 2, 4, 3);
      break;

    case "#":
      drawGrass(ctx, x, y, col, row);
      rect(ctx, COLORS.wood, x, y + 5, TILE, 2);
      rect(ctx, COLORS.wood, x, y + 11, TILE, 2);
      rect(ctx, COLORS.woodDark, x + 2, y + 2, 3, 14);
      rect(ctx, COLORS.woodDark, x + 10, y + 2, 3, 14);
      break;

    case "R":
      rect(ctx, COLORS.slate, x, y, TILE, TILE);
      for (let i = 0; i < TILE; i += 4) {
        rect(ctx, COLORS.slateDark, x + i, y, 1, TILE);
      }
      break;

    case "r":
      rect(ctx, COLORS.tin, x, y, TILE, TILE);
      for (let i = 0; i < TILE; i += 4) {
        rect(ctx, COLORS.tinDark, x, y + i, TILE, 1);
      }
      break;

    case "H":
      rect(ctx, COLORS.wall, x, y, TILE, TILE);
      rect(ctx, COLORS.blue, x, y + 13, TILE, 3);
      if (col % 3 === 0) {
        rect(ctx, COLORS.blue, x + 3, y + 2, 10, 9);
        rect(ctx, COLORS.glass, x + 4, y + 3, 3, 3);
        rect(ctx, COLORS.glass, x + 9, y + 3, 3, 3);
        rect(ctx, COLORS.glass, x + 4, y + 7, 3, 3);
        rect(ctx, COLORS.glass, x + 9, y + 7, 3, 3);
      }
      break;

    case "D":
      rect(ctx, COLORS.wall, x, y, TILE, TILE);
      rect(ctx, COLORS.woodDark, x + 3, y + 1, 10, 15);
      rect(ctx, COLORS.wood, x + 4, y + 2, 8, 14);
      rect(ctx, COLORS.yellow, x + 10, y + 9, 1, 2);
      break;

    case "h":
      rect(ctx, COLORS.shopWall, x, y, TILE, TILE);
      for (let i = 3; i < TILE; i += 4) {
        rect(ctx, COLORS.shopWallDark, x, y + i, TILE, 1);
      }
      if (col % 2 === 0) {
        rect(ctx, COLORS.outline, x + 2, y + 2, 12, 9);
        rect(ctx, COLORS.glass, x + 3, y + 3, 10, 7);
      }
      break;

    case "d":
      rect(ctx, COLORS.shopWall, x, y, TILE, TILE);
      rect(ctx, COLORS.outline, x + 2, y + 1, 12, 15);
      rect(ctx, COLORS.glass, x + 3, y + 2, 10, 6);
      rect(ctx, COLORS.blue, x + 3, y + 9, 10, 7);
      break;

    case "P":
      rect(ctx, COLORS.soil, x, y, TILE, TILE);
      rect(ctx, COLORS.potato, x + 1, y + 2, 5, 4);
      rect(ctx, COLORS.potato, x + 9, y + 2, 5, 4);
      rect(ctx, COLORS.potato, x + 1, y + 10, 5, 4);
      rect(ctx, COLORS.potato, x + 9, y + 10, 5, 4);
      break;

    case "W":
      drawGrass(ctx, x, y, col, row);
      rect(ctx, COLORS.woodDark, x + 2, y + 1, 12, 3);
      rect(ctx, COLORS.woodDark, x + 3, y + 4, 2, 6);
      rect(ctx, COLORS.woodDark, x + 11, y + 4, 2, 6);
      rect(ctx, COLORS.stoneDark, x + 1, y + 9, 14, 7);
      rect(ctx, COLORS.stone, x + 2, y + 10, 12, 5);
      rect(ctx, COLORS.water, x + 4, y + 11, 8, 2);
      break;

    case "B":
      drawGrass(ctx, x, y, col, row);
      rect(ctx, COLORS.concreteDark, x, y + 1, TILE, 3);
      rect(ctx, COLORS.concrete, x, y + 4, TILE, 10);
      rect(ctx, COLORS.blue, x, y + 7, TILE, 2);
      rect(ctx, COLORS.concreteDark, x, y + 14, TILE, 2);
      break;

    case "~":
      rect(ctx, COLORS.water, x, y, TILE, TILE);
      speckle(ctx, x, y, col, row, COLORS.waterLight, 5);
      break;

    case "b":
      drawGrass(ctx, x, y, col, row);
      rect(ctx, COLORS.wood, x, y + 6, TILE, 4);
      rect(ctx, COLORS.woodDark, x + 2, y + 10, 2, 4);
      rect(ctx, COLORS.woodDark, x + 12, y + 10, 2, 4);
      break;

    default:
      drawGrass(ctx, x, y, col, row);
  }
}

function drawBus(ctx, x, y) {
  rect(ctx, COLORS.outline, x - 1, y - 1, 34, 18);
  rect(ctx, COLORS.yellow, x, y, 32, 16);
  rect(ctx, COLORS.glass, x + 2, y + 2, 6, 5);
  rect(ctx, COLORS.glass, x + 10, y + 2, 6, 5);
  rect(ctx, COLORS.glass, x + 18, y + 2, 6, 5);
  rect(ctx, COLORS.glass, x + 26, y + 2, 5, 7);
  rect(ctx, COLORS.outline, x + 4, y + 13, 6, 4);
  rect(ctx, COLORS.outline, x + 22, y + 13, 6, 4);
}
