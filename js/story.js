const BEETLE_COUNT = 8;
const CHICKEN_COUNT = 3;
const CRATE_COUNT = 5;
const BEER_PRICE = 2;
const BEERS_NEEDED = 3;
const JAR_REWARD = 2;
const UNLOAD_REWARD = 4;

// Grandma's errands, in order.
// "evening" waits until the hero has met the lads at the club and got their list.
const GRANDMA_STAGES = ["arrive", "water", "beetles", "shop", "evening", "chickens", "moped", "done"];

function newQuest() {
  return {
    stage: "arrive",
    hasWater: false,
    beetlesCaught: 0,
    hasGroceries: false,
    chickensHerded: 0,
    money: 0,
    backpackShown: false,
    outfit: "city",
    beersDrunk: 0,
    mopedFound: false,
    mopedRidden: false,
    riding: false,
    arrivedOnMoped: false,
    moped: { location: "yard", x: 400, y: 128 },
    unload: "none",
    cratesCarried: 0,
    carrying: false,
    metLads: false,
    beatings: 0,
    discoDone: false,
    grandpaLine: 0,
    statueLooks: 0,
    day: 1,
    time: "day",
    unlocked: {},
    ateBorscht: false,
    ateVarenyky: false,
    newsWatched: 0,
    metGrandmaToday: false,
    foundBeer: false,
    heroSaid: {},
  };
}

const quest = newQuest();

function isNight() {
  return quest.time === "night";
}

function stageReached(stage) {
  return GRANDMA_STAGES.indexOf(quest.stage) >= GRANDMA_STAGES.indexOf(stage);
}

// Dialog text comes from js/text/<language>.js through T().

// Small talk that does not move a quest is picked at random, never the same line twice in a row.
const lastPicked = {};

function pickRandom(name, lines) {
  let index = Math.floor(Math.random() * lines.length);
  if (lines.length > 1 && index === lastPicked[name]) index = (index + 1) % lines.length;
  lastPicked[name] = index;
  return lines[index];
}

// Each talk returns { lines, next }. `next` names what happens after the dialog (see game.js).
function say(lines, next) {
  return { lines, next: next || null };
}

// ---------- Grandma ----------

function talkToGrandma() {
  const text = T().grandma;
  if (quest.day > 1 && !quest.metGrandmaToday) {
    quest.metGrandmaToday = true;
    return say(text.morning);
  }
  switch (quest.stage) {
    case "arrive":
      quest.stage = "water";
      return say(text.arrive);

    case "water":
      if (!quest.hasWater) return say([text.waterWait]);
      quest.stage = "beetles";
      return say(text.waterDone);

    case "beetles":
      if (quest.beetlesCaught < BEETLE_COUNT) return say([text.beetlesWait]);
      quest.stage = "shop";
      quest.money += 5;
      return say(text.beetlesDone);

    case "shop":
      if (!quest.hasGroceries) return say([text.shopWait]);
      quest.stage = "evening";
      return say(text.shopDone);

    case "evening":
      if (!quest.metLads) return say([text.eveningWait]);
      quest.stage = "chickens";
      return say(text.eveningDone);

    case "chickens":
      return say([text.chickens(CHICKEN_COUNT - quest.chickensHerded)]);

    case "moped":
      quest.stage = "done";
      return say(text.moped);

    default:
      return say([grandmaChatter()]);
  }
}

function grandmaChatter() {
  if (quest.metLads && quest.outfit !== "sport") return tracksuitHint();
  const lines = [...T().grandma.chatter];
  if (quest.beersDrunk > 0) lines.push(T().grandma.beerSmell);
  return pickRandom("grandma", lines);
}

// The backpack with the tracksuit appears by the shed only once grandma mentions it.
function tracksuitHint() {
  quest.backpackShown = true;
  return T().grandma.tracksuit;
}

function wakeUpLines() {
  const text = T().grandma;
  const lines = [...(quest.beatings === 1 ? text.wakeFirst : text.wakeAgain)];
  if (quest.outfit !== "sport") lines.push(tracksuitHint());
  return lines;
}

