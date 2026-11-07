const BEETLE_COUNT = 8;
const CHICKEN_COUNT = 3;
const CRATE_COUNT = 5;
const BEER_PRICE = 2;
const BEERS_NEEDED = 3;
const JAR_REWARD = 2;
const UNLOAD_REWARD = 4;

// Grandma's errands, in order.
const GRANDMA_STAGES = ["arrive", "water", "beetles", "shop", "chickens", "moped", "done"];

function newQuest() {
  return {
    stage: "arrive",
    hasWater: false,
    beetlesCaught: 0,
    hasGroceries: false,
    chickensHerded: 0,
    money: 0,
    backpackDropped: false,
    outfit: "city",
    beersDrunk: 0,
    mopedFound: false,
    mopedRidden: false,
    riding: false,
    arrivedOnMoped: false,
    moped: { x: 236, y: 156 },
    unload: "none",
    cratesCarried: 0,
    carrying: false,
    metLads: false,
    beatings: 0,
    discoDone: false,
    grandpaLine: 0,
    grandmaLine: 0,
  };
}

const quest = newQuest();

function stageReached(stage) {
  return GRANDMA_STAGES.indexOf(quest.stage) >= GRANDMA_STAGES.indexOf(stage);
}

const INTRO_LINES = [
  "Літо 2003-го. Полтавщина.",
  "Жовтий «Богдан» 212-го маршруту чхнув, видихнув і висадив тебе з рюкзаком на зупинці.",
  "Бабуся живе в хаті коло криниці, на північному краю села. Ну, з Богом.",
];

// Each talk returns { lines, next }. `next` names what happens after the dialog (see game.js).
function say(lines, next) {
  return { lines, next: next || null };
}

// ---------- Grandma ----------

function talkToGrandma() {
  switch (quest.stage) {
    case "arrive":
      quest.stage = "water";
      quest.backpackDropped = true;
      return say([
        "Ой, хто ж це приїхав! Онучок мій! Та який здоровий став — у вашому городі, мабуть, тіки ковбасу їсте.",
        "Рюкзака кинь отам, коло сарая. У нас тут не Київ, не крадуть... ну, майже.",
        "А тепер збігай до криниці, принеси водички. Чайку поп'єм з дороги.",
      ]);

    case "water":
      if (!quest.hasWater) return say(["Криниця отамечки, праворуч. Корбу крути, а не язиком."]);
      quest.stage = "beetles";
      return say([
        "Ох і водичка! Не те шо у вас із крана — хлоркою смердить.",
        "Слухай, дитино, колорадів на картошці — хоч лопатою греби. Позбирай у банку, бо пожеруть усе до коріння.",
      ]);

    case "beetles":
      if (quest.beetlesCaught < BEETLE_COUNT) return say(["Ще повзають, я ж бачу! Мені й окуляри не нада, шоб колорада побачить."]);
      quest.stage = "shop";
      quest.money += 5;
      return say([
        "Ото молодець! На тобі п'ять гривень, тіки не розтринькай.",
        "Збігай у магазин до Валі: хліба візьми і собі тої «Мівіни», бо я знаю — ти без неї не можеш.",
      ]);

    case "shop":
      if (!quest.hasGroceries) return say(["Магазин — за клубом, коло пшениці. Валю не проґавиш, її на всю вулицю чуть."]);
      quest.stage = "chickens";
      return say([
        "Хлібчик свіженький! Сідай, вареники з вишнями вже на столі.",
        "Ой, а кури! Порозбігались по двору, а шуліка вже кружляє. Загони їх у сарай, поки я посуду помию.",
      ]);

    case "chickens":
      return say([`Курей у сарай, дитино! Ще ${CHICKEN_COUNT - quest.chickensHerded} бігає. Вони не кусаються... ну, майже.`]);

    case "moped":
      quest.stage = "done";
      return say([
        "А, побачив дідового «Карпата»? Він на йому ще в колгосп на роботу їздив, царство йому небесне.",
        "Бери, раз уже знайшов. Тіки не вбийся, бо я тебе потім сама вб'ю.",
        "Кажуть, сьогодні в клубі дискотека. Ти тіки з місцевими не задирайся, бо вони в нас... ну, побачиш.",
        "Ага, і як ще колорадів назбираєш — дам дві гривні за банку.",
      ]);

    default:
      return say([grandmaChatter()]);
  }
}

