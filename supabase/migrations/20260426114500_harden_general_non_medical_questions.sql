-- Replace the first easy starter rows for non-medical general categories.
-- Slugs are kept stable so existing references do not break, but the easy text is gone.

with question_rows (
  slug,
  category,
  question_de,
  correct_de,
  options_de,
  explanation_de,
  question_en,
  correct_en,
  options_en,
  explanation_en
) as (
  values
    (
      'general-geschichte-01',
      'Geschichte',
      'Welcher Frieden beendete 1648 den Dreissigjaehrigen Krieg?',
      'Westfaelischer Frieden',
      '["Westfaelischer Frieden","Wiener Kongress","Friede von Versailles","Augsburger Religionsfriede"]'::jsonb,
      'Der Westfaelische Frieden von 1648 beendete den Dreissigjaehrigen Krieg und ordnete Machtverhaeltnisse im Heiligen Roemischen Reich neu.',
      'Which peace settlement ended the Thirty Years War in 1648?',
      'Peace of Westphalia',
      '["Peace of Westphalia","Congress of Vienna","Treaty of Versailles","Peace of Augsburg"]'::jsonb,
      'The Peace of Westphalia ended the Thirty Years War and reshaped power relations in the Holy Roman Empire.'
    ),
    (
      'general-geschichte-02',
      'Geschichte',
      'Warum gilt die Magna Carta von 1215 als historisch bedeutsam?',
      'Sie begrenzte koenigliche Macht durch festgelegte Rechte',
      '["Sie begrenzte koenigliche Macht durch festgelegte Rechte","Sie gruendete das britische Empire","Sie fuehrte allgemeines Wahlrecht ein","Sie beendete die Rosenkriege"]'::jsonb,
      'Die Magna Carta schraenkte die Willkuer des englischen Koenigs ein und wurde spaeter zu einem wichtigen Bezugspunkt fuer Rechtsstaatlichkeit.',
      'Why is Magna Carta from 1215 historically important?',
      'It limited royal power through defined rights',
      '["It limited royal power through defined rights","It founded the British Empire","It introduced universal suffrage","It ended the Wars of the Roses"]'::jsonb,
      'Magna Carta restricted arbitrary royal power in England and later became a major reference point for the rule of law.'
    ),
    (
      'general-geschichte-03',
      'Geschichte',
      'Welche Reihenfolge ist chronologisch richtig?',
      'Reformation, Westfaelischer Frieden, Franzoesische Revolution, Deutsches Kaiserreich',
      '["Reformation, Westfaelischer Frieden, Franzoesische Revolution, Deutsches Kaiserreich","Franzoesische Revolution, Reformation, Deutsches Kaiserreich, Westfaelischer Frieden","Westfaelischer Frieden, Deutsches Kaiserreich, Reformation, Franzoesische Revolution","Deutsches Kaiserreich, Reformation, Westfaelischer Frieden, Franzoesische Revolution"]'::jsonb,
      'Die Reformation begann 1517, der Westfaelische Frieden folgte 1648, die Franzoesische Revolution 1789 und das Deutsche Kaiserreich wurde 1871 gegruendet.',
      'Which sequence is chronologically correct?',
      'Reformation, Peace of Westphalia, French Revolution, German Empire',
      '["Reformation, Peace of Westphalia, French Revolution, German Empire","French Revolution, Reformation, German Empire, Peace of Westphalia","Peace of Westphalia, German Empire, Reformation, French Revolution","German Empire, Reformation, Peace of Westphalia, French Revolution"]'::jsonb,
      'The Reformation began in 1517, the Peace of Westphalia followed in 1648, the French Revolution in 1789, and the German Empire was founded in 1871.'
    ),
    (
      'general-geschichte-04',
      'Geschichte',
      'Was war ein zentrales Ziel des Wiener Kongresses nach Napoleon?',
      'Machtbalance und Restauration in Europa',
      '["Machtbalance und Restauration in Europa","Gruendung der Vereinten Nationen","Abschaffung aller Monarchien","Einfuehrung des Euro"]'::jsonb,
      'Der Wiener Kongress ordnete Europa nach den Napoleonischen Kriegen neu und wollte ein stabiles Gleichgewicht der Grossmaechte schaffen.',
      'What was a central goal of the Congress of Vienna after Napoleon?',
      'Balance of power and restoration in Europe',
      '["Balance of power and restoration in Europe","Founding the United Nations","Abolishing all monarchies","Introducing the euro"]'::jsonb,
      'The Congress of Vienna reordered Europe after the Napoleonic Wars and aimed to create a stable balance among the great powers.'
    ),
    (
      'general-geschichte-05',
      'Geschichte',
      'Warum war Gutenbergs Buchdruck im 15. Jahrhundert so folgenreich?',
      'Texte konnten schneller und guenstiger vervielfaeltigt werden',
      '["Texte konnten schneller und guenstiger vervielfaeltigt werden","Handschriftliche Buecher wurden verboten","Papier wurde dadurch erstmals erfunden","Latein verschwand sofort aus Europa"]'::jsonb,
      'Der Druck mit beweglichen Lettern beschleunigte die Verbreitung von Wissen, Reformideen und wissenschaftlichen Texten deutlich.',
      'Why was Gutenbergs movable-type printing so consequential in the 15th century?',
      'Texts could be copied faster and more cheaply',
      '["Texts could be copied faster and more cheaply","Handwritten books were banned","Paper was invented by it for the first time","Latin immediately disappeared from Europe"]'::jsonb,
      'Movable-type printing greatly accelerated the spread of knowledge, reform ideas, and scientific texts.'
    ),
    (
      'general-geschichte-06',
      'Geschichte',
      'Welches Ereignis loeste 1914 unmittelbar die Julikrise aus?',
      'Das Attentat von Sarajevo',
      '["Das Attentat von Sarajevo","Der Versailler Vertrag","Der Matrosenaufstand in Kiel","Der Hitler-Stalin-Pakt"]'::jsonb,
      'Die Ermordung von Erzherzog Franz Ferdinand in Sarajevo fuehrte zur Julikrise, aus der der Erste Weltkrieg entstand.',
      'Which event directly triggered the July Crisis in 1914?',
      'The assassination in Sarajevo',
      '["The assassination in Sarajevo","The Treaty of Versailles","The Kiel mutiny","The Molotov-Ribbentrop Pact"]'::jsonb,
      'The assassination of Archduke Franz Ferdinand in Sarajevo led to the July Crisis, which escalated into World War I.'
    ),
    (
      'general-sachkunde-01',
      'Sachkunde',
      'Warum fuehlt sich ein Metallloeffel kuehler an als ein Holzloeffel bei gleicher Raumtemperatur?',
      'Metall leitet Waerme schneller von der Haut weg',
      '["Metall leitet Waerme schneller von der Haut weg","Metall hat immer eine niedrigere Temperatur","Holz erzeugt aktiv Waerme","Metall verdunstet Wasser aus der Luft"]'::jsonb,
      'Metall hat eine hoehere Waermeleitfaehigkeit. Es nimmt Waerme aus der Hand schneller auf und wirkt dadurch kaelter.',
      'Why does a metal spoon feel colder than a wooden spoon at the same room temperature?',
      'Metal conducts heat away from skin faster',
      '["Metal conducts heat away from skin faster","Metal always has a lower temperature","Wood actively generates heat","Metal evaporates water from the air"]'::jsonb,
      'Metal has higher thermal conductivity. It takes heat from your hand faster, so it feels colder.'
    ),
    (
      'general-sachkunde-02',
      'Sachkunde',
      'Warum streut man Salz auf vereiste Wege?',
      'Es senkt den Gefrierpunkt von Wasser',
      '["Es senkt den Gefrierpunkt von Wasser","Es macht Eis magnetisch","Es erhoeht die Lufttemperatur","Es verwandelt Eis direkt in Wasserdampf"]'::jsonb,
      'Salz bildet mit Wasser eine Loesung, die erst bei tieferen Temperaturen gefriert. Dadurch kann Eis leichter schmelzen.',
      'Why is salt spread on icy paths?',
      'It lowers the freezing point of water',
      '["It lowers the freezing point of water","It makes ice magnetic","It raises the air temperature","It turns ice directly into vapor"]'::jsonb,
      'Salt mixes with water to form a solution that freezes at a lower temperature, making ice easier to melt.'
    ),
    (
      'general-sachkunde-03',
      'Sachkunde',
      'Welche Energieumwandlung passiert in einem Wasserkraftwerk hauptsaechlich?',
      'Lage- und Bewegungsenergie von Wasser wird elektrische Energie',
      '["Lage- und Bewegungsenergie von Wasser wird elektrische Energie","Elektrische Energie wird chemische Energie im Wasser","Waermeenergie wird direkt zu Licht","Kernenergie wird zu Schallenergie"]'::jsonb,
      'Fallendes oder stroemendes Wasser treibt Turbinen an. Generatoren wandeln diese Bewegung in elektrische Energie um.',
      'Which energy conversion mainly happens in a hydroelectric power plant?',
      'Water position and motion energy becomes electrical energy',
      '["Water position and motion energy becomes electrical energy","Electrical energy becomes chemical energy in water","Heat energy turns directly into light","Nuclear energy becomes sound energy"]'::jsonb,
      'Falling or flowing water drives turbines, and generators convert that motion into electrical energy.'
    ),
    (
      'general-sachkunde-04',
      'Sachkunde',
      'Warum schuetzt eine Sicherung oder ein Leitungsschutzschalter im Stromkreis?',
      'Sie unterbricht bei zu grossem Strom den Stromkreis',
      '["Sie unterbricht bei zu grossem Strom den Stromkreis","Sie speichert ueberschuessigen Strom dauerhaft","Sie macht Wechselstrom zu Trinkwasser","Sie erhoeht die Spannung unbegrenzt"]'::jsonb,
      'Bei Ueberlast oder Kurzschluss kann zu viel Strom fliessen. Die Sicherung trennt den Kreis und reduziert Brand- und Schadensrisiken.',
      'Why does a fuse or circuit breaker protect an electric circuit?',
      'It interrupts the circuit when current is too high',
      '["It interrupts the circuit when current is too high","It stores surplus current forever","It turns alternating current into drinking water","It raises voltage without limit"]'::jsonb,
      'Overload or short circuits can cause too much current. A fuse or breaker opens the circuit and reduces fire and damage risk.'
    ),
    (
      'general-sachkunde-05',
      'Sachkunde',
      'Was bedeutet ein pH-Wert unter 7?',
      'Die Loesung ist sauer',
      '["Die Loesung ist sauer","Die Loesung ist neutral","Die Loesung ist immer giftig","Die Loesung ist ein reines Metall"]'::jsonb,
      'Die pH-Skala ordnet saure, neutrale und basische Loesungen ein. Werte unter 7 gelten als sauer.',
      'What does a pH value below 7 mean?',
      'The solution is acidic',
      '["The solution is acidic","The solution is neutral","The solution is always poisonous","The solution is a pure metal"]'::jsonb,
      'The pH scale classifies acidic, neutral, and basic solutions. Values below 7 are acidic.'
    ),
    (
      'general-sachkunde-06',
      'Sachkunde',
      'Warum beschlaegt eine kalte Fensterscheibe von innen?',
      'Wasserdampf kondensiert an der kalten Oberflaeche',
      '["Wasserdampf kondensiert an der kalten Oberflaeche","Glas produziert Wasser bei Kaelte","Sauerstoff wird zu Eis","Licht verwandelt Staub in Tropfen"]'::jsonb,
      'Warme Luft kann viel Wasserdampf enthalten. An kaltem Glas kuehlt sie ab, und der Wasserdampf wird zu Fluessigkeit.',
      'Why does a cold window fog up on the inside?',
      'Water vapor condenses on the cold surface',
      '["Water vapor condenses on the cold surface","Glass produces water in the cold","Oxygen turns into ice","Light turns dust into drops"]'::jsonb,
      'Warm air can hold a lot of water vapor. When it cools at cold glass, the vapor condenses into liquid.'
    ),
    (
      'general-politik-01',
      'Politik',
      'Was meint Gewaltenteilung in einem demokratischen Staat?',
      'Gesetzgebung, Regierung und Gerichte kontrollieren sich gegenseitig',
      '["Gesetzgebung, Regierung und Gerichte kontrollieren sich gegenseitig","Alle Entscheidungen liegen bei einer einzigen Person","Gerichte schreiben den Staatshaushalt allein","Parteien duerfen keine Gesetze vorschlagen"]'::jsonb,
      'Gewaltenteilung verteilt staatliche Macht auf Legislative, Exekutive und Judikative, damit keine Stelle unkontrolliert herrscht.',
      'What does separation of powers mean in a democratic state?',
      'Legislature, government, and courts check each other',
      '["Legislature, government, and courts check each other","All decisions belong to one single person","Courts write the state budget alone","Parties may not propose laws"]'::jsonb,
      'Separation of powers distributes state power among legislative, executive, and judicial branches so no single body rules unchecked.'
    ),
    (
      'general-politik-02',
      'Politik',
      'Welche Funktion hat der Bundesrat in Deutschland vor allem?',
      'Er beteiligt die Bundeslaender an der Bundesgesetzgebung',
      '["Er beteiligt die Bundeslaender an der Bundesgesetzgebung","Er waehlt direkt alle Buergermeister","Er ersetzt das Bundesverfassungsgericht","Er bestimmt allein den Bundeskanzler"]'::jsonb,
      'Im Bundesrat wirken die Laenderregierungen an Bundesgesetzen mit, besonders wenn Laenderinteressen betroffen sind.',
      'What is the main function of the German Bundesrat?',
      'It involves the federal states in national legislation',
      '["It involves the federal states in national legislation","It directly elects all mayors","It replaces the Constitutional Court","It alone appoints the chancellor"]'::jsonb,
      'In the Bundesrat, state governments participate in federal lawmaking, especially when state interests are affected.'
    ),
    (
      'general-politik-03',
      'Politik',
      'Was bedeutet ein konstruktives Misstrauensvotum im Bundestag?',
      'Ein Kanzler kann nur abgeloest werden, wenn zugleich ein Nachfolger gewaehlt wird',
      '["Ein Kanzler kann nur abgeloest werden, wenn zugleich ein Nachfolger gewaehlt wird","Die Opposition kann jede Wahl automatisch wiederholen lassen","Der Bundesrat kann Parteien verbieten","Die Regierung bleibt ohne Parlament dauerhaft im Amt"]'::jsonb,
      'Das konstruktive Misstrauensvotum soll Regierungskrisen begrenzen, indem Abwahl und Wahl eines neuen Kanzlers verbunden werden.',
      'What does a constructive vote of no confidence mean in the Bundestag?',
      'A chancellor can be removed only if a successor is elected at the same time',
      '["A chancellor can be removed only if a successor is elected at the same time","The opposition can automatically rerun every election","The Bundesrat can ban parties","The government can rule permanently without parliament"]'::jsonb,
      'The constructive vote of no confidence links removal to the election of a new chancellor to reduce government crises.'
    ),
    (
      'general-politik-04',
      'Politik',
      'Warum gibt es in vielen Wahlsystemen eine Sperrklausel wie die 5-Prozent-Huerde?',
      'Sie soll eine starke Zersplitterung des Parlaments begrenzen',
      '["Sie soll eine starke Zersplitterung des Parlaments begrenzen","Sie garantiert jeder Partei Regierungsbeteiligung","Sie ersetzt die geheime Wahl","Sie verhindert grundsaetzlich Koalitionen"]'::jsonb,
      'Eine Sperrklausel soll sehr kleine Parteien vom Parlament fernhalten und dadurch stabilere Mehrheiten ermoeglichen.',
      'Why do many electoral systems use a threshold such as five percent?',
      'It limits heavy fragmentation of parliament',
      '["It limits heavy fragmentation of parliament","It guarantees every party a place in government","It replaces secret voting","It prevents coalitions in general"]'::jsonb,
      'An electoral threshold keeps very small parties out of parliament and can make stable majorities easier.'
    ),
    (
      'general-politik-05',
      'Politik',
      'Welche Aufgabe hat ein Verfassungsgericht typischerweise?',
      'Es prueft, ob staatliches Handeln mit der Verfassung vereinbar ist',
      '["Es prueft, ob staatliches Handeln mit der Verfassung vereinbar ist","Es schreibt taeglich neue Gesetze","Es fuehrt die Polizei im Einsatz","Es legt die Preise fuer Grundnahrungsmittel fest"]'::jsonb,
      'Ein Verfassungsgericht kontrolliert, ob Gesetze und staatliche Entscheidungen die Verfassung beachten.',
      'What is a typical role of a constitutional court?',
      'It checks whether state action is compatible with the constitution',
      '["It checks whether state action is compatible with the constitution","It writes new laws every day","It commands police operations","It sets staple food prices"]'::jsonb,
      'A constitutional court reviews whether laws and government decisions respect the constitution.'
    ),
    (
      'general-politik-06',
      'Politik',
      'Was ist eine Koalitionsregierung?',
      'Mehrere Parteien bilden gemeinsam eine Regierungsmehrheit',
      '["Mehrere Parteien bilden gemeinsam eine Regierungsmehrheit","Eine Partei regiert ohne Parlament","Gerichte uebernehmen die Ministerien","Alle Waehler stimmen ueber jedes Gesetz einzeln ab"]'::jsonb,
      'Wenn keine Partei allein eine Mehrheit hat, koennen Parteien eine Koalition bilden und Regierungsaemter sowie Programm abstimmen.',
      'What is a coalition government?',
      'Several parties form a governing majority together',
      '["Several parties form a governing majority together","One party governs without parliament","Courts take over the ministries","All voters vote on every single law"]'::jsonb,
      'When no party has a majority alone, parties can form a coalition and agree on offices and a government program.'
    ),
    (
      'general-geografie-01',
      'Geografie',
      'Warum verzerren Weltkarten immer bestimmte Flaechen oder Formen?',
      'Eine Kugeloberflaeche wird auf eine Ebene uebertragen',
      '["Eine Kugeloberflaeche wird auf eine Ebene uebertragen","Laender veraendern taeglich ihre Grenzen","Ozeane sind auf Karten nicht messbar","Der Aequator hat keine feste Position"]'::jsonb,
      'Kartennetzentwuerfe muessen die gekruemmte Erdoberflaeche auf Papier oder Bildschirm abbilden. Dabei entstehen unvermeidbare Verzerrungen.',
      'Why do world maps always distort some areas or shapes?',
      'A spherical surface is projected onto a flat plane',
      '["A spherical surface is projected onto a flat plane","Countries change their borders every day","Oceans cannot be measured on maps","The equator has no fixed position"]'::jsonb,
      'Map projections must show the curved surface of Earth on paper or screens, which makes some distortion unavoidable.'
    ),
    (
      'general-geografie-02',
      'Geografie',
      'Was beschreibt ein Monsun am besten?',
      'Eine jahreszeitlich wechselnde Windzirkulation mit Regen- und Trockenzeiten',
      '["Eine jahreszeitlich wechselnde Windzirkulation mit Regen- und Trockenzeiten","Einen dauerhaft gefrorenen Boden","Eine Meeresstroemung nur im Atlantik","Eine kurze Sonnenfinsternis"]'::jsonb,
      'Monsune entstehen durch jahreszeitliche Temperatur- und Druckunterschiede zwischen Land und Meer und bringen oft starke Regenzeiten.',
      'What best describes a monsoon?',
      'A seasonal wind circulation with wet and dry seasons',
      '["A seasonal wind circulation with wet and dry seasons","Permanently frozen ground","An ocean current only in the Atlantic","A short solar eclipse"]'::jsonb,
      'Monsoons are driven by seasonal temperature and pressure differences between land and sea and often bring intense rainy seasons.'
    ),
    (
      'general-geografie-03',
      'Geografie',
      'Wie entsteht typischerweise ein Flussdelta?',
      'Ein Fluss lagert Sedimente an seiner Muendung ab',
      '["Ein Fluss lagert Sedimente an seiner Muendung ab","Ein Vulkan drueckt Lava in einen Gletscher","Ein Gletscher schneidet einen Fjord ins Land","Wind verlagert Sand in eine Wueste"]'::jsonb,
      'Wenn die Stroemung an der Muendung langsamer wird, sinken Sand und Schlamm ab. So kann ein verzweigtes Delta wachsen.',
      'How does a river delta typically form?',
      'A river deposits sediment at its mouth',
      '["A river deposits sediment at its mouth","A volcano pushes lava into a glacier","A glacier cuts a fjord into land","Wind moves sand into a desert"]'::jsonb,
      'When current slows near the mouth, sand and mud settle out, allowing a branching delta to grow.'
    ),
    (
      'general-geografie-04',
      'Geografie',
      'Was bedeutet Regenschatten auf der Leeseite eines Gebirges?',
      'Dort ist es oft trockener, weil Luft vorher auf der Luvseite abregnet',
      '["Dort ist es oft trockener, weil Luft vorher auf der Luvseite abregnet","Dort regnet es staendig wegen tieferer Schwerkraft","Dort gibt es keine Temperaturunterschiede","Dort entstehen Ozeane aus Wolken"]'::jsonb,
      'Feuchte Luft steigt an der Luvseite auf, kuehlt ab und regnet aus. Hinter dem Gebirge kommt trockenere Luft an.',
      'What does rain shadow mean on the leeward side of a mountain range?',
      'It is often drier because air drops rain on the windward side first',
      '["It is often drier because air drops rain on the windward side first","It rains constantly because gravity is lower there","There are no temperature differences there","Oceans form from clouds there"]'::jsonb,
      'Moist air rises on the windward side, cools, and loses rain. Drier air then reaches the leeward side.'
    ),
    (
      'general-geografie-05',
      'Geografie',
      'Was gibt der Breitengrad eines Ortes an?',
      'Die Lage noerdlich oder suedlich des Aequators',
      '["Die Lage noerdlich oder suedlich des Aequators","Die Hoehe ueber dem Meer in Metern","Die Entfernung zum naechsten Fluss","Die politische Zeitzone eines Landes"]'::jsonb,
      'Breitengrade verlaufen parallel zum Aequator und geben an, wie weit ein Ort noerdlich oder suedlich davon liegt.',
      'What does latitude indicate for a place?',
      'Its position north or south of the equator',
      '["Its position north or south of the equator","Its elevation above sea level in meters","Its distance to the nearest river","The political time zone of a country"]'::jsonb,
      'Lines of latitude run parallel to the equator and show how far north or south a place is.'
    ),
    (
      'general-geografie-06',
      'Geografie',
      'Warum treten starke Erdbeben besonders oft an Plattengrenzen auf?',
      'Dort bauen sich Spannungen zwischen bewegten Erdplatten auf',
      '["Dort bauen sich Spannungen zwischen bewegten Erdplatten auf","Dort ist die Erdanziehung fast null","Dort gibt es keine feste Erdkruste","Dort ziehen Magneten die Kontinente zusammen"]'::jsonb,
      'Erdplatten bewegen sich gegeneinander. Wenn verhakte Bereiche ruckartig brechen, wird Energie als Erdbeben frei.',
      'Why do strong earthquakes often occur at plate boundaries?',
      'Stress builds up between moving tectonic plates',
      '["Stress builds up between moving tectonic plates","Gravity is almost zero there","There is no solid crust there","Magnets pull continents together there"]'::jsonb,
      'Tectonic plates move against each other. When locked sections suddenly break, stored energy is released as an earthquake.'
    ),
    (
      'general-brainrot-01',
      'Brainrot',
      'Warum wird Watchtime bei Kurzvideo-Algorithmen oft so stark gewichtet?',
      'Sie zeigt, ob Inhalte Nutzer wirklich halten',
      '["Sie zeigt, ob Inhalte Nutzer wirklich halten","Sie misst nur die Dateigroesse des Videos","Sie ersetzt alle Kommentare automatisch","Sie beweist, dass ein Video wahr ist"]'::jsonb,
      'Wenn viele Menschen ein Video lange ansehen oder wiederholen, ist das ein starkes Signal fuer Relevanz und Bindung.',
      'Why is watch time often weighted strongly by short-video algorithms?',
      'It shows whether content really holds users',
      '["It shows whether content really holds users","It only measures the file size of the video","It automatically replaces all comments","It proves a video is true"]'::jsonb,
      'When many people watch a video for long enough or replay it, that is a strong signal of relevance and retention.'
    ),
    (
      'general-brainrot-02',
      'Brainrot',
      'Was bedeutet Ratio als Internet-Slang meistens?',
      'Eine Antwort bekommt mehr Zustimmung als der Originalpost',
      '["Eine Antwort bekommt mehr Zustimmung als der Originalpost","Ein Video hat genau quadratisches Format","Ein Account hat keine Profilbeschreibung","Ein Kommentar wurde alphabetisch sortiert"]'::jsonb,
      'Ratio beschreibt oft, dass ein Reply mehr Likes oder Aufmerksamkeit bekommt als der Ursprungspost und ihn damit sozial uebertrifft.',
      'What does ratio usually mean as internet slang?',
      'A reply gets more approval than the original post',
      '["A reply gets more approval than the original post","A video has an exact square format","An account has no bio","A comment was sorted alphabetically"]'::jsonb,
      'Ratio often means a reply gets more likes or attention than the original post, socially overtaking it.'
    ),
    (
      'general-brainrot-03',
      'Brainrot',
      'Was ist eine Copypasta?',
      'Ein Textblock, der immer wieder kopiert und gepostet wird',
      '["Ein Textblock, der immer wieder kopiert und gepostet wird","Ein Bot, der nur Bilder zuschneidet","Ein Meme ohne Text","Eine App zum Passwortspeichern"]'::jsonb,
      'Copypastas leben davon, dass ein wiedererkennbarer Text an vielen Stellen fast unveraendert erneut auftaucht.',
      'What is a copypasta?',
      'A text block that gets copied and posted repeatedly',
      '["A text block that gets copied and posted repeatedly","A bot that only crops pictures","A meme without text","An app for storing passwords"]'::jsonb,
      'Copypastas work because a recognizable text appears again and again in nearly unchanged form.'
    ),
    (
      'general-brainrot-04',
      'Brainrot',
      'Was meint Lore in Meme- oder Creator-Communities meistens?',
      'Hintergrundgeschichte und Insider-Kontext',
      '["Hintergrundgeschichte und Insider-Kontext","Die gesetzliche Altersfreigabe eines Clips","Die Bildschirmhelligkeit beim Stream","Ein automatischer Untertitel-Fehler"]'::jsonb,
      'Lore meint den Kontext, die Running Gags und die Vorgeschichte, die ein Meme oder eine Online-Figur erst richtig verstaendlich machen.',
      'What does lore usually mean in meme or creator communities?',
      'Backstory and insider context',
      '["Backstory and insider context","The legal age rating of a clip","Screen brightness during a stream","An automatic subtitle error"]'::jsonb,
      'Lore refers to the context, running jokes, and backstory that make a meme or online persona fully understandable.'
    ),
    (
      'general-brainrot-05',
      'Brainrot',
      'Woran erkennt man Engagement Bait am ehesten?',
      'Der Post provoziert bewusst schnelle Kommentare oder Reaktionen',
      '["Der Post provoziert bewusst schnelle Kommentare oder Reaktionen","Der Post vermeidet jede Interaktion","Der Post besteht nur aus Quellenangaben","Der Post wird nur im Flugmodus angezeigt"]'::jsonb,
      'Engagement Bait ist darauf gebaut, Nutzer zu Likes, Kommentaren, Shares oder Streit zu bewegen, damit der Beitrag mehr Reichweite bekommt.',
      'How can engagement bait usually be recognized?',
      'The post deliberately provokes quick comments or reactions',
      '["The post deliberately provokes quick comments or reactions","The post avoids every interaction","The post is only a list of sources","The post appears only in airplane mode"]'::jsonb,
      'Engagement bait is built to push users into likes, comments, shares, or arguments so the post gets more reach.'
    ),
    (
      'general-brainrot-06',
      'Brainrot',
      'Was ist ein deep-fried Meme?',
      'Ein absichtlich stark komprimiertes und ueberbearbeitetes Meme',
      '["Ein absichtlich stark komprimiertes und ueberbearbeitetes Meme","Ein Meme, das nur in Kochvideos vorkommt","Ein geloschter Livestream","Ein offiziell gepruefter Nachrichtentext"]'::jsonb,
      'Deep-fried Memes nutzen sichtbare Artefakte, grelle Effekte und uebertriebene Bearbeitung als Teil des Witzes.',
      'What is a deep-fried meme?',
      'An intentionally overcompressed and overedited meme',
      '["An intentionally overcompressed and overedited meme","A meme that appears only in cooking videos","A deleted livestream","An officially verified news text"]'::jsonb,
      'Deep-fried memes use visible artifacts, harsh effects, and exaggerated editing as part of the joke.'
    )
),
upsert_questions as (
  insert into public.questions (
    slug,
    category,
    question,
    correct_answer,
    options,
    explanation
  )
  select
    slug,
    category,
    question_de,
    correct_de,
    options_de,
    explanation_de
  from question_rows
  on conflict (slug) do update
    set category = excluded.category,
        question = excluded.question,
        correct_answer = excluded.correct_answer,
        options = excluded.options,
        explanation = excluded.explanation,
        updated_at = now()
  returning id, slug
)
insert into public.question_translations (
  question_id,
  language,
  question,
  options,
  correct_answer,
  explanation
)
select
  upsert_questions.id,
  'en',
  question_rows.question_en,
  question_rows.options_en,
  question_rows.correct_en,
  question_rows.explanation_en
from upsert_questions
join question_rows
  on question_rows.slug = upsert_questions.slug
on conflict (question_id, language) do update
  set question = excluded.question,
      options = excluded.options,
      correct_answer = excluded.correct_answer,
      explanation = excluded.explanation,
      updated_at = now();
