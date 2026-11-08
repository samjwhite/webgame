// English adaptation. Village folk speak plain, homely English; names and brands stay Ukrainian.
TEXTS.en = {
  ui: {
    title: "Summer in the Village",
    subtitle: "Poltava region, 2003",
    continue: "Continue",
    newGame: "New game",
    language: "Language",
    tasks: "Tasks",
    toggleTasks: "Show or hide tasks",
    money: (n) => `Money: ${n} UAH`,
    checklistTitle: "To get into the disco:",
    sideTitle: "Side tasks:",
    checkBeer: (n, total) => `Drink 3 beers (${n}/${total})`,
    checkSuit: "Put on the tracksuit",
    checkMoped: "Ride up on the Karpaty moped",
    map: "Map",
    mapAlt: "Map of the village of Makitryne",
    mapClose: "Tap to close",
    action: "Action",
    wellRaise: "Turn the crank to pull the bucket up: press A or tap the screen.",
    wellLower: "Turn the crank to lower the bucket: press A or tap the screen.",
    wellFull: "A full bucket of ice-cold water! Makes your teeth ache.",
    wellCold: "The well water is cold, really cold.",
    garden: (n, total) => `Pick the beetles into the jar: ${n}/${total}`,
    fence: (n, total) => `Drive in the nails: ${n}/${total}`,
    day: (n, total, phase) => `Day ${n} / ${total} · ${phase}`,
    phases: { morning: "Morning", day: "Afternoon", evening: "Evening", night: "Night" },
    waitTitle: "The disco's not till this evening. Wait?",
    waitEvening: "Wait here with the lads till evening",
    notYet: "I've still got things to do",
  },

  // Names over the dialog text. A line "Tolik: ..." is said by Tolik, and so on.
  speakers: {
    hero: "You",
    grandma: "Granny Hanya",
    grandpa: "Did Petro",
    valya: "Valya",
    tolik: "Tolik",
    vovchik: "Vovchyk",
    sanya: "Sanya",
    svetka: "Svetka",
    stranger: "Unknown girl",
    driver: "Driver",
    mykola: "Mykola",
  },

  intro: [
    "Summer 2003. The Poltava region, Ukraine.",
    "The yellow Bohdan minibus, route 212, coughed, wheezed and dropped you at the stop in the village of Makitryne.",
    "The driver promised to drop your backpack off at Granny Hanya's: he goes past her house anyway. And you, he said, could do with a walk and a look round the village.",
    "Grandma lives in the cottage by the well, at the north end of the village. Off you go.",
  ],

  grandma: {
    arrive: [
      "Oh my, look who's come to see us! My little grandson! Haven't you shot up, touch wood! All they eat in the city is sausage, I bet.",
      "The driver's already brought your backpack, it's standing by the shed. Nobody steals here, this isn't Kyiv... well, hardly anybody.",
      "Now run to the well and fetch me some water. We'll have a cup of tea after your trip.",
    ],
    waterWait: "The well's right over there, on the left. You work that crank, not your jaw.",
    waterDone: [
      "Ooh, now that's water! Not like your city tap water — stinks of bleach.",
      "Listen, sweetheart, the potatoes are crawling with Colorado beetles. Pick them into a jar, or they'll eat everything down to the roots.",
    ],
    beetlesWait: "There's still some crawling, I can see them! I don't need glasses to spot a beetle.",
    stopPicking: [
      "Picking them by hand, are you? By the time you get to the end of the row, they'll have eaten the first one bare.",
      "Go down to the pond and see old Petro. Have him give you his contraption, we'll spray them.",
      "He'll be sitting on the bench by the water. Where else would he be.",
    ],
    sprayerWait: "Petro's at the pond, on the bench. Tell him Hanya sent you for the contraption, he'll know.",
    sprayerBrought: [
      "Oh, you've brought it! And Petro let it go, look at that. Means he's taken a liking to you.",
      "Go on, spray. Just keep the wind at your back, or you'll end up like those beetles — legs in the air.",
    ],
    sprayWait: "The potato patch is right over there. Spray it row by row, and don't you skip a single plant.",
    sprayDone: [
      "Now that's a job done! Let them eat now, if they can.",
      "Here's five hryvnias, and don't go wasting it. Run to Valya's shop: get some bread, and a pack of that Mivina noodle stuff for yourself — I know you can't live without it.",
    ],
    shopWait: "The shop's further along the road, past the club — it says \"Produkty\" on it. You can't miss Valya — the whole street can hear her.",
    shopDone: [
      "Fresh bread! Sit down, the cherry dumplings are already on the table.",
      "They say there's a disco at the club tonight. Go and have a look at our young folk.",
    ],
    eveningWait: "Go on to the club, at least see how our lot have fun.",
    eveningDone: ["Oh, the chickens! They've scattered all over the yard and there's a hawk circling. Herd them into the shed while I do the dishes."],
    chickens: (left) => `Chickens in the shed, dear! ${left} still running around. They don't bite... well, hardly.`,
    moped: [
      "Ah, so you found Grandpa's old Karpaty? He rode it to the collective farm every day, God rest his soul.",
      "Take it, since you found it. Just don't kill yourself, or I'll kill you myself.",
      "And don't pick fights with the local lads, they're... well, you've seen them.",
      "Oh, and if you pick another jar of beetles — two hryvnias a jar.",
    ],
    morning: [
      "Up at last, party boy? I heard you trip over the doorstep last night.",
      "Sit down and eat. Then you could pick a few beetles before it gets hot: there's enough work here for the whole summer, child.",
    ],
    // The morning after the date: grandpa wants the hero, and the driver will take her for piglets.
    morningCatfish: [
      "Up, are you? Petro's been at the gate twice already: \"Where's that grandson of yours? I'm going to show him the catfish.\" Go down to the pond and see him, or he'll never leave off.",
      "And another thing: on Saturday the driver — the one with the old Kopiyka — promised to drive me to the district town for piglets. His car sleeps out on the road, by the club. If you see him, say thank you to the man.",
    ],
    // The morning after grandpa's way.
    morningRod: [
      "Have you heard? Petro's been going round the village since first light telling everyone how \"me and Hanya's grandson landed the catfish\". He told Valya, he told the driver, he even told Granny Lyuba's cow.",
      "He says the catfish was half the size of the pond. This morning it was still only half the size of the footbridge. Well, let him. I'll fry it for lunch, only you're gutting it yourself.",
    ],
    // Stage 3: the piglets need money, the fence needs mending.
    pigletAsk: [
      "Listen, child. On Saturday we're off for the piglets, I'm taking two. And piglets these days cost like they're made of gold. I'm forty hryvnias short, and my pension's not till next week.",
      "Maybe you can think of something? You're my clever city boy, after all.",
      "And the fence has a hole in it, there, left of the gate: the piglets will be out through that gap inside a day. Petro said he's got the tools. Go and ask him.",
    ],
    pigletThought: "You pat your pocket: the cassette player. And you've got two tapes. A player and a tape might fetch fifty hryvnias, probably.",
    pigletWait: "Forty hryvnias, child. No money, no piglets — unless I move into the sty myself.",
    pigletThanks: "Oh, child... Forty hryvnias? Where did you get it? No, don't tell me, don't tell me. The main thing is it's honest money. It is honest, isn't it?",
    pigletHidden: "You nod. Grandma hides the money in a headscarf, the headscarf in the wardrobe, and the wardrobe under lock and key.",
    toolThanks: [
      "Oh, Petro's tool box! Brought it all the way from Mykola's? Good boy. There's a hammer in there, a saw, nails.",
      "Only if Mykola asks you round for beer — don't you go. Once he's had a few, he starts waving his arms and legs about. Calls it kung fu, if you please.",
    ],
    fenceAsk: [
      "Now take the hammer and nails and patch that fence before the piglets get here. The hole's over there, left of the gate. I've stacked some boards by it.",
    ],
    fenceThanks: [
      "I went and had a look at your fence. Well... it's standing. Crooked as Petro after a christening, but no piglet's getting through. Good boy.",
    ],
    // The morning after the battery went missing.
    morningTheft: [
      "Oh, what a to-do! Somebody stole the battery out of the driver's car last night! Right outside the club!",
      "He says he's going nowhere till he gets hold of a new one. And Saturday's the piglets... Who'd do a thing like that, eh? Not our lot, surely. Ours wouldn't.",
    ],
    chatter: [
      "The beetles are back again. Fill a jar and I'll give you two hryvnias.",
      "Where are you off to in that tracksuit? To the lads? Well, go on, only be home before dark.",
      "Eat up, you're thin as a fence post. Don't they feed you in the city?",
    ],
    beerSmell: "What's that smell on you? Oh, child, child... Just like your grandpa.",
    tracksuit: "You went in those jeans! Your mum packed a tracksuit in your backpack, the old one from school, with the stripes. The backpack's by the shed.",
    wakeFirst: [
      "Goodness gracious! Who painted you up like that, dear?",
      "By the club, you say? That'll be Tolik and Vovchyk. They welcome every city boy like that each summer. It'll heal before your wedding.",
    ],
    wakeAgain: ["Again?! You collect bumps like Pinocchio. Hold a copper coin on it, it helps."],
  },

  valya: {
    groceries: [
      "Well, well, look who's come! Hanya's grandson, the city boy! Oh, skinny as a noodle!",
      "Bread? Fresh, came in this morning. Take the chicken Mivina, it's the tastiest. Five hryvnias, exactly.",
    ],
    waitingForCrate: "The crates won't walk in by themselves, sunshine. The truck's right there by the fence.",
    crateIn: (left) => `That's it! Put it right there. ${left} more to go.`,
    unloadDone: "All done? Now that's a man! Here's your four hryvnias — honestly earned.",
    unloadAsk: [
      "Listen, sunshine, the delivery truck's come and the delivery man, wouldn't you know it, put his back out.",
      "Carry the crates from the truck to me and I'll give you four hryvnias. The truck's right there by the fence.",
    ],
    // The truck comes every morning; from the second time on.
    unloadAgain: [
      "Oh, sunshine, the truck's here again, and the delivery man's holding his back again.",
      "Will you carry the crates? Four hryvnias, same as yesterday.",
    ],
    idle: "Got bread, got sugar, got matches. No grooms, though — they've all gone off to Poltava.",
    noMoney: "You're short, sunshine. Only cheese in a mousetrap comes free. Go pick beetles for Granny Hanya.",
    noMoneyJob: " Or carry my crates.",
    noCredit: "And I don't put it on the slate, don't ask. I know you city folk: here today, gone tomorrow — and there go my ten hryvnias.",
    catfishDay: "Have you gone daft? Walking round the village in broad daylight with a catfish like that? Come at night, to the back door. And make sure nobody sees you.",
    batterySell: [
      "A battery? I've got one, an Ista, brand new — I was keeping it for my son's godfather. A hundred hryvnias.",
      "Hand over the hundred. Oh, I know these notes: I gave them to you myself, that night, for the catfish.",
      "A hundred exactly. See how it goes, sunshine: money just goes round in circles.",
    ],
    batteryNoMoney: "The battery's a hundred hryvnias, sunshine. Not a kopeck less, cry all you like.",
    playerOffer: [
      "Valya: They say you've got a player, a cassette one? Show us.",
      "You: I've got a player. And a tape to go with it.",
      "Valya: I'm looking for something for my granddaughter's birthday, as it happens. Forty for the player, ten for the tape. It's not worth a kopeck more, so don't you haggle.",
    ],
    beerForMykola: "Is this for Mykola? Well, well. He still owes me for his own since May. Go on, take it, take it.",
    firstBeer: "Beer? Are you eighteen? Oh, I see, I see — there's a moustache coming in already. Two hryvnias.",
    nextBeer: "Another one? Oh, that boy's going to the dogs... Two hryvnias.",
    drink: (n, total) => `You open the bottle right there on the porch and drink it. Cold, a bit bitter. (${n}/${total})`,
  },

  grandpa: {
    greeting: "Ah, and whose are you, then? Hanya's? Well, sit down by me and listen to old Petro — I won't tell you anything bad.",
    sprayerStranger: "And whose are you, then? Ah, Hanya's grandson! Well, hello, city boy. What, did your gran send you?",
    sprayerKnown: "Oh, you again, Hanya's grandson. What, did your gran send you?",
    sprayer: [
      "The contraption? Take it, it's under the willow over there. The tank doesn't leak, only the strap's tied in a knot — don't untie it, or the whole thing falls to bits.",
      "And don't breathe it in too much. I had a good sniff once — saw the catfish for two days straight.",
      "Mind you, I see the catfish anyway. Lives right there, under the footbridge. Big as a boar. Had him on my hook twice — and twice he got away.",
      "He's a crafty one: lies low by day and comes out at night. Someday I'll show you how to catch him. If Hanya lets you out.",
    ],
    lines: [
      "Remember: the early riser milks the cow. The late one goes looking for it all over the village.",
      "Our young folk aren't mean, they just take a good look at you first. When I came back from the army it took them half a year to accept me.",
      "Money comes and goes. But you can't buy health at Valya's shop, even if she says she's got everything.",
      "There's a moped in Hanya's shed, a Karpaty. Still runs — I start it up every spring.",
      "Pick a wife by her borscht, not by her dancing. Dancing ends, borscht is every day.",
      "I served three years in the army, and you know what I learned? Home is better. That's the whole lesson.",
      "Don't rush in where angels fear to tread. And don't rush into the club ahead of Tolik either.",
      "I had a Zaporozhets once, the humpback one. Drove it thirty years and never once got anywhere without a breakdown. Never a dull moment, though.",
      "Never toss bread on the table, and never switch on the telly in a thunderstorm. This isn't the city — lightning here is vicious.",
      "My neighbour Mykola lost half his wages on the Loto-Zabava lottery. Won once — a T-shirt. Now he sleeps in it.",
      "Listen to your grandpa: don't argue with a drunk, don't drink with a sober man, and don't argue with Granny Hanya at all.",
      "Red sky at night — wind tomorrow. Better than any forecast on the telly.",
      "There's a catfish in our pond, big as a boar. Saw it myself. Well, nearly saw it.",
      "The minibus to Poltava leaves at seven in the morning. If you're up after the disco, you're a hero.",
      "Kuchma's on the telly again saying life's got better. I believe him. Let him try living on my pension, though.",
      "Under Kuchma everything's gone up except my pension. It's stable, see. Stably small.",
      "There used to be sausage at two-twenty — with real meat in it! And now? Paper that smells of sausage.",
      "Ever had real Doktorska sausage? Thought not. I have. Now that was sausage — the whole house smelled of it.",
      "They don't make machines like they used to. My YuMZ tractor — plough for thirty years and not a scratch. Now it's all plastic.",
      "Hanya's Dnipro fridge has stood there since seventy-nine. Hums like a tractor, but it freezes! New ones last a year and off to the tip.",
      "We'll have to spray for the beetles more than once this summer, or they'll eat the potatoes. I used to spray Decis — and they only got fatter.",
      "A Colorado beetle is like the tax office: poison it all you like, it still comes back.",
    ],
    // After the date: how to take the catfish, and the other way, mentioned "just so".
    catfishTalk: [
      "Ah, you came! Sit down. Told you: the catfish lives under the footbridge. Big as a boar.",
      "You take him on a worm, at night, when the water cools. Dig some worms at Hanya's, at the far end of the vegetable patch by the summer kitchen — they're fat as sausages there. And come when it gets dark: we'll sit on the footbridge.",
      "My neighbour Mykola wanted to get him with electricity once. A car battery, two wires — and that's the end of the fish. I told him: that's not fishing, that's thieving.",
      "Mind you, Valya would probably give a hundred for a catfish like that. I'm not saying you should. I'm just saying.",
    ],
    wormsWait: "Don't come back without worms. A catfish isn't a cow, he doesn't eat grass. Dig at Hanya's, at the far end of the patch.",
    rodWait: ["Got the worms? Now we're talking. Only the catfish is asleep right now, like Mykola after payday. We'll go when it gets dark."],
    // Stage 3: his tool box is at Mykola's.
    toolAtMykola: [
      "The tools? I've got them, course I have. Only they're at Mykola's. He borrowed them in the spring: \"Just for a week, Petro, just a week.\" It's summer now, and that week still isn't over.",
      "Go and fetch them. His gate's on the road, at the far end of the village: a wooden one, by a white house under an apple tree.",
      "Only don't go in the daytime: Mykola sleeps all day like a dormouse. Towards evening, when you hear his telly start talking — that's when.",
    ],
    rodNight: ["Quiet. Sit down on the footbridge and cast in by the post. And don't breathe."],
    // Added to his sayings after grandpa's way.
    brag: [
      "Remember how we got that catfish... Well, you did the pulling, and I was in charge.",
      "The catfish was this big. No, this big! Well, you saw it yourself. And I nearly did.",
    ],
  },

  // What the hero may do besides the story (sideTasks in js/story.js).
  side: {
    tsn: "In the evening, TSN is on the TV in Grandma's house.",
  },

  yard: {
    fenceNight: "Hammering at night? Every dog in the village would come running, and Grandma would come out with the oven fork. Tomorrow.",
    fenceDone: [
      "You step back and have a look. Crooked. No board matches the next, and one nail bent and stayed that way.",
      "But the hole's gone. No piglet's getting through. A hen might, but a hen goes wherever she likes anyway.",
    ],
    backpackEmpty: "All that's left in the backpack is a toothbrush and the sandwich from the journey, which you'd better not eat now.",
    backpackOpen: [
      "You unzip the backpack: a toothbrush, a cassette player, tapes... and at the bottom, your old school Adidas tracksuit with three stripes and baggy knees.",
      "It's the only change of clothes you've got: Mum packed it \"just in case\". You change. Now you look almost like a local... almost.",
    ],
    takePlayer: [
      "You take the cassette player, the headphones and your tapes out of the backpack: Okean Elzy, and Skriabin that you taped off the radio.",
      "On the Skriabin tape there's \"Movchaty\", the one with Iryna Bilyk. The start's clipped a bit: you waited for the DJ to stop talking and hit record too late.",
    ],
    jarsDone: "That's enough beetles for today. Tomorrow a fresh lot will crawl over from the neighbours.",
    shedChickens: "The shed is open, but the chickens won't go in. You have to herd them in.",
    shedLocked: "The shed is bolted shut. It smells of petrol and chicken droppings.",
    shedFound: [
      "All the chickens are in the shed. And what's that under the tarp in the corner?..",
      "A Karpaty moped! Grandpa's, from the days when sausage cost two-twenty.",
    ],
    mopedAgain: "Brrm-brrm! Off we go.",
    mopedStart: [
      "You kick the pedal once, twice... the Karpaty sneezes, coughs — and roars to life! Brrm-brrm-brrm!",
      "To get off, press A where there's nobody to talk to.",
    ],
    statue: [
      [
        "A statue in the middle of the square. Balding head, arm stretched forward, and under the nose a moustache that was clearly painted on later.",
        "They say Lenin used to stand here. When independence came, the village council had no money for a new statue — so they painted on a moustache and called it done.",
        "Now you can't tell: is it Lenin, or is it Shevchenko?",
      ],
      ["Fresh paint on the plinth says \"T. H. Shevchenko\". Look closely and \"V. I.\" still shows through underneath."],
      ["The pigeons don't seem to know who it is either. They land on him just as happily."],
    ],
    handsFull: "Your hands are full. Take the crate to Valya.",
    takeCrate: (n, total) => `You grab a crate. Heavy as anything — tinned food, probably. (${n}/${total})`,
    jarMore: "Another jar of beetles — they keep crawling over from the neighbours, nobody sprays there. Grandma calls from the doorstep: \"Good boy! Here's two hryvnias.\"",
    spray: [
      "You pump up the tank, sling the strap over your shoulder and set off down the rows. Psssh... psssh...",
      "The beetles drop off the leaves like drunks off a bench. The potatoes are wet and bitter, and you smell like a collective farm storehouse.",
      "By the time you reach the last row, the sun is standing right over the house. Lunchtime.",
    ],
    clubClosed: ["Go and see Grandma first, you've only just arrived. The club isn't going anywhere."],
    noMopedInside: ["A moped in the house? Grandma would throw you both back out. Get off it first."],
    shopClosed: ["A padlock on the door and a piece of cardboard: \"Closed. Back in the morning.\" Even Valya can't be heard at night."],
  },

  lads: {
    // They envy his new city clothes a little, but never say so: he just "doesn't fit in".
    noSuit: [
      "Tolik: Whoa, look at those jeans. Brand new, bet they still smell of the shop.",
      "Tolik says it like it's nothing, but his eyes stay on your trainers a bit longer than they need to.",
      "Tolik: Only in those you're not one of us. A proper dandy. Nobody comes round here dressed like that — go and put on something normal.",
    ],
    sober: "Vovchyk: Sober as our agronomist the day before payday. Have at least one beer for courage.",
    weakBeer: "Vovchyk: You smell of beer, but like you've only sniffed it.",
    onFoot: "Sanya: On foot? Even old Petro used to ride his bike to the disco.",
    noticeSuit: "Tolik: Got your Adidas on — oh, now you look like a person.",
    noticeBeer: "Vovchyk: Oh, you reek of beer, like after haymaking. Sound, one of us.",
    noticeMoped: "Sanya: And you rattled up on your grandpa's Karpaty! I thought they'd sold it for parts long ago.",
    friends: [
      "Tolik: Tomorrow morning we're off to the pond for crucian carp. Come along when you wake up.",
      "Vovchyk: Dad says we're hauling hay on Thursday. Give us a hand and he'll pour you fresh milk.",
      "Sanya: Don't go flashing yourself about with Svetka. Tolik keeps quiet, but he sees everything.",
      "Tolik: Football on the common on Saturday, us against Mykhailivka. Will you go in goal?",
      "Vovchyk: The Ruki Vverkh tape at the club got chewed up again. Took us half the evening winding it back with a pencil.",
      "Sanya: I've got to take the cow out to the herd at five. That's my disco: dancing till two, grazing from five.",
    ],
    playerOffer: [
      "Vovchyk: Hey, is that a player you've got? Let's have a look. Will you sell it?",
      "You: I could. The player and a tape.",
      "Vovchyk: What's on the tape?",
      "You: Decent music.",
      "Vovchyk: Forty for the player, ten for the tape. We'll play it at the club. All we've got is one Ruki Vverkh tape, and that one's chewed up.",
    ],
    playerPlays: [
      "Vovchyk: Your old player never gets switched off at the club. We know Okean Elzy by heart now, even Sanya.",
      "Sanya: Vovchyk sleeps with the headphones on now. Says Vakarchuk visits him in his dreams.",
    ],
    readyEarly: [
      "Tolik: Now that's more like it! Only you're early. The disco starts in the evening, when the cows come home.",
      "Vovchyk: You can sit here with us. We've got sunflower seeds.",
    ],
    welcome: [
      "Tolik: Right, it's evening. Come on in, just don't step on the girls' feet.",
      "Vovchyk: Have some sunflower seeds, Granny Lyuba roasted them.",
      "Tolik: And hands off Svetka.",
      "Who Svetka is, you have no idea. But you make a note of it, just in case.",
    ],
    firstMeet: [
      "Tolik: Hey, who's this all clean and shiny? Lost, are you?",
      "Vovchyk: That's Hanya's grandson, from the city. Got off the Bohdan this morning, all in new stuff, like a tourist.",
      "Sanya: Off to the disco, are you? You don't just walk in here — first show us you're not made of asphalt.",
    ],
    again: "Tolik: Oh, you're back? Stubborn as Granny Hanya's goat.",
    beforeBeating: [
      "Vovchyk: Don't take it personally, it's just how we do things.",
      "Sanya: Anyone who turns up not our way, we \"introduce\" to the village a bit.",
    ],
  },

  beaten: [
    "WHACK! BOOM! CRUNCH!",
    "Just for form's sake, with no hard feelings, they rough you up a bit, the way new boys always get it. Everything goes dark...",
  ],

  disco: {
    start: [
      "Lights flashing, the mirror ball spinning, the speakers thumping so hard the windows rattle.",
      "You dance with the lads like never before. Tonight you're not a city boy. Tonight you're one of them.",
    ],
    notice: [
      "By the speaker there's a girl dancing you haven't seen before. Chestnut ponytail with a red scrunchie, a dark red blouse, a faded denim skirt, and she laughs like this isn't a village club but the seaside.",
    ],
    choiceTitle: "The girl by the speaker. What do you do?",
    goOver: "Go over and ask her to dance",
    keepDancing: "Keep dancing with the lads",
    approach: [
      "You: Wanna dance?",
      "Unknown girl: You're that city boy, Hanya's grandson? Go on, then. Just don't step on my feet.",
      "You dance to Ruki Vverkh. She knows all the words; you only know \"la-la-la\".",
      "Vovchyk: Svetka! Your mum said home by eleven!",
      "Aha. So that's who Svetka is.",
      "Svetka: I'm not going anywhere. One more.",
    ],
    afterTitle: "Tolik said hands off Svetka. What now?",
    afterOptions: {
      stayed: "Stay with her",
      warned: "Tell her about Tolik's warning",
      left: "Thank her and go back to the lads",
    },
    afterDance: {
      stayed: [
        "You stay. A slow dance, Okean Elzy. She puts her hands on your shoulders, and you forget to count your steps.",
        "Svetka: I go to the shop in the mornings. Just saying.",
        "You make up your mind: you have to ask her out properly. On a date.",
      ],
      warned: [
        "You: I've been told to keep my hands off you.",
        "Svetka: Who said that? Tolik? He can keep his hands on his own cows.",
        "She laughs, but for a moment she glances over at the lads.",
        "You make up your mind: you have to ask her on a date. Somewhere nobody's watching, preferably.",
      ],
      left: [
        "You: Thanks for the dance. I'll get back to my lot.",
        "Svetka: Off you go, then, \"one of them\".",
        "You walk away, and she watches you go. So does Tolik.",
        "You make up your mind: next time you'll ask her on a date. No witnesses.",
      ],
    },
    withLads: [
      "You stay with the lads. The girl with the ponytail twirls on her own, as if she doesn't need anyone at all.",
      "Sanya: Staring, are you? That's Svetka. The very same.",
      "Tolik: I told you — hands off.",
      "So that's who Svetka is. You keep dancing, but you're not looking at the lads any more.",
    ],
  },

  // Svetka by the shop, from the day after the first disco.
  svetka: {
    firstMeet: [
      "By the table under the umbrella stands Svetka with a bottle of Sytro lemonade. The same girl from the disco.",
      "Svetka: Oh, Hanya's grandson. You were jumping about with the lads so hard at the disco, I thought the club would come down.",
      "You: I saw you. Well, there. By the speaker.",
      "Svetka: I know you saw me. I'm Svetka. Stay a bit, since you've come over.",
      "You talk about anything and everything: Kyiv, cows, and how the only fun in Makitryne is the club and the pond.",
    ],
    firstMeetStranger: [
      "By the table under the umbrella stands a girl with a bottle of Sytro lemonade.",
      "Unknown girl: What are you staring at? I don't bite.",
      "Svetka: Svetka. And you're Hanya's grandson, I know. Everybody knows everything round here.",
      "You talk about anything and everything: Kyiv, cows, and how the only fun in Makitryne is the club and the pond.",
    ],
    afterDance: [
      "By the table under the umbrella stands Svetka with a bottle of Sytro lemonade.",
      "Svetka: Oh, the dancer. Feet still in one piece? Mine barely are.",
      "You: I didn't trample your feet too badly that night?",
      "Svetka: Three times. But I don't hold grudges: I'm counting it as one.",
    ],
    dateIntent: [
      "You watch her laugh and it hits you: you've got to ask her on a date. Only where do you take a girl round here?",
      "And then you remember: the river past the village, the sunset, and your cassette player with the Skriabin tape.",
    ],
    askAgain: "Svetka: So, worked out where you're taking me? Just not to the pond to sit with old Petro.",
    inviteTitle: "Ask Svetka on a date?",
    inviteRiver: "Ask her to the river tonight, to listen to Skriabin",
    inviteLater: "Some other time",
    notNow: "You can't quite bring yourself to say it. Svetka finishes her Sytro and looks at you as if she knows what you wanted to say anyway.",
    invite: [
      "You: Fancy the river tonight? On the moped. I've got a cassette player, and Skriabin, \"Movchaty\".",
      "Svetka: On your Karpaty? Will it even make it?",
      "You: It'll make it. It starts on the second kick.",
      "Svetka: Well... all right. When the sun goes down, come and get me here, by the shop. I'll tell Mum I'm at Olka's.",
    ],
    playerAtHome: "Your cassette player, by the way, is still in the backpack by Grandma's shed. Better go and get it.",
    waitPlayer: [
      "Svetka: So where's the player? You promised Skriabin.",
      "The cassette player is still in the backpack by Grandma's shed.",
    ],
    waitMoped: ["Svetka: Walk to the river? It's way past the village. Go and fetch your Karpaty, I'll wait."],
    waitEvening: ["Svetka: It's still light out. In the evening, I said. Once the cows have gone by."],
    waitTitle: "Evening's a long way off yet. Wait with Svetka?",
    waitHere: "Sit with her by the shop till evening",
    eveningFalls: [
      "The sun goes down. Valya brings a stool out onto the porch and cracks sunflower seeds, and Svetka tells you who in the village isn't speaking to whom, and why.",
      "Svetka: Right, let's go, while Mum's milking the cow.",
    ],
    letsGo: ["Svetka: Oh, here you are. Got the player? Right, let's go, while Mum's milking the cow."],
    // After the river.
    later: [
      "Svetka: Valya's already asked me if it's serious with us. I told her it's none of her business.",
      "Svetka: I got home from the river that night and Mum goes: \"Where've you been?\" And I go: \"At Olka's.\" With grass in my hair.",
      "Svetka: I ought to get home and meet the cow off the herd. But I'll stay a bit longer.",
    ],
  },

  // The catfish under the boardwalk (summer story, stage 2): with grandpa on a rod, or alone at night with
  // the driver's battery.
  catfish: {
    choiceTitle: "How will you catch the catfish?",
    rod: "With Did Petro, on a rod and a worm",
    electro: "Alone, at night, with electricity — and sell it to Valya",
    rodChosen: [
      "You: I'll be there, Did Petro. With worms.",
      "Did Petro: That's the way. Leave the electricity to Mykola. He's let his whole life slip by as it is.",
    ],
    electroChosen: [
      "You: Right. I'll think about it, Did Petro.",
      "You nod at Did Petro, but you're thinking about a hundred hryvnias. And about the driver's Kopiyka on the road by the club: there's a battery under its bonnet.",
    ],
    worms: [
      "You dig at the far end of the vegetable patch, by the summer kitchen. The worms are fat as sausages: Did Petro wasn't lying.",
      "You fill a whole pickle jar and shut it with a lid with holes punched in it.",
    ],
    nightTitle: "The catfish comes out at night. Wait?",
    waitNight: "Wait here till it gets dark",
    rodCatch: [
      "Night. Mist over the pond, the moon on the water. Did Petro sits on the bench and says he isn't sleeping.",
      "Did Petro: I'm not sleeping. I'm thinking.",
      "You cast in under the footbridge. The float stands still as a post. Did Petro thinks louder and louder: hrrr... hrrr...",
      "And then the rod bends double! You pull, the line sings, the water by the post boils...",
      "Out of the dark water comes the catfish's head, with a moustache like the statue's on the square.",
      "You haul him up onto the footbridge. The catfish is big as a boar. Did Petro is snoring.",
      "Did Petro: Eh? What? Pull! Pull, I said! ...Oh. Got him out already. Well, I told you: under the footbridge.",
      "Did Petro: That's just how it went the other two times: I nod off — and he bites. Never mind: the main thing is we got him. We got him together, didn't we?",
    ],
    carLook: ["An old sky-blue Kopiyka, the very first Zhiguli. Rust, a roof rack, a fly on the windscreen. A beast of a car."],
    carNotNow: ["In the daytime there are people round the car: the driver tinkering with it, the old women walking to the shop. At night it's a different story."],
    carTake: [
      "Night. The village is asleep, only a dog barking somewhere.",
      "You quietly lift the bonnet. A ten-millimetre spanner, two terminals... The battery's heavy as a sack of potatoes.",
      "You lower the bonnet and walk away without looking back. Your heart's thumping like the speakers in the club.",
    ],
    carEmpty: ["The bonnet's up, and where the battery was there's nothing but empty space and two loose wire ends. You look away."],
    boardwalk: ["The old footbridge, its boards creaking. The water under it is dark and deep: if a catfish lives anywhere, it's here."],
    boardwalkDay: ["In the daytime there are people and cows round the pond. Onto the footbridge with a battery — only at night."],
    electroCatch: [
      "Night. You wind the wires from the shed round a stick, hook them up to the battery and climb out onto the footbridge.",
      "Your fingers are shaking. You lower the wires into the water by the post...",
      "A flash! The water under the footbridge glows blue, and the whole pond shudders.",
      "Up from the depths floats the catfish: big as a boar, stunned, whiskers spread wide.",
      "You grab him by the gills and drag him to the bank. And just then the battery slides off the footbridge — plop! — and sinks to the bottom, to visit the catfish's relatives.",
      "Well, that's that. Now there's a catfish, and no battery.",
    ],
    sale: [
      "You knock on the shop's back door. Nothing for a long while. Then footsteps, and the bolt clicks.",
      "Valya: Who's that in the middle of the night? ...Oh, good grief. Where did you get a thing like that?",
      "You: On a rod.",
      "Valya: Uh-huh. On a rod. And I'm a ballerina. Well, come in, before anybody sees.",
      "Valya weighs the catfish on her hand scales, shakes her head for a long time and counts out the money.",
      "Valya: A hundred hryvnias, exactly. And you never saw me, and I never saw you.",
    ],
  },

  // The driver, by his car on the road.
  driver: {
    // The first person the hero meets, by his car on the way from the bus stop. A busy village man who
    // says things as they are and knows how to run the country. What the hero has missed in a year he
    // tells only this once (talkToDriver in js/story.js). Real events only, see docs/TSN_FACTS.md.
    firstMeet: [
      "By an old Zhiguli stands a man in a flat cap, staring under the bonnet as if the bonnet owed him money.",
      "Driver: Hold it. Whose are you? No, don't tell me. Hanya's grandson, from the city. Hanya's nose, but those trainers aren't from round here.",
      "You: How do you know?",
      "Driver: Lad, news is scarce here. Whatever gets off the bus is news. You didn't come last year, did you? So listen, because your grandma will only tell you about the beetles.",
      "Driver: They repainted the statue on the square. It was Lenin, now it's Shevchenko: painted on a moustache, changed the sign. Cheaper than a new one, they say. Fair enough: Shevchenko won't take offence, and Lenin's not saying anything.",
      "Driver: Valya's put up an umbrella by the shop, Chernihivske, and tables. Beer on the street now, like in Europe. The toilet's still behind the shed, mind.",
      "Driver: Did Petro's been after the catfish under the boardwalk for three summers. By now the catfish probably says hello. And Tolik's grown so much he's the village council by the club all on his own.",
      "Driver: There's only one Bohdan bus for three villages now, the other got stripped for parts. I was there. That's why this one still runs.",
      "Driver: The wide world's the same, only more of it. Bush went into Iraq, our boys are being sent there, and somehow petrol goes up for me, in Makitryne. That's all the politics you need.",
      "Driver: I'd fix this country in a week. There's only one way to repair anything: first see where it leaks, then paint. They paint.",
    ],
    directions: "Driver: Off you go, Hanya's been out on the road twice already. Left along the road, past the club. Blue gates, all rust, a yellow pipe above the fence: that's her yard.",
    busy: "Driver: Me, I'm going back under here. The main thing is to get it fixed by Saturday, because on Saturday we've got to go to the market.",
    idle: [
      "Driver: The main thing is to get it fixed by Saturday, because on Saturday we've got to go to the market.",
      "Driver: A Zhiguli, 1978. Twenty-five years on the road, and she's never once asked who's president.",
      "Driver: She's a beast, this car. Just a bit poorly. Like everything here: it runs, and don't ask how.",
      "Driver: In America, my mate says, it breaks, you bin it, you buy a new one. They do the same with presidents: four years and next. Ours at least knows where everything's kept.",
      "Driver: You think Bush went into Iraq for democracy? Lad, I've been thirty years at the wheel. Everybody drives to where the petrol is.",
      "Driver: Studying in the city, are you? Good, study. Just remember: a diploma won't pump up a tyre.",
      "Driver: They say soon everyone will have a mobile. What for? In a village everybody knows everything anyway, and before you do.",
      "Driver: A man's like an engine: you only see what he is when he won't start. While it's running, everyone's lovely.",
      "Driver: Money doesn't stay in your pocket, it stays in your hands. Got hands, you'll get money. Someday.",
      "Driver: On the telly they say life's got better. Could be. I'm under the bonnet, I can't see from here.",
    ],
    piglets: "Driver: Tell your grandma: Saturday we go for the piglets, like we agreed. She's a beast, this car!",
    robbed: [
      "Driver: Did you see? Did you see?! The battery! In the night! Right outside the club!",
      "Driver: If I got my hands on that thief... I'd... Tfoo! Till I get a new one, I'm going nowhere. And where are you meant to find one in a village?",
    ],
    rant: [
      "Without a word, you set the new battery down by the car.",
      "Driver: A new one?! An Ista? Where did you... From Valya's? Well, aren't you something, lad!",
      "Driver: And I'll tell you what I'd do to that thief if I caught him. I'd...",
      "What follows is several minutes of the kind of thing they don't print in books. You learn a great deal that's new about the thief.",
      "Driver: ...and then into the pond with him. To the catfish!",
      "You nod and look away. Good thing you kept quiet. Bad thing there was anything to keep quiet about.",
      "The driver screws the terminals back on. The Kopiyka sneezes and starts. Driver: Saturday we're off for the piglets! Tell your gran.",
    ],
    after: [
      "Driver: The car's a beast! And now with a brand-new heart, too.",
      "Driver: They never did find the thief. But I remember. I remember everything.",
    ],
  },

  // Selling the cassette player and, separately, a tape; the buyer never hears which tape (stage 3).
  player: {
    title: "Sell the player for forty hryvnias and a tape for ten?",
    sell: { valya: "Sell it to Valya", vovchik: "Sell it to Vovchyk" },
    keep: "No, I'm keeping it",
    kept: "You put the player back in your pocket. You'll think about it.",
    valya: [
      "You take the Skriabin tape out of the player and put it in your pocket. That one's not for sale, not even for a hundred.",
      "You put the player on the counter and, next to it, separately, your other tape.",
      "Valya: There we are. Forty and ten, fifty hryvnias exactly. My granddaughter will be pleased, and you've got money in your pocket.",
    ],
    vovchik: [
      "You take the Skriabin tape out of the player and put it in your pocket. That one's not for sale, not even for a hundred.",
      "You hand Vovchyk the player and, separately, your other tape.",
      "Vovchyk: Here's your fifty. That's it, now there'll be music at the club. Come and have a listen — it's on the house.",
    ],
  },

  // Mykola, grandpa's neighbour: asleep all day, Bruce Lee every evening (stage 3).
  mykola: {
    asleep: [
      "The door's shut. From inside comes snoring so loud the windowpanes rattle. Mykola sleeps in the daytime.",
    ],
    waitTitle: "Mykola wakes up towards evening. Wait?",
    waitHere: "Sit on the bench till evening",
    evening: [
      "The sun goes down. A telly comes on in the house, and through the window you hear \"Hi-yaaah!\" and gunfire.",
      "The door creaks. Out onto the porch comes Mykola in his vest, with a bottle, squinting at you.",
    ],
    firstMeet: [
      "Mykola: Oh. And whose are you? Hanya's? Ah, the city boy who rattles round the village on his grandpa's Karpaty... Yeah, I heard, I heard.",
      "You: Did Petro sent me for his tool box. The one you borrowed in the spring.",
      "Mykola: Petro's box? Ah, the green one. Wait here, I'll fetch it.",
      "Mykola dives into the porch, rattles some buckets and brings out a battered green tool box.",
      "Mykola: There, take it to Petro. I only ever used it to open bottles anyway.",
      "You take the box. It's heavy enough to pull your arms down.",
      "Mykola: And how are you getting on with Tolik? He roughs up every city boy by the club, I know.",
      "Mykola: Listen here. I'll teach you kung fu. The real thing, like Bruce Lee. I've watched that Bruce Lee two hundred times.",
      "Mykola: Only kung fu isn't taught dry. Bring some beer. Four bottles — two each.",
    ],
    noBeer: "Mykola: Kung fu isn't taught dry. Four bottles, I said. Valya's got some.",
    lesson: [
      "Mykola opens the beer on the edge of the table and puts on the video. There's Bruce Lee on the screen, a bit green and a bit stripy.",
      "Mykola: Watch this. The crane stance. Leg up, arms like so... and breathe.",
      "Mykola stands on one leg for about three seconds. Then he wobbles and grabs the china cabinet. The china cabinet tinkles.",
      "Mykola: That was on purpose. That's a feint. The enemy thinks I'm falling, but I'm — not falling!",
      "You each have another one. Mykola rewinds the tape and shows you a strike, a block, another strike. You copy him.",
      "Mykola: There! Now we're getting somewhere. The main thing is, don't wave your arms about like a windmill. Hit once, but so he's still thinking about it the next day.",
      "On the way home your hands keep slipping into the stance by themselves. You even half believe you've learned something.",
    ],
    later: [
      "Mykola: So, practising the crane? Keep at it. Bruce Lee wasn't born knowing it either.",
      "Mykola: Tell Petro I gave you the box. So he doesn't go round saying I drank it away.",
      "Mykola: Lost at Loto-Zabava again. But at least they didn't give me a T-shirt this time — so my big win's still to come.",
    ],
  },

  // The date at the river: the song is Skriabin and Iryna Bilyk, "Movchaty" (a 2003 single).
  // Its words are never quoted, only named.
  river: {
    start: [
      "The Karpaty rattles along the dirt track through the fields. Svetka holds on to you and laughs every time you bounce over a pothole.",
      "The river past the village is pink with the sunset. You sit down on the grass under a willow, and you give her one of the earphones.",
      "You press Play. The tape hisses, and then Kuzma and Bilyk sing \"Movchaty\".",
      "Svetka: Oh, I know this one off the radio. Shh, don't talk over them.",
    ],
    choiceTitle: "The song's playing. What do you do?",
    speakChoice: "Tell her what you're thinking",
    silentChoice: "Keep quiet, like in the song",
    spoke: [
      "You: Svetka, I...",
      "Svetka: Shh. Listen to the end.",
      "She rests her head on your shoulder, and you realise you wouldn't have said anything cleverer anyway.",
    ],
    silent: [
      "You say nothing. Neither does Svetka. The song ends, the tape keeps hissing, and neither of you takes the earphones out.",
      "She rests her head on your shoulder. The mosquitoes are biting, but you don't move.",
    ],
    talk: [
      "Svetka: Are you here till the end of summer?",
      "You: Till the first of September.",
      "Svetka: That's ages yet, then. Just don't be like those city boys who go home and never even write a letter.",
      "You promise to write. She laughs: in Makitryne the post only comes twice a week.",
    ],
    home: [
      "You drop Svetka off at her gate and quietly wheel the Karpaty into Grandma's yard. It's night already.",
      "You don't rewind the tape. Let it stay right where it is.",
    ],
  },

  places: {
    yard: "Grandma's cottage",
    house: "Indoors",
    club: "The club and square",
    shop: "The shop",
    stop: "The bus stop",
    pond: "The pond",
    street: "The village road",
    mykola: "Mykola's yard",
    lyuba: "Granny Lyuba's yard",
    svitka: "The house across from the club",
    closed: "closed",
    closedYet: (name) => `${name}: the gate is shut and nobody's about. Maybe some other time.`,
  },

  house: {
    bedDay: "Sleep now? Grandma would decide you're ill and give you a spoonful of some tincture.",
    bedNight: ["The bed creaks like an old gate. You drop onto the pillow and never hear that stupid rooster in the yard."],
    tvDay: "It's soap operas on every channel in the daytime. TSN is on in the evening.",
    tvWaitTitle: "TSN isn't on until the evening. Wait?",
    tvWait: "Watch the soap until the evening",
    tvWaited: ["For the third episode running, someone in the soap can't remember whose daughter she is. By now neither can you. It's getting dark outside."],
    tvOver: "That's the end of the bulletin. Next up: washing powder ads and somebody's soap. You switch the TV off.",
    borscht: [
      "A pot of borscht on the stove, still warm. Next to it a note: \"Eat, you're skinny. Sour cream's in the fridge. Gran's asleep.\"",
      "You eat two platefuls and the world gets better.",
    ],
    borschtDone: "Another plate just won't fit. Maybe tomorrow.",
    varenyky: [
      "Under a towel, a bowl of sour cherry varenyky, the ones Grandma mentioned. They're even better cold.",
      "You eat the lot. Juice on your chin, conscience clear.",
    ],
    fridge: ["The old Dnipro hums like a tractor. You shut the door, and it shudders and hums even louder."],
    fridgeItems: ["Sour cream", "Pickles", "Salo", "Sausage", "Eggs", "Milk"],
  },

  tsn: [
    [
      "The TV warms up for a whole minute, then the titles swim out of the snow: TSN, on 1+1.",
      "Newsreader: Good evening. The main story today is bread. It's a sad harvest this year: thin fields and far less grain.",
      "Newsreader: Viktor Yanukovych's government urges everyone not to panic. The public has calmly and without any panic carried all the flour and groats out of the shops.",
      "Newsreader: The government promises to punish traders for unjustifiably dear bread. You think of Valya and feel truly sorry for the government.",
      "Newsreader: Parliament has allowed Ukrainian peacekeepers to go to Iraq, around one thousand seven hundred of them. The Socialists are against.",
      "Newsreader: They say it's over fifty degrees out there. In Makitryne that counts as good haymaking weather.",
    ],
    [
      "TSN carries on. The picture drifts a little, so you thump the side of the set. It helps.",
      "Newsreader: Sport. In May Andriy Shevchenko scored the deciding penalty in the Champions League final, and Milan won the cup. Since then every village has found an old man who personally taught him to shoot.",
      "Newsreader: Culture. Ukraine went to Eurovision for the first time. Oleksandr Ponomaryov, \"Hasta la vista\", Riga, fourteenth place.",
      "Newsreader: Opinion in Poltava region holds that with a song about a cherry orchard and a plate of varenyky, it would have been first.",
      "Newsreader: Politics. This year Leonid Kuchma also chairs the CIS Council of Heads of State. Pensions, meanwhile, are also chairing something: the list of Europe's smallest.",
      "Newsreader: And the weather. Tomorrow, heat in Poltava region. The Colorado beetle is pleased. Good night.",
    ],
  ],

  // Waiting for the evening by the club: the same day, a later part of it.
  evening: [
    "The sun is sinking behind the wheat. The cows are coming home from pasture, the sky over the club turns pink, and one by one the street lamps flicker on along the road.",
    "You sit on the bench with the lads, cracking sunflower seeds, until the speakers in the club start thumping.",
  ],

  afterDisco: ["The disco's over. Night, crickets, your ears still thumping. Time to go home: Grandma's probably left supper in the house."],

  sleep: ["You sleep.", "You dream that Tolik sells you to Valya for two hryvnias, and a Colorado beetle reads the news on TV."],

  morning: (day) => [`Day ${day}. The sun climbs in through the window, the rooster's yelling outside and something's frying in the kitchen.`],

  shop: {
    title: "What'll it be?",
    price: (n) => `${n} UAH`,
    leave: "Nothing, thanks",
    bag: (items) => `In the bag: ${items}`,
    // What he carries for the story (CARRIED in js/story.js).
    carried: {
      toolBox: "Did Petro's tool box",
      worms: "A tin of worms",
      battery: "Car battery",
      newBattery: "New car battery",
      catfish: "Catfish",
    },
    goods: {
      beer: "Beer",
      bread: "Dark bread",
      loaf: "White loaf",
      noodles: "Noodles",
      seeds: "Sunflower seeds",
      matches: "Matches",
      cigarettes: "Cigarettes",
      sugar: "Sugar",
      fish: "Tinned fish",
      oil: "Sunflower oil",
      chocolate: "Chocolate",
      sausage: "Sausage",
    },
    sold: {
      beer: "Beer.",
      bread: "Today's bread. Take it while it's warm.",
      loaf: "A white loaf, city style. Just right for you.",
      noodles: "You only have to add hot water. City food, ugh.",
      seeds: "Roasted seeds, Granny Lyuba made them. Don't spit the shells on my porch.",
      matches: "Matches. Just don't burn down your gran's shed.",
      cigarettes: "Cigarettes? Does your gran know? Well, I saw nothing.",
      sugar: "Sugar, weighed fair and square. Nearly.",
      fish: "Tinned fish. Enough for the winter. Or for this evening.",
      oil: "Our own oil, smells lovely. Take it to your gran.",
      chocolate: "Oh, and who's the chocolate for? Got your eye on a girl already?",
      sausage: "Today's sausage. Well, this week's.",
    },
  },

  hero: {
    places: {
      stop: "So this is Makitryne. No mobile signal, of course.",
      street: "",
      yard: "Grandma's yard. The fence has even more patches than I remember.",
      house: "It smells just like when I was a kid.",
      club: "The house of culture. No culture, but sometimes a disco.",
      shop: "\"Produkty\". I wonder if they have anything but bread and matches.",
      pond: "What a spot. Silence, mosquitoes and an old man on a bench.",
      mykola: "Mykola's yard. A white house under an apple tree, an old bicycle against the wall. Tidier than I expected.",
    },
    garden: "Hello again, Colorado beetles. Long time no see.",
    night: "It's night already. Better get home before Gran comes looking.",
    afterBeating: "Ow... Nice to meet you too.",
    morning: "Five more minutes... But try telling that to the rooster.",
    foundBeer: ["Oh. Someone didn't finish their beer... Well, two hryvnias don't lie around in the road."],
    drank: (n, total) => `Ah, that went down well! (${n}/${total})`,
  },

  objective: {
    goHome: "It's night. Go home to Grandma's cottage.",
    goToBed: "Go to bed. Supper and the news if you like.",
    morning: "A new day. Talk to Grandma in the yard.",
    findSvetka: "Look for Svetka. Maybe she's by the shop?",
    meetSvetka: "Svetka hangs around by the shop. Go over and say hello.",
    dateNext: "Svetka's by the shop. Ask her on a date.",
    datePlayer: "Get the cassette player from the backpack by Grandma's shed.",
    dateEvening: "In the evening, ride the moped to the shop to pick up Svetka.",
    dateGo: "It's evening. Ride the moped to the shop to pick up Svetka.",
    afterDate: "The summer goes on. Go to bed, tomorrow's a new day.",
    catfishGrandpa: "Did Petro called you to the pond: he promised to show you how to catch the catfish.",
    worms: "Dig worms in Grandma's yard, at the far end of the vegetable patch by the summer kitchen.",
    rodNight: "At night, to the pond to see Did Petro: the catfish comes out after dark.",
    battery: "You need a battery. The driver's Kopiyka sleeps out on the road by the club.",
    electroNight: "You've got the battery. At night — onto the footbridge at the pond.",
    sellCatfish: "Valya takes fish at night, through the shop's back door.",
    buyBattery: "The driver's got no battery, so there'll be no trip for the piglets. Valya has a new one, for a hundred hryvnias.",
    giveBattery: "Take the new battery to the driver, at his car.",
    afterCatfish: "The summer goes on. To be continued.",
    grandmaNews: "Grandma wanted to tell you something. She's in the yard.",
    sellPlayer: "Grandma's forty hryvnias short for the piglets. You could sell the player and a tape to Valya or Vovchyk.",
    earnMoney: "Grandma's forty hryvnias short for the piglets. You can earn money in the vegetable patch and at Valya's.",
    giveMoney: "Take Grandma the forty hryvnias for the piglets.",
    askTool: "The fence needs tools. Ask Did Petro at the pond.",
    fixFence: "Patch the hole in the fence: in Grandma's yard, left of the gate.",
    toMykola: "Mykola has the tool box: his gate is on the road, at the west end of the village. He sleeps in the daytime.",
    toolHome: "Take Did Petro's tool box to Grandma.",
    beerForMykola: "Mykola only teaches kung fu over beer. Buy four bottles at Valya's.",
    kungfu: "You've got the beer. In the evening — to Mykola's, for kung fu.",
    afterMykola: "The summer goes on. To be continued.",
    carryCrate: "Carry the crate to Valya's shop.",
    arrive: "Find Grandma's cottage — by the well, at the north end of the village.",
    water: "Fetch water from the well.",
    waterDone: "Take the water to Grandma.",
    beetles: "Pick the beetles off the potatoes.",
    beetlesDone: "Talk to Grandma.",
    sprayer: "Go to Did Petro at the pond for the sprayer.",
    sprayerBack: "Take the sprayer to Grandma.",
    spray: "Spray the potato patch.",
    sprayedTell: "Tell Grandma the potatoes are sprayed.",
    shop: "Buy bread and Mivina at Valya's shop.",
    shopDone: "Take the shopping to Grandma.",
    evening: "There's a disco at the House of Culture tonight.",
    eveningMetLads: "Talk to Grandma.",
    chickens: (n, total) => `Herd the chickens into the shed: ${n}/${total}`,
    moped: "Tell Grandma about the moped.",
    disco: "Become one of the locals and get into the disco.",
  },
};
