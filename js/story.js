const BEETLE_COUNT = 8;
const CHICKEN_COUNT = 3;
const CRATE_COUNT = 5;
const BEER_PRICE = 2;
const BEERS_NEEDED = 3;
// Money (docs/ECONOMY.md): daily work pays a little more than the story needs, so the player can
// also spend on beer, sweets for Svetka or, later, new clothes.
const JAR_REWARD = 2;
const JARS_PER_DAY = 2; // beetles crawl back from Mykola's plot every day, grandma pays for two jars
const UNLOAD_REWARD = 4; // the shop's truck comes every morning
const SPRAY_REWARD = 5;
// The catfish on the night way: Valya pays exactly this, and a new battery for the driver costs the same.
const CATFISH_PRICE = 100;
const BATTERY_PRICE = 100;
// Grandma stops the hand-picking after this many beetles and sends the hero for grandpa's sprayer.
const BEETLES_BEFORE_SPRAYER = 3;

// The summer lasts 92 days; each day has four parts. Story scenes may move the day forward to a
// later part, the player may choose to wait for the part a ready scene needs, but nothing ever goes
// back, and only sleeping starts the next day.
const SUMMER_DAYS = 92;
const PHASES = ["morning", "day", "evening", "night"];

// Grandma's errands, in order.
// "sprayer": she stopped the hand-picking; fetch grandpa Petro's sprayer from the pond.
// "spray": spray the potatoes with it. "evening" waits until the hero has met the lads at the club.
const GRANDMA_STAGES = ["arrive", "water", "beetles", "sprayer", "spray", "shop", "evening", "chickens", "moped", "done"];

function newQuest() {
  return {
    stage: "arrive",
    hasWater: false,
    beetlesCaught: 0,
    hasSprayer: false,
    sprayed: false,
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
    deliveries: 0,
    jarsToday: 0,
    // The cassette player with his tapes stays in the backpack until he takes it for the date.
    hasPlayer: false,
    // The catfish: worms for grandpa's rod; the driver's battery, the catfish itself, and the new battery.
    hasWorms: false,
    hasBattery: false,
    hasCatfish: false,
    hasNewBattery: false,
    carrying: false,
    metLads: false,
    beatings: 0,
    discoDone: false,
    grandpaLine: 0,
    statueLooks: 0,
    day: 1,
    time: "morning",
    unlocked: {},
    ateBorscht: false,
    ateVarenyky: false,
    newsWatched: 0,
    metGrandmaToday: false,
    foundBeer: false,
    bag: {},
    heroSaid: {},
    // How much each person trusts the hero, by name: grows and falls with what they hear about him.
    trust: {},
    // What the hero actually did, remembered for later scenes: who saw what is decided there.
    // svetkaSeen: "disco" once he noticed her; svetkaNamed: he knows her name;
    // svetkaMet: "disco" or "shop", where they first talked; dancedWithSvetka; svetkaDisco: "stayed",
    // "warned" or "left" (after the dance) or "lads" (stayed with the lads); wantsDate;
    // dateInvited: the day he asked her to the river; riverDate: "spoke" or "silent", how it went;
    // dateDay: the day of the date.
    // The catfish: catfishPlan "rod" (with grandpa) or "electro" (alone, with the driver's battery);
    // catfishWay: how it was really caught; rodDay: the night it was caught with grandpa; batteryStolen: the day he took the driver's battery;
    // catfishSold: Valya bought it; batteryReturned: he gave the driver a new one and kept quiet.
    // catfishHookTold, rodNewsTold, theftNewsTold: grandma has said her piece about each.
    deeds: {},
  };
}

const quest = newQuest();

function isNight() {
  return quest.time === "night";
}

function phaseIndex(phase) {
  return PHASES.indexOf(phase || quest.time);
}

// Moves to a later part of the same day. Never goes back and never starts a new day.
function advancePhase(phase) {
  if (phaseIndex(phase) > phaseIndex()) quest.time = phase;
}

function addTrust(who, amount) {
  quest.trust[who] = (quest.trust[who] || 0) + amount;
}

