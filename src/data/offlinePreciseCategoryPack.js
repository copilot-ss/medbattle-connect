const PRECISE_CATEGORY_PACK_ROWS = [
  // Anatomie
  {
    id: 'seed-praezise-anatomie-01',
    category: 'Anatomie',
    de: {
      question:
        'Welche Kehlkopfmuskeln werden primär vom N. laryngeus recurrens innerviert?',
      options: [
        'Fast alle inneren Kehlkopfmuskeln außer dem M. cricothyroideus',
        'Nur der M. cricothyroideus',
        'Nur die suprahyalen Muskeln',
        'Die Schlundmuskulatur des Ösophagus',
      ],
      correct_answer:
        'Fast alle inneren Kehlkopfmuskeln außer dem M. cricothyroideus',
      explanation:
        'Der N. laryngeus recurrens innerviert fast alle inneren Kehlkopfmuskeln motorisch. Der M. cricothyroideus wird dagegen vom N. laryngeus superior versorgt.',
    },
    en: {
      question:
        'Which laryngeal muscles are primarily innervated by the recurrent laryngeal nerve?',
      options: [
        'Almost all intrinsic laryngeal muscles except the cricothyroid muscle',
        'Only the cricothyroid muscle',
        'Only the suprahyoid muscles',
        'The pharyngeal muscles of the esophagus',
      ],
      correct_answer:
        'Almost all intrinsic laryngeal muscles except the cricothyroid muscle',
      explanation:
        'The recurrent laryngeal nerve supplies almost all intrinsic laryngeal muscles. The cricothyroid muscle is instead innervated by the superior laryngeal nerve.',
    },
  },
  {
    id: 'seed-praezise-anatomie-02',
    category: 'Anatomie',
    de: {
      question:
        'Welcher Muskel initiiert die ersten Grade der Armabduktion im Schultergelenk?',
      options: [
        'M. supraspinatus',
        'M. deltoideus',
        'M. infraspinatus',
        'M. subscapularis',
      ],
      correct_answer: 'M. supraspinatus',
      explanation:
        'Der M. supraspinatus startet die Armabduktion. Danach übernimmt der M. deltoideus den größeren Bewegungsanteil.',
    },
    en: {
      question:
        'Which muscle initiates the first degrees of arm abduction at the shoulder joint?',
      options: [
        'Supraspinatus muscle',
        'Deltoid muscle',
        'Infraspinatus muscle',
        'Subscapularis muscle',
      ],
      correct_answer: 'Supraspinatus muscle',
      explanation:
        'The supraspinatus initiates arm abduction. The deltoid then takes over the larger share of the movement.',
    },
  },
  {
    id: 'seed-praezise-anatomie-03',
    category: 'Anatomie',
    de: {
      question: 'In welchen Venenwinkel mündet der Ductus thoracicus typischerweise?',
      options: [
        'Linker Venenwinkel',
        'Rechter Venenwinkel',
        'V. cava superior',
        'V. azygos',
      ],
      correct_answer: 'Linker Venenwinkel',
      explanation:
        'Der Ductus thoracicus endet typischerweise am linken Venenwinkel, also am Übergang von V. jugularis interna sinistra und V. subclavia sinistra.',
    },
    en: {
      question: 'Into which venous angle does the thoracic duct typically drain?',
      options: [
        'Left venous angle',
        'Right venous angle',
        'Superior vena cava',
        'Azygos vein',
      ],
      correct_answer: 'Left venous angle',
      explanation:
        'The thoracic duct typically drains into the left venous angle, where the left internal jugular and left subclavian veins join.',
    },
  },
  {
    id: 'seed-praezise-anatomie-04',
    category: 'Anatomie',
    de: {
      question: 'Auf welcher Höhe durchtritt die Aorta typischerweise das Zwerchfell?',
      options: ['Th12', 'Th8', 'Th10', 'L1'],
      correct_answer: 'Th12',
      explanation:
        'Die Aorta zieht durch den Hiatus aorticus auf Höhe Th12. Die klassischen Zwerchfellöffnungen lauten vereinfacht Th8, Th10 und Th12.',
    },
    en: {
      question: 'At which vertebral level does the aorta typically pass through the diaphragm?',
      options: ['T12', 'T8', 'T10', 'L1'],
      correct_answer: 'T12',
      explanation:
        'The aorta passes through the aortic hiatus at T12. The classic diaphragm opening levels are remembered as T8, T10, and T12.',
    },
  },
  {
    id: 'seed-praezise-anatomie-05',
    category: 'Anatomie',
    de: {
      question: 'Welche Struktur gehört zum Inhalt des Ligamentum hepatoduodenale?',
      options: [
        'V. portae',
        'V. hepatica',
        'A. mesenterica superior',
        'V. cava inferior',
      ],
      correct_answer: 'V. portae',
      explanation:
        'Im Ligamentum hepatoduodenale verläuft die Portal-Trias aus V. portae, A. hepatica propria und Ductus choledochus.',
    },
    en: {
      question: 'Which structure is part of the hepatoduodenal ligament?',
      options: [
        'Portal vein',
        'Hepatic vein',
        'Superior mesenteric artery',
        'Inferior vena cava',
      ],
      correct_answer: 'Portal vein',
      explanation:
        'The hepatoduodenal ligament contains the portal triad: portal vein, proper hepatic artery, and common bile duct.',
    },
  },
  {
    id: 'seed-praezise-anatomie-06',
    category: 'Anatomie',
    de: {
      question: 'Welcher Hirnnerv zieht nicht durch das Foramen jugulare?',
      options: [
        'N. hypoglossus',
        'N. glossopharyngeus',
        'N. vagus',
        'N. accessorius',
      ],
      correct_answer: 'N. hypoglossus',
      explanation:
        'Durch das Foramen jugulare ziehen die Hirnnerven IX, X und XI. Der N. hypoglossus verläuft durch den Canalis nervi hypoglossi.',
    },
    en: {
      question: 'Which cranial nerve does not pass through the jugular foramen?',
      options: [
        'Hypoglossal nerve',
        'Glossopharyngeal nerve',
        'Vagus nerve',
        'Accessory nerve',
      ],
      correct_answer: 'Hypoglossal nerve',
      explanation:
        'Cranial nerves IX, X, and XI pass through the jugular foramen. The hypoglossal nerve travels through the hypoglossal canal.',
    },
  },

  // Physiologie
  {
    id: 'seed-praezise-physiologie-01',
    category: 'Physiologie',
    de: {
      question:
        'Welche Größe registriert die Macula densa für das tubuloglomeruläre Feedback besonders?',
      options: [
        'NaCl-Konzentration im distalen Tubulus',
        'Sauerstoffpartialdruck im Sammelrohr',
        'Albuminkonzentration in Bowman-Kapsel',
        'Kalziumspiegel im proximalen Tubulus',
      ],
      correct_answer: 'NaCl-Konzentration im distalen Tubulus',
      explanation:
        'Die Macula densa misst vor allem die Natriumchloridbeladung im distalen Tubulus. Darüber beeinflusst sie den Tonus der afferenten Arteriole.',
    },
    en: {
      question:
        'Which variable is especially sensed by the macula densa for tubuloglomerular feedback?',
      options: [
        'NaCl concentration in the distal tubule',
        'Oxygen partial pressure in the collecting duct',
        'Albumin concentration in Bowman space',
        'Calcium level in the proximal tubule',
      ],
      correct_answer: 'NaCl concentration in the distal tubule',
      explanation:
        'The macula densa mainly senses sodium chloride delivery in the distal tubule. This signal adjusts afferent arteriolar tone.',
    },
  },
  {
    id: 'seed-praezise-physiologie-02',
    category: 'Physiologie',
    de: {
      question:
        'Welche direkte Folge beschreibt den Frank-Starling-Mechanismus des Herzens am besten?',
      options: [
        'Mehr enddiastolische Füllung erhöht das Schlagvolumen',
        'Höhere Herzfrequenz senkt das Schlagvolumen immer',
        'Verminderte Nachlast reduziert die Kontraktilität direkt',
        'Mehr Sympathikus senkt die Vorlast',
      ],
      correct_answer: 'Mehr enddiastolische Füllung erhöht das Schlagvolumen',
      explanation:
        'Eine größere enddiastolische Dehnung führt zu einer kräftigeren Kontraktion. Deshalb steigt bei höherer Vorlast das Schlagvolumen.',
    },
    en: {
      question:
        'Which direct consequence best describes the Frank-Starling mechanism of the heart?',
      options: [
        'Greater end-diastolic filling increases stroke volume',
        'Higher heart rate always lowers stroke volume',
        'Reduced afterload directly lowers contractility',
        'More sympathetic tone lowers preload',
      ],
      correct_answer: 'Greater end-diastolic filling increases stroke volume',
      explanation:
        'Greater end-diastolic stretch leads to a stronger contraction. That is why higher preload increases stroke volume.',
    },
  },
  {
    id: 'seed-praezise-physiologie-03',
    category: 'Physiologie',
    de: {
      question:
        'Welche Veränderung verschiebt die Sauerstoffbindungskurve des Hämoglobins im Sinne des Bohr-Effekts nach rechts?',
      options: [
        'Anstieg von CO2 und H+-Konzentration',
        'Abfall der Temperatur',
        'Abnahme von 2,3-BPG',
        'Alkalose',
      ],
      correct_answer: 'Anstieg von CO2 und H+-Konzentration',
      explanation:
        'Mehr CO2 und mehr Protonen senken die Sauerstoffaffinität des Hämoglobins und verschieben die Kurve nach rechts. Das erleichtert die O2-Abgabe im Gewebe.',
    },
    en: {
      question:
        'Which change shifts the hemoglobin oxygen dissociation curve to the right through the Bohr effect?',
      options: [
        'Increase in CO2 and hydrogen ion concentration',
        'Decrease in temperature',
        'Decrease in 2,3-BPG',
        'Alkalosis',
      ],
      correct_answer: 'Increase in CO2 and hydrogen ion concentration',
      explanation:
        'More CO2 and more protons reduce hemoglobin oxygen affinity and shift the curve to the right. This facilitates oxygen unloading in tissue.',
    },
  },
  {
    id: 'seed-praezise-physiologie-04',
    category: 'Physiologie',
    de: {
      question: 'Welche Wirkung hat ADH über den V2-Rezeptor in den Hauptzellen des Sammelrohrs?',
      options: [
        'Einbau von Aquaporin-2 in die apikale Membran',
        'Hemmung der Harnstoffresorption',
        'Blockade von ENaC',
        'Verminderte Wasserpermeabilität',
      ],
      correct_answer: 'Einbau von Aquaporin-2 in die apikale Membran',
      explanation:
        'ADH aktiviert über den V2-Rezeptor cAMP und führt zum Einbau von Aquaporin-2. Dadurch steigt die Wasserpermeabilität des Sammelrohrs.',
    },
    en: {
      question: 'What effect does ADH exert through the V2 receptor in principal cells of the collecting duct?',
      options: [
        'Insertion of aquaporin-2 into the apical membrane',
        'Inhibition of urea reabsorption',
        'Blockade of ENaC',
        'Reduced water permeability',
      ],
      correct_answer: 'Insertion of aquaporin-2 into the apical membrane',
      explanation:
        'ADH activates cAMP through the V2 receptor and inserts aquaporin-2 into the apical membrane. This increases water permeability.',
    },
  },
  {
    id: 'seed-praezise-physiologie-05',
    category: 'Physiologie',
    de: {
      question:
        'Welche Wirkung hat Parathormon auf die renale Phosphatrückresorption im proximalen Tubulus?',
      options: [
        'Sie nimmt ab',
        'Sie nimmt zu',
        'Sie bleibt unverändert',
        'Sie wird nur nachts gesteigert',
      ],
      correct_answer: 'Sie nimmt ab',
      explanation:
        'Parathormon hemmt Natrium-Phosphat-Kotransporter im proximalen Tubulus. Dadurch sinkt die Phosphatrückresorption und die Phosphatausscheidung steigt.',
    },
    en: {
      question:
        'What effect does parathyroid hormone have on renal phosphate reabsorption in the proximal tubule?',
      options: [
        'It decreases',
        'It increases',
        'It stays unchanged',
        'It increases only at night',
      ],
      correct_answer: 'It decreases',
      explanation:
        'Parathyroid hormone inhibits sodium-phosphate cotransporters in the proximal tubule. As a result, phosphate reabsorption falls.',
    },
  },
  {
    id: 'seed-praezise-physiologie-06',
    category: 'Physiologie',
    de: {
      question:
        'Welcher Transporter wird in Muskel- und Fettzellen durch Insulin vermehrt an die Zellmembran gebracht?',
      options: ['GLUT4', 'GLUT1', 'SGLT1', 'ENaC'],
      correct_answer: 'GLUT4',
      explanation:
        'Insulin fördert in Muskel- und Fettzellen die Translokation von GLUT4 an die Zellmembran. Dadurch steigt die Glukoseaufnahme.',
    },
    en: {
      question:
        'Which transporter is translocated to the cell membrane in muscle and fat cells by insulin?',
      options: ['GLUT4', 'GLUT1', 'SGLT1', 'ENaC'],
      correct_answer: 'GLUT4',
      explanation:
        'Insulin promotes GLUT4 translocation to the cell membrane in muscle and fat cells. This increases glucose uptake.',
    },
  },

  // Pathologie
  {
    id: 'seed-praezise-pathologie-01',
    category: 'Pathologie',
    de: {
      question:
        'Welcher histologische Befund ist für eine rasch progrediente Glomerulonephritis charakteristisch?',
      options: [
        'Halbmondbildungen in Bowman-Kapseln',
        'Mesangiale Amyloidablagerungen',
        'Ausschließlich hyaline Arteriolosklerose',
        'Papillennekrosen im Nierenbecken',
      ],
      correct_answer: 'Halbmondbildungen in Bowman-Kapseln',
      explanation:
        'Die rasch progrediente Glomerulonephritis zeigt typischerweise Halbmondbildungen aus proliferierenden Zellen und Fibrin in Bowman-Kapseln.',
    },
    en: {
      question:
        'Which histologic finding is characteristic of rapidly progressive glomerulonephritis?',
      options: [
        'Crescent formation in Bowman capsules',
        'Mesangial amyloid deposits',
        'Exclusively hyaline arteriolosclerosis',
        'Papillary necrosis in the renal pelvis',
      ],
      correct_answer: 'Crescent formation in Bowman capsules',
      explanation:
        'Rapidly progressive glomerulonephritis classically shows crescents formed by proliferating cells and fibrin in Bowman capsules.',
    },
  },
  {
    id: 'seed-praezise-pathologie-02',
    category: 'Pathologie',
    de: {
      question: 'Welche metaplastische Veränderung kennzeichnet den Barrett-Ösophagus?',
      options: [
        'Intestinale Metaplasie mit Becherzellen',
        'Plattenepithelhyperplasie ohne Zellwandel',
        'Verkalkung der Submukosa',
        'Dysplasie des Muskelgewebes',
      ],
      correct_answer: 'Intestinale Metaplasie mit Becherzellen',
      explanation:
        'Beim Barrett-Ösophagus wird das normale Plattenepithel durch intestinal geprägtes Zylinderepithel mit Becherzellen ersetzt.',
    },
    en: {
      question: 'Which metaplastic change characterizes Barrett esophagus?',
      options: [
        'Intestinal metaplasia with goblet cells',
        'Squamous hyperplasia without lineage change',
        'Submucosal calcification',
        'Dysplasia of muscle tissue',
      ],
      correct_answer: 'Intestinal metaplasia with goblet cells',
      explanation:
        'In Barrett esophagus, normal squamous epithelium is replaced by intestinal-type columnar epithelium with goblet cells.',
    },
  },
  {
    id: 'seed-praezise-pathologie-03',
    category: 'Pathologie',
    de: {
      question: 'Welcher Zellkernbefund ist für das papilläre Schilddrüsenkarzinom klassisch?',
      options: [
        'Orphan-Annie-eye-Kerne',
        'Auerstäbchen',
        'Russell-Körperchen',
        'Negri-Körperchen',
      ],
      correct_answer: 'Orphan-Annie-eye-Kerne',
      explanation:
        'Das papilläre Schilddrüsenkarzinom zeigt typische optisch aufgehellte Kerne, die als Orphan-Annie-eye-Kerne beschrieben werden.',
    },
    en: {
      question: 'Which nuclear finding is classic for papillary thyroid carcinoma?',
      options: [
        'Orphan Annie eye nuclei',
        'Auer rods',
        'Russell bodies',
        'Negri bodies',
      ],
      correct_answer: 'Orphan Annie eye nuclei',
      explanation:
        'Papillary thyroid carcinoma characteristically shows optically clear nuclei known as Orphan Annie eye nuclei.',
    },
  },
  {
    id: 'seed-praezise-pathologie-04',
    category: 'Pathologie',
    de: {
      question:
        'Welches Emphysem-Muster passt am ehesten zu einem Alpha-1-Antitrypsin-Mangel?',
      options: [
        'Panazinäres Emphysem der Unterlappen',
        'Zentrolobuläres Emphysem der Oberlappen',
        'Paraseptales Emphysem nur apikal',
        'Bullae ausschließlich im Mittellappen',
      ],
      correct_answer: 'Panazinäres Emphysem der Unterlappen',
      explanation:
        'Beim Alpha-1-Antitrypsin-Mangel entsteht typischerweise ein panazinäres Emphysem, besonders in den Unterlappen.',
    },
    en: {
      question:
        'Which emphysema pattern best fits alpha-1 antitrypsin deficiency?',
      options: [
        'Panacinar emphysema of the lower lobes',
        'Centrilobular emphysema of the upper lobes',
        'Paraseptal emphysema only at the apex',
        'Bullae exclusively in the middle lobe',
      ],
      correct_answer: 'Panacinar emphysema of the lower lobes',
      explanation:
        'Alpha-1 antitrypsin deficiency typically causes panacinar emphysema, especially in the lower lobes.',
    },
  },

  // Mikrobiologie
  {
    id: 'seed-praezise-mikrobiologie-01',
    category: 'Mikrobiologie',
    de: {
      question:
        'Welcher Erreger ist klassischerweise oxidasepositiv und bildet häufig blaugrüne Pigmente?',
      options: [
        'Pseudomonas aeruginosa',
        'Escherichia coli',
        'Klebsiella pneumoniae',
        'Shigella sonnei',
      ],
      correct_answer: 'Pseudomonas aeruginosa',
      explanation:
        'Pseudomonas aeruginosa ist oxidasepositiv und kann Pigmente wie Pyocyanin bilden, die eine blaugrüne Färbung verursachen.',
    },
    en: {
      question:
        'Which pathogen is classically oxidase positive and often produces blue-green pigments?',
      options: [
        'Pseudomonas aeruginosa',
        'Escherichia coli',
        'Klebsiella pneumoniae',
        'Shigella sonnei',
      ],
      correct_answer: 'Pseudomonas aeruginosa',
      explanation:
        'Pseudomonas aeruginosa is oxidase positive and can produce pigments such as pyocyanin that create a blue-green color.',
    },
  },
  {
    id: 'seed-praezise-mikrobiologie-02',
    category: 'Mikrobiologie',
    de: {
      question:
        'Mit welchem malignen Krankheitsbild ist eine Streptococcus gallolyticus-Bakteriämie besonders assoziiert?',
      options: [
        'Kolonkarzinom',
        'Nierenzellkarzinom',
        'Schilddrüsenkarzinom',
        'Hepatozelluläres Karzinom',
      ],
      correct_answer: 'Kolonkarzinom',
      explanation:
        'Streptococcus gallolyticus, früher S. bovis, ist klassisch mit Kolonneoplasien assoziiert. Deshalb sollte bei einer solchen Bakteriämie gezielt danach gesucht werden.',
    },
    en: {
      question:
        'Streptococcus gallolyticus bacteremia is especially associated with which malignancy?',
      options: [
        'Colorectal carcinoma',
        'Renal cell carcinoma',
        'Thyroid carcinoma',
        'Hepatocellular carcinoma',
      ],
      correct_answer: 'Colorectal carcinoma',
      explanation:
        'Streptococcus gallolyticus, formerly S. bovis, is classically associated with colorectal neoplasia.',
    },
  },
  {
    id: 'seed-praezise-mikrobiologie-03',
    category: 'Mikrobiologie',
    de: {
      question:
        'Welcher Erreger besitzt keine Zellwand und ist deshalb gegen Beta-Laktam-Antibiotika intrinsisch unempfindlich?',
      options: [
        'Mycoplasma pneumoniae',
        'Streptococcus pneumoniae',
        'Listeria monocytogenes',
        'Corynebacterium diphtheriae',
      ],
      correct_answer: 'Mycoplasma pneumoniae',
      explanation:
        'Mykoplasmen besitzen keine Peptidoglykan-Zellwand. Deshalb wirken Beta-Laktam-Antibiotika gegen sie nicht.',
    },
    en: {
      question:
        'Which pathogen lacks a cell wall and is therefore intrinsically resistant to beta-lactam antibiotics?',
      options: [
        'Mycoplasma pneumoniae',
        'Streptococcus pneumoniae',
        'Listeria monocytogenes',
        'Corynebacterium diphtheriae',
      ],
      correct_answer: 'Mycoplasma pneumoniae',
      explanation:
        'Mycoplasmas have no peptidoglycan cell wall. That is why beta-lactam antibiotics do not work against them.',
    },
  },
  {
    id: 'seed-praezise-mikrobiologie-04',
    category: 'Mikrobiologie',
    de: {
      question:
        'Welcher Influenzatyp besitzt ein segmentiertes Genom und kann dadurch Antigen-Shift zeigen?',
      options: ['Influenza-A-Virus', 'Rhinovirus', 'Adenovirus', 'Parvovirus B19'],
      correct_answer: 'Influenza-A-Virus',
      explanation:
        'Das Influenza-A-Virus besitzt ein segmentiertes RNA-Genom. Reassortment zwischen Segmenten kann zu Antigen-Shift führen.',
    },
    en: {
      question:
        'Which influenza type has a segmented genome and can therefore undergo antigenic shift?',
      options: ['Influenza A virus', 'Rhinovirus', 'Adenovirus', 'Parvovirus B19'],
      correct_answer: 'Influenza A virus',
      explanation:
        'Influenza A virus has a segmented RNA genome. Reassortment between segments can produce antigenic shift.',
    },
  },
  {
    id: 'seed-praezise-mikrobiologie-05',
    category: 'Mikrobiologie',
    de: {
      question:
        'Welcher Erreger ist typisch für eine pseudomembranöse Kolitis nach Antibiotikatherapie?',
      options: [
        'Clostridioides difficile',
        'Bacteroides fragilis',
        'Helicobacter pylori',
        'Campylobacter jejuni',
      ],
      correct_answer: 'Clostridioides difficile',
      explanation:
        'Clostridioides difficile kann nach Antibiotikagabe die Darmflora verdrängen und eine toxische pseudomembranöse Kolitis auslösen.',
    },
    en: {
      question:
        'Which pathogen is typical of pseudomembranous colitis after antibiotic therapy?',
      options: [
        'Clostridioides difficile',
        'Bacteroides fragilis',
        'Helicobacter pylori',
        'Campylobacter jejuni',
      ],
      correct_answer: 'Clostridioides difficile',
      explanation:
        'Clostridioides difficile can overgrow after antibiotics disrupt the normal gut flora and cause pseudomembranous colitis.',
    },
  },
  {
    id: 'seed-praezise-mikrobiologie-06',
    category: 'Mikrobiologie',
    de: {
      question:
        'Welcher Virulenzfaktor ist für invasive Erkrankungen durch Streptococcus pneumoniae am wichtigsten?',
      options: [
        'Polysaccharidkapsel',
        'Flagellen',
        'Endosporen',
        'Lipopolysaccharid',
      ],
      correct_answer: 'Polysaccharidkapsel',
      explanation:
        'Die Polysaccharidkapsel schützt Pneumokokken vor Phagozytose und ist der entscheidende Virulenzfaktor für invasive Infektionen.',
    },
    en: {
      question:
        'Which virulence factor is most important for invasive disease caused by Streptococcus pneumoniae?',
      options: [
        'Polysaccharide capsule',
        'Flagella',
        'Endospores',
        'Lipopolysaccharide',
      ],
      correct_answer: 'Polysaccharide capsule',
      explanation:
        'The polysaccharide capsule protects pneumococci from phagocytosis and is the key virulence factor for invasive infection.',
    },
  },
  {
    id: 'seed-praezise-mikrobiologie-07',
    category: 'Mikrobiologie',
    de: {
      question:
        'Auf welchem Spezialmedium wird Legionella pneumophila klassischerweise kultiviert?',
      options: ['BCYE-Agar', 'MacConkey-Agar', 'Sabouraud-Agar', 'Lowenstein-Jensen-Agar'],
      correct_answer: 'BCYE-Agar',
      explanation:
        'Legionella pneumophila wird klassischerweise auf Buffered Charcoal Yeast Extract, also BCYE-Agar, kultiviert.',
    },
    en: {
      question:
        'On which special medium is Legionella pneumophila classically cultured?',
      options: [
        'BCYE agar',
        'MacConkey agar',
        'Sabouraud agar',
        'Lowenstein-Jensen agar',
      ],
      correct_answer: 'BCYE agar',
      explanation:
        'Legionella pneumophila is classically cultured on buffered charcoal yeast extract, or BCYE agar.',
    },
  },

  // Pharmakologie
  {
    id: 'seed-praezise-pharmakologie-01',
    category: 'Pharmakologie',
    de: {
      question:
        'Welcher Laborwert wird zur Therapiekontrolle unter Warfarin typischerweise verwendet?',
      options: ['INR', 'aPTT', 'Troponin', 'D-Dimer'],
      correct_answer: 'INR',
      explanation:
        'Warfarin beeinflusst die Vitamin-K-abhängige Gerinnung und wird klinisch über die Prothrombinzeit bzw. den INR-Wert kontrolliert.',
    },
    en: {
      question:
        'Which laboratory value is typically used to monitor warfarin therapy?',
      options: ['INR', 'aPTT', 'Troponin', 'D-dimer'],
      correct_answer: 'INR',
      explanation:
        'Warfarin affects vitamin K-dependent clotting factor synthesis and is monitored clinically with the INR.',
    },
  },
  {
    id: 'seed-praezise-pharmakologie-02',
    category: 'Pharmakologie',
    de: {
      question:
        'Welches Antidot neutralisiert unfraktioniertes Heparin am direktesten?',
      options: ['Protamin', 'Vitamin K', 'Idarucizumab', 'Atropin'],
      correct_answer: 'Protamin',
      explanation:
        'Protamin bindet an Heparin und neutralisiert dessen antikoagulatorische Wirkung. Es ist das klassische Antidot für unfraktioniertes Heparin.',
    },
    en: {
      question:
        'Which antidote most directly neutralizes unfractionated heparin?',
      options: ['Protamine', 'Vitamin K', 'Idarucizumab', 'Atropine'],
      correct_answer: 'Protamine',
      explanation:
        'Protamine binds heparin and neutralizes its anticoagulant effect. It is the classic reversal agent for unfractionated heparin.',
    },
  },
  {
    id: 'seed-praezise-pharmakologie-03',
    category: 'Pharmakologie',
    de: {
      question:
        'Welchen Transporter hemmen Schleifendiuretika im dicken aufsteigenden Teil der Henle-Schleife?',
      options: ['NKCC2', 'ENaC', 'Na+/K+-ATPase', 'SGLT2'],
      correct_answer: 'NKCC2',
      explanation:
        'Schleifendiuretika blockieren den Na-K-2Cl-Kotransporter NKCC2 im dicken aufsteigenden Ast und steigern dadurch die Diurese.',
    },
    en: {
      question:
        'Which transporter is inhibited by loop diuretics in the thick ascending limb of the loop of Henle?',
      options: ['NKCC2', 'ENaC', 'Na+/K+-ATPase', 'SGLT2'],
      correct_answer: 'NKCC2',
      explanation:
        'Loop diuretics block the Na-K-2Cl cotransporter NKCC2 in the thick ascending limb and thereby increase diuresis.',
    },
  },
  {
    id: 'seed-praezise-pharmakologie-04',
    category: 'Pharmakologie',
    de: {
      question: 'An welche ribosomale Zielstruktur binden Makrolide primär?',
      options: [
        '50S-Untereinheit',
        '30S-Untereinheit',
        'DNA-Gyrase',
        'Peptidoglykan',
      ],
      correct_answer: '50S-Untereinheit',
      explanation:
        'Makrolide binden an die 50S-Untereinheit bakterieller Ribosomen und hemmen dadurch die Proteinsynthese.',
    },
    en: {
      question: 'Which ribosomal target structure do macrolides primarily bind?',
      options: ['50S subunit', '30S subunit', 'DNA gyrase', 'Peptidoglycan'],
      correct_answer: '50S subunit',
      explanation:
        'Macrolides bind the 50S bacterial ribosomal subunit and inhibit protein synthesis.',
    },
  },
  {
    id: 'seed-praezise-pharmakologie-05',
    category: 'Pharmakologie',
    de: {
      question:
        'Welche gefürchtete Komplikation erklärt die Vorsicht mit Metformin bei schwerer Niereninsuffizienz?',
      options: [
        'Laktatazidose',
        'Agranuzytose',
        'Rhabdomyolyse',
        'Aplastische Anämie',
      ],
      correct_answer: 'Laktatazidose',
      explanation:
        'Metformin kann sich bei schwer eingeschränkter Nierenfunktion anreichern und das Risiko einer Laktatazidose erhöhen.',
    },
    en: {
      question:
        'Which feared complication explains the caution with metformin in severe renal impairment?',
      options: [
        'Lactic acidosis',
        'Agranulocytosis',
        'Rhabdomyolysis',
        'Aplastic anemia',
      ],
      correct_answer: 'Lactic acidosis',
      explanation:
        'Metformin can accumulate in severe renal impairment and increase the risk of lactic acidosis.',
    },
  },
  {
    id: 'seed-praezise-pharmakologie-06',
    category: 'Pharmakologie',
    de: {
      question: 'Welche Rezeptorfamilie wird durch Atropin kompetitiv blockiert?',
      options: [
        'Muskarinische Acetylcholinrezeptoren',
        'Nikotinische Acetylcholinrezeptoren',
        'Beta-2-Rezeptoren',
        'Dopamin-D2-Rezeptoren',
      ],
      correct_answer: 'Muskarinische Acetylcholinrezeptoren',
      explanation:
        'Atropin wirkt als kompetitiver Antagonist an muskarinischen Acetylcholinrezeptoren und hemmt damit parasympathische Effekte.',
    },
    en: {
      question: 'Which receptor family is competitively blocked by atropine?',
      options: [
        'Muscarinic acetylcholine receptors',
        'Nicotinic acetylcholine receptors',
        'Beta-2 receptors',
        'Dopamine D2 receptors',
      ],
      correct_answer: 'Muscarinic acetylcholine receptors',
      explanation:
        'Atropine acts as a competitive antagonist at muscarinic acetylcholine receptors and suppresses parasympathetic effects.',
    },
  },

  // Biochemie
  {
    id: 'seed-praezise-biochemie-01',
    category: 'Biochemie',
    de: {
      question:
        'Welcher Vitaminmangel beeinträchtigt den Pyruvatdehydrogenase-Komplex besonders?',
      options: [
        'Vitamin-B1-Mangel',
        'Vitamin-B12-Mangel',
        'Vitamin-C-Mangel',
        'Vitamin-D-Mangel',
      ],
      correct_answer: 'Vitamin-B1-Mangel',
      explanation:
        'Der Pyruvatdehydrogenase-Komplex benötigt Thiaminpyrophosphat als Kofaktor. Deshalb stört ein Vitamin-B1-Mangel diesen Schritt.',
    },
    en: {
      question:
        'Deficiency of which vitamin particularly impairs the pyruvate dehydrogenase complex?',
      options: [
        'Vitamin B1 deficiency',
        'Vitamin B12 deficiency',
        'Vitamin C deficiency',
        'Vitamin D deficiency',
      ],
      correct_answer: 'Vitamin B1 deficiency',
      explanation:
        'The pyruvate dehydrogenase complex requires thiamine pyrophosphate as a cofactor. Vitamin B1 deficiency therefore impairs this step.',
    },
  },
  {
    id: 'seed-praezise-biochemie-02',
    category: 'Biochemie',
    de: {
      question:
        'Welches Molekül wird in der Reaktion der Glukose-6-Phosphat-Dehydrogenase direkt gebildet?',
      options: ['NADPH', 'FADH2', 'ATP', 'Acetyl-CoA'],
      correct_answer: 'NADPH',
      explanation:
        'Die Glukose-6-Phosphat-Dehydrogenase erzeugt im Pentosephosphatweg NADPH. Dieses Reduktionsäquivalent ist wichtig für den antioxidativen Schutz.',
    },
    en: {
      question:
        'Which molecule is generated directly in the reaction catalyzed by glucose-6-phosphate dehydrogenase?',
      options: ['NADPH', 'FADH2', 'ATP', 'Acetyl-CoA'],
      correct_answer: 'NADPH',
      explanation:
        'Glucose-6-phosphate dehydrogenase generates NADPH in the pentose phosphate pathway. This reducing equivalent is important for antioxidant defense.',
    },
  },
  {
    id: 'seed-praezise-biochemie-03',
    category: 'Biochemie',
    de: {
      question:
        'Welcher allosterische Aktivator stimuliert die Phosphofructokinase-1 besonders stark?',
      options: [
        'Fructose-2,6-Bisphosphat',
        'Citrat',
        'ATP',
        'Acetyl-CoA',
      ],
      correct_answer: 'Fructose-2,6-Bisphosphat',
      explanation:
        'Fructose-2,6-Bisphosphat ist ein starker Aktivator der PFK-1 und fördert damit die Glykolyse.',
    },
    en: {
      question:
        'Which allosteric activator strongly stimulates phosphofructokinase-1?',
      options: [
        'Fructose-2,6-bisphosphate',
        'Citrate',
        'ATP',
        'Acetyl-CoA',
      ],
      correct_answer: 'Fructose-2,6-bisphosphate',
      explanation:
        'Fructose-2,6-bisphosphate is a strong activator of PFK-1 and promotes glycolysis.',
    },
  },
  {
    id: 'seed-praezise-biochemie-04',
    category: 'Biochemie',
    de: {
      question:
        'Welches Transportsystem schleust langkettige Fettsäuren in die Mitochondrienmatrix ein?',
      options: [
        'Carnitin-Shuttle',
        'Malat-Aspartat-Shuttle',
        'Glycerol-3-Phosphat-Shuttle',
        'Urea-Transporter',
      ],
      correct_answer: 'Carnitin-Shuttle',
      explanation:
        'Langkettige Fettsäuren benötigen für den Transport in die Mitochondrienmatrix das Carnitin-Shuttle.',
    },
    en: {
      question:
        'Which transport system carries long-chain fatty acids into the mitochondrial matrix?',
      options: [
        'Carnitine shuttle',
        'Malate-aspartate shuttle',
        'Glycerol-3-phosphate shuttle',
        'Urea transporter',
      ],
      correct_answer: 'Carnitine shuttle',
      explanation:
        'Long-chain fatty acids require the carnitine shuttle to enter the mitochondrial matrix.',
    },
  },
  {
    id: 'seed-praezise-biochemie-05',
    category: 'Biochemie',
    de: {
      question:
        'Welcher Enzymdefekt verursacht die klassische Phenylketonurie am häufigsten?',
      options: [
        'Phenylalaninhydroxylase-Mangel',
        'Homogentisat-Dioxygenase-Mangel',
        'Galaktokinase-Mangel',
        'Pyruvatkinase-Mangel',
      ],
      correct_answer: 'Phenylalaninhydroxylase-Mangel',
      explanation:
        'Die klassische Phenylketonurie beruht meist auf einem Mangel der Phenylalaninhydroxylase. Dadurch kann Phenylalanin nicht ausreichend zu Tyrosin umgesetzt werden.',
    },
    en: {
      question:
        'Which enzyme defect most commonly causes classic phenylketonuria?',
      options: [
        'Phenylalanine hydroxylase deficiency',
        'Homogentisate dioxygenase deficiency',
        'Galactokinase deficiency',
        'Pyruvate kinase deficiency',
      ],
      correct_answer: 'Phenylalanine hydroxylase deficiency',
      explanation:
        'Classic phenylketonuria is usually caused by phenylalanine hydroxylase deficiency, preventing normal conversion of phenylalanine to tyrosine.',
    },
  },
  {
    id: 'seed-praezise-biochemie-06',
    category: 'Biochemie',
    de: {
      question:
        'Welches Apolipoprotein aktiviert die Lipoproteinlipase direkt?',
      options: ['ApoC-II', 'ApoB-100', 'ApoA-I', 'ApoE'],
      correct_answer: 'ApoC-II',
      explanation:
        'ApoC-II ist der direkte Aktivator der Lipoproteinlipase und damit entscheidend für den Abbau triglyceridreicher Lipoproteine.',
    },
    en: {
      question: 'Which apolipoprotein directly activates lipoprotein lipase?',
      options: ['ApoC-II', 'ApoB-100', 'ApoA-I', 'ApoE'],
      correct_answer: 'ApoC-II',
      explanation:
        'ApoC-II directly activates lipoprotein lipase and is therefore essential for the breakdown of triglyceride-rich lipoproteins.',
    },
  },

  // Immunologie
  {
    id: 'seed-praezise-immunologie-01',
    category: 'Immunologie',
    de: {
      question:
        'Welches Komplementfragment opsonisiert Erreger besonders effektiv?',
      options: ['C3b', 'C5a', 'C1q', 'C9'],
      correct_answer: 'C3b',
      explanation:
        'C3b lagert sich an die Oberfläche von Erregern an und erleichtert deren Phagozytose. Es ist das klassische Opsonin des Komplementsystems.',
    },
    en: {
      question: 'Which complement fragment is especially effective at opsonizing pathogens?',
      options: ['C3b', 'C5a', 'C1q', 'C9'],
      correct_answer: 'C3b',
      explanation:
        'C3b coats pathogen surfaces and facilitates phagocytosis. It is the classic opsonin of the complement system.',
    },
  },

  // Genetik
  {
    id: 'seed-praezise-genetik-01',
    category: 'Genetik',
    de: {
      question: 'Eine Mutation welches Gens ist typisch für das Marfan-Syndrom?',
      options: ['FBN1', 'COL1A1', 'DMD', 'CFTR'],
      correct_answer: 'FBN1',
      explanation:
        'Das Marfan-Syndrom beruht typischerweise auf Mutationen im FBN1-Gen, das für Fibrillin-1 kodiert.',
    },
    en: {
      question: 'Mutation of which gene is typical of Marfan syndrome?',
      options: ['FBN1', 'COL1A1', 'DMD', 'CFTR'],
      correct_answer: 'FBN1',
      explanation:
        'Marfan syndrome is typically caused by mutations in the FBN1 gene, which encodes fibrillin-1.',
    },
  },
  {
    id: 'seed-praezise-genetik-02',
    category: 'Genetik',
    de: {
      question:
        'Welche Chromosomenkonstellation ist klassisch für ein Down-Syndrom durch Robertson-Translokation?',
      options: [
        'Translokation zwischen Chromosom 14 und 21',
        'Monosomie X',
        'Trisomie 13',
        'Deletion auf Chromosom 5p',
      ],
      correct_answer: 'Translokation zwischen Chromosom 14 und 21',
      explanation:
        'Ein familiäres Down-Syndrom kann durch eine Robertson-Translokation mit Beteiligung von Chromosom 21 entstehen, besonders rob(14;21).',
    },
    en: {
      question:
        'Which chromosome arrangement is classic for Down syndrome due to Robertsonian translocation?',
      options: [
        'Translocation between chromosomes 14 and 21',
        'Monosomy X',
        'Trisomy 13',
        'Deletion on chromosome 5p',
      ],
      correct_answer: 'Translocation between chromosomes 14 and 21',
      explanation:
        'Familial Down syndrome can result from a Robertsonian translocation involving chromosome 21, especially rob(14;21).',
    },
  },
  {
    id: 'seed-praezise-genetik-03',
    category: 'Genetik',
    de: {
      question:
        'Welche Trinukleotid-Repeat-Sequenz expandiert beim Morbus Huntington?',
      options: ['CAG', 'CGG', 'CTG', 'GAA'],
      correct_answer: 'CAG',
      explanation:
        'Beim Morbus Huntington liegt eine CAG-Repeat-Expansion im HTT-Gen vor. Sie führt zu einer Polyglutamin-Erkrankung.',
    },
    en: {
      question:
        'Which trinucleotide repeat sequence expands in Huntington disease?',
      options: ['CAG', 'CGG', 'CTG', 'GAA'],
      correct_answer: 'CAG',
      explanation:
        'Huntington disease is caused by a CAG repeat expansion in the HTT gene, producing a polyglutamine disorder.',
    },
  },
  {
    id: 'seed-praezise-genetik-04',
    category: 'Genetik',
    de: {
      question:
        'Welche DNA-Reparaturbahn ist beim Lynch-Syndrom typischerweise defekt?',
      options: [
        'Mismatch-Reparatur',
        'Basenexzisionsreparatur',
        'Nukleotidexzisionsreparatur',
        'Nicht-homologes End-Joining',
      ],
      correct_answer: 'Mismatch-Reparatur',
      explanation:
        'Das Lynch-Syndrom beruht auf Defekten der Mismatch-Reparatur, zum Beispiel in MLH1, MSH2, MSH6 oder PMS2.',
    },
    en: {
      question:
        'Which DNA repair pathway is typically defective in Lynch syndrome?',
      options: [
        'Mismatch repair',
        'Base excision repair',
        'Nucleotide excision repair',
        'Non-homologous end joining',
      ],
      correct_answer: 'Mismatch repair',
      explanation:
        'Lynch syndrome is caused by defects in mismatch repair genes such as MLH1, MSH2, MSH6, or PMS2.',
    },
  },
  {
    id: 'seed-praezise-genetik-05',
    category: 'Genetik',
    de: {
      question:
        'Welches Vererbungsmuster ist für mitochondriale Erkrankungen typisch?',
      options: [
        'Maternal',
        'Autosomal-dominant',
        'X-chromosomal-dominant',
        'Y-chromosomal',
      ],
      correct_answer: 'Maternal',
      explanation:
        'Mitochondriale DNA wird nahezu ausschließlich über die Mutter vererbt. Deshalb zeigen mitochondriale Erkrankungen ein maternales Vererbungsmuster.',
    },
    en: {
      question:
        'Which inheritance pattern is typical of mitochondrial disorders?',
      options: [
        'Maternal',
        'Autosomal dominant',
        'X-linked dominant',
        'Y-linked',
      ],
      correct_answer: 'Maternal',
      explanation:
        'Mitochondrial DNA is inherited almost exclusively from the mother. Mitochondrial disorders therefore show maternal inheritance.',
    },
  },
  {
    id: 'seed-praezise-genetik-06',
    category: 'Genetik',
    de: {
      question:
        'Welche Chromosomendeletion ist typisch für das Cri-du-chat-Syndrom?',
      options: [
        'Deletion auf 5p',
        'Deletion auf 7q',
        'Deletion auf 15q',
        'Deletion auf 22q',
      ],
      correct_answer: 'Deletion auf 5p',
      explanation:
        'Das Cri-du-chat-Syndrom ist klassisch mit einer Deletion auf dem kurzen Arm von Chromosom 5 assoziiert.',
    },
    en: {
      question:
        'Which chromosomal deletion is typical of cri-du-chat syndrome?',
      options: [
        'Deletion on 5p',
        'Deletion on 7q',
        'Deletion on 15q',
        'Deletion on 22q',
      ],
      correct_answer: 'Deletion on 5p',
      explanation:
        'Cri-du-chat syndrome is classically associated with a deletion on the short arm of chromosome 5.',
    },
  },
  {
    id: 'seed-praezise-genetik-07',
    category: 'Genetik',
    de: {
      question:
        'Welche Repeat-Expansion im FMR1-Gen ist für das Fragile-X-Syndrom typisch?',
      options: ['CGG', 'CAG', 'CTG', 'GAA'],
      correct_answer: 'CGG',
      explanation:
        'Das Fragile-X-Syndrom wird durch eine CGG-Repeat-Expansion im FMR1-Gen verursacht, meist mit nachfolgender Gen-Silencing.',
    },
    en: {
      question:
        'Which repeat expansion in the FMR1 gene is typical of fragile X syndrome?',
      options: ['CGG', 'CAG', 'CTG', 'GAA'],
      correct_answer: 'CGG',
      explanation:
        'Fragile X syndrome is caused by a CGG repeat expansion in the FMR1 gene, usually followed by gene silencing.',
    },
  },

  // Radiologie
  {
    id: 'seed-praezise-radiologie-01',
    category: 'Radiologie',
    de: {
      question: 'Worauf zielt die FAST-Sonographie im Schockraum primär ab?',
      options: [
        'Nachweis freier Flüssigkeit',
        'Messung der Knochendichte',
        'Bestimmung des Herzzeitvolumens per MRT',
        'Sicherung einer Hirnstammblutung',
      ],
      correct_answer: 'Nachweis freier Flüssigkeit',
      explanation:
        'Die FAST-Untersuchung sucht schnell nach freier Flüssigkeit in Abdomen, Perikard und gegebenenfalls Thorax.',
    },
    en: {
      question: 'What is the primary goal of FAST ultrasound in the trauma bay?',
      options: [
        'Detection of free fluid',
        'Measurement of bone density',
        'Assessment of cardiac output by MRI',
        'Confirmation of brainstem hemorrhage',
      ],
      correct_answer: 'Detection of free fluid',
      explanation:
        'FAST is designed to rapidly detect free fluid in the abdomen, pericardium, and sometimes thorax.',
    },
  },
  {
    id: 'seed-praezise-radiologie-02',
    category: 'Radiologie',
    de: {
      question: 'Welche Form zeigt ein subdurales Hämatom im CT typischerweise?',
      options: ['Sichelförmig', 'Linsenförmig', 'Ringförmig', 'Sternförmig'],
      correct_answer: 'Sichelförmig',
      explanation:
        'Ein subdurales Hämatom breitet sich entlang der Hirnoberfläche aus und erscheint deshalb meist sichelförmig.',
    },
    en: {
      question: 'Which shape does a subdural hematoma typically have on CT?',
      options: ['Crescent-shaped', 'Lens-shaped', 'Ring-shaped', 'Star-shaped'],
      correct_answer: 'Crescent-shaped',
      explanation:
        'A subdural hematoma spreads along the brain surface and therefore usually appears crescent-shaped.',
    },
  },
  {
    id: 'seed-praezise-radiologie-03',
    category: 'Radiologie',
    de: {
      question:
        'Welche Bildgebung ist bei hämodynamisch stabilem Verdacht auf Lungenembolie typischerweise erste Wahl?',
      options: [
        'CT-Pulmonalisangiographie',
        'Konventionelles Thoraxröntgen',
        'MRT Thorax ohne Kontrastmittel',
        'Skelettszintigrafie',
      ],
      correct_answer: 'CT-Pulmonalisangiographie',
      explanation:
        'Bei hämodynamisch stabilem Verdacht auf Lungenembolie ist die CT-Pulmonalisangiographie die Standardbildgebung der ersten Wahl.',
    },
    en: {
      question:
        'Which imaging study is typically first choice for suspected pulmonary embolism in a hemodynamically stable patient?',
      options: [
        'CT pulmonary angiography',
        'Plain chest radiography',
        'Thoracic MRI without contrast',
        'Bone scintigraphy',
      ],
      correct_answer: 'CT pulmonary angiography',
      explanation:
        'In a hemodynamically stable patient with suspected pulmonary embolism, CT pulmonary angiography is the standard first-line imaging study.',
    },
  },
  {
    id: 'seed-praezise-radiologie-04',
    category: 'Radiologie',
    de: {
      question:
        'Welche Bildgebung wird in der Akutsituation primär verwendet, um eine intrakranielle Blutung beim Schlaganfallverdacht auszuschließen?',
      options: [
        'Natives CT des Schädels',
        'Kontrastmittel-MRT des Schädels',
        'PET-CT des Gehirns',
        'Ultraschall der Karotiden',
      ],
      correct_answer: 'Natives CT des Schädels',
      explanation:
        'Das native CT des Schädels steht in der Akutsituation schnell zur Verfügung und kann eine intrakranielle Blutung rasch nachweisen oder ausschließen.',
    },
    en: {
      question:
        'Which imaging study is primarily used in the acute setting to exclude intracranial hemorrhage in suspected stroke?',
      options: [
        'Non-contrast head CT',
        'Contrast-enhanced brain MRI',
        'Brain PET-CT',
        'Carotid ultrasound',
      ],
      correct_answer: 'Non-contrast head CT',
      explanation:
        'Non-contrast head CT is rapidly available in the acute setting and can quickly detect or exclude intracranial hemorrhage.',
    },
  },
  {
    id: 'seed-praezise-radiologie-05',
    category: 'Radiologie',
    de: {
      question:
        'Welches sonographische Artefakt ist hinter einem verkalkten Gallenstein typisch?',
      options: [
        'Dorsaler Schallschatten',
        'Posteriores Enhancement',
        'Reverberationsartefakt',
        'Spiegelartefakt',
      ],
      correct_answer: 'Dorsaler Schallschatten',
      explanation:
        'Verkalkte oder stark reflektierende Strukturen wie Gallensteine erzeugen typischerweise einen dorsalen Schallschatten.',
    },
    en: {
      question:
        'Which sonographic artifact is typical behind a calcified gallstone?',
      options: [
        'Posterior acoustic shadowing',
        'Posterior acoustic enhancement',
        'Reverberation artifact',
        'Mirror artifact',
      ],
      correct_answer: 'Posterior acoustic shadowing',
      explanation:
        'Calcified or strongly reflective structures such as gallstones typically create posterior acoustic shadowing.',
    },
  },
  {
    id: 'seed-praezise-radiologie-06',
    category: 'Radiologie',
    de: {
      question:
        'Welche Bildgebung ist bei Verdacht auf Hodentorsion typischerweise erste Wahl?',
      options: [
        'Doppler-Sonographie',
        'Natives CT des Beckens',
        'MRT Abdomen',
        'Röntgen des Skrotums',
      ],
      correct_answer: 'Doppler-Sonographie',
      explanation:
        'Bei Verdacht auf Hodentorsion ist die Doppler-Sonographie die typische Erstbildgebung, weil sie die Perfusion beurteilen kann.',
    },
    en: {
      question:
        'Which imaging study is typically first choice for suspected testicular torsion?',
      options: [
        'Doppler ultrasound',
        'Non-contrast pelvic CT',
        'Abdominal MRI',
        'Scrotal radiography',
      ],
      correct_answer: 'Doppler ultrasound',
      explanation:
        'For suspected testicular torsion, Doppler ultrasound is the usual first-line imaging study because it can assess perfusion.',
    },
  },
  {
    id: 'seed-praezise-radiologie-07',
    category: 'Radiologie',
    de: {
      question:
        'Welche Einheit beschreibt in der Radiologie die absorbierte Strahlendosis?',
      options: ['Gray', 'Sievert', 'Becquerel', 'Candela'],
      correct_answer: 'Gray',
      explanation:
        'Gray ist die Einheit der absorbierten Dosis. Sievert beschreibt dagegen die biologische Effektivdosis.',
    },
    en: {
      question:
        'Which unit describes absorbed radiation dose in radiology?',
      options: ['Gray', 'Sievert', 'Becquerel', 'Candela'],
      correct_answer: 'Gray',
      explanation:
        'Gray is the unit of absorbed dose. Sievert, by contrast, describes biologically weighted effective dose.',
    },
  },

  // Chirurgie
  {
    id: 'seed-praezise-chirurgie-01',
    category: 'Chirurgie',
    de: {
      question:
        'Wofür spricht eine schmerzlose Ikterus-Symptomatik mit palpabel vergrößerter Gallenblase nach Courvoisier am ehesten?',
      options: [
        'Maligne distale Gallenwegsobstruktion',
        'Akute Virushepatitis',
        'Nierenkolik',
        'Duodenalulkus ohne Stauung',
      ],
      correct_answer: 'Maligne distale Gallenwegsobstruktion',
      explanation:
        'Das Courvoisier-Zeichen weist auf eine Abflussbehinderung der extrahepatischen Gallenwege hin, häufig durch ein Pankreaskopfkarzinom.',
    },
    en: {
      question:
        'What does painless jaundice with a palpable enlarged gallbladder according to Courvoisier most strongly suggest?',
      options: [
        'Malignant distal biliary obstruction',
        'Acute viral hepatitis',
        'Renal colic',
        'Duodenal ulcer without obstruction',
      ],
      correct_answer: 'Malignant distal biliary obstruction',
      explanation:
        'Courvoisier sign points to obstruction of the extrahepatic biliary tract, often from pancreatic head cancer.',
    },
  },
  {
    id: 'seed-praezise-chirurgie-02',
    category: 'Chirurgie',
    de: {
      question:
        'Welche sofortige medikamentöse Maßnahme gehört typischerweise zur Initialtherapie einer akuten arteriellen Gliedmaßenischämie?',
      options: [
        'Systemische Heparinisierung',
        'Hochdosis Insulin',
        'Langsame Eiseninfusion',
        'Ausschließlich orale Analgesie',
      ],
      correct_answer: 'Systemische Heparinisierung',
      explanation:
        'Bei akuter arterieller Gliedmaßenischämie wird früh systemisch heparinisiert, um eine weitere Thrombuspropagation zu verhindern.',
    },
    en: {
      question:
        'Which immediate medical step typically belongs to the initial treatment of acute arterial limb ischemia?',
      options: [
        'Systemic heparinization',
        'High-dose insulin',
        'Slow iron infusion',
        'Oral analgesia only',
      ],
      correct_answer: 'Systemic heparinization',
      explanation:
        'In acute arterial limb ischemia, systemic heparin is started early to prevent further thrombus propagation.',
    },
  },
  {
    id: 'seed-praezise-chirurgie-03',
    category: 'Chirurgie',
    de: {
      question:
        'Welcher klinische Druckschmerzpunkt ist für eine akute Appendizitis klassisch?',
      options: [
        'McBurney-Punkt',
        'Mayo-Robson-Punkt',
        'Murphy-Punkt',
        'Lanz-Punkt am linken Unterbauch',
      ],
      correct_answer: 'McBurney-Punkt',
      explanation:
        'Der McBurney-Punkt liegt im rechten Unterbauch auf der Verbindungslinie zwischen Nabel und Spina iliaca anterior superior und ist klassisch bei Appendizitis druckschmerzhaft.',
    },
    en: {
      question:
        'Which point of maximal tenderness is classically associated with acute appendicitis?',
      options: [
        'McBurney point',
        'Mayo-Robson point',
        'Murphy point',
        'Lanz point in the left lower abdomen',
      ],
      correct_answer: 'McBurney point',
      explanation:
        'McBurney point lies in the right lower abdomen on the line between the umbilicus and the anterior superior iliac spine and is classically tender in appendicitis.',
    },
  },
  {
    id: 'seed-praezise-chirurgie-04',
    category: 'Chirurgie',
    de: {
      question:
        'Welche lebensrettende Sofortmaßnahme ist bei einem Spannungspneumothorax angezeigt?',
      options: [
        'Sofortige Nadeldekompression',
        'Abwarten unter Sauerstoffgabe',
        'Nur orale Schmerztherapie',
        'Elektive Spirometrie',
      ],
      correct_answer: 'Sofortige Nadeldekompression',
      explanation:
        'Der Spannungspneumothorax ist eine akute vitale Bedrohung. Er muss sofort durch Nadeldekompression entlastet werden, gefolgt von einer Thoraxdrainage.',
    },
    en: {
      question:
        'Which immediate life-saving measure is indicated in tension pneumothorax?',
      options: [
        'Immediate needle decompression',
        'Observation with oxygen only',
        'Oral analgesia only',
        'Elective spirometry',
      ],
      correct_answer: 'Immediate needle decompression',
      explanation:
        'Tension pneumothorax is an acute life-threatening condition. It must be relieved immediately with needle decompression, followed by chest tube placement.',
    },
  },
  {
    id: 'seed-praezise-chirurgie-05',
    category: 'Chirurgie',
    de: {
      question:
        'Welche Klassifikation wird für offene Frakturen standardmäßig verwendet?',
      options: [
        'Gustilo-Anderson-Klassifikation',
        'Child-Pugh-Klassifikation',
        'Bismuth-Klassifikation',
        'ASA-Klassifikation',
      ],
      correct_answer: 'Gustilo-Anderson-Klassifikation',
      explanation:
        'Offene Frakturen werden standardmäßig nach Gustilo und Anderson klassifiziert. Die Einteilung beschreibt Ausmaß der Weichteilschädigung und Kontamination.',
    },
    en: {
      question:
        'Which classification system is standard for open fractures?',
      options: [
        'Gustilo-Anderson classification',
        'Child-Pugh classification',
        'Bismuth classification',
        'ASA classification',
      ],
      correct_answer: 'Gustilo-Anderson classification',
      explanation:
        'Open fractures are classically classified with the Gustilo-Anderson system, which describes soft tissue damage and contamination.',
    },
  },
  {
    id: 'seed-praezise-chirurgie-06',
    category: 'Chirurgie',
    de: {
      question:
        'Welche definitive Notfalltherapie ist bei einem akuten Kompartmentsyndrom erforderlich?',
      options: [
        'Sofortige Fasziotomie',
        'Nur Hochlagerung',
        'Alleinige Eisapplikation',
        'Elastischer Druckverband',
      ],
      correct_answer: 'Sofortige Fasziotomie',
      explanation:
        'Das akute Kompartmentsyndrom gefährdet Muskeln und Nerven durch kritischen Gewebedruck. Die definitive Therapie ist die sofortige Fasziotomie.',
    },
    en: {
      question:
        'Which definitive emergency treatment is required for acute compartment syndrome?',
      options: [
        'Immediate fasciotomy',
        'Elevation only',
        'Ice application alone',
        'Elastic compression bandage',
      ],
      correct_answer: 'Immediate fasciotomy',
      explanation:
        'Acute compartment syndrome endangers muscles and nerves because of critically increased tissue pressure. The definitive treatment is immediate fasciotomy.',
    },
  },
  {
    id: 'seed-praezise-chirurgie-07',
    category: 'Chirurgie',
    de: {
      question:
        'Welche Arterie ist bei einer starken Blutung aus einem posterioren Duodenalulkus klassischerweise betroffen?',
      options: [
        'A. gastroduodenalis',
        'A. gastrica sinistra',
        'A. lienalis',
        'A. mesenterica inferior',
      ],
      correct_answer: 'A. gastroduodenalis',
      explanation:
        'Ein posteriores Duodenalulkus kann in die A. gastroduodenalis einbrechen und so eine massive obere Gastrointestinalblutung auslösen.',
    },
    en: {
      question:
        'Which artery is classically involved in major bleeding from a posterior duodenal ulcer?',
      options: [
        'Gastroduodenal artery',
        'Left gastric artery',
        'Splenic artery',
        'Inferior mesenteric artery',
      ],
      correct_answer: 'Gastroduodenal artery',
      explanation:
        'A posterior duodenal ulcer can erode into the gastroduodenal artery and cause massive upper gastrointestinal bleeding.',
    },
  },
  {
    id: 'seed-praezise-chirurgie-08',
    category: 'Chirurgie',
    de: {
      question:
        'Welche Standardoperation ist bei symptomatischer Cholezystolithiasis ohne Kontraindikationen die definitive Therapie?',
      options: [
        'Laparoskopische Cholezystektomie',
        'Sigmaresektion',
        'Appendektomie',
        'Splenektomie',
      ],
      correct_answer: 'Laparoskopische Cholezystektomie',
      explanation:
        'Bei symptomatischer Cholezystolithiasis ist die laparoskopische Cholezystektomie die Standardtherapie, sofern keine Kontraindikationen bestehen.',
    },
    en: {
      question:
        'Which standard operation is the definitive treatment for symptomatic cholelithiasis when no contraindications exist?',
      options: [
        'Laparoscopic cholecystectomy',
        'Sigmoid resection',
        'Appendectomy',
        'Splenectomy',
      ],
      correct_answer: 'Laparoscopic cholecystectomy',
      explanation:
        'For symptomatic cholelithiasis, laparoscopic cholecystectomy is the standard definitive treatment when no contraindications exist.',
    },
  },
];

const PRECISE_OFFLINE_CATEGORY_PACK = PRECISE_CATEGORY_PACK_ROWS.flatMap((row) => [
  {
    id: row.id,
    category: row.category,
    language: 'de',
    question: row.de.question,
    options: row.de.options,
    correct_answer: row.de.correct_answer,
    explanation: row.de.explanation,
  },
  {
    id: `${row.id}-en`,
    category: row.category,
    language: 'en',
    question: row.en.question,
    options: row.en.options,
    correct_answer: row.en.correct_answer,
    explanation: row.en.explanation,
  },
]);

export default PRECISE_OFFLINE_CATEGORY_PACK;
