-- Make concise answer options more self-describing in curated question packs.

with revisions (
  slug,
  correct_de,
  options_de,
  correct_en,
  options_en
) as (
  values
    (
      'pharmakologie-apixaban-faktor-xa',
      'aktivierter Faktor X (Faktor Xa)',
      '["aktivierter Faktor X (Faktor Xa)","Thrombin (Faktor IIa)","Faktor VIII","Fibrinogen"]'::jsonb,
      'activated factor X (factor Xa)',
      '["activated factor X (factor Xa)","thrombin (factor IIa)","factor VIII","fibrinogen"]'::jsonb
    ),
    (
      'immunologie-tlr4-lps',
      'Toll-like-Rezeptor 4 (TLR4)',
      '["Toll-like-Rezeptor 4 (TLR4)","Toll-like-Rezeptor 2 (TLR2)","Toll-like-Rezeptor 3 (TLR3)","Toll-like-Rezeptor 5 (TLR5)"]'::jsonb,
      'Toll-like receptor 4 (TLR4)',
      '["Toll-like receptor 4 (TLR4)","Toll-like receptor 2 (TLR2)","Toll-like receptor 3 (TLR3)","Toll-like receptor 5 (TLR5)"]'::jsonb
    ),
    (
      'physiologie-beta1-herzfrequenz',
      'beta1-adrenerger Rezeptor',
      '["beta1-adrenerger Rezeptor","alpha1-adrenerger Rezeptor","beta2-adrenerger Rezeptor","muskarinischer M2-Rezeptor"]'::jsonb,
      'beta-1 adrenergic receptor',
      '["beta-1 adrenergic receptor","alpha-1 adrenergic receptor","beta-2 adrenergic receptor","muscarinic M2 receptor"]'::jsonb
    ),
    (
      'biochemie-ldl-cholesterintransport',
      'LDL (Low-density-Lipoprotein)',
      '["LDL (Low-density-Lipoprotein)","HDL (High-density-Lipoprotein)","Chylomikron","Albumin"]'::jsonb,
      'LDL (low-density lipoprotein)',
      '["LDL (low-density lipoprotein)","HDL (high-density lipoprotein)","chylomicron","albumin"]'::jsonb
    ),
    (
      'radiologie-hcc-arterielle-phase',
      'arterielle Kontrastmittelphase',
      '["arterielle Kontrastmittelphase","native Phase ohne Kontrastmittel","portovenoese Phase","spaetvenoeser Scan"]'::jsonb,
      'arterial contrast phase',
      '["arterial contrast phase","non-contrast phase","portal venous phase","delayed venous scan"]'::jsonb
    ),
    (
      'anatomie-testis-lymphabfluss',
      'paraaortale (lumbale) Lymphknoten',
      '["paraaortale (lumbale) Lymphknoten","inguinale Lymphknoten","Lymphknoten entlang der A. iliaca externa","axillaere Lymphknoten"]'::jsonb,
      'paraaortic (lumbar) lymph nodes',
      '["paraaortic (lumbar) lymph nodes","inguinal lymph nodes","external iliac lymph nodes","axillary lymph nodes"]'::jsonb
    ),
    (
      'physiologie-adh-aquaporin2',
      'ADH (Vasopressin)',
      '["ADH (Vasopressin)","Aldosteron","atriales natriuretisches Peptid (ANP)","Renin"]'::jsonb,
      'ADH (vasopressin)',
      '["ADH (vasopressin)","aldosterone","atrial natriuretic peptide (ANP)","renin"]'::jsonb
    ),
    (
      'biochemie-harnstoffzyklus-cps1',
      'Carbamoylphosphat-Synthetase I (CPS1)',
      '["Carbamoylphosphat-Synthetase I (CPS1)","Arginase","Ornithin-Transcarbamylase","Pyruvat-Carboxylase"]'::jsonb,
      'carbamoyl phosphate synthetase I (CPS1)',
      '["carbamoyl phosphate synthetase I (CPS1)","arginase","ornithine transcarbamylase","pyruvate carboxylase"]'::jsonb
    ),
    (
      'biochemie-elektronentransport-coenzym-q',
      'Coenzym Q (Ubichinon)',
      '["Coenzym Q (Ubichinon)","Cytochrom c","NADH","Succinat"]'::jsonb,
      'coenzyme Q (ubiquinone)',
      '["coenzyme Q (ubiquinone)","cytochrome c","NADH","succinate"]'::jsonb
    ),
    (
      'immunologie-il5-eosinophile',
      'Interleukin-5 (IL-5)',
      '["Interleukin-5 (IL-5)","Interleukin-2 (IL-2)","Interleukin-10 (IL-10)","Tumornekrosefaktor alpha (TNF-alpha)"]'::jsonb,
      'interleukin-5 (IL-5)',
      '["interleukin-5 (IL-5)","interleukin-2 (IL-2)","interleukin-10 (IL-10)","tumor necrosis factor alpha (TNF-alpha)"]'::jsonb
    ),
    (
      'genetik-turner-45x',
      'Monosomie X (45,X)',
      '["Monosomie X (45,X)","Trisomie 21 (47,XX,+21 oder 47,XY,+21)","Klinefelter-Karyotyp (47,XXY)","normaler maennlicher Karyotyp (46,XY)"]'::jsonb,
      'monosomy X (45,X)',
      '["monosomy X (45,X)","trisomy 21 (47,XX,+21 or 47,XY,+21)","Klinefelter karyotype (47,XXY)","normal male karyotype (46,XY)"]'::jsonb
    ),
    (
      'genetik-huntington-cag',
      'CAG-Repeat',
      '["CAG-Repeat","CGG-Repeat","CTG-Repeat","GAA-Repeat"]'::jsonb,
      'CAG repeat',
      '["CAG repeat","CGG repeat","CTG repeat","GAA repeat"]'::jsonb
    ),
    (
      'radiologie-sah-nativ-ct',
      'kraniales Nativ-CT',
      '["kraniales Nativ-CT","MRT der Hypophyse","Abdomen-Sonographie","Roentgen-Thorax"]'::jsonb,
      'non-contrast head CT',
      '["non-contrast head CT","pituitary MRI","abdominal ultrasound","chest radiograph"]'::jsonb
    ),
    (
      'anatomie-ductus-thoracicus-venenwinkel',
      'linker Venenwinkel (V. jugularis interna sinistra + V. subclavia sinistra)',
      '["linker Venenwinkel (V. jugularis interna sinistra + V. subclavia sinistra)","rechter Venenwinkel","V. cava superior","V. azygos"]'::jsonb,
      'left venous angle (junction of left internal jugular and left subclavian vein)',
      '["left venous angle (junction of left internal jugular and left subclavian vein)","right venous angle","superior vena cava","azygos vein"]'::jsonb
    ),
    (
      'anatomie-hiatus-aorticus-t12',
      'Th12 auf Hoehe des Hiatus aorticus',
      '["Th12 auf Hoehe des Hiatus aorticus","Th8 auf Hoehe des Foramen venae cavae","Th10 auf Hoehe des Hiatus oesophageus","L1"]'::jsonb,
      'T12 at the aortic hiatus',
      '["T12 at the aortic hiatus","T8 at the caval opening","T10 at the esophageal hiatus","L1"]'::jsonb
    ),
    (
      'anatomie-ligamentum-hepatoduodenale',
      'V. portae als Bestandteil der Portal-Trias',
      '["V. portae als Bestandteil der Portal-Trias","V. hepatica","A. mesenterica superior","V. cava inferior"]'::jsonb,
      'portal vein as part of the portal triad',
      '["portal vein as part of the portal triad","hepatic vein","superior mesenteric artery","inferior vena cava"]'::jsonb
    ),
    (
      'anatomie-foramen-jugulare',
      'N. hypoglossus (Hirnnerv XII)',
      '["N. hypoglossus (Hirnnerv XII)","N. glossopharyngeus (Hirnnerv IX)","N. vagus (Hirnnerv X)","N. accessorius (Hirnnerv XI)"]'::jsonb,
      'hypoglossal nerve (cranial nerve XII)',
      '["hypoglossal nerve (cranial nerve XII)","glossopharyngeal nerve (cranial nerve IX)","vagus nerve (cranial nerve X)","accessory nerve (cranial nerve XI)"]'::jsonb
    ),
    (
      'physiologie-glut4-insulin',
      'GLUT4',
      '["GLUT4 in Muskel- und Fettzellen","GLUT1","SGLT1","epithelialer Natriumkanal ENaC"]'::jsonb,
      'GLUT4',
      '["GLUT4 in muscle and adipose tissue","GLUT1","SGLT1","epithelial sodium channel ENaC"]'::jsonb
    ),
    (
      'pathologie-papillaeres-schilddruesenkarzinom',
      'Orphan-Annie-eye-Kerne',
      '["Orphan-Annie-eye-Kerne","Auerstaebchen","Russell-Koerperchen","Negri-Koerperchen"]'::jsonb,
      'Orphan Annie eye nuclei',
      '["Orphan Annie eye nuclei","Auer rods","Russell bodies","Negri bodies"]'::jsonb
    ),
    (
      'pathologie-verkaseungsnekrose-tuberkulose',
      'Tuberkulose',
      '["Tuberkulose","Morbus Crohn","Colitis ulcerosa","systemischer Lupus erythematodes (SLE)"]'::jsonb,
      'tuberculosis',
      '["tuberculosis","Crohn disease","ulcerative colitis","systemic lupus erythematosus (SLE)"]'::jsonb
    ),
    (
      'pharmakologie-warfarin-inr',
      'INR (International Normalized Ratio)',
      '["INR (International Normalized Ratio)","aPTT","Troponin","D-Dimer"]'::jsonb,
      'INR (international normalized ratio)',
      '["INR (international normalized ratio)","aPTT","troponin","D-dimer"]'::jsonb
    ),
    (
      'pharmakologie-schleifendiuretika-nkcc2',
      'Na-K-2Cl-Kotransporter NKCC2',
      '["Na-K-2Cl-Kotransporter NKCC2","epithelialer Natriumkanal ENaC","Na+/K+-ATPase","SGLT2"]'::jsonb,
      'Na-K-2Cl cotransporter NKCC2',
      '["Na-K-2Cl cotransporter NKCC2","epithelial sodium channel ENaC","Na+/K+-ATPase","SGLT2"]'::jsonb
    ),
    (
      'radiologie-fast-freie-fluessigkeit',
      'freie intraperitoneale oder perikardiale Fluessigkeit',
      '["freie intraperitoneale oder perikardiale Fluessigkeit","verminderte Knochendichte","Herzzeitvolumen per MRT","Hirnstammblutung"]'::jsonb,
      'free intraperitoneal or pericardial fluid',
      '["free intraperitoneal or pericardial fluid","reduced bone density","cardiac output by MRI","brainstem hemorrhage"]'::jsonb
    ),
    (
      'radiologie-subdural-crescent',
      'sichelfoermig entlang der Hemisphaerenkonvexitaet',
      '["sichelfoermig entlang der Hemisphaerenkonvexitaet","linsenfoermig bzw. bikonvex","ringfoermig","sternfoermig"]'::jsonb,
      'crescent-shaped along the cerebral convexity',
      '["crescent-shaped along the cerebral convexity","lens-shaped or biconvex","ring-shaped","star-shaped"]'::jsonb
    ),
    (
      'chirurgie-akute-gliedmassenischaemie-heparin',
      'sofortige systemische Heparinisierung',
      '["sofortige systemische Heparinisierung","hochdosiertes Insulin","langsame Eiseninfusion","nur orale Analgesie"]'::jsonb,
      'immediate systemic heparinization',
      '["immediate systemic heparinization","high-dose insulin","slow iron infusion","oral analgesia alone"]'::jsonb
    ),
    (
      'chirurgie-spannungspneumothorax-entlastung',
      'sofortige Nadeldekompression oder Entlastungspunktion',
      '["sofortige Nadeldekompression oder Entlastungspunktion","Abwarten auf das Roentgenbild","nur Analgesie","Spirometrie"]'::jsonb,
      'immediate needle decompression or pleural decompression',
      '["immediate needle decompression or pleural decompression","wait for chest radiography","analgesia alone","spirometry"]'::jsonb
    ),
    (
      'pharmakologie-naloxon-opioid',
      'Naloxon',
      '["Naloxon als Opioidantagonist","Flumazenil als Benzodiazepinantagonist","Atropin","N-Acetylcystein"]'::jsonb,
      'naloxone',
      '["naloxone as an opioid antagonist","flumazenil as a benzodiazepine antagonist","atropine","N-acetylcysteine"]'::jsonb
    ),
    (
      'genetik-marfan-fbn1',
      'FBN1-Gen (Fibrillin-1)',
      '["FBN1-Gen (Fibrillin-1)","COL1A1-Gen","DMD-Gen","CFTR-Gen"]'::jsonb,
      'FBN1 gene (fibrillin-1)',
      '["FBN1 gene (fibrillin-1)","COL1A1 gene","DMD gene","CFTR gene"]'::jsonb
    ),
    (
      'immunologie-c5a-chemotaxis',
      'C5a-Komplementfragment',
      '["C5a-Komplementfragment","C3b als Opsonin","C1q","Membranangriffskomplex (MAC)"]'::jsonb,
      'C5a complement fragment',
      '["C5a complement fragment","C3b as an opsonin","C1q","membrane attack complex (MAC)"]'::jsonb
    ),
    (
      'immunologie-hiv-cd4',
      'CD4-Rezeptor',
      '["CD4-Rezeptor","CD8-Rezeptor","CD16","CD20"]'::jsonb,
      'CD4 receptor',
      '["CD4 receptor","CD8 receptor","CD16","CD20"]'::jsonb
    )
)
update public.questions q
set correct_answer = r.correct_de,
    options = r.options_de,
    updated_at = now()
