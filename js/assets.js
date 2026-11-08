const TILE = 16;

// Art is built by tools/art/build.py, mostly from the pictures in tools/art/reference.
const ART_FILES = {
  locYard: "world/loc_yard.png",
  locHouse: "world/loc_house.png",
  locClub: "world/loc_club.png",
  locShop: "world/loc_shop.png",
  locStop: "world/loc_stop.png",
  locPond: "world/loc_pond.png",
  locStreet: "world/loc_street.png",
  occludeYardWell: "world/occlude_yard_well.png",
  occludeClubStatue: "world/occlude_club_statue.png",
  occludeStopSign: "world/occlude_stop_sign.png",
  occludeStreetSign: "world/occlude_street_sign.png",
  houseBed: "world/house_bed.png",
  houseTv: "world/house_tv.png",
  houseFridge: "world/house_fridge.png",
  houseStove: "world/house_stove.png",
  houseChair: "world/house_chair.png",
  housePlate: "world/house_plate.png",
  occludeHouseDoor: "world/occlude_house_door.png",
  houseTable: "world/house_table.png",
  houseVarenyky: "world/house_varenyky.png",
  heroCity: "world/hero_city.png",
  heroSport: "world/hero_sport.png",
  heroMoped: "world/hero_moped.png",
  grandmaWalk: "world/grandma_walk.png",
  seller: "world/seller.png",
  svetka: "world/svetka.png",
  petroBench: "world/petro_bench.png",
  tolik: "world/tolik.png",
  vovchik: "world/vovchik.png",
  driver: "world/driver.png",
  car: "world/car.png",
  carEmpty: "world/car_empty.png",
  sanya: "world/sanya.png",
  backpack: "world/backpack.png",
  moped: "world/moped.png",
  truck: "world/truck.png",
  crate: "world/crate.png",
  beerBottle: "world/beer_bottle.png",
  rooster: "world/rooster.png",
  henWhite: "world/hen_white.png",
  henGinger: "world/hen_ginger.png",
  henBlack: "world/hen_black.png",
  cats: "world/cats.png",
  dogs: "world/dogs.png",
  shopClosed: "world/shop_closed.png",
  butterfly: "world/butterfly.png",
  beetleSmall: "world/beetle.png",

  title: "scenes/title.png",
  intro: "scenes/intro.png",
  road: "scenes/road.png",
  shed: "scenes/shed.png",
  disco: "scenes/disco.png",
  talkGrandma: "scenes/talk_grandma.png",
  talkGrandpa: "scenes/talk_grandpa.png",
  talkSeller: "scenes/talk_seller.png",
  talkLads: "scenes/talk_lads.png",
  goodsBeer: "scenes/goods_beer.png",
  goodsBread: "scenes/goods_bread.png",
  goodsLoaf: "scenes/goods_loaf.png",
  goodsNoodles: "scenes/goods_noodles.png",
  goodsSugar: "scenes/goods_sugar.png",
  goodsMatches: "scenes/goods_matches.png",
  goodsFish: "scenes/goods_fish.png",
  goodsChocolate: "scenes/goods_chocolate.png",
  goodsSausage: "scenes/goods_sausage.png",
  goodsOil: "scenes/goods_oil.png",
  goodsSeeds: "scenes/goods_seeds.png",
  goodsCigarettes: "scenes/goods_cigarettes.png",
  skyDay: "scenes/sky_day.png",
  clouds: "scenes/clouds.png",
  sceneWell: "scenes/well.png",
  wellFront: "scenes/well_front.png",
  crank: "scenes/crank.png",
  bucket: "scenes/bucket.png",
  sceneGarden: "scenes/garden.png",
  beetleBig: "scenes/beetle.png",
  hand: "scenes/hand.png",
  jar: "scenes/jar.png",
  tsn: "scenes/tsn.png",
  newsFrames: "scenes/news_frames.png",
  nightfall: "scenes/nightfall.png",
  sleep: "scenes/sleep.png",
  fridgeOpen: "scenes/fridge_open.png",
  fridgeItems: "scenes/fridge_items.png",
  riverDate: "scenes/river_date.png",
  discoSvetka: "scenes/disco_svetka.png",
  catfishRod: "scenes/catfish_rod.png",
  catfishNight: "scenes/catfish_night.png",
  catfishSale: "scenes/catfish_sale.png",
  batteryRant: "scenes/battery_rant.png",
};

// Bust portraits over the dialog text, by speaker id (tools/art/reference.py, PORTRAITS). They load with
// the rest of the art, so a portrait is there the first time someone speaks.
const PORTRAIT_FILES = {};
["hero", "grandma", "grandpa", "valya", "tolik", "vovchik", "sanya", "svetka", "driver"].forEach((id) => {
  PORTRAIT_FILES[id] = `portraits/${id}.png`;
  ART_FILES[`portrait_${id}`] = PORTRAIT_FILES[id];
});

// Replaced with the commit id on deploy, so phones load fresh files instead of old cached ones.
const ART_VERSION = "dev";

// Art files are ART_RES times finer than the world's game pixels (tools/art/lib.py, RES): a person
// 40 game pixels tall is 120 pixels in the file. Everything in the game (positions, walls, sizes) stays
// in game pixels; each picture knows its size in game pixels as `w` and `h`, and is drawn at that size.
const ART_RES = 3;

const ART = {};

function loadArt() {
  const loading = Object.entries(ART_FILES).map(([name, file]) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        img.w = img.width / ART_RES;
        img.h = img.height / ART_RES;
        ART[name] = img;
        resolve();
      };
      img.onerror = () => reject(new Error("Cannot load art/" + file));
      img.src = "art/" + file + "?v=" + ART_VERSION;
    });
  });
  return Promise.all(loading);
}

// Screen pixels per game pixel. The canvas is drawn at full screen resolution,
// so the camera can move smoothly by less than one game pixel.
let PIXEL = 1;

// Rounds a game coordinate to the nearest screen pixel.
function snap(value) {
  return Math.round(value * PIXEL) / PIXEL;
}

// Hard pixel edges while a file pixel covers at least one screen pixel; smooth when the art is drawn
// smaller than its file, so details blend instead of flickering.
function setArtSmoothing(ctx) {
  ctx.imageSmoothingEnabled = PIXEL < ART_RES;
  ctx.imageSmoothingQuality = "high";
}

// Draws a whole picture with its top left corner at (x, y), all in game pixels.
function drawArt(ctx, img, x, y) {
  ctx.drawImage(img, x, y, img.w, img.h);
}

// Draws the part (sx, sy, sw, sh) of a picture at (x, y), all in game pixels.
function drawArtPart(ctx, img, sx, sy, sw, sh, x, y) {
  ctx.drawImage(img, sx * ART_RES, sy * ART_RES, sw * ART_RES, sh * ART_RES, x, y, sw, sh);
}

// Draws frame number `frame` from a horizontal strip of equal-width frames.
function drawFrame(ctx, img, frame, frameWidth, x, y) {
  drawArtPart(ctx, img, frame * frameWidth, 0, frameWidth, img.h, snap(x), snap(y));
}
