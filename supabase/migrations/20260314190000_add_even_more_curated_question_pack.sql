-- Add another curated bilingual question pack with answer-linked explanations.

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
      'anatomie-pterion-meningea-media',
      'Anatomie',
      'mittel',
      'Welche Arterie liegt im Bereich des Pterions besonders verletzungsgefaehrdet?',
      'A. meningea media',
      '["A. meningea media","A. cerebri anterior","A. ophthalmica","A. vertebralis"]'::jsonb,
      'Im Bereich des Pterions verlaeuft die A. meningea media dicht an der Innenseite des Schaedels. Eine Fraktur dort kann die Arterie verletzen und ein epidurales Haematom ausloesen.',
      'Which artery is especially vulnerable to injury in the region of the pterion?',
      'Middle meningeal artery',
      '["Middle meningeal artery","Anterior cerebral artery","Ophthalmic artery","Vertebral artery"]'::jsonb,
      'The middle meningeal artery runs close to the inner skull at the pterion. A fracture there can tear the artery and cause an epidural hematoma.'
    ),
    (
      'anatomie-carpaltunnel-nerv',
      'Anatomie',
      'mittel',
      'Welcher Nerv verlaeuft durch den Carpaltunnel?',
      'N. medianus',
      '["N. medianus","N. ulnaris","N. radialis","N. axillaris"]'::jsonb,
      'Der N. medianus zieht gemeinsam mit den Beugesehnen durch den Carpaltunnel. Genau deshalb fuehrt ein Carpaltunnelsyndrom typischerweise zu medianusbetonten Sensibilitaetsstoerungen und Thenarschwaeche.',
      'Which nerve passes through the carpal tunnel?',
      'Median nerve',
      '["Median nerve","Ulnar nerve","Radial nerve","Axillary nerve"]'::jsonb,
      'The median nerve travels with the flexor tendons through the carpal tunnel. That is why carpal tunnel syndrome typically causes median-nerve sensory symptoms and thenar weakness.'
    ),
    (
      'physiologie-aldosteron-enaC',
      'Physiologie',
      'mittel',
      'Welchen Kanal reguliert Aldosteron besonders in den Hauptzellen des Sammelrohrs?',
      'ENaC',
      '["ENaC","NKCC2","CFTR","GLUT4"]'::jsonb,
      'Aldosteron steigert in den Hauptzellen die Expression und Aktivitaet des epithelialen Natriumkanals ENaC. Dadurch werden Natriumrueckresorption und Kaliumsekretion verstaerkt.',
      'Which channel is especially regulated by aldosterone in principal cells of the collecting duct?',
      'ENaC',
      '["ENaC","NKCC2","CFTR","GLUT4"]'::jsonb,
      'Aldosterone increases expression and activity of the epithelial sodium channel ENaC in principal cells. This enhances sodium reabsorption and potassium secretion.'
    ),
    (
      'physiologie-fetales-haemoglobin-links',
      'Physiologie',
      'mittel',
      'Welcher Faktor verschiebt die Sauerstoffbindungskurve des fetalen Haemoglobins im Vergleich zu adultem Haemoglobin nach links?',
      'Geringere Bindung an 2,3-BPG',
      '["Geringere Bindung an 2,3-BPG","Hoehere CO2-Bindung","Staerkere Chloridbindung","Verminderte H-Bindung an Globinketten"]'::jsonb,
      'Fetales Haemoglobin bindet 2,3-BPG schlechter als adultes Haemoglobin. Dadurch hat es eine hoehere Sauerstoffaffinitaet und kann Sauerstoff aus dem muetterlichen Blut leichter aufnehmen.',
      'Which factor shifts the oxygen dissociation curve of fetal hemoglobin to the left compared with adult hemoglobin?',
      'Reduced binding to 2,3-BPG',
      '["Reduced binding to 2,3-BPG","Higher CO2 binding","Stronger chloride binding","Reduced hydrogen binding to globin chains"]'::jsonb,
      'Fetal hemoglobin binds 2,3-BPG less avidly than adult hemoglobin. As a result, it has higher oxygen affinity and can extract oxygen more effectively from maternal blood.'
    ),
    (
      'pathologie-crohn-transmural',
      'Pathologie',
      'mittel',
      'Welcher histopathologische Befund passt eher zu Morbus Crohn als zu Colitis ulcerosa?',
      'Transmurale Entzuendung',
      '["Transmurale Entzuendung","Kontinuierliche Mukosalaesion nur im Rektum","Ausschliesslich oberflaechliche Mukositis","Pseudopolypen ohne Wandbeteiligung"]'::jsonb,
      'Morbus Crohn betrifft typischerweise die gesamte Darmwand und fuehrt daher zu transmuraler Entzuendung. Genau diese tiefe Wandbeteiligung erklaert Komplikationen wie Fisteln und Strikturen.',
      'Which histopathologic finding fits Crohn disease rather than ulcerative colitis?',
      'Transmural inflammation',
      '["Transmural inflammation","Continuous mucosal disease limited to the rectum","Exclusively superficial mucositis","Pseudopolyps without wall involvement"]'::jsonb,
      'Crohn disease typically involves the full thickness of the bowel wall and therefore causes transmural inflammation. This deep wall involvement explains complications such as fistulas and strictures.'
    ),
    (
      'pathologie-aschoff-koerper',
      'Pathologie',
      'mittel',
      'Aschoff-Koerperchen sind klassischerweise mit welcher Erkrankung assoziiert?',
      'Akutes rheumatisches Fieber',
      '["Akutes rheumatisches Fieber","Amyloidose","Sarkoidose","Takayasu-Arteriitis"]'::jsonb,
      'Aschoff-Koerperchen sind granulomaehnliche Entzuendungsherde im Herzen bei akutem rheumatischem Fieber. Ihr Nachweis verknuepft die histologische Veraenderung direkt mit dieser poststreptokokkenbedingten Erkrankung.',
      'Aschoff bodies are classically associated with which disease?',
      'Acute rheumatic fever',
      '["Acute rheumatic fever","Amyloidosis","Sarcoidosis","Takayasu arteritis"]'::jsonb,
      'Aschoff bodies are granuloma-like inflammatory lesions in the heart seen in acute rheumatic fever. Their presence directly links the histologic finding to this post-streptococcal disease.'
    ),
    (
      'pharmakologie-ace-hemmer-bradykinin',
      'Pharmakologie',
      'mittel',
      'Welche Substanzvermehrung erklaert den trockenen Husten unter ACE-Hemmern am besten?',
      'Bradykinin',
      '["Bradykinin","Aldosteron","Insulin","Histamin"]'::jsonb,
      'ACE baut normalerweise Bradykinin ab. Wird ACE gehemmt, steigt Bradykinin an und kann trockenen Husten sowie Angiooedeme beguenstigen.',
      'Which increased substance best explains the dry cough caused by ACE inhibitors?',
      'Bradykinin',
      '["Bradykinin","Aldosterone","Insulin","Histamine"]'::jsonb,
      'ACE normally degrades bradykinin. When ACE is inhibited, bradykinin rises and can promote dry cough and angioedema.'
    ),
    (
      'pharmakologie-aminoglykoside-30s',
      'Pharmakologie',
      'mittel',
      'An welche bakterielle Zielstruktur binden Aminoglykoside primaer?',
      '30S-Untereinheit des Ribosoms',
      '["30S-Untereinheit des Ribosoms","50S-Untereinheit des Ribosoms","DNA-Gyrase","Dihydrofolatreduktase"]'::jsonb,
      'Aminoglykoside binden an die 30S-Untereinheit bakterieller Ribosomen und stoeren die Proteinsynthese. Genau diese Bindung erklaert ihre bakterizide Wirkung gegen viele aerobe gramnegative Erreger.',
      'Which bacterial target structure do aminoglycosides primarily bind?',
      '30S ribosomal subunit',
      '["30S ribosomal subunit","50S ribosomal subunit","DNA gyrase","Dihydrofolate reductase"]'::jsonb,
      'Aminoglycosides bind the 30S bacterial ribosomal subunit and disrupt protein synthesis. This interaction explains their bactericidal effect against many aerobic Gram-negative pathogens.'
    ),
    (
      'mikrobiologie-pseudomonas-oxidase',
      'Mikrobiologie',
      'mittel',
      'Welcher Erreger ist klassischerweise oxidasepositiv und bildet haeufig blaugruene Pigmente?',
      'Pseudomonas aeruginosa',
      '["Pseudomonas aeruginosa","Escherichia coli","Klebsiella pneumoniae","Shigella sonnei"]'::jsonb,
      'Pseudomonas aeruginosa ist oxidasepositiv und kann Pigmente wie Pyocyanin bilden, die blaugruene Faerbung verursachen. Diese Kombination ist ein klassischer Laborhinweis auf den Erreger.',
      'Which pathogen is classically oxidase positive and often produces blue-green pigments?',
      'Pseudomonas aeruginosa',
      '["Pseudomonas aeruginosa","Escherichia coli","Klebsiella pneumoniae","Shigella sonnei"]'::jsonb,
      'Pseudomonas aeruginosa is oxidase positive and can produce pigments such as pyocyanin, causing blue-green coloration. This combination is a classic laboratory clue to the organism.'
    ),
    (
      'mikrobiologie-strep-gallolyticus-kolon',
      'Mikrobiologie',
      'mittel',
      'Mit welchem malignen Krankheitsbild ist Streptococcus gallolyticus-Bakteriaemie besonders assoziiert?',
      'Kolonkarzinom',
      '["Kolonkarzinom","Nierenzellkarzinom","Schilddruesenkarzinom","Hepatozellulaeres Karzinom"]'::jsonb,
      'Streptococcus gallolyticus, frueher S. bovis, ist klassisch mit Kolonneoplasien assoziiert. Deshalb sollte bei entsprechender Bakteriaemie oder Endokarditis gezielt nach einem Kolonkarzinom gesucht werden.',
      'Streptococcus gallolyticus bacteremia is especially associated with which malignancy?',
      'Colorectal carcinoma',
      '["Colorectal carcinoma","Renal cell carcinoma","Thyroid carcinoma","Hepatocellular carcinoma"]'::jsonb,
      'Streptococcus gallolyticus, formerly S. bovis, is classically associated with colonic neoplasia. Therefore, bacteremia or endocarditis with this organism should prompt evaluation for colorectal carcinoma.'
    ),
    (
      'biochemie-pdh-thiamin',
      'Biochemie',
      'mittel',
      'Welcher Vitaminmangel beeintraechtigt den Pyruvatdehydrogenase-Komplex besonders?',
      'Vitamin-B1-Mangel',
      '["Vitamin-B1-Mangel","Vitamin-B12-Mangel","Vitamin-C-Mangel","Vitamin-D-Mangel"]'::jsonb,
      'Der Pyruvatdehydrogenase-Komplex benoetigt Thiaminpyrophosphat als Kofaktor. Daher stoert ein Vitamin-B1-Mangel diesen Komplex und foerdert Laktatanstieg sowie Energiemangel.',
      'Deficiency of which vitamin particularly impairs the pyruvate dehydrogenase complex?',
      'Vitamin B1 deficiency',
      '["Vitamin B1 deficiency","Vitamin B12 deficiency","Vitamin C deficiency","Vitamin D deficiency"]'::jsonb,
      'The pyruvate dehydrogenase complex requires thiamine pyrophosphate as a cofactor. Therefore, vitamin B1 deficiency impairs this complex and promotes lactate accumulation and energy failure.'
    ),
    (
      'biochemie-g6pd-nadph',
      'Biochemie',
      'mittel',
      'Welches Molekuel wird in der Pentosephosphatweg-Reaktion der G6PD direkt gebildet?',
      'NADPH',
      '["NADPH","FADH2","ATP","Acetyl-CoA"]'::jsonb,
      'Die Glukose-6-Phosphat-Dehydrogenase erzeugt im Pentosephosphatweg NADPH. Dieses Reduktionsaequivalent ist entscheidend fuer antioxidativen Schutz, besonders in Erythrozyten.',
      'Which molecule is directly generated in the pentose phosphate pathway reaction catalyzed by G6PD?',
      'NADPH',
      '["NADPH","FADH2","ATP","Acetyl-CoA"]'::jsonb,
      'Glucose-6-phosphate dehydrogenase generates NADPH in the pentose phosphate pathway. This reducing equivalent is essential for antioxidant defense, especially in erythrocytes.'
    ),
    (
      'immunologie-c5a-chemotaxis',
      'Immunologie',
      'mittel',
      'Welches Komplementfragment wirkt besonders stark chemotaktisch auf neutrophile Granulozyten?',
      'C5a',
      '["C5a","C3b","C1q","MAC"]'::jsonb,
      'C5a ist ein potentes chemotaktisches und proinflammatorisches Komplementfragment. Gerade diese Eigenschaft lenkt neutrophile Granulozyten an den Ort der Entzuendung.',
      'Which complement fragment is especially chemotactic for neutrophils?',
      'C5a',
      '["C5a","C3b","C1q","MAC"]'::jsonb,
      'C5a is a potent chemotactic and proinflammatory complement fragment. This property directs neutrophils to sites of inflammation.'
    ),
    (
      'immunologie-hiv-cd4',
      'Immunologie',
      'mittel',
      'Welches Oberflaechenmolekuel dient HIV als primaerer Rezeptor auf T-Helferzellen?',
      'CD4',
      '["CD4","CD8","CD16","CD20"]'::jsonb,
      'HIV bindet zunaechst an CD4 auf T-Helferzellen und nutzt anschliessend Korezeptoren wie CCR5 oder CXCR4 fuer den Eintritt. CD4 ist daher der primaere Oberflaechenrezeptor.',
      'Which surface molecule serves as the primary receptor for HIV on helper T cells?',
      'CD4',
      '["CD4","CD8","CD16","CD20"]'::jsonb,
      'HIV first binds CD4 on helper T cells and then uses co-receptors such as CCR5 or CXCR4 for entry. CD4 is therefore the primary surface receptor.'
    ),
    (
      'genetik-marfan-fbn1',
      'Genetik',
      'mittel',
      'Eine Mutation welches Gens ist typisch fuer das Marfan-Syndrom?',
      'FBN1',
      '["FBN1","COL1A1","DMD","CFTR"]'::jsonb,
      'Das Marfan-Syndrom beruht typischerweise auf Mutationen im FBN1-Gen, das fuer Fibrillin-1 kodiert. Dadurch entstehen die typischen Bindegewebsbefunde mit Aorten- und Skelettbeteiligung.',
      'Mutation of which gene is typical of Marfan syndrome?',
      'FBN1',
      '["FBN1","COL1A1","DMD","CFTR"]'::jsonb,
      'Marfan syndrome is typically caused by mutations in the FBN1 gene, which encodes fibrillin-1. This leads to the characteristic connective tissue findings with aortic and skeletal involvement.'
    ),
    (
      'genetik-robertson-down-14-21',
      'Genetik',
      'mittel',
      'Welche Chromosomenkonstellation ist klassisch fuer ein Down-Syndrom durch Robertson-Translokation?',
      'Translokation zwischen Chromosom 14 und 21',
      '["Translokation zwischen Chromosom 14 und 21","Monosomie X","Trisomie 13","Deletion auf Chromosom 5p"]'::jsonb,
      'Ein familiaeres Down-Syndrom kann durch eine Robertson-Translokation mit Beteiligung von Chromosom 21 entstehen, besonders rob(14;21). Genau diese Konstellation fuehrt zu zusaezlichem 21q-Material.',
      'Which chromosome arrangement is classic for Down syndrome due to Robertsonian translocation?',
      'Translocation between chromosomes 14 and 21',
      '["Translocation between chromosomes 14 and 21","Monosomy X","Trisomy 13","Deletion on chromosome 5p"]'::jsonb,
      'Familial Down syndrome can arise from a Robertsonian translocation involving chromosome 21, especially rob(14;21). This arrangement produces extra 21q genetic material.'
    ),
    (
      'radiologie-fast-freie-fluessigkeit',
      'Radiologie',
      'mittel',
      'Worauf zielt die FAST-Sonographie im Schockraum primaer ab?',
      'Nachweis freier Fluessigkeit',
      '["Nachweis freier Fluessigkeit","Messung der Knochendichte","Bestimmung des Herzzeitvolumens per MRT","Sicherung einer Hirnstammblutung"]'::jsonb,
      'Die FAST-Untersuchung sucht schnell nach freier Fluessigkeit in Abdomen, Perikard und gegebenenfalls Thorax. Gerade dieser rasche Nachweis kann innere Blutungen frueh erkennbar machen.',
      'What is the primary goal of FAST ultrasound in the trauma bay?',
      'Detection of free fluid',
      '["Detection of free fluid","Measurement of bone density","Assessment of cardiac output by MRI","Confirmation of brainstem hemorrhage"]'::jsonb,
      'FAST is designed to rapidly detect free fluid in the abdomen, pericardium, and sometimes thorax. This quick finding can reveal internal bleeding early.'
    ),
    (
      'radiologie-subdural-crescent',
      'Radiologie',
      'mittel',
      'Welche Form zeigt ein subdurales Haematom im CT typischerweise?',
      'Sichelfoermig',
      '["Sichelfoermig","Linsenfoermig","Ringfoermig","Sternfoermig"]'::jsonb,
      'Ein subdurales Haematom breitet sich entlang der Hirnoberflaeche aus und erscheint deshalb meist sichelfoermig. Im Gegensatz dazu ist das epidurale Haematom typischerweise linsenfoermig begrenzt.',
      'Which shape does a subdural hematoma typically have on CT?',
      'Crescent-shaped',
      '["Crescent-shaped","Lens-shaped","Ring-shaped","Star-shaped"]'::jsonb,
      'A subdural hematoma spreads along the brain surface and therefore usually appears crescent-shaped. By contrast, an epidural hematoma is typically lens-shaped.'
    ),
    (
      'chirurgie-courvoisier-zeichen',
      'Chirurgie',
      'mittel',
      'Wofuer spricht eine schmerzlose Ikterus-Symptomatik mit palpabel vergroesserter Gallenblase nach Courvoisier am ehesten?',
      'Maligne distale Gallenwegsobstruktion',
      '["Maligne distale Gallenwegsobstruktion","Akute Virushepatitis","Nierenkolik","Duodenalulkus ohne Stauung"]'::jsonb,
      'Das Courvoisier-Zeichen weist auf eine Abflussbehinderung der extrahepatischen Gallenwege hin, haeufig durch ein Pankreaskopfkarzinom oder distales Cholangiokarzinom. Die schmerzlos vergroesserte Gallenblase ist der entscheidende Hinweis.',
      'What does painless jaundice with a palpable enlarged gallbladder according to Courvoisier most strongly suggest?',
      'Malignant distal biliary obstruction',
      '["Malignant distal biliary obstruction","Acute viral hepatitis","Renal colic","Duodenal ulcer without obstruction"]'::jsonb,
      'Courvoisier sign points to obstruction of the extrahepatic biliary tract, often from pancreatic head cancer or distal cholangiocarcinoma. The key clue is the painless enlarged gallbladder.'
    ),
    (
      'chirurgie-akute-gliedmassenischaemie-heparin',
      'Chirurgie',
      'mittel',
      'Welche sofortige medikamentoese Massnahme gehoert typischerweise zur Initialtherapie einer akuten arteriellen Gliedmassenischaemie?',
      'Systemische Heparinisierung',
      '["Systemische Heparinisierung","Hochdosis Insulin","Langsame Eiseninfusion","Ausschliesslich orale Analgesie"]'::jsonb,
      'Bei akuter arterieller Gliedmassenischaemie wird frueh systemisch heparinisiert, um eine weitere Thrombuspropagation zu verhindern. Diese Massnahme verknuepft die Notfallsituation direkt mit der Initialtherapie.',
      'Which immediate medical step typically belongs to the initial treatment of acute arterial limb ischemia?',
      'Systemic heparinization',
      '["Systemic heparinization","High-dose insulin","Slow iron infusion","Oral analgesia only"]'::jsonb,
      'In acute arterial limb ischemia, systemic heparin is started early to prevent further thrombus propagation. This step directly links the emergency diagnosis to its immediate treatment.'
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
