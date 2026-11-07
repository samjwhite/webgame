// The village is one painted picture (art/world/map.png, 48x32 tiles of 16px).
// Walls are invisible rectangles in tile coordinates: [left col, top row, right col, bottom row].
const MAP_COLS = 48;
const MAP_ROWS = 32;

const SOLID_AREAS = [
  [0, 0, 47, 2], // forest along the top
  [0, 3, 5, 7], // trees left of grandma's house
  [7, 3, 12, 7], // grandma's house
  [13, 5, 14, 7], // shed
  [6, 8, 12, 8], // grandma's fence
  [15, 3, 23, 3], // garden fence
  [22, 4, 23, 7], // bushes right of the garden
  [17, 8, 18, 9], // well
  [0, 9, 1, 14], // trees on the left edge
  [2, 9, 6, 13], // left house
  [7, 10, 9, 12], // big tree between houses
  [10, 10, 14, 13], // middle house
  [15, 12, 17, 13], // flower bed
  [21, 9, 22, 14], // trees left of the club
  [1, 15, 6, 15], [8, 15, 17, 15], [21, 15, 26, 15], // fences along the road
  [23, 3, 34, 8], // Будинок культури
  [23, 9, 23, 14], // club square, left side
  [34, 9, 35, 14], // club square, right side
  [27, 10, 30, 13], // statue and flowers
  [25, 11, 26, 12], [32, 11, 33, 12], // benches on the square
  [30, 15, 35, 15], // club fence right of the gate
  [36, 3, 38, 7], // trees by the shop
  [39, 1, 47, 5], // wheat field
  [37, 8, 43, 12], // shop
  [38, 13, 39, 13], [42, 13, 43, 13], // crates and bench by the shop
  [44, 6, 47, 14], // barn and trees right of the shop
  [38, 15, 47, 15], // shop fence
  [0, 19, 6, 20], // trees and bushes south-west
  [9, 19, 10, 19], // bench by the pond
  [12, 19, 14, 19], // trees by the pond
  [2, 21, 19, 28], // pond
  [0, 22, 1, 31], [0, 29, 23, 31], // trees south-west
  [22, 19, 31, 23], // house with the greenhouse
  [25, 24, 32, 28], // vegetable garden in the south
  [36, 19, 37, 20], // tree by the bus stop
  [39, 19, 43, 21], // bus stop
  [44, 19, 47, 24], // trees east of the bus stop
  [35, 25, 47, 31], // forest south-east
];

// Places you can walk on inside a solid area (the pier).
const WALKABLE_AREAS = [
  [10, 21, 13, 24],
];

// Grandma's potato beds.
const GARDEN_AREA = [15, 4, 19, 7];

function makeGrid() {
  const grid = Array.from({ length: MAP_ROWS }, () => Array(MAP_COLS).fill(false));
  const fill = (areas, solid) => {
    areas.forEach(([left, top, right, bottom]) => {
      for (let row = top; row <= bottom; row++) {
        for (let col = left; col <= right; col++) grid[row][col] = solid;
      }
    });
  };
  fill(SOLID_AREAS, true);
  fill(WALKABLE_AREAS, false);
  return grid;
}

const SOLID_GRID = makeGrid();

function isSolidTile(px, py) {
  const col = Math.floor(px / TILE);
  const row = Math.floor(py / TILE);
  if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return true;
  return SOLID_GRID[row][col];
}

function isGardenTile(col, row) {
  const [left, top, right, bottom] = GARDEN_AREA;
  return col >= left && col <= right && row >= top && row <= bottom;
}
