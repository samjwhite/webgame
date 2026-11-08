// Developer panel: open the game with ?dev in the address to jump to any point of the story.
// Nothing here runs for players. The automated tests check that every checkpoint stays usable.
//
// Each checkpoint names the quest state that differs from a new game and where the hero stands.
const DEV_YARD = { location: "yard", x: 240, y: 205 };
const DEV_READY_FOR_CLUB = { stage: "done", hasGroceries: true, sprayed: true, metLads: true, mopedFound: true, mopedRidden: true, outfit: "sport", beersDrunk: BEERS_NEEDED, time: "day" };
const DEV_CLUB = { location: "club", x: 270, y: 225 };
const DEV_SHOP = { location: "shop", x: 120, y: 165 };
const DEV_BY_SVETKA = { location: "shop", x: 240, y: 205 };
// After the first disco, by the two ways the hero learned who Svetka is.
const DEV_LADS_BRANCH = { svetkaSeen: "disco", svetkaNamed: true, svetkaDisco: "lads", dancedWithSvetka: false };
const DEV_DANCE_BRANCH = { svetkaSeen: "disco", svetkaNamed: true, svetkaMet: "disco", dancedWithSvetka: true, svetkaDisco: "stayed", wantsDate: true };
const DEV_DAY_TWO = { ...DEV_READY_FOR_CLUB, discoDone: true, day: 2, time: "morning", heroSaid: { shop: true } };
// He has talked with Svetka by the shop and asked her to the river tonight.
const DEV_INVITED = { ...DEV_DANCE_BRANCH, svetkaShopTalk: true, dateInvited: 2 };
// The morning after the date: grandma has sent him to grandpa about the catfish.
const DEV_AFTER_DATE = { ...DEV_INVITED, riverDate: "silent", dateDay: 2, catfishHookTold: true };
const DEV_DAY_THREE = { ...DEV_DAY_TWO, day: 3, time: "day", metGrandmaToday: true, hasPlayer: true, deeds: DEV_AFTER_DATE };
const DEV_POND = { location: "pond", x: 172, y: 96 };
const DEV_ROD = { ...DEV_AFTER_DATE, catfishPlan: "rod" };
const DEV_ELECTRO = { ...DEV_AFTER_DATE, catfishPlan: "electro" };
// Stage 3: the catfish caught with grandpa, the village has heard.
const DEV_CATFISH_DONE = { ...DEV_ROD, catfishWay: "rod", rodDay: 3, rodNewsTold: true };
const DEV_DAY_FOUR = { ...DEV_DAY_THREE, day: 4, deeds: DEV_CATFISH_DONE };
const DEV_PIGLETS = { ...DEV_CATFISH_DONE, pigletAsked: 4 };
const DEV_TOOL = { ...DEV_PIGLETS, pigletMoney: true, playerSoldTo: "valya", toolAsked: true };
const DEV_MYKOLA_YARD = { location: "mykola", x: 270, y: 190 };

