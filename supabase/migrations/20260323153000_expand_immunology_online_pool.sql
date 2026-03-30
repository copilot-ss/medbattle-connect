-- Deepen the online immunology pool with a broader precise bilingual pack.

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
      'online-immunologie-vertieft-01',
      'Immunologie',
      'Welches Immunglobulin ist in mukosalen Sekreten quantitativ am wichtigsten?',
      'IgA',
      '["IgA","IgG","IgM","IgE"]'::jsonb,
      'IgA ist das mengenmaessig wichtigste Immunglobulin in mukosalen Sekreten wie Speichel, Tranen und Darmsekret. Dort vermittelt es die lokale Schleimhautimmunitaet.',
      'Which immunoglobulin is quantitatively most important in mucosal secretions?',
      'IgA',
      '["IgA","IgG","IgM","IgE"]'::jsonb,
      'IgA is the quantitatively dominant immunoglobulin in mucosal secretions such as saliva, tears, and intestinal fluid. It mediates local mucosal immunity.'
    ),
    (
      'online-immunologie-vertieft-02',
      'Immunologie',
      'Welches Oberflaechenmolekuel auf Mastzellen bindet IgE mit hoher Affinitaet?',
      'Fc-epsilon-RI',
      '["Fc-epsilon-RI","Fc-gamma-RI","CD21","TLR4"]'::jsonb,
      'Mastzellen exprimieren den hochaffinen IgE-Rezeptor Fc-epsilon-RI. Die Kreuzvernetzung dieses Rezeptors loest die Sofortreaktion aus.',
      'Which surface molecule on mast cells binds IgE with high affinity?',
      'Fc-epsilon-RI',
      '["Fc-epsilon-RI","Fc-gamma-RI","CD21","TLR4"]'::jsonb,
      'Mast cells express the high-affinity IgE receptor Fc-epsilon-RI. Cross-linking of this receptor triggers the immediate hypersensitivity response.'
    ),
    (
      'online-immunologie-vertieft-03',
      'Immunologie',
      'Welcher Defekt verursacht klassisch das X-chromosomale Hyper-IgM-Syndrom?',
      'CD40-Ligand-Mangel',
      '["CD40-Ligand-Mangel","BTK-Mangel","Adenosin-Desaminase-Mangel","C1-Esterase-Inhibitor-Mangel"]'::jsonb,
      'Beim X-chromosomalen Hyper-IgM-Syndrom fehlt typischerweise der CD40-Ligand auf T-Helferzellen. Dadurch bleibt der Klassenwechsel der B-Zellen aus.',
      'Which defect classically causes X-linked hyper-IgM syndrome?',
      'CD40 ligand deficiency',
      '["CD40 ligand deficiency","BTK deficiency","Adenosine deaminase deficiency","C1 esterase inhibitor deficiency"]'::jsonb,
      'In X-linked hyper-IgM syndrome, the typical defect is absence of CD40 ligand on helper T cells. This prevents normal B-cell class switching.'
    ),
    (
      'online-immunologie-vertieft-04',
      'Immunologie',
      'Welcher Enzymmangel ist eine klassische Ursache einer schweren kombinierten Immundefizienz (SCID)?',
      'Adenosin-Desaminase-Mangel',
      '["Adenosin-Desaminase-Mangel","Myeloperoxidase-Mangel","BTK-Mangel","C3-Mangel"]'::jsonb,
      'Ein Adenosin-Desaminase-Mangel fuehrt zur Akkumulation toxischer Purinmetabolite und kann eine schwere kombinierte Immundefizienz verursachen.',
      'Which enzyme deficiency is a classic cause of severe combined immunodeficiency (SCID)?',
      'Adenosine deaminase deficiency',
      '["Adenosine deaminase deficiency","Myeloperoxidase deficiency","BTK deficiency","C3 deficiency"]'::jsonb,
      'Adenosine deaminase deficiency causes accumulation of toxic purine metabolites and can lead to severe combined immunodeficiency.'
    ),
    (
      'online-immunologie-vertieft-05',
      'Immunologie',
      'Welcher Transkriptionsfaktor ermoeglicht im Thymus die Expression gewebespezifischer Autoantigene fuer die zentrale Toleranz?',
      'AIRE',
      '["AIRE","FOXP3","RAG1","BCL6"]'::jsonb,
      'AIRE steuert in medullaeren Thymusepithelzellen die Expression vieler gewebespezifischer Antigene. Das ist zentral fuer die negative Selektion autoreaktiver T-Zellen.',
      'Which transcription factor enables expression of tissue-specific autoantigens in the thymus for central tolerance?',
      'AIRE',
      '["AIRE","FOXP3","RAG1","BCL6"]'::jsonb,
      'AIRE drives expression of many tissue-specific antigens in medullary thymic epithelial cells. This is central to negative selection of autoreactive T cells.'
    ),
    (
      'online-immunologie-vertieft-06',
      'Immunologie',
      'Welches Zytokin foerdert die Differenzierung naiver CD4-positiver T-Zellen zu Th1-Zellen besonders?',
      'IL-12',
      '["IL-12","IL-4","IL-5","IL-10"]'::jsonb,
      'IL-12 wird unter anderem von antigenpraesentierenden Zellen gebildet und lenkt naive CD4-T-Zellen in Richtung Th1-Antwort.',
      'Which cytokine particularly promotes differentiation of naive CD4-positive T cells into Th1 cells?',
      'IL-12',
      '["IL-12","IL-4","IL-5","IL-10"]'::jsonb,
      'IL-12 is produced by antigen-presenting cells and directs naive CD4 T cells toward a Th1 response.'
    ),
    (
      'online-immunologie-vertieft-07',
      'Immunologie',
      'Welches Zytokin gilt als klassischer Wachstumsfaktor fuer T-Zellen?',
      'IL-2',
      '["IL-2","IL-6","IL-8","IL-13"]'::jsonb,
      'IL-2 foerdert die Proliferation aktivierter T-Zellen und ist der klassische T-Zell-Wachstumsfaktor.',
      'Which cytokine is classically considered the growth factor for T cells?',
      'IL-2',
      '["IL-2","IL-6","IL-8","IL-13"]'::jsonb,
      'IL-2 promotes proliferation of activated T cells and is the classic T-cell growth factor.'
    ),
    (
      'online-immunologie-vertieft-08',
      'Immunologie',
      'Welcher Korezeptor wird von fruehen makrophagentropen HIV-Staemmen typischerweise zusaetzlich zu CD4 genutzt?',
      'CCR5',
      '["CCR5","CXCR4","CD28","CR2"]'::jsonb,
      'Fruehe makrophagentrope HIV-Varianten verwenden typischerweise CCR5 als Korezeptor neben CD4. Genau darauf beruht auch die Resistenz bei CCR5-Delta32.',
      'Which co-receptor is typically used in addition to CD4 by early macrophage-tropic HIV strains?',
      'CCR5',
      '["CCR5","CXCR4","CD28","CR2"]'::jsonb,
      'Early macrophage-tropic HIV strains typically use CCR5 as a co-receptor in addition to CD4. This is also the basis of resistance in CCR5-delta32 carriers.'
    ),
    (
      'online-immunologie-vertieft-09',
      'Immunologie',
      'Welcher Molekueldefekt ist typisch fuer die Leukozytenadhaesionsdefizienz Typ I?',
      'CD18-Defekt',
      '["CD18-Defekt","CD40-Ligand-Mangel","Myeloperoxidase-Mangel","Perforin-Mangel"]'::jsonb,
      'Bei der Leukozytenadhaesionsdefizienz Typ I ist die beta-2-Integrin-Untereinheit CD18 defekt. Dadurch koennen Leukozyten nicht ausreichend ans Endothel anhaften und auswandern.',
      'Which molecular defect is typical of leukocyte adhesion deficiency type I?',
      'CD18 defect',
      '["CD18 defect","CD40 ligand deficiency","Myeloperoxidase deficiency","Perforin deficiency"]'::jsonb,
      'In leukocyte adhesion deficiency type I, the beta-2 integrin subunit CD18 is defective. As a result, leukocytes cannot adequately adhere to endothelium and transmigrate.'
    ),
    (
      'online-immunologie-vertieft-10',
      'Immunologie',
      'Welcher Enzymkomplex ist bei chronischer Granulomatose klassisch defekt?',
      'NADPH-Oxidase',
      '["NADPH-Oxidase","Myeloperoxidase","Lysozym","Elastase"]'::jsonb,
      'Die chronische Granulomatose beruht klassisch auf einem Defekt der NADPH-Oxidase. Dadurch ist der oxidative Burst phagozytierender Zellen gestoert.',
      'Which enzyme complex is classically defective in chronic granulomatous disease?',
      'NADPH oxidase',
      '["NADPH oxidase","Myeloperoxidase","Lysozyme","Elastase"]'::jsonb,
      'Chronic granulomatous disease is classically caused by a defect in NADPH oxidase. This impairs the oxidative burst of phagocytic cells.'
    ),
    (
      'online-immunologie-vertieft-11',
      'Immunologie',
      'Welcher primaere Antikoerpermangel ist insgesamt am haeufigsten?',
      'Selektiver IgA-Mangel',
      '["Selektiver IgA-Mangel","X-chromosomale Agammaglobulinaemie","Terminaler Komplementdefekt","DiGeorge-Syndrom"]'::jsonb,
      'Der selektive IgA-Mangel ist der haeufigste primaere Antikoerpermangel. Er praedisponiert vor allem zu rezidivierenden mukosalen Infektionen.',
      'Which primary antibody deficiency is the most common overall?',
      'Selective IgA deficiency',
      '["Selective IgA deficiency","X-linked agammaglobulinemia","Terminal complement deficiency","DiGeorge syndrome"]'::jsonb,
      'Selective IgA deficiency is the most common primary antibody deficiency overall. It mainly predisposes to recurrent mucosal infections.'
    ),
    (
      'online-immunologie-vertieft-12',
      'Immunologie',
      'Welcher Proteinmangel ist fuer das hereditare Angiooedem durch klassischen Typ-I-Defekt typisch?',
      'C1-Esterase-Inhibitor-Mangel',
      '["C1-Esterase-Inhibitor-Mangel","C3-Mangel","Properdin-Mangel","Faktor-B-Mangel"]'::jsonb,
      'Das hereditare Angiooedem vom klassischen Typ I beruht auf einem Mangel des C1-Esterase-Inhibitors. Dadurch wird das Kallikrein-Bradykinin-System unzureichend gebremst.',
      'Which protein deficiency is typical of hereditary angioedema caused by the classic type I defect?',
      'C1 esterase inhibitor deficiency',
      '["C1 esterase inhibitor deficiency","C3 deficiency","Properdin deficiency","Factor B deficiency"]'::jsonb,
      'Classic type I hereditary angioedema is caused by deficiency of C1 esterase inhibitor. This results in insufficient control of the kallikrein-bradykinin system.'
    ),
    (
      'online-immunologie-vertieft-13',
      'Immunologie',
      'Welche Immunzellreihe ist beim DiGeorge-Syndrom primaer vermindert?',
      'T-Lymphozyten',
      '["T-Lymphozyten","B-Lymphozyten","Plasmazellen","Eosinophile Granulozyten"]'::jsonb,
      'Beim DiGeorge-Syndrom fuehrt die Thymushypoplasie oder -aplasie primaer zu einem Mangel an T-Lymphozyten.',
      'Which immune cell lineage is primarily reduced in DiGeorge syndrome?',
      'T lymphocytes',
      '["T lymphocytes","B lymphocytes","Plasma cells","Eosinophils"]'::jsonb,
      'In DiGeorge syndrome, thymic hypoplasia or aplasia primarily leads to a deficiency of T lymphocytes.'
    ),
    (
      'online-immunologie-vertieft-14',
      'Immunologie',
      'Welcher Tyrosinkinase-Defekt ist typisch fuer die X-chromosomale Agammaglobulinaemie nach Bruton?',
      'BTK-Mangel',
      '["BTK-Mangel","JAK3-Mangel","SYK-Mangel","ZAP-70-Mangel"]'::jsonb,
      'Die X-chromosomale Agammaglobulinaemie nach Bruton wird durch einen Defekt der Brutons Tyrosinkinase verursacht. Dadurch reifen B-Zellen nicht normal aus.',
      'Which tyrosine kinase defect is typical of X-linked agammaglobulinemia of Bruton?',
      'BTK deficiency',
      '["BTK deficiency","JAK3 deficiency","SYK deficiency","ZAP-70 deficiency"]'::jsonb,
      'X-linked agammaglobulinemia of Bruton is caused by a defect in Bruton tyrosine kinase. As a result, B cells fail to mature normally.'
    ),
    (
      'online-immunologie-vertieft-15',
      'Immunologie',
      'Welches Kostimulationsmolekuel auf antigenpraesentierenden Zellen bindet CD28 auf T-Zellen?',
      'B7 (CD80/CD86)',
      '["B7 (CD80/CD86)","CD40","ICAM-1","Fc-epsilon-RI"]'::jsonb,
      'Die B7-Molekuele CD80 und CD86 auf antigenpraesentierenden Zellen liefern ueber CD28 das entscheidende Kostimulationssignal fuer naive T-Zellen.',
      'Which co-stimulatory molecule on antigen-presenting cells binds CD28 on T cells?',
      'B7 (CD80/CD86)',
      '["B7 (CD80/CD86)","CD40","ICAM-1","Fc-epsilon-RI"]'::jsonb,
      'The B7 molecules CD80 and CD86 on antigen-presenting cells provide the key co-stimulatory signal to naive T cells through CD28.'
    ),
    (
      'online-immunologie-vertieft-16',
      'Immunologie',
      'Welcher Rezeptor auf B-Zellen bindet C3d und verstaerkt dadurch die B-Zell-Aktivierung?',
      'CD21',
      '["CD21","CD3","CD16","CD56"]'::jsonb,
      'CD21 ist der Komplementrezeptor fuer C3d auf B-Zellen. Die Bindung verstaerkt zusammen mit dem B-Zell-Rezeptor die Aktivierung.',
      'Which receptor on B cells binds C3d and thereby enhances B-cell activation?',
      'CD21',
      '["CD21","CD3","CD16","CD56"]'::jsonb,
      'CD21 is the complement receptor for C3d on B cells. Binding of C3d enhances activation together with the B-cell receptor.'
    ),
    (
      'online-immunologie-vertieft-17',
      'Immunologie',
      'Welcher Toll-like-Rezeptor erkennt unmethylierte CpG-DNA am typischsten?',
      'TLR9',
      '["TLR9","TLR3","TLR4","TLR5"]'::jsonb,
      'TLR9 erkennt bevorzugt unmethylierte CpG-Motive, wie sie in bakterieller und viraler DNA vorkommen koennen.',
      'Which toll-like receptor most typically recognizes unmethylated CpG DNA?',
      'TLR9',
      '["TLR9","TLR3","TLR4","TLR5"]'::jsonb,
      'TLR9 preferentially recognizes unmethylated CpG motifs, which can be found in bacterial and viral DNA.'
    ),
    (
      'online-immunologie-vertieft-18',
      'Immunologie',
      'Welche dendritische Zellpopulation produziert bei Virusinfektionen besonders viel Typ-I-Interferon?',
      'Plasmacytoide dendritische Zellen',
      '["Plasmacytoide dendritische Zellen","Neutrophile Granulozyten","Follikulaere dendritische Zellen","Eosinophile Granulozyten"]'::jsonb,
      'Plasmacytoide dendritische Zellen sind eine wichtige Quelle von Typ-I-Interferonen wie IFN-alpha bei Virusinfektionen.',
      'Which dendritic cell population produces particularly large amounts of type I interferon during viral infections?',
      'Plasmacytoid dendritic cells',
      '["Plasmacytoid dendritic cells","Neutrophils","Follicular dendritic cells","Eosinophils"]'::jsonb,
      'Plasmacytoid dendritic cells are a major source of type I interferons such as IFN-alpha during viral infections.'
    ),
    (
      'online-immunologie-vertieft-19',
      'Immunologie',
      'Welcher Hypersensitivitaetstyp liegt der allergischen Kontaktdermatitis zugrunde?',
      'Typ-IV-Hypersensitivitaet',
      '["Typ-IV-Hypersensitivitaet","Typ-I-Hypersensitivitaet","Typ-II-Hypersensitivitaet","Typ-III-Hypersensitivitaet"]'::jsonb,
      'Die allergische Kontaktdermatitis ist eine spaete, T-Zell-vermittelte Reaktion und gehoert damit zur Typ-IV-Hypersensitivitaet.',
      'Which type of hypersensitivity underlies allergic contact dermatitis?',
      'Type IV hypersensitivity',
      '["Type IV hypersensitivity","Type I hypersensitivity","Type II hypersensitivity","Type III hypersensitivity"]'::jsonb,
      'Allergic contact dermatitis is a delayed, T-cell-mediated reaction and therefore a type IV hypersensitivity.'
    ),
    (
      'online-immunologie-vertieft-20',
      'Immunologie',
      'Welcher Hypersensitivitaetstyp liegt der Serumkrankheit zugrunde?',
      'Typ-III-Hypersensitivitaet',
      '["Typ-III-Hypersensitivitaet","Typ-I-Hypersensitivitaet","Typ-II-Hypersensitivitaet","Typ-IV-Hypersensitivitaet"]'::jsonb,
      'Die Serumkrankheit beruht auf zirkulierenden Immunkomplexen mit anschliessender Entzuendungsreaktion. Das entspricht einer Typ-III-Hypersensitivitaet.',
      'Which type of hypersensitivity underlies serum sickness?',
      'Type III hypersensitivity',
      '["Type III hypersensitivity","Type I hypersensitivity","Type II hypersensitivity","Type IV hypersensitivity"]'::jsonb,
      'Serum sickness is caused by circulating immune complexes followed by inflammation. That corresponds to a type III hypersensitivity reaction.'
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