function grandmaChatter() {
  if (quest.beersDrunk > 0 && quest.grandmaLine % 2 === 0) {
    quest.grandmaLine += 1;
    return "А чим це від тебе тхне? Ой, дитино, дитино... Увесь у діда.";
  }
  const lines = [
    "Колоради знов лізуть. Назбираєш банку — дам дві гривні.",
    "Ти куди такий нарядний? А, на танці... Ну, з Богом.",
    "Їж, бо худий, як та жердина. У городі вас там, мабуть, не годують.",
  ];
  const line = lines[quest.grandmaLine % lines.length];
  quest.grandmaLine += 1;
  return line;
}

function wakeUpLines() {
  if (quest.beatings === 1) {
    return [
      "Ой лишенько! Хто ж тебе так розмалював, дитино?",
      "Клубні, кажеш? Та то ж Толік з Вовчиком. Вони кожне літо всіх городських так зустрічають. До весілля заживе.",
    ];
  }
  return ["Знов?! Та ти в мене як той Буратіно — всі шишки твої. Приклади мідний п'ятак, поможе."];
}

// ---------- Valya, the shop ----------

function talkToValya() {
  if (quest.stage === "shop" && !quest.hasGroceries) {
    quest.hasGroceries = true;
    quest.money -= 5;
    return say([
      "О-о-о, хто до нас прийшов! Ганин онучок, городський! Ой, худий який, як та макаронина!",
      "Хліб? Свіженький, сьогодні привезли. «Мівіну» бери курячу, вона самая вкусна. З тебе п'ять гривень, рівненько.",
    ]);
  }

  if (quest.unload === "working") {
    if (!quest.carrying) return say(["Ящики самі не прийдуть, сонечко. Машина на дорозі стоїть."]);
    quest.carrying = false;
    quest.cratesCarried += 1;
    if (quest.cratesCarried < CRATE_COUNT) {
      return say([`Отак! Став отуто. Ще ${CRATE_COUNT - quest.cratesCarried} осталось.`]);
    }
    quest.unload = "done";
    quest.money += UNLOAD_REWARD;
    return say(["Все? Оце мужчина! Держи свої чотири гривні — заробив чесно."]);
  }

  if (quest.unload === "none" && stageReached("water")) {
    quest.unload = "working";
    return say([
      "Слухай, сонечко, машина з товаром приїхала, а водій, зараза, спину зірвав.",
      "Потягай ящики з машини до мене — дам чотири гривні. Машина на дорозі, коло магазину.",
    ]);
  }

  if (quest.metLads && quest.beersDrunk < BEERS_NEEDED) return sellBeer();

  return say(["Хліб є, сахар є, сірники є. А женихів нема — всі в Полтаву поїхали."]);
}

function sellBeer() {
  if (quest.money < BEER_PRICE) {
    const jobHint = quest.unload === "done" ? "" : " Або мені ящики потягай.";
    return say([`Пиво по дві гривні, сонечко. Бесплатно тіки сир у мишоловці. Йди в баби Гані колорадів визбирай.${jobHint}`]);
  }
  quest.money -= BEER_PRICE;
  quest.beersDrunk += 1;
  const greeting = quest.beersDrunk === 1
    ? "«Славутич»? Тобі вісімнадцять є? Та бачу, бачу — вже й вуса пробиваються. Дві гривні."
    : "Ще одну? Ой, пропаде хлопець... Давай дві гривні.";
  return say([
    greeting,
    `Ти відкрив пляшку прямо на ґанку й випив. Холодненьке, з гірчинкою. (${quest.beersDrunk}/${BEERS_NEEDED})`,
  ]);
}

// ---------- Grandpa Petro ----------