const DEV_CHECKPOINTS = [
  { name: "Початок: автобус", quest: {}, at: START },
  { name: "Вода: набрати", quest: { stage: "water" }, at: { location: "yard", x: 176, y: 272 } },
  { name: "Вода: віднести", quest: { stage: "water", hasWater: true }, at: DEV_YARD },
  { name: "Колоради: збирати (баба зупинить)", quest: { stage: "beetles" }, at: { location: "yard", x: 340, y: 230 } },
  { name: "Обприскувач: до діда Петра", quest: { stage: "sprayer" }, at: { location: "pond", x: 172, y: 96 } },
  { name: "Обприскувач: віднести бабі", quest: { stage: "sprayer", hasSprayer: true, deeds: { heardCatfish: true } }, at: DEV_YARD },
  { name: "Обприскувач: бризкати", quest: { stage: "spray", deeds: { heardCatfish: true } }, at: { location: "yard", x: 340, y: 230 } },
  { name: "Магазин: купити", quest: { stage: "shop", sprayed: true, money: 5, time: "day" }, at: DEV_SHOP },
  { name: "Магазин: віднести", quest: { stage: "shop", sprayed: true, hasGroceries: true, time: "day" }, at: DEV_YARD },
  { name: "Клуб: познайомитись", quest: { stage: "evening", sprayed: true, hasGroceries: true, time: "day" }, at: DEV_CLUB },
  { name: "Кури: загнати", quest: { stage: "chickens", sprayed: true, metLads: true, time: "day" }, at: DEV_YARD },
  { name: "Мопед: розказати бабусі", quest: { stage: "moped", sprayed: true, metLads: true, mopedFound: true, time: "day" }, at: DEV_YARD },
  { name: "Гроші на пиво", quest: { stage: "done", sprayed: true, metLads: true, mopedFound: true, money: 10, time: "day" }, at: DEV_SHOP },
  { name: "Усе для дискотеки: вдень", quest: { ...DEV_READY_FOR_CLUB, riding: true }, at: DEV_CLUB },
  { name: "Усе для дискотеки: вечір", quest: { ...DEV_READY_FOR_CLUB, riding: true, time: "evening" }, at: DEV_CLUB },
  { name: "Ніч: іти додому", quest: { ...DEV_READY_FOR_CLUB, discoDone: true, time: "night", deeds: DEV_LADS_BRANCH }, at: DEV_CLUB },
  { name: "Ніч: у хаті, новини, сон", quest: { ...DEV_READY_FOR_CLUB, discoDone: true, time: "night", deeds: DEV_DANCE_BRANCH }, at: { location: "house", x: 130, y: 172 } },
  { name: "День 2: ранок", quest: { ...DEV_DAY_TWO, deeds: DEV_LADS_BRANCH }, at: DEV_YARD },
  { name: "День 2: Свєтка (лишився з хлопцями)", quest: { ...DEV_DAY_TWO, metGrandmaToday: true, deeds: DEV_LADS_BRANCH }, at: DEV_BY_SVETKA },
  { name: "День 2: Свєтка (танцювали)", quest: { ...DEV_DAY_TWO, metGrandmaToday: true, deeds: DEV_DANCE_BRANCH }, at: DEV_BY_SVETKA },
  { name: "Побачення: плеєр у рюкзаку", quest: { ...DEV_DAY_TWO, metGrandmaToday: true, time: "day", deeds: DEV_INVITED }, at: { location: "yard", x: 365, y: 132 } },
  { name: "Побачення: вдень, на мопеді", quest: { ...DEV_DAY_TWO, metGrandmaToday: true, time: "day", hasPlayer: true, riding: true, deeds: DEV_INVITED }, at: DEV_BY_SVETKA },
  { name: "Побачення: увечері, на мопеді", quest: { ...DEV_DAY_TWO, metGrandmaToday: true, time: "evening", hasPlayer: true, riding: true, deeds: DEV_INVITED }, at: DEV_BY_SVETKA },
  { name: "Сом: дід кличе на ставок", quest: DEV_DAY_THREE, at: DEV_POND },
  { name: "Сом з дідом: накопати черв'яків", quest: { ...DEV_DAY_THREE, deeds: DEV_ROD }, at: { location: "yard", x: 392, y: 172 } },
  { name: "Сом з дідом: черв'яки є, до ночі", quest: { ...DEV_DAY_THREE, time: "evening", hasWorms: true, deeds: DEV_ROD }, at: DEV_POND },
  { name: "Сом струмом: машина водія", quest: { ...DEV_DAY_THREE, deeds: DEV_ELECTRO }, at: { location: "street", x: 1215, y: 228 } },
  { name: "Сом струмом: на кладку вночі", quest: { ...DEV_DAY_THREE, time: "night", hasBattery: true, deeds: { ...DEV_ELECTRO, batteryStolen: 3 } }, at: { location: "pond", x: 250, y: 150 } },
  { name: "Сом струмом: продати Валі вночі", quest: { ...DEV_DAY_THREE, time: "night", hasCatfish: true, deeds: { ...DEV_ELECTRO, batteryStolen: 3 } }, at: DEV_SHOP },
  { name: "Поросята: баба просить гроші", quest: DEV_DAY_FOUR, at: DEV_YARD },
  { name: "Плеєр: продати Валі", quest: { ...DEV_DAY_FOUR, deeds: DEV_PIGLETS }, at: DEV_SHOP },
  { name: "Плеєр: продати Вовчикові", quest: { ...DEV_DAY_FOUR, deeds: DEV_PIGLETS }, at: DEV_CLUB },
  { name: "Інструмент: спитати діда", quest: { ...DEV_DAY_FOUR, hasPlayer: false, deeds: { ...DEV_PIGLETS, pigletMoney: true, playerSoldTo: "valya" } }, at: DEV_POND },
  { name: "Микола: удень спить", quest: { ...DEV_DAY_FOUR, hasPlayer: false, unlocked: { mykola: true }, deeds: DEV_TOOL }, at: DEV_MYKOLA_YARD },
  { name: "Микола: вечір, інструмент", quest: { ...DEV_DAY_FOUR, time: "evening", hasPlayer: false, unlocked: { mykola: true }, deeds: DEV_TOOL }, at: DEV_MYKOLA_YARD },
  { name: "Микола: кунфу за пиво", quest: { ...DEV_DAY_FOUR, time: "evening", hasPlayer: false, unlocked: { mykola: true }, bag: { beer: 4 }, deeds: { ...DEV_TOOL, mykolaMet: true, toolHome: true } }, at: DEV_MYKOLA_YARD },
  { name: "Сом струмом: новий акумулятор водієві", quest: { ...DEV_DAY_THREE, day: 4, money: 100, deeds: { ...DEV_ELECTRO, batteryStolen: 3, catfishWay: "electro", catfishSold: true, theftNewsTold: true } }, at: DEV_SHOP },
];