from revisions r
where q.slug = r.slug;

with revisions (
  slug,
  correct_en,
  options_en
) as (
  values
    (
      'pharmakologie-apixaban-faktor-xa',
      'activated factor X (factor Xa)',
      '["activated factor X (factor Xa)","thrombin (factor IIa)","factor VIII","fibrinogen"]'::jsonb
    ),
    (
      'immunologie-tlr4-lps',
      'Toll-like receptor 4 (TLR4)',
      '["Toll-like receptor 4 (TLR4)","Toll-like receptor 2 (TLR2)","Toll-like receptor 3 (TLR3)","Toll-like receptor 5 (TLR5)"]'::jsonb
    ),
    (
      'physiologie-beta1-herzfrequenz',
      'beta-1 adrenergic receptor',
      '["beta-1 adrenergic receptor","alpha-1 adrenergic receptor","beta-2 adrenergic receptor","muscarinic M2 receptor"]'::jsonb
    ),
    (
      'biochemie-ldl-cholesterintransport',
      'LDL (low-density lipoprotein)',
      '["LDL (low-density lipoprotein)","HDL (high-density lipoprotein)","chylomicron","albumin"]'::jsonb
    ),
    (
      'radiologie-hcc-arterielle-phase',
      'arterial contrast phase',
      '["arterial contrast phase","non-contrast phase","portal venous phase","delayed venous scan"]'::jsonb
    ),
    (
      'anatomie-testis-lymphabfluss',
      'paraaortic (lumbar) lymph nodes',
      '["paraaortic (lumbar) lymph nodes","inguinal lymph nodes","external iliac lymph nodes","axillary lymph nodes"]'::jsonb
    ),
    (
      'physiologie-adh-aquaporin2',
      'ADH (vasopressin)',
      '["ADH (vasopressin)","aldosterone","atrial natriuretic peptide (ANP)","renin"]'::jsonb
    ),
    (
      'biochemie-harnstoffzyklus-cps1',
      'carbamoyl phosphate synthetase I (CPS1)',
      '["carbamoyl phosphate synthetase I (CPS1)","arginase","ornithine transcarbamylase","pyruvate carboxylase"]'::jsonb
    ),
    (
      'biochemie-elektronentransport-coenzym-q',
      'coenzyme Q (ubiquinone)',
      '["coenzyme Q (ubiquinone)","cytochrome c","NADH","succinate"]'::jsonb
    ),
    (
      'immunologie-il5-eosinophile',
      'interleukin-5 (IL-5)',
      '["interleukin-5 (IL-5)","interleukin-2 (IL-2)","interleukin-10 (IL-10)","tumor necrosis factor alpha (TNF-alpha)"]'::jsonb
    ),
    (
      'genetik-turner-45x',
      'monosomy X (45,X)',
      '["monosomy X (45,X)","trisomy 21 (47,XX,+21 or 47,XY,+21)","Klinefelter karyotype (47,XXY)","normal male karyotype (46,XY)"]'::jsonb
    ),
    (
      'genetik-huntington-cag',
      'CAG repeat',
      '["CAG repeat","CGG repeat","CTG repeat","GAA repeat"]'::jsonb
    ),
    (
      'radiologie-sah-nativ-ct',
      'non-contrast head CT',
      '["non-contrast head CT","pituitary MRI","abdominal ultrasound","chest radiograph"]'::jsonb
    ),
    (
      'anatomie-ductus-thoracicus-venenwinkel',
      'left venous angle (junction of left internal jugular and left subclavian vein)',
      '["left venous angle (junction of left internal jugular and left subclavian vein)","right venous angle","superior vena cava","azygos vein"]'::jsonb
    ),
    (
      'anatomie-hiatus-aorticus-t12',
      'T12 at the aortic hiatus',
      '["T12 at the aortic hiatus","T8 at the caval opening","T10 at the esophageal hiatus","L1"]'::jsonb
    ),
    (
      'anatomie-ligamentum-hepatoduodenale',
      'portal vein as part of the portal triad',
      '["portal vein as part of the portal triad","hepatic vein","superior mesenteric artery","inferior vena cava"]'::jsonb
    ),
    (
      'anatomie-foramen-jugulare',
      'hypoglossal nerve (cranial nerve XII)',
      '["hypoglossal nerve (cranial nerve XII)","glossopharyngeal nerve (cranial nerve IX)","vagus nerve (cranial nerve X)","accessory nerve (cranial nerve XI)"]'::jsonb
    ),
    (
      'physiologie-glut4-insulin',
      'GLUT4',
      '["GLUT4 in muscle and adipose tissue","GLUT1","SGLT1","epithelial sodium channel ENaC"]'::jsonb
    ),
    (
      'pathologie-papillaeres-schilddruesenkarzinom',
      'Orphan Annie eye nuclei',
      '["Orphan Annie eye nuclei","Auer rods","Russell bodies","Negri bodies"]'::jsonb
    ),
    (
      'pathologie-verkaseungsnekrose-tuberkulose',
      'tuberculosis',
      '["tuberculosis","Crohn disease","ulcerative colitis","systemic lupus erythematosus (SLE)"]'::jsonb
    ),
    (
      'pharmakologie-warfarin-inr',
      'INR (international normalized ratio)',
      '["INR (international normalized ratio)","aPTT","troponin","D-dimer"]'::jsonb
    ),
    (
      'pharmakologie-schleifendiuretika-nkcc2',
      'Na-K-2Cl cotransporter NKCC2',
      '["Na-K-2Cl cotransporter NKCC2","epithelial sodium channel ENaC","Na+/K+-ATPase","SGLT2"]'::jsonb
    ),
    (
      'radiologie-fast-freie-fluessigkeit',
      'free intraperitoneal or pericardial fluid',
      '["free intraperitoneal or pericardial fluid","reduced bone density","cardiac output by MRI","brainstem hemorrhage"]'::jsonb
    ),
    (
      'radiologie-subdural-crescent',
      'crescent-shaped along the cerebral convexity',
      '["crescent-shaped along the cerebral convexity","lens-shaped or biconvex","ring-shaped","star-shaped"]'::jsonb
    ),
    (
      'chirurgie-akute-gliedmassenischaemie-heparin',
      'immediate systemic heparinization',
      '["immediate systemic heparinization","high-dose insulin","slow iron infusion","oral analgesia alone"]'::jsonb
    ),
    (
      'chirurgie-spannungspneumothorax-entlastung',
      'immediate needle decompression or pleural decompression',
      '["immediate needle decompression or pleural decompression","wait for chest radiography","analgesia alone","spirometry"]'::jsonb
    ),
    (
      'pharmakologie-naloxon-opioid',
      'naloxone',
      '["naloxone as an opioid antagonist","flumazenil as a benzodiazepine antagonist","atropine","N-acetylcysteine"]'::jsonb
    ),
    (
      'genetik-marfan-fbn1',
      'FBN1 gene (fibrillin-1)',
      '["FBN1 gene (fibrillin-1)","COL1A1 gene","DMD gene","CFTR gene"]'::jsonb
    ),
    (
      'immunologie-c5a-chemotaxis',
      'C5a complement fragment',
      '["C5a complement fragment","C3b as an opsonin","C1q","membrane attack complex (MAC)"]'::jsonb
    ),
    (
      'immunologie-hiv-cd4',
      'CD4 receptor',
      '["CD4 receptor","CD8 receptor","CD16","CD20"]'::jsonb
    )
)
update public.question_translations qt
set correct_answer = r.correct_en,
    options = r.options_en,
    updated_at = now()
from revisions r
join public.questions q on q.slug = r.slug
where qt.question_id = q.id
  and qt.language = 'en';
