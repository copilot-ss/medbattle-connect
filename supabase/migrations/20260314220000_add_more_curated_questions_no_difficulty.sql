-- Add another curated bilingual question pack after removing difficulty.

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
      'anatomie-nervus-laryngeus-recurrens',
      'Anatomie',
      'Welche Kehlkopfmuskeln werden primaer vom N. laryngeus recurrens innerviert?',
      'Fast alle inneren Kehlkopfmuskeln ausser dem M. cricothyroideus',
      '["Fast alle inneren Kehlkopfmuskeln ausser dem M. cricothyroideus","Nur der M. cricothyroideus","Nur die suprahyalen Muskeln","Die Schlundmuskulatur des Oesophagus"]'::jsonb,
      'Der N. laryngeus recurrens versorgt fast alle inneren Kehlkopfmuskeln motorisch. Die Ausnahme ist der M. cricothyroideus, der vom N. laryngeus superior innerviert wird.',
      'Which laryngeal muscles are primarily innervated by the recurrent laryngeal nerve?',
      'Almost all intrinsic laryngeal muscles except the cricothyroid muscle',
      '["Almost all intrinsic laryngeal muscles except the cricothyroid muscle","Only the cricothyroid muscle","Only the suprahyoid muscles","The pharyngeal muscles of the esophagus"]'::jsonb,
      'The recurrent laryngeal nerve provides motor supply to almost all intrinsic laryngeal muscles. The exception is the cricothyroid muscle, which is innervated by the superior laryngeal nerve.'
    ),
    (
      'anatomie-supraspinatus-abduktion',
      'Anatomie',
      'Welcher Muskel initiiert die ersten Grade der Armabduktion im Schultergelenk?',
      'M. supraspinatus',
      '["M. supraspinatus","M. deltoideus","M. infraspinatus","M. subscapularis"]'::jsonb,
      'Der M. supraspinatus startet die Armabduktion, bevor der M. deltoideus den groesseren Bewegungsanteil uebernimmt. Genau deshalb fuehrt eine Supraspinatuslaesion oft zum Problem beim Anheben des Arms aus der Nullstellung.',
      'Which muscle initiates the first degrees of arm abduction at the shoulder joint?',
      'Supraspinatus muscle',
      '["Supraspinatus muscle","Deltoid muscle","Infraspinatus muscle","Subscapularis muscle"]'::jsonb,
      'The supraspinatus initiates arm abduction before the deltoid takes over the larger share of movement. That is why supraspinatus injury often causes difficulty lifting the arm from the resting position.'
    ),
    (
      'anatomie-ductus-thoracicus-venenwinkel',
      'Anatomie',
      'In welchen Venenwinkel muendet der Ductus thoracicus typischerweise?',
      'Linker Venenwinkel',
      '["Linker Venenwinkel","Rechter Venenwinkel","V. cava superior","V. azygos"]'::jsonb,
      'Der Ductus thoracicus endet meist am linken Venenwinkel, also am Uebergang von V. jugularis interna sinistra und V. subclavia sinistra. Dadurch gelangt die Lymphe aus dem groessten Teil des Koerpers wieder in den venoesen Kreislauf.',
      'Into which venous angle does the thoracic duct typically drain?',
      'Left venous angle',
      '["Left venous angle","Right venous angle","Superior vena cava","Azygos vein"]'::jsonb,
      'The thoracic duct usually ends at the left venous angle, where the left internal jugular and left subclavian veins join. This is how lymph from most of the body returns to the venous circulation.'
    ),
    (
      'anatomie-hiatus-aorticus-t12',
      'Anatomie',
      'Auf welcher Hoehe durchtritt die Aorta typischerweise das Zwerchfell?',
      'Th12',
      '["Th12","Th8","Th10","L1"]'::jsonb,
      'Die Aorta zieht durch den Hiatus aorticus auf Hoehe Th12. Die bekannten Zwerchfelloeffnungen lauten damit vereinfacht: V. cava inferior auf Th8, Oesophagus auf Th10, Aorta auf Th12.',
      'At which vertebral level does the aorta typically pass through the diaphragm?',
      'T12',
      '["T12","T8","T10","L1"]'::jsonb,
      'The aorta passes through the aortic hiatus at T12. The classic diaphragm openings are therefore summarized as: inferior vena cava at T8, esophagus at T10, and aorta at T12.'
    ),
    (
      'anatomie-ligamentum-hepatoduodenale',
      'Anatomie',
      'Welche Struktur gehoert zum Inhalt des Ligamentum hepatoduodenale?',
      'V. portae',
      '["V. portae","V. hepatica","A. mesenterica superior","V. cava inferior"]'::jsonb,
      'Im Ligamentum hepatoduodenale verlaeuft die Portal-Trias aus V. portae, A. hepatica propria und Ductus choledochus. Die V. hepaticae muenden dagegen direkt in die V. cava inferior und gehoeren nicht dazu.',
      'Which structure is part of the hepatoduodenal ligament?',
      'Portal vein',
      '["Portal vein","Hepatic vein","Superior mesenteric artery","Inferior vena cava"]'::jsonb,
      'The hepatoduodenal ligament contains the portal triad: portal vein, proper hepatic artery, and common bile duct. The hepatic veins drain directly into the inferior vena cava and are not part of it.'
    ),
    (
      'anatomie-foramen-jugulare',
      'Anatomie',
      'Welcher Hirnnerv zieht nicht durch das Foramen jugulare?',
      'N. hypoglossus',
      '["N. hypoglossus","N. glossopharyngeus","N. vagus","N. accessorius"]'::jsonb,
      'Durch das Foramen jugulare ziehen die Hirnnerven IX, X und XI. Der N. hypoglossus verlaeuft stattdessen durch den Canalis nervi hypoglossi.',
      'Which cranial nerve does not pass through the jugular foramen?',
      'Hypoglossal nerve',
      '["Hypoglossal nerve","Glossopharyngeal nerve","Vagus nerve","Accessory nerve"]'::jsonb,
      'Cranial nerves IX, X, and XI pass through the jugular foramen. The hypoglossal nerve instead travels through the hypoglossal canal.'
    ),
    (
      'physiologie-macula-densa-nacl',
      'Physiologie',
      'Welche Groesse registriert die Macula densa fuer das tubuloglomerulaere Feedback besonders?',
      'NaCl-Konzentration im distalen Tubulus',
      '["NaCl-Konzentration im distalen Tubulus","Sauerstoffpartialdruck im Sammelrohr","Albuminkonzentration in Bowman-Kapsel","Kalziumspiegel im proximalen Tubulus"]'::jsonb,
      'Die Macula densa misst vor allem die Natriumchloridbeladung im distalen Tubulus. Ueber dieses Signal beeinflusst sie den Tonus der afferenten Arteriole und damit die glomerulaere Filtration.',
      'Which variable is especially sensed by the macula densa for tubuloglomerular feedback?',
      'NaCl concentration in the distal tubule',
      '["NaCl concentration in the distal tubule","Oxygen partial pressure in the collecting duct","Albumin concentration in Bowman space","Calcium level in the proximal tubule"]'::jsonb,
      'The macula densa mainly senses sodium chloride delivery in the distal tubule. Through this signal it influences afferent arteriolar tone and therefore glomerular filtration.'
    ),
    (
      'physiologie-frank-starling',
      'Physiologie',
      'Welche direkte Folge beschreibt den Frank-Starling-Mechanismus des Herzens am besten?',
      'Mehr enddiastolische Fuellung erhoeht das Schlagvolumen',
      '["Mehr enddiastolische Fuellung erhoeht das Schlagvolumen","Hoehere Herzfrequenz senkt das Schlagvolumen immer","Verminderte Nachlast reduziert die Kontraktilitaet direkt","Mehr Sympathikus senkt die Vorlast"]'::jsonb,
      'Beim Frank-Starling-Mechanismus fuehrt eine groessere enddiastolische Dehnung der Muskelfasern zu einer kraeftigeren Kontraktion. Genau deshalb steigt bei hoeherer Vorlast das Schlagvolumen.',
      'Which direct consequence best describes the Frank-Starling mechanism of the heart?',
      'Greater end-diastolic filling increases stroke volume',
      '["Greater end-diastolic filling increases stroke volume","Higher heart rate always lowers stroke volume","Reduced afterload directly lowers contractility","More sympathetic tone lowers preload"]'::jsonb,
      'In the Frank-Starling mechanism, greater end-diastolic stretch leads to a stronger contraction. That is why higher preload increases stroke volume.'
    ),
    (
      'physiologie-bohr-effekt',
      'Physiologie',
      'Welche Veraenderung verschiebt die Sauerstoffbindungskurve des Haemoglobins im Sinne des Bohr-Effekts nach rechts?',
      'Anstieg von CO2 und H+-Konzentration',
      '["Anstieg von CO2 und H+-Konzentration","Abfall der Temperatur","Abnahme von 2,3-BPG","Alkalose"]'::jsonb,
      'Mehr CO2 und mehr Protonen senken die Sauerstoffaffinitaet des Haemoglobins und verschieben die Kurve nach rechts. Das erleichtert die O2-Abgabe im stoffwechselaktiven Gewebe.',
      'Which change shifts the hemoglobin oxygen dissociation curve to the right through the Bohr effect?',
      'Increase in CO2 and hydrogen ion concentration',
      '["Increase in CO2 and hydrogen ion concentration","Decrease in temperature","Decrease in 2,3-BPG","Alkalosis"]'::jsonb,
      'More CO2 and more protons reduce hemoglobin oxygen affinity and shift the curve to the right. This facilitates oxygen unloading in metabolically active tissue.'
    ),
    (
      'physiologie-adh-aquaporin-2',
      'Physiologie',
      'Welche Wirkung hat ADH ueber den V2-Rezeptor in den Hauptzellen des Sammelrohrs?',
      'Einbau von Aquaporin-2 in die apikale Membran',
      '["Einbau von Aquaporin-2 in die apikale Membran","Hemmung der Harnstoffresorption","Blockade von ENaC","Verminderte Wasserpermeabilitaet"]'::jsonb,
      'ADH bindet an den V2-Rezeptor und fuehrt ueber cAMP zum Einbau von Aquaporin-2 in die apikale Membran. Dadurch steigt die Wasserpermeabilitaet des Sammelrohrs und der Urin wird konzentrierter.',
      'What effect does ADH exert through the V2 receptor in principal cells of the collecting duct?',
      'Insertion of aquaporin-2 into the apical membrane',
      '["Insertion of aquaporin-2 into the apical membrane","Inhibition of urea reabsorption","Blockade of ENaC","Reduced water permeability"]'::jsonb,
      'ADH binds the V2 receptor and via cAMP promotes insertion of aquaporin-2 into the apical membrane. This increases collecting duct water permeability and concentrates the urine.'
    ),
    (
      'physiologie-pth-phosphat',
      'Physiologie',
      'Welche Wirkung hat Parathormon auf die renale Phosphatrueckresorption im proximalen Tubulus?',
      'Sie nimmt ab',
      '["Sie nimmt ab","Sie nimmt zu","Sie bleibt unveraendert","Sie wird nur nachts gesteigert"]'::jsonb,
      'Parathormon hemmt im proximalen Tubulus Natrium-Phosphat-Kotransporter. Dadurch sinkt die Phosphatrueckresorption und mehr Phosphat wird ausgeschieden.',
      'What effect does parathyroid hormone have on renal phosphate reabsorption in the proximal tubule?',
      'It decreases',
      '["It decreases","It increases","It stays unchanged","It increases only at night"]'::jsonb,
      'Parathyroid hormone inhibits sodium-phosphate cotransporters in the proximal tubule. As a result, phosphate reabsorption falls and phosphate excretion rises.'
    ),
    (
      'physiologie-glut4-insulin',
      'Physiologie',
      'Welcher Transporter wird in Muskel- und Fettzellen durch Insulin vermehrt an die Zellmembran gebracht?',
      'GLUT4',
      '["GLUT4","GLUT1","SGLT1","ENaC"]'::jsonb,
      'Insulin foerdert in Muskel- und Fettzellen die Translokation von GLUT4 an die Zellmembran. Genau dadurch steigt die Glukoseaufnahme in diese insulinempfindlichen Gewebe.',
      'Which transporter is translocated to the cell membrane in muscle and fat cells by insulin?',
      'GLUT4',
      '["GLUT4","GLUT1","SGLT1","ENaC"]'::jsonb,
      'Insulin promotes translocation of GLUT4 to the cell membrane in muscle and fat cells. This is the mechanism that increases glucose uptake in insulin-sensitive tissues.'
    ),
    (
      'pathologie-myokardinfarkt-koagulationsnekrose',
      'Pathologie',
      'Welche Nekroseform ist fuer den akuten Myokardinfarkt typisch?',
      'Koagulationsnekrose',
      '["Koagulationsnekrose","Verkaseungsnekrose","Fettgewebsnekrose","Fibrinoide Nekrose"]'::jsonb,
      'Beim ischaemischen Infarkt solider Organe wie Herz oder Niere entsteht typischerweise eine Koagulationsnekrose. Das passt direkt zur Ischaemiepathologie des akuten Myokardinfarkts.',
      'Which type of necrosis is typical of an acute myocardial infarction?',
      'Coagulative necrosis',
      '["Coagulative necrosis","Caseous necrosis","Fat necrosis","Fibrinoid necrosis"]'::jsonb,
      'Ischemic infarction of solid organs such as the heart or kidney typically causes coagulative necrosis. This directly matches the pathology of acute myocardial infarction.'
    ),
    (
      'pathologie-rasch-progrediente-glomerulonephritis',
      'Pathologie',
      'Welcher histologische Befund ist fuer eine rasch progrediente Glomerulonephritis charakteristisch?',
      'Halbmondbildungen in Bowman-Kapseln',
      '["Halbmondbildungen in Bowman-Kapseln","Mesangiale Amyloidablagerungen","Ausschliesslich hyaline Arteriolosklerose","Papillennekrosen im Nierenbecken"]'::jsonb,
      'Bei der rasch progredienten Glomerulonephritis entstehen durch schwere glomerulaere Schaeden Halbmondbildungen aus proliferierenden Zellen und Fibrin in Bowman-Kapseln. Genau dieser Befund erklaert den schnellen Funktionsverlust.',
      'Which histologic finding is characteristic of rapidly progressive glomerulonephritis?',
      'Crescent formation in Bowman capsules',
      '["Crescent formation in Bowman capsules","Mesangial amyloid deposits","Exclusively hyaline arteriolosclerosis","Papillary necrosis in the renal pelvis"]'::jsonb,
      'In rapidly progressive glomerulonephritis, severe glomerular injury produces crescents composed of proliferating cells and fibrin in Bowman capsules. This finding explains the rapid loss of renal function.'
    ),
    (
      'pathologie-barrett-becherzellen',
      'Pathologie',
      'Welche metaplastische Veraenderung kennzeichnet den Barrett-Oesophagus?',
      'Intestinale Metaplasie mit Becherzellen',
      '["Intestinale Metaplasie mit Becherzellen","Plattenepithelhyperplasie ohne Zellwandel","Verkalkung der Submukosa","Dysplasie des Muskelgewebes"]'::jsonb,
      'Beim Barrett-Oesophagus wird das normale mehrschichtige Plattenepithel durch intestinal gepraegtes Zylinderepithel mit Becherzellen ersetzt. Diese Anpassung ist direkt mit chronischem Reflux verbunden und praekanzeroseverdachtig.',
      'Which metaplastic change characterizes Barrett esophagus?',
      'Intestinal metaplasia with goblet cells',
      '["Intestinal metaplasia with goblet cells","Squamous hyperplasia without lineage change","Submucosal calcification","Dysplasia of muscle tissue"]'::jsonb,
      'In Barrett esophagus, the normal stratified squamous epithelium is replaced by intestinal-type columnar epithelium with goblet cells. This adaptation is directly linked to chronic reflux and carries premalignant potential.'
    ),
    (
      'pathologie-papillaeres-schilddruesenkarzinom',
      'Pathologie',
      'Welcher Zellkernbefund ist fuer das papillaere Schilddruesenkarzinom klassisch?',
      'Orphan-Annie-eye-Kerne',
      '["Orphan-Annie-eye-Kerne","Auerstaebchen","Russell-Koerperchen","Negri-Koerperchen"]'::jsonb,
      'Das papillaere Schilddruesenkarzinom zeigt typische aufgehellte Kerne, die als Orphan-Annie-eye-Kerne beschrieben werden. Dieser Kernbefund verknuepft die Diagnose direkt mit diesem Tumortyp.',
      'Which nuclear finding is classic for papillary thyroid carcinoma?',
      'Orphan Annie eye nuclei',
      '["Orphan Annie eye nuclei","Auer rods","Russell bodies","Negri bodies"]'::jsonb,
      'Papillary thyroid carcinoma characteristically shows optically clear nuclei known as Orphan Annie eye nuclei. This nuclear appearance directly supports the diagnosis of this tumor type.'
    ),
    (
      'pathologie-alpha1-antitrypsin-emphysem',
      'Pathologie',
      'Welches Emphysem-Muster passt am ehesten zu einem Alpha-1-Antitrypsin-Mangel?',
      'Panazinaeres Emphysem der Unterlappen',
      '["Panazinaeres Emphysem der Unterlappen","Zentrolobulaeres Emphysem der Oberlappen","Paraseptales Emphysem nur apikal","Bullae ausschliesslich im Mittellappen"]'::jsonb,
      'Beim Alpha-1-Antitrypsin-Mangel fehlt der Schutz vor elastasebedingtem Gewebeabbau. Deshalb entsteht typischerweise ein panazinaeres Emphysem, besonders in den Unterlappen.',
      'Which emphysema pattern best fits alpha-1 antitrypsin deficiency?',
      'Panacinar emphysema of the lower lobes',
      '["Panacinar emphysema of the lower lobes","Centrilobular emphysema of the upper lobes","Paraseptal emphysema only at the apex","Bullae exclusively in the middle lobe"]'::jsonb,
      'In alpha-1 antitrypsin deficiency, protection against elastase-mediated tissue destruction is lost. Therefore the typical pattern is panacinar emphysema, especially in the lower lobes.'
    ),
    (
      'pathologie-verkaseungsnekrose-tuberkulose',
      'Pathologie',
      'Welche Erkrankung ist klassisch mit verkaesender Granulombildung assoziiert?',
      'Tuberkulose',
      '["Tuberkulose","Morbus Crohn","Colitis ulcerosa","SLE"]'::jsonb,
      'Verkaesende Granulome sind histologisch typisch fuer die Tuberkulose. Die Kombination aus Granulombildung und zentraler Kaesenekrose verknuepft den Befund direkt mit dieser Infektion.',
      'Which disease is classically associated with caseating granulomas?',
      'Tuberculosis',
      '["Tuberculosis","Crohn disease","Ulcerative colitis","Systemic lupus erythematosus"]'::jsonb,
      'Caseating granulomas are histologically typical of tuberculosis. The combination of granuloma formation and central caseous necrosis directly links the finding to this infection.'
    ),
    (
      'pharmakologie-warfarin-inr',
      'Pharmakologie',
      'Welcher Laborwert wird zur Therapiekontrolle unter Warfarin typischerweise verwendet?',
      'INR',
      '["INR","aPTT","Troponin","D-Dimer"]'::jsonb,
      'Warfarin beeinflusst die Vitamin-K-abhaengige Bildung mehrerer Gerinnungsfaktoren im extrinsischen System. Deshalb wird die Wirkung klinisch ueber die Prothrombinzeit bzw. den INR-Wert kontrolliert.',
      'Which laboratory value is typically used to monitor warfarin therapy?',
      'INR',
      '["INR","aPTT","Troponin","D-dimer"]'::jsonb,
      'Warfarin alters vitamin K-dependent clotting factor synthesis in the extrinsic pathway. Therefore its effect is monitored clinically with the prothrombin time expressed as the INR.'
    ),
    (
      'pharmakologie-heparin-protamin',
      'Pharmakologie',
      'Welches Antidot neutralisiert unfraktioniertes Heparin am direktesten?',
      'Protamin',
      '["Protamin","Vitamin K","Idarucizumab","Atropin"]'::jsonb,
      'Protamin bindet an Heparin und neutralisiert dessen antikoagulatorische Wirkung. Genau deshalb wird es bei relevanter Blutung unter unfraktioniertem Heparin als Gegenmittel eingesetzt.',
      'Which antidote most directly neutralizes unfractionated heparin?',
      'Protamine',
      '["Protamine","Vitamin K","Idarucizumab","Atropine"]'::jsonb,
      'Protamine binds heparin and neutralizes its anticoagulant effect. That is why it is used as the reversal agent for significant bleeding under unfractionated heparin.'
    ),
    (
      'pharmakologie-schleifendiuretika-nkcc2',
      'Pharmakologie',
      'Welchen Transporter hemmen Schleifendiuretika im aufsteigenden Teil der Henle-Schleife?',
      'NKCC2',
      '["NKCC2","ENaC","Na+/K+-ATPase","SGLT2"]'::jsonb,
      'Schleifendiuretika blockieren den Na-K-2Cl-Kotransporter NKCC2 im dicken aufsteigenden Ast. Dadurch sinkt die Natriumrueckresorption stark und die Diurese steigt deutlich an.',
      'Which transporter is inhibited by loop diuretics in the ascending limb of the loop of Henle?',
      'NKCC2',
      '["NKCC2","ENaC","Na+/K+-ATPase","SGLT2"]'::jsonb,
      'Loop diuretics block the Na-K-2Cl cotransporter NKCC2 in the thick ascending limb. This sharply reduces sodium reabsorption and markedly increases diuresis.'
    ),
    (
      'pharmakologie-makrolide-50s',
      'Pharmakologie',
      'An welche ribosomale Zielstruktur binden Makrolide primaer?',
      '50S-Untereinheit',
      '["50S-Untereinheit","30S-Untereinheit","DNA-Gyrase","Peptidoglykan"]'::jsonb,
      'Makrolide binden an die 50S-Untereinheit bakterieller Ribosomen und hemmen die Translokation. Genau diese Hemmung erklaert ihre Wirkung gegen viele atypische und grampositive Erreger.',
      'Which ribosomal target structure do macrolides primarily bind?',
      '50S subunit',
      '["50S subunit","30S subunit","DNA gyrase","Peptidoglycan"]'::jsonb,
      'Macrolides bind the 50S bacterial ribosomal subunit and inhibit translocation. This mechanism explains their activity against many atypical and Gram-positive organisms.'
    ),
    (
      'pharmakologie-metformin-laktatazidose',
      'Pharmakologie',
      'Welche gefuerchtete Komplikation erklaert die Vorsicht mit Metformin bei schwerer Niereninsuffizienz?',
      'Laktatazidose',
      '["Laktatazidose","Agranuzytose","Rhabdomyolyse","Aplastische Anaemie"]'::jsonb,
      'Metformin kann sich bei schwer eingeschraenkter Nierenfunktion anreichern und das Risiko einer Laktatazidose erhoehen. Genau deshalb wird bei relevanter Niereninsuffizienz besondere Vorsicht oder ein Absetzen notwendig.',
      'Which feared complication explains the caution with metformin in severe renal impairment?',
      'Lactic acidosis',
      '["Lactic acidosis","Agranulocytosis","Rhabdomyolysis","Aplastic anemia"]'::jsonb,
      'Metformin can accumulate in severe renal impairment and raise the risk of lactic acidosis. That is why major renal dysfunction requires particular caution or discontinuation.'
    ),
    (
      'pharmakologie-thiazide-kalzium',
      'Pharmakologie',
      'Wie veraendert ein Thiazid die renale Kalziumausscheidung typischerweise?',
      'Sie nimmt ab',
      '["Sie nimmt ab","Sie nimmt deutlich zu","Sie bleibt immer unveraendert","Sie steigt nur bei Azidose"]'::jsonb,
      'Thiazide foerdern die Kalziumrueckresorption im distalen Tubulus. Deshalb sinkt die renale Kalziumausscheidung, was auch ihre Rolle bei kalziumhaltigen Nierensteinen erklaert.',
      'How does a thiazide typically change renal calcium excretion?',
      'It decreases',
      '["It decreases","It increases markedly","It always stays unchanged","It rises only in acidosis"]'::jsonb,
      'Thiazides enhance calcium reabsorption in the distal tubule. Therefore renal calcium excretion falls, which also explains their role in calcium stone prevention.'
    ),
    (
      'pharmakologie-atropin-muskarin',
      'Pharmakologie',
      'Welche Rezeptorfamilie wird durch Atropin kompetitiv blockiert?',
      'Muskarinische Acetylcholinrezeptoren',
      '["Muskarinische Acetylcholinrezeptoren","Nikotinische Acetylcholinrezeptoren","Beta-2-Rezeptoren","Dopamin-D2-Rezeptoren"]'::jsonb,
      'Atropin wirkt als kompetitiver Antagonist an muskarinischen Acetylcholinrezeptoren. Genau dadurch steigen Herzfrequenz und Pupillenweite, waehrend parasympathische Wirkungen gehemmt werden.',
      'Which receptor family is competitively blocked by atropine?',
      'Muscarinic acetylcholine receptors',
      '["Muscarinic acetylcholine receptors","Nicotinic acetylcholine receptors","Beta-2 receptors","Dopamine D2 receptors"]'::jsonb,
      'Atropine acts as a competitive antagonist at muscarinic acetylcholine receptors. That is why heart rate and pupil size increase while parasympathetic effects are suppressed.'
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
