// Checks the built art against the sizes decided in docs/PROPORTIONS.md. Run: npm test
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { ROOT } = require("./harness");

// A small PNG reader: enough to find how big a sprite really is.
function readPng(file) {
  const data = fs.readFileSync(path.join(ROOT, "art", file));
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  const colorType = data[25];
  let transparent = null;
  const chunks = [];
  for (let at = 8; at < data.length;) {
    const size = data.readUInt32BE(at);
    const type = data.toString("latin1", at + 4, at + 8);
    if (type === "IDAT") chunks.push(data.subarray(at + 8, at + 8 + size));
    if (type === "tRNS") transparent = data.subarray(at + 8, at + 8 + size);
    at += 12 + size;
  }
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  const raw = zlib.inflateSync(Buffer.concat(chunks));
  const stride = width * channels;
  const pixels = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    for (let i = 0; i < stride; i++) {
      const value = raw[y * (stride + 1) + 1 + i];
      const a = i >= channels ? pixels[y * stride + i - channels] : 0;
      const b = y ? pixels[(y - 1) * stride + i] : 0;
      const c = y && i >= channels ? pixels[(y - 1) * stride + i - channels] : 0;
      let predicted = 0;
      if (filter === 1) predicted = a;
      else if (filter === 2) predicted = b;
      else if (filter === 3) predicted = (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        predicted = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      pixels[y * stride + i] = (value + predicted) & 255;
    }
  }
  const isOpaque = (x, y) => {
    const at = y * stride + x * channels;
    if (colorType === 6) return pixels[at + 3] > 0;
    if (colorType === 4) return pixels[at + 1] > 0;
    if (colorType === 3 && transparent) return pixels[at] >= transparent.length || transparent[pixels[at]] > 0;
    return true;
  };
  return { width, height, isOpaque };
}

// Width and height of what is drawn inside a cell of a sheet.
function drawnSize(file, cell) {
  const png = readPng(file);
  const [left, top, cellWidth, cellHeight] = cell || [0, 0, png.width, png.height];
  let minX = Infinity;
  let maxX = -1;
  let minY = Infinity;
  let maxY = -1;
  for (let y = top; y < top + cellHeight; y++) {
    for (let x = left; x < left + cellWidth; x++) {
      if (png.isOpaque(x, y)) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  return { width: maxX - minX + 1, height: maxY - minY + 1 };
}

function within(name, value, low, high) {
  assert.ok(value >= low && value <= high, `${name} is ${value} px, the rule says ${low}-${high}`);
}

test("people are the yardstick: 38-42 px tall", () => {
  within("hero", drawnSize("world/hero_city.png", [0, 0, 28, 44]).height, 38, 42);
  within("hero in tracksuit", drawnSize("world/hero_sport.png", [0, 0, 28, 44]).height, 38, 42);
  const grandma = readPng("world/grandma_walk.png");
  within("grandma", drawnSize("world/grandma_walk.png", [0, 0, grandma.width / 4, grandma.height / 5]).height, 37, 43);
  within("seller", drawnSize("world/seller.png").height, 37, 43);
  within("lad", drawnSize("world/lad_red.png").height, 37, 43);
});

test("Did Petro sitting on his bench is not taller than a standing person", () => {
  const size = drawnSize("world/petro_bench.png", [0, 0, 36, 38]);
  within("Did Petro on the bench", size.height, 30, 38);
  within("his bench", size.width, 24, 34);
});

test("animals stay small next to people", () => {
  const cat = (column, row) => drawnSize("world/cats.png", [column * 24, row * 16, 24, 16]);
  for (let row = 0; row < 3; row++) {
    within("standing cat, long", cat(0, row).width, 14, 22);
    within("sitting cat, tall", cat(1, row).height, 10, 15);
    within("sleeping cat, long", cat(2, row).width, 12, 20);
  }
  const dog = (column, row) => drawnSize("world/dogs.png", [column * 24, row * 21, 24, 21]);
  for (let row = 0; row < 4; row++) {
    within("standing dog, long", dog(0, row).width, 14, 24);
    within("sitting dog, tall", dog(1, row).height, 12, 19);
  }
  const hen = readPng("world/hen_white.png");
  within("hen", drawnSize("world/hen_white.png", [0, 0, Math.floor(hen.width / 11), hen.height]).height, 11, 16);
});

test("vehicles are bigger than a person, as they should be", () => {
  within("parked moped, long", drawnSize("world/moped.png").width, 36, 46);
  within("truck, tall", drawnSize("world/truck.png").height, 46, 58);
});

test("furniture fits a person", () => {
  within("fridge", drawnSize("world/house_fridge.png").height, 36, 46);
  within("stove", drawnSize("world/house_stove.png").height, 22, 32);
  within("TV on its cabinet", drawnSize("world/house_tv.png").height, 28, 38);
  within("bed, long", drawnSize("world/house_bed.png").width, 50, 74);
  within("table", drawnSize("world/house_table.png").height, 22, 32);
  within("bottle in the world", drawnSize("world/beer_bottle.png").height, 8, 12);
});

test("goods on the seller's counter are in scale with her face and each other", () => {
  within("beer bottle", drawnSize("scenes/goods_beer.png").height, 38, 48);
  within("round bread", drawnSize("scenes/goods_bread.png").height, 22, 30);
  within("noodles", drawnSize("scenes/goods_noodles.png").height, 22, 30);
  within("sugar", drawnSize("scenes/goods_sugar.png").height, 28, 38);
  within("matches", drawnSize("scenes/goods_matches.png").height, 6, 10);
});

test("locations in the approved style use the agreed scale", () => {
  const scale = (file, source) => readPng(file).width / source;
  assert.ok(Math.abs(scale("world/loc_yard.png", 1536) - 0.37) < 0.002, "yard at 0.37");
  assert.ok(Math.abs(readPng("world/loc_street.png").height / 1024 - 0.37) < 0.002, "road at 0.37");
  assert.ok(Math.abs(scale("world/loc_house.png", 1536) - 0.25) < 0.002, "house room at 0.25");
  assert.ok(Math.abs(scale("world/loc_shop.png", 1448) - 0.23) < 0.002, "shop scene at 0.23");
});

test("every location is tall enough to fill a phone held upright", () => {
  // 812 px tall at 3 screen pixels per game pixel; the house may leave a thin dark edge.
  for (const name of ["yard", "club", "shop", "stop", "pond", "street"]) {
    within(`${name} height`, readPng(`world/loc_${name}.png`).height, 270, 1000);
  }
  within("house height", readPng("world/loc_house.png").height, 250, 1000);
});
