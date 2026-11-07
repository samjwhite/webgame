// Developer panel: open the game with ?dev in the address to jump to any point of the story.
// Nothing here runs for players. The automated tests check that every checkpoint stays usable.
//
// Each checkpoint names the quest state that differs from a new game and where the hero stands.
const DEV_YARD = { location: "yard", x: 240, y: 205 };
const DEV_READY_FOR_CLUB = { stage: "done", metLads: true, mopedFound: true, mopedRidden: true, outfit: "sport", beersDrunk: BEERS_NEEDED };

const DEV_CHECKPOINTS = [
  { name: "Початок: автобус", quest: {}, at: START },
  { name: "Вода: набрати", quest: { stage: "water" }, at: { location: "yard", x: 176, y: 258 } },
  { name: "Вода: віднести", quest: { stage: "water", hasWater: true }, at: DEV_YARD },
  { name: "Колоради: збирати", quest: { stage: "beetles" }, at: { location: "yard", x: 340, y: 230 } },
  { name: "Колоради: показати", quest: { stage: "beetles", beetlesCaught: BEETLE_COUNT }, at: DEV_YARD },
  { name: "Магазин: купити", quest: { stage: "shop", money: 5 }, at: { location: "shop", x: 120, y: 165 } },
  { name: "Магазин: віднести", quest: { stage: "shop", hasGroceries: true }, at: DEV_YARD },
  { name: "Клуб: познайомитись", quest: { stage: "evening", hasGroceries: true }, at: { location: "club", x: 192, y: 178 } },
  { name: "Кури: загнати", quest: { stage: "chickens", metLads: true }, at: DEV_YARD },
  { name: "Мопед: розказати бабусі", quest: { stage: "moped", metLads: true, mopedFound: true }, at: DEV_YARD },
  { name: "Гроші на пиво", quest: { stage: "done", metLads: true, mopedFound: true, money: 10 }, at: { location: "shop", x: 120, y: 165 } },
  { name: "Усе для дискотеки", quest: { ...DEV_READY_FOR_CLUB, riding: true }, at: { location: "club", x: 192, y: 178 } },
  { name: "Ніч: іти додому", quest: { ...DEV_READY_FOR_CLUB, discoDone: true, time: "night" }, at: { location: "club", x: 192, y: 178 } },
  { name: "Ніч: у хаті, новини, сон", quest: { ...DEV_READY_FOR_CLUB, discoDone: true, time: "night" }, at: { location: "house", x: 130, y: 172 } },
  { name: "День 2: ранок", quest: { ...DEV_READY_FOR_CLUB, discoDone: true, day: 2 }, at: DEV_YARD },
];

function devJump(index) {
  const checkpoint = DEV_CHECKPOINTS[index];
  Object.assign(quest, newQuest(), checkpoint.quest);
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
  panel.append(devButton("День / ніч", () => {
    quest.time = isNight() ? "day" : "night";
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
