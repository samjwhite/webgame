// Developer panel: open the game with ?dev in the address to jump to any point of the story.
// Nothing here runs for players. The automated tests check that every checkpoint stays usable.
//
// Each checkpoint names the quest state that differs from a new game and where the hero stands.
const DEV_YARD = { location: "yard", x: 240, y: 205 };
const DEV_READY_FOR_CLUB = { stage: "done", hasGroceries: true, sprayed: true, metLads: true, mopedFound: true, mopedRidden: true, outfit: "sport", beersDrunk: BEERS_NEEDED, time: "day" };
const DEV_CLUB = { location: "club", x: 192, y: 178 };
const DEV_SHOP = { location: "shop", x: 120, y: 165 };
const DEV_BY_SVETKA = { location: "shop", x: 240, y: 205 };
// After the first disco, by the two ways the hero learned who Svetka is.
const DEV_LADS_BRANCH = { svetkaSeen: "disco", svetkaNamed: true, svetkaDisco: "lads", dancedWithSvetka: false };
const DEV_DANCE_BRANCH = { svetkaSeen: "disco", svetkaNamed: true, svetkaMet: "disco", dancedWithSvetka: true, svetkaDisco: "stayed", wantsDate: true };
const DEV_DAY_TWO = { ...DEV_READY_FOR_CLUB, discoDone: true, day: 2, time: "morning", heroSaid: { shop: true } };

const DEV_CHECKPOINTS = [
  { name: "Початок: автобус", quest: {}, at: START },
  { name: "Вода: набрати", quest: { stage: "water" }, at: { location: "yard", x: 176, y: 258 } },
  { name: "Вода: віднести", quest: { stage: "water", hasWater: true }, at: DEV_YARD },
  { name: "Колоради: збирати (баба зупинить)", quest: { stage: "beetles" }, at: { location: "yard", x: 340, y: 230 } },
  { name: "Обприскувач: до діда Петра", quest: { stage: "sprayer" }, at: { location: "pond", x: 235, y: 16 } },
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
];

function devJump(index) {
  const checkpoint = DEV_CHECKPOINTS[index];
  // Copies, so playing from a checkpoint never changes the checkpoint itself.
  Object.assign(quest, newQuest(), JSON.parse(JSON.stringify(checkpoint.quest)));
  enterLocation(checkpoint.at.location, checkpoint.at);
  resetChickens();
  travel.active = false;
  dialog.open = false;
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
