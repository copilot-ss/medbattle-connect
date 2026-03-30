-- Tighten wording for the remaining curated question stems.

with revisions (
  slug,
  question_de,
  question_en
) as (
  values
    (
      'anatomie-v3-foramen-ovale',
      'Durch welches Foramen der Schaedelbasis verlaesst der N. mandibularis (V3) die mittlere Schaedelgrube?',
      'Through which skull base foramen does the mandibular nerve (V3) leave the middle cranial fossa?'
    ),
    (
      'physiologie-proximaler-tubulus-natrium',
      'Welcher Nephronabschnitt resorbiert unter physiologischen Bedingungen den groessten Anteil des filtrierten Natriums?',
      'Under physiologic conditions, which nephron segment reabsorbs the largest share of filtered sodium?'
    ),
    (
      'pathologie-hodgkin-reed-sternberg',
      'Welche Zellart gilt histologisch als Leitzelle des klassischen Hodgkin-Lymphoms?',
      'Which cell type is regarded histologically as the hallmark cell of classical Hodgkin lymphoma?'
    ),
    (
      'pharmakologie-apixaban-faktor-xa',
      'Welchen aktivierten Gerinnungsfaktor hemmt Apixaban direkt?',
      'Which activated coagulation factor is directly inhibited by apixaban?'
    ),
    (
      'mikrobiologie-cdiff-pseudomembranoese-kolitis',
      'Welcher Erreger verursacht nach Breitspektrum-Antibiotikatherapie klassisch eine pseudomembranoese Kolitis?',
      'Which pathogen classically causes pseudomembranous colitis after broad-spectrum antibiotic therapy?'
    ),
    (
      'biochemie-pfk1-glykolyse',
      'Welches Enzym katalysiert in der Glykolyse die Umwandlung von Fructose-6-phosphat zu Fructose-1,6-bisphosphat?',
      'Which enzyme catalyzes the glycolytic conversion of fructose 6-phosphate to fructose 1,6-bisphosphate?'
    ),
    (
      'immunologie-tlr4-lps',
      'Welcher Toll-like-Rezeptor erkennt Lipopolysaccharid gramnegativer Bakterien?',
      'Which toll-like receptor recognizes lipopolysaccharide from Gram-negative bacteria?'
    ),
    (
      'genetik-lynch-mismatch-repair',
      'Welches DNA-Reparatursystem ist beim Lynch-Syndrom typischerweise ausgefallen?',
      'Which DNA repair system is typically defective in Lynch syndrome?'
    ),
    (
      'radiologie-spannungspneumothorax-mediastinalverlagerung',
      'Welcher Befund im Thoraxroentgen spricht bei akutem klinischem Verdacht am staerksten fuer einen Spannungspneumothorax?',
      'Which chest radiograph finding most strongly supports tension pneumothorax in an acute clinical setting?'
    ),
    (
      'chirurgie-thyreoidektomie-recurrens',
      'Welcher Nerv muss bei der Thyreoidektomie geschont werden, um eine postoperative Stimmlippenparese mit Heiserkeit zu vermeiden?',
      'Which nerve must be preserved during thyroidectomy to avoid postoperative vocal cord paresis with hoarseness?'
    ),
    (
      'physiologie-beta1-herzfrequenz',
      'Welcher adrenerge Rezeptor vermittelt den positiven chronotropen Effekt von Noradrenalin am Sinusknoten?',
      'Which adrenergic receptor mediates the positive chronotropic effect of norepinephrine at the sinoatrial node?'
    ),
    (
      'pathologie-hcc-afp',
      'Welcher Serumtumormarker ist beim hepatozellulaeren Karzinom klassisch erhoeht?',
      'Which serum tumor marker is classically elevated in hepatocellular carcinoma?'
    ),
    (
      'biochemie-ldl-cholesterintransport',
      'Welches Lipoprotein transportiert Cholesterin vor allem von der Leber in periphere Gewebe?',
      'Which lipoprotein transports cholesterol mainly from the liver to peripheral tissues?'
    ),
    (
      'radiologie-hcc-arterielle-phase',
      'In welcher Kontrastmittelphase der CT zeigt ein hepatozellulaeres Karzinom klassisch ein fruehes hypervaskulaeres Enhancement?',
      'In which CT contrast phase does hepatocellular carcinoma classically show early hypervascular enhancement?'
    ),
    (
      'chirurgie-alvarado-appendizitis',
      'Welcher klinische Score wird bei Erwachsenen haeufig zur Einschaetzung einer akuten Appendizitis verwendet?',
      'Which clinical score is commonly used in adults to assess acute appendicitis?'
    ),
    (
      'anatomie-foramen-spinosum-a-meningea-media',
      'Durch welches Foramen der Schaedelbasis tritt die A. meningea media in die Schaedelhoehle ein?',
      'Through which skull base foramen does the middle meningeal artery enter the cranial cavity?'
    ),
    (
      'physiologie-nkcc2-henle',
      'In welchem Abschnitt des Tubulussystems befindet sich der Na-K-2Cl-Kotransporter NKCC2?',
      'In which tubular segment is the Na-K-2Cl cotransporter NKCC2 located?'
    ),
    (
      'physiologie-adh-aquaporin2',
      'Welches Hormon foerdert im Sammelrohr ueber V2-Rezeptoren den Einbau von Aquaporin-2 in die apikale Membran?',
      'Which hormone promotes insertion of aquaporin 2 into the apical membrane of the collecting duct via V2 receptors?'
    ),
    (
      'pathologie-hirninfarkt-liquefaktion',
      'Welche Nekroseform ist fuer einen ischaemischen Infarkt des Gehirns typisch?',
      'Which type of necrosis is typical of an ischemic infarction of the brain?'
    ),
    (
      'pharmakologie-naloxon-opioid',
      'Welches Medikament wird in der Akutmedizin zur raschen Aufhebung einer Opioidwirkung eingesetzt?',
      'Which drug is used in acute care to rapidly reverse opioid effects?'
    ),
    (
      'mikrobiologie-proteus-struvit',
      'Welcher ureasepositive Erreger ist klassisch mit Struvit- und Hirschgeweihsteinen assoziiert?',
      'Which urease-positive pathogen is classically associated with struvite and staghorn stones?'
    ),
    (
      'mikrobiologie-mycoplasma-kalte-agglutinine',
      'Welcher Erreger einer atypischen Pneumonie ist klassisch mit kalten Agglutininen assoziiert?',
      'Which pathogen causing atypical pneumonia is classically associated with cold agglutinins?'
    ),
    (
      'biochemie-harnstoffzyklus-cps1',
      'Welches Enzym ist das geschwindigkeitsbestimmende Enzym des Harnstoffzyklus?',
      'Which enzyme is the rate-limiting enzyme of the urea cycle?'
    ),
    (
      'biochemie-elektronentransport-coenzym-q',
      'Welcher mobile Elektronentraeger transportiert Elektronen von Komplex I und II zu Komplex III der Atmungskette?',
      'Which mobile electron carrier transports electrons from complexes I and II to complex III of the respiratory chain?'
    ),
    (
      'immunologie-il5-eosinophile',
      'Welches Zytokin foerdert besonders die Reifung und Aktivierung eosinophiler Granulozyten?',
      'Which cytokine especially promotes maturation and activation of eosinophils?'
    ),
    (
      'immunologie-goodpasture-typ2',
      'Welcher Typ der Hypersensitivitaetsreaktion liegt dem Goodpasture-Syndrom zugrunde?',
      'Which type of hypersensitivity reaction underlies Goodpasture syndrome?'
    ),
    (
      'genetik-turner-45x',
      'Welcher Karyotyp ist fuer das Turner-Syndrom klassisch?',
      'Which karyotype is classically associated with Turner syndrome?'
    ),
    (
      'genetik-huntington-cag',
      'Welche Trinukleotidsequenz ist im HTT-Gen bei Morbus Huntington pathologisch expandiert?',
      'Which trinucleotide sequence is pathologically expanded in the HTT gene in Huntington disease?'
    ),
    (
      'radiologie-sah-nativ-ct',
      'Welche Bildgebung ist in der Akutdiagnostik bei Verdacht auf frische Subarachnoidalblutung die erste Wahl?',
      'Which imaging study is first line in the acute evaluation of suspected recent subarachnoid hemorrhage?'
    ),
    (
      'radiologie-pe-ctpa',
      'Welche Bildgebung ist bei haemodynamisch stabilen Erwachsenen mit Verdacht auf Lungenembolie meist Standard?',
      'Which imaging modality is usually standard in hemodynamically stable adults with suspected pulmonary embolism?'
    ),
    (
      'chirurgie-spannungspneumothorax-entlastung',
      'Welche erste lebensrettende Massnahme ist bei klinischem Verdacht auf Spannungspneumothorax sofort erforderlich?',
      'Which immediate life-saving intervention is required first when tension pneumothorax is clinically suspected?'
    ),
    (
      'chirurgie-cholezystolithiasis-cholezystektomie',
      'Welche definitive Standardoperation wird bei symptomatischer Cholezystolithiasis durchgefuehrt?',
      'Which definitive standard operation is performed for symptomatic cholelithiasis?'
    ),
    (
      'anatomie-pterion-meningea-media',
      'Welche Arterie ist bei einer Fraktur im Bereich des Pterions besonders gefaehrdet?',
      'Which artery is especially at risk in a fracture involving the pterion?'
    ),
    (
      'anatomie-carpaltunnel-nerv',
      'Welcher Nerv verlaeuft zusammen mit den Beugesehnen durch den Carpaltunnel?',
      'Which nerve runs through the carpal tunnel together with the flexor tendons?'
    ),
    (
      'pathologie-crohn-transmural',
      'Welcher histopathologische Befund spricht im Vergleich zur Colitis ulcerosa fuer Morbus Crohn?',
      'Which histopathologic finding favors Crohn disease over ulcerative colitis?'
    ),
    (
      'mikrobiologie-pseudomonas-oxidase',
      'Welcher gramnegative Erreger ist oxidasepositiv und produziert haeufig blaugruene Pigmente?',
      'Which Gram-negative pathogen is oxidase positive and often produces blue-green pigments?'
    ),
    (
      'biochemie-pdh-thiamin',
      'Der Mangel welches Vitamins beeintraechtigt den Pyruvatdehydrogenase-Komplex besonders?',
      'Deficiency of which vitamin particularly impairs the pyruvate dehydrogenase complex?'
    ),
    (
      'biochemie-g6pd-nadph',
      'Welches Reduktionsaequivalent wird in der von G6PD katalysierten Reaktion des Pentosephosphatwegs direkt gebildet?',
      'Which reducing equivalent is produced directly in the pentose phosphate pathway reaction catalyzed by G6PD?'
    ),
    (
      'immunologie-c5a-chemotaxis',
      'Welches Komplementfragment ist besonders stark chemotaktisch fuer neutrophile Granulozyten?',
      'Which complement fragment is especially strongly chemotactic for neutrophils?'
    ),
    (
      'immunologie-hiv-cd4',
      'Welches Oberflaechenmolekuel dient HIV als primaerer Rezeptor auf CD4-positiven T-Helferzellen?',
      'Which surface molecule serves as the primary receptor for HIV on CD4-positive helper T cells?'
    ),
    (
      'genetik-robertson-down-14-21',
      'Welche Robertson-Translokation ist klassisch mit einem Down-Syndrom assoziiert?',
      'Which Robertsonian translocation is classically associated with Down syndrome?'
    ),
    (
      'radiologie-subdural-crescent',
      'Welche Form zeigt ein subdurales Haematom typischerweise im kranialen CT?',
      'Which shape does a subdural hematoma typically show on cranial CT?'
    ),
    (
      'chirurgie-akute-gliedmassenischaemie-heparin',
      'Welche sofortige medikamentoese Massnahme gehoert zur Initialtherapie einer akuten arteriellen Gliedmassenischaemie vor der Revaskularisation?',
      'Which immediate medication is part of the initial treatment of acute arterial limb ischemia before revascularization?'
    ),
    (
      'anatomie-foramen-jugulare',
      'Welcher der folgenden Hirnnerven passiert nicht das Foramen jugulare?',
      'Which of the following cranial nerves does not pass through the jugular foramen?'
    ),
    (
      'physiologie-bohr-effekt',
      'Welche Veraenderung des Milieus verschiebt die Sauerstoffbindungskurve des Haemoglobins ueber den Bohr-Effekt nach rechts?',
      'Which change in the physiologic milieu shifts the hemoglobin oxygen dissociation curve to the right via the Bohr effect?'
    ),
    (
      'physiologie-glut4-insulin',
      'Welcher Glukosetransporter wird durch Insulin vermehrt an die Zellmembran von Skelettmuskel- und Fettzellen gebracht?',
      'Which glucose transporter is increasingly translocated to the cell membrane of skeletal muscle and adipose cells by insulin?'
    ),
    (
      'pathologie-myokardinfarkt-koagulationsnekrose',
      'Welche Nekroseform entsteht typischerweise bei akutem ischaemischem Myokardinfarkt?',
      'Which type of necrosis typically develops in an acute ischemic myocardial infarction?'
    ),
    (
      'pathologie-rasch-progrediente-glomerulonephritis',
      'Welcher histologische Leitbefund ist fuer eine rasch progrediente Glomerulonephritis typisch?',
      'Which histologic hallmark is typical of rapidly progressive glomerulonephritis?'
    ),
    (
      'pathologie-papillaeres-schilddruesenkarzinom',
      'Welcher Kernbefund ist fuer das papillaere Schilddruesenkarzinom klassisch?',
      'Which nuclear finding is classically associated with papillary thyroid carcinoma?'
    ),
    (
      'pharmakologie-heparin-protamin',
      'Welches Antidot neutralisiert unfraktioniertes Heparin in der Akutsituation am direktesten?',
      'Which antidote most directly neutralizes unfractionated heparin in the acute setting?'
    ),
    (
      'pharmakologie-schleifendiuretika-nkcc2',
      'Welchen Tubulustransporter hemmen Schleifendiuretika im dicken aufsteigenden Teil der Henle-Schleife?',
      'Which tubular transporter is inhibited by loop diuretics in the thick ascending limb of the loop of Henle?'
    ),
    (
      'pharmakologie-metformin-laktatazidose',
      'Welche gefuerchtete metabolische Komplikation erklaert die Vorsicht mit Metformin bei schwerer Niereninsuffizienz?',
      'Which feared metabolic complication explains the caution required with metformin in severe renal impairment?'
    ),
    (
      'pharmakologie-atropin-muskarin',
      'Welche Rezeptorfamilie blockiert Atropin kompetitiv?',
      'Which receptor family is competitively blocked by atropine?'
    )
)
update public.questions q
set question = r.question_de,
    updated_at = now()
