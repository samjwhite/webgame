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
  occludeStreetPole1: "world/occlude_street_pole_1.png",
  occludeStreetPole2: "world/occlude_street_pole_2.png",
  houseBed: "world/house_bed.png",
  houseTv: "world/house_tv.png",
  houseFridge: "world/house_fridge.png",
  houseStove: "world/house_stove.png",
  houseBorscht: "world/house_borscht.png",
  houseTable: "world/house_table.png",
  houseVarenyky: "world/house_varenyky.png",
  heroCity: "world/hero_city.png",
  heroSport: "world/hero_sport.png",
  heroMoped: "world/hero_moped.png",
  grandmaWalk: "world/grandma_walk.png",
  seller: "world/seller.png",
  grandpaSit: "world/grandpa_sit.png",
  ladRed: "world/lad_red.png",
  ladSquat: "world/lad_squat.png",
  ladCap: "world/lad_cap.png",
  backpack: "world/backpack.png",
  moped: "world/moped.png",
  truck: "world/truck.png",
  shedOpen: "world/shed_open.png",
  crate: "world/crate.png",
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
  groceries: "scenes/groceries.png",
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
  sleep: "scenes/sleep.png",
  fridgeOpen: "scenes/fridge_open.png",
  fridgeItems: "scenes/fridge_items.png",
};

// Replaced with the commit id on deploy, so phones load fresh files instead of old cached ones.
const ART_VERSION = "dev";

const ART = {};

function loadArt() {
  const loading = Object.entries(ART_FILES).map(([name, file]) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
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

// Draws frame number `frame` from a horizontal strip of equal-width frames.
function drawFrame(ctx, img, frame, frameWidth, x, y) {
  ctx.drawImage(img, frame * frameWidth, 0, frameWidth, img.height, snap(x), snap(y), frameWidth, img.height);
}
