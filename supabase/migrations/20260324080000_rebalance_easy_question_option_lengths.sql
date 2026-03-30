-- Rebalance option lengths and sharpen wording for easy/foundational questions
-- so the correct answer is not systematically guessable by length.

with updates (
  slug,
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
      'online-einfach-grundlagen-basis-anatomie-02',
      'Welche Herzkammer pumpt das Blut in den Lungenkreislauf?',
      'Rechter Ventrikel',
      '["Rechter Ventrikel","Linker Ventrikel","Rechter Vorhof","Linker Vorhof"]'::jsonb,
      'Der rechte Ventrikel pumpt sauerstoffarmes Blut ueber die Pulmonalarterie in die Lunge. Die Vorhoefe sammeln das Blut nur und geben es an die Kammern weiter.',
      'Which heart chamber pumps blood into the pulmonary circulation?',
      'Right ventricle',
      '["Right ventricle","Left ventricle","Right atrium","Left atrium"]'::jsonb,
      'The right ventricle pumps deoxygenated blood to the lungs through the pulmonary artery. The atria mainly collect blood and pass it to the ventricles.'
    ),
    (
      'online-einfach-grundlagen-basis-mikrobiologie-01',
      'Welcher Erreger verursacht die klassische Tuberkulose?',
      'M. tuberculosis',
      '["M. tuberculosis","M. leprae","H. pylori","N. meningitidis"]'::jsonb,
      'Tuberkulose wird typischerweise durch Mycobacterium tuberculosis aus dem Tuberkulose-Komplex verursacht. Die anderen Erreger stehen fuer andere typische Krankheitsbilder.',
      'Which pathogen causes classic tuberculosis?',
      'M. tuberculosis',
      '["M. tuberculosis","M. leprae","H. pylori","N. meningitidis"]'::jsonb,
      'Tuberculosis is classically caused by Mycobacterium tuberculosis from the tuberculosis complex. The other pathogens are associated with different diseases.'
    ),
    (
      'online-einfach-grundlagen-basis-biochemie-01',
      'Aus welchen Bausteinen werden Proteine aufgebaut?',
      'Aminosaeuren',
      '["Aminosaeuren","Fettsaeuren","Monosaccharide","Nukleotide"]'::jsonb,
      'Proteine bestehen aus Ketten von Aminosaeuren, die ueber Peptidbindungen verknuepft sind. Fettsaeuren, Monosaccharide und Nukleotide gehoeren zu anderen Stoffklassen.',
      'Which building blocks are used to make proteins?',
      'Amino acids',
      '["Amino acids","Fatty acids","Monosaccharides","Nucleotides"]'::jsonb,
      'Proteins are chains of amino acids linked by peptide bonds. Fatty acids, monosaccharides, and nucleotides belong to other molecular classes.'
    ),
    (
      'online-einfach-grundlagen-basis-immunologie-02',
      'Was ist das Hauptziel einer Impfung?',
      'Immunologisches Gedaechtnis',
      '["Immunologisches Gedaechtnis","Sofortige passive Antikoerpergabe","Akute Senkung der Koerpertemperatur","Vollstaendige Sterilitaet des Blutes"]'::jsonb,
      'Eine Impfung trainiert das adaptive Immunsystem gegen ein Antigen. Dadurch entstehen Gedaechtniszellen, die bei spaeterem Kontakt schneller und gezielter reagieren.',
      'What is the main goal of vaccination?',
      'Immunological memory',
      '["Immunological memory","Immediate passive antibody transfer","Acute reduction of body temperature","Complete sterility of the bloodstream"]'::jsonb,
      'Vaccination trains the adaptive immune system against an antigen. This creates memory cells that respond faster and more specifically on later exposure.'
    ),
    (
      'online-einfach-grundlagen-basis-radiologie-01',
      'Welches Kontrastmittel wird in der CT haeufig intravenoes verwendet?',
      'Jodhaltiges Kontrastmittel',
      '["Jodhaltiges Kontrastmittel","Gadoliniumhaltiges Kontrastmittel","Mikroblasen-Kontrastmittel","Bariumsulfat im Oesophagus"]'::jsonb,
      'In der CT werden haeufig jodhaltige Kontrastmittel eingesetzt, weil Jod Roentgenstrahlen gut abschwaecht. Gadolinium wird typischerweise in der MRT verwendet.',
      'Which contrast agent is commonly given intravenously in CT?',
      'Iodinated contrast agent',
      '["Iodinated contrast agent","Gadolinium-based contrast agent","Microbubble contrast agent","Barium sulfate in the esophagus"]'::jsonb,
      'CT commonly uses iodinated contrast agents because iodine attenuates X-rays well. Gadolinium is typically used in MRI instead.'
    ),
    (
      'online-einfach-grundlagen-basis-radiologie-02',
      'Welche Bildgebung wird in der Schwangerschaft oft bevorzugt, weil sie ohne ionisierende Strahlung auskommt?',
      'Ultraschalluntersuchung',
      '["Ultraschalluntersuchung","Computertomographie","Roentgenaufnahme","Positronen-Emissions-Tomographie"]'::jsonb,
      'Ultraschall arbeitet mit Schallwellen und nicht mit ionisierender Strahlung. Deshalb ist er fuer viele Fragestellungen in der Schwangerschaft die bevorzugte Erstuntersuchung.',
      'Which imaging modality is often preferred in pregnancy because it avoids ionizing radiation?',
      'Ultrasound examination',
      '["Ultrasound examination","Computed tomography","X-ray examination","Positron emission tomography"]'::jsonb,
      'Ultrasound uses sound waves rather than ionizing radiation. It is therefore often the preferred first imaging test during pregnancy.'
    ),
    (
      'online-einfach-grundlagen-basis-chirurgie-01',
      'Wie nennt man das sterile Abdecken des Operationsfeldes im OP?',
      'Steriles Abdecken',
      '["Steriles Abdecken","Endotracheale Intubation","Digitale Palpation","Postoperative Drainage"]'::jsonb,
      'Vor dem Eingriff wird das Operationsfeld steril abgegrenzt, damit waehrend der Operation moeglichst keimarm gearbeitet werden kann. Intubation und Drainage sind andere perioperative Massnahmen.',
      'What is the sterile covering of the operative field in the OR called?',
      'Sterile draping',
      '["Sterile draping","Endotracheal intubation","Digital palpation","Postoperative drainage"]'::jsonb,
      'Before surgery, the operative field is draped in a sterile manner to reduce contamination. Intubation and drainage are different perioperative measures.'
    ),
    (
      'online-einfach-grundlagen-basis-chirurgie-02',
      'Wozu dient eine chirurgische Drainage nach einer Operation hauptsaechlich?',
      'Ableitung von Sekret oder Blut',
      '["Ableitung von Sekret oder Blut","Einleitung der Allgemeinnarkose","Steigerung des arteriellen Drucks","Messung des kapillaeren Blutzuckers"]'::jsonb,
      'Eine Drainage fuehrt Fluessigkeit, Blut oder Sekret aus dem Operationsgebiet ab. So koennen Ansammlungen, Druck und manche postoperative Komplikationen reduziert werden.',
      'What is a surgical drain mainly used for after an operation?',
      'Draining blood or secretions',
      '["Draining blood or secretions","Induction of general anesthesia","Raising the arterial blood pressure","Measuring capillary blood glucose"]'::jsonb,
      'A drain removes blood, fluid, or secretions from the operative field. This helps reduce collections, pressure, and some postoperative complications.'
    ),
    (
      'online-einfach-grundlagen-extra-chirurgie-01',
      'Wie heisst die operative Entfernung der Gaumenmandeln?',
      'Tonsillektomie',
      '["Tonsillektomie","Appendektomie","Cholezystektomie","Thyreoidektomie"]'::jsonb,
      'Eine Tonsillektomie entfernt die Gaumenmandeln. Die anderen Eingriffe betreffen Appendix, Gallenblase oder Schilddruese.',
      'What is surgical removal of the palatine tonsils called?',
      'Tonsillectomy',
      '["Tonsillectomy","Appendectomy","Cholecystectomy","Thyroidectomy"]'::jsonb,
      'Tonsillectomy removes the palatine tonsils. The other operations involve the appendix, gallbladder, or thyroid gland.'
    ),
    (
      'online-einfach-grundlagen-extra-anatomie-02',
      'Welche grosse Vene leitet Blut aus der unteren Koerperhaelfte in den rechten Vorhof?',
      'Vena cava inferior',
      '["Vena cava inferior","Vena cava superior","Vena portae hepatis","A. carotis communis"]'::jsonb,
      'Die Vena cava inferior sammelt das venoesen Blut aus Beinen, Becken und Bauchraum und muendet in den rechten Vorhof. Die Vena cava superior drainiert dagegen die obere Koerperhaelfte.',
      'Which large vein carries blood from the lower half of the body to the right atrium?',
      'Inferior vena cava',
      '["Inferior vena cava","Superior vena cava","Portal vein","Common carotid artery"]'::jsonb,
      'The inferior vena cava returns venous blood from the legs, pelvis, and abdomen to the right atrium. The superior vena cava drains the upper half of the body instead.'
    ),
    (
      'online-einfach-grundlagen-extra-mikrobiologie-01',
      'Welcher Erreger verursacht typischerweise Windpocken?',
      'Varizella-Zoster-Virus',
      '["Varizella-Zoster-Virus","Epstein-Barr-Virus","Respiratorisches Synzytial-Virus","Hepatitis-B-Virus"]'::jsonb,
      'Windpocken sind die Primaerinfektion mit dem Varizella-Zoster-Virus. Dasselbe Virus kann spaeter als Herpes zoster reaktiviert werden.',
      'Which pathogen typically causes chickenpox?',
      'Varicella-zoster virus',
      '["Varicella-zoster virus","Epstein-Barr virus","Respiratory syncytial virus","Hepatitis B virus"]'::jsonb,
      'Chickenpox is the primary infection caused by varicella-zoster virus. The same virus can later reactivate as shingles.'
    ),
    (
      'online-einfach-grundlagen-extra-immunologie-02',
      'Welche Immunzellen erkennen Antigen ueber den T-Zell-Rezeptor und toeten virusinfizierte Koerperzellen?',
      'Zytotoxische T-Zellen',
      '["Zytotoxische T-Zellen","Natuerliche Killerzellen","Reife Erythrozyten","Fibroblastische Bindegewebszellen"]'::jsonb,
      'Zytotoxische T-Zellen erkennen Peptide ueber ihren T-Zell-Rezeptor auf MHC I und koennen infizierte Zellen gezielt abtoeten. NK-Zellen koennen ebenfalls zytotoxisch sein, nutzen dafuer aber keinen T-Zell-Rezeptor.',
      'Which immune cells recognize antigen through the T-cell receptor and kill virus-infected body cells?',
      'Cytotoxic T cells',
      '["Cytotoxic T cells","Natural killer cells","Mature erythrocytes","Fibroblastic connective-tissue cells"]'::jsonb,
      'Cytotoxic T cells recognize peptides through the T-cell receptor on MHC I and can specifically kill infected cells. NK cells can also be cytotoxic, but they do not use a T-cell receptor for this.'
    ),
    (
      'online-einfach-grundlagen-plus-anatomie-02',
      'Wie heisst der Oberarmknochen auf Latein?',
      'Humerus',
      '["Humerus","Clavicula","Scapula","Sternum"]'::jsonb,
      'Der Humerus ist der Knochen des Oberarms. Clavicula und Scapula gehoeren zum Schulterguertel, das Sternum zum Thorax.',
      'What is the upper arm bone called in Latin?',
      'Humerus',
      '["Humerus","Clavicle","Scapula","Sternum"]'::jsonb,
      'The humerus is the bone of the upper arm. The clavicle and scapula belong to the shoulder girdle, and the sternum belongs to the thorax.'
    ),
    (
      'online-einfach-grundlagen-plus-physiologie-01',
      'Welcher Blutfarbstoff bindet den groessten Teil des Sauerstoffs im Blut?',
      'Haemoglobin',
      '["Haemoglobin","Plasmaalbumin","Fibrinogen","Bilirubin"]'::jsonb,
      'Haemoglobin in den Erythrozyten bindet Sauerstoff reversibel und transportiert ihn im Blut. Albumin und Fibrinogen haben andere Hauptfunktionen, Bilirubin ist ein Abbauprodukt.',
      'Which blood pigment binds most of the oxygen in the blood?',
      'Hemoglobin',
      '["Hemoglobin","Plasma albumin","Fibrinogen","Bilirubin"]'::jsonb,
      'Hemoglobin in red blood cells reversibly binds oxygen and transports it in the blood. Albumin and fibrinogen have other main functions, and bilirubin is a breakdown product.'
    ),
    (
      'online-einfach-grundlagen-plus-pharmakologie-02',
      'Welcher dieser Wirkstoffe ist ein Beta-Laktam-Antibiotikum?',
      'Amoxicillin',
      '["Amoxicillin","Metformin","Furosemid","Acetylsalicylsaeure"]'::jsonb,
      'Amoxicillin gehoert zu den Penicillinen und damit zu den Beta-Laktam-Antibiotika. Die anderen Optionen sind ein Antidiabetikum, ein Diuretikum und ein Analgetikum.',
      'Which of these drugs is a beta-lactam antibiotic?',
      'Amoxicillin',
      '["Amoxicillin","Metformin","Furosemide","Acetylsalicylic acid"]'::jsonb,
      'Amoxicillin belongs to the penicillins and is therefore a beta-lactam antibiotic. The other options are an antidiabetic drug, a diuretic, and an analgesic.'
    ),
    (
      'online-einfach-grundlagen-plus-radiologie-01',
      'Welche Bildgebung arbeitet mit Schallwellen statt mit ionisierender Strahlung?',
      'Ultraschall',
      '["Ultraschall","Computertomographie","Roentgenaufnahme","Positronen-Emissions-Tomographie"]'::jsonb,
      'Ultraschall erzeugt Bilder mit Schallwellen. CT, Roentgen und PET verwenden dagegen ionisierende Strahlung.',
      'Which imaging method works with sound waves instead of ionizing radiation?',
      'Ultrasound',
      '["Ultrasound","Computed tomography","X-ray examination","Positron emission tomography"]'::jsonb,
      'Ultrasound creates images with sound waves. CT, X-ray, and PET use ionizing radiation instead.'
    ),
    (
      'online-einfach-grundlagen-plus-chirurgie-01',
      'Welcher Operationsname bedeutet Entfernung der Gallenblase?',
      'Cholezystektomie',
      '["Cholezystektomie","Appendektomie","Thyreoidektomie","Nephroureterektomie"]'::jsonb,
      'Bei einer Cholezystektomie wird die Gallenblase entfernt, zum Beispiel bei symptomatischen Gallensteinen. Die anderen Operationsnamen betreffen andere Organe.',
      'Which surgical term means removal of the gallbladder?',
      'Cholecystectomy',
      '["Cholecystectomy","Appendectomy","Thyroidectomy","Nephroureterectomy"]'::jsonb,
      'Cholecystectomy means removal of the gallbladder, for example in symptomatic gallstones. The other procedure names refer to different organs.'
    ),
    (
      'online-einfach-grundlagen-pharmakologie-01',
      'Welcher dieser Wirkstoffe wird haeufig gegen Schmerzen und Fieber eingesetzt?',
      'Paracetamol',
      '["Paracetamol","Metformin","Digoxin","Heparin"]'::jsonb,
      'Paracetamol wird haeufig als Analgetikum und Antipyretikum eingesetzt. Metformin, Digoxin und Heparin haben andere Hauptindikationen.',
      'Which of these drugs is commonly used for pain and fever?',
      'Paracetamol',
      '["Paracetamol","Metformin","Digoxin","Heparin"]'::jsonb,
      'Paracetamol is commonly used as an analgesic and antipyretic. Metformin, digoxin, and heparin are mainly used for other indications.'
    ),
    (
      'online-einfach-grundlagen-chirurgie-02',
      'Was bedeutet NPO vor einer Operation?',
      'Nichts per os',
      '["Nichts per os","Nur klare Fluessigkeiten","Nur feste Nahrung meiden","Fruehe postoperative Mobilisation"]'::jsonb,
      'NPO bedeutet, dass praeeoperativ nichts ueber den Mund aufgenommen werden soll. Das senkt waehrend der Narkose das Risiko fuer Regurgitation und Aspiration.',
      'What does NPO before an operation mean?',
      'Nothing by mouth',
      '["Nothing by mouth","Clear liquids only","Avoid solid food only","Early postoperative mobilization"]'::jsonb,
      'NPO means that nothing should be taken by mouth before surgery. This reduces the risk of regurgitation and aspiration during anesthesia.'
    )
),
updated_questions as (
  update public.questions as q
  set
    question = u.question_de,
    correct_answer = u.correct_de,
    options = u.options_de,
    explanation = u.explanation_de,
    updated_at = now()
  from updates as u
  where q.slug = u.slug
  returning q.id, q.slug
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
  q.id,
  'en',
  u.question_en,
  u.options_en,
  u.correct_en,
  u.explanation_en
from public.questions as q
join updates as u
  on u.slug = q.slug
on conflict (question_id, language) do update
set
  question = excluded.question,
  options = excluded.options,
  correct_answer = excluded.correct_answer,
  explanation = excluded.explanation,
  updated_at = now();
