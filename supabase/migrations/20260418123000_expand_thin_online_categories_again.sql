-- Expand thinner online category pools with another precise bilingual pack.

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
      'online-duenn-immunologie-01',
      'Immunologie',
      'Welcher Rezeptor erkennt bakterielle Lipopolysaccharide klassisch im angeborenen Immunsystem?',
      'TLR4',
      '["TLR4","TLR3","B-Zell-Rezeptor","CD3"]'::jsonb,
      'TLR4 erkennt vor allem Lipopolysaccharide gramnegativer Bakterien. Damit spielt er eine wichtige Rolle bei der fruehen angeborenen Immunantwort gegen gramnegative Erreger.',
      'Which receptor classically recognizes bacterial lipopolysaccharide in innate immunity?',
      'TLR4',
      '["TLR4","TLR3","B-cell receptor","CD3"]'::jsonb,
      'TLR4 primarily recognizes lipopolysaccharide from Gram-negative bacteria. It therefore plays a key role in the early innate immune response against these pathogens.'
    ),
    (
      'online-duenn-immunologie-02',
      'Immunologie',
      'Welche Zellen produzieren hauptsaechlich Antikoerper?',
      'Plasmazellen',
      '["Plasmazellen","Neutrophile Granulozyten","NK-Zellen","Mastzellen"]'::jsonb,
      'Plasmazellen sind terminal differenzierte B-Zellen und auf die Produktion grosser Mengen spezifischer Antikoerper spezialisiert.',
      'Which cells mainly produce antibodies?',
      'Plasma cells',
      '["Plasma cells","Neutrophils","NK cells","Mast cells"]'::jsonb,
      'Plasma cells are terminally differentiated B cells specialized in producing large amounts of specific antibodies.'
    ),
    (
      'online-duenn-immunologie-03',
      'Immunologie',
      'Welches Immunglobulin dominiert typischerweise in Schleimhautsekreten?',
      'IgA',
      '["IgA","IgM","IgG","IgE"]'::jsonb,
      'Sekretorisches IgA ist das wichtigste Immunglobulin an Schleimhaeuten und schuetzt etwa Atemwege und Darm vor Erregern.',
      'Which immunoglobulin typically predominates in mucosal secretions?',
      'IgA',
      '["IgA","IgM","IgG","IgE"]'::jsonb,
      'Secretory IgA is the dominant immunoglobulin at mucosal surfaces and helps protect the respiratory and gastrointestinal tract from pathogens.'
    ),
    (
      'online-duenn-immunologie-04',
      'Immunologie',
      'Welche Zellen sind die typischen Effektorzellen bei einer IgE-vermittelten Sofortreaktion?',
      'Mastzellen',
      '["Mastzellen","Erythrozyten","Osteoklasten","Megakaryozyten"]'::jsonb,
      'IgE bindet an Fc-Rezeptoren von Mastzellen. Bei Allergen-Kontakt kommt es dort zur Degranulation mit Histaminfreisetzung.',
      'Which cells are the classic effector cells in an IgE-mediated immediate reaction?',
      'Mast cells',
      '["Mast cells","Erythrocytes","Osteoclasts","Megakaryocytes"]'::jsonb,
      'IgE binds to Fc receptors on mast cells. Allergen exposure then triggers degranulation with histamine release.'
    ),
    (
      'online-duenn-immunologie-05',
      'Immunologie',
      'Welche T-Zell-Untergruppe hilft vor allem bei der Aktivierung zytotoxischer T-Zellen und Makrophagen gegen intrazellulaere Erreger?',
      'Th1-Zellen',
      '["Th1-Zellen","Th2-Zellen","Treg-Zellen","B1-Zellen"]'::jsonb,
      'Th1-Zellen foerdern die zellulaere Immunantwort, unter anderem ueber Interferon-gamma. Das ist besonders wichtig bei intrazellulaeren Erregern.',
      'Which T-cell subset primarily helps activate cytotoxic T cells and macrophages against intracellular pathogens?',
      'Th1 cells',
      '["Th1 cells","Th2 cells","Treg cells","B1 cells"]'::jsonb,
      'Th1 cells promote cellular immunity, especially through interferon-gamma. This is particularly important against intracellular pathogens.'
    ),
    (
      'online-duenn-immunologie-06',
      'Immunologie',
      'Welche Klasse von MHC-Molekuelen praesentiert endogene Antigene an CD8-positive T-Zellen?',
      'MHC I',
      '["MHC I","MHC II","CD1","Fc-Rezeptor"]'::jsonb,
      'MHC-I-Molekuele praesentieren intrazellulaer entstandene Peptide an CD8-positive T-Zellen. Damit koennen virusinfizierte oder maligne Zellen erkannt werden.',
      'Which class of MHC molecules presents endogenous antigens to CD8-positive T cells?',
      'MHC I',
      '["MHC I","MHC II","CD1","Fc receptor"]'::jsonb,
      'MHC class I molecules present peptides generated inside the cell to CD8-positive T cells. This allows recognition of virus-infected or malignant cells.'
    ),
    (
      'online-duenn-physiologie-01',
      'Physiologie',
      'Welcher Transporter im aufsteigenden Teil der Henle-Schleife resorbiert Natrium, Kalium und Chlorid gemeinsam?',
      'NKCC2',
      '["NKCC2","ENaC","SGLT2","Na-K-ATPase"]'::jsonb,
      'Im dicken aufsteigenden Teil der Henle-Schleife arbeitet der Na-K-2Cl-Kotransporter NKCC2. Er ist auch der Angriffspunkt von Schleifendiuretika.',
      'Which transporter in the ascending limb of the loop of Henle reabsorbs sodium, potassium, and chloride together?',
      'NKCC2',
      '["NKCC2","ENaC","SGLT2","Na-K-ATPase"]'::jsonb,
      'The thick ascending limb uses the Na-K-2Cl cotransporter NKCC2. It is also the target of loop diuretics.'
    ),
    (
      'online-duenn-physiologie-02',
      'Physiologie',
      'Welche Veraenderung verschiebt die Sauerstoffbindungskurve des Haemoglobins nach rechts?',
      'Erhoehung von CO2',
      '["Erhoehung von CO2","Abnahme der Temperatur","Abnahme von 2,3-BPG","Erhoehung des pH-Werts"]'::jsonb,
      'Mehr CO2, mehr 2,3-BPG, hoeheres H-plus und hoehere Temperatur verschieben die Kurve nach rechts. Dadurch wird Sauerstoff leichter im Gewebe abgegeben.',
      'Which change shifts the hemoglobin oxygen dissociation curve to the right?',
      'Increase in CO2',
      '["Increase in CO2","Decrease in temperature","Decrease in 2,3-BPG","Increase in pH"]'::jsonb,
      'Higher CO2, higher 2,3-BPG, increased H-plus, and higher temperature shift the curve to the right. This facilitates oxygen unloading in tissues.'
    ),
    (
      'online-duenn-genetik-01',
      'Genetik',
      'Welche Chromosomenstoerung ist typisch fuer das Klinefelter-Syndrom?',
      '47,XXY',
      '["47,XXY","45,X","47,XYY","47,XXX"]'::jsonb,
      'Das Klinefelter-Syndrom ist klassisch mit dem Karyotyp 47,XXY assoziiert. Typisch sind unter anderem Hypogonadismus und kleine Hoden.',
      'Which chromosomal abnormality is typical of Klinefelter syndrome?',
      '47,XXY',
      '["47,XXY","45,X","47,XYY","47,XXX"]'::jsonb,
      'Klinefelter syndrome is classically associated with a 47,XXY karyotype. Typical findings include hypogonadism and small testes.'
    ),
    (
      'online-duenn-genetik-02',
      'Genetik',
      'Welche Erkrankung entsteht klassisch durch eine Deletion auf Chromosom 5p?',
      'Cri-du-chat-Syndrom',
      '["Cri-du-chat-Syndrom","Turner-Syndrom","Williams-Syndrom","Marfan-Syndrom"]'::jsonb,
      'Das Cri-du-chat-Syndrom beruht auf einer Deletion des kurzen Arms von Chromosom 5. Der Name leitet sich vom charakteristischen katzenschreiartigen Schreien im Saeuglingsalter ab.',
      'Which disorder is classically caused by a deletion on chromosome 5p?',
      'Cri-du-chat syndrome',
      '["Cri-du-chat syndrome","Turner syndrome","Williams syndrome","Marfan syndrome"]'::jsonb,
      'Cri-du-chat syndrome is caused by deletion of the short arm of chromosome 5. The name comes from the characteristic cat-like cry in infancy.'
    ),
    (
      'online-duenn-radiologie-01',
      'Radiologie',
      'Welche Untersuchung ist bei Verdacht auf Hodentorsion initial typischerweise erste Wahl?',
      'Skrotale Sonografie mit Doppler',
      '["Skrotale Sonografie mit Doppler","PET-CT","DEXA","Roentgen Abdomen"]'::jsonb,
      'Die skrotale Sonografie mit Doppler ist die typische erste Bildgebung bei Verdacht auf Hodentorsion. Sie kann eine verminderte oder aufgehobene Perfusion zeigen.',
      'Which study is typically first-line when testicular torsion is suspected?',
      'Scrotal ultrasound with Doppler',
      '["Scrotal ultrasound with Doppler","PET-CT","DEXA","Abdominal radiograph"]'::jsonb,
      'Scrotal ultrasound with Doppler is the typical first imaging study when testicular torsion is suspected. It can demonstrate reduced or absent perfusion.'
    ),
    (
      'online-duenn-chirurgie-01',
      'Chirurgie',
      'Welche Wundheilungsphase ist vor allem durch Fibroblastenaktivitaet und Kollagenneubildung gekennzeichnet?',
      'Proliferationsphase',
      '["Proliferationsphase","Haemostasephase","Entzuendungsphase","Remodellingphase"]'::jsonb,
      'In der Proliferationsphase bilden Fibroblasten Kollagen und Granulationsgewebe. Diese Phase ist entscheidend fuer die Defektauffuellung und Stabilisierung der Wunde.',
      'Which wound-healing phase is mainly characterized by fibroblast activity and new collagen formation?',
      'Proliferative phase',
      '["Proliferative phase","Hemostasis phase","Inflammatory phase","Remodeling phase"]'::jsonb,
      'During the proliferative phase, fibroblasts produce collagen and granulation tissue. This phase is crucial for filling the defect and stabilizing the wound.'
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
