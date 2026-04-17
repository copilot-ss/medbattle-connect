const EXPANDED_CATEGORY_PACK_ROWS = [
  {
    id: 'seed-geschichte-01',
    category: 'Geschichte',
    de: {
      question: 'In welchem Jahr fiel die Berliner Mauer?',
      options: ['1989', '1979', '1991', '1961'],
      correct_answer: '1989',
      explanation:
        'Die Berliner Mauer fiel im November 1989. Das Ereignis wurde zu einem Schluesselmoment fuer das Ende der deutschen Teilung.',
    },
    en: {
      question: 'In which year did the Berlin Wall fall?',
      options: ['1989', '1979', '1991', '1961'],
      correct_answer: '1989',
      explanation:
        'The Berlin Wall fell in November 1989. It became a key moment in the end of Germany\'s division.',
    },
  },
  {
    id: 'seed-geschichte-02',
    category: 'Geschichte',
    de: {
      question: 'In welchem Land begann die Renaissance?',
      options: ['Italien', 'Frankreich', 'England', 'Spanien'],
      correct_answer: 'Italien',
      explanation:
        'Die Renaissance begann in italienischen Staedten wie Florenz. Von dort verbreiteten sich neue Ideen in Kunst, Wissenschaft und Politik weiter in Europa.',
    },
    en: {
      question: 'In which country did the Renaissance begin?',
      options: ['Italy', 'France', 'England', 'Spain'],
      correct_answer: 'Italy',
      explanation:
        'The Renaissance began in Italian cities such as Florence. From there, new ideas in art, science, and politics spread across Europe.',
    },
  },
  {
    id: 'seed-geschichte-03',
    category: 'Geschichte',
    de: {
      question: 'Wer gilt als Erfinder des Buchdrucks mit beweglichen Metalllettern in Europa?',
      options: ['Johannes Gutenberg', 'Leonardo da Vinci', 'Isaac Newton', 'Galileo Galilei'],
      correct_answer: 'Johannes Gutenberg',
      explanation:
        'Johannes Gutenberg machte den Druck mit beweglichen Metalllettern in Europa beruehmt. Damit konnten Texte deutlich schneller vervielfaeltigt werden.',
    },
    en: {
      question: 'Who is credited with introducing printing with movable metal type in Europe?',
      options: ['Johannes Gutenberg', 'Leonardo da Vinci', 'Isaac Newton', 'Galileo Galilei'],
      correct_answer: 'Johannes Gutenberg',
      explanation:
        'Johannes Gutenberg is credited with popularizing printing with movable metal type in Europe. It made the reproduction of texts much faster.',
    },
  },
  {
    id: 'seed-geschichte-04',
    category: 'Geschichte',
    de: {
      question: 'Welcher Fluss war fuer das Alte Aegypten besonders lebenswichtig?',
      options: ['Nil', 'Euphrat', 'Donau', 'Tiber'],
      correct_answer: 'Nil',
      explanation:
        'Der Nil ermoeglichte Landwirtschaft und Transport im Alten Aegypten. Seine regelmaessigen Ueberschwemmungen machten die umliegenden Boeden fruchtbar.',
    },
    en: {
      question: 'Which river was especially vital for ancient Egypt?',
      options: ['Nile', 'Euphrates', 'Danube', 'Tiber'],
      correct_answer: 'Nile',
      explanation:
        'The Nile enabled agriculture and transport in ancient Egypt. Its regular floods made nearby soils fertile.',
    },
  },
  {
    id: 'seed-geschichte-05',
    category: 'Geschichte',
    de: {
      question: 'In welchem Jahr begann die Franzoesische Revolution?',
      options: ['1789', '1815', '1776', '1848'],
      correct_answer: '1789',
      explanation:
        '1789 markiert den Beginn der Franzoesischen Revolution. Der Sturm auf die Bastille wurde zum Symbol fuer den Umbruch.',
    },
    en: {
      question: 'In which year did the French Revolution begin?',
      options: ['1789', '1815', '1776', '1848'],
      correct_answer: '1789',
      explanation:
        '1789 marks the beginning of the French Revolution. The storming of the Bastille became a symbol of the upheaval.',
    },
  },
  {
    id: 'seed-geschichte-06',
    category: 'Geschichte',
    de: {
      question: 'In welchem Land begann die Industrielle Revolution zuerst?',
      options: ['Grossbritannien', 'Deutschland', 'USA', 'Russland'],
      correct_answer: 'Grossbritannien',
      explanation:
        'Die Industrielle Revolution begann zuerst in Grossbritannien. Dort foerderten neue Maschinen, Kohle und Fabriksysteme den Wandel.',
    },
    en: {
      question: 'In which country did the Industrial Revolution begin first?',
      options: ['Great Britain', 'Germany', 'United States', 'Russia'],
      correct_answer: 'Great Britain',
      explanation:
        'The Industrial Revolution began first in Great Britain. New machines, coal, and factory systems accelerated the change there.',
    },
  },
  {
    id: 'seed-geschichte-07',
    category: 'Geschichte',
    de: {
      question: 'Zwischen welchen beiden Machtbloeken wurde der Kalte Krieg vor allem ausgetragen?',
      options: ['USA und Sowjetunion', 'Frankreich und Spanien', 'China und Japan', 'Deutschland und Italien'],
      correct_answer: 'USA und Sowjetunion',
      explanation:
        'Der Kalte Krieg war vor allem ein globaler Machtkonflikt zwischen den USA und der Sowjetunion sowie ihren jeweiligen Buendnissystemen.',
    },
    en: {
      question: 'Which two power blocs were the main opponents in the Cold War?',
      options: ['United States and Soviet Union', 'France and Spain', 'China and Japan', 'Germany and Italy'],
      correct_answer: 'United States and Soviet Union',
      explanation:
        'The Cold War was mainly a global power conflict between the United States and the Soviet Union and their alliance systems.',
    },
  },
  {
    id: 'seed-geschichte-08',
    category: 'Geschichte',
    de: {
      question: 'In welcher Stadt lag das politische Zentrum des Roemischen Reiches?',
      options: ['Rom', 'Athen', 'Alexandria', 'Byzanz'],
      correct_answer: 'Rom',
      explanation:
        'Rom war das politische und symbolische Zentrum des Roemischen Reiches. Von dort aus wurden viele zentrale Entscheidungen getroffen.',
    },
    en: {
      question: 'Which city was the political center of the Roman Empire?',
      options: ['Rome', 'Athens', 'Alexandria', 'Byzantium'],
      correct_answer: 'Rome',
      explanation:
        'Rome was the political and symbolic center of the Roman Empire. Many central decisions were made there.',
    },
  },
  {
    id: 'seed-geschichte-09',
    category: 'Geschichte',
    de: {
      question: 'Wie heisst das beruehmte englische Dokument von 1215, das koenigliche Macht begrenzen sollte?',
      options: ['Magna Carta', 'Bill of Rights', 'Domesday Book', 'Petition of Right'],
      correct_answer: 'Magna Carta',
      explanation:
        'Die Magna Carta von 1215 gilt als fruehes Dokument zur Begrenzung koeniglicher Macht. Sie spielte spaeter auch fuer Verfassungsentwicklungen eine wichtige Rolle.',
    },
    en: {
      question: 'What is the famous English document of 1215 called that aimed to limit royal power?',
      options: ['Magna Carta', 'Bill of Rights', 'Domesday Book', 'Petition of Right'],
      correct_answer: 'Magna Carta',
      explanation:
        'The Magna Carta of 1215 is seen as an early document limiting royal power. It later became influential in constitutional developments.',
    },
  },
  {
    id: 'seed-geschichte-10',
    category: 'Geschichte',
    de: {
      question: 'In welchem Jahr landeten Menschen erstmals auf dem Mond?',
      options: ['1969', '1959', '1975', '1981'],
      correct_answer: '1969',
      explanation:
        '1969 landete Apollo 11 auf dem Mond. Neil Armstrong und Buzz Aldrin betraten die Mondoberflaeche.',
    },
    en: {
      question: 'In which year did humans first land on the Moon?',
      options: ['1969', '1959', '1975', '1981'],
      correct_answer: '1969',
      explanation:
        'Apollo 11 landed on the Moon in 1969. Neil Armstrong and Buzz Aldrin walked on the lunar surface.',
    },
  },
  {
    id: 'seed-brainrot-01',
    category: 'Brainrot',
    de: {
      question: 'Wofuer steht die Abkuerzung "POV" in Memes und Kurzvideos meist?',
      options: ['Point of View', 'Proof of Value', 'Power of Voice', 'Picture on Video'],
      correct_answer: 'Point of View',
      explanation:
        '"POV" steht fuer "Point of View". Damit wird eine Szene so eingerahmt, als ob man sie aus einer bestimmten Perspektive direkt erlebt.',
    },
    en: {
      question: 'What does the abbreviation "POV" usually mean in memes and short videos?',
      options: ['Point of View', 'Proof of Value', 'Power of Voice', 'Picture on Video'],
      correct_answer: 'Point of View',
      explanation:
        '"POV" stands for "Point of View". It frames a scene as if you are experiencing it from a specific perspective.',
    },
  },
  {
    id: 'seed-brainrot-02',
    category: 'Brainrot',
    de: {
      question: 'Was bedeutet "NPC" in der Gaming- und Meme-Sprache?',
      options: ['Non-Player Character', 'New Play Challenge', 'Next Phase Code', 'No Pause Combo'],
      correct_answer: 'Non-Player Character',
      explanation:
        '"NPC" bedeutet "Non-Player Character". In Memes wird der Begriff oft fuer Menschen benutzt, die sehr vorhersehbar oder wie eine Hintergrundfigur wirken.',
    },
    en: {
      question: 'What does "NPC" mean in gaming and meme slang?',
      options: ['Non-Player Character', 'New Play Challenge', 'Next Phase Code', 'No Pause Combo'],
      correct_answer: 'Non-Player Character',
      explanation:
        '"NPC" means "Non-Player Character". In memes it is often used for someone acting very predictably or like a background character.',
    },
  },
  {
    id: 'seed-brainrot-03',
    category: 'Brainrot',
    de: {
      question: 'Was meint das Internetwort "delulu" normalerweise?',
      options: ['Delusional', 'Delicate but loud', 'Deleted too late', 'Deeply logical'],
      correct_answer: 'Delusional',
      explanation:
        '"Delulu" ist eine spielerische Kurzform von "delusional". Gemeint ist meist, dass jemand unrealistisch optimistisch oder offensichtlich fern der Realitaet ist.',
    },
    en: {
      question: 'What does the internet slang word "delulu" usually mean?',
      options: ['Delusional', 'Delicate but loud', 'Deleted too late', 'Deeply logical'],
      correct_answer: 'Delusional',
      explanation:
        '"Delulu" is a playful short form of "delusional". It usually means someone is unrealistically optimistic or clearly detached from reality.',
    },
  },
  {
    id: 'seed-brainrot-04',
    category: 'Brainrot',
    de: {
      question: 'Was bedeutet es auf Social Media oft, wenn ein Post "ratioed" wird?',
      options: [
        'Eine Antwort oder Reaktion bekommt mehr Zustimmung als der urspruengliche Post',
        'Der Beitrag wird automatisch geloescht',
        'Der Post enthaelt nur Zahlenverhaeltnisse',
        'Der Account wird verifiziert',
      ],
      correct_answer: 'Eine Antwort oder Reaktion bekommt mehr Zustimmung als der urspruengliche Post',
      explanation:
        'Von einer "Ratio" spricht man oft, wenn eine Antwort deutlich mehr Likes oder Zustimmung bekommt als der eigentliche Beitrag. Das gilt meist als oeffentliche Niederlage im Feed.',
    },
    en: {
      question: 'What does it often mean on social media when a post gets "ratioed"?',
      options: [
        'A reply or reaction gets more approval than the original post',
        'The post is automatically deleted',
        'The post contains only numerical ratios',
        'The account gets verified',
      ],
      correct_answer: 'A reply or reaction gets more approval than the original post',
      explanation:
        'A "ratio" often means that a reply gets far more likes or approval than the original post. It is usually seen as a public loss in the feed.',
    },
  },
  {
    id: 'seed-brainrot-05',
    category: 'Brainrot',
    de: {
      question: 'Wofuer steht "AFK" in Chats und Games?',
      options: ['Away from keyboard', 'Always for karma', 'Automatic friend key', 'After full knockout'],
      correct_answer: 'Away from keyboard',
      explanation:
        '"AFK" steht fuer "Away from keyboard". Es bedeutet, dass jemand kurz nicht aktiv am Geraet ist.',
    },
    en: {
      question: 'What does "AFK" stand for in chats and games?',
      options: ['Away from keyboard', 'Always for karma', 'Automatic friend key', 'After full knockout'],
      correct_answer: 'Away from keyboard',
      explanation:
        '"AFK" stands for "Away from keyboard". It means someone is temporarily not active at their device.',
    },
  },
  {
    id: 'seed-brainrot-06',
    category: 'Brainrot',
    de: {
      question: 'Was beschreibt "doomscrolling" am besten?',
      options: [
        'Endlos negatives oder stressiges Feed-Material konsumieren',
        'Nur noch kurze Tanzvideos schauen',
        'Einen Beitrag mehrfach neu laden',
        'Einen Account auf privat stellen',
      ],
      correct_answer: 'Endlos negatives oder stressiges Feed-Material konsumieren',
      explanation:
        'Doomscrolling meint das fortgesetzte Konsumieren negativer oder alarmierender Inhalte, oft obwohl es einem erkennbar nicht guttut.',
    },
    en: {
      question: 'What best describes "doomscrolling"?',
      options: [
        'Endlessly consuming negative or stressful feed content',
        'Watching only short dance clips',
        'Reloading one post over and over',
        'Switching an account to private',
      ],
      correct_answer: 'Endlessly consuming negative or stressful feed content',
      explanation:
        'Doomscrolling means continuing to consume negative or alarming content, often even when it is clearly not helping.',
    },
  },
  {
    id: 'seed-brainrot-07',
    category: 'Brainrot',
    de: {
      question: 'Was ist eine "copypasta" im Internetjargon?',
      options: [
        'Ein Textblock, der immer wieder kopiert und gepostet wird',
        'Eine besonders gute Autokorrektur',
        'Ein privater Chatverlauf',
        'Ein Bild ohne Untertitel',
      ],
      correct_answer: 'Ein Textblock, der immer wieder kopiert und gepostet wird',
      explanation:
        'Eine Copypasta ist ein Text, der vielfach kopiert und in neuen Kontexten erneut gepostet wird. Oft entsteht der Witz gerade durch diese Wiederholung.',
    },
    en: {
      question: 'What is a "copypasta" in internet slang?',
      options: [
        'A block of text copied and reposted again and again',
        'An especially good autocorrect feature',
        'A private chat history',
        'An image without a caption',
      ],
      correct_answer: 'A block of text copied and reposted again and again',
      explanation:
        'A copypasta is a text repeatedly copied and reposted in new contexts. The humor often comes from that repetition itself.',
    },
  },
  {
    id: 'seed-brainrot-08',
    category: 'Brainrot',
    de: {
      question: 'Was meint "rizz" in aktuellem Internet-Slang meist?',
      options: [
        'Charme oder Flirt-Ausstrahlung',
        'Eine schlechte Bildqualitaet',
        'Ein extrem schneller Computer',
        'Ein chaotischer Kommentarbereich',
      ],
      correct_answer: 'Charme oder Flirt-Ausstrahlung',
      explanation:
        '"Rizz" wird meist fuer Charme oder die Faehigkeit verwendet, andere locker fuer sich zu gewinnen. Der Begriff taucht oft in Dating- oder Meme-Kontexten auf.',
    },
    en: {
      question: 'What does "rizz" usually mean in current internet slang?',
      options: [
        'Charm or flirting ability',
        'Bad image quality',
        'An extremely fast computer',
        'A chaotic comment section',
      ],
      correct_answer: 'Charm or flirting ability',
      explanation:
        '"Rizz" is usually used for charm or the ability to attract someone smoothly. The term often appears in dating and meme contexts.',
    },
  },
  {
    id: 'seed-brainrot-09',
    category: 'Brainrot',
    de: {
      question: 'Was beschreibt "main character energy" meistens?',
      options: [
        'Jemand wirkt, als wuerde sich die Szene gerade um diese Person drehen',
        'Jemand streamt nur Gaming-Storys',
        'Ein Film hat zu viele Hauptrollen',
        'Ein Spiel startet ohne Nebenfiguren',
      ],
      correct_answer: 'Jemand wirkt, als wuerde sich die Szene gerade um diese Person drehen',
      explanation:
        '"Main character energy" meint eine Ausstrahlung, bei der jemand so wirkt, als stuende er oder sie im Mittelpunkt der Situation wie in einer Filmszene.',
    },
    en: {
      question: 'What does "main character energy" usually describe?',
      options: [
        'Someone seems like the whole scene revolves around them',
        'Someone only streams story-driven games',
        'A movie has too many protagonists',
        'A game starts without side characters',
      ],
      correct_answer: 'Someone seems like the whole scene revolves around them',
      explanation:
        '"Main character energy" describes an aura where someone seems to be at the center of the moment, like the lead in a movie scene.',
    },
  },
  {
    id: 'seed-brainrot-10',
    category: 'Brainrot',
    de: {
      question: 'Was bedeutet die Aufforderung "touch grass" im Netz oft?',
      options: [
        'Geh mal raus und komm wieder in die Realitaet',
        'Kauf dir sofort eine Pflanze',
        'Mach ein Naturfoto fuer den Feed',
        'Starte ein Survival-Spiel',
      ],
      correct_answer: 'Geh mal raus und komm wieder in die Realitaet',
      explanation:
        '"Touch grass" ist eine spitze Aufforderung, mal offline zu gehen und sich wieder mit der echten Welt zu beschaeftigen.',
    },
    en: {
      question: 'What does the phrase "touch grass" often mean online?',
      options: [
        'Go outside and reconnect with reality',
        'Immediately buy a plant',
        'Take a nature photo for your feed',
        'Start a survival game',
      ],
      correct_answer: 'Go outside and reconnect with reality',
      explanation:
        '"Touch grass" is a sharp way of telling someone to log off for a while and reconnect with the real world.',
    },
  },
  {
    id: 'seed-tiere-01',
    category: 'Tiere',
    de: {
      question: 'Welches Tier ist das groesste heute lebende Landsaeugetier?',
      options: ['Afrikanischer Elefant', 'Nashorn', 'Giraffe', 'Nilpferd'],
      correct_answer: 'Afrikanischer Elefant',
      explanation:
        'Der afrikanische Elefant ist das groesste heute lebende Landsaeugetier. Er uebertrifft andere grosse Pflanzenfresser deutlich an Gewicht.',
    },
    en: {
      question: 'Which animal is the largest living land mammal today?',
      options: ['African elephant', 'Rhinoceros', 'Giraffe', 'Hippopotamus'],
      correct_answer: 'African elephant',
      explanation:
        'The African elephant is the largest living land mammal today. It clearly outweighs other large herbivores.',
    },
  },
  {
    id: 'seed-tiere-02',
    category: 'Tiere',
    de: {
      question: 'Welches Tier gilt als schnellstes Landsaeugetier?',
      options: ['Gepard', 'Loewe', 'Antilope', 'Strauss'],
      correct_answer: 'Gepard',
      explanation:
        'Der Gepard ist fuer seine extrem hohe Beschleunigung und Spitzengeschwindigkeit bekannt. Damit gilt er als schnellstes Landsaeugetier.',
    },
    en: {
      question: 'Which animal is considered the fastest land mammal?',
      options: ['Cheetah', 'Lion', 'Antelope', 'Ostrich'],
      correct_answer: 'Cheetah',
      explanation:
        'The cheetah is famous for its extreme acceleration and top speed. That makes it the fastest land mammal.',
    },
  },
  {
    id: 'seed-tiere-03',
    category: 'Tiere',
    de: {
      question: 'Was sind Delfine biologisch betrachtet?',
      options: ['Saeugetiere', 'Fische', 'Amphibien', 'Reptilien'],
      correct_answer: 'Saeugetiere',
      explanation:
        'Delfine sind Saeugetiere. Sie atmen mit Lungen, sind warmbluetig und saeugen ihren Nachwuchs.',
    },
    en: {
      question: 'What are dolphins from a biological point of view?',
      options: ['Mammals', 'Fish', 'Amphibians', 'Reptiles'],
      correct_answer: 'Mammals',
      explanation:
        'Dolphins are mammals. They breathe with lungs, are warm-blooded, and nurse their young.',
    },
  },
  {
    id: 'seed-tiere-04',
    category: 'Tiere',
    de: {
      question: 'Welches Tier kann als einziges Saeugetier aktiv fliegen?',
      options: ['Fledermaus', 'Eichhoernchen', 'Koala', 'Kolibri'],
      correct_answer: 'Fledermaus',
      explanation:
        'Fledermaeuse sind die einzigen Saeugetiere mit echtem aktivem Flug. Andere Saeugetiere koennen hoechstens gleiten, aber nicht aktiv mit Fluegelschlag fliegen.',
    },
    en: {
      question: 'Which animal is the only mammal capable of true powered flight?',
      options: ['Bat', 'Squirrel', 'Koala', 'Hummingbird'],
      correct_answer: 'Bat',
      explanation:
        'Bats are the only mammals capable of true powered flight. Other mammals may glide at most, but they do not achieve sustained flapping flight.',
    },
  },
  {
    id: 'seed-tiere-05',
    category: 'Tiere',
    de: {
      question: 'Wie viele Herzen hat ein Oktopus?',
      options: ['Drei', 'Eins', 'Zwei', 'Vier'],
      correct_answer: 'Drei',
      explanation:
        'Ein Oktopus besitzt drei Herzen. Zwei pumpen Blut zu den Kiemen, eines in den restlichen Koerper.',
    },
    en: {
      question: 'How many hearts does an octopus have?',
      options: ['Three', 'One', 'Two', 'Four'],
      correct_answer: 'Three',
      explanation:
        'An octopus has three hearts. Two pump blood to the gills, and one pumps it to the rest of the body.',
    },
  },
  {
    id: 'seed-tiere-06',
    category: 'Tiere',
    de: {
      question: 'Auf welchem Kontinent leben Kaiserpinguine in freier Wildbahn?',
      options: ['Antarktis', 'Suedamerika', 'Afrika', 'Australien'],
      correct_answer: 'Antarktis',
      explanation:
        'Kaiserpinguine leben in der Antarktis. Sie sind hervorragend an Eis, Wind und extreme Kaelte angepasst.',
    },
    en: {
      question: 'On which continent do emperor penguins live in the wild?',
      options: ['Antarctica', 'South America', 'Africa', 'Australia'],
      correct_answer: 'Antarctica',
      explanation:
        'Emperor penguins live in Antarctica. They are highly adapted to ice, wind, and extreme cold.',
    },
  },
  {
    id: 'seed-tiere-07',
    category: 'Tiere',
    de: {
      question: 'Was sammeln Honigbienen vor allem aus Blueten, um Honig herzustellen?',
      options: ['Nektar', 'Sand', 'Tau', 'Baumrinde'],
      correct_answer: 'Nektar',
      explanation:
        'Honigbienen sammeln Nektar aus Blueten und verarbeiten ihn im Bienenstock weiter zu Honig.',
    },
    en: {
      question: 'What do honey bees mainly collect from flowers to make honey?',
      options: ['Nectar', 'Sand', 'Dew', 'Tree bark'],
      correct_answer: 'Nectar',
      explanation:
        'Honey bees collect nectar from flowers and process it further in the hive to make honey.',
    },
  },
  {
    id: 'seed-tiere-08',
    category: 'Tiere',
    de: {
      question: 'Welche Tiergruppe lebt typischerweise sowohl im Wasser als auch an Land?',
      options: ['Amphibien', 'Insekten', 'Voegel', 'Fische'],
      correct_answer: 'Amphibien',
      explanation:
        'Amphibien wie Froesche oder Molche haben meist Lebensphasen im Wasser und an Land. Genau das spiegelt ihr Name wider.',
    },
    en: {
      question: 'Which animal group typically lives both in water and on land?',
      options: ['Amphibians', 'Insects', 'Birds', 'Fish'],
      correct_answer: 'Amphibians',
      explanation:
        'Amphibians such as frogs and newts usually have life stages in water and on land. Their name reflects that pattern.',
    },
  },
  {
    id: 'seed-tiere-09',
    category: 'Tiere',
    de: {
      question: 'Welches Sinnesorgan nutzen Schlangen fuer das Aufnehmen von Geruchspartikeln ueber die Zunge besonders?',
      options: ['Jacobson-Organ', 'Trommelfell', 'Seitenlinie', 'Schwimmblase'],
      correct_answer: 'Jacobson-Organ',
      explanation:
        'Schlangen transportieren Duftpartikel mit der Zunge zum Jacobson-Organ im Gaumenbereich. So koennen sie ihre Umgebung sehr praezise wahrnehmen.',
    },
    en: {
      question: 'Which sensory organ do snakes especially use with their tongue to analyze scent particles?',
      options: ['Jacobson\'s organ', 'Eardrum', 'Lateral line', 'Swim bladder'],
      correct_answer: 'Jacobson\'s organ',
      explanation:
        'Snakes carry scent particles with their tongue to Jacobson\'s organ in the roof of the mouth. This lets them sense their surroundings very precisely.',
    },
  },
  {
    id: 'seed-tiere-10',
    category: 'Tiere',
    de: {
      question: 'Welches Tier ist vor allem fuer seine Echoortung bekannt?',
      options: ['Fledermaus', 'Pfau', 'Koala', 'Kamel'],
      correct_answer: 'Fledermaus',
      explanation:
        'Viele Fledermaeuse orientieren sich ueber Echoortung. Sie senden Schall aus und werten die reflektierten Signale aus.',
    },
    en: {
      question: 'Which animal is especially known for echolocation?',
      options: ['Bat', 'Peacock', 'Koala', 'Camel'],
      correct_answer: 'Bat',
      explanation:
        'Many bats navigate by echolocation. They emit sound and analyze the reflected signals.',
    },
  },
];

const OFFLINE_EXPANDED_CATEGORY_PACK = EXPANDED_CATEGORY_PACK_ROWS.flatMap((row) => [
  {
    id: row.id,
    category: row.category,
    language: 'de',
    question: row.de.question,
    options: row.de.options,
    correct_answer: row.de.correct_answer,
    explanation: row.de.explanation,
  },
  {
    id: `${row.id}-en`,
    category: row.category,
    language: 'en',
    question: row.en.question,
    options: row.en.options,
    correct_answer: row.en.correct_answer,
    explanation: row.en.explanation,
  },
]);

export default OFFLINE_EXPANDED_CATEGORY_PACK;