function devJump(index) {
  const checkpoint = DEV_CHECKPOINTS[index];
  // Copies, so playing from a checkpoint never changes the checkpoint itself.
  // What the hero has already remarked on stays said: jumping around does not repeat every remark.
  const said = { ...quest.heroSaid };
  Object.assign(quest, newQuest(), JSON.parse(JSON.stringify(checkpoint.quest)));
  quest.heroSaid = { ...said, ...quest.heroSaid };
  enterLocation(checkpoint.at.location, checkpoint.at);
  resetChickens();
  travel.active = false;
  dialog.open = false;
  choice.open = false;
  shopMenu.open = false;
  closeup.type = null;
  menu.hidden = true;
  mode = "world";
  saveGame();
}

function devButton(label, onClick) {
  const button = document.createElement("button");
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function devSetup() {
  if (!new URLSearchParams(location.search).has("dev")) return;
  const toggle = devButton("DEV", () => {
    panel.hidden = !panel.hidden;
  });
  toggle.id = "dev-toggle";

  const panel = document.createElement("div");
  panel.id = "dev-panel";
  panel.hidden = true;
  DEV_CHECKPOINTS.forEach((checkpoint, index) => {
    panel.append(devButton(checkpoint.name, () => {
      devJump(index);
      panel.hidden = true;
    }));
  });
  // Developers only: players never go back to an earlier part of the day.
  panel.append(devButton("Наступна фаза доби", () => {
    quest.time = PHASES[(phaseIndex() + 1) % PHASES.length];
  }));
  panel.append(devButton("+10 грн", () => {
    quest.money += 10;
  }));
  panel.append(devButton("Показати стіни", () => {
    DEBUG = !DEBUG;
  }));
  document.body.append(toggle, panel);
}

devSetup();
