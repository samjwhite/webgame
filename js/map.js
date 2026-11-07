// Legend:
// .  grass         ,  flowers       =  dirt road      T  tree
// #  fence         R  slate roof    H  house wall     D  house door
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

function isSolidAt(px, py) {
  const letter = tileAt(Math.floor(px / TILE), Math.floor(py / TILE));
  return SOLID_TILES.includes(letter);
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

function renderMap() {
  const canvas = document.createElement("canvas");
  canvas.width = MAP_COLS * TILE;
  canvas.height = MAP_ROWS * TILE;
  const ctx = canvas.getContext("2d");

  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      drawTile(ctx, MAP[row][col], col, row);
    }
  }
  return canvas;
}
