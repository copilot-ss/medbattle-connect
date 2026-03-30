-- Expand the currently smallest online category pools with another precise bilingual pack.

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
      'online-erklaert-kompakt-chirurgie-01',
      'Chirurgie',
      'Welche Nervenlaesion erklaert eine postoperative Heiserkeit nach Thyreoidektomie am ehesten?',
      'Laesion des N. laryngeus recurrens',
      '["Laesion des N. laryngeus recurrens","Laesion des N. hypoglossus","Laesion des N. phrenicus","Laesion des N. axillaris"]'::jsonb,
      'Der N. laryngeus recurrens innerviert fast alle inneren Kehlkopfmuskeln. Eine Verletzung bei der Schilddruesenchirurgie fuehrt daher klassisch zu Heiserkeit.',
      'Which nerve injury most likely explains postoperative hoarseness after thyroidectomy?',
      'Recurrent laryngeal nerve injury',
      '["Recurrent laryngeal nerve injury","Hypoglossal nerve injury","Phrenic nerve injury","Axillary nerve injury"]'::jsonb,
      'The recurrent laryngeal nerve innervates nearly all intrinsic laryngeal muscles. Injury during thyroid surgery therefore classically causes hoarseness.'
    ),
    (
      'online-erklaert-kompakt-chirurgie-02',
      'Chirurgie',
      'Welche Klassifikation wird standardmaessig fuer offene Frakturen verwendet?',
      'Gustilo-Anderson-Klassifikation',
      '["Gustilo-Anderson-Klassifikation","Mason-Klassifikation","Child-Pugh-Klassifikation","Bismuth-Klassifikation"]'::jsonb,
      'Die Gustilo-Anderson-Klassifikation ordnet offene Frakturen nach Weichteilschaden und Kontamination ein. Sie ist wichtig fuer Debridement, Antibiotika und Stabilisierung.',
      'Which classification is routinely used for open fractures?',
      'Gustilo-Anderson classification',
      '["Gustilo-Anderson classification","Mason classification","Child-Pugh classification","Bismuth classification"]'::jsonb,
      'The Gustilo-Anderson classification grades open fractures by soft tissue injury and contamination. It helps guide debridement, antibiotics, and stabilization.'
    ),
    (
      'online-erklaert-kompakt-chirurgie-03',
      'Chirurgie',
      'Welcher Schritt ist bei haemodynamisch instabilem stumpfem Bauchtrauma und positivem FAST am ehesten indiziert?',
      'Sofortige Notfalllaparotomie',
      '["Sofortige Notfalllaparotomie","Ambulante Koloskopie","Abwartendes Beobachten ohne Monitoring","Elektive Hernienoperation"]'::jsonb,
      'Bei instabilem Trauma und positiver FAST steht die Blutungskontrolle im Vordergrund. Deshalb ist die sofortige operative Versorgung indiziert.',
      'Which step is most indicated in a hemodynamically unstable patient with blunt abdominal trauma and a positive FAST exam?',
      'Immediate emergency laparotomy',
      '["Immediate emergency laparotomy","Outpatient colonoscopy","Observation without monitoring","Elective hernia repair"]'::jsonb,
      'In unstable trauma with a positive FAST, hemorrhage control is the priority. Immediate operative management is therefore indicated.'
    ),
    (
      'online-erklaert-kompakt-chirurgie-04',
      'Chirurgie',
      'Was ist die definitive Standardtherapie bei rezidivierender symptomatischer Cholezystolithiasis?',
      'Laparoskopische Cholezystektomie',
      '["Laparoskopische Cholezystektomie","Alleinige Protonenpumpenhemmer-Therapie","Chronische Heparingabe","Schilddruesenresektion"]'::jsonb,
      'Bei wiederkehrend symptomatischen Gallenblasensteinen beseitigt nur die Cholezystektomie die steintragende Gallenblase und damit die Ursache der Koliken.',
      'What is the definitive standard treatment for recurrent symptomatic cholelithiasis?',
      'Laparoscopic cholecystectomy',
      '["Laparoscopic cholecystectomy","Proton pump inhibitor therapy alone","Chronic heparin therapy","Thyroid resection"]'::jsonb,
      'For recurrent symptomatic gallstones, only cholecystectomy removes the stone-bearing gallbladder and therefore the cause of repeated biliary colic.'
    ),
    (
      'online-erklaert-kompakt-chirurgie-05',
      'Chirurgie',
      'Welcher Messwert stuetzt bei Kompartmentsyndrom besonders die Indikation zur Fasziotomie?',
      'Delta-Druck unter 30 mmHg',
      '["Delta-Druck unter 30 mmHg","Zentralvenendruck ueber 20 mmHg","HbA1c unter 6 Prozent","FEV1 ueber 80 Prozent"]'::jsonb,
      'Der Delta-Druck ist die Differenz aus diastolischem Blutdruck und Kompartmentdruck. Unter 30 mmHg ist die Gewebeperfusion kritisch bedroht.',
      'Which measurement particularly supports the indication for fasciotomy in compartment syndrome?',
      'Delta pressure below 30 mmHg',
      '["Delta pressure below 30 mmHg","Central venous pressure above 20 mmHg","HbA1c below 6 percent","FEV1 above 80 percent"]'::jsonb,
      'Delta pressure is the difference between diastolic blood pressure and compartment pressure. Below 30 mmHg, tissue perfusion is critically threatened.'
    ),
    (
      'online-erklaert-kompakt-genetik-01',
      'Genetik',
      'Welche Trinukleotid-Expansion ist fuer die Huntington-Krankheit klassisch?',
      'CAG-Expansion',
      '["CAG-Expansion","CGG-Expansion","CTG-Expansion","GAA-Expansion"]'::jsonb,
      'Die Huntington-Krankheit beruht auf einer CAG-Repeat-Expansion im HTT-Gen. Dadurch entsteht eine toxische Polyglutaminsequenz.',
      'Which trinucleotide expansion is classically associated with Huntington disease?',
      'CAG expansion',
      '["CAG expansion","CGG expansion","CTG expansion","GAA expansion"]'::jsonb,
      'Huntington disease is caused by a CAG repeat expansion in the HTT gene. This creates a toxic polyglutamine tract.'
    ),
    (
      'online-erklaert-kompakt-genetik-02',
      'Genetik',
      'Welche Repeat-Expansion findet sich typischerweise beim Fragilen-X-Syndrom?',
      'CGG-Expansion',
      '["CGG-Expansion","CAG-Expansion","GAA-Expansion","CTG-Expansion"]'::jsonb,
      'Beim Fragilen-X-Syndrom liegt eine CGG-Expansion im FMR1-Gen vor. Grosse Expansionen fuehren meist zu Methylierung und Gen-Silencing.',
      'Which repeat expansion is typical of fragile X syndrome?',
      'CGG expansion',
      '["CGG expansion","CAG expansion","GAA expansion","CTG expansion"]'::jsonb,
      'Fragile X syndrome results from a CGG expansion in the FMR1 gene. Large expansions usually trigger methylation and gene silencing.'
    ),
    (
      'online-erklaert-kompakt-genetik-03',
      'Genetik',
      'Welches Gen ist beim Marfan-Syndrom klassisch mutiert?',
      'FBN1',
      '["FBN1","CFTR","RB1","HFE"]'::jsonb,
      'Das Marfan-Syndrom wird typischerweise durch Mutationen in FBN1 verursacht. Fibrillin-1 ist ein zentraler Baustein elastischer Mikrofasern.',
      'Which gene is classically mutated in Marfan syndrome?',
      'FBN1',
      '["FBN1","CFTR","RB1","HFE"]'::jsonb,
      'Marfan syndrome is classically caused by mutations in FBN1. Fibrillin-1 is a key structural component of elastic microfibrils.'
    ),
    (
      'online-erklaert-kompakt-genetik-04',
      'Genetik',
      'Welcher elterliche Chromosomenverlust im Bereich 15q11-q13 verursacht klassisch das Prader-Willi-Syndrom?',
      'Verlust der vaeterlichen Kopie',
      '["Verlust der vaeterlichen Kopie","Verlust der muetterlichen Kopie","Verdopplung von Chromosom 21","Triploidie"]'::jsonb,
      'Das Prader-Willi-Syndrom entsteht klassisch durch Verlust oder Inaktivierung der vaeterlichen Region 15q11-q13. Der Verlust der muetterlichen Region fuehrt dagegen zum Angelman-Syndrom.',
      'Which parental chromosome loss in the 15q11-q13 region classically causes Prader-Willi syndrome?',
      'Loss of the paternal copy',
      '["Loss of the paternal copy","Loss of the maternal copy","Duplication of chromosome 21","Triploidy"]'::jsonb,
      'Prader-Willi syndrome classically results from loss or inactivation of the paternal 15q11-q13 region. Loss of the maternal region instead causes Angelman syndrome.'
    ),
    (
      'online-erklaert-kompakt-genetik-05',
      'Genetik',
      'Welches Protoonkogen ist beim MEN-2-Syndrom typischerweise mutiert?',
      'RET',
      '["RET","BRCA1","TP53","PAH"]'::jsonb,
      'MEN 2 wird durch aktivierende RET-Mutationen verursacht. Das ist klinisch wichtig wegen medullaerem Schilddruesenkarzinom und Phaeochromozytom.',
      'Which proto-oncogene is typically mutated in MEN 2 syndrome?',
      'RET',
      '["RET","BRCA1","TP53","PAH"]'::jsonb,
      'MEN 2 is caused by activating RET mutations. This is clinically important because of medullary thyroid carcinoma and pheochromocytoma.'
    ),
    (
      'online-erklaert-kompakt-immunologie-01',
      'Immunologie',
      'Welcher Hypersensitivitaetstyp liegt der Serumkrankheit klassisch zugrunde?',
      'Typ III',
      '["Typ III","Typ I","Typ II","Typ IV"]'::jsonb,
      'Die Serumkrankheit beruht auf Immunkomplexen, die sich in Geweben ablagern und Komplement aktivieren. Das entspricht einer Typ-III-Reaktion.',
      'Which hypersensitivity type classically underlies serum sickness?',
      'Type III',
      '["Type III","Type I","Type II","Type IV"]'::jsonb,
      'Serum sickness is caused by immune complexes that deposit in tissues and activate complement. This is a type III reaction.'
    ),
    (
      'online-erklaert-kompakt-immunologie-02',
      'Immunologie',
      'Ein Mangel welcher Komplementkomponenten praedisponiert besonders fuer invasive Neisserieninfektionen?',
      'C5 bis C9',
      '["C5 bis C9","C1-Inhibitor","Faktor VIII","Albumin"]'::jsonb,
      'Die terminalen Komplementkomponenten C5 bis C9 bilden den Membranangriffskomplex. Dessen Ausfall erhoeht besonders das Risiko fuer Neisseria-Infektionen.',
      'Deficiency of which complement components particularly predisposes to invasive Neisseria infections?',
      'C5 through C9',
      '["C5 through C9","C1 inhibitor","Factor VIII","Albumin"]'::jsonb,
      'The terminal complement components C5 through C9 form the membrane attack complex. Deficiency especially increases susceptibility to Neisseria infections.'
    ),
    (
      'online-erklaert-kompakt-immunologie-03',
      'Immunologie',
      'Welches Immunglobulin dominiert in Schleimhautsekreten?',
      'IgA',
      '["IgA","IgE","IgM","IgD"]'::jsonb,
      'Sekretorisches IgA ist der wichtigste Antikoerperisotyp an Schleimhaeuten. Es neutralisiert Pathogene im Lumen, ohne dort starke Entzuendung auszuloesen.',
      'Which immunoglobulin predominates in mucosal secretions?',
      'IgA',
      '["IgA","IgE","IgM","IgD"]'::jsonb,
      'Secretory IgA is the major antibody isotype at mucosal surfaces. It neutralizes pathogens in the lumen without causing strong local inflammation.'
    ),
    (
      'online-erklaert-kompakt-immunologie-04',
      'Immunologie',
      'Welches Zytokin ist besonders wichtig fuer Wachstum und Aktivierung von Eosinophilen?',
      'IL-5',
      '["IL-5","IL-2","TNF-beta","IFN-gamma"]'::jsonb,
      'IL-5 foerdert Differenzierung, Ueberleben und Aktivierung von Eosinophilen. Darum ist es zentral bei eosinophilen Entzuendungen.',
      'Which cytokine is especially important for eosinophil growth and activation?',
      'IL-5',
      '["IL-5","IL-2","TNF-beta","IFN-gamma"]'::jsonb,
      'IL-5 promotes eosinophil differentiation, survival, and activation. It is therefore central in eosinophilic inflammation.'
    ),
    (
      'online-erklaert-kompakt-immunologie-05',
      'Immunologie',
      'An welche T-Zell-Population praesentiert MHC-Klasse-I typischerweise Antigen?',
      'CD8-positive T-Zellen',
      '["CD8-positive T-Zellen","CD4-positive T-Zellen","B-Gedaechtniszellen","Plasmazellen"]'::jsonb,
      'MHC-Klasse-I praesentiert endogene Peptide an CD8-positive zytotoxische T-Zellen. Das ist zentral fuer die antivirale Immunabwehr.',
      'To which T-cell population does MHC class I typically present antigen?',
      'CD8-positive T cells',
      '["CD8-positive T cells","CD4-positive T cells","Memory B cells","Plasma cells"]'::jsonb,
      'MHC class I presents endogenous peptides to CD8-positive cytotoxic T cells. This is central to antiviral immunity.'
    ),
    (
      'online-erklaert-kompakt-pharmakologie-01',
      'Pharmakologie',
      'Welches Antidot hebt eine Benzodiazepin-Intoxikation spezifisch auf?',
      'Flumazenil',
      '["Flumazenil","Naloxon","Protamin","Atropin"]'::jsonb,
      'Flumazenil antagonisiert den Benzodiazepin-Bindungsort am GABA-A-Rezeptor. Damit kann es die sedierende Wirkung gezielt aufheben.',
      'Which antidote specifically reverses benzodiazepine intoxication?',
      'Flumazenil',
      '["Flumazenil","Naloxone","Protamine","Atropine"]'::jsonb,
      'Flumazenil antagonizes the benzodiazepine binding site on the GABA-A receptor. It can therefore specifically reverse benzodiazepine sedation.'
    ),
    (
      'online-erklaert-kompakt-pharmakologie-02',
      'Pharmakologie',
      'Welches Antidot ist Standard bei Opioid-Ueberdosierung mit Atemdepression?',
      'Naloxon',
      '["Naloxon","Flumazenil","N-Acetylcystein","Vitamin K"]'::jsonb,
      'Naloxon ist ein kompetitiver Opioidrezeptor-Antagonist und kann eine opioidbedingte Atemdepression rasch antagonisieren.',
      'Which antidote is standard for opioid overdose with respiratory depression?',
      'Naloxone',
      '["Naloxone","Flumazenil","N-acetylcysteine","Vitamin K"]'::jsonb,
      'Naloxone is a competitive opioid receptor antagonist and can rapidly reverse opioid-induced respiratory depression.'
    ),
    (
      'online-erklaert-kompakt-pharmakologie-03',
      'Pharmakologie',
      'Welches Medikament neutralisiert unfraktioniertes Heparin am direktesten?',
      'Protaminsulfat',
      '["Protaminsulfat","Aspirin","Leucovorin","Adrenalin"]'::jsonb,
      'Protamin bindet das saure Heparin und inaktiviert es. Deshalb wird es zur raschen Antagonisierung der Heparinwirkung eingesetzt.',
      'Which medication most directly neutralizes unfractionated heparin?',
      'Protamine sulfate',
      '["Protamine sulfate","Aspirin","Leucovorin","Epinephrine"]'::jsonb,
      'Protamine binds acidic heparin and inactivates it. It is therefore used for rapid reversal of heparin effect.'
    ),
    (
      'online-erklaert-kompakt-pharmakologie-04',
      'Pharmakologie',
      'Welches Medikament dient als Rescue-Therapie nach hochdosiertem Methotrexat?',
      'Leucovorin',
      '["Leucovorin","Naloxon","Atropin","Acetazolamid"]'::jsonb,
      'Leucovorin ist Folinsaeure und umgeht funktionell die durch Methotrexat blockierte Dihydrofolatreduktase. So werden gesunde Zellen geschuetzt.',
      'Which medication is used as rescue therapy after high-dose methotrexate?',
      'Leucovorin',
      '["Leucovorin","Naloxone","Atropine","Acetazolamide"]'::jsonb,
      'Leucovorin is folinic acid and functionally bypasses methotrexate blockade of dihydrofolate reductase. This helps protect healthy cells.'
    ),
    (
      'online-erklaert-kompakt-pharmakologie-05',
      'Pharmakologie',
      'Welches Enzym wird durch Warfarin gehemmt?',
      'Vitamin-K-Epoxid-Reduktase',
      '["Vitamin-K-Epoxid-Reduktase","Cyclooxygenase-2","Acetylcholinesterase","Na-K-ATPase"]'::jsonb,
      'Warfarin hemmt die Vitamin-K-Epoxid-Reduktase und stoert damit die Regeneration von reduziertem Vitamin K fuer die Gerinnungsfaktorsynthese.',
      'Which enzyme is inhibited by warfarin?',
      'Vitamin K epoxide reductase',
      '["Vitamin K epoxide reductase","Cyclooxygenase 2","Acetylcholinesterase","Na-K-ATPase"]'::jsonb,
      'Warfarin inhibits vitamin K epoxide reductase and therefore impairs regeneration of reduced vitamin K for clotting factor synthesis.'
    ),
    (
      'online-erklaert-kompakt-physiologie-01',
      'Physiologie',
      'Welcher Parameter ist beim gesunden Erwachsenen auf Meereshoehe der wichtigste physiologische Atemantrieb?',
      'Arterieller CO2-Partialdruck',
      '["Arterieller CO2-Partialdruck","Serumkalzium","Haematokrit","Plasmaalbumin"]'::jsonb,
      'Unter Normalbedingungen wird die Ventilation vor allem ueber zentrale Chemorezeptoren durch Veraenderungen des CO2 und des Liquor-pH gesteuert. Daher dominiert der arterielle CO2-Partialdruck.',
      'Which parameter is the most important physiologic drive to breathe in a healthy adult at sea level?',
      'Arterial partial pressure of carbon dioxide',
      '["Arterial partial pressure of carbon dioxide","Serum calcium","Hematocrit","Plasma albumin"]'::jsonb,
      'Under normal conditions, ventilation is mainly regulated by central chemoreceptors responding to carbon dioxide and cerebrospinal fluid pH. Arterial carbon dioxide therefore dominates the respiratory drive.'
    ),
    (
      'online-erklaert-kompakt-physiologie-02',
      'Physiologie',
      'Die Clearance welcher Substanz entspricht idealerweise der glomerulaeren Filtrationsrate?',
      'Inulin',
      '["Inulin","PAH","Glukose","Albumin"]'::jsonb,
      'Inulin wird frei filtriert und weder rueckresorbiert noch sezerniert. Deshalb entspricht seine Clearance naeherungsweise direkt der GFR.',
      'The clearance of which substance ideally equals the glomerular filtration rate?',
      'Inulin',
      '["Inulin","PAH","Glucose","Albumin"]'::jsonb,
      'Inulin is freely filtered and neither reabsorbed nor secreted. Its clearance therefore closely reflects GFR.'
    ),
    (
      'online-erklaert-kompakt-physiologie-03',
      'Physiologie',
      'In welchem Nephronabschnitt wird der groesste Anteil des filtrierten Bikarbonats rueckresorbiert?',
      'Proximaler Tubulus',
      '["Proximaler Tubulus","Absteigender Henle-Schenkel","Distaler Tubulus","Sammelrohr"]'::jsonb,
      'Der proximale Tubulus rueckresorbiert den Hauptteil des filtrierten Bikarbonats ueber Carboanhydrase- und Na-H-Austauscher-vermittelte Mechanismen.',
      'In which nephron segment is the largest fraction of filtered bicarbonate reabsorbed?',
      'Proximal tubule',
      '["Proximal tubule","Descending limb of Henle","Distal tubule","Collecting duct"]'::jsonb,
      'The proximal tubule reabsorbs most filtered bicarbonate through carbonic anhydrase and sodium-hydrogen exchange dependent mechanisms.'
    ),
    (
      'online-erklaert-kompakt-physiologie-04',
      'Physiologie',
      'Welcher Faktor verschiebt die Sauerstoff-Bindungskurve des Haemoglobins nach rechts?',
      'Erhoehtes 2,3-BPG',
      '["Erhoehtes 2,3-BPG","Erniedrigtes CO2","Alkalose","Hypothermie"]'::jsonb,
      'Ein Anstieg von 2,3-BPG senkt die Sauerstoffaffinitaet des Haemoglobins. Dadurch wird Sauerstoff im Gewebe leichter abgegeben.',
      'Which factor shifts the hemoglobin oxygen dissociation curve to the right?',
      'Increased 2,3-BPG',
      '["Increased 2,3-BPG","Low carbon dioxide","Alkalosis","Hypothermia"]'::jsonb,
      'Higher 2,3-BPG lowers hemoglobin oxygen affinity. Oxygen is therefore released more readily to the tissues.'
    ),
    (
      'online-erklaert-kompakt-physiologie-05',
      'Physiologie',
      'An welchem Rezeptor vermittelt ADH im Sammelrohr vor allem die Wasserretention?',
      'V2-Rezeptor',
      '["V2-Rezeptor","M2-Rezeptor","H1-Rezeptor","D1-Rezeptor"]'::jsonb,
      'ADH bindet in den Hauptzellen des Sammelrohrs an den V2-Rezeptor und foerdert den Einbau von Aquaporin-2. So steigt die Wasserrueckresorption.',
      'Through which receptor does ADH mainly mediate water retention in the collecting duct?',
      'V2 receptor',
      '["V2 receptor","M2 receptor","H1 receptor","D1 receptor"]'::jsonb,
      'In collecting duct principal cells, ADH binds the V2 receptor and promotes insertion of aquaporin-2. Water reabsorption therefore increases.'
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
