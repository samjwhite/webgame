// The village is a set of separate full-screen locations joined by paths.
// Coordinates are game pixels of the location's picture. Rectangles: [left, top, right, bottom].
//
// To swap in new art for a location, replace its picture and update its data here:
//   mapOrigin  where its picture sits on the village map (map pixels), for the map marker
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
    mapOrigin: { x: 96, y: 0 },
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
      [281, 190, 289, 285], // the garden's low fence; its way in is at the top
      [396, 176, 533, 285], // beds beyond the potatoes
      [0, 284, 227, 349], [322, 284, 568, 349], // south fence, gate in the middle
      [227, 289, 322, 349], // beyond the gate
    ],
    exits: [
      { id: "toStreet", area: [254, 282, 297, 289], to: "street", spawn: { x: 732, y: 169 }, dir: "down" },
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
    mapOrigin: { x: 96, y: 0 },
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

  club: {
    art: "locClub",
    backdrop: "#24452a",
    mapOrigin: { x: 340, y: 30 },
    solids: [
      [0, 0, 286, 142], // Будинок культури
      [0, 142, 62, 302], [254, 142, 286, 302], // trees on both sides of the square
      [120, 211, 195, 255], // flower bed with the statue
      [66, 202, 101, 226], [214, 202, 248, 226], // benches
      [0, 273, 127, 302], [185, 273, 286, 302], // fence, gap for the gate
    ],
    exits: [{ id: "toStreet", area: [127, 296, 185, 302], to: "street", spawn: { x: 1105, y: 169 }, dir: "down" }],
    props: [],
    occluders: [{ art: "occludeClubStatue", x: 144, y: 156, baseY: 211 }],
    lights: [
      { x: 162, y: 114, radius: 58 },
      { x: 75, y: 107, radius: 29 },
      { x: 252, y: 107, radius: 29 },
    ],
  },

  // The designer's scene with the road cut off and a path added: the path comes up from the south
  // into the yard, with the shop set back to the north.
  shop: {
    art: "locShop",
    backdrop: "#24452a",
    mapOrigin: { x: 565, y: 49 },
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

  stop: {
    art: "locStop",
    backdrop: "#24452a",
    mapOrigin: { x: 535, y: 296 },
    solids: [
      [0, 5, 3, 194], // left edge
      [29, 5, 303, 12], // top edge
      [32, 12, 98, 77], // tree
      [101, 31, 214, 86], // the shelter
      [221, 64, 237, 82], // the sign
      [240, 12, 303, 90], // tree on the right
      [26, 135, 303, 194], // bushes in the south
      [0, 188, 26, 194], // the path south leads nowhere yet
    ],
    exits: [{ id: "toStreet", area: [3, 5, 29, 9], to: "street", spawn: { x: 1370, y: 241 }, dir: "up" }],
    props: [],
    occluders: [],
    lights: [{ x: 158, y: 64, radius: 46 }],
  },

  pond: {
    art: "locPond",
    backdrop: "#24452a",
    mapOrigin: { x: 0, y: 296 },
    solids: [
      [0, 5, 176, 70], // willow, trees and fence on the left
      [176, 5, 194, 44], // trees
      [194, 5, 229, 38], // bench
      [242, 5, 422, 46], // trees and bushes above the path
      [0, 70, 218, 281], // reeds and water west of the pier
      [260, 70, 280, 103], [218, 103, 246, 281], [246, 129, 280, 281], // water around the pier
      [280, 46, 422, 281], // reeds and bushes in the east: the way to Svetka's goes from the road
    ],
    exits: [{ id: "toStreet", area: [229, 5, 242, 10], to: "street", spawn: { x: 415, y: 241 }, dir: "up" }],
    props: [],
    occluders: [],
    lights: [{ x: 235, y: 40, radius: 52 }],
  },

  // The road through the village: three approved pictures joined by tools/art/locations.py.
  // Every way starts here, and the gates of locked places are here.
  street: {
    art: "locStreet",
    backdrop: "#24452a",
    mapOrigin: { x: 0, y: 160 },
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
        spawn: { x: 156, y: 286 },
        dir: "up",
        closed: () => (isClubOpen() ? null : T().yard.clubClosed),
      },
      { id: "toShop", area: [1304, 151, 1327, 160], to: "shop", spawn: { x: 172, y: 284 }, dir: "up" },
      { id: "toPond", area: [404, 274, 426, 281], to: "pond", spawn: { x: 235, y: 16 }, dir: "down" },
      { id: "toStop", area: [1360, 250, 1378, 255], to: "stop", spawn: { x: 16, y: 16 }, dir: "down" },
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
const GARDEN_AREA = [289, 180, 396, 285];

function isInside(x, y, [left, top, right, bottom]) {
  return x >= left && x < right && y >= top && y < bottom;
}
