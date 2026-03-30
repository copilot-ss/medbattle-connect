-- Add a larger curated bilingual question pack with explicit, answer-linked explanations.

with question_rows (
  slug,
  category,
  difficulty,
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
      'anatomie-foramen-spinosum-a-meningea-media',
      'Anatomie',
      'mittel',
      'Durch welches Foramen tritt die A. meningea media typischerweise in die Schaedelhoehle ein?',
      'Foramen spinosum',
      '["Foramen spinosum","Foramen ovale","Foramen rotundum","Canalis caroticus"]'::jsonb,
      'Die A. meningea media zieht durch das Foramen spinosum. Sie versorgt grosse Teile der Dura und ist klinisch wichtig, weil ihre Ruptur ein epidurales Haematom verursachen kann.',
      'Through which foramen does the middle meningeal artery typically enter the cranial cavity?',
      'Foramen spinosum',
      '["Foramen spinosum","Foramen ovale","Foramen rotundum","Carotid canal"]'::jsonb,
      'The middle meningeal artery passes through the foramen spinosum. It supplies much of the dura and is clinically important because rupture can cause an epidural hematoma.'
    ),
    (
      'anatomie-testis-lymphabfluss',
      'Anatomie',
      'mittel',
      'In welche Lymphknoten drainiert der Hoden primaer?',
      'Paraaortale Lymphknoten',
      '["Paraaortale Lymphknoten","Inguinale Lymphknoten","Iliakale externa Lymphknoten","Axillaere Lymphknoten"]'::jsonb,
      'Der Hoden drainiert zu paraaortalen Lymphknoten, weil seine embryologische Entwicklung im hinteren Abdomen beginnt. Deshalb folgt der Lymphabfluss nicht dem der skrotalen Haut.',
      'Which lymph nodes receive the primary lymphatic drainage of the testis?',
      'Paraaortic lymph nodes',
      '["Paraaortic lymph nodes","Inguinal lymph nodes","External iliac lymph nodes","Axillary lymph nodes"]'::jsonb,
      'The testis drains to paraaortic lymph nodes because its embryologic origin is in the posterior abdomen. Its lymphatic drainage therefore does not follow the scrotal skin.'
    ),
    (
      'physiologie-nkcc2-henle',
      'Physiologie',
      'mittel',
      'In welchem Nephronabschnitt befindet sich der Na-K-2Cl-Kotransporter NKCC2?',
      'Dicker aufsteigender Teil der Henle-Schleife',
      '["Dicker aufsteigender Teil der Henle-Schleife","Proximaler Tubulus","Distaler Tubulus","Sammelrohr"]'::jsonb,
      'NKCC2 sitzt im dicken aufsteigenden Teil der Henle-Schleife. Dort werden Natrium, Kalium und Chlorid rueckresorbiert, und genau dort greifen auch Schleifendiuretika wie Furosemid an.',
      'In which nephron segment is the Na-K-2Cl cotransporter NKCC2 located?',
      'Thick ascending limb of the loop of Henle',
      '["Thick ascending limb of the loop of Henle","Proximal tubule","Distal tubule","Collecting duct"]'::jsonb,
      'NKCC2 is located in the thick ascending limb of the loop of Henle. This segment reabsorbs sodium, potassium, and chloride and is the target of loop diuretics such as furosemide.'
    ),
    (
      'physiologie-adh-aquaporin2',
      'Physiologie',
      'mittel',
      'Welches Hormon foerdert im Sammelrohr den Einbau von Aquaporin-2 in die apikale Membran?',
      'ADH',
      '["ADH","Aldosteron","ANP","Renin"]'::jsonb,
      'ADH bindet an V2-Rezeptoren der Hauptzellen im Sammelrohr und foerdert den Einbau von Aquaporin-2. Dadurch steigt die Wasserrueckresorption und der Urin wird konzentrierter.',
      'Which hormone promotes insertion of aquaporin 2 into the apical membrane in the collecting duct?',
      'ADH',
      '["ADH","Aldosterone","ANP","Renin"]'::jsonb,
      'ADH binds V2 receptors on principal cells in the collecting duct and promotes aquaporin 2 insertion. This increases water reabsorption and concentrates the urine.'
    ),
    (
      'pathologie-hirninfarkt-liquefaktion',
      'Pathologie',
      'mittel',
      'Welche Nekroseform ist fuer einen ischaemischen Hirninfarkt typisch?',
      'Liquefaktionsnekrose',
      '["Liquefaktionsnekrose","Koagulationsnekrose","Kaesenekrose","Fibrinoide Nekrose"]'::jsonb,
      'Im Gehirn fuehrt Ischaemie typischerweise zu einer Liquefaktionsnekrose. Das liegt unter anderem am hohen Lipidgehalt und an hydrolytischen Enzymen, die das Gewebe verfluessigen.',
      'Which type of necrosis is typical of an ischemic cerebral infarct?',
      'Liquefactive necrosis',
      '["Liquefactive necrosis","Coagulative necrosis","Caseous necrosis","Fibrinoid necrosis"]'::jsonb,
      'In the brain, ischemia typically produces liquefactive necrosis. This is related to the high lipid content and hydrolytic enzymes that digest the tissue.'
    ),
    (
      'pathologie-barrett-becherzellen',
      'Pathologie',
      'mittel',
      'Welcher histologische Befund ist typisch fuer einen Barrett-Oesophagus?',
      'Intestinale Metaplasie mit Becherzellen',
      '["Intestinale Metaplasie mit Becherzellen","Plattenepithelmetaplasie ohne Becherzellen","Koagulationsnekrose","Granulombildung"]'::jsonb,
      'Beim Barrett-Oesophagus wird das normale Plattenepithel durch spezialisiertes intestinales Zylinderepithel mit Becherzellen ersetzt. Dieser Befund ist entscheidend fuer die Diagnose.',
      'Which histologic finding is typical of Barrett esophagus?',
      'Intestinal metaplasia with goblet cells',
      '["Intestinal metaplasia with goblet cells","Squamous metaplasia without goblet cells","Coagulative necrosis","Granuloma formation"]'::jsonb,
      'In Barrett esophagus, the normal squamous epithelium is replaced by specialized intestinal-type columnar epithelium with goblet cells. This finding is essential for the diagnosis.'
    ),
    (
      'pharmakologie-naloxon-opioid',
      'Pharmakologie',
      'mittel',
      'Welches Medikament wird zur raschen Antagonisierung einer Opioidintoxikation eingesetzt?',
      'Naloxon',
      '["Naloxon","Flumazenil","Atropin","N-Acetylcystein"]'::jsonb,
      'Naloxon ist ein kompetitiver Opioidrezeptor-Antagonist und hebt die atemdepressive Wirkung von Opioiden rasch auf. Deshalb ist es das Mittel der Wahl bei Opioidueberdosierung.',
      'Which drug is used to rapidly reverse opioid intoxication?',
      'Naloxone',
      '["Naloxone","Flumazenil","Atropine","N-acetylcysteine"]'::jsonb,
      'Naloxone is a competitive opioid receptor antagonist and rapidly reverses opioid-induced respiratory depression. It is therefore the drug of choice in opioid overdose.'
    ),
    (
      'pharmakologie-metformin-glukoneogenese',
      'Pharmakologie',
      'mittel',
      'Welcher Haupteffekt von Metformin senkt den Blutzucker bei Typ-2-Diabetes?',
      'Hemmung der hepatischen Glukoneogenese',
      '["Hemmung der hepatischen Glukoneogenese","Stimulation der Beta-Zellsekretion","Blockade des SGLT2 im proximalen Tubulus","Aktivierung von PPAR-gamma"]'::jsonb,
      'Metformin senkt vor allem die hepatische Glukoseproduktion und verbessert damit die Stoffwechsellage bei Typ-2-Diabetes. Es wirkt nicht primaer durch direkte Insulinfreisetzung.',
      'Which main effect of metformin lowers blood glucose in type 2 diabetes?',
      'Inhibition of hepatic gluconeogenesis',
      '["Inhibition of hepatic gluconeogenesis","Stimulation of beta-cell secretion","Blockade of SGLT2 in the proximal tubule","Activation of PPAR-gamma"]'::jsonb,
      'Metformin mainly lowers hepatic glucose production and thereby improves glycemic control in type 2 diabetes. It does not act primarily by directly releasing insulin.'
    ),
    (
      'mikrobiologie-proteus-struvit',
      'Mikrobiologie',
      'mittel',
      'Welcher Erreger ist klassisch mit Struvitsteinen und Hirschgeweihsteinen assoziiert?',
      'Proteus mirabilis',
      '["Proteus mirabilis","Escherichia coli","Staphylococcus epidermidis","Enterococcus faecium"]'::jsonb,
      'Proteus mirabilis bildet Urease und alkalisiert damit den Urin. Das foerdert die Ausfaellung von Magnesium-Ammonium-Phosphat und damit die Bildung von Struvit- beziehungsweise Hirschgeweihsteinen.',
      'Which pathogen is classically associated with struvite stones and staghorn calculi?',
      'Proteus mirabilis',
      '["Proteus mirabilis","Escherichia coli","Staphylococcus epidermidis","Enterococcus faecium"]'::jsonb,
      'Proteus mirabilis produces urease and thereby alkalinizes the urine. This promotes precipitation of magnesium ammonium phosphate and thus formation of struvite and staghorn calculi.'
    ),
    (
      'mikrobiologie-mycoplasma-kalte-agglutinine',
      'Mikrobiologie',
      'mittel',
      'Welcher Erreger einer atypischen Pneumonie ist mit kalten Agglutininen assoziiert?',
      'Mycoplasma pneumoniae',
      '["Mycoplasma pneumoniae","Legionella pneumophila","Chlamydia psittaci","Klebsiella pneumoniae"]'::jsonb,
      'Mycoplasma pneumoniae verursacht atypische Pneumonien und kann die Bildung kalter Agglutinine ausloesen. Diese Eigenschaft ist ein klassischer Pruefstein in der Differenzialdiagnose.',
      'Which cause of atypical pneumonia is associated with cold agglutinins?',
      'Mycoplasma pneumoniae',
      '["Mycoplasma pneumoniae","Legionella pneumophila","Chlamydia psittaci","Klebsiella pneumoniae"]'::jsonb,
      'Mycoplasma pneumoniae causes atypical pneumonia and can trigger production of cold agglutinins. This feature is a classic clue in differential diagnosis.'
    ),
    (
      'biochemie-harnstoffzyklus-cps1',
      'Biochemie',
      'mittel',
      'Welches Enzym ist geschwindigkeitsbestimmend fuer den Harnstoffzyklus?',
      'Carbamoylphosphat-Synthetase I',
      '["Carbamoylphosphat-Synthetase I","Arginase","Ornithin-Transcarbamylase","Pyruvat-Carboxylase"]'::jsonb,
      'Die Carbamoylphosphat-Synthetase I katalysiert den ersten und geschwindigkeitsbestimmenden Schritt des Harnstoffzyklus in den Mitochondrien. Sie benoetigt N-Acetylglutamat als Aktivator.',
      'Which enzyme is rate limiting for the urea cycle?',
      'Carbamoyl phosphate synthetase I',
      '["Carbamoyl phosphate synthetase I","Arginase","Ornithine transcarbamylase","Pyruvate carboxylase"]'::jsonb,
      'Carbamoyl phosphate synthetase I catalyzes the first and rate-limiting step of the urea cycle in mitochondria. It requires N-acetylglutamate as an activator.'
    ),
    (
      'biochemie-elektronentransport-coenzym-q',
      'Biochemie',
      'mittel',
      'Welcher Elektronentraeger transportiert Elektronen von Komplex I und II zu Komplex III der Atmungskette?',
      'Coenzym Q',
      '["Coenzym Q","Cytochrom c","NADH","Succinat"]'::jsonb,
      'Coenzym Q nimmt Elektronen aus Komplex I und II auf und bringt sie zu Komplex III. Cytochrom c arbeitet erst zwischen Komplex III und IV.',
      'Which electron carrier transfers electrons from complexes I and II to complex III of the respiratory chain?',
      'Coenzyme Q',
      '["Coenzyme Q","Cytochrome c","NADH","Succinate"]'::jsonb,
      'Coenzyme Q accepts electrons from complexes I and II and carries them to complex III. Cytochrome c acts later between complexes III and IV.'
    ),
    (
      'immunologie-il5-eosinophile',
      'Immunologie',
      'mittel',
      'Welches Zytokin foerdert besonders Wachstum und Aktivierung von Eosinophilen?',
      'IL-5',
      '["IL-5","IL-2","IL-10","TNF-alpha"]'::jsonb,
      'IL-5 ist das Leitzytokin fuer Eosinophile. Es foerdert ihre Differenzierung, Aktivierung und ihr Ueberleben und spielt daher bei Parasitosen und allergischen Erkrankungen eine wichtige Rolle.',
      'Which cytokine especially promotes growth and activation of eosinophils?',
      'IL-5',
      '["IL-5","IL-2","IL-10","TNF-alpha"]'::jsonb,
      'IL-5 is the signature cytokine for eosinophils. It promotes their differentiation, activation, and survival and is therefore important in parasitic disease and allergy.'
    ),
    (
      'immunologie-goodpasture-typ2',
      'Immunologie',
      'mittel',
      'Welche Hypersensitivitaetsreaktion liegt dem Goodpasture-Syndrom zugrunde?',
      'Typ-II-Hypersensitivitaet',
      '["Typ-II-Hypersensitivitaet","Typ-I-Hypersensitivitaet","Typ-III-Hypersensitivitaet","Typ-IV-Hypersensitivitaet"]'::jsonb,
      'Beim Goodpasture-Syndrom richten sich Antikoerper direkt gegen Bestandteile der Basalmembran. Das entspricht einer antikoerpervermittelten Typ-II-Hypersensitivitaet.',
      'Which hypersensitivity reaction underlies Goodpasture syndrome?',
      'Type II hypersensitivity',
      '["Type II hypersensitivity","Type I hypersensitivity","Type III hypersensitivity","Type IV hypersensitivity"]'::jsonb,
      'In Goodpasture syndrome, antibodies directly target components of the basement membrane. This is an antibody-mediated type II hypersensitivity reaction.'
    ),
    (
      'genetik-turner-45x',
      'Genetik',
      'mittel',
      'Welcher Karyotyp ist typisch fuer das Turner-Syndrom?',
      '45,X',
      '["45,X","47,XX,+21","47,XXY","46,XY"]'::jsonb,
      'Das Turner-Syndrom ist klassisch mit einer Monosomie X assoziiert, also 45,X. Die fehlende zweite Geschlechtschromosomenkopie erklaert viele der typischen klinischen Befunde.',
      'Which karyotype is typical of Turner syndrome?',
      '45,X',
      '["45,X","47,XX,+21","47,XXY","46,XY"]'::jsonb,
      'Turner syndrome is classically associated with monosomy X, that is 45,X. The missing second sex chromosome copy explains many of the characteristic clinical findings.'
    ),
    (
      'genetik-huntington-cag',
      'Genetik',
      'mittel',
      'Welche Trinukleotidsequenz ist beim Morbus Huntington pathologisch expandiert?',
      'CAG',
      '["CAG","CGG","CTG","GAA"]'::jsonb,
      'Morbus Huntington beruht auf einer CAG-Repeat-Expansion im HTT-Gen. Die Zahl der Wiederholungen korreliert mit Antizipation und oft mit einem frueheren Krankheitsbeginn in nachfolgenden Generationen.',
      'Which trinucleotide sequence is pathologically expanded in Huntington disease?',
      'CAG',
      '["CAG","CGG","CTG","GAA"]'::jsonb,
      'Huntington disease is caused by a CAG repeat expansion in the HTT gene. The repeat number is linked to anticipation and often to earlier onset in subsequent generations.'
    ),
    (
      'radiologie-sah-nativ-ct',
      'Radiologie',
      'mittel',
      'Welche Bildgebung ist bei Verdacht auf akute Subarachnoidalblutung die erste Wahl?',
      'Nativ-CT des Kopfes',
      '["Nativ-CT des Kopfes","MRT der Hypophyse","Abdomen-Sonographie","Roentgen Thorax"]'::jsonb,
      'Bei akuter Subarachnoidalblutung ist das kraniale Nativ-CT die schnellste und wichtigste Erstuntersuchung. Frisches Blut ist hier typischerweise gut sichtbar.',
      'Which imaging study is first choice in suspected acute subarachnoid hemorrhage?',
      'Non-contrast head CT',
      '["Non-contrast head CT","Pituitary MRI","Abdominal ultrasound","Chest radiograph"]'::jsonb,
      'In acute subarachnoid hemorrhage, non-contrast head CT is the fastest and most important initial study. Fresh blood is typically well visualized on it.'
    ),
    (
      'radiologie-pe-ctpa',
      'Radiologie',
      'mittel',
      'Welche Bildgebung ist bei haemodynamisch stabiler Patientin oder stabilem Patienten mit Verdacht auf Lungenembolie meist die Standarduntersuchung?',
      'CT-Angiographie der Pulmonalarterien',
      '["CT-Angiographie der Pulmonalarterien","MRT des Thorax","Nativ-CT des Abdomens","Roentgen der Hand"]'::jsonb,
      'Bei stabiler Lungenembolieabklaerung ist die CT-Angiographie der Pulmonalarterien die Standardbildgebung. Sie zeigt intraluminale Fuellungsdefekte direkt in den Pulmonalarterien.',
      'Which imaging study is usually the standard test in a hemodynamically stable patient with suspected pulmonary embolism?',
      'CT pulmonary angiography',
      '["CT pulmonary angiography","Thoracic MRI","Non-contrast abdominal CT","Hand radiograph"]'::jsonb,
      'In stable pulmonary embolism workup, CT pulmonary angiography is the standard imaging test. It directly shows intraluminal filling defects in the pulmonary arteries.'
    ),
    (
      'chirurgie-spannungspneumothorax-entlastung',
      'Chirurgie',
      'mittel',
      'Was ist bei klinischem Verdacht auf Spannungspneumothorax die erste lebensrettende Massnahme?',
      'Sofortige Entlastungspunktion oder Nadeldekompression',
      '["Sofortige Entlastungspunktion oder Nadeldekompression","Abwarten auf das Roentgenbild","Nur Analgesie","Spirometrie"]'::jsonb,
      'Der Spannungspneumothorax ist eine akute Drucksituation und darf nicht erst bildgebend bestaetigt werden. Die sofortige Entlastungspunktion senkt den intrathorakalen Druck und stabilisiert Kreislauf und Atmung.',
      'What is the first life-saving step in clinical suspicion of tension pneumothorax?',
      'Immediate decompression with needle thoracostomy',
      '["Immediate decompression with needle thoracostomy","Wait for the chest radiograph","Analgesia only","Spirometry"]'::jsonb,
      'Tension pneumothorax is an acute pressure emergency and must not wait for imaging confirmation. Immediate decompression lowers intrathoracic pressure and stabilizes circulation and breathing.'
    ),
    (
      'chirurgie-cholezystolithiasis-cholezystektomie',
      'Chirurgie',
      'mittel',
      'Welche Operation ist bei symptomatischer Cholezystolithiasis die definitive Standardtherapie?',
      'Laparoskopische Cholezystektomie',
      '["Laparoskopische Cholezystektomie","Appendektomie","Hemikolektomie rechts","Nierenteilresektion"]'::jsonb,
      'Bei symptomatischen Gallensteinen ist die laparoskopische Cholezystektomie die definitive Therapie. Sie beseitigt die steintragende Gallenblase und senkt das Rezidivrisiko dauerhaft.',
      'Which operation is the definitive standard treatment for symptomatic cholelithiasis?',
      'Laparoscopic cholecystectomy',
      '["Laparoscopic cholecystectomy","Appendectomy","Right hemicolectomy","Partial nephrectomy"]'::jsonb,
      'For symptomatic gallstones, laparoscopic cholecystectomy is the definitive treatment. It removes the stone-bearing gallbladder and permanently reduces recurrence risk.'
    )
),
upsert_questions as (
  insert into public.questions (
    slug,
    category,
    difficulty,
    question,
    correct_answer,
    options,
    explanation
  )
  select
    slug,
    category,
    difficulty,
    question_de,
    correct_de,
    options_de,
    explanation_de
  from question_rows
  on conflict (slug) do update
    set category = excluded.category,
        difficulty = excluded.difficulty,
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
