-- Expand the online beginner foundation pack to five questions per category.

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
      'online-einfach-einstieg-anatomie-02',
      'Anatomie',
      'Welches Organ pumpt Blut durch den Koerper?',
      'Herz',
      '["Herz","Leber","Milz","Schilddruese"]'::jsonb,
      'Das Herz erzeugt den Druck fuer den Blutkreislauf und pumpt Blut in Lungen- und Koerperkreislauf.',
      'Which organ pumps blood through the body?',
      'Heart',
      '["Heart","Liver","Spleen","Thyroid gland"]'::jsonb,
      'The heart generates the pressure for circulation and pumps blood through the pulmonary and systemic circuits.'
    ),
    (
      'online-einfach-einstieg-anatomie-03',
      'Anatomie',
      'Welcher Knochen schuetzt das Gehirn?',
      'Schaedel',
      '["Schaedel","Patella","Femur","Scapula"]'::jsonb,
      'Der Schaedel umschliesst das Gehirn und schuetzt es mechanisch vor vielen aeusseren Einwirkungen.',
      'Which bone protects the brain?',
      'Skull',
      '["Skull","Patella","Femur","Scapula"]'::jsonb,
      'The skull surrounds the brain and provides important mechanical protection.'
    ),
    (
      'online-einfach-einstieg-anatomie-04',
      'Anatomie',
      'Welches Gefaess fuehrt Blut vom linken Herzen in den Koerperkreislauf?',
      'Aorta',
      '["Aorta","V. cava superior","A. pulmonalis","V. portae"]'::jsonb,
      'Die Aorta verlaesst das linke Herz und verteilt das sauerstoffreiche Blut in den Koerperkreislauf.',
      'Which vessel carries blood from the left heart into the systemic circulation?',
      'Aorta',
      '["Aorta","Superior vena cava","Pulmonary artery","Portal vein"]'::jsonb,
      'The aorta leaves the left heart and distributes oxygenated blood through the systemic circulation.'
    ),
    (
      'online-einfach-einstieg-anatomie-05',
      'Anatomie',
      'Welcher Muskel ist der wichtigste Atemmuskel?',
      'Zwerchfell',
      '["Zwerchfell","Bizeps","Masseter","Gluteus maximus"]'::jsonb,
      'Das Zwerchfell senkt sich bei der Einatmung ab und vergroessert so den Brustraum.',
      'Which muscle is the main muscle of breathing?',
      'Diaphragm',
      '["Diaphragm","Biceps","Masseter","Gluteus maximus"]'::jsonb,
      'The diaphragm contracts and moves downward during inspiration, increasing thoracic volume.'
    ),

    (
      'online-einfach-einstieg-physiologie-02',
      'Physiologie',
      'Welcher Prozess bringt Sauerstoff aus den Alveolen ins Blut?',
      'Diffusion',
      '["Diffusion","Mitose","Filtration im Gips","Osmose im Knochen"]'::jsonb,
      'Sauerstoff wandert entlang seines Konzentrationsgefaelles durch die duenne Alveolarwand ins Blut.',
      'Which process moves oxygen from the alveoli into the blood?',
      'Diffusion',
      '["Diffusion","Mitosis","Filtration in a cast","Osmosis in bone"]'::jsonb,
      'Oxygen moves across the thin alveolar membrane into the blood along its concentration gradient.'
    ),
    (
      'online-einfach-einstieg-physiologie-03',
      'Physiologie',
      'Welches Organ reguliert Wasserhaushalt und Elektrolyte besonders stark?',
      'Niere',
      '["Niere","Milz","Pankreas","Mandel"]'::jsonb,
      'Die Niere passt Wasserausscheidung und Elektrolyte laufend an und ist deshalb zentral fuer die Homoeostase.',
      'Which organ plays a major role in regulating water balance and electrolytes?',
      'Kidney',
      '["Kidney","Spleen","Pancreas","Tonsil"]'::jsonb,
      'The kidney continuously adjusts water excretion and electrolyte levels and is central to homeostasis.'
    ),
    (
      'online-einfach-einstieg-physiologie-04',
      'Physiologie',
      'Was passiert normalerweise mit der Pupille bei Dunkelheit?',
      'Sie wird weiter',
      '["Sie wird weiter","Sie wird enger","Sie verschwindet","Sie wird blau"]'::jsonb,
      'Bei Dunkelheit erweitert sich die Pupille, damit mehr Licht ins Auge gelangen kann.',
      'What normally happens to the pupil in darkness?',
      'It becomes wider',
      '["It becomes wider","It becomes narrower","It disappears","It turns blue"]'::jsonb,
      'In darkness the pupil dilates so that more light can enter the eye.'
    ),
    (
      'online-einfach-einstieg-physiologie-05',
      'Physiologie',
      'Welches Hormon steigt oft akut bei Stress und erhoeht Puls und Blutdruck?',
      'Adrenalin',
      '["Adrenalin","Melatonin","Insulin","Calcitonin"]'::jsonb,
      'Adrenalin gehoert zur akuten Stressreaktion und steigert unter anderem Herzfrequenz und Kreislaufaktivitaet.',
      'Which hormone often rises acutely during stress and increases pulse and blood pressure?',
      'Adrenaline',
      '["Adrenaline","Melatonin","Insulin","Calcitonin"]'::jsonb,
      'Adrenaline is part of the acute stress response and increases heart rate and circulatory activity.'
    ),

    (
      'online-einfach-einstieg-pathologie-02',
      'Pathologie',
      'Wie nennt man eine blaeuliche Verfaerbung bei Sauerstoffmangel?',
      'Zyanose',
      '["Zyanose","Ikterus","Fibrose","Hyperplasie"]'::jsonb,
      'Zyanose beschreibt eine blaeuliche Verfaerbung von Haut oder Schleimhaut bei zu wenig oxygeniertem Blut.',
      'What is bluish discoloration caused by lack of oxygen called?',
      'Cyanosis',
      '["Cyanosis","Jaundice","Fibrosis","Hyperplasia"]'::jsonb,
      'Cyanosis is a bluish discoloration of skin or mucosa caused by insufficiently oxygenated blood.'
    ),
    (
      'online-einfach-einstieg-pathologie-03',
      'Pathologie',
      'Wie nennt man dauerhaft erhoehten Blutdruck?',
      'Hypertonie',
      '["Hypertonie","Hypoxie","Leukopenie","Tachypnoe"]'::jsonb,
      'Hypertonie bedeutet, dass der arterielle Blutdruck ueber laengere Zeit erhoeht ist.',
      'What is persistently elevated blood pressure called?',
      'Hypertension',
      '["Hypertension","Hypoxia","Leukopenia","Tachypnea"]'::jsonb,
      'Hypertension means arterial blood pressure remains elevated over time.'
    ),
    (
      'online-einfach-einstieg-pathologie-04',
      'Pathologie',
      'Wie nennt man die Ausbreitung eines boesartigen Tumors in andere Organe?',
      'Metastasierung',
      '["Metastasierung","Regeneration","Diffusion","Sedierung"]'::jsonb,
      'Bei der Metastasierung breiten sich Tumorzellen vom Ursprungsort in andere Organe oder Gewebe aus.',
      'What is the spread of a malignant tumor to other organs called?',
      'Metastasis',
      '["Metastasis","Regeneration","Diffusion","Sedation"]'::jsonb,
      'Metastasis means tumor cells spread from the primary site to other organs or tissues.'
    ),
    (
      'online-einfach-einstieg-pathologie-05',
      'Pathologie',
      'Wie nennt man sichtbares Blut im Urin?',
      'Haematurie',
      '["Haematurie","Proteinurie","Diarrhoe","Dyspnoe"]'::jsonb,
      'Haematurie bedeutet, dass Blut im Urin vorhanden ist. Sie kann viele urologische oder nephrologische Ursachen haben.',
      'What is visible blood in the urine called?',
      'Hematuria',
      '["Hematuria","Proteinuria","Diarrhea","Dyspnea"]'::jsonb,
      'Hematuria means blood is present in the urine. It can have many urologic or nephrologic causes.'
    ),

    (
      'online-einfach-einstieg-pharmakologie-02',
      'Pharmakologie',
      'Welcher Wirkstoff wird haeufig als inhalatives Notfallmittel bei Asthma verwendet?',
      'Salbutamol',
      '["Salbutamol","Omeprazol","Warfarin","Metronidazol"]'::jsonb,
      'Salbutamol erweitert rasch die Bronchien und wird deshalb oft als Notfallmedikament bei Asthma eingesetzt.',
      'Which drug is commonly used as an inhaled rescue medication in asthma?',
      'Salbutamol',
      '["Salbutamol","Omeprazole","Warfarin","Metronidazole"]'::jsonb,
      'Salbutamol rapidly dilates the bronchi and is therefore commonly used as a rescue medication in asthma.'
    ),
    (
      'online-einfach-einstieg-pharmakologie-03',
      'Pharmakologie',
      'Welches Antidot wird bei einer Opioid-Ueberdosierung eingesetzt?',
      'Naloxon',
      '["Naloxon","Protamin","Vitamin K","Atropin"]'::jsonb,
      'Naloxon hebt die Wirkung von Opioiden rasch auf und wird deshalb bei Ueberdosierungen eingesetzt.',
      'Which antidote is used in opioid overdose?',
      'Naloxone',
      '["Naloxone","Protamine","Vitamin K","Atropine"]'::jsonb,
      'Naloxone rapidly reverses opioid effects and is therefore used in overdose.'
    ),
    (
      'online-einfach-einstieg-pharmakologie-04',
      'Pharmakologie',
      'Welcher Wirkstoff wird haeufig gegen Schmerzen und Entzuendung eingesetzt?',
      'Ibuprofen',
      '["Ibuprofen","Insulin","Heparin","Ceftriaxon"]'::jsonb,
      'Ibuprofen gehoert zu den nichtsteroidalen Antirheumatika und wirkt schmerzlindernd, fiebersenkend und entzuendungshemmend.',
      'Which drug is commonly used against pain and inflammation?',
      'Ibuprofen',
      '["Ibuprofen","Insulin","Heparin","Ceftriaxone"]'::jsonb,
      'Ibuprofen is a nonsteroidal anti-inflammatory drug and reduces pain, fever, and inflammation.'
    ),
    (
      'online-einfach-einstieg-pharmakologie-05',
      'Pharmakologie',
      'Welcher Wirkstoff wird haeufig als Lokalanaesthetikum verwendet?',
      'Lidocain',
      '["Lidocain","Morphin","Metformin","Prednisolon"]'::jsonb,
      'Lidocain blockiert spannungsabhaengige Natriumkanaele und wird oft zur lokalen Betaeubung verwendet.',
      'Which drug is commonly used as a local anesthetic?',
      'Lidocaine',
      '["Lidocaine","Morphine","Metformin","Prednisolone"]'::jsonb,
      'Lidocaine blocks voltage-gated sodium channels and is often used for local anesthesia.'
    ),

    (
      'online-einfach-einstieg-mikrobiologie-02',
      'Mikrobiologie',
      'Welcher Erreger verursacht Masern?',
      'Masernvirus',
      '["Masernvirus","Adenovirus","Candida albicans","Escherichia coli"]'::jsonb,
      'Masern werden durch das Masernvirus verursacht und sind eine hoch ansteckende Virusinfektion.',
      'Which pathogen causes measles?',
      'Measles virus',
      '["Measles virus","Adenovirus","Candida albicans","Escherichia coli"]'::jsonb,
      'Measles is caused by the measles virus and is a highly contagious viral infection.'
    ),
    (
      'online-einfach-einstieg-mikrobiologie-03',
      'Mikrobiologie',
      'Welches Bakterium ist klassisch mit Gastritis und Magenulkus verbunden?',
      'Helicobacter pylori',
      '["Helicobacter pylori","Bacillus subtilis","Borrelia burgdorferi","Staphylococcus epidermidis"]'::jsonb,
      'Helicobacter pylori besiedelt die Magenschleimhaut und ist klassisch mit Gastritis und Ulkuskrankheit verbunden.',
      'Which bacterium is classically associated with gastritis and gastric ulcer?',
      'Helicobacter pylori',
      '["Helicobacter pylori","Bacillus subtilis","Borrelia burgdorferi","Staphylococcus epidermidis"]'::jsonb,
      'Helicobacter pylori colonizes the gastric mucosa and is classically linked to gastritis and peptic ulcer disease.'
    ),
    (
      'online-einfach-einstieg-mikrobiologie-04',
      'Mikrobiologie',
      'Was fuer ein Erreger ist Plasmodium?',
      'Parasit',
      '["Parasit","Bakterium","Virus","Prion"]'::jsonb,
      'Plasmodien sind Parasiten und verursachen die Malaria. Sie werden durch Anopheles-Muecken uebertragen.',
      'What kind of pathogen is Plasmodium?',
      'Parasite',
      '["Parasite","Bacterium","Virus","Prion"]'::jsonb,
      'Plasmodium species are parasites and cause malaria. They are transmitted by Anopheles mosquitoes.'
    ),
    (
      'online-einfach-einstieg-mikrobiologie-05',
      'Mikrobiologie',
      'Welches Bakterium verursacht haeufig Scharlach?',
      'Streptococcus pyogenes',
      '["Streptococcus pyogenes","Mycobacterium leprae","Clostridium tetani","Vibrio cholerae"]'::jsonb,
      'Streptococcus pyogenes ist ein typischer Erreger von Scharlach und anderen Streptokokkeninfektionen.',
      'Which bacterium commonly causes scarlet fever?',
      'Streptococcus pyogenes',
      '["Streptococcus pyogenes","Mycobacterium leprae","Clostridium tetani","Vibrio cholerae"]'::jsonb,
      'Streptococcus pyogenes is a typical cause of scarlet fever and other streptococcal infections.'
    ),

    (
      'online-einfach-einstieg-biochemie-02',
      'Biochemie',
      'Wie nennt man die Bausteine der DNA?',
      'Nukleotide',
      '["Nukleotide","Aminosaeuren","Triglyzeride","Granulozyten"]'::jsonb,
      'Die DNA besteht aus vielen Nukleotiden, die Zucker, Phosphat und eine Base enthalten.',
      'What are the building blocks of DNA called?',
      'Nucleotides',
      '["Nucleotides","Amino acids","Triglycerides","Granulocytes"]'::jsonb,
      'DNA is made of nucleotides, each containing a sugar, a phosphate group, and a base.'
    ),
    (
      'online-einfach-einstieg-biochemie-03',
      'Biochemie',
      'Welche RNA bringt die Information vom Zellkern zum Ribosom?',
      'mRNA',
      '["mRNA","tRNA","rRNA","DNA"]'::jsonb,
      'Die mRNA transportiert die genetische Information von der DNA zu den Ribosomen fuer die Proteinsynthese.',
      'Which RNA carries information from the nucleus to the ribosome?',
      'mRNA',
      '["mRNA","tRNA","rRNA","DNA"]'::jsonb,
      'mRNA carries genetic information from DNA to the ribosomes for protein synthesis.'
    ),
    (
      'online-einfach-einstieg-biochemie-04',
      'Biochemie',
      'Welche Bindung verknuepft Aminosaeuren in Proteinen?',
      'Peptidbindung',
      '["Peptidbindung","Wasserstoffbruecke","Glykosidbindung","Ionenkanal"]'::jsonb,
      'Aminosaeuren werden in Proteinen ueber Peptidbindungen miteinander verbunden.',
      'Which bond links amino acids in proteins?',
      'Peptide bond',
      '["Peptide bond","Hydrogen bond","Glycosidic bond","Ion channel"]'::jsonb,
      'Amino acids are linked together in proteins by peptide bonds.'
    ),
    (
      'online-einfach-einstieg-biochemie-05',
      'Biochemie',
      'Welches Vitamin wird bei Sonnenlicht in der Haut gebildet?',
      'Vitamin D',
      '["Vitamin D","Vitamin C","Vitamin B12","Vitamin K"]'::jsonb,
      'Unter Sonnenlichteinwirkung kann die Haut Vorstufen fuer Vitamin D bilden. Deshalb haengt sein Spiegel auch von der Lichtexposition ab.',
      'Which vitamin is produced in the skin under sunlight?',
      'Vitamin D',
      '["Vitamin D","Vitamin C","Vitamin B12","Vitamin K"]'::jsonb,
      'Under sunlight exposure the skin can produce precursors of vitamin D, so its level depends partly on light exposure.'
    ),

    (
      'online-einfach-einstieg-immunologie-02',
      'Immunologie',
      'Welches Immunglobulin ist typisch fuer Schleimhaeute?',
      'IgA',
      '["IgA","IgD","IgE","IgM"]'::jsonb,
      'IgA spielt eine wichtige Rolle an Schleimhaeuten wie Darm und Atemwegen und kommt auch in Sekreten vor.',
      'Which immunoglobulin is typical for mucosal surfaces?',
      'IgA',
      '["IgA","IgD","IgE","IgM"]'::jsonb,
      'IgA is especially important at mucosal surfaces such as the gut and airways and is found in secretions.'
    ),
    (
      'online-einfach-einstieg-immunologie-03',
      'Immunologie',
      'Welche Immunabwehr reagiert in der Regel zuerst auf einen neuen Erreger?',
      'Angeborene Immunabwehr',
      '["Angeborene Immunabwehr","Adaptive Immunabwehr","Nur Antikoerper","Nur das Knochenmark"]'::jsonb,
      'Die angeborene Immunabwehr reagiert schnell und unspezifisch. Die adaptive Immunabwehr ist spaeter genauer und lernfaehig.',
      'Which immune defense usually reacts first to a new pathogen?',
      'Innate immune system',
      '["Innate immune system","Adaptive immune system","Only antibodies","Only the bone marrow"]'::jsonb,
      'The innate immune system reacts quickly and nonspecifically. The adaptive system responds later with greater specificity.'
    ),
    (
      'online-einfach-einstieg-immunologie-04',
      'Immunologie',
      'Welcher Stoff wird bei Soforttyp-Allergien oft aus Mastzellen freigesetzt?',
      'Histamin',
      '["Histamin","Insulin","Bilirubin","Myoglobin"]'::jsonb,
      'Histamin aus Mastzellen ist ein zentraler Mediator bei vielen akuten allergischen Reaktionen.',
      'Which substance is often released from mast cells in immediate-type allergies?',
      'Histamine',
      '["Histamine","Insulin","Bilirubin","Myoglobin"]'::jsonb,
      'Histamine released from mast cells is a central mediator in many acute allergic reactions.'
    ),
    (
      'online-einfach-einstieg-immunologie-05',
      'Immunologie',
      'Welche Strukturen filtern Lymphe und sind wichtige Treffpunkte fuer Immunzellen?',
      'Lymphknoten',
      '["Lymphknoten","Nebennieren","Bandscheiben","Gallensteine"]'::jsonb,
      'Lymphknoten filtern Lymphe und sind Orte, an denen Immunzellen Erregern und Antigenen begegnen koennen.',
      'Which structures filter lymph and serve as important meeting points for immune cells?',
      'Lymph nodes',
      '["Lymph nodes","Adrenal glands","Intervertebral discs","Gallstones"]'::jsonb,
      'Lymph nodes filter lymph and are places where immune cells can encounter pathogens and antigens.'
    ),

    (
      'online-einfach-einstieg-genetik-02',
      'Genetik',
      'Wie nennt man verschiedene Varianten desselben Gens?',
      'Allele',
      '["Allele","Ribosomen","Peptide","Mitochondrien"]'::jsonb,
      'Allele sind unterschiedliche Varianten desselben Gens an derselben Chromosomenposition.',
      'What are different versions of the same gene called?',
      'Alleles',
      '["Alleles","Ribosomes","Peptides","Mitochondria"]'::jsonb,
      'Alleles are different versions of the same gene at the same chromosomal position.'
    ),
    (
      'online-einfach-einstieg-genetik-03',
      'Genetik',
      'Welche Zellteilung bildet Keimzellen?',
      'Meiose',
      '["Meiose","Mitose","Transkription","Translation"]'::jsonb,
      'Die Meiose halbiert den Chromosomensatz und bildet Eizellen oder Spermien.',
      'Which type of cell division forms gametes?',
      'Meiosis',
      '["Meiosis","Mitosis","Transcription","Translation"]'::jsonb,
      'Meiosis halves the chromosome number and produces egg cells or sperm cells.'
    ),
    (
      'online-einfach-einstieg-genetik-04',
      'Genetik',
      'Wie viele Chromosomen enthaelt eine typische menschliche Keimzelle?',
      '23',
      '["23","46","44","92"]'::jsonb,
      'Keimzellen sind haploid und enthalten deshalb nur 23 Chromosomen statt 46.',
      'How many chromosomes does a typical human gamete contain?',
      '23',
      '["23","46","44","92"]'::jsonb,
      'Gametes are haploid and therefore contain 23 chromosomes instead of 46.'
    ),
    (
      'online-einfach-einstieg-genetik-05',
      'Genetik',
      'Wie nennt man den Ort eines Gens auf dem Chromosom?',
      'Lokus',
      '["Lokus","Exon","Promotor","Karyotyp"]'::jsonb,
      'Der Lokus bezeichnet die feste Position eines Gens oder Markers auf einem Chromosom.',
      'What is the position of a gene on a chromosome called?',
      'Locus',
      '["Locus","Exon","Promoter","Karyotype"]'::jsonb,
      'A locus is the fixed position of a gene or marker on a chromosome.'
    ),

    (
      'online-einfach-einstieg-radiologie-02',
      'Radiologie',
      'Welche Bildgebung zeigt Knochen oft schnell und gut im Alltag?',
      'Roentgen',
      '["Roentgen","EEG","PET","Spirometrie"]'::jsonb,
      'Roentgenaufnahmen sind schnell verfuegbar und stellen viele Knochenverletzungen gut dar.',
      'Which imaging test often shows bones quickly and well in everyday practice?',
      'X-ray',
      '["X-ray","EEG","PET","Spirometry"]'::jsonb,
      'X-ray studies are quickly available and show many bone injuries well.'
    ),
    (
      'online-einfach-einstieg-radiologie-03',
      'Radiologie',
      'Welche Bildgebung eignet sich besonders gut fuer Gehirn und Weichteile ohne ionisierende Strahlung?',
      'MRT',
      '["MRT","Roentgen","CT","Angiografie"]'::jsonb,
      'Die Magnetresonanztomographie liefert starke Weichteilkontraste und arbeitet ohne ionisierende Strahlung.',
      'Which imaging modality is especially useful for brain and soft tissue without ionizing radiation?',
      'MRI',
      '["MRI","X-ray","CT","Angiography"]'::jsonb,
      'MRI provides strong soft tissue contrast and works without ionizing radiation.'
    ),
    (
      'online-einfach-einstieg-radiologie-04',
      'Radiologie',
      'Welche Bildgebung wird bei akutem Kopftrauma oft schnell zum Blutungsausschluss genutzt?',
      'CT',
      '["CT","Ultraschall","Mammografie","Szintigrafie"]'::jsonb,
      'Das CT ist schnell verfuegbar und zeigt akute Blutungen im Kopf oft sehr gut.',
      'Which imaging study is often used quickly after acute head trauma to look for bleeding?',
      'CT',
      '["CT","Ultrasound","Mammography","Scintigraphy"]'::jsonb,
      'CT is quickly available and often shows acute intracranial bleeding very well.'
    ),
    (
      'online-einfach-einstieg-radiologie-05',
      'Radiologie',
      'Welche Untersuchung wird haeufig direkt am Krankenbett mit einer Sonde auf der Haut gemacht?',
      'Ultraschall',
      '["Ultraschall","PET-CT","Herzkatheter","Bronchoskopie"]'::jsonb,
      'Ultraschall ist mobil, schnell und kann oft direkt am Krankenbett durchgefuehrt werden.',
      'Which examination is commonly performed at the bedside with a probe on the skin?',
      'Ultrasound',
      '["Ultrasound","PET-CT","Cardiac catheterization","Bronchoscopy"]'::jsonb,
      'Ultrasound is mobile and fast and can often be performed directly at the bedside.'
    ),

    (
      'online-einfach-einstieg-chirurgie-02',
      'Chirurgie',
      'Wie nennt man die Entnahme einer Gewebeprobe zur Diagnostik?',
      'Biopsie',
      '["Biopsie","Transfusion","Laparoskopie","Dialyse"]'::jsonb,
      'Bei einer Biopsie wird Gewebe entnommen, um es mikroskopisch oder anderweitig diagnostisch zu untersuchen.',
      'What is taking a tissue sample for diagnosis called?',
      'Biopsy',
      '["Biopsy","Transfusion","Laparoscopy","Dialysis"]'::jsonb,
      'A biopsy removes tissue so that it can be examined microscopically or otherwise for diagnosis.'
    ),
    (
      'online-einfach-einstieg-chirurgie-03',
      'Chirurgie',
      'Wie nennt man das gezielte Stillen einer Blutung waehrend einer Operation?',
      'Haemostase',
      '["Haemostase","Intubation","Sedierung","Palpation"]'::jsonb,
      'Haemostase bedeutet Blutstillung und ist waehrend einer Operation zentral fuer die Sicherheit des Eingriffs.',
      'What is the controlled stopping of bleeding during an operation called?',
      'Hemostasis',
      '["Hemostasis","Intubation","Sedation","Palpation"]'::jsonb,
      'Hemostasis means stopping bleeding and is central to operative safety.'
    ),
    (
      'online-einfach-einstieg-chirurgie-04',
      'Chirurgie',
      'Wie nennt man das Entfernen von abgestorbenem oder verschmutztem Gewebe aus einer Wunde?',
      'Debridement',
      '["Debridement","Transplantation","Resonanz","Intubation"]'::jsonb,
      'Beim Debridement wird belastetes oder avitales Gewebe entfernt, damit die Wunde besser heilen kann.',
      'What is the removal of dead or contaminated tissue from a wound called?',
      'Debridement',
      '["Debridement","Transplantation","Resonance","Intubation"]'::jsonb,
      'Debridement removes contaminated or nonviable tissue so that a wound can heal better.'
    ),
    (
      'online-einfach-einstieg-chirurgie-05',
      'Chirurgie',
      'Wie nennt man eine offene Operation ueber einen groesseren Bauchschnitt?',
      'Laparotomie',
      '["Laparotomie","Arthroskopie","Bronchoskopie","Dialyse"]'::jsonb,
      'Die Laparotomie ist die offene Operation des Bauchraums ueber einen groesseren Schnitt der Bauchdecke.',
      'What is an open operation through a larger abdominal incision called?',
      'Laparotomy',
      '["Laparotomy","Arthroscopy","Bronchoscopy","Dialysis"]'::jsonb,
      'Laparotomy is an open abdominal operation performed through a larger incision in the abdominal wall.'
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