// ---------- Valya, the shop ----------

// What is on the counter while the seller talks: a name from COUNTER_GOODS, or null.
let sellerCounter = null;

function talkToValya() {
  const text = T().valya;
  sellerCounter = null;
  if (quest.stage === "shop" && !quest.hasGroceries) {
    quest.hasGroceries = true;
    quest.money -= 5;
    sellerCounter = "groceries";
    return say(text.groceries);
  }

  if (quest.unload === "working") {
    if (!quest.carrying) return say([text.waitingForCrate]);
    quest.carrying = false;
    quest.cratesCarried += 1;
    if (quest.cratesCarried < CRATE_COUNT) return say([text.crateIn(CRATE_COUNT - quest.cratesCarried)]);
    quest.unload = "done";
    quest.money += UNLOAD_REWARD;
    return say([text.unloadDone]);
  }

  if (quest.unload === "none" && stageReached("water")) {
    quest.unload = "working";
    return say(text.unloadAsk);
  }

  if (quest.metLads && quest.beersDrunk < BEERS_NEEDED) return sellBeer();

  sellerCounter = "stock";
  return say([text.idle]);
}

function sellBeer() {
  const text = T().valya;
  if (quest.money < BEER_PRICE) {
    const jobHint = quest.unload === "done" ? "" : text.noMoneyJob;
    return say([text.noMoney + jobHint, text.noCredit]);
  }
  quest.money -= BEER_PRICE;
  quest.beersDrunk += 1;
  sellerCounter = "beer";
  return say([
    quest.beersDrunk === 1 ? text.firstBeer : text.nextBeer,
    text.drink(quest.beersDrunk, BEERS_NEEDED),
  ]);
}

// ---------- Grandpa Petro ----------

// For now grandpa only shares life wisdom: a greeting once, then random sayings.
function talkToGrandpa() {
  if (quest.grandpaLine === 0) {
    quest.grandpaLine = 1;
    return say([T().grandpa.greeting]);
  }
  return say([pickRandom("grandpa", T().grandpa.lines)]);
}

// ---------- Things in the yard ----------

function useBackpack() {
  if (quest.outfit === "sport") return say([T().yard.backpackEmpty]);
  quest.outfit = "sport";
  return say(T().yard.backpackOpen);
}

function useShed() {
  if (quest.stage === "chickens") return say([T().yard.shedChickens]);
  return say([T().yard.shedLocked]);
}

function shedFoundLines() {
  return T().yard.shedFound;
}

function useMoped() {
  quest.riding = true;
  if (quest.mopedRidden) return say([T().yard.mopedAgain]);
  quest.mopedRidden = true;
  return say(T().yard.mopedStart, "ride");
}

// The first look tells the statue's story, later looks pick one of the other remarks.
function useStatue() {
  const lines = T().yard.statue;
  const first = quest.statueLooks === 0;
  quest.statueLooks += 1;
  if (first) return say(lines[0]);
  return say(pickRandom("statue", lines.slice(1)));
}

function useShopDoor() {
  return say(T().yard.shopClosed);
}

// ---------- Inside grandma's house ----------

function useBed() {
  if (!isNight() || !quest.discoDone) return say([T().house.bedDay]);
  return say(T().house.bedNight, "sleep");
}

// The evening news comes on at night; each bulletin is told once, then it is over.
function useTv() {
  const text = T().house;
  if (!isNight()) return say([text.tvDay]);
  const bulletin = T().tsn[quest.newsWatched];
  if (!bulletin) return say([text.tvOver]);
  quest.newsWatched += 1;
  return say(bulletin, "tv");
}

function useBorscht() {
  const text = T().house;
  if (quest.ateBorscht) return say([text.borschtDone]);
  quest.ateBorscht = true;
  return say(text.borscht);
}

function useVarenyky() {
  quest.ateVarenyky = true;
  return say(T().house.varenyky);
}

function useFridge() {
  return say(T().house.fridge, "fridge");
}

