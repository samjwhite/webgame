// The village is a set of separate full-screen locations joined by paths.
// Coordinates are game pixels of the location's picture. Rectangles: [left, top, right, bottom].
//
// To swap in new art for a location, replace its picture and update its data here:
//   mapSpot    where the map marker stands for it on the village map (map pixels); the road,
//              one long picture, has mapLine instead: the marker follows the hero along it
//   solids     where the hero's feet cannot go
//   exits      area the feet step on, where it leads, and optionally `closed`, which returns
//              the lines to show while that way is shut (or null when it is open)
//   props      objects drawn as their own sprites, sorted with the characters by feet line
//   nightProps pictures laid over the location at night, with their top-left corner
//   scenery    people from a neighbouring location seen from here, just to look at
//   occluders  parts of the picture drawn over a hero walking behind them
//   lights     lamps and windows that glow at night
const LOCATIONS = {
  yard: {
    art: "locYard",
    backdrop: "#24452a",
    mapSpot: { x: 200, y: 110 },
    solids: [
      [0, 0, 568, 22], // trees along the top
      [0, 22, 52, 138], // trees left of the house
      [52, 22, 296, 148], // grandma's house
      [157, 132, 219, 159], // bench and buckets
      [294, 124, 314, 156], // rain barrel
      [296, 22, 379, 109], // cellar mound and walnut tree
      [379, 22, 436, 95], // woodpile
      [436, 22, 568, 96], // shed
      [0, 138, 129, 217], // apple tree
      [0, 217, 83, 284], [83, 254, 112, 284], // bushes along the west fence
      [83, 219, 124, 241], // chopping block
      [156, 217, 196, 246], // well ring
      [381, 139, 405, 159], // laundry basket
      [415, 96, 529, 182], // summer kitchen
      [529, 96, 568, 349], // east fence
      [281, 190, 289, 285], [289, 276, 396, 285], // the garden's low fences; its way in is at the top
      [396, 176, 533, 285], // beds beyond the potatoes
      [0, 284, 227, 349], [322, 284, 568, 349], // south fence, gate in the middle
      [227, 289, 322, 349], // beyond the gate
    ],
    exits: [
      { id: "toStreet", area: [254, 282, 281, 289], to: "street", spawn: { x: 732, y: 169 }, dir: "down" },
      {
        id: "toHouse",
        area: [237, 148, 265, 153],
        to: "house",
        spawn: { x: 186, y: 226 },
        dir: "up",
        closed: () => (quest.riding ? T().yard.noMopedInside : null),
      },
    ],
    props: [],
    occluders: [{ art: "occludeYardWell", x: 139, y: 166, baseY: 246 }],
    lights: [
      { x: 37, y: 108, radius: 52 },
      { x: 118, y: 116, radius: 26 },
      { x: 168, y: 116, radius: 26 },
      { x: 275, y: 112, radius: 26 },
    ],
  },

  house: {
    art: "locHouse",
    backdrop: "#1e1610",
    indoor: true,
    mapSpot: { x: 176, y: 100 },
    solids: [
      [0, 0, 384, 144], // back wall
      [0, 144, 40, 170], [0, 170, 30, 195], [0, 195, 20, 256], // left wall, which runs away at an angle
      [330, 144, 384, 170], [345, 170, 384, 195], [360, 195, 384, 256], // right wall
      [0, 217, 165, 256], [207, 217, 384, 256], // near wall, doorway in the middle
      [165, 238, 207, 256], // beyond the doorway
      [39, 150, 101, 190], // bed
      [118, 144, 142, 158], // TV on its cabinet
      [216, 144, 234, 158], // stove
      [289, 144, 311, 160], // fridge
      [234, 190, 266, 205], // table
      [222, 190, 234, 200], // chair
    ],
    exits: [{ id: "toYard", area: [170, 232, 202, 238], to: "yard", spawn: { x: 250, y: 176 }, dir: "down" }],
    props: [
      { art: "houseBed", x: 70, y: 190 },
      { art: "houseTv", x: 130, y: 158 },
      { art: "houseStove", x: 225, y: 158 },
      { art: "houseFridge", x: 300, y: 160 },
      { art: "houseTable", x: 250, y: 205 },
      { art: "houseChair", x: 228, y: 200 },
    ],
    occluders: [{ art: "occludeHouseDoor", x: 156, y: 196, baseY: 217 }],
    lights: [{ x: 250, y: 165, radius: 90 }, { x: 194, y: 60, radius: 40 }],
  },

  // Drawn by Codex in the approved style of the yard (incoming/loc_club_v2.png), scale 0.40.
  club: {
    art: "locClub",
    backdrop: "#24452a",
    mapSpot: { x: 450, y: 60 },
    solids: [
      [0, 0, 614, 150], // Будинок культури, the shed and the trees behind
      [0, 150, 95, 330], [95, 150, 118, 200], // the big tree on the left
      [118, 150, 240, 165], // lilac by the steps
      [100, 306, 114, 316], // street lamp
      [545, 150, 614, 340], [525, 245, 545, 315], // acacia and lilac on the right
      [163, 222, 218, 240], [428, 222, 480, 240], // benches
      [300, 262, 352, 297], // the monument's pedestal
      [0, 340, 280, 410], [335, 340, 614, 410], // fence, gate in the middle
      [280, 380, 284, 410], [331, 380, 335, 410], // the path's edges beyond the gate
    ],
    exits: [{ id: "toStreet", area: [284, 402, 331, 410], to: "street", spawn: { x: 1105, y: 169 }, dir: "down" }],
    props: [],
    occluders: [{ art: "occludeClubStatue", x: 300, y: 178, baseY: 297 }],
    lights: [
      { x: 341, y: 122, radius: 40 }, // the lamp over the door
      { x: 150, y: 175, radius: 48 }, // street lamp
    ],
  },

  // The designer's scene with the road cut off and a path added: the path comes up from the south
  // into the yard, with the shop set back to the north.
  shop: {
    art: "locShop",
    backdrop: "#24452a",
    mapSpot: { x: 650, y: 130 },
    solids: [
      [0, 0, 333, 126], // shop, shed and trees
      [0, 126, 9, 300], // left edge
      [36, 129, 68, 150], // the dog by the shop
      [0, 150, 53, 193], // lilac
      [0, 189, 81, 212], // fence
      [142, 119, 156, 138], // barrel
      [157, 119, 204, 138], // bench
      [159, 138, 232, 188], [239, 123, 296, 180], // tables, chairs and the umbrella
      [299, 133, 312, 147], // lamp post
      [296, 150, 327, 183], // beer sign
      [312, 80, 333, 212], // fence
      [0, 212, 156, 300], [188, 212, 333, 300], // grass either side of the path
    ],
    exits: [{ id: "toStreet", area: [156, 294, 188, 300], to: "street", spawn: { x: 1316, y: 169 }, dir: "down" }],
    props: [],
    // Drawn only at night: the shut door and the empty window.
    nightProps: [{ art: "shopClosed", x: 92, y: 79 }],
    occluders: [],
    lights: [{ x: 320, y: 50, radius: 62 }],
  },

  // Drawn by Codex in the approved style of the yard (incoming/loc_stop.png), scale 0.27.
  // The bus leaves the hero on the verge of the highway; the path north leads to the village road.
  stop: {
    art: "locStop",
    backdrop: "#24452a",
    mapSpot: { x: 655, y: 380 },
    solids: [
      [0, 0, 140, 30], [168, 0, 415, 30], // woods either side of the path
      [0, 30, 125, 60], [155, 30, 415, 60],
      [0, 60, 105, 100], [137, 60, 415, 88],
      [0, 100, 85, 150], // poplars on the left
      [128, 88, 180, 150], // elder bush
      [180, 95, 200, 162], [200, 95, 300, 147], [298, 95, 326, 162], // the shelter: side walls and back
      [312, 140, 332, 166], // bin
      [332, 88, 415, 150], // bushes on the right
      [348, 172, 358, 181], // the bus stop sign
      [340, 150, 366, 172], // grass right behind the sign: nobody stands hidden behind its pole
      [0, 150, 2, 212], [413, 150, 415, 212], // verge ends
      [0, 212, 415, 276], // the highway
    ],
    exits: [{ id: "toStreet", area: [140, 3, 168, 8], to: "street", spawn: { x: 1370, y: 241 }, dir: "up" }],
    props: [],
    occluders: [{ art: "occludeStopSign", x: 341, y: 76, baseY: 181 }],
    lights: [],
  },

  // Drawn by Codex in the approved style of the yard (incoming/loc_pond.png), scale 0.30.
  // Did Petro's bench stands right by the way in from the road; the boardwalk goes out over the water.
  pond: {
    art: "locPond",
    backdrop: "#24452a",
    mapSpot: { x: 170, y: 420 },
    solids: [
      [0, 0, 145, 60], [178, 0, 461, 50], // trees either side of the path in
      [195, 50, 290, 66], [290, 50, 380, 80], [380, 50, 461, 92], // shed and fence
      [0, 60, 112, 118], // the willow
      [134, 92, 166, 101], // Did Petro's bench
      [255, 70, 300, 118], // reeds
      [325, 100, 388, 128], // boat
      [388, 92, 461, 307], // reeds on the right
      // Water, with the boardwalk going out over it in steps.
      [0, 118, 205, 307], [240, 118, 461, 130],
      [205, 130, 222, 307], [258, 130, 461, 142],
      [222, 142, 240, 307], [278, 142, 461, 154],
      [240, 154, 258, 307], [296, 154, 461, 307],
      [258, 166, 296, 307],
    ],
    exits: [{ id: "toStreet", area: [148, 3, 172, 8], to: "street", spawn: { x: 415, y: 241 }, dir: "up" }],
    props: [],
    occluders: [],
    lights: [{ x: 432, y: 30, radius: 30 }],
  },

  // The road through the village: three approved pictures joined by tools/art/locations.py.
  // Every way starts here, and the gates of locked places are here.
  street: {
    art: "locStreet",
    backdrop: "#24452a",
    mapLine: { scale: 0.523, y: 285 },
    solids: [
      // North side: fences, with gaps at the gateways.
      [0, 0, 685, 160], [685, 0, 780, 153], [780, 0, 1039, 160], [1039, 0, 1171, 151],
      [1171, 0, 1304, 160], [1304, 0, 1327, 151], [1327, 0, 1463, 160],
      // South side: grass, the bench, and gaps for the paths.
      [0, 250, 404, 379], [404, 281, 426, 379], [426, 250, 1031, 379], [1031, 253, 1053, 379],
      [1053, 250, 1360, 379], [1360, 255, 1378, 379], [1378, 250, 1463, 379],
      [1397, 239, 1407, 250], // bus stop sign
    ],
    exits: [
      { id: "toYard", area: [697, 153, 768, 160], to: "yard", spawn: { x: 275, y: 274 }, dir: "up" },
      {
        id: "toClub",
        area: [1054, 151, 1156, 160],
        to: "club",
        spawn: { x: 307, y: 392 },
        dir: "up",
        closed: () => (isClubOpen() ? null : T().yard.clubClosed),
      },
      { id: "toShop", area: [1304, 151, 1327, 160], to: "shop", spawn: { x: 172, y: 284 }, dir: "up" },
      { id: "toPond", area: [404, 274, 426, 281], to: "pond", spawn: { x: 160, y: 14 }, dir: "down" },
      { id: "toStop", area: [1360, 250, 1378, 255], to: "stop", spawn: { x: 154, y: 14 }, dir: "down" },
      // Locked places: they open as the story goes on (see isPlaceUnlocked).
      { id: "lockedMykola", area: [113, 155, 143, 160], closed: () => lockedLines("mykola") },
      { id: "lockedLyuba", area: [317, 155, 346, 160], closed: () => lockedLines("lyuba") },
      { id: "lockedSvitka", area: [1031, 250, 1053, 256], closed: () => lockedLines("svitka") },
    ],
    props: [],
    // Did Petro on his bench by the road.
    scenery: [{ sprite: "grandpa", x: 359, y: 299, dayOnly: true }],
    occluders: [{ art: "occludeStreetSign", x: 1389, y: 218, baseY: 248 }],
    lights: [
      { x: 732, y: 142, radius: 36 },
      { x: 1105, y: 108, radius: 47 },
      { x: 1434, y: 52, radius: 60 },
    ],
  },
};

// Houses not used by the story yet. Shown on the map as closed; they open as the story goes on.
// box: their area on the village map, in map pixels.
const LOCKED_PLACES = {
  mykola: { box: [40, 145, 118, 232] },
  lyuba: { box: [163, 165, 262, 235] },
  svitka: { box: [345, 300, 522, 458] },
};

// Open places marked on the map, at map pixels.
const OPEN_PLACES = {
  yard: { x: 200, y: 50 },
  club: { x: 450, y: 28 },
  shop: { x: 660, y: 118 },
  stop: { x: 655, y: 372 },
  pond: { x: 170, y: 420 },
};

function isPlaceUnlocked(id) {
  return Boolean(quest.unlocked && quest.unlocked[id]);
}

function lockedLines(id) {
  return isPlaceUnlocked(id) ? null : [T().places.closedYet(T().places[id])];
}

// Grandma's potato beds.
const GARDEN_AREA = [289, 180, 396, 276];

function isInside(x, y, [left, top, right, bottom]) {
  return x >= left && x < right && y >= top && y < bottom;
}
