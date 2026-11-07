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
      [0, 0, 660, 26], // trees along the top
      [0, 26, 60, 160], // trees left of the house
      [60, 26, 344, 172], // grandma's house
      [183, 153, 254, 185], // bench and buckets
      [342, 144, 365, 181], // rain barrel
      [344, 26, 440, 127], // cellar mound and walnut tree
      [440, 26, 507, 110], // woodpile
      [507, 26, 660, 112], // shed
      [0, 160, 150, 252], // apple tree
      [0, 252, 97, 330], [97, 295, 130, 330], // bushes along the west fence
      [97, 254, 144, 280], // chopping block
      [181, 252, 228, 286], // well ring
      [378, 188, 384, 196], // washing line post
      [443, 161, 471, 185], // laundry basket
      [482, 112, 615, 211], // summer kitchen
      [615, 112, 660, 406], // east fence
      [327, 205, 620, 331], // vegetable garden, fenced off
      [0, 330, 264, 406], [374, 330, 660, 406], // south fence, gate in the middle
      [264, 336, 374, 406], // beyond the gate
    ],
    exits: [
      { id: "toStreet", area: [295, 328, 345, 336], to: "street", spawn: { x: 406, y: 55 }, dir: "down" },
      {
        id: "toHouse",
        area: [275, 172, 308, 178],
        to: "house",
        spawn: { x: 130, y: 268 },
        dir: "up",
        closed: () => (quest.riding ? T().yard.noMopedInside : null),
      },
    ],
    props: [],
    occluders: [{ art: "occludeYardWell", x: 161, y: 193, baseY: 286 }],
    lights: [
      { x: 43, y: 125, radius: 60 },
      { x: 137, y: 135, radius: 30 },
      { x: 195, y: 135, radius: 30 },
      { x: 320, y: 130, radius: 30 },
    ],
  },

  house: {
    art: "locHouse",
    backdrop: "#1e1610",
    indoor: true,
    mapOrigin: { x: 96, y: 0 },
    mapSpot: { x: 176, y: 100 },
    solids: [
      [0, 0, 260, 78], // back wall
      [0, 78, 4, 285], [256, 78, 260, 285], // side walls
      [0, 280, 108, 285], [152, 280, 260, 285], // bottom wall, doorway in the middle
      [10, 78, 72, 112], // bed
      [88, 78, 118, 108], // TV on its cabinet
      [150, 78, 178, 106], // stove
      [205, 78, 229, 116], // fridge
      [150, 165, 200, 184], // table
    ],
    exits: [{ id: "toYard", area: [108, 279, 152, 285], to: "yard", spawn: { x: 291, y: 205 }, dir: "down" }],
    props: [
      { art: "houseBed", x: 41, y: 112 },
      { art: "houseTv", x: 103, y: 108 },
      { art: "houseStove", x: 164, y: 106 },
      { art: "houseFridge", x: 217, y: 116 },
      { art: "houseTable", x: 175, y: 184 },
    ],
    occluders: [],
    lights: [{ x: 175, y: 150, radius: 110 }],
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
    exits: [{ id: "toStreet", area: [127, 296, 185, 302], to: "street", spawn: { x: 598, y: 118 }, dir: "down" }],
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
      [0, 0, 376, 142], // shop, shed and trees
      [0, 142, 10, 300], // left edge
      [41, 146, 77, 169], // the dog by the shop
      [0, 169, 60, 218], // lilac
      [0, 213, 92, 240], // fence
      [161, 135, 176, 156], // barrel
      [178, 135, 230, 156], // bench
      [180, 156, 262, 212], [270, 139, 334, 203], // tables, chairs and the umbrella
      [338, 150, 353, 166], // lamp post
      [334, 170, 369, 207], // beer sign
      [352, 90, 376, 240], // fence
      [0, 240, 150, 300], [190, 240, 376, 300], // grass either side of the path
    ],
    exits: [{ id: "toStreet", area: [150, 294, 190, 300], to: "street", spawn: { x: 764, y: 112 }, dir: "down" }],
    props: [],
    // Drawn only at night: the shut door and the empty window.
    nightProps: [{ art: "shopClosed", x: 104, y: 90 }],
    occluders: [],
    lights: [{ x: 361, y: 57, radius: 70 }],
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
    exits: [{ id: "toStreet", area: [3, 5, 29, 9], to: "street", spawn: { x: 712, y: 183 }, dir: "up" }],
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
    exits: [{ id: "toStreet", area: [229, 5, 242, 10], to: "street", spawn: { x: 235, y: 180 }, dir: "up" }],
    props: [],
    occluders: [],
    lights: [{ x: 235, y: 40, radius: 52 }],
  },

  // The road through the village. Every path starts here, and the gates of locked places are here.
  street: {
    art: "locStreet",
    backdrop: "#24452a",
    mapOrigin: { x: 0, y: 160 },
    solids: [
      [0, 46, 153, 122], [153, 46, 176, 108], [176, 46, 390, 122], // west fences, Mykola's gate at 235-270
      [422, 46, 572, 122], [572, 46, 624, 108], [624, 46, 748, 122], // around the club gate
      [780, 46, 998, 122], // fence below the shop
      [0, 191, 229, 234], [242, 191, 390, 234], [422, 191, 699, 234], [725, 191, 998, 234], // south side, paths between
      [381, 222, 390, 234], [672, 222, 682, 234], // power poles
    ],
    exits: [
      { id: "toYard", area: [390, 46, 422, 49], to: "yard", spawn: { x: 320, y: 318 }, dir: "up" },
      {
        id: "toClub",
        area: [572, 108, 624, 113],
        to: "club",
        spawn: { x: 156, y: 286 },
        dir: "up",
        closed: () => (isClubOpen() ? null : T().yard.clubClosed),
      },
      { id: "toShop", area: [748, 100, 780, 106], to: "shop", spawn: { x: 170, y: 284 }, dir: "up" },
      { id: "toPond", area: [229, 228, 242, 234], to: "pond", spawn: { x: 235, y: 16 }, dir: "down" },
      { id: "toStop", area: [699, 230, 725, 234], to: "stop", spawn: { x: 16, y: 16 }, dir: "down" },
      // Locked places: they open as the story goes on (see isPlaceUnlocked).
      { id: "lockedMykola", area: [153, 108, 176, 113], closed: () => lockedLines("mykola") },
      { id: "lockedLyuba", area: [260, 118, 292, 122], closed: () => lockedLines("lyuba") },
      { id: "lockedSvitka", area: [390, 230, 423, 234], closed: () => lockedLines("svitka") },
    ],
    props: [],
    // Grandpa on his bench can be seen from the road, down the path to the pond.
    scenery: [{ sprite: "grandpa", x: 212, y: 227, dayOnly: true }],
    occluders: [
      { art: "occludeStreetPole1", x: 378, y: 156, baseY: 233 },
      { art: "occludeStreetPole2", x: 671, y: 157, baseY: 233 },
    ],
    lights: [
      { x: 359, y: 72, radius: 58 },
      { x: 386, y: 160, radius: 58 },
      { x: 677, y: 160, radius: 58 },
      { x: 934, y: 72, radius: 58 },
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
const GARDEN_AREA = [327, 205, 460, 331];

function isInside(x, y, [left, top, right, bottom]) {
  return x >= left && x < right && y >= top && y < bottom;
}