// A dialog line said by someone in particular, or narration (who: null).
function line(who, text) {
  return { who, text };
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

// The same, shown over a close-up picture.
function shown(picture, lines, next) {
  return { lines, next: next || null, picture };
}

// ---------- Grandma ----------

function talkToGrandma() {
  const text = T().grandma;
  if (quest.day > 1 && !quest.metGrandmaToday) {
    quest.metGrandmaToday = true;
    return say(morningNews());
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
      // Old saves may hold a full jar from before grandma stopped the hand-picking.
      if (quest.beetlesCaught < BEETLES_BEFORE_SPRAYER) return say([text.beetlesWait]);
      return say(stopPicking());

    case "sprayer":
      if (!quest.hasSprayer) return say([text.sprayerWait]);
      quest.stage = "spray";
      return say(text.sprayerBrought);

    case "spray":
      if (!quest.sprayed) return say([text.sprayWait]);
      quest.stage = "shop";
      quest.money += SPRAY_REWARD;
      return say(text.sprayDone);

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

// What grandma has to tell first thing in the morning: the village's news about the hero's doings.
function morningNews() {
  const text = T().grandma;
  const deeds = quest.deeds;
  if (deeds.catfishWay === "rod" && !deeds.rodNewsTold) {
    deeds.rodNewsTold = true;
    return text.morningRod;
  }
  if (deeds.batteryStolen && !deeds.theftNewsTold) {
    deeds.theftNewsTold = true;
    return text.morningTheft;
  }
  if (catfishHookReady() && !deeds.catfishHookTold) {
    deeds.catfishHookTold = true;
    return text.morningCatfish;
  }
  return text.morning;
}

// Grandma sees the hero picking beetles by hand and sends him to grandpa for the sprayer.
function stopPicking() {
  quest.stage = "sprayer";
  quest.beetlesCaught = 0;
  return T().grandma.stopPicking;
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
    quest.deliveries += 1;
    quest.money += UNLOAD_REWARD;
    return say([text.unloadDone]);
  }

  // A catfish is not sold over the counter in broad daylight.
  if (quest.hasCatfish) return say([text.catfishDay]);
  if (needsNewBattery()) {
    if (quest.money < BATTERY_PRICE) return say([text.batteryNoMoney], "shop");
    quest.money -= BATTERY_PRICE;
    quest.hasNewBattery = true;
    return say(text.batterySell);
  }

  if (quest.unload === "none" && stageReached("water")) {
    quest.unload = "working";
    return say(quest.deliveries > 0 ? text.unloadAgain : text.unloadAsk);
  }

  sellerCounter = "stock";
  return say([text.idle], "shop");
}

// What the shop sells. Art comes from the goods library, reference/shop_goods.png.
const SHOP_GOODS = [
  { id: "beer", art: "goodsBeer", price: BEER_PRICE },
  { id: "bread", art: "goodsBread", price: 1 },
  { id: "loaf", art: "goodsLoaf", price: 1 },
  { id: "noodles", art: "goodsNoodles", price: 1 },
  { id: "seeds", art: "goodsSeeds", price: 1 },
  { id: "matches", art: "goodsMatches", price: 1 },
  { id: "cigarettes", art: "goodsCigarettes", price: 2 },
  { id: "sugar", art: "goodsSugar", price: 3 },
  { id: "fish", art: "goodsFish", price: 3 },
  { id: "oil", art: "goodsOil", price: 4 },
  { id: "chocolate", art: "goodsChocolate", price: 4 },
  { id: "sausage", art: "goodsSausage", price: 6 },
];

// Beer is on offer only once the lads have asked for it, and until the hero has had enough.
function goodsOnOffer() {
  return SHOP_GOODS.filter((good) => good.id !== "beer" || (quest.metLads && quest.beersDrunk < BEERS_NEEDED));
}

function buyGood(id) {
  const text = T().valya;
  const good = SHOP_GOODS.find((g) => g.id === id);
  if (quest.money < good.price) {
    const jobHint = quest.unload === "done" ? "" : text.noMoneyJob;
    return [text.noMoney + jobHint, text.noCredit];
  }
  quest.money -= good.price;
  sellerCounter = id;
  if (id === "beer") {
    quest.beersDrunk += 1;
    return [quest.beersDrunk === 1 ? text.firstBeer : text.nextBeer, line(null, text.drink(quest.beersDrunk, BEERS_NEEDED))];
  }
  quest.bag[id] = (quest.bag[id] || 0) + 1;
  return [T().shop.sold[id]];
}

// The bag, as a line of text: "bread ×2, matches".
function bagLine() {
  return Object.entries(quest.bag).map(([id, count]) => T().shop.goods[id] + (count > 1 ? ` ×${count}` : "")).join(", ");
}

// ---------- Grandpa Petro ----------

// Grandpa lends his sprayer when grandma sends for it, and lets slip about the catfish under the
// boardwalk. Otherwise he shares life wisdom: a greeting once, then random sayings.
function talkToGrandpa() {
  const text = T().grandpa;
  const deeds = quest.deeds;
  const metBefore = quest.grandpaLine > 0;
  quest.grandpaLine = Math.max(quest.grandpaLine, 1);
  if (quest.stage === "sprayer" && !quest.hasSprayer) {
    quest.hasSprayer = true;
    deeds.heardCatfish = true;
    return say([metBefore ? text.sprayerKnown : text.sprayerStranger, ...text.sprayer]);
  }
  // After the date: grandpa tells how to take the catfish, and lets slip the other way.
  if (catfishHookReady() && !deeds.catfishPlan) return say(text.catfishTalk, "catfishChoice");
  if (deeds.catfishPlan === "rod" && !deeds.catfishWay) {
    if (!quest.hasWorms) return say([text.wormsWait]);
    if (!isNight()) return say(text.rodWait, "rodWait");
    return say(text.rodNight, "rodCatch");
  }
  if (!metBefore) return say([text.greeting]);
  const lines = deeds.catfishWay === "rod" ? [...text.lines, ...text.brag] : text.lines;
  return say([pickRandom("grandpa", lines)]);
}

// Grandpa sits by the pond by day, and stays out at night only for the catfish: waiting for it, and the
// rest of the night it was caught.
function isGrandpaAtPond() {
  const deeds = quest.deeds;
  return !isNight() || (deeds.catfishPlan === "rod" && (!deeds.catfishWay || deeds.rodDay === quest.day));
}

// ---------- Things in the yard ----------

// The backpack by the shed: first the tracksuit, then the player and the tapes.
function useBackpack() {
  if (quest.outfit !== "sport") {
    quest.outfit = "sport";
    return say(T().yard.backpackOpen);
  }
  if (!quest.hasPlayer) {
    quest.hasPlayer = true;
    return say(T().yard.takePlayer);
  }
  return say([T().yard.backpackEmpty]);
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

// At night the shop is shut, but Valya opens the service door for a catfish.
function useShopDoor() {
  if (quest.hasCatfish) return shown("catfishSale", sellCatfish());
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

// A new day, only after sleeping: tonight's food and news are back, and grandma has something to say.
function startNewDay() {
  quest.day = Math.min(SUMMER_DAYS, quest.day + 1);
  quest.time = "morning";
  quest.ateBorscht = false;
  quest.ateVarenyky = false;
  quest.newsWatched = 0;
  quest.metGrandmaToday = false;
  // Daily work comes back: new beetles on the potatoes, a new truck at the shop.
  quest.jarsToday = 0;
  if (quest.unload === "done") {
    quest.unload = "none";
    quest.cratesCarried = 0;
    quest.deliveries = Math.max(1, quest.deliveries); // saves from before deliveries were counted
  }
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
  if (quest.outfit !== "sport") missing.push(...text.noSuit);
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
  if (missing.length === 0) {
    // The disco is in the evening: the player may wait for it right here, the day stays the same.
    if (phaseIndex() < phaseIndex("evening")) return say(text.readyEarly, "waitEvening");
    return say(text.welcome, "disco");
  }

  const greeting = firstTime ? text.firstMeet : [text.again];
  return say([...greeting, ...whatLadsNotice(), ...missing, ...text.beforeBeating], "beaten");
}

// ---------- The first disco and Svetka ----------

// Inside, the hero notices a girl he does not know. Each function returns the lines to show.
function noticeSvetka() {
  quest.deeds.svetkaSeen = "disco";
  return T().disco.notice;
}

// He goes over and asks her to dance; Vovchik calls her by name, and he learns she is Svetka.
function discoApproach() {
  Object.assign(quest.deeds, { svetkaNamed: true, svetkaMet: "disco", dancedWithSvetka: true });
  return T().disco.approach;
}

// After the dance: "stayed" beside her, "warned" (remembers Tolik's words) or "left".
function discoAfterDance(choice) {
  Object.assign(quest.deeds, { svetkaDisco: choice, wantsDate: true });
  return T().disco.afterDance[choice];
}

// He keeps dancing with the lads; Sanya tells him who she is.
function discoStayWithLads() {
  Object.assign(quest.deeds, { svetkaNamed: true, svetkaDisco: "lads", dancedWithSvetka: false });
  return T().disco.withLads;
}

// From the next day Svetka comes by the shop, until the next part of the story takes her elsewhere.
function isSvetkaAround() {
  return quest.discoDone && quest.day > 1 && !isNight();
}

// By the shop: they talk, he asks her to the river (the choice is in game.js, "invite"), and on the
// evening he comes for her on the moped with his player.
function talkToSvetka() {
  const text = T().svetka;
  const deeds = quest.deeds;
  if (deeds.riverDate) return say([pickRandom("svetka", text.later)]);
  if (deeds.dateInvited) return dateMeeting();
  if (deeds.svetkaShopTalk) return say([text.askAgain], "invite");
  deeds.svetkaShopTalk = true;
  let lines;
  if (deeds.svetkaMet === "disco") {
    lines = text.afterDance;
  } else {
    // Saves from before the summer story may not know her name yet: she gives it herself.
    lines = deeds.svetkaNamed ? text.firstMeet : text.firstMeetStranger;
    Object.assign(deeds, { svetkaMet: "shop", svetkaNamed: true });
  }
  deeds.wantsDate = true;
  return say([...lines, ...text.dateIntent], "invite");
}

// He asks her to the river this evening, to listen to his tapes.
function inviteToRiver() {
  quest.deeds.dateInvited = quest.day;
  const text = T().svetka;
  return quest.hasPlayer ? text.invite : [...text.invite, text.playerAtHome];
}

// What still keeps them from going: "player" (in the backpack at grandma's), "moped" (not here),
// "evening" (too early), or null when they can go.
function dateMissing() {
  if (!quest.hasPlayer) return "player";
  if (!quest.riding && !(quest.mopedFound && quest.moped.location === currentLocation)) return "moped";
  if (phaseIndex() < phaseIndex("evening")) return "evening";
  return null;
}

function dateMeeting() {
  const text = T().svetka;
  const missing = dateMissing();
  if (missing === "player") return say(text.waitPlayer);
  if (missing === "moped") return say(text.waitMoped);
  if (missing === "evening") return say(text.waitEvening, "dateWait");
  return say(text.letsGo, "riverDate");
}

// On the bank he either says something or just listens with her ("spoke" or "silent").
function riverDate(choice) {
  quest.deeds.riverDate = choice;
  quest.deeds.dateDay = quest.day;
  const text = T().river;
  return [...text[choice], ...text.talk];
}

// ---------- The catfish (summer story, stage 2) ----------

// From the day after the date, grandpa wants to show the hero how to take the catfish.
function catfishHookReady() {
  return Boolean(quest.deeds.riverDate) && quest.day > (quest.deeds.dateDay || 0);
}

// The hero chooses: "rod" with grandpa, or "electro" alone at night with the driver's battery.
function chooseCatfish(way) {
  quest.deeds.catfishPlan = way;
  return way === "rod" ? T().catfish.rodChosen : T().catfish.electroChosen;
}

function needsWorms() {
  return quest.deeds.catfishPlan === "rod" && !quest.deeds.catfishWay && !quest.hasWorms;
}

function useWorms() {
  quest.hasWorms = true;
  return say(T().catfish.worms);
}

// Grandpa's way: a night on the boardwalk; he dozes off and misses the catfish again. No money, but
// grandpa tells the whole village, and people think better of the hero.
function catchWithRod() {
  advancePhase("night");
  quest.hasWorms = false;
  Object.assign(quest.deeds, { catfishWay: "rod", rodDay: quest.day });
  ["grandpa", "grandma", "valya", "lads", "driver"].forEach((who) => addTrust(who, who === "grandpa" ? 2 : 1));
  return T().catfish.rodCatch;
}

// The driver's car on the road: "closed", or "empty" (bonnet up, no battery) from the morning after
// the theft until the hero brings a new battery.
function carState() {
  const deeds = quest.deeds;
  return deeds.batteryStolen && quest.day > deeds.batteryStolen && !deeds.batteryReturned ? "empty" : "closed";
}

function useCar() {
  const text = T().catfish;
  const deeds = quest.deeds;
  if (carState() === "empty") return say(text.carEmpty);
  if (deeds.catfishPlan === "electro" && !deeds.catfishWay && !quest.hasBattery && !quest.hasCatfish) {
    if (!isNight()) return say(text.carNotNow, "carWait");
    quest.hasBattery = true;
    deeds.batteryStolen = quest.day;
    return say(text.carTake);
  }
  return say(text.carLook);
}

// The night way: the battery on the boardwalk, a flash, the catfish; the battery goes into the pond.
function useBoardwalk() {
  const text = T().catfish;
  if (quest.deeds.catfishPlan === "electro" && quest.hasBattery && !quest.deeds.catfishWay) {
    if (!isNight()) return say(text.boardwalkDay, "boardwalkWait");
    quest.hasBattery = false;
    quest.hasCatfish = true;
    return shown("catfishNight", text.electroCatch);
  }
  return say(text.boardwalk);
}

function sellCatfish() {
  quest.hasCatfish = false;
  quest.money += CATFISH_PRICE;
  Object.assign(quest.deeds, { catfishWay: "electro", catfishSold: true });
  return T().catfish.sale;
}

function needsNewBattery() {
  const deeds = quest.deeds;
  return Boolean(deeds.batteryStolen) && quest.day > deeds.batteryStolen && !deeds.batteryReturned && !quest.hasNewBattery;
}

// The driver by his car. He gets the new battery, never learns who took the old one, and says
// at length what he would do to the thief.
function talkToDriver() {
  const text = T().driver;
  const deeds = quest.deeds;
  if (quest.hasNewBattery) {
    quest.hasNewBattery = false;
    deeds.batteryReturned = true;
    addTrust("driver", 1);
    return shown("batteryRant", text.rant);
  }
  if (carState() === "empty") return say(text.robbed);
  if (deeds.batteryReturned) return say([pickRandom("driver", text.after)]);
  return say([pickRandom("driver", text.idle)]);
}

// The catfish task that can be done right now, at night; null when there is none.
function catfishNightTask() {
  const deeds = quest.deeds;
  if (quest.hasCatfish) return T().objective.sellCatfish;
  if (!catfishHookReady() || !deeds.catfishPlan || deeds.catfishWay) return null;
  if (deeds.catfishPlan === "rod") return quest.hasWorms ? T().objective.rodNight : null;
  return catfishObjective();
}

function catfishObjective() {
  const text = T().objective;
  const deeds = quest.deeds;
  if (!catfishHookReady()) return text.afterDate;
  if (!deeds.catfishPlan) return text.catfishGrandpa;
  if (quest.hasCatfish) return text.sellCatfish;
  if (!deeds.catfishWay) {
    if (deeds.catfishPlan === "rod") return quest.hasWorms ? text.rodNight : text.worms;
    return quest.hasBattery ? text.electroNight : text.battery;
  }
  if (deeds.batteryStolen && quest.day > deeds.batteryStolen && !deeds.batteryReturned) {
    return quest.hasNewBattery ? text.giveBattery : text.buyBattery;
  }
  return text.afterCatfish;
}

// ---------- Objective text ----------

// The club square opens after grandma's first errand.
function isClubOpen() {
  return stageReached("beetles");
}

function needsWater() {
  return quest.stage === "water" && !quest.hasWater;
}

// Called when a jar is full. Jars come after the spraying: beetles crawl over from the neighbours,
// JARS_PER_DAY a day.
function finishBeetleJar() {
  quest.money += JAR_REWARD;
  quest.jarsToday += 1;
  const text = T().yard;
  return quest.jarsToday < JARS_PER_DAY ? [text.jarMore] : [text.jarMore, text.jarsDone];
}

// What the potato beds offer now: "pick" beetles by hand, "spray" them, or null.
function gardenJob() {
  if (quest.stage === "beetles") return "pick";
  if (quest.stage === "spray") return quest.sprayed ? null : "spray";
  return stageReached("shop") && quest.jarsToday < JARS_PER_DAY ? "pick" : null;
}

function canCollectBeetles() {
  return gardenJob() !== null;
}

// Grandma stops the hand-picking once she sees it: true when this catch is the one.
function grandmaStopsPicking(caught) {
  return quest.stage === "beetles" && caught >= BEETLES_BEFORE_SPRAYER;
}

function sprayPotatoes() {
  quest.sprayed = true;
  quest.hasSprayer = false;
  // Spraying the whole plot takes the rest of the morning.
  advancePhase("day");
  return T().yard.spray;
}

function currentObjective() {
  const text = T().objective;
  if (isNight() && quest.discoDone) {
    const task = catfishNightTask();
    if (task) return task;
    return currentLocation === "house" ? text.goToBed : text.goHome;
  }
  if (quest.day > 1) {
    const deeds = quest.deeds;
    if (!quest.metGrandmaToday) return text.morning;
    if (!deeds.svetkaShopTalk) return deeds.svetkaMet === "disco" ? text.findSvetka : text.meetSvetka;
    if (deeds.riverDate) return catfishObjective();
    if (!deeds.dateInvited) return text.dateNext;
    if (!quest.hasPlayer) return text.datePlayer;
    return phaseIndex() < phaseIndex("evening") ? text.dateEvening : text.dateGo;
  }
  if (quest.discoDone) return text.goHome;
  if (quest.carrying) return text.carryCrate;
  switch (quest.stage) {
    case "arrive":
      return text.arrive;
    case "water":
      return quest.hasWater ? text.waterDone : text.water;
    case "beetles":
      return quest.beetlesCaught < BEETLES_BEFORE_SPRAYER ? text.beetles : text.beetlesDone;
    case "sprayer":
      return quest.hasSprayer ? text.sprayerBack : text.sprayer;
    case "spray":
      return quest.sprayed ? text.sprayedTell : text.spray;
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
