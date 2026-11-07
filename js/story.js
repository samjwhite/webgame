const BEETLE_COUNT = 8;

function newQuest() {
  return {
    stage: "arrive",
    hasWater: false,
    beetlesCaught: 0,
    hasGroceries: false,
    grandpaLine: 0,
  };
}

const quest = newQuest();

const INTRO_LINES = [
  "Літо 2003-го. Полтавщина.",
  "Жовта маршрутка з Полтави висадила тебе на зупинці біля села.",
  "Бабуся вже чекає. Її хата — за ворітьми на північ від дороги.",
];

const GRANDPA_LINES = [
  "Ех, онучку, оце в мої часи трактор був — не те що тепер.",
  "Ввечері футбол по телевізору — «Динамо» грає!",
  "Маршрутка на Полтаву — о сьомій ранку. Не проспи.",
  "Бачив лелеку на стовпі? Кажуть, на щастя.",
];

function talkToGrandma() {
  if (quest.stage === "arrive") {
    quest.stage = "water";
    return [
      "Ой, онучок приїхав! Як виріс, як виріс!",
      "Принеси-но води з криниці, я чайник поставлю.",
    ];
  }

  if (quest.stage === "water") {
    if (!quest.hasWater) {
      return ["Криниця у дворі, праворуч від хати. Відро там стоїть."];
    }
    quest.stage = "beetles";
    return [
      "Дякую, дитино! Отака вода — не те, що в місті з крана.",
      "А тепер біда: колорадів на картоплі повно. Позбирай їх у банку, га?",
    ];
  }

  if (quest.stage === "beetles") {
    if (quest.beetlesCaught < BEETLE_COUNT) {
      return ["Ще є колоради, я ж бачу! Город — під хатою."];
    }
    quest.stage = "shop";
    return [
      "Повна банка! Молодець! Ось тобі п'ять гривень.",
      "Збігай у магазин до Валі: хліба візьми і «Мівіну» собі.",
    ];
  }

  if (quest.stage === "shop") {
    if (!quest.hasGroceries) {
      return ["Магазин через дорогу, на південь. Валя там."];
    }
    quest.stage = "done";
    return [
      "Ось і молодець! Сідай, вареники з вишнями вже готові.",
      "Кінець першого дня. Далі буде...",
    ];
  }

  return ["Відпочинь, дитино. Завтра ще справи будуть."];
}

function talkToValya() {
  if (quest.stage === "shop" && !quest.hasGroceries) {
    quest.hasGroceries = true;
    return [
      "Привіт! Хліб і «Мівіна»? Ось, тримай.",
      "А на решту — жуйка «Love is». Бери, бо розберуть.",
    ];
  }
  return ["Хліб привезли зранку, свіжий. Заходь ще!"];
}

function talkToGrandpa() {
  const line = GRANDPA_LINES[quest.grandpaLine % GRANDPA_LINES.length];
  quest.grandpaLine += 1;
  return [line];
}

function needsWater() {
  return quest.stage === "water" && !quest.hasWater;
}

function needsBeetles() {
  return quest.stage === "beetles" && quest.beetlesCaught < BEETLE_COUNT;
}

function currentObjective() {
  switch (quest.stage) {
    case "arrive":
      return "Знайди бабусю — її хата на північ від дороги.";
    case "water":
      return quest.hasWater ? "Віднеси воду бабусі." : "Набери води з криниці у дворі.";
    case "beetles":
      return needsBeetles() ? "Збери колорадів на городі." : "Покажи банку бабусі.";
    case "shop":
      return quest.hasGroceries ? "Неси покупки бабусі." : "Купи хліб і «Мівіну» у Валі в магазині.";
    default:
      return "Кінець першого дня. Далі буде...";
  }
}
