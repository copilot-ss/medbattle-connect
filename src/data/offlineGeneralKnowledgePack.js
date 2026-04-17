const GENERAL_KNOWLEDGE_PACK_ROWS = [
  {
    id: 'seed-geografie-01',
    category: 'Geografie',
    de: {
      question: 'Was ist die Hauptstadt von Kanada?',
      options: ['Ottawa', 'Toronto', 'Vancouver', 'Montreal'],
      correct_answer: 'Ottawa',
      explanation:
        'Ottawa ist die Hauptstadt Kanadas. Toronto ist zwar die groesste Stadt des Landes, aber nicht der Regierungssitz.',
    },
    en: {
      question: 'What is the capital of Canada?',
      options: ['Ottawa', 'Toronto', 'Vancouver', 'Montreal'],
      correct_answer: 'Ottawa',
      explanation:
        'Ottawa is the capital of Canada. Toronto is the country\'s largest city, but not the seat of government.',
    },
  },
  {
    id: 'seed-geografie-02',
    category: 'Geografie',
    de: {
      question: 'Welche Wueste liegt vor allem in der Mongolei und im Norden Chinas?',
      options: ['Gobi', 'Sahara', 'Kalahari', 'Atacama'],
      correct_answer: 'Gobi',
      explanation:
        'Die Gobi erstreckt sich ueber grosse Teile der Mongolei und Nordchinas. Sie ist eine kalte Wueste mit starken Temperaturschwankungen.',
    },
    en: {
      question: 'Which desert lies mainly in Mongolia and northern China?',
      options: ['Gobi', 'Sahara', 'Kalahari', 'Atacama'],
      correct_answer: 'Gobi',
      explanation:
        'The Gobi extends across large parts of Mongolia and northern China. It is a cold desert with strong temperature variation.',
    },
  },
  {
    id: 'seed-geografie-03',
    category: 'Geografie',
    de: {
      question: 'Welcher Ozean liegt oestlich von Afrika?',
      options: ['Indischer Ozean', 'Atlantischer Ozean', 'Pazifischer Ozean', 'Arktischer Ozean'],
      correct_answer: 'Indischer Ozean',
      explanation:
        'Oestlich von Afrika liegt der Indische Ozean. Der Atlantik liegt westlich des afrikanischen Kontinents.',
    },
    en: {
      question: 'Which ocean lies east of Africa?',
      options: ['Indian Ocean', 'Atlantic Ocean', 'Pacific Ocean', 'Arctic Ocean'],
      correct_answer: 'Indian Ocean',
      explanation:
        'The Indian Ocean lies east of Africa. The Atlantic Ocean is west of the African continent.',
    },
  },
  {
    id: 'seed-geografie-04',
    category: 'Geografie',
    de: {
      question: 'Welches Gebirge gilt klassisch als Grenze zwischen Europa und Asien?',
      options: ['Ural', 'Alpen', 'Pyrenaeen', 'Kaukasus'],
      correct_answer: 'Ural',
      explanation:
        'Das Uralgebirge wird in der Schulgeografie haeufig als klassische Grenze zwischen Europa und Asien verwendet.',
    },
    en: {
      question: 'Which mountain range is classically used as a boundary between Europe and Asia?',
      options: ['Ural Mountains', 'Alps', 'Pyrenees', 'Caucasus'],
      correct_answer: 'Ural Mountains',
      explanation:
        'The Ural Mountains are commonly used in school geography as the classical boundary between Europe and Asia.',
    },
  },
  {
    id: 'seed-geografie-05',
    category: 'Geografie',
    de: {
      question: 'Welcher Fluss fliesst durch Aegypten und muendet ins Mittelmeer?',
      options: ['Nil', 'Kongo', 'Niger', 'Sambesi'],
      correct_answer: 'Nil',
      explanation:
        'Der Nil durchquert Aegypten von Sueden nach Norden und muendet schliesslich in einem grossen Delta ins Mittelmeer.',
    },
    en: {
      question: 'Which river flows through Egypt and empties into the Mediterranean Sea?',
      options: ['Nile', 'Congo', 'Niger', 'Zambezi'],
      correct_answer: 'Nile',
      explanation:
        'The Nile crosses Egypt from south to north and finally reaches the Mediterranean Sea through a large delta.',
    },
  },
  {
    id: 'seed-geografie-06',
    category: 'Geografie',
    de: {
      question: 'Was ist die Hauptstadt von Australien?',
      options: ['Canberra', 'Sydney', 'Melbourne', 'Perth'],
      correct_answer: 'Canberra',
      explanation:
        'Canberra ist die Hauptstadt Australiens. Sydney und Melbourne sind bekannter, aber nicht der Regierungssitz.',
    },
    en: {
      question: 'What is the capital of Australia?',
      options: ['Canberra', 'Sydney', 'Melbourne', 'Perth'],
      correct_answer: 'Canberra',
      explanation:
        'Canberra is the capital of Australia. Sydney and Melbourne are more famous, but they are not the seat of government.',
    },
  },
  {
    id: 'seed-geografie-07',
    category: 'Geografie',
    de: {
      question: 'Welches Meer liegt zwischen Suedeuropa und Nordafrika?',
      options: ['Mittelmeer', 'Schwarzes Meer', 'Nordsee', 'Rotes Meer'],
      correct_answer: 'Mittelmeer',
      explanation:
        'Das Mittelmeer trennt Suedeuropa von Nordafrika und verbindet zugleich zahlreiche Kuestenstaaten miteinander.',
    },
    en: {
      question: 'Which sea lies between southern Europe and North Africa?',
      options: ['Mediterranean Sea', 'Black Sea', 'North Sea', 'Red Sea'],
      correct_answer: 'Mediterranean Sea',
      explanation:
        'The Mediterranean Sea separates southern Europe from North Africa while also connecting many coastal states.',
    },
  },
  {
    id: 'seed-geografie-08',
    category: 'Geografie',
    de: {
      question: 'Auf welchem Kontinent liegen die Anden?',
      options: ['Suedamerika', 'Afrika', 'Asien', 'Nordamerika'],
      correct_answer: 'Suedamerika',
      explanation:
        'Die Anden ziehen sich entlang der Westseite Suedamerikas und gehoeren zu den laengsten Gebirgsketten der Erde.',
    },
    en: {
      question: 'On which continent are the Andes located?',
      options: ['South America', 'Africa', 'Asia', 'North America'],
      correct_answer: 'South America',
      explanation:
        'The Andes run along the western side of South America and are among the longest mountain chains on Earth.',
    },
  },
  {
    id: 'seed-geografie-09',
    category: 'Geografie',
    de: {
      question: 'Wie heisst die gedachte Linie bei 0 Grad geographischer Breite?',
      options: ['Aequator', 'Nullmeridian', 'Wendekreis des Krebses', 'Datumsgrenze'],
      correct_answer: 'Aequator',
      explanation:
        'Der Aequator liegt bei 0 Grad Breite und teilt die Erde in Nord- und Suedhalbkugel.',
    },
    en: {
      question: 'What is the imaginary line at 0 degrees latitude called?',
      options: ['Equator', 'Prime Meridian', 'Tropic of Cancer', 'International Date Line'],
      correct_answer: 'Equator',
      explanation:
        'The equator lies at 0 degrees latitude and divides Earth into the Northern and Southern Hemispheres.',
    },
  },
  {
    id: 'seed-geografie-10',
    category: 'Geografie',
    de: {
      question: 'Welche Meerenge verbindet das Mittelmeer mit dem Atlantik?',
      options: ['Strasse von Gibraltar', 'Bosporus', 'Sueskanal', 'Beringstrasse'],
      correct_answer: 'Strasse von Gibraltar',
      explanation:
        'Die Strasse von Gibraltar liegt zwischen Spanien und Marokko und verbindet Mittelmeer und Atlantik.',
    },
    en: {
      question: 'Which strait connects the Mediterranean Sea with the Atlantic Ocean?',
      options: ['Strait of Gibraltar', 'Bosporus', 'Suez Canal', 'Bering Strait'],
      correct_answer: 'Strait of Gibraltar',
      explanation:
        'The Strait of Gibraltar lies between Spain and Morocco and connects the Mediterranean Sea with the Atlantic Ocean.',
    },
  },
  {
    id: 'seed-geografie-11',
    category: 'Geografie',
    de: {
      question: 'Welche Insel gilt als groesste Insel der Erde, wenn Kontinente nicht mitgezaehlt werden?',
      options: ['Gruenland', 'Madagaskar', 'Borneo', 'Neuguinea'],
      correct_answer: 'Gruenland',
      explanation:
        'Gruenland ist die groesste Insel der Erde. Australien gilt dagegen als Kontinent und wird daher nicht als Insel gezaehlt.',
    },
    en: {
      question: 'Which island is considered the largest in the world when continents are excluded?',
      options: ['Greenland', 'Madagascar', 'Borneo', 'New Guinea'],
      correct_answer: 'Greenland',
      explanation:
        'Greenland is the largest island on Earth. Australia is treated as a continent and is therefore not counted as an island here.',
    },
  },
  {
    id: 'seed-geografie-12',
    category: 'Geografie',
    de: {
      question: 'Von welchem Land ist Lissabon die Hauptstadt?',
      options: ['Portugal', 'Spanien', 'Italien', 'Griechenland'],
      correct_answer: 'Portugal',
      explanation:
        'Lissabon ist die Hauptstadt Portugals und liegt an der Atlantikkueste am Tejo.',
    },
    en: {
      question: 'Lisbon is the capital of which country?',
      options: ['Portugal', 'Spain', 'Italy', 'Greece'],
      correct_answer: 'Portugal',
      explanation:
        'Lisbon is the capital of Portugal and lies on the Atlantic coast along the Tagus River.',
    },
  },
  {
    id: 'seed-politik-01',
    category: 'Politik',
    de: {
      question: 'Welche drei Gewalten beschreibt die klassische Gewaltenteilung?',
      options: [
        'Legislative, Exekutive und Judikative',
        'Regierung, Medien und Wirtschaft',
        'Bund, Laender und Kommunen',
        'Praesident, Parlament und Parteien',
      ],
      correct_answer: 'Legislative, Exekutive und Judikative',
      explanation:
        'Die klassische Gewaltenteilung trennt Gesetzgebung, Regierung bzw. Verwaltung und Rechtsprechung, damit Macht begrenzt und kontrolliert wird.',
    },
    en: {
      question: 'Which three branches are part of the classical separation of powers?',
      options: [
        'Legislative, executive, and judiciary',
        'Government, media, and business',
        'Federal, state, and local levels',
        'President, parliament, and parties',
      ],
      correct_answer: 'Legislative, executive, and judiciary',
      explanation:
        'The classical separation of powers divides lawmaking, government or administration, and the courts so that power is limited and checked.',
    },
  },
  {
    id: 'seed-politik-02',
    category: 'Politik',
    de: {
      question: 'Was ist eine zentrale Aufgabe eines Parlaments?',
      options: [
        'Gesetze beschliessen und Regierung kontrollieren',
        'Urteile sprechen',
        'Die Zentralbank leiten',
        'Kommunale Bauplaene genehmigen',
      ],
      correct_answer: 'Gesetze beschliessen und Regierung kontrollieren',
      explanation:
        'Parlamente beraten und beschliessen Gesetze. Gleichzeitig kontrollieren sie in Demokratien die Regierung politisch.',
    },
    en: {
      question: 'What is a central task of a parliament?',
      options: [
        'Passing laws and scrutinizing the government',
        'Delivering court judgments',
        'Running the central bank',
        'Approving local construction plans',
      ],
      correct_answer: 'Passing laws and scrutinizing the government',
      explanation:
        'Parliaments debate and pass laws. In democracies they also politically scrutinize the government.',
    },
  },
  {
    id: 'seed-politik-03',
    category: 'Politik',
    de: {
      question: 'Was versteht man unter einer Koalitionsregierung?',
      options: [
        'Mehrere Parteien regieren gemeinsam',
        'Nur eine Partei regiert ohne Parlament',
        'Das Staatsoberhaupt uebernimmt alle Ministerien',
        'Die Opposition bildet die Regierung',
      ],
      correct_answer: 'Mehrere Parteien regieren gemeinsam',
      explanation:
        'Eine Koalition entsteht meist dann, wenn keine Partei alleine eine Mehrheit hat und mehrere Parteien gemeinsam eine Regierung bilden.',
    },
    en: {
      question: 'What is meant by a coalition government?',
      options: [
        'Several parties govern together',
        'A single party rules without parliament',
        'The head of state takes over all ministries',
        'The opposition forms the government',
      ],
      correct_answer: 'Several parties govern together',
      explanation:
        'A coalition usually emerges when no single party has a majority and several parties join to form a government.',
    },
  },
  {
    id: 'seed-politik-04',
    category: 'Politik',
    de: {
      question: 'Wozu dient die geheime Wahl in einer Demokratie besonders?',
      options: [
        'Sie schuetzt die freie Stimmabgabe vor Druck',
        'Sie ersetzt die Auszaehlung der Stimmen',
        'Sie macht Parteien ueberfluessig',
        'Sie verhindert jede Form von Wahlkampf',
      ],
      correct_answer: 'Sie schuetzt die freie Stimmabgabe vor Druck',
      explanation:
        'Die geheime Wahl soll sicherstellen, dass Menschen ohne Einschuechterung oder soziale Kontrolle abstimmen koennen.',
    },
    en: {
      question: 'What is the main purpose of a secret ballot in a democracy?',
      options: [
        'It protects free voting from pressure',
        'It replaces vote counting',
        'It makes political parties unnecessary',
        'It prevents all campaigning',
      ],
      correct_answer: 'It protects free voting from pressure',
      explanation:
        'A secret ballot is meant to ensure that people can vote without intimidation or social control.',
    },
  },
  {
    id: 'seed-politik-05',
    category: 'Politik',
    de: {
      question: 'Was kennzeichnet einen foederalen Staat?',
      options: [
        'Staatsgewalt ist zwischen Zentralstaat und Gliedstaaten aufgeteilt',
        'Es gibt nur eine einzige kommunale Ebene',
        'Parlamente sind verboten',
        'Das Staatsoberhaupt wird immer direkt gewaehlt',
      ],
      correct_answer: 'Staatsgewalt ist zwischen Zentralstaat und Gliedstaaten aufgeteilt',
      explanation:
        'In einem foederalen System teilen sich Zentralstaat und Gliedstaaten politische Kompetenzen und Aufgaben.',
    },
    en: {
      question: 'What characterizes a federal state?',
      options: [
        'State power is divided between a central level and constituent states',
        'There is only one local level',
        'Parliaments are banned',
        'The head of state is always directly elected',
      ],
      correct_answer: 'State power is divided between a central level and constituent states',
      explanation:
        'In a federal system, the central state and the constituent states share political powers and responsibilities.',
    },
  },
  {
    id: 'seed-politik-06',
    category: 'Politik',
    de: {
      question: 'Welche Funktion hat eine Verfassung in erster Linie?',
      options: [
        'Sie legt die grundlegende staatliche Ordnung fest',
        'Sie ersetzt alle einfachen Gesetze',
        'Sie bestimmt taegliche Nachrichteninhalte',
        'Sie regelt ausschliesslich den Aussenhandel',
      ],
      correct_answer: 'Sie legt die grundlegende staatliche Ordnung fest',
      explanation:
        'Eine Verfassung beschreibt die Grundprinzipien des Staates, Rechte der Buerger und die Verteilung staatlicher Macht.',
    },
    en: {
      question: 'What is the primary function of a constitution?',
      options: [
        'It sets the fundamental order of the state',
        'It replaces all ordinary laws',
        'It determines daily news coverage',
        'It regulates only foreign trade',
      ],
      correct_answer: 'It sets the fundamental order of the state',
      explanation:
        'A constitution defines the basic principles of the state, citizens\' rights, and the distribution of public power.',
    },
  },
  {
    id: 'seed-politik-07',
    category: 'Politik',
    de: {
      question: 'Was bedeutet ein Veto im politischen Kontext?',
      options: [
        'Eine Entscheidung oder ein Gesetz wird formell blockiert',
        'Ein Haushalt wird automatisch verabschiedet',
        'Eine Wahl wird wiederholt',
        'Ein Ministerium wird aufgeloest',
      ],
      correct_answer: 'Eine Entscheidung oder ein Gesetz wird formell blockiert',
      explanation:
        'Ein Veto ist ein formelles Einspruchsrecht, mit dem ein Beschluss vorerst gestoppt oder verhindert werden kann.',
    },
    en: {
      question: 'What does a veto mean in politics?',
      options: [
        'A decision or law is formally blocked',
        'A budget is automatically passed',
        'An election is repeated',
        'A ministry is dissolved',
      ],
      correct_answer: 'A decision or law is formally blocked',
      explanation:
        'A veto is a formal right of objection that can stop or prevent a decision for the time being.',
    },
  },
  {
    id: 'seed-politik-08',
    category: 'Politik',
    de: {
      question: 'Worauf zielt ein Verhaeltniswahlrecht im Kern ab?',
      options: [
        'Sitze sollen moeglichst den Stimmenanteilen entsprechen',
        'Nur die staerkste Partei erhaelt Mandate',
        'Regionen waehlen ausschliesslich parteilose Kandidaten',
        'Die Regierung wird per Los bestimmt',
      ],
      correct_answer: 'Sitze sollen moeglichst den Stimmenanteilen entsprechen',
      explanation:
        'Beim Verhaeltniswahlrecht soll die Zusammensetzung des Parlaments die prozentuale Stimmenverteilung moeglichst genau abbilden.',
    },
    en: {
      question: 'What is the core aim of proportional representation?',
      options: [
        'Seats should reflect vote shares as closely as possible',
        'Only the strongest party receives seats',
        'Regions elect only non-party candidates',
        'The government is chosen by lottery',
      ],
      correct_answer: 'Seats should reflect vote shares as closely as possible',
      explanation:
        'Proportional representation aims to make the composition of parliament mirror the distribution of votes as closely as possible.',
    },
  },
  {
    id: 'seed-politik-09',
    category: 'Politik',
    de: {
      question: 'Welche Rolle hat die Opposition in einer Demokratie besonders?',
      options: [
        'Sie kritisiert und kontrolliert die Regierung',
        'Sie ernennt allein die Richter',
        'Sie ersetzt bei jeder Abstimmung das Parlament',
        'Sie verwaltet die Zentralbank',
      ],
      correct_answer: 'Sie kritisiert und kontrolliert die Regierung',
      explanation:
        'Die Opposition bietet politische Alternativen an und kontrolliert die Regierung durch Kritik, Debatten und parlamentarische Instrumente.',
    },
    en: {
      question: 'What is a key role of the opposition in a democracy?',
      options: [
        'It criticizes and scrutinizes the government',
        'It appoints all judges on its own',
        'It replaces parliament in every vote',
        'It manages the central bank',
      ],
      correct_answer: 'It criticizes and scrutinizes the government',
      explanation:
        'The opposition offers political alternatives and scrutinizes the government through criticism, debate, and parliamentary tools.',
    },
  },
  {
    id: 'seed-politik-10',
    category: 'Politik',
    de: {
      question: 'Welches Stimmprinzip gilt in der UN-Generalversammlung?',
      options: [
        'Jeder Mitgliedstaat hat eine Stimme',
        'Nur Vetomaechte stimmen ab',
        'Die Stimmenzahl richtet sich nach der Einwohnerzahl',
        'Nur Regierungen aus Europa stimmen mit',
      ],
      correct_answer: 'Jeder Mitgliedstaat hat eine Stimme',
      explanation:
        'In der Generalversammlung der Vereinten Nationen hat jeder Mitgliedstaat unabhaengig von seiner Groesse genau eine Stimme.',
    },
    en: {
      question: 'What voting principle applies in the UN General Assembly?',
      options: [
        'Each member state has one vote',
        'Only veto powers may vote',
        'Voting power depends on population size',
        'Only European governments can vote',
      ],
      correct_answer: 'Each member state has one vote',
      explanation:
        'In the United Nations General Assembly, every member state has exactly one vote regardless of its size.',
    },
  },
  {
    id: 'seed-politik-11',
    category: 'Politik',
    de: {
      question: 'Was ist ein Referendum?',
      options: [
        'Eine direkte Abstimmung der Bevoelkerung ueber eine konkrete Frage',
        'Ein geheimes Treffen von Parteifuehrungen',
        'Die Ernennung eines Ministers',
        'Eine Sitzung des Verfassungsgerichts',
      ],
      correct_answer: 'Eine direkte Abstimmung der Bevoelkerung ueber eine konkrete Frage',
      explanation:
        'Bei einem Referendum stimmt die Bevoelkerung unmittelbar ueber eine bestimmte Sachfrage oder Vorlage ab.',
    },
    en: {
      question: 'What is a referendum?',
      options: [
        'A direct vote of the population on a specific issue',
        'A secret meeting of party leaders',
        'The appointment of a minister',
        'A session of the constitutional court',
      ],
      correct_answer: 'A direct vote of the population on a specific issue',
      explanation:
        'In a referendum, the population votes directly on a specific issue or proposal.',
    },
  },
  {
    id: 'seed-politik-12',
    category: 'Politik',
    de: {
      question: 'Was beschreibt eine Amtszeitbegrenzung?',
      options: [
        'Die maximale Zahl erlaubter Amtsperioden fuer ein Amt',
        'Die Mindestgroesse eines Parlaments',
        'Die Pflicht zu taeglichen Regierungserklaerungen',
        'Die Aufteilung eines Landes in Wahlkreise',
      ],
      correct_answer: 'Die maximale Zahl erlaubter Amtsperioden fuer ein Amt',
      explanation:
        'Eine Amtszeitbegrenzung legt fest, wie oft oder wie lange eine Person ein bestimmtes Amt innehaben darf.',
    },
    en: {
      question: 'What does a term limit describe?',
      options: [
        'The maximum number of terms allowed for an office',
        'The minimum size of a parliament',
        'A duty to give daily government statements',
        'The division of a country into electoral districts',
      ],
      correct_answer: 'The maximum number of terms allowed for an office',
      explanation:
        'A term limit defines how often or how long a person may hold a particular office.',
    },
  },
];

const OFFLINE_GENERAL_KNOWLEDGE_PACK = GENERAL_KNOWLEDGE_PACK_ROWS.flatMap((row) => [
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

export default OFFLINE_GENERAL_KNOWLEDGE_PACK;