from revisions r
where q.slug = r.slug;

with revisions (
  slug,
  question_en
) as (
  values
    (
      'anatomie-v3-foramen-ovale',
      'Through which skull base foramen does the mandibular nerve (V3) leave the middle cranial fossa?'
    ),
    (
      'physiologie-proximaler-tubulus-natrium',
      'Under physiologic conditions, which nephron segment reabsorbs the largest share of filtered sodium?'
    ),
    (
      'pathologie-hodgkin-reed-sternberg',
      'Which cell type is regarded histologically as the hallmark cell of classical Hodgkin lymphoma?'
    ),
    (
      'pharmakologie-apixaban-faktor-xa',
      'Which activated coagulation factor is directly inhibited by apixaban?'
    ),
    (
      'mikrobiologie-cdiff-pseudomembranoese-kolitis',
      'Which pathogen classically causes pseudomembranous colitis after broad-spectrum antibiotic therapy?'
    ),
    (
      'biochemie-pfk1-glykolyse',
      'Which enzyme catalyzes the glycolytic conversion of fructose 6-phosphate to fructose 1,6-bisphosphate?'
    ),
    (
      'immunologie-tlr4-lps',
      'Which toll-like receptor recognizes lipopolysaccharide from Gram-negative bacteria?'
    ),
    (
      'genetik-lynch-mismatch-repair',
      'Which DNA repair system is typically defective in Lynch syndrome?'
    ),
    (
      'radiologie-spannungspneumothorax-mediastinalverlagerung',
      'Which chest radiograph finding most strongly supports tension pneumothorax in an acute clinical setting?'
    ),
    (
      'chirurgie-thyreoidektomie-recurrens',
      'Which nerve must be preserved during thyroidectomy to avoid postoperative vocal cord paresis with hoarseness?'
    ),
    (
      'physiologie-beta1-herzfrequenz',
      'Which adrenergic receptor mediates the positive chronotropic effect of norepinephrine at the sinoatrial node?'
    ),
    (
      'pathologie-hcc-afp',
      'Which serum tumor marker is classically elevated in hepatocellular carcinoma?'
    ),
    (
      'biochemie-ldl-cholesterintransport',
      'Which lipoprotein transports cholesterol mainly from the liver to peripheral tissues?'
    ),
    (
      'radiologie-hcc-arterielle-phase',
      'In which CT contrast phase does hepatocellular carcinoma classically show early hypervascular enhancement?'
    ),
    (
      'chirurgie-alvarado-appendizitis',
      'Which clinical score is commonly used in adults to assess acute appendicitis?'
    ),
    (
      'anatomie-foramen-spinosum-a-meningea-media',
      'Through which skull base foramen does the middle meningeal artery enter the cranial cavity?'
    ),
    (
      'physiologie-nkcc2-henle',
      'In which tubular segment is the Na-K-2Cl cotransporter NKCC2 located?'
    ),
    (
      'physiologie-adh-aquaporin2',
      'Which hormone promotes insertion of aquaporin 2 into the apical membrane of the collecting duct via V2 receptors?'
    ),
    (
      'pathologie-hirninfarkt-liquefaktion',
      'Which type of necrosis is typical of an ischemic infarction of the brain?'
    ),
    (
      'pharmakologie-naloxon-opioid',
      'Which drug is used in acute care to rapidly reverse opioid effects?'
    ),
    (
      'mikrobiologie-proteus-struvit',
      'Which urease-positive pathogen is classically associated with struvite and staghorn stones?'
    ),
    (
      'mikrobiologie-mycoplasma-kalte-agglutinine',
      'Which pathogen causing atypical pneumonia is classically associated with cold agglutinins?'
    ),
    (
      'biochemie-harnstoffzyklus-cps1',
      'Which enzyme is the rate-limiting enzyme of the urea cycle?'
    ),
    (
      'biochemie-elektronentransport-coenzym-q',
      'Which mobile electron carrier transports electrons from complexes I and II to complex III of the respiratory chain?'
    ),
    (
      'immunologie-il5-eosinophile',
      'Which cytokine especially promotes maturation and activation of eosinophils?'
    ),
    (
      'immunologie-goodpasture-typ2',
      'Which type of hypersensitivity reaction underlies Goodpasture syndrome?'
    ),
    (
      'genetik-turner-45x',
      'Which karyotype is classically associated with Turner syndrome?'
    ),
    (
      'genetik-huntington-cag',
      'Which trinucleotide sequence is pathologically expanded in the HTT gene in Huntington disease?'
    ),
    (
      'radiologie-sah-nativ-ct',
      'Which imaging study is first line in the acute evaluation of suspected recent subarachnoid hemorrhage?'
    ),
    (
      'radiologie-pe-ctpa',
      'Which imaging modality is usually standard in hemodynamically stable adults with suspected pulmonary embolism?'
    ),
    (
      'chirurgie-spannungspneumothorax-entlastung',
      'Which immediate life-saving intervention is required first when tension pneumothorax is clinically suspected?'
    ),
    (
      'chirurgie-cholezystolithiasis-cholezystektomie',
      'Which definitive standard operation is performed for symptomatic cholelithiasis?'
    ),
    (
      'anatomie-pterion-meningea-media',
      'Which artery is especially at risk in a fracture involving the pterion?'
    ),
    (
      'anatomie-carpaltunnel-nerv',
      'Which nerve runs through the carpal tunnel together with the flexor tendons?'
    ),
    (
      'pathologie-crohn-transmural',
      'Which histopathologic finding favors Crohn disease over ulcerative colitis?'
    ),
    (
      'mikrobiologie-pseudomonas-oxidase',
      'Which Gram-negative pathogen is oxidase positive and often produces blue-green pigments?'
    ),
    (
      'biochemie-pdh-thiamin',
      'Deficiency of which vitamin particularly impairs the pyruvate dehydrogenase complex?'
    ),
    (
      'biochemie-g6pd-nadph',
      'Which reducing equivalent is produced directly in the pentose phosphate pathway reaction catalyzed by G6PD?'
    ),
    (
      'immunologie-c5a-chemotaxis',
      'Which complement fragment is especially strongly chemotactic for neutrophils?'
    ),
    (
      'immunologie-hiv-cd4',
      'Which surface molecule serves as the primary receptor for HIV on CD4-positive helper T cells?'
    ),
    (
      'genetik-robertson-down-14-21',
      'Which Robertsonian translocation is classically associated with Down syndrome?'
    ),
    (
      'radiologie-subdural-crescent',
      'Which shape does a subdural hematoma typically show on cranial CT?'
    ),
    (
      'chirurgie-akute-gliedmassenischaemie-heparin',
      'Which immediate medication is part of the initial treatment of acute arterial limb ischemia before revascularization?'
    ),
    (
      'anatomie-foramen-jugulare',
      'Which of the following cranial nerves does not pass through the jugular foramen?'
    ),
    (
      'physiologie-bohr-effekt',
      'Which change in the physiologic milieu shifts the hemoglobin oxygen dissociation curve to the right via the Bohr effect?'
    ),
    (
      'physiologie-glut4-insulin',
      'Which glucose transporter is increasingly translocated to the cell membrane of skeletal muscle and adipose cells by insulin?'
    ),
    (
      'pathologie-myokardinfarkt-koagulationsnekrose',
      'Which type of necrosis typically develops in an acute ischemic myocardial infarction?'
    ),
    (
      'pathologie-rasch-progrediente-glomerulonephritis',
      'Which histologic hallmark is typical of rapidly progressive glomerulonephritis?'
    ),
    (
      'pathologie-papillaeres-schilddruesenkarzinom',
      'Which nuclear finding is classically associated with papillary thyroid carcinoma?'
    ),
    (
      'pharmakologie-heparin-protamin',
      'Which antidote most directly neutralizes unfractionated heparin in the acute setting?'
    ),
    (
      'pharmakologie-schleifendiuretika-nkcc2',
      'Which tubular transporter is inhibited by loop diuretics in the thick ascending limb of the loop of Henle?'
    ),
    (
      'pharmakologie-metformin-laktatazidose',
      'Which feared metabolic complication explains the caution required with metformin in severe renal impairment?'
    ),
    (
      'pharmakologie-atropin-muskarin',
      'Which receptor family is competitively blocked by atropine?'
    )
)
update public.question_translations qt
set question = r.question_en,
    updated_at = now()
from revisions r
join public.questions q on q.slug = r.slug
where qt.question_id = q.id
  and qt.language = 'en';
