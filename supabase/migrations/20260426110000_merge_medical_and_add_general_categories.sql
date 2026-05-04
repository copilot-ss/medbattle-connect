-- Collapse medical subcategories into one visible category and add the new general topic categories.

update public.questions
set category = 'Medizin',
    updated_at = now()
where lower(trim(category)) in (
  'anatomie',
  'physiologie',
  'pathologie',
  'pharmakologie',
  'mikrobiologie',
  'biochemie',
  'immunologie',
  'genetik',
  'radiologie',
  'chirurgie'
);

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
      'In welchem Jahr fiel die Berliner Mauer?',
      '1989',
      '["1989","1945","1999","1975"]'::jsonb,
      'Die Berliner Mauer fiel am 9. November 1989. Das war ein zentraler Schritt zur deutschen Wiedervereinigung.',
      'In which year did the Berlin Wall fall?',
      '1989',
      '["1989","1945","1999","1975"]'::jsonb,
      'The Berlin Wall fell on November 9, 1989. It was a key step toward German reunification.'
    ),
    (
      'general-geschichte-02',
      'Geschichte',
      'Welche antike Zivilisation baute die Pyramiden von Gizeh?',
      'Aegypter',
      '["Aegypter","Roemer","Wikinger","Maya"]'::jsonb,
      'Die Pyramiden von Gizeh wurden im Alten Aegypten als monumentale Grab- und Kultbauten errichtet.',
      'Which ancient civilization built the pyramids of Giza?',
      'Egyptians',
      '["Egyptians","Romans","Vikings","Maya"]'::jsonb,
      'The pyramids of Giza were built in ancient Egypt as monumental tomb and cult structures.'
    ),
    (
      'general-geschichte-03',
      'Geschichte',
      'Welche Stadt war das Zentrum des Roemischen Reiches?',
      'Rom',
      '["Rom","Athen","Paris","London"]'::jsonb,
      'Rom war das politische und kulturelle Zentrum des Roemischen Reiches.',
      'Which city was the center of the Roman Empire?',
      'Rome',
      '["Rome","Athens","Paris","London"]'::jsonb,
      'Rome was the political and cultural center of the Roman Empire.'
    ),
    (
      'general-geschichte-04',
      'Geschichte',
      'Welches Ereignis begann 1914 in Europa?',
      'Erster Weltkrieg',
      '["Erster Weltkrieg","Zweiter Weltkrieg","Kalter Krieg","Franzoesische Revolution"]'::jsonb,
      'Der Erste Weltkrieg begann 1914 nach der Julikrise und dauerte bis 1918.',
      'Which event began in Europe in 1914?',
      'World War I',
      '["World War I","World War II","Cold War","French Revolution"]'::jsonb,
      'World War I began in 1914 after the July Crisis and lasted until 1918.'
    ),
    (
      'general-geschichte-05',
      'Geschichte',
      'Welche Epoche steht besonders fuer Fabriken, Dampfmaschinen und Massenproduktion?',
      'Industrialisierung',
      '["Industrialisierung","Steinzeit","Renaissance","Antike"]'::jsonb,
      'Die Industrialisierung veraenderte Produktion, Arbeit und Gesellschaft durch Maschinen und Fabriken.',
      'Which era is strongly linked to factories, steam engines, and mass production?',
      'Industrialization',
      '["Industrialization","Stone Age","Renaissance","Antiquity"]'::jsonb,
      'Industrialization changed production, work, and society through machines and factories.'
    ),
    (
      'general-geschichte-06',
      'Geschichte',
      'Welche Revolution begann 1789?',
      'Franzoesische Revolution',
      '["Franzoesische Revolution","Russische Revolution","Industrielle Revolution","Digitale Revolution"]'::jsonb,
      'Die Franzoesische Revolution begann 1789 und veraenderte Staat, Gesellschaft und Politik in Europa stark.',
      'Which revolution began in 1789?',
      'French Revolution',
      '["French Revolution","Russian Revolution","Industrial Revolution","Digital Revolution"]'::jsonb,
      'The French Revolution began in 1789 and strongly changed government, society, and politics in Europe.'
    ),
    (
      'general-sachkunde-01',
      'Sachkunde',
      'Was brauchen Pflanzen fuer Fotosynthese?',
      'Licht, Wasser und Kohlendioxid',
      '["Licht, Wasser und Kohlendioxid","Sand, Salz und Rauch","Oel, Metall und Glas","Schnee, Feuer und Stein"]'::jsonb,
      'Pflanzen nutzen Lichtenergie, Wasser und Kohlendioxid, um Zucker und Sauerstoff zu bilden.',
      'What do plants need for photosynthesis?',
      'Light, water, and carbon dioxide',
      '["Light, water, and carbon dioxide","Sand, salt, and smoke","Oil, metal, and glass","Snow, fire, and stone"]'::jsonb,
      'Plants use light energy, water, and carbon dioxide to produce sugar and oxygen.'
    ),
    (
      'general-sachkunde-02',
      'Sachkunde',
      'Was beschreibt der Wasserkreislauf?',
      'Verdunstung, Wolkenbildung und Regen',
      '["Verdunstung, Wolkenbildung und Regen","Nur das Gefrieren von Eis","Nur das Trinken von Wasser","Die Herstellung von Glas"]'::jsonb,
      'Im Wasserkreislauf verdunstet Wasser, bildet Wolken und faellt als Niederschlag wieder zur Erde.',
      'What does the water cycle describe?',
      'Evaporation, cloud formation, and rain',
      '["Evaporation, cloud formation, and rain","Only ice freezing","Only drinking water","Making glass"]'::jsonb,
      'In the water cycle, water evaporates, forms clouds, and returns to Earth as precipitation.'
    ),
    (
      'general-sachkunde-03',
      'Sachkunde',
      'Welche Abfaelle gehoeren typischerweise in die Papiertonne?',
      'Zeitungen und Kartons',
      '["Zeitungen und Kartons","Batterien","Essensreste","Farbreste"]'::jsonb,
      'Zeitungen und Kartons bestehen aus Papier oder Pappe und koennen meistens recycelt werden.',
      'Which waste usually belongs in the paper bin?',
      'Newspapers and cardboard',
      '["Newspapers and cardboard","Batteries","Food scraps","Paint leftovers"]'::jsonb,
      'Newspapers and cardboard are made of paper or cardboard and can usually be recycled.'
    ),
    (
      'general-sachkunde-04',
      'Sachkunde',
      'Was zieht ein Magnet besonders gut an?',
      'Eisen',
      '["Eisen","Holz","Papier","Wasser"]'::jsonb,
      'Magnete ziehen ferromagnetische Stoffe wie Eisen besonders gut an.',
      'What does a magnet attract especially well?',
      'Iron',
      '["Iron","Wood","Paper","Water"]'::jsonb,
      'Magnets attract ferromagnetic materials such as iron especially well.'
    ),
    (
      'general-sachkunde-05',
      'Sachkunde',
      'Warum gibt es auf der Erde Jahreszeiten?',
      'Wegen der geneigten Erdachse',
      '["Wegen der geneigten Erdachse","Wegen der Farbe der Wolken","Wegen der Mondphasen","Wegen der Meereswellen"]'::jsonb,
      'Die geneigte Erdachse veraendert im Jahreslauf Sonnenstand und Tageslaenge.',
      'Why does Earth have seasons?',
      'Because Earth has a tilted axis',
      '["Because Earth has a tilted axis","Because of cloud color","Because of moon phases","Because of ocean waves"]'::jsonb,
      'Earth has a tilted axis, which changes sun angle and day length during the year.'
    ),
    (
      'general-sachkunde-06',
      'Sachkunde',
      'Was ist ein Stromkreis?',
      'Ein geschlossener Weg fuer elektrischen Strom',
      '["Ein geschlossener Weg fuer elektrischen Strom","Ein Kreis aus Wasser","Eine Karte mit Strassen","Ein Tierbau"]'::jsonb,
      'Elektrischer Strom kann nur dauerhaft fliessen, wenn der Stromkreis geschlossen ist.',
      'What is an electric circuit?',
      'A closed path for electric current',
      '["A closed path for electric current","A circle of water","A map with roads","An animal burrow"]'::jsonb,
      'Electric current can flow continuously only when the circuit is closed.'
    ),
    (
      'general-politik-01',
      'Politik',
      'Was bedeutet Demokratie?',
      'Herrschaft des Volkes',
      '["Herrschaft des Volkes","Herrschaft einer Person","Herrschaft durch Zufall","Herrschaft ohne Regeln"]'::jsonb,
      'In einer Demokratie entscheidet das Volk direkt oder indirekt durch gewaehlte Vertreter mit.',
      'What does democracy mean?',
      'Rule by the people',
      '["Rule by the people","Rule by one person","Rule by chance","Rule without rules"]'::jsonb,
      'In a democracy, the people take part in decisions directly or through elected representatives.'
    ),
    (
      'general-politik-02',
      'Politik',
      'Wie heisst das deutsche Parlament auf Bundesebene?',
      'Bundestag',
      '["Bundestag","Bundesrat","Landtag","Stadtrat"]'::jsonb,
      'Der Bundestag ist das direkt gewaehlte Parlament der Bundesrepublik Deutschland.',
      'What is Germany federal parliament called?',
      'Bundestag',
      '["Bundestag","Bundesrat","Landtag","City council"]'::jsonb,
      'The Bundestag is the directly elected parliament of the Federal Republic of Germany.'
    ),
    (
      'general-politik-03',
      'Politik',
      'Was regelt eine Verfassung?',
      'Grundregeln eines Staates',
      '["Grundregeln eines Staates","Die Wettervorhersage","Den Spielplan einer Liga","Die Preise im Supermarkt"]'::jsonb,
      'Eine Verfassung legt zentrale Rechte, Pflichten und die Organisation des Staates fest.',
      'What does a constitution define?',
      'Basic rules of a state',
      '["Basic rules of a state","The weather forecast","A league schedule","Supermarket prices"]'::jsonb,
      'A constitution defines key rights, duties, and the organization of a state.'
    ),
    (
      'general-politik-04',
      'Politik',
      'Was macht die Opposition in einem Parlament?',
      'Regierung kontrollieren und Alternativen anbieten',
      '["Regierung kontrollieren und Alternativen anbieten","Immer die Polizei leiten","Wahlen verbieten","Gerichte ersetzen"]'::jsonb,
      'Opposition kontrolliert die Regierung, kritisiert Entscheidungen und stellt eigene Vorschlaege vor.',
      'What does the opposition do in a parliament?',
      'Check the government and offer alternatives',
      '["Check the government and offer alternatives","Always lead the police","Ban elections","Replace courts"]'::jsonb,
      'The opposition checks the government, criticizes decisions, and presents its own proposals.'
    ),
    (
      'general-politik-05',
      'Politik',
      'Was ist eine Wahl?',
      'Eine Abstimmung zur Auswahl von Personen oder Parteien',
      '["Eine Abstimmung zur Auswahl von Personen oder Parteien","Ein Wetterereignis","Ein medizinischer Test","Ein Verkehrsschild"]'::jsonb,
      'Bei einer Wahl entscheiden Wahlberechtigte, wer sie politisch vertreten soll.',
      'What is an election?',
      'A vote to choose people or parties',
      '["A vote to choose people or parties","A weather event","A medical test","A traffic sign"]'::jsonb,
      'In an election, eligible voters decide who should represent them politically.'
    ),
    (
      'general-politik-06',
      'Politik',
      'Wer leitet in vielen deutschen Staedten die Stadtverwaltung?',
      'Buergermeister',
      '["Buergermeister","Bundespraesident","Kanzler","Richter"]'::jsonb,
      'Der Buergermeister oder die Buergermeisterin steht in vielen Staedten an der Spitze der Verwaltung.',
      'Who leads the city administration in many German cities?',
      'Mayor',
      '["Mayor","Federal president","Chancellor","Judge"]'::jsonb,
      'The mayor leads the administration in many cities.'
    ),
    (
      'general-geografie-01',
      'Geografie',
      'Welcher Ozean ist der groesste der Erde?',
      'Pazifik',
      '["Pazifik","Atlantik","Indischer Ozean","Arktischer Ozean"]'::jsonb,
      'Der Pazifik ist der groesste und tiefste Ozean der Erde.',
      'Which ocean is the largest on Earth?',
      'Pacific Ocean',
      '["Pacific Ocean","Atlantic Ocean","Indian Ocean","Arctic Ocean"]'::jsonb,
      'The Pacific Ocean is the largest and deepest ocean on Earth.'
    ),
    (
      'general-geografie-02',
      'Geografie',
      'Welche gedachte Linie teilt die Erde in Nord- und Suedhalbkugel?',
      'Aequator',
      '["Aequator","Nullmeridian","Wendekreis","Polarkreis"]'::jsonb,
      'Der Aequator verlaeuft rund um die Erde und trennt Nord- und Suedhalbkugel.',
      'Which imaginary line divides Earth into northern and southern hemispheres?',
      'Equator',
      '["Equator","Prime meridian","Tropic","Polar circle"]'::jsonb,
      'The equator runs around Earth and separates the northern and southern hemispheres.'
    ),
    (
      'general-geografie-03',
      'Geografie',
      'Auf welchem Kontinent liegt Brasilien?',
      'Suedamerika',
      '["Suedamerika","Europa","Afrika","Asien"]'::jsonb,
      'Brasilien ist das groesste Land Suedamerikas.',
      'On which continent is Brazil located?',
      'South America',
      '["South America","Europe","Africa","Asia"]'::jsonb,
      'Brazil is the largest country in South America.'
    ),
    (
      'general-geografie-04',
      'Geografie',
      'Welche Himmelsrichtung liegt gegenueber von Norden?',
      'Sueden',
      '["Sueden","Osten","Westen","Nordosten"]'::jsonb,
      'Sueden ist die entgegengesetzte Himmelsrichtung zu Norden.',
      'Which cardinal direction is opposite north?',
      'South',
      '["South","East","West","Northeast"]'::jsonb,
      'South is the cardinal direction opposite north.'
    ),
    (
      'general-geografie-05',
      'Geografie',
      'Welche Hauptstadt gehoert zu Frankreich?',
      'Paris',
      '["Paris","Madrid","Rom","Berlin"]'::jsonb,
      'Paris ist die Hauptstadt Frankreichs.',
      'Which capital belongs to France?',
      'Paris',
      '["Paris","Madrid","Rome","Berlin"]'::jsonb,
      'Paris is the capital of France.'
    ),
    (
      'general-geografie-06',
      'Geografie',
      'Was zeigt eine physische Karte besonders?',
      'Gebirge, Fluesse und Landschaften',
      '["Gebirge, Fluesse und Landschaften","Nur Parteien","Nur Apps","Nur Preise"]'::jsonb,
      'Physische Karten zeigen vor allem natuerliche Merkmale wie Hoehen, Gebirge, Fluesse und Landschaften.',
      'What does a physical map mainly show?',
      'Mountains, rivers, and landscapes',
      '["Mountains, rivers, and landscapes","Only parties","Only apps","Only prices"]'::jsonb,
      'Physical maps mainly show natural features such as elevation, mountains, rivers, and landscapes.'
    ),
    (
      'general-brainrot-01',
      'Brainrot',
      'Was bedeutet es, wenn ein Video viral geht?',
      'Es verbreitet sich sehr schnell',
      '["Es verbreitet sich sehr schnell","Es wird geloescht","Es ist immer offline","Es hat keinen Ton"]'::jsonb,
      'Viral bedeutet, dass sich ein Inhalt in kurzer Zeit sehr weit verbreitet.',
      'What does it mean when a video goes viral?',
      'It spreads very quickly',
      '["It spreads very quickly","It gets deleted","It is always offline","It has no sound"]'::jsonb,
      'Viral means content spreads very widely in a short time.'
    ),
    (
      'general-brainrot-02',
      'Brainrot',
      'Was ist ein Meme?',
      'Ein oft kopierter Internetwitz oder Trend',
      '["Ein oft kopierter Internetwitz oder Trend","Ein amtliches Formular","Ein Planet","Ein Kochgeraet"]'::jsonb,
      'Memes sind wiedererkennbare Witze, Bilder, Clips oder Formate, die online weiterverbreitet und veraendert werden.',
      'What is a meme?',
      'An often copied internet joke or trend',
      '["An often copied internet joke or trend","An official form","A planet","A cooking tool"]'::jsonb,
      'Memes are recognizable jokes, images, clips, or formats that are shared and changed online.'
    ),
    (
      'general-brainrot-03',
      'Brainrot',
      'Wofuer steht POV in vielen kurzen Clips?',
      'Point of View',
      '["Point of View","Power of Video","Place of Voice","Pixel on View"]'::jsonb,
      'POV steht fuer Point of View und meint eine Szene aus einer bestimmten Perspektive.',
      'What does POV stand for in many short clips?',
      'Point of View',
      '["Point of View","Power of Video","Place of Voice","Pixel on View"]'::jsonb,
      'POV stands for Point of View and means a scene from a specific perspective.'
    ),
    (
      'general-brainrot-04',
      'Brainrot',
      'Was ist ein Streamer?',
      'Eine Person, die live Inhalte uebertraegt',
      '["Eine Person, die live Inhalte uebertraegt","Ein Computerkabel","Ein Druckerpapier","Ein Wetterdienst"]'::jsonb,
      'Streamer senden live Video- oder Audioinhalte an ein Online-Publikum.',
      'What is a streamer?',
      'A person who broadcasts content live',
      '["A person who broadcasts content live","A computer cable","Printer paper","A weather service"]'::jsonb,
      'Streamers broadcast live video or audio content to an online audience.'
    ),
    (
      'general-brainrot-05',
      'Brainrot',
      'Was bedeutet NPC als Internet-Slang meistens?',
      'Jemand wirkt sehr vorhersehbar',
      '["Jemand wirkt sehr vorhersehbar","Jemand ist ein Browser","Jemand besitzt ein Raumschiff","Jemand schreibt ein Gesetz"]'::jsonb,
      'NPC kommt aus Videospielen und wird online oft fuer sehr vorhersehbares Verhalten benutzt.',
      'What does NPC usually mean as internet slang?',
      'Someone seems very predictable',
      '["Someone seems very predictable","Someone is a browser","Someone owns a spaceship","Someone writes a law"]'::jsonb,
      'NPC comes from video games and is often used online for very predictable behavior.'
    ),
    (
      'general-brainrot-06',
      'Brainrot',
      'Was ist ein Trend-Sound?',
      'Ein Ton, den viele fuer eigene Clips benutzen',
      '["Ein Ton, den viele fuer eigene Clips benutzen","Ein kaputter Lautsprecher","Ein Gesetzestext","Ein Offline-Spielstand"]'::jsonb,
      'Ein Trend-Sound ist ein Audioausschnitt, den viele Nutzer fuer aehnliche oder neue Clips verwenden.',
      'What is a trend sound?',
      'Audio many people use for their own clips',
      '["Audio many people use for their own clips","A broken speaker","A legal text","An offline save file"]'::jsonb,
      'A trend sound is an audio clip that many users reuse for similar or new clips.'
    ),
    (
      'general-survival-01',
      'Survival',
      'Was ist in einer Notlage meist zuerst wichtig?',
      'Ruhe bewahren und Gefahren pruefen',
      '["Ruhe bewahren und Gefahren pruefen","Sofort losrennen","Ausruestung wegwerfen","Handy ausschalten"]'::jsonb,
      'Wer ruhig bleibt und Gefahren prueft, kann bessere Entscheidungen treffen und weitere Risiken vermeiden.',
      'What is usually important first in an emergency?',
      'Stay calm and check hazards',
      '["Stay calm and check hazards","Run immediately","Throw away gear","Turn off the phone"]'::jsonb,
      'Staying calm and checking hazards helps you make better decisions and avoid further risk.'
    ),
    (
      'general-survival-02',
      'Survival',
      'Welche Nummer ruft man in vielen europaeischen Laendern im Notfall an?',
      '112',
      '["112","11833","404","9999"]'::jsonb,
      'Die 112 ist in der EU und vielen weiteren Laendern die zentrale Notrufnummer.',
      'Which number do you call for emergencies in many European countries?',
      '112',
      '["112","11833","404","9999"]'::jsonb,
      '112 is the central emergency number in the EU and many other countries.'
    ),
    (
      'general-survival-03',
      'Survival',
      'Warum sollte Wasser im Zweifel abgekocht werden?',
      'Um viele Krankheitserreger abzutoeten',
      '["Um viele Krankheitserreger abzutoeten","Um es salziger zu machen","Um es magnetisch zu machen","Um es blau zu faerben"]'::jsonb,
      'Abkochen kann viele Bakterien, Viren und Parasiten im Wasser unschaedlich machen.',
      'Why should water be boiled when in doubt?',
      'To kill many pathogens',
      '["To kill many pathogens","To make it saltier","To make it magnetic","To dye it blue"]'::jsonb,
      'Boiling can make many bacteria, viruses, and parasites in water harmless.'
    ),
    (
      'general-survival-04',
      'Survival',
      'Was hilft bei Orientierung ohne Handy?',
      'Karte und Kompass',
      '["Karte und Kompass","Kaugummi","Ladekabel ohne Strom","Sonnenbrille bei Nacht"]'::jsonb,
      'Karte und Kompass funktionieren ohne Akku und helfen, Richtung und Standort einzuschaetzen.',
      'What helps with navigation without a phone?',
      'Map and compass',
      '["Map and compass","Chewing gum","A charging cable without power","Sunglasses at night"]'::jsonb,
      'A map and compass work without a battery and help estimate direction and location.'
    ),
    (
      'general-survival-05',
      'Survival',
      'Was schuetzt draussen besonders vor Unterkuehlung?',
      'Trockene, warme Kleidung',
      '["Trockene, warme Kleidung","Nasse Baumwolle","Barfuss laufen","Sich in Wind stellen"]'::jsonb,
      'Trockene, isolierende Kleidung reduziert Waermeverlust und senkt das Risiko einer Unterkuehlung.',
      'What especially helps prevent hypothermia outdoors?',
      'Dry, warm clothing',
      '["Dry, warm clothing","Wet cotton","Walking barefoot","Standing in wind"]'::jsonb,
      'Dry insulating clothing reduces heat loss and lowers the risk of hypothermia.'
    ),
    (
      'general-survival-06',
      'Survival',
      'Wofuer ist eine Signalpfeife in einer Notlage nuetzlich?',
      'Um auf sich aufmerksam zu machen',
      '["Um auf sich aufmerksam zu machen","Um Wasser zu filtern","Um Feuer zu loeschen","Um Essen zu kuehlen"]'::jsonb,
      'Eine Pfeife ist laut, spart Kraft und kann Retter auf die eigene Position aufmerksam machen.',
      'What is a signal whistle useful for in an emergency?',
      'Attracting attention',
      '["Attracting attention","Filtering water","Putting out fire","Cooling food"]'::jsonb,
      'A whistle is loud, saves energy, and can alert rescuers to your location.'
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
