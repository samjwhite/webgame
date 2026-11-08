// Italian adaptation. Village folk speak a warm, colloquial Italian; names and brands stay Ukrainian.
TEXTS.it = {
  ui: {
    title: "Estate al villaggio",
    subtitle: "Regione di Poltava, 2003",
    continue: "Continua",
    newGame: "Nuova partita",
    language: "Lingua",
    tasks: "Compiti",
    toggleTasks: "Mostra o nascondi i compiti",
    money: (n) => `Soldi: ${n} grivnie`,
    checklistTitle: "Per entrare in discoteca:",
    checkBeer: (n, total) => `Bere 3 birre (${n}/${total})`,
    checkSuit: "Mettere la tuta",
    checkMoped: "Arrivare col motorino Karpaty",
    map: "Mappa",
    mapAlt: "Mappa del villaggio di Makitryne",
    mapClose: "Tocca per chiudere",
    action: "Azione",
    wellRaise: "Gira la manovella per tirare su il secchio: premi A o tocca lo schermo.",
    wellLower: "Gira la manovella per calare il secchio: premi A o tocca lo schermo.",
    wellFull: "Un secchio pieno d'acqua gelida! Fa male ai denti.",
    wellCold: "L'acqua del pozzo è fredda, freddissima.",
    garden: (n, total) => `Metti i coleotteri nel barattolo: ${n}/${total}`,
    day: (n, total, phase) => `Giorno ${n} / ${total} · ${phase}`,
    phases: { morning: "Mattina", day: "Pomeriggio", evening: "Sera", night: "Notte" },
    waitTitle: "La discoteca è solo stasera. Aspetti?",
    waitEvening: "Aspettare la sera qui, con i ragazzi",
    notYet: "Ho ancora da fare",
  },

  // Names over the dialog text. A line "Tolik: ..." is said by Tolik, and so on.
  speakers: {
    hero: "Tu",
    grandma: "Nonna Hanja",
    grandpa: "Nonno Petro",
    valya: "Valja",
    tolik: "Tolik",
    vovchik: "Vovchyk",
    sanya: "Sanja",
    svetka: "Svetka",
    stranger: "Ragazza sconosciuta",
    driver: "Autista",
    mykola: "Mykola",
  },

  intro: [
    "Estate 2003. Regione di Poltava, Ucraina.",
    "Il pulmino giallo Bohdan, linea 212, ha tossito, sbuffato e ti ha lasciato alla fermata del villaggio di Makitryne.",
    "Lo zaino l'autista ha promesso di lasciarlo da nonna Hanja: tanto passa davanti a casa sua. E a te, ha detto, fa bene fare due passi e vederti il villaggio.",
    "La nonna abita nella casetta vicino al pozzo, in fondo al villaggio, verso nord. Su, vai.",
  ],

  grandma: {
    arrive: [
      "Oh, chi è venuto a trovarci! Il mio nipotino! Ma quanto sei cresciuto, Dio ti benedica! In città mangiate solo salame, scommetto.",
      "Il tuo zaino l'ha già portato l'autista, è lì vicino alla rimessa. Qui non siamo a Kyiv, non ruba nessuno... o quasi.",
      "E adesso corri al pozzo a prendermi un po' d'acqua. Ci facciamo un tè dopo il viaggio.",
    ],
    waterWait: "Il pozzo è proprio lì, a sinistra. Gira la manovella, non la lingua.",
    waterDone: [
      "Ah, questa sì che è acqua! Mica come quella del vostro rubinetto, che puzza di cloro.",
      "Senti, tesoro, le patate sono piene di dorifore. Raccoglile in un barattolo, sennò si mangiano tutto fino alle radici.",
    ],
    beetlesWait: "Ce ne sono ancora, le vedo! Non mi servono gli occhiali per vedere una dorifora.",
    stopPicking: [
      "Ma che fai, le raccogli a mano? Prima che arrivi in fondo al filare, la prima pianta se la sono già mangiata.",
      "Vai allo stagno da nonno Petro. Fatti dare il suo aggeggio, che le spruzziamo.",
      "È lì sulla panchina vicino all'acqua. E dove vuoi che sia.",
    ],
    sprayerWait: "Petro è allo stagno, sulla panchina. Digli che ti manda Hanja per l'aggeggio, lui sa.",
    sprayerBrought: [
      "Oh, l'hai portato! E Petro te l'ha pure dato, guarda un po'. Vuol dire che gli sei piaciuto.",
      "Su, spruzza. Ma mettiti col vento alle spalle, sennò finisci come quelle dorifore — zampe all'aria.",
    ],
    sprayWait: "L'orto è proprio lì. Spruzza filare per filare, e non saltare neanche una pianta.",
    sprayDone: [
      "Questo sì che è lavoro! Adesso mangino pure, se ci riescono.",
      "Eccoti cinque grivnie, e non sprecarle. Corri al negozio da Valja: prendi il pane, e per te un pacchetto di quella Mivina — lo so che non ne puoi fare a meno.",
    ],
    shopWait: "Il negozio è più avanti sulla strada, oltre il circolo: c'è scritto \"Produkty\". Valja non la perdi: la sente tutta la strada.",
    shopDone: [
      "Pane fresco! Siediti, i varenyky alle ciliegie sono già in tavola.",
      "Dicono che stasera c'è la discoteca al circolo. Vai a vedere i nostri ragazzi.",
    ],
    eveningWait: "Su, vai al circolo, almeno vedi come si divertono i nostri.",
    eveningDone: ["Oddio, le galline! Sono scappate per tutto il cortile e c'è un falco che gira. Riportale nella rimessa mentre lavo i piatti."],
    chickens: (left) => `Le galline nella rimessa, tesoro! Ne corrono ancora ${left}. Non mordono... o quasi.`,
    moped: [
      "Ah, hai trovato il vecchio Karpaty del nonno? Ci andava al kolchoz tutti i giorni, pace all'anima sua.",
      "Prendilo, visto che l'hai trovato. Ma non ammazzarti, sennò poi ti ammazzo io.",
      "E non litigare coi ragazzi del posto, che sono... beh, li hai visti.",
      "Ah, e se raccogli un altro barattolo di dorifore — due grivnie a barattolo.",
    ],
    morning: [
      "Ti sei svegliato, festaiolo? Ti ho sentito inciampare sulla soglia, stanotte.",
      "Siediti e mangia. Poi magari raccogli un po' di dorifore, finché non fa caldo: di lavoro qui, figliolo, ce n'è per tutta l'estate.",
    ],
    // The morning after the date: grandpa wants the hero, and the driver will take her for piglets.
    morningCatfish: [
      "Ti sei svegliato? Petro è già passato due volte al cancello: \"Dov'è tuo nipote? Gli faccio vedere il pesce gatto\". Vai da lui allo stagno, sennò non ti molla più.",
      "E un'altra cosa: sabato l'autista, quello con la vecchia Kopijka, mi ha promesso di portarmi al capoluogo, a prendere i maialini. La sua macchina dorme sulla strada, vicino al circolo. Se lo vedi, ringrazialo, quel brav'uomo.",
    ],
    // The morning after grandpa's way.
    morningRod: [
      "Hai sentito? Petro gira per il villaggio da stamattina presto e racconta a tutti come \"io e il nipote di Hanja abbiamo preso il pesce gatto\". L'ha raccontato a Valja, l'ha raccontato all'autista, perfino alla mucca di nonna Ljuba l'ha raccontato.",
      "Dice che il pesce gatto era grande come mezzo stagno. Stamattina era ancora grande come mezza passerella. Va be', lasciamolo dire. Lo friggo per pranzo, ma a pulirlo ci pensi tu.",
    ],
    // Stage 3: the piglets need money, the fence needs mending.
    pigletAsk: [
      "Senti, figliolo. Sabato andiamo a prendere i maialini, ne prendo due. E i maialini, oggi, costano come l'oro. Mi mancano quaranta grivnie, e la pensione arriva solo tra una settimana.",
      "Magari ti inventi qualcosa tu? Sei di città, sei uno sveglio.",
      "E il recinto vicino all'orto è tutto bucato: da quel buco i maialini scappano in un giorno. Petro diceva che lui gli attrezzi ce li ha. Chiedi a lui.",
    ],
    pigletThought: "Ti tocchi la tasca: il walkman con gli Okean Elzy. Per quello, cinquanta grivnie forse te le danno.",
    pigletWait: "Quaranta grivnie, figliolo. Senza quelle niente maialini, a meno che nel porcile non ci vada io.",
    pigletThanks: "Oh, figliolo... Quaranta grivnie? E dove le hai prese? No, non dirmelo, non dirmelo. L'importante è che siano soldi onesti. Sono onesti, vero?",
    pigletHidden: "Annuisci. La nonna nasconde i soldi nel fazzoletto, il fazzoletto nell'armadio, e l'armadio lo chiude a chiave.",
    toolThanks: [
      "Oh, la cassetta degli attrezzi di Petro! Me l'hai portata fin da Mykola? Bravo. Lì dentro c'è il martello, il seghetto, i chiodi — il recinto lo rattoppi in un attimo.",
      "Solo, se Mykola ti chiama a bere la birra — tu non andarci. Quello, appena beve, comincia ad agitare braccia e gambe. Dice che è kung fu, figurati.",
    ],
    // The morning after the battery went missing.
    morningTheft: [
      "Oddio, che disgrazia! Stanotte hanno rubato la batteria dalla macchina dell'autista! Proprio davanti al circolo!",
      "Dice che finché non ne trova una nuova non va da nessuna parte. E sabato ci sono i maialini... Ma chi è stato, eh? Non dei nostri, di sicuro. I nostri non l'avrebbero fatto.",
    ],
    chatter: [
      "Le dorifore sono tornate. Riempi un barattolo e ti do due grivnie.",
      "Dove vai con quella tuta? Dai ragazzi? Va bene, vai, ma torna prima che faccia notte.",
      "Mangia, che sei magro come un palo. In città non vi danno da mangiare?",
    ],
    beerSmell: "Cos'è quest'odore? Ah, figliolo, figliolo... Tutto tuo nonno.",
    tracksuit: "Ma sei andato con quei jeans! La mamma ti ha messo la tuta nello zaino, quella vecchia della scuola, con le strisce. Lo zaino è vicino alla rimessa.",
    wakeFirst: [
      "Madonna santa! Chi ti ha conciato così, tesoro?",
      "Vicino al circolo, dici? Saranno Tolik e Vovchyk. Ogni estate accolgono così tutti quelli di città. Prima del matrimonio guarisce.",
    ],
    wakeAgain: ["Di nuovo?! Colleziona bernoccoli come Pinocchio. Mettici sopra una moneta di rame, aiuta."],
  },

  valya: {
    groceries: [
      "Ma guarda chi c'è! Il nipote di Hanja, quello di città! Oh, magro come uno spaghetto!",
      "Il pane? Fresco, arrivato stamattina. La Mivina prendila al pollo, è la più buona. Fanno cinque grivnie, giuste giuste.",
    ],
    waitingForCrate: "Le casse non camminano da sole, tesoro. Il camion è lì, vicino al recinto.",
    crateIn: (left) => `Così! Mettila lì. Ne mancano ancora ${left}.`,
    unloadDone: "Finito? Questo sì che è un uomo! Ecco le tue quattro grivnie — guadagnate onestamente.",
    unloadAsk: [
      "Senti, tesoro, è arrivato il camion della merce e il camionista, guarda un po', si è bloccato la schiena.",
      "Portami le casse dal camion e ti do quattro grivnie. Il camion è lì, vicino al recinto.",
    ],
    // The truck comes every morning; from the second time on.
    unloadAgain: [
      "Oh, tesoro, è arrivato di nuovo il camion, e il camionista si tiene di nuovo la schiena.",
      "Me le porti le casse? Quattro grivnie, come ieri.",
    ],
    idle: "Pane c'è, zucchero c'è, fiammiferi ci sono. Fidanzati no — sono andati tutti a Poltava.",
    noMoney: "Non ti bastano, tesoro. Gratis c'è solo il formaggio nella trappola. Vai a raccogliere dorifore dalla nonna Hanja.",
    noMoneyJob: " Oppure portami le casse.",
    noCredit: "E non segno sul quaderno, non chiedere. Vi conosco, voi di città: oggi qui, domani chissà — e addio dieci grivnie.",
    catfishDay: "Ma sei scemo? Girare per il villaggio in pieno giorno con un pesce gatto così? Vieni di notte, alla porta di servizio. E che nessuno ti veda.",
    batterySell: [
      "Una batteria? Ne ho una, una Ista, nuova di zecca, la tenevo per il mio compare. Cento grivnie.",
      "Dammi le cento. Oh, ma questi soldi li conosco: te li ho dati io, quella notte, per il pesce gatto.",
      "Cento giuste giuste. Vedi come va il mondo, tesoro: i soldi girano in tondo.",
    ],
    batteryNoMoney: "La batteria costa cento grivnie, tesoro. Senza cento non te la do, piangi pure quanto vuoi.",
    playerOffer: [
      "Valja: Dicono che hai un walkman, di quelli a cassette? Fammi vedere. Oh, gli Okean Elzy!",
      "Valja: Cercavo giusto un regalo per il compleanno di mia nipote. Ti do cinquanta grivnie. Di più non vale, non mercanteggiare.",
    ],
    beerForMykola: "È per Mykola? Eh, sì, sì. Quello mi deve ancora le sue da maggio. Va be', prendi, prendi.",
    firstBeer: "Birra? Hai diciott'anni? Eh, vedo, vedo — già spuntano i baffi. Due grivnie.",
    nextBeer: "Un'altra? Ah, questo ragazzo si perde... Due grivnie.",
    drink: (n, total) => `Apri la bottiglia lì sulla veranda e la bevi. Fresca, un po' amara. (${n}/${total})`,
  },

  grandpa: {
    greeting: "Oh, e tu di chi sei? Di Hanja? Be', siediti qui e ascolta il vecchio Petro — cose cattive non te ne dico.",
    sprayerStranger: "E tu di chi sei? Ah, il nipote di Hanja! Be', salve, cittadino. Che c'è, ti manda la nonna?",
    sprayerKnown: "Oh, ancora tu, nipote di Hanja. Che c'è, ti manda la nonna?",
    sprayer: [
      "L'aggeggio? Prendilo, è lì sotto il salice. Il serbatoio non perde, solo la cinghia è legata con un nodo — non scioglierlo, sennò si sfascia tutto.",
      "E non annusarlo troppo. Io una volta ne ho respirato un bel po' — ho visto il pesce gatto per due giorni.",
      "Anche se il pesce gatto lo vedo lo stesso. Vive proprio lì, sotto la passerella. Grosso come un cinghiale. Due volte l'ho avuto all'amo — e due volte è scappato.",
      "È furbo: di giorno se ne sta fermo, di notte esce. Un giorno ti faccio vedere come si prende. Se Hanja ti lascia uscire.",
    ],
    lines: [
      "Ricorda: chi si alza presto munge la mucca. Chi si alza tardi la cerca per tutto il villaggio.",
      "I nostri ragazzi non sono cattivi, ti studiano un po'. Quando sono tornato dal militare ci hanno messo sei mesi ad accettarmi.",
      "I soldi vanno e vengono. Ma la salute da Valja non la compri, anche se lei dice di avere tutto.",
      "Nella rimessa di Hanja c'è un motorino, un Karpaty. Va ancora — lo accendo ogni primavera.",
      "La moglie sceglila dal borsch, non da come balla. Il ballo finisce, il borsch è tutti i giorni.",
      "Ho fatto tre anni di militare, e sai cosa ho capito? Che a casa si sta meglio. Tutto qui.",
      "Non fare il passo più lungo della gamba. E non entrare al circolo prima di Tolik.",
      "Avevo una Zaporozhets, quella gobba. L'ho guidata trent'anni e non sono mai arrivato da nessuna parte senza un guasto. Però che risate.",
      "Il pane non si butta sul tavolo, e col temporale la televisione non si accende. Qui non è la città, i fulmini sono cattivi.",
      "Il mio vicino Mykola si è giocato mezzo stipendio alla lotteria Loto-Zabava. Ha vinto una volta — una maglietta. Adesso ci dorme.",
      "Ascolta il nonno: con l'ubriaco non discutere, col sobrio non bere, e con la nonna Hanja non discutere mai.",
      "Rosso di sera, domani vento. Meglio di qualsiasi previsione in televisione.",
      "Nel nostro stagno c'è un pesce gatto grosso come un cinghiale. L'ho visto con i miei occhi. Beh, quasi.",
      "Il pulmino per Poltava parte alle sette del mattino. Se dopo la discoteca ti alzi, sei un eroe.",
      "Kuchma in televisione dice di nuovo che si vive meglio. Gli credo. Ma provasse lui a vivere con la mia pensione.",
      "Con Kuchma è aumentato tutto, tranne la mia pensione. Quella è stabile, vedi. Stabilmente piccola.",
      "Una volta il salame costava due e venti — e c'era la carne dentro! E adesso? Carta che sa di salame.",
      "Hai mai mangiato la vera mortadella Doktorska? Appunto. Io sì. Quello sì che era salume — profumava tutta la casa.",
      "Le macchine come una volta non le fanno più. Il mio trattore YuMZ — trent'anni ad arare e niente. Adesso è tutto plastica.",
      "Il frigorifero Dnipro di Hanja sta lì dal settantanove. Ronza come un trattore, ma ghiaccia! Quelli nuovi durano un anno e poi in discarica.",
      "Quest'estate le dorifore toccherà spruzzarle più di una volta, sennò si mangiano le patate. Io una volta usavo il Decis — e quelle ingrassavano pure.",
      "La dorifora è come il fisco: avvelenala quanto vuoi, torna sempre.",
    ],
    // After the date: how to take the catfish, and the other way, mentioned "just so".
    catfishTalk: [
      "Oh, sei venuto! Siediti. Te l'avevo detto: il pesce gatto vive sotto la passerella. Grosso come un cinghiale.",
      "Si prende col verme, di notte, quando l'acqua si rinfresca. Scava un po' di vermi da Hanja, in fondo all'orto, vicino alla cucina estiva — lì sono grassi come salsicce. E vieni quando fa buio: ci sediamo sulla passerella.",
      "Il mio vicino Mykola una volta voleva prenderlo con la corrente. Una batteria, due fili — e addio pesce. Gli ho detto: questa non è pesca, è roba da ladri.",
      "Anche se Valja, per un pesce gatto così, cento grivnie forse le darebbe. Non dico che bisogna farlo. Dico così, per dire.",
    ],
    wormsWait: "Senza vermi non venire neanche. Il pesce gatto non è una mucca, l'erba non la mangia. Scava da Hanja, in fondo all'orto.",
    rodWait: ["Hai i vermi? Così si fa. Solo che adesso il pesce gatto dorme, come Mykola dopo la paga. Andiamo quando fa buio."],
    // Stage 3: his tool box is at Mykola's.
    toolAtMykola: [
      "Gli attrezzi? Certo che ce li ho. Solo che sono da Mykola. Se li è fatti prestare in primavera: \"Per una settimana, Petro, una settimana sola\". Ormai è estate, e quella settimana non è ancora finita.",
      "Vai a riprenderli. Il suo cancelletto è sulla strada, in fondo al villaggio: uno di legno, vicino a una casa bianca sotto un melo.",
      "Solo non andarci di giorno: Mykola di giorno dorme come un ghiro. Verso sera, quando senti parlare la sua televisione — allora sì.",
    ],
    rodNight: ["Zitto. Siediti sulla passerella e lancia sotto il palo. E non respirare."],
    // Added to his sayings after grandpa's way.
    brag: [
      "Te lo ricordi, quel pesce gatto che abbiamo preso... Cioè, tu tiravi e io dirigevo.",
      "Il pesce gatto era grande così. No, così! Be', l'hai visto anche tu. E io — quasi.",
    ],
  },

  yard: {
    backpackEmpty: "Nello zaino sono rimasti uno spazzolino e il panino del viaggio, che ormai è meglio non mangiare.",
    backpackOpen: [
      "Apri lo zaino: uno spazzolino, il walkman, delle cassette... e sul fondo la tua vecchia tuta Adidas della scuola, con le tre strisce e le ginocchia sformate.",
      "Altri vestiti di ricambio non ne hai: la mamma l'aveva messa \"per ogni evenienza\". Ti cambi. Adesso sembri quasi uno del posto... quasi.",
    ],
    takePlayer: [
      "Tiri fuori dallo zaino il walkman, le cuffie e le tue cassette: gli Okean Elzy e una di Skriabin, registrata dalla radio.",
      "Sulla cassetta di Skriabin c'è \"Movchaty\", quella con Iryna Bilyk. L'inizio è un po' tagliato: hai aspettato che lo speaker smettesse di parlare e hai premuto REC troppo tardi.",
    ],
    jarsDone: "Per oggi di dorifore ne hai raccolte abbastanza. Domani ne arriveranno di nuove dai vicini.",
    shedChickens: "La rimessa è aperta, ma le galline non entrano. Bisogna spingerle dentro.",
    shedLocked: "La rimessa è chiusa col chiavistello. Puzza di benzina e di cacca di gallina.",
    shedFound: [
      "Tutte le galline sono nella rimessa. E cos'è quella cosa sotto il telone nell'angolo?..",
      "Un motorino Karpaty! Del nonno, dei tempi in cui il salame costava due e venti.",
    ],
    mopedAgain: "Brum-brum! Si parte.",
    mopedStart: [
      "Dai un colpo al pedale, due... il Karpaty starnutisce, tossisce — e parte! Brum-brum-brum!",
      "Per scendere, premi A dove non c'è nessuno con cui parlare.",
    ],
    statue: [
      [
        "Una statua in mezzo alla piazza. Testa stempiata, braccio teso in avanti e sotto il naso dei baffi, chiaramente dipinti dopo.",
        "Dicono che una volta qui ci fosse Lenin. Con l'indipendenza il consiglio del villaggio non aveva soldi per una statua nuova — e così gli hanno dipinto i baffi e via.",
        "Adesso non si capisce più: è Lenin o è Shevchenko?",
      ],
      ["Sul piedistallo, vernice fresca: \"T. H. Shevchenko\". Ma se guardi bene, sotto si legge ancora \"V. I.\""],
      ["Neanche i piccioni hanno capito chi sia. Però ci si posano sopra volentieri lo stesso."],
    ],
    handsFull: "Hai le mani occupate. Porta la cassa a Valja.",
    takeCrate: (n, total) => `Prendi una cassa. Pesante, accidenti — saranno scatolette. (${n}/${total})`,
    jarMore: "Un altro barattolo di dorifore — continuano ad arrivare dai vicini, lì non spruzza nessuno. La nonna dalla porta: \"Bravo! Eccoti due grivnie\".",
    spray: [
      "Pompi il serbatoio, ti metti la cinghia in spalla e parti lungo i filari. Pssst... pssst...",
      "Le dorifore cadono dalle foglie come gli ubriachi dalla panchina. Le patate sono bagnate e amare, e tu puzzi come il magazzino del kolchoz.",
      "Quando arrivi all'ultimo filare, il sole è già sopra la casa. Ora di pranzo.",
    ],
    clubClosed: ["Prima passa dalla nonna, sei appena arrivato. Il circolo non scappa."],
    noMopedInside: ["Il motorino in casa? La nonna vi butta fuori tutti e due. Prima scendi."],
    shopClosed: ["Un lucchetto alla porta e un cartone: \"Chiuso. Torno domattina.\" Di notte non si sente nemmeno Valja."],
  },

  lads: {
    // They envy his new city clothes a little, but never say so: he just "doesn't fit in".
    noSuit: [
      "Tolik: Però, che jeans. Nuovi nuovi, scommetto che sanno ancora di negozio.",
      "Tolik lo dice come se niente fosse, ma le tue scarpe da ginnastica le guarda un po' più a lungo del necessario.",
      "Tolik: Solo che così non sei dei nostri. Un damerino fatto e finito. Da noi conciato così non si viene — vai a metterti qualcosa da cristiani.",
    ],
    sober: "Vovchyk: Sobrio come il nostro agronomo prima della paga. Almeno una birra per farti coraggio.",
    weakBeer: "Vovchyk: Sai di birra, ma come se l'avessi solo annusata.",
    onFoot: "Sanja: A piedi? Perfino il vecchio Petro veniva in discoteca in bicicletta.",
    noticeSuit: "Tolik: Ti sei messo l'Adidas — oh, adesso sembri una persona.",
    noticeBeer: "Vovchyk: Oh, sai di birra come dopo la fienagione. Giusto, uno dei nostri.",
    noticeMoped: "Sanja: E sei arrivato col Karpaty del nonno! Pensavo l'avessero venduto a pezzi da un pezzo.",
    friends: [
      "Tolik: Domattina andiamo allo stagno a pescare carassi. Quando ti svegli, vieni.",
      "Vovchyk: Papà dice che giovedì portiamo il fieno. Se dai una mano, ti versa il latte appena munto.",
      "Sanja: Con Svetka non metterti troppo in mostra. Tolik sta zitto, ma vede tutto.",
      "Tolik: Sabato partita sul prato, noi contro Mykhailivka. Vai in porta?",
      "Vovchyk: Al circolo la cassetta dei Ruki Vverkh si è mangiata di nuovo il nastro. Mezza serata a riavvolgerla con la matita.",
      "Sanja: Io alle cinque devo portare la mucca alla mandria. Ecco la mia discoteca: ballo fino alle due, pascolo dalle cinque.",
    ],
    playerOffer: [
      "Vovchyk: Ehi, è un walkman quello? Fammi vedere. Oh, gli Okean Elzy! Me lo vendi? Ti do cinquanta.",
      "Vovchyk: Lo mettiamo su al circolo. Che da noi c'è una cassetta sola dei Ruki Vverkh, e pure masticata.",
    ],
    playerPlays: [
      "Vovchyk: Il tuo ex walkman al circolo non lo spegniamo mai. Gli Okean Elzy ormai li sappiamo a memoria, perfino Sanja.",
      "Sanja: Vovchyk adesso dorme con le cuffie. Dice che gli viene in sogno Vakarchuk.",
    ],
    readyEarly: [
      "Tolik: Ecco, così va meglio! Solo che sei arrivato presto. La discoteca è stasera, quando tornano le mucche.",
      "Vovchyk: Puoi sederti qui con noi. Abbiamo i semi.",
    ],
    welcome: [
      "Tolik: Allora, è sera. Entra, ma non pestare i piedi alle ragazze.",
      "Vovchyk: Tieni, semi di girasole, li ha tostati nonna Ljuba.",
      "Tolik: E Svetka non toccarla.",
      "Chi sia Svetka, non lo sai. Ma per sicurezza te lo segni.",
    ],
    firstMeet: [
      "Tolik: Ehi, e questo chi è, tutto pulito e lucido? Ti sei perso?",
      "Vovchyk: È il nipote di Hanja, quello di città. Stamattina è sceso dal Bohdan tutto vestito nuovo, come un turista.",
      "Sanja: Vuoi andare in discoteca? Qui non si entra così — prima dimostraci che non sei fatto d'asfalto.",
    ],
    again: "Tolik: Oh, sei tornato? Testardo come la capra di nonna Hanja.",
    beforeBeating: [
      "Vovchyk: Non prendertela, da noi si fa così.",
      "Sanja: Chi arriva e non è dei nostri, noi lo \"presentiamo\" un po' al villaggio.",
    ],
  },

  beaten: [
    "SBAM! BUM! CRAC!",
    "Per pura formalità, senza cattiveria, ti strapazzano un po', come si fa con i nuovi. Tutto diventa buio...",
  ],

  disco: {
    start: [
      "Luci che lampeggiano, la palla a specchi che gira, le casse che pompano così forte che tremano i vetri.",
      "Balli con i ragazzi come mai in vita tua. Stasera non sei quello di città. Stasera sei uno di loro.",
    ],
    notice: [
      "Vicino alla cassa balla una ragazza che non hai mai visto. Coda di cavallo castana con un elastico rosso, camicetta rosso scuro, gonna di jeans sbiadita, e ride come se questo non fosse il circolo del villaggio, ma il mare.",
    ],
    choiceTitle: "La ragazza vicino alla cassa. Che fai?",
    goOver: "Avvicinarti e invitarla a ballare",
    keepDancing: "Continuare a ballare con i ragazzi",
    approach: [
      "Tu: Balliamo?",
      "Ragazza sconosciuta: Sei tu quello di città, il nipote di Hanja? Dai, va bene. Basta che non mi pesti i piedi.",
      "Ballate sui Ruki Vverkh. Lei sa tutte le parole, tu solo \"la-la-la\".",
      "Vovchyk: Svetka! Tua madre ha detto a casa entro le undici!",
      "Ah. Ecco chi è Svetka.",
      "Svetka: Io non vado da nessuna parte. Ancora una.",
    ],
    afterTitle: "Tolik ha detto di non toccare Svetka. E adesso?",
    afterOptions: {
      stayed: "Restare con lei",
      warned: "Dirle dell'avvertimento di Tolik",
      left: "Ringraziarla e tornare dai ragazzi",
    },
    afterDance: {
      stayed: [
        "Resti. Un lento, gli Okean Elzy. Lei ti mette le mani sulle spalle, e ti dimentichi di contare i passi.",
        "Svetka: La mattina vado al negozio. Così, per dire.",
        "Decidi: devi invitarla da qualche parte come si deve. A un appuntamento.",
      ],
      warned: [
        "Tu: Mi hanno detto di non toccarti.",
        "Svetka: Chi l'ha detto? Tolik? Che vada a toccare le sue mucche.",
        "Lei ride, ma per un attimo guarda verso i ragazzi.",
        "Decidi: devi chiederle un appuntamento. Meglio in un posto dove non guarda nessuno.",
      ],
      left: [
        "Tu: Grazie per il ballo. Torno dai miei.",
        "Svetka: E vai, \"uno di loro\".",
        "Ti allontani, e lei ti guarda andare via. Anche Tolik ti guarda.",
        "Decidi: la prossima volta le chiederai un appuntamento. Senza testimoni.",
      ],
    },
    withLads: [
      "Resti con i ragazzi. La ragazza con la coda di cavallo gira da sola, come se non avesse bisogno di nessuno.",
      "Sanja: Che c'è, ti sei incantato? Quella è Svetka. Proprio lei.",
      "Tolik: Te l'avevo detto — non toccarla.",
      "Ecco chi è Svetka. Continui a ballare, ma ormai non guardi più i ragazzi.",
    ],
  },

  // Svetka by the shop, from the day after the first disco.
  svetka: {
    firstMeet: [
      "Accanto al tavolino sotto l'ombrellone c'è Svetka con una gazzosa Sytro. Proprio lei, quella della discoteca.",
      "Svetka: Oh, il nipote di Hanja. In discoteca saltavi coi ragazzi così forte che pensavo crollasse il circolo.",
      "Tu: Ti ho vista. Cioè, là. Vicino alla cassa.",
      "Svetka: Lo so che mi hai vista. Svetka. Resta un po', visto che sei venuto.",
      "Parlate un po' di tutto: di Kyiv, delle mucche e del fatto che a Makitryne, per divertirsi, ci sono solo il circolo e lo stagno.",
    ],
    firstMeetStranger: [
      "Accanto al tavolino sotto l'ombrellone c'è una ragazza con una gazzosa Sytro.",
      "Ragazza sconosciuta: Che guardi? Non mordo.",
      "Svetka: Svetka. E tu sei il nipote di Hanja, lo so. Qui tutti sanno tutto.",
      "Parlate un po' di tutto: di Kyiv, delle mucche e del fatto che a Makitryne, per divertirsi, ci sono solo il circolo e lo stagno.",
    ],
    afterDance: [
      "Accanto al tavolino sotto l'ombrellone c'è Svetka con una gazzosa Sytro.",
      "Svetka: Oh, il ballerino. Piedi interi? I miei a malapena.",
      "Tu: Quella sera non ti ho pestato troppo i piedi?",
      "Svetka: Tre volte. Ma non porto rancore: le conto come una.",
    ],
    dateIntent: [
      "La guardi ridere e capisci: devi chiederle un appuntamento. Solo che qui, dove si portano le ragazze?",
      "E poi ti viene in mente: il fiume fuori dal villaggio, il tramonto, e tu hai il walkman con la cassetta di Skriabin.",
    ],
    askAgain: "Svetka: Allora, hai deciso dove portarmi? Basta che non sia allo stagno da nonno Petro.",
    inviteTitle: "Chiedere a Svetka un appuntamento?",
    inviteRiver: "Invitarla al fiume stasera, ad ascoltare Skriabin",
    inviteLater: "Un'altra volta",
    notNow: "Alla fine non ce la fai. Svetka finisce la sua Sytro e ti guarda come se sapesse lo stesso cosa volevi dirle.",
    invite: [
      "Tu: Andiamo al fiume stasera? Col motorino. Ho il walkman, e Skriabin, \"Movchaty\".",
      "Svetka: Col tuo Karpaty? Ma ci arriva?",
      "Tu: Ci arriva. Parte al secondo colpo di pedale.",
      "Svetka: Be'... va bene. Quando tramonta il sole, passa a prendermi qui, al negozio. A mia madre dico che sono da Olka.",
    ],
    playerAtHome: "Il walkman, tra l'altro, è rimasto nello zaino vicino alla rimessa della nonna. Bisogna andare a prenderlo.",
    waitPlayer: [
      "Svetka: E il walkman? Avevi promesso Skriabin.",
      "Il walkman è rimasto nello zaino vicino alla rimessa della nonna.",
    ],
    waitMoped: ["Svetka: Al fiume a piedi? Ma è fuori dal villaggio. Vai a prendere il tuo Karpaty, ti aspetto."],
    waitEvening: ["Svetka: È ancora giorno. Ho detto stasera. Quando sono passate le mucche."],
    waitTitle: "Manca ancora tanto alla sera. Aspetti con Svetka?",
    waitHere: "Restare con lei davanti al negozio fino a sera",
    eveningFalls: [
      "Il sole tramonta. Valja porta uno sgabello sulla veranda e sgranocchia semi, mentre Svetka ti racconta chi nel villaggio non si saluta con chi, e perché.",
      "Svetka: Dai, andiamo, finché mia madre munge la mucca.",
    ],
    letsGo: ["Svetka: Oh, sei arrivato. E il walkman l'hai preso? Dai, andiamo, finché mia madre munge la mucca."],
    // After the river.
    later: [
      "Svetka: Valja mi ha già chiesto se tra noi è una cosa seria. Le ho detto che non sono affari suoi.",
      "Svetka: Quella sera torno a casa dal fiume e mia madre: \"Dove sei stata?\" E io: \"Da Olka.\" E intanto avevo l'erba nei capelli.",
      "Svetka: Dovrei andare a casa, a prendere la mucca dalla mandria. Ma resto ancora un po'.",
    ],
  },

  // The catfish under the boardwalk (summer story, stage 2): with grandpa on a rod, or alone at night with
  // the driver's battery.
  catfish: {
    choiceTitle: "Come prenderai il pesce gatto?",
    rod: "Con nonno Petro, con la canna e il verme",
    electro: "Da solo, di notte, con la corrente — e venderlo a Valja",
    rodChosen: [
      "Tu: Nonno Petro, vengo. Con i vermi.",
      "Nonno Petro: Ecco, bravo. E la corrente lasciala a Mykola. Tanto nella vita si è già lasciato scappare tutto.",
    ],
    electroChosen: [
      "Tu: Va bene. Ci penso, nonno.",
      "Fai di sì col capo al nonno, ma intanto pensi alle cento grivnie. E alla Kopijka dell'autista sulla strada vicino al circolo: sotto il cofano c'è una batteria.",
    ],
    worms: [
      "Scavi in fondo all'orto, vicino alla cucina estiva. I vermi sono grassi come salsicce: il nonno non ha detto bugie.",
      "Ne riempi un intero barattolo dei cetrioli e lo chiudi con un coperchio bucherellato.",
    ],
    nightTitle: "Il pesce gatto esce di notte. Aspetti?",
    waitNight: "Aspettare qui che faccia buio",
    rodCatch: [
      "Notte. Sullo stagno la nebbia, sull'acqua la luna. Nonno Petro è seduto sulla panchina e dice che non dorme.",
      "Nonno Petro: Non dormo. Penso.",
      "Lanci sotto la passerella. Il galleggiante sta fermo come piantato. Il nonno pensa sempre più forte: ronf... ronf...",
      "E all'improvviso la canna si piega ad arco! Tiri, il filo vibra, l'acqua vicino al palo ribolle...",
      "Dall'acqua scura spunta la testa del pesce gatto, con dei baffi come quelli della statua in piazza.",
      "Lo tiri su sulla passerella. Il pesce gatto è grosso come un cinghiale. Nonno Petro russa.",
      "Nonno Petro: Eh? Che c'è? Tira! Tira, ti dico! ...Oh. L'hai già tirato su. Be', te l'avevo detto: sotto la passerella.",
      "Nonno Petro: Anche le altre due volte è andata così: io mi appisolo — e lui abbocca. Ma pazienza: l'importante è che l'abbiamo preso. L'abbiamo preso insieme, vero?",
    ],
    carLook: ["Una vecchia Kopijka azzurra, la prima Zhiguli. Ruggine, portapacchi sul tetto, una mosca sul vetro. Una belva di macchina."],
    carNotNow: ["Di giorno intorno alla macchina c'è gente: l'autista ci armeggia, le donne vanno al negozio. Di notte è un'altra storia."],
    carTake: [
      "Notte. Il villaggio dorme, solo da qualche parte abbaia un cane.",
      "Sollevi piano il cofano. Chiave del dieci, due morsetti... La batteria pesa come un sacco di patate.",
      "Abbassi il cofano e te ne vai senza voltarti. Il cuore ti batte come le casse del circolo.",
    ],
    carEmpty: ["Il cofano è alzato, e al posto della batteria c'è solo il vuoto e due capi di filo. Distogli lo sguardo."],
    boardwalk: ["La vecchia passerella, con le assi che scricchiolano. L'acqua lì sotto è scura e profonda: se un pesce gatto vive da qualche parte, è qui."],
    boardwalkDay: ["Di giorno intorno allo stagno ci sono persone e mucche. Sulla passerella con una batteria — solo di notte."],
    electroCatch: [
      "Notte. Avvolgi i fili presi nella rimessa intorno a un bastone, li attacchi alla batteria e sali sulla passerella.",
      "Ti tremano le dita. Cali i fili in acqua, sotto il palo...",
      "Un lampo! L'acqua sotto la passerella si illumina di blu, tutto lo stagno sussulta.",
      "Dal fondo viene a galla il pesce gatto: grosso come un cinghiale, stordito, coi baffi allargati.",
      "Lo afferri per le branchie e lo trascini a riva. E proprio allora la batteria scivola giù dalla passerella — plof! — e va a fondo, a trovare i parenti del pesce gatto.",
      "Ecco fatto. Adesso il pesce gatto c'è, e la batteria no.",
    ],
    sale: [
      "Bussi alla porta di servizio del negozio. Per un bel po' niente. Poi dei passi, e il chiavistello scatta.",
      "Valja: Chi è a quest'ora di notte? ...Oh, mamma mia. E questo dove l'hai preso?",
      "Tu: Con la canna.",
      "Valja: Sì, sì. Con la canna. E io sono una ballerina. Dai, entra, prima che ti veda qualcuno.",
      "Valja pesa il pesce gatto sulla stadera, scuote a lungo la testa e conta i soldi.",
      "Valja: Cento grivnie, giuste giuste. E tu non mi hai vista, e io non ti ho visto.",
    ],
  },

  // The driver, by his car on the road.
  driver: {
    idle: [
      "Autista: Oh, il nipote di Hanja! Di' alla nonna: sabato andiamo a prendere i maialini, come d'accordo. La macchina è una belva!",
      "Autista: Una Kopijka, la Zhiguli del settantotto. Mi sopravvivrà, vedrai.",
      "Autista: La benzina aumenta, la pensione no. Ma pazienza, sabato ci andiamo lo stesso.",
    ],
    robbed: [
      "Autista: Hai visto? Hai visto?! La batteria! Di notte! Proprio davanti al circolo!",
      "Autista: Se lo prendo, quel ladro... Io lo... Puah! Finché non ne trovo una nuova, non vado da nessuna parte. E in un villaggio dove la trovi?",
    ],
    rant: [
      "Senza dire niente, metti la batteria nuova accanto alla macchina.",
      "Autista: Nuova?! Una Ista? Ma dove l'hai... Da Valja? Però, ragazzo, sei proprio un fenomeno!",
      "Autista: E ti dico io cosa gli farei, a quel ladro, se lo prendessi. Io gli...",
      "Seguono alcuni minuti di roba che nei libri non si stampa. Sul ladro scopri un sacco di cose nuove.",
      "Autista: ...e poi dritto nello stagno. Dal pesce gatto!",
      "Annuisci e guardi da un'altra parte. Meno male che sei stato zitto. E peccato che ci fosse qualcosa da tacere.",
      "L'autista stringe i morsetti. La Kopijka starnutisce e si accende. Autista: Sabato si va a prendere i maialini! Dillo alla nonna.",
    ],
    after: [
      "Autista: La macchina è una belva! E adesso pure con un cuore nuovo.",
      "Autista: Il ladro non l'hanno mai trovato. Ma io me lo ricordo. Io mi ricordo tutto.",
    ],
  },

  // Selling the cassette player with the Okean Elzy tape (stage 3).
  player: {
    title: "Vendere il walkman per cinquanta grivnie?",
    sell: { valya: "Venderlo a Valja", vovchik: "Venderlo a Vovchyk" },
    keep: "No, non lo vendo",
    kept: "Ti rimetti il walkman in tasca. Ci penserai ancora.",
    valya: [
      "Tiri fuori la cassetta di Skriabin e te la metti in tasca. Quella non la vendi, neanche per cento.",
      "Valja: Ecco qua. Cinquanta grivnie, giuste giuste. Mia nipote sarà contenta, e tu hai i soldi in tasca.",
    ],
    vovchik: [
      "Tiri fuori la cassetta di Skriabin e te la metti in tasca. Quella non la vendi, neanche per cento.",
      "Vovchyk: Tieni, cinquanta. Ecco fatto, adesso al circolo c'è la musica. Vieni ad ascoltare — gratis.",
    ],
  },

  // Mykola, grandpa's neighbour: asleep all day, Bruce Lee every evening (stage 3).
  mykola: {
    asleep: [
      "La porta è chiusa. Da dentro si sente russare, così forte che tremano i vetri. Mykola di giorno dorme.",
    ],
    waitTitle: "Mykola si sveglia verso sera. Aspetti?",
    waitHere: "Sedersi sulla panchina fino a sera",
    evening: [
      "Il sole tramonta. In casa si accende la televisione, e dalla finestra si sente: \"Hi-yaaa!\" e degli spari.",
      "La porta cigola. Sulla veranda esce Mykola in canottiera, con una bottiglia in mano, e ti squadra strizzando gli occhi.",
    ],
    firstMeet: [
      "Mykola: Oh. E tu di chi sei? Di Hanja? Ah, quello di città che scorrazza per il villaggio sul Karpaty del nonno... Sì, sì, ho sentito.",
      "Tu: Nonno Petro mi manda per la cassetta degli attrezzi. Quella che lei si è fatto prestare in primavera.",
      "Mykola: Gli attrezzi di Petro? Ah, la cassetta verde. Aspetta qui che te la porto.",
      "Mykola sparisce nell'ingresso, fa sbatacchiare dei secchi e torna con una cassetta verde tutta scrostata.",
      "Mykola: Tieni, portala a Petro. Tanto io la usavo solo per aprire le bottiglie.",
      "Prendi la cassetta. Pesa da tirarti giù le braccia.",
      "Mykola: E con Tolik come va? Quello concia tutti quelli di città, vicino al circolo, lo so.",
      "Mykola: Senti qua. Ti insegno il kung fu. Quello vero, come Bruce Lee. Quel Bruce Lee l'ho visto duecento volte.",
      "Mykola: Solo che il kung fu a secco non s'insegna. Portami la birra. Quattro bottiglie — due a testa.",
    ],
    noBeer: "Mykola: Il kung fu a secco non s'insegna. Quattro bottiglie, ho detto. Valja ce l'ha.",
    lesson: [
      "Mykola apre la birra sullo spigolo del tavolo e accende il videoregistratore. Sullo schermo c'è Bruce Lee, un po' verde e tutto a righe.",
      "Mykola: Guarda qua. La posizione della gru. Gamba su, braccia così... e respiri.",
      "Mykola sta su una gamba sola per tre secondi, più o meno. Poi barcolla e si aggrappa alla credenza. La credenza tintinna.",
      "Mykola: L'ho fatto apposta. È una finta. Il nemico pensa che cado, e invece io — non cado!",
      "Ne bevete un'altra a testa. Mykola riavvolge la cassetta, ti fa vedere un colpo, una parata, di nuovo un colpo. Tu ripeti.",
      "Mykola: Oh! Così va bene. L'importante è non agitare le braccia come un mulino a vento. Colpisci una volta sola, ma in modo che quello poi ci pensi per un bel pezzo.",
      "Mentre torni a casa, le mani si mettono in posizione da sole. Quasi quasi ci credi, di aver imparato qualcosa.",
    ],
    later: [
      "Mykola: Allora, la gru la alleni? Allenala. Neanche Bruce Lee è nato imparato.",
      "Mykola: Di' a Petro che la cassetta te l'ho data. Che non vada in giro a dire che me la sono bevuta.",
      "Mykola: Al Loto-Zabava ho perso di nuovo. Però stavolta la maglietta non me l'hanno data — vuol dire che la fortuna deve ancora arrivare.",
    ],
  },

  // The date at the river: the song is Skriabin and Iryna Bilyk, "Movchaty" (a 2003 single).
  // Its words are never quoted, only named.
  river: {
    start: [
      "Il Karpaty borbotta sulla strada sterrata tra i campi. Svetka si tiene stretta a te e ride ogni volta che una buca vi fa sobbalzare.",
      "Il fiume fuori dal villaggio è rosa di tramonto. Vi sedete sull'erba sotto un salice e le dai un auricolare.",
      "Premi \"Play\". Il nastro fruscia, poi Kuzma e la Bilyk cantano \"Movchaty\".",
      "Svetka: Oh, questa la conosco, l'ho sentita alla radio. Zitto, non interromperli.",
    ],
    choiceTitle: "La canzone suona. Che fai?",
    speakChoice: "Dirle quello che pensi",
    silentChoice: "Stare zitto, come nella canzone",
    spoke: [
      "Tu: Svetka, io...",
      "Svetka: Sst. Ascolta fino alla fine.",
      "Lei ti appoggia la testa sulla spalla, e capisci che tanto non avresti detto niente di più intelligente.",
    ],
    silent: [
      "Non dici niente. Neanche Svetka. La canzone finisce, il nastro continua a frusciare, e nessuno dei due si toglie l'auricolare.",
      "Lei ti appoggia la testa sulla spalla. Le zanzare pungono, ma tu non ti muovi.",
    ],
    talk: [
      "Svetka: Resti qui fino alla fine dell'estate?",
      "Tu: Fino al primo settembre.",
      "Svetka: Allora c'è ancora tempo. Solo non fare come quelli di città, che partono e non scrivono neanche una lettera.",
      "Prometti di scriverle. Lei ride: a Makitryne la posta arriva due volte a settimana.",
    ],
    home: [
      "Riaccompagni Svetka fino al suo cancello e spingi piano il Karpaty nel cortile della nonna. È già notte.",
      "Non riavvolgi la cassetta. Che resti lì dov'è.",
    ],
  },

  places: {
    yard: "La casa della nonna",
    house: "In casa",
    club: "Il circolo e la piazza",
    shop: "Il negozio",
    stop: "La fermata dell'autobus",
    pond: "Lo stagno",
    street: "La strada del villaggio",
    mykola: "Il cortile di Mykola",
    lyuba: "Il cortile di nonna Ljuba",
    svitka: "La casa di fronte al circolo",
    closed: "chiuso",
    closedYet: (name) => `${name}: il cancello è chiuso e non si vede nessuno. Magari un'altra volta.`,
  },

  house: {
    bedDay: "Dormire di giorno? La nonna penserà che sei malato e ti darà un cucchiaio di qualche intruglio.",
    bedNight: ["Il letto cigola come un vecchio cancello. Cadi sul cuscino e non senti più quello stupido gallo in cortile."],
    tvDay: "Di giorno su tutti i canali ci sono le telenovelas. Il TSN va in onda la sera.",
    tvOver: "Il notiziario è finito. Adesso pubblicità di detersivi e una telenovela qualsiasi. Spegni il televisore.",
    borscht: [
      "Sui fornelli una pentola di borsch ancora calda. Accanto un biglietto: \"Mangia, che sei magro. La panna acida è in frigo. La nonna dorme.\"",
      "Ne mangi due piatti, e il mondo migliora.",
    ],
    borschtDone: "Un altro piatto proprio non ci sta. Magari domani.",
    varenyky: [
      "Sotto un canovaccio, una ciotola di varenyky alle amarene, proprio quelli di cui parlava la nonna. Freddi sono ancora più buoni.",
      "Li mangi tutti. Succo sul mento, coscienza pulita.",
    ],
    fridge: ["Il vecchio Dnipro ronza come un trattore. Chiudi lo sportello: sussulta e ronza ancora più forte."],
    fridgeItems: ["Panna acida", "Cetrioli", "Lardo", "Salame", "Uova", "Latte"],
  },

  tsn: [
    [
      "Il televisore si scalda per un minuto buono, poi dalla neve emerge la sigla: TSN, su 1+1.",
      "Annunciatrice: Buonasera. La notizia del giorno è il pane. Quest'anno il raccolto è triste: campi radi e molto meno grano.",
      "Annunciatrice: Il governo di Viktor Janukovych invita a non farsi prendere dal panico. La popolazione, calma e senza alcun panico, ha portato via dai negozi farina e cereali.",
      "Annunciatrice: Il governo promette punizioni ai commercianti per il pane ingiustificatamente caro. Pensi a Valja e provi una sincera pena per il governo.",
      "Annunciatrice: Il parlamento ha autorizzato l'invio in Iraq di peacekeeper ucraini, circa millesettecento. I socialisti sono contrari.",
      "Annunciatrice: Dicono che laggiù ci siano più di cinquanta gradi. A Makitryne è considerato un bel tempo per il fieno.",
    ],
    [
      "Il TSN continua. L'immagine balla un po', così dai un colpo al televisore sul fianco. Funziona.",
      "Annunciatrice: Sport. A maggio Andrij Shevchenko ha segnato il rigore decisivo nella finale di Champions League, e il Milan ha vinto la coppa. Da allora ogni villaggio ha trovato un vecchio che gli ha insegnato personalmente a tirare.",
      "Annunciatrice: Cultura. L'Ucraina è andata per la prima volta all'Eurovision. Oleksandr Ponomarjov, \"Hasta la vista\", Riga, quattordicesimo posto.",
      "Annunciatrice: Nella regione di Poltava si ritiene che con una canzone sul ciliegeto e un piatto di varenyky sarebbe arrivato primo.",
      "Annunciatrice: Politica. Quest'anno Leonid Kuchma presiede anche il Consiglio dei capi di Stato della CSI. Le pensioni, nel frattempo, presiedono anch'esse qualcosa: la lista delle più basse d'Europa.",
      "Annunciatrice: E il meteo. Domani caldo nella regione di Poltava. La dorifora è contenta. Buonanotte.",
    ],
  ],

  // Waiting for the evening by the club: the same day, a later part of it.
  evening: [
    "Il sole cala dietro il grano. Le mucche tornano dal pascolo, il cielo sopra il circolo si fa rosa, e lungo la strada i lampioni si accendono uno dopo l'altro.",
    "Te ne stai sulla panchina con i ragazzi a sgranocchiare semi, finché dal circolo non cominciano a pompare le casse.",
  ],

  afterDisco: ["La discoteca è finita. Notte, grilli, nelle orecchie rimbomba ancora. È ora di tornare a casa: la nonna avrà lasciato la cena in casa."],

  sleep: ["Dormi.", "Sogni che Tolik ti vende a Valja per due grivnie, e che una dorifora legge il telegiornale."],

  morning: (day) => [`Giorno ${day}. Il sole entra dalla finestra, fuori il gallo urla e dalla cucina arriva odore di fritto.`],

  shop: {
    title: "Cosa prendi?",
    price: (n) => `${n} UAH`,
    leave: "Niente, grazie",
    bag: (items) => `Nella borsa: ${items}`,
    // What he carries for the story (CARRIED in js/story.js).
    carried: {
      toolBox: "La cassetta degli attrezzi di nonno Petro",
      worms: "Un barattolo di vermi",
      battery: "Batteria dell'auto",
      newBattery: "Batteria nuova",
      catfish: "Il siluro",
    },
    goods: {
      beer: "Birra",
      bread: "Pane nero",
      loaf: "Filone",
      noodles: "Spaghetti",
      seeds: "Semi",
      matches: "Fiammiferi",
      cigarettes: "Sigarette",
      sugar: "Zucchero",
      fish: "Scatoletta",
      oil: "Olio",
      chocolate: "Cioccolato",
      sausage: "Salame",
    },
    sold: {
      beer: "Birra.",
      bread: "Pane di oggi. Prendilo finché è caldo.",
      loaf: "Un filone bianco, da città. Giusto per te.",
      noodles: "Basta l'acqua calda. Roba da città, puah.",
      seeds: "Semi tostati, li ha fatti nonna Ljuba. Non sputare i gusci sul mio portico.",
      matches: "Fiammiferi. Solo non bruciare la rimessa di tua nonna.",
      cigarettes: "Sigarette? Tua nonna lo sa? Be', io non ho visto niente.",
      sugar: "Zucchero, a peso, senza imbrogli. Quasi.",
      fish: "Scatoletta. Basta per l'inverno. O per stasera.",
      oil: "Olio nostro, profumato. Portalo a tua nonna.",
      chocolate: "Oh, e per chi è il cioccolato? Hai già adocchiato una ragazza?",
      sausage: "Salame di oggi. Be', di questa settimana.",
    },
  },

  hero: {
    places: {
      stop: "Ecco Makitryne. Niente campo per il cellulare, ovvio.",
      street: "",
      yard: "Il cortile della nonna. Il recinto è ancora più rattoppato di come me lo ricordavo.",
      house: "Ha lo stesso odore di quando ero bambino.",
      club: "La casa della cultura. La cultura non c'è, ma a volte c'è la discoteca.",
      shop: "\"Produkty\". Chissà se c'è qualcosa oltre a pane e fiammiferi.",
      pond: "Che posto. Silenzio, zanzare e un vecchio sulla panchina.",
      mykola: "Il cortile di Mykola. Una casa bianca sotto un melo, una vecchia bicicletta contro il muro. Più in ordine di quanto pensassi.",
    },
    garden: "Salve, dorifore. È da un po' che non ci si vede.",
    night: "È già notte. Meglio andare a casa prima che la nonna esca a cercarmi.",
    afterBeating: "Ahi... Piacere di conoscervi.",
    morning: "Ancora cinque minuti... Ma vallo a spiegare al gallo.",
    foundBeer: ["Oh. Qualcuno non ha finito la birra... Be', due grivnie non si trovano per strada."],
    drank: (n, total) => `Ah, che bontà! (${n}/${total})`,
  },

  objective: {
    goHome: "È notte. Torna a casa della nonna.",
    goToBed: "Vai a dormire. Cena e telegiornale, se vuoi.",
    morning: "Un nuovo giorno. Parla con la nonna in cortile.",
    findSvetka: "Cerca Svetka. Forse è davanti al negozio?",
    meetSvetka: "Svetka sta spesso davanti al negozio. Vai a conoscerla.",
    dateNext: "Svetka è davanti al negozio. Chiedile un appuntamento.",
    datePlayer: "Prendi il walkman dallo zaino vicino alla rimessa della nonna.",
    dateEvening: "Stasera passa col motorino a prendere Svetka al negozio.",
    dateGo: "È sera. Passa col motorino a prendere Svetka al negozio.",
    afterDate: "L'estate va avanti. Vai a dormire, domani è un altro giorno.",
    catfishGrandpa: "Nonno Petro ti ha chiamato allo stagno: ha promesso di farti vedere come si prende il pesce gatto.",
    worms: "Scava i vermi nel cortile della nonna, in fondo all'orto vicino alla cucina estiva.",
    rodNight: "Di notte allo stagno, da nonno Petro: il pesce gatto esce quando fa buio.",
    battery: "Serve una batteria. La Kopijka dell'autista passa la notte sulla strada vicino al circolo.",
    electroNight: "La batteria ce l'hai. Di notte — sulla passerella, allo stagno.",
    sellCatfish: "Valja prende il pesce di notte, dalla porta di servizio del negozio.",
    buyBattery: "L'autista è senza batteria, e niente viaggio per i maialini. Valja ne ha una nuova, per cento grivnie.",
    giveBattery: "Porta la batteria nuova all'autista, alla sua macchina.",
    afterCatfish: "L'estate va avanti. Continua...",
    grandmaNews: "La nonna voleva dirti qualcosa. È in cortile.",
    sellPlayer: "Alla nonna mancano quaranta grivnie per i maialini. Il walkman con gli Okean Elzy si può vendere a Valja o a Vovchyk.",
    earnMoney: "Alla nonna mancano quaranta grivnie per i maialini. Si può guadagnare nell'orto e da Valja.",
    giveMoney: "Porta alla nonna le quaranta grivnie per i maialini.",
    askTool: "Per il recinto servono gli attrezzi. Chiedi a nonno Petro allo stagno.",
    toMykola: "La cassetta degli attrezzi è da Mykola: il suo cancelletto è sulla strada, a ovest del villaggio. Di giorno dorme.",
    toolHome: "Porta alla nonna la cassetta degli attrezzi di nonno Petro.",
    beerForMykola: "Mykola insegna il kung fu solo davanti a una birra. Compra quattro bottiglie da Valja.",
    kungfu: "La birra ce l'hai. Verso sera — da Mykola, per il kung fu.",
    afterMykola: "L'estate va avanti. Continua...",
    carryCrate: "Porta la cassa al negozio di Valja.",
    arrive: "Trova la casa della nonna — vicino al pozzo, a nord del villaggio.",
    water: "Prendi l'acqua dal pozzo.",
    waterDone: "Porta l'acqua alla nonna.",
    beetles: "Raccogli le dorifore nell'orto.",
    beetlesDone: "Parla con la nonna.",
    sprayer: "Vai da nonno Petro allo stagno a prendere la pompa a spalla.",
    sprayerBack: "Porta la pompa a spalla alla nonna.",
    spray: "Spruzza le patate nell'orto.",
    sprayedTell: "Di' alla nonna che le patate sono trattate.",
    shop: "Compra il pane e la Mivina da Valja.",
    shopDone: "Porta la spesa alla nonna.",
    evening: "Stasera c'è la discoteca alla Casa della Cultura.",
    eveningMetLads: "Parla con la nonna.",
    chickens: (n, total) => `Riporta le galline nella rimessa: ${n}/${total}`,
    moped: "Racconta alla nonna del motorino.",
    disco: "Diventa uno del posto ed entra in discoteca.",
  },
};