// For now grandpa only shares life wisdom. Each talk gives the next line.
const GRANDPA_LINES = [
  "О, Ганин онук! Сідай коло мене, послухай діда Петра — поганого не скажу.",
  "Ех, онучку, у мої часи на танці в чоботях ходили, начищених до блиску. А зараз — у трениках. Тьху.",
  "Запам'ятай: хто рано встає, той корову доїть. А хто пізно — той її шукає по всьому селу.",
  "Місцеві городських не люблять. Хочеш буть своїм — будь як вони: треніки, пивко, і шоб мотор тарахтів.",
  "Гроші — то діло наживне. А здоров'я у Валі в магазині не купиш, хоч вона й каже, шо в неї все є.",
  "У Гані в сараї мопед стоїть, «Карпати». Ще на ходу, я його кожну весну заводжу.",
  "Жінку вибирай не по танцях, а по борщу. Танці кінчаються, а борщ — щодня.",
  "Я в армії три роки служив, і знаєш, шо зрозумів? Шо дома краще. Оце й уся наука.",
  "Не лізь поперед батька в пекло. І поперед Толіка в клуб — теж.",
  "Був у мене «Запорожець», горбатий. Тридцять год їздив — і жодного разу не доїхав без поломки. Зате весело.",
  "Хліб на стіл не кидай, і в грозу телевізор не вмикай. Це тобі не город, тут блискавка злюща.",
  "Сусід мій, Микола, пів пенсії в «Лото-Забаву» програв. Виграв раз — футболку. Тепер у ній корову пасе.",
  "Слухай діда: з п'яним не сперечайся, з тверезим не пий, а з бабою Ганею — взагалі не сперечайся.",
  "Небо червоне на вечір — завтра вітер буде. Це тобі краще за всякий прогноз по телевізору.",
  "У ставку в нас сом живе, здоровий, як кабан. Сам бачив. Ну, майже бачив.",
  "Маршрутка на Полтаву — о сьомій ранку. Як після дискотеки встанеш — то ти герой.",
];


function talkToGrandpa() {
  // After the first round, skip the greeting line.
  const index = quest.grandpaLine < GRANDPA_LINES.length
    ? quest.grandpaLine
    : 1 + ((quest.grandpaLine - 1) % (GRANDPA_LINES.length - 1));
  const line = GRANDPA_LINES[index];
  quest.grandpaLine += 1;
  return say([line]);
}

// ---------- Things in the yard ----------

function useBackpack() {
  if (quest.outfit === "sport") {
    return say(["У рюкзаку лишилась зубна щітка і бутерброд, якому вже три дні."]);
  }
  quest.outfit = "sport";
  return say([
    "Ти розстебнув рюкзак: зубна щітка, плеєр з касетою «Океан Ельзи»... а на дні — новенький «Адідас» з трьома смужками.",
    "Мама клала «на всякий випадок». Ти перевдягнувся. Тепер ти схожий на місцевого... ну, майже.",
  ]);
}

function useShed() {
  if (quest.stage === "chickens") return say(["Сарай відчинений, кури всередину не йдуть. Треба їх туди загнати."]);
  return say(["Сарай на засуві. Звідти тхне бензином і курячим послідом."]);
}

function shedFoundLines() {
  return [
    "Усі кури в сараї. А що то в кутку під брезентом?..",
    "Мопед «Карпати»! Дідів, ще з тих часів, коли ковбаса була по два двадцять.",
  ];
}

function useMoped() {
  quest.riding = true;
  if (quest.mopedRidden) return say(["Тр-тр-тр! Поїхали."]);
  quest.mopedRidden = true;
  return say([
    "Ти смикнув педаль раз, другий... «Карпати» чхнули, закашляли — і затарахтіли! Тр-тр-тр-тр!",
    "Щоб злізти, натисни A там, де нема з ким говорити.",
  ], "ride");
}

function useTruck() {
  if (quest.carrying) return say(["Руки вже зайняті. Неси ящик Валі."]);
  quest.carrying = true;
  return say([`Ти схопив ящик. Важкий, зараза — мабуть, консерви. (${quest.cratesCarried + 1}/${CRATE_COUNT})`]);
}