// A new day: tonight's food and news are back, and grandma has something to say.
function startNewDay() {
  quest.day += 1;
  quest.time = "day";
  quest.ateBorscht = false;
  quest.ateVarenyky = false;
  quest.newsWatched = 0;
  quest.metGrandmaToday = false;
}

// Someone left a bottle on the table: it counts once the lads have asked for beer.
function canFindBeer() {
  return quest.metLads && !quest.foundBeer && quest.beersDrunk < BEERS_NEEDED && !quest.discoDone && !isNight();
}

function useBeerBottle() {
  quest.foundBeer = true;
  quest.beersDrunk += 1;
  return say([...T().hero.foundBeer, T().hero.drank(quest.beersDrunk, BEERS_NEEDED)], "speak");
}

function useTruck() {
  if (quest.carrying) return say([T().yard.handsFull]);
  quest.carrying = true;
  return say([T().yard.takeCrate(quest.cratesCarried + 1, CRATE_COUNT)]);
}

// ---------- The lads at the club ----------

function missingForDisco() {
  const text = T().lads;
  const missing = [];
  if (quest.outfit !== "sport") missing.push(text.noSuit);
  if (quest.beersDrunk === 0) missing.push(text.sober);
  else if (quest.beersDrunk < BEERS_NEEDED) missing.push(text.weakBeer);
  if (!quest.arrivedOnMoped) missing.push(text.onFoot);
  return missing;
}

// The lads comment on what the hero already got right.
function whatLadsNotice() {
  const text = T().lads;
  const lines = [];
  if (quest.outfit === "sport") lines.push(text.noticeSuit);
  if (quest.beersDrunk >= BEERS_NEEDED) lines.push(text.noticeBeer);
  if (quest.arrivedOnMoped) lines.push(text.noticeMoped);
  return lines;
}

function talkToLads() {
  const text = T().lads;
  // After the disco the lads treat you as one of their own and just chat.
  if (quest.discoDone) return say([pickRandom("lads", text.friends)]);

  const missing = missingForDisco();
  const firstTime = !quest.metLads;
  quest.metLads = true;
  if (missing.length === 0) return say(text.welcome, "disco");

  const greeting = firstTime ? text.firstMeet : [text.again];
  return say([...greeting, ...whatLadsNotice(), ...missing, ...text.beforeBeating], "beaten");
}

// ---------- Objective text ----------

// The club square opens after grandma's first errand.
function isClubOpen() {
  return stageReached("beetles");
}

function needsWater() {
  return quest.stage === "water" && !quest.hasWater;
}

// Called when a jar is full. The first jar is grandma's errand, later jars earn money.
function finishBeetleJar() {
  if (quest.stage === "beetles") {
    quest.beetlesCaught = BEETLE_COUNT;
    return T().yard.jarFirst;
  }
  quest.money += JAR_REWARD;
  return T().yard.jarMore;
}

function canCollectBeetles() {
  if (quest.stage === "beetles") return quest.beetlesCaught < BEETLE_COUNT;
  return stageReached("shop");
}

function currentObjective() {
  const text = T().objective;
  if (isNight() && quest.discoDone) return currentLocation === "house" ? text.goToBed : text.goHome;
  if (quest.day > 1) return quest.metGrandmaToday ? text.morningLater : text.morning;
  if (quest.discoDone) return text.goHome;
  if (quest.carrying) return text.carryCrate;
  switch (quest.stage) {
    case "arrive":
      return text.arrive;
    case "water":
      return quest.hasWater ? text.waterDone : text.water;
    case "beetles":
      return quest.beetlesCaught < BEETLE_COUNT ? text.beetles : text.beetlesDone;
    case "shop":
      return quest.hasGroceries ? text.shopDone : text.shop;
    case "evening":
      return quest.metLads ? text.eveningMetLads : text.evening;
    case "chickens":
      return text.chickens(quest.chickensHerded, CHICKEN_COUNT);
    case "moped":
      return text.moped;
    default:
      return quest.metLads ? text.disco : text.evening;
  }
}
