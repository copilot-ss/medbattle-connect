-- Expand follow-up online category pools with unique slugs for targeted categories.

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
      'online-nachschub-genetik-01',
      'Genetik',
      'Welches Gen ist beim Marfan-Syndrom typischerweise mutiert?',
      'FBN1',
      '["FBN1","RB1","NF1","CFTR"]'::jsonb,
      'Das Marfan-Syndrom wird klassisch durch Mutationen im FBN1-Gen verursacht.',
      'Which gene is typically mutated in Marfan syndrome?',
      'FBN1',
      '["FBN1","RB1","NF1","CFTR"]'::jsonb,
      'Marfan syndrome is classically caused by mutations in the FBN1 gene.'
    ),
    (
      'online-nachschub-genetik-02',
      'Genetik',
      'Welche Repeatexpansion liegt bei der Huntington-Krankheit vor?',
      'CAG',
      '["CAG","CTG","CGG","GAA"]'::jsonb,
      'Die Huntington-Krankheit beruht auf einer CAG-Expansion im HTT-Gen.',
      'Which repeat expansion is present in Huntington disease?',
      'CAG',
      '["CAG","CTG","CGG","GAA"]'::jsonb,
      'Huntington disease is caused by a CAG expansion in the HTT gene.'
    ),
    (
      'online-nachschub-genetik-03',
      'Genetik',
      'Welches Gen ist bei der Neurofibromatose Typ 1 typischerweise mutiert?',
      'NF1',
      '["NF1","NF2","APC","WT1"]'::jsonb,
      'Die Neurofibromatose Typ 1 wird durch Mutationen im NF1-Gen verursacht.',
      'Which gene is typically mutated in neurofibromatosis type 1?',
      'NF1',
      '["NF1","NF2","APC","WT1"]'::jsonb,
      'Neurofibromatosis type 1 is caused by mutations in the NF1 gene.'
    ),
    (
      'online-nachschub-genetik-04',
      'Genetik',
      'Welche Chromosomendeletion ist klassisch mit dem Cri-du-chat-Syndrom assoziiert?',
      '5p-Deletion',
      '["5p-Deletion","7q11.23-Deletion","22q11.2-Deletion","17p13-Deletion"]'::jsonb,
      'Das Cri-du-chat-Syndrom ist klassisch mit einer Deletion des kurzen Arms von Chromosom 5 assoziiert.',
      'Which chromosomal deletion is classically associated with Cri-du-chat syndrome?',
      '5p deletion',
      '["5p deletion","7q11.23 deletion","22q11.2 deletion","17p13 deletion"]'::jsonb,
      'Cri-du-chat syndrome is classically associated with deletion of the short arm of chromosome 5.'
    ),
    (
      'online-nachschub-genetik-05',
      'Genetik',
      'Welche Nukleotidsequenz ist beim Fragilen-X-Syndrom expandiert?',
      'CGG',
      '["CGG","CAG","CTG","GAA"]'::jsonb,
      'Das Fragile-X-Syndrom beruht auf einer CGG-Expansion im FMR1-Gen.',
      'Which nucleotide repeat is expanded in fragile X syndrome?',
      'CGG',
      '["CGG","CAG","CTG","GAA"]'::jsonb,
      'Fragile X syndrome is caused by a CGG expansion in the FMR1 gene.'
    ),
    (
      'online-nachschub-genetik-06',
      'Genetik',
      'Welches Gen ist bei der spinalen Muskelatrophie meist homozygot deletiert?',
      'SMN1',
      '["SMN1","SMN2","DMD","MECP2"]'::jsonb,
      'Die spinale Muskelatrophie ist meist durch eine homozygote Deletion oder Mutation von SMN1 verursacht.',
      'Which gene is most often homozygously deleted in spinal muscular atrophy?',
      'SMN1',
      '["SMN1","SMN2","DMD","MECP2"]'::jsonb,
      'Spinal muscular atrophy is most often caused by homozygous deletion or mutation of SMN1.'
    ),
    (
      'online-nachschub-genetik-07',
      'Genetik',
      'Welche Karyotypformel ist typisch fuer das Turner-Syndrom?',
      '45,X',
      '["45,X","47,XX,+21","47,XY,+18","46,XX"]'::jsonb,
      'Das Turner-Syndrom ist klassisch mit einer Monosomie X und dem Karyotyp 45,X assoziiert.',
      'Which karyotype is typical of Turner syndrome?',
      '45,X',
      '["45,X","47,XX,+21","47,XY,+18","46,XX"]'::jsonb,
      'Turner syndrome is classically associated with monosomy X and the karyotype 45,X.'
    ),
    (
      'online-nachschub-genetik-08',
      'Genetik',
      'Welche elterliche 15q11-q13-Deletion verursacht das Prader-Willi-Syndrom?',
      'Paternal',
      '["Paternal","Maternal","Beidseitig","Keine Deletion"]'::jsonb,
      'Das Prader-Willi-Syndrom entsteht klassisch durch Verlust paternaler Gene in 15q11-q13.',
      'Which parental 15q11-q13 deletion causes Prader-Willi syndrome?',
      'Paternal',
      '["Paternal","Maternal","Both parents","No deletion"]'::jsonb,
      'Prader-Willi syndrome classically results from loss of paternal gene expression in 15q11-q13.'
    ),
    (
      'online-nachschub-genetik-09',
      'Genetik',
      'Welche elterliche 15q11-q13-Deletion verursacht das Angelman-Syndrom?',
      'Maternal',
      '["Maternal","Paternal","Beidseitig","Keine Deletion"]'::jsonb,
      'Das Angelman-Syndrom entsteht klassisch durch Verlust maternaler Gene in 15q11-q13.',
      'Which parental 15q11-q13 deletion causes Angelman syndrome?',
      'Maternal',
      '["Maternal","Paternal","Both parents","No deletion"]'::jsonb,
      'Angelman syndrome classically results from loss of maternal gene expression in 15q11-q13.'
    ),
    (
      'online-nachschub-genetik-10',
      'Genetik',
      'Welches Gen ist bei der Neurofibromatose Typ 2 typischerweise mutiert?',
      'NF2',
      '["NF2","NF1","RET","VHL"]'::jsonb,
      'Die Neurofibromatose Typ 2 wird durch Mutationen im NF2-Gen verursacht.',
      'Which gene is typically mutated in neurofibromatosis type 2?',
      'NF2',
      '["NF2","NF1","RET","VHL"]'::jsonb,
      'Neurofibromatosis type 2 is caused by mutations in the NF2 gene.'
    ),
    (
      'online-nachschub-chirurgie-01',
      'Chirurgie',
      'Welche Arterie wird bei der Cholezystektomie im Calot-Dreieck regelhaft geklippt?',
      'A. cystica',
      '["A. cystica","A. hepatica propria","A. gastroduodenalis","A. mesenterica superior"]'::jsonb,
      'Bei der Cholezystektomie wird die A. cystica nach sicherer Identifikation im Calot-Dreieck geklippt und durchtrennt.',
      'Which artery is routinely clipped in Calot triangle during cholecystectomy?',
      'Cystic artery',
      '["Cystic artery","Proper hepatic artery","Gastroduodenal artery","Superior mesenteric artery"]'::jsonb,
      'During cholecystectomy, the cystic artery is clipped and divided after safe identification in Calot triangle.'
    ),
    (
      'online-nachschub-chirurgie-02',
      'Chirurgie',
      'Welche Operation ist die Standardtherapie der hypertrophen Pylorusstenose im Saeuglingsalter?',
      'Pyloromyotomie nach Weber-Ramstedt',
      '["Pyloromyotomie nach Weber-Ramstedt","Heller-Myotomie","Whipple-Operation","Hartmann-Operation"]'::jsonb,
      'Die hypertrophe Pylorusstenose des Saeuglings wird standardmaessig durch Pyloromyotomie nach Weber-Ramstedt behandelt.',
      'Which operation is the standard treatment for infantile hypertrophic pyloric stenosis?',
      'Ramstedt pyloromyotomy',
      '["Ramstedt pyloromyotomy","Heller myotomy","Whipple procedure","Hartmann procedure"]'::jsonb,
      'Infantile hypertrophic pyloric stenosis is treated standardly by Ramstedt pyloromyotomy.'
    ),
    (
      'online-nachschub-chirurgie-03',
      'Chirurgie',
      'Welcher Hautschnitt wird klassisch fuer die offene Appendektomie am McBurney-Punkt verwendet?',
      'McBurney-Schnitt',
      '["McBurney-Schnitt","Kocher-Schnitt","Pfannenstiel-Schnitt","Thorakotomie"]'::jsonb,
      'Der McBurney-Schnitt ist ein klassischer Wechselschnitt fuer die offene Appendektomie im rechten Unterbauch.',
      'Which skin incision is classically used for open appendectomy at McBurney point?',
      'McBurney incision',
      '["McBurney incision","Kocher incision","Pfannenstiel incision","Thoracotomy"]'::jsonb,
      'The McBurney incision is a classic muscle-splitting incision for open appendectomy in the right lower quadrant.'
    ),
    (
      'online-nachschub-chirurgie-04',
      'Chirurgie',
      'Welche Hernie tritt unterhalb des Leistenbandes durch die Lacuna vasorum?',
      'Schenkelhernie',
      '["Schenkelhernie","Indirekte Leistenhernie","Direkte Leistenhernie","Nabelhernie"]'::jsonb,
      'Die Schenkelhernie verlaeuft unterhalb des Leistenbandes durch den Femoralring in der Lacuna vasorum.',
      'Which hernia passes below the inguinal ligament through the femoral canal?',
      'Femoral hernia',
      '["Femoral hernia","Indirect inguinal hernia","Direct inguinal hernia","Umbilical hernia"]'::jsonb,
      'A femoral hernia passes below the inguinal ligament through the femoral canal.'
    ),
    (
      'online-nachschub-chirurgie-05',
      'Chirurgie',
      'Welche Operation ist die Standardresektion beim resektablen Pankreaskopfkarzinom?',
      'Whipple-Operation',
      '["Whipple-Operation","Hartmann-Operation","Lichtenstein-Operation","Nissen-Fundoplikatio"]'::jsonb,
      'Das resektable Pankreaskopfkarzinom wird standardmaessig mit einer Pankreatikoduodenektomie nach Whipple operiert.',
      'Which operation is the standard resection for resectable pancreatic head carcinoma?',
      'Whipple procedure',
      '["Whipple procedure","Hartmann procedure","Lichtenstein repair","Nissen fundoplication"]'::jsonb,
      'Resectable pancreatic head carcinoma is standardly treated with pancreaticoduodenectomy, also called the Whipple procedure.'
    ),
    (
      'online-nachschub-chirurgie-06',
      'Chirurgie',
      'Welcher Nerv ist bei der Thyreoidektomie fuer postoperative Heiserkeit besonders relevant?',
      'N. laryngeus recurrens',
      '["N. laryngeus recurrens","N. phrenicus","N. vagus","N. hypoglossus"]'::jsonb,
      'Eine Verletzung des N. laryngeus recurrens bei der Thyreoidektomie kann zu Stimmlippenparese und Heiserkeit fuehren.',
      'Which nerve is especially relevant for postoperative hoarseness after thyroidectomy?',
      'Recurrent laryngeal nerve',
      '["Recurrent laryngeal nerve","Phrenic nerve","Vagus nerve","Hypoglossal nerve"]'::jsonb,
      'Injury to the recurrent laryngeal nerve during thyroidectomy can cause vocal cord paresis and hoarseness.'
    ),
    (
      'online-nachschub-chirurgie-07',
      'Chirurgie',
      'Welche definitive Drainage wird nach initialer Entlastung eines Spannungspneumothorax angelegt?',
      'Thoraxdrainage',
      '["Thoraxdrainage","Redon-Drainage","Magensonde","Nephrostomie"]'::jsonb,
      'Nach der initialen Entlastung wird ein Spannungspneumothorax definitiv mit einer Thoraxdrainage behandelt.',
      'Which definitive drain is placed after initial decompression of a tension pneumothorax?',
      'Chest tube',
      '["Chest tube","Redon drain","Nasogastric tube","Nephrostomy"]'::jsonb,
      'After initial decompression, a tension pneumothorax is definitively managed with a chest tube.'
    ),
    (
      'online-nachschub-chirurgie-08',
      'Chirurgie',
      'Welche bariatrische Operation formt den Magen schlauchfoermig entlang der grossen Kurvatur?',
      'Schlauchmagen-Operation',
      '["Schlauchmagen-Operation","Hartmann-Operation","Whipple-Operation","Heller-Myotomie"]'::jsonb,
      'Bei der Schlauchmagen-Operation wird der Magen entlang der grossen Kurvatur reseziert und zu einem Schlauch verkleinert.',
      'Which bariatric operation creates a tubular stomach along the greater curvature?',
      'Sleeve gastrectomy',
      '["Sleeve gastrectomy","Hartmann procedure","Whipple procedure","Heller myotomy"]'::jsonb,
      'In sleeve gastrectomy, the stomach is resected along the greater curvature to create a narrow tube.'
    ),
    (
      'online-nachschub-chirurgie-09',
      'Chirurgie',
      'Welche Vene ist das Standardautograft fuer einen infrainguinalen Bypass?',
      'V. saphena magna',
      '["V. saphena magna","V. cava inferior","V. jugularis interna","V. azygos"]'::jsonb,
      'Fuer infrainguinale Bypaesse ist die V. saphena magna das Standardautograft.',
      'Which vein is the standard autologous conduit for an infrainguinal bypass?',
      'Great saphenous vein',
      '["Great saphenous vein","Inferior vena cava","Internal jugular vein","Azygos vein"]'::jsonb,
      'The great saphenous vein is the standard autologous conduit for infrainguinal bypass surgery.'
    ),
    (
      'online-nachschub-chirurgie-10',
      'Chirurgie',
      'Welcher Verband wird initial bei einem offenen Pneumothorax angelegt?',
      'Dreiseitig fixierter Okklusivverband',
      '["Dreiseitig fixierter Okklusivverband","Kompressionsverband","Gipsverband","Spica-Verband"]'::jsonb,
      'Beim offenen Pneumothorax wird initial ein dreiseitig fixierter Okklusivverband angelegt, um ein Ventil zu vermeiden.',
      'Which dressing is applied initially in an open pneumothorax?',
      'Three-sided occlusive dressing',
      '["Three-sided occlusive dressing","Compression dressing","Cast dressing","Spica dressing"]'::jsonb,
      'In open pneumothorax, an initial three-sided occlusive dressing is applied to avoid creating a one-way valve.'
    ),
    (
      'online-nachschub-immunologie-01',
      'Immunologie',
      'Welche Komplementdefizienz praedisponiert klassisch zu rezidivierenden Neisserieninfektionen?',
      'C5-bis-C9-Mangel',
      '["C5-bis-C9-Mangel","C1-Inhibitor-Mangel","MBL-Mangel","Faktor-H-Mangel"]'::jsonb,
      'Defekte der terminalen Komplementkomponenten C5 bis C9 beguenstigen rezidivierende Neisserieninfektionen.',
      'Which complement deficiency classically predisposes to recurrent Neisseria infections?',
      'C5 to C9 deficiency',
      '["C5 to C9 deficiency","C1 inhibitor deficiency","MBL deficiency","Factor H deficiency"]'::jsonb,
      'Deficiency of terminal complement components C5 through C9 predisposes to recurrent Neisseria infections.'
    ),
    (
      'online-nachschub-immunologie-02',
      'Immunologie',
      'Welches Protein fehlt beim hereditaeren Angiooedem klassisch?',
      'C1-Inhibitor',
      '["C1-Inhibitor","Properdin","IgA","CD40L"]'::jsonb,
      'Das hereditaere Angiooedem beruht klassisch auf einem Mangel oder Funktionsdefekt des C1-Inhibitors.',
      'Which protein is classically deficient in hereditary angioedema?',
      'C1 inhibitor',
      '["C1 inhibitor","Properdin","IgA","CD40L"]'::jsonb,
      'Hereditary angioedema classically results from deficiency or dysfunction of C1 inhibitor.'
    ),
    (
      'online-nachschub-immunologie-03',
      'Immunologie',
      'Welches Zytokin induziert den Klassenwechsel zu IgE besonders stark?',
      'IL-4',
      '["IL-4","IL-2","IL-8","IFN-gamma"]'::jsonb,
      'IL-4 foerdert in B-Zellen den Klassenwechsel zu IgE und ist zentral in der allergischen Antwort.',
      'Which cytokine strongly induces class switching to IgE?',
      'IL-4',
      '["IL-4","IL-2","IL-8","IFN-gamma"]'::jsonb,
      'IL-4 promotes class switching to IgE in B cells and is central to allergic responses.'
    ),
    (
      'online-nachschub-immunologie-04',
      'Immunologie',
      'Welches Molekuel ist beim X-chromosomalen Hyper-IgM-Syndrom typischerweise defekt?',
      'CD40L',
      '["CD40L","BTK","FOXP3","CD18"]'::jsonb,
      'Das X-chromosomale Hyper-IgM-Syndrom wird typischerweise durch einen Defekt von CD40L verursacht.',
      'Which molecule is typically defective in X-linked hyper-IgM syndrome?',
      'CD40L',
      '["CD40L","BTK","FOXP3","CD18"]'::jsonb,
      'X-linked hyper-IgM syndrome is typically caused by a defect in CD40L.'
    ),
    (
      'online-nachschub-immunologie-05',
      'Immunologie',
      'Welches Adhaesionsmolekuel ist bei der Leukozytenadhaesionsdefizienz Typ 1 defekt?',
      'CD18',
      '["CD18","CD3","CD4","CD40"]'::jsonb,
      'Die Leukozytenadhaesionsdefizienz Typ 1 beruht auf einem Defekt der beta2-Integrin-Untereinheit CD18.',
      'Which adhesion molecule is defective in leukocyte adhesion deficiency type 1?',
      'CD18',
      '["CD18","CD3","CD4","CD40"]'::jsonb,
      'Leukocyte adhesion deficiency type 1 is caused by a defect in the beta2 integrin subunit CD18.'
    ),
    (
      'online-nachschub-immunologie-06',
      'Immunologie',
      'Welcher Enzymkomplex ist bei der chronischen Granulomatose defekt?',
      'NADPH-Oxidase',
      '["NADPH-Oxidase","Myeloperoxidase","Adenosin-Desaminase","C1-Inhibitor"]'::jsonb,
      'Die chronische Granulomatose wird durch einen Defekt der NADPH-Oxidase mit ausbleibendem respiratorischem Burst verursacht.',
      'Which enzyme complex is defective in chronic granulomatous disease?',
      'NADPH oxidase',
      '["NADPH oxidase","Myeloperoxidase","Adenosine deaminase","C1 inhibitor"]'::jsonb,
      'Chronic granulomatous disease is caused by a defect in NADPH oxidase with failure of the respiratory burst.'
    ),
    (
      'online-nachschub-immunologie-07',
      'Immunologie',
      'Welches Enzym ist beim ADA-SCID klassisch defekt?',
      'Adenosin-Desaminase',
      '["Adenosin-Desaminase","AID","NADPH-Oxidase","DOPA-Decarboxylase"]'::jsonb,
      'Beim ADA-SCID fuehrt ein Defekt der Adenosin-Desaminase zu toxischen Purinmetaboliten und schwerer kombinierter Immundefizienz.',
      'Which enzyme is classically defective in ADA-SCID?',
      'Adenosine deaminase',
      '["Adenosine deaminase","AID","NADPH oxidase","DOPA decarboxylase"]'::jsonb,
      'In ADA-SCID, deficiency of adenosine deaminase leads to toxic purine metabolites and severe combined immunodeficiency.'
    ),
    (
      'online-nachschub-immunologie-08',
      'Immunologie',
      'Welcher Prozess eliminiert selbstreaktive T-Zellen im Thymus?',
      'Negative Selektion',
      '["Negative Selektion","Positive Selektion","Klassenwechsel","Somatische Hypermutation"]'::jsonb,
      'Selbstreaktive T-Zellen werden im Thymus durch negative Selektion entfernt.',
      'Which process eliminates self-reactive T cells in the thymus?',
      'Negative selection',
      '["Negative selection","Positive selection","Class switching","Somatic hypermutation"]'::jsonb,
      'Self-reactive T cells are removed in the thymus by negative selection.'
    ),
    (
      'online-nachschub-immunologie-09',
      'Immunologie',
      'Welches Immunglobulin dominiert in mukosalen Sekreten?',
      'IgA',
      '["IgA","IgE","IgM","IgD"]'::jsonb,
      'Mukosale Sekrete enthalten ueberwiegend sekretorisches IgA.',
      'Which immunoglobulin predominates in mucosal secretions?',
      'IgA',
      '["IgA","IgE","IgM","IgD"]'::jsonb,
      'Mucosal secretions are dominated by secretory IgA.'
    ),
    (
      'online-nachschub-immunologie-10',
      'Immunologie',
      'Welches Zytokin aktiviert Makrophagen in der Th1-Antwort besonders stark?',
      'IFN-gamma',
      '["IFN-gamma","IL-4","IL-10","TGF-beta"]'::jsonb,
      'IFN-gamma ist das zentrale aktivierende Zytokin fuer Makrophagen in der Th1-vermittelten Immunantwort.',
      'Which cytokine most strongly activates macrophages in a Th1 response?',
      'IFN-gamma',
      '["IFN-gamma","IL-4","IL-10","TGF-beta"]'::jsonb,
      'IFN-gamma is the key activating cytokine for macrophages in a Th1-mediated immune response.'
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
