const BEETLE_COUNT = 8;

const quest = {
  stage: "arrive",
  hasWater: false,
  beetlesCaught: 0,
  hasGroceries: false,
};

const INTRO_LINES = [
  "Літо 2003-го. Полтавщина.",
  "Жовта маршрутка з Полтави висадила тебе на зупинці біля села.",
  "Бабуся вже чекає. Її хата — за ворітьми на північ від дороги.",
];

const GRANDPA_LINES = [
  "Ех, онучку, оце в мої часи трактор був — не те що тепер.",
  "Ввечері футбол по телевізору — «Динамо» грає!",
  "Маршрутка на Полтаву — о сьомій ранку. Не проспи.",
];
let grandpaLineIndex = 0;

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
      return ["Криниця у дворі, біля хати. Відро там стоїть."];
    }
    quest.stage = "beetles";
    spawnBeetles();
    return [
      "Дякую, дитино! Отака вода — не те, що в місті з крана.",
      "А тепер біда: колорадів на картоплі повно. Позбирай їх, га?",
    ];
  }

  if (quest.stage === "beetles") {
    if (quest.beetlesCaught < BEETLE_COUNT) {
      return ["Ще є колоради, я ж бачу! Город — за хатою."];
    }
    quest.stage = "shop";
    return [
      "Молодець! Ось тобі п'ять гривень.",
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
  const line = GRANDPA_LINES[grandpaLineIndex];
  grandpaLineIndex = (grandpaLineIndex + 1) % GRANDPA_LINES.length;
  return [line];
}

function useWell() {
  if (quest.stage === "water" && !quest.hasWater) {
    quest.hasWater = true;
    return ["Ти покрутив корбу. Повне відро холодної води!"];
  }
  return ["Вода в криниці холодна-холодна."];
}

function currentObjective() {
  switch (quest.stage) {
    case "arrive":
      return "Знайди бабусю — її хата на північ від дороги.";
    case "water":
      return quest.hasWater ? "Віднеси воду бабусі." : "Набери води з криниці у дворі.";
    case "beetles":
      return quest.beetlesCaught < BEETLE_COUNT
        ? `Збери колорадів на городі: ${quest.beetlesCaught}/${BEETLE_COUNT}`
        : "Повернись до бабусі.";
    case "shop":
      return quest.hasGroceries ? "Неси покупки бабусі." : "Купи хліб і «Мівіну» у Валі в магазині.";
    default:
      return "Кінець першого дня. Далі буде...";
  }
}