// ---------- The lads at the club ----------

function missingForDisco() {
  const missing = [];
  if (quest.outfit !== "sport") missing.push("Серий: Шо це за джинси, як у бібліотекаря? Свої в спортивках ходять, понял?");
  if (quest.beersDrunk < BEERS_NEEDED) missing.push("Вовчик: І трезвий, як стьоклишко. Від своїх «Славутичем» пахне, а від тебе — бабиними пиріжками.");
  if (!quest.arrivedOnMoped) missing.push("Толік: І пішком притопав. Свої на дискотеку на моторі приїжджають, а не на своїх двох.");
  return missing;
}

function talkToLads() {
  const missing = missingForDisco();
  const firstTime = !quest.metLads;
  quest.metLads = true;

  if (missing.length === 0) {
    return say([
      "Толік: О-о-о! Оце я понімаю! Треніки, «Карпати» тарахтять, і «Славутичем» пахне — як од нормального пацана.",
      "Вовчик: Я ж казав — нормальний він. Сємок хочеш?",
      "Серий: Заходь, братан. Тіки до Светки з третьої хати не лізь — то моя.",
    ], "disco");
  }

  const greeting = firstTime
    ? [
      "Толік: Опа. А це шо за модель до нас приїхала?",
      "Вовчик: Та то Ганин онук, городський. Я його ще з маршрутки бачив — з рюкзачком, як турист.",
      "Серий: Слиш, городський, тут тобі не Київ. На дискотеку в нас пускають тіки своїх.",
    ]
    : ["Толік: О, знов ти? Мало було?"];

  return say([
    ...greeting,
    ...missing,
    "Вовчик: Хрін тобі, а не дискотека.",
    "Серий: Ну шо, бля, сам напросився.",
  ], "beaten");
}

const BEATEN_LINES = [
  "БАЦ! БУМ! ХРЯСЬ!",
  "Тебе по-доброму, але від душі віддубасили. В очах потемніло...",
];

const DISCO_LINES = [
  "Світло миготить, куля крутиться, з колонок гупає так, що аж шибки дзвенять.",
  "Ти танцюєш, як ніколи в житті. Сьогодні ти не городський. Сьогодні ти — свій.",
  "Кінець другої частини. Далі буде...",
];

// ---------- Objective text ----------

function needsWater() {
  return quest.stage === "water" && !quest.hasWater;
}

// Called when a jar is full. The first jar is grandma's errand, later jars earn money.
function finishBeetleJar() {
  if (quest.stage === "beetles") {
    quest.beetlesCaught = BEETLE_COUNT;
    return "Банка повна колорадів! Треба показати бабусі.";
  }
  quest.money += JAR_REWARD;
  return "Ще одна банка колорадів! Бабуся з порога: «Молодець! На тобі дві гривні».";
}

function canCollectBeetles() {
  if (quest.stage === "beetles") return quest.beetlesCaught < BEETLE_COUNT;
  return stageReached("shop");
}

function currentObjective() {
  if (quest.discoDone) return "Кінець другої частини. Далі буде...";
  if (quest.carrying) return "Віднеси ящик Валі в магазин.";
  switch (quest.stage) {
    case "arrive":
      return "Знайди бабусину хату — коло криниці, на півночі села.";
    case "water":
      return quest.hasWater ? "Віднеси воду бабусі." : "Набери води з криниці.";
    case "beetles":
      return quest.beetlesCaught < BEETLE_COUNT ? "Збери колорадів на городі." : "Покажи банку бабусі.";
    case "shop":
      return quest.hasGroceries ? "Неси покупки бабусі." : "Купи хліб і «Мівіну» у Валі в магазині.";
    case "chickens":
      return `Загони курей у сарай: ${quest.chickensHerded}/${CHICKEN_COUNT}`;
    case "moped":
      return "Розкажи бабусі про мопед.";
    default:
      return quest.metLads ? "Стань своїм і пройди на дискотеку." : "Ввечері дискотека в Будинку культури.";
  }
}
