-- Tighten additional legacy questions and repair older English translations
-- that still contained vague wording, broken phrasing, or incorrect answers.

create temp table legacy_updates (
  slug text primary key,
  de_question text not null,
  de_options jsonb not null,
  de_correct_answer text not null,
  de_explanation text not null,
  en_question text not null,
  en_options jsonb not null,
  en_correct_answer text not null,
  en_explanation text not null
) on commit drop;

insert into legacy_updates (
  slug,
  de_question,
  de_options,
  de_correct_answer,
  de_explanation,
  en_question,
  en_options,
  en_correct_answer,
  en_explanation
)
values
  (
    'physiologie-insulin',
    'Welches Hormon senkt den Blutzuckerspiegel vor allem durch Foerderung der Glukoseaufnahme in Muskel- und Fettzellen?',
    '["Insulin","Glukagon","Adrenalin","Cortisol"]'::jsonb,
    'Insulin',
    'Insulin wird in den Beta-Zellen des Pankreas gebildet und senkt den Blutzucker. Es foerdert die Glukoseaufnahme in Muskel- und Fettzellen und unterstuetzt die Glykogenspeicherung.',
    'Which hormone lowers blood glucose primarily by promoting glucose uptake into muscle and adipose tissue?',
    '["Insulin","Glucagon","Adrenaline","Cortisol"]'::jsonb,
    'Insulin',
    'Insulin is produced by pancreatic beta cells and lowers blood glucose. It promotes glucose uptake into muscle and adipose tissue and supports glycogen storage.'
  ),
  (
    'physiologie-niere-02',
    'Welches vor allem in der Niere gebildete Hormon stimuliert im Knochenmark die Erythropoese?',
    '["Erythropoetin","Insulin","Aldosteron","ADH (Vasopressin)"]'::jsonb,
    'Erythropoetin',
    'Erythropoetin wird vor allem in der Niere gebildet und stimuliert die Erythropoese im Knochenmark. Bei chronischer Niereninsuffizienz kann deshalb eine renale Anaemie entstehen.',
    'Which hormone produced mainly in the kidney stimulates erythropoiesis in the bone marrow?',
    '["Erythropoietin","Insulin","Aldosterone","ADH (vasopressin)"]'::jsonb,
    'Erythropoietin',
    'Erythropoietin is produced mainly in the kidney and stimulates erythropoiesis in the bone marrow. Chronic kidney disease can therefore cause renal anemia.'
  ),
  (
    'physiologie-extra-2026-01',
    'Welches Katecholamin steigert die Herzfrequenz akut ueber beta-1-Rezeptoren am Herzen?',
    '["Adrenalin","Insulin","Cortisol","Prolaktin"]'::jsonb,
    'Adrenalin',
    'Adrenalin aktiviert am Herzen vor allem beta-1-Rezeptoren. Dadurch steigen Herzfrequenz und Kontraktilitaet innerhalb kurzer Zeit an.',
    'Which catecholamine acutely increases heart rate through beta-1 receptors in the heart?',
    '["Adrenaline","Insulin","Cortisol","Prolactin"]'::jsonb,
    'Adrenaline',
    'Adrenaline mainly stimulates beta-1 receptors in the heart. This acutely increases heart rate and contractility.'
  ),
  (
    'anatomie-neuro-02',
    'Welcher Hirnabschnitt ist vor allem fuer Koordination und Feinabstimmung willkuerlicher Bewegungen zustaendig?',
    '["Kleinhirn","Thalamus","Hirnstamm","Hypothalamus"]'::jsonb,
    'Kleinhirn',
    'Das Kleinhirn koordiniert Bewegungsablaeufe, Gleichgewicht und Feinmotorik. Laesionen fuehren typischerweise zu Ataxie, Dysmetrie und Intentionstremor.',
    'Which brain structure is primarily responsible for coordination and fine tuning of voluntary movements?',
    '["Cerebellum","Thalamus","Brainstem","Hypothalamus"]'::jsonb,
    'Cerebellum',
    'The cerebellum coordinates movement, balance, and fine motor control. Lesions typically cause ataxia, dysmetria, and intention tremor.'
  ),
  (
    'pathologie-neuro-01',
    'Was ist bei Erwachsenen die haeufigste Ursache einer spontanen Subarachnoidalblutung?',
    '["Ruptur eines sakkulaeren Aneurysmas","Thrombose der A. carotis","Sinusvenenthrombose","Hirnabszess"]'::jsonb,
    'Ruptur eines sakkulaeren Aneurysmas',
    'Die haeufigste Ursache einer spontanen Subarachnoidalblutung bei Erwachsenen ist die Ruptur eines sakkulaeren Aneurysmas im Circulus arteriosus Willisii. Traumatische Blutungen sind davon abzugrenzen.',
    'What is the most common cause of spontaneous subarachnoid hemorrhage in adults?',
    '["Rupture of a saccular aneurysm","Carotid artery thrombosis","Cerebral venous sinus thrombosis","Brain abscess"]'::jsonb,
    'Rupture of a saccular aneurysm',
    'The most common cause of spontaneous subarachnoid hemorrhage in adults is rupture of a saccular aneurysm in the circle of Willis. This must be distinguished from traumatic bleeding.'
  ),
  (
    'physiologie-endo-01',
    'Welcher Anteil der Hypophyse bildet TSH?',
    '["Adenohypophyse (Hypophysenvorderlappen)","Neurohypophyse","Nebennierenmark","Schilddruese"]'::jsonb,
    'Adenohypophyse (Hypophysenvorderlappen)',
    'TSH wird in der Adenohypophyse gebildet. Von dort stimuliert es die Schilddruese zur Bildung und Freisetzung von T3 und T4.',
    'Which part of the pituitary gland produces TSH?',
    '["Anterior pituitary (adenohypophysis)","Posterior pituitary (neurohypophysis)","Adrenal medulla","Thyroid gland"]'::jsonb,
    'Anterior pituitary (adenohypophysis)',
    'TSH is produced in the anterior pituitary. From there it stimulates the thyroid gland to synthesize and release T3 and T4.'
  ),
  (
    'physiologie-endo-02',
    'Welches in der Zona glomerulosa der Nebennierenrinde gebildete Hormon erhoeht ueber Natriumretention den Blutdruck?',
    '["Aldosteron","Adrenalin","Insulin","Glukagon"]'::jsonb,
    'Aldosteron',
    'Aldosteron wird in der Zona glomerulosa der Nebennierenrinde gebildet. Es steigert die Natrium- und Wasserretention in der Niere und kann so den Blutdruck erhoehen.',
    'Which hormone produced in the zona glomerulosa of the adrenal cortex raises blood pressure through sodium retention?',
    '["Aldosterone","Adrenaline","Insulin","Glucagon"]'::jsonb,
    'Aldosterone',
    'Aldosterone is produced in the zona glomerulosa of the adrenal cortex. It increases renal sodium and water retention and can therefore raise blood pressure.'
  ),
  (
    'physiologie-endo-03',
    'Welches Hormon foerdert in Muskel- und Fettzellen die Aufnahme von Glukose?',
    '["Insulin","Glukagon","Cortisol","Adrenalin"]'::jsonb,
    'Insulin',
    'Insulin foerdert die Aufnahme von Glukose in Zellen, vor allem in Muskel- und Fettgewebe. Dazu bewirkt es unter anderem die Einlagerung von GLUT4 in die Zellmembran.',
    'Which hormone promotes glucose uptake into cells, especially muscle and adipose tissue?',
    '["Insulin","Glucagon","Cortisol","Adrenaline"]'::jsonb,
    'Insulin',
    'Insulin promotes glucose uptake into cells, especially muscle and adipose tissue. One important mechanism is insertion of GLUT4 transporters into the cell membrane.'
  ),
  (
    'anatomie-gastro-01',
    'Welche Struktur speichert und konzentriert die in der Leber gebildete Galle?',
    '["Gallenblase","Pankreas","Milz","Duodenum"]'::jsonb,
    'Gallenblase',
    'Die Gallenblase speichert und konzentriert die in der Leber gebildete Galle zwischen den Mahlzeiten. Nach Nahrungsaufnahme wird sie in das Duodenum abgegeben.',
    'Which structure stores and concentrates bile produced by the liver?',
    '["Gallbladder","Pancreas","Spleen","Duodenum"]'::jsonb,
    'Gallbladder',
    'The gallbladder stores and concentrates bile produced by the liver between meals. After food intake, bile is released into the duodenum.'
  ),
  (
    'physiologie-gastro-01',
    'In welchem Darmabschnitt wird Vitamin B12 nach Bindung an Intrinsic Factor hauptsaechlich resorbiert?',
    '["Terminales Ileum","Duodenum","Jejunum","Colon"]'::jsonb,
    'Terminales Ileum',
    'Vitamin B12 wird hauptsaechlich im terminalen Ileum resorbiert. Voraussetzung dafuer ist die Bindung an Intrinsic Factor aus dem Magen.',
    'In which intestinal segment is vitamin B12 mainly absorbed after binding to intrinsic factor?',
    '["Terminal ileum","Duodenum","Jejunum","Colon"]'::jsonb,
    'Terminal ileum',
    'Vitamin B12 is absorbed mainly in the terminal ileum. This requires prior binding to intrinsic factor produced in the stomach.'
  ),
  (
    'physiologie-haema-02',
    'Welcher Gerinnungstest prueft vor allem die extrinsische Gerinnungskaskade?',
    '["Quick/INR (Prothrombinzeit)","aPTT","Thrombinzeit","Blutungszeit"]'::jsonb,
    'Quick/INR (Prothrombinzeit)',
    'Quick/INR prueft vor allem die extrinsische Gerinnungskaskade, insbesondere den Faktor VII. Deshalb wird der Wert auch zur Kontrolle einer Vitamin-K-Antagonisten-Therapie genutzt.',
    'Which coagulation test mainly assesses the extrinsic pathway?',
    '["PT/INR (prothrombin time)","aPTT","Thrombin time","Bleeding time"]'::jsonb,
    'PT/INR (prothrombin time)',
    'PT/INR mainly assesses the extrinsic coagulation pathway, especially factor VII. This is why it is used to monitor vitamin K antagonist therapy.'
  ),
  (
    'anatomie-derm-01',
    'Wie heisst die aeusserste Schicht der Haut?',
    '["Epidermis","Dermis","Subkutis","Faszie"]'::jsonb,
    'Epidermis',
    'Die Epidermis ist die aeusserste Hautschicht und bildet die Barriere gegen Keime, Austrocknung und mechanische Reize.',
    'What is the outermost layer of the skin called?',
    '["Epidermis","Dermis","Subcutis","Fascia"]'::jsonb,
    'Epidermis',
    'The epidermis is the outermost layer of the skin and forms the main barrier against pathogens, dehydration, and mechanical stress.'
  ),
  (
    'anatomie-oph-02',
    'Welche Stelle der Netzhaut ermoeglicht das schaerfste Sehen?',
    '["Fovea centralis","Papille","Glaskoerper","Ziliarkoerper"]'::jsonb,
    'Fovea centralis',
    'Die Fovea centralis ist der Ort des schaerfsten Sehens, weil dort die Zapfendichte am hoechsten ist. Deshalb ist sie fuer hochaufgeloestes Farb- und Detailsehen entscheidend.',
    'Which retinal structure provides the sharpest vision?',
    '["Fovea centralis","Optic disc","Vitreous body","Ciliary body"]'::jsonb,
    'Fovea centralis',
    'The fovea centralis provides the sharpest vision because cone density is highest there. It is crucial for fine detail and color vision.'
  ),
  (
    'pathologie-oph-01',
    'Welcher Druck ist beim Glaukom haeufig erhoeht und kann den Sehnerv schaedigen?',
    '["Augeninnendruck (intraokularer Druck)","Blutdruck","Liquordruck","Pulsdruck"]'::jsonb,
    'Augeninnendruck (intraokularer Druck)',
    'Beim Glaukom ist der Augeninnendruck haeufig erhoeht, was den Sehnerv langfristig schaedigen kann. Unbehandelt drohen Gesichtsfeldausfaelle bis zur Erblindung.',
    'Which pressure is often elevated in glaucoma and can damage the optic nerve?',
    '["Intraocular pressure","Blood pressure","Cerebrospinal fluid pressure","Pulse pressure"]'::jsonb,
    'Intraocular pressure',
    'In glaucoma, intraocular pressure is often elevated and may progressively damage the optic nerve. Without treatment this can cause visual field loss and blindness.'
  ),
  (
    'pathologie-extra-2026-03',
    'Welche Keimbahnmutation ist typisch fuer das Li-Fraumeni-Syndrom?',
    '["TP53 (p53-Tumorsuppressorgen)","BRCA1","APC","RB1"]'::jsonb,
    'TP53 (p53-Tumorsuppressorgen)',
    'Das Li-Fraumeni-Syndrom beruht meist auf Keimbahnmutationen in TP53. Faellt p53 aus, gehen wichtige Kontrollen von DNA-Schaeden und Zellzyklus verloren.',
    'Which germline mutation is typical of Li-Fraumeni syndrome?',
    '["TP53 (p53 tumor suppressor gene)","BRCA1","APC","RB1"]'::jsonb,
    'TP53 (p53 tumor suppressor gene)',
    'Li-Fraumeni syndrome is usually caused by germline mutations in TP53. Loss of p53 disrupts key controls of DNA damage response and cell-cycle arrest.'
  ),
  (
    'immunologie-extra-02',
    'Welche Zellen vermitteln die klassische zytotoxische adaptive Immunantwort gegen virusinfizierte Zellen?',
    '["CD8-positive zytotoxische T-Zellen","B-Zellen","Neutrophile Granulozyten","Makrophagen"]'::jsonb,
    'CD8-positive zytotoxische T-Zellen',
    'CD8-positive T-Zellen erkennen Antigene ueber MHC I und toeten virusinfizierte oder entartete Zellen. Damit tragen sie die klassische zytotoxische adaptive Immunantwort.',
    'Which cells mediate the classic cytotoxic adaptive immune response against virus-infected cells?',
    '["CD8-positive cytotoxic T cells","B cells","Neutrophils","Macrophages"]'::jsonb,
    'CD8-positive cytotoxic T cells',
    'CD8-positive T cells recognize antigen presented on MHC I and kill infected or malignant cells. They therefore mediate the classic cytotoxic adaptive immune response.'
  ),
  (
    'genetik-extra-03',
    'Welche Mutation verursacht klassisch die Sichelzellanamie?',
    '["Missense-Mutation Glu6Val im HBB-Gen","Trinukleotid-Expansion","Frameshift-Mutation in BRCA1","Deletion von Exon 7"]'::jsonb,
    'Missense-Mutation Glu6Val im HBB-Gen',
    'Die Sichelzellanamie entsteht klassisch durch eine Missense-Mutation mit Austausch von Glutamat gegen Valin an Position 6 der Beta-Globin-Kette. Dadurch polymerisiert desoxygeniertes HbS leichter und verformt Erythrozyten sichelfoermig.',
    'Which mutation classically causes sickle cell disease?',
    '["Missense mutation Glu6Val in the HBB gene","Trinucleotide expansion","Frameshift mutation in BRCA1","Deletion of exon 7"]'::jsonb,
    'Missense mutation Glu6Val in the HBB gene',
    'Sickle cell disease is classically caused by a missense mutation that replaces glutamate with valine at position 6 of beta globin. Deoxygenated HbS then polymerizes more easily and deforms erythrocytes into a sickle shape.'
  ),
  (
    'radiologie-extra-2026-01',
    'Welche Bildgebung ist bei Verdacht auf eine knoecherne Fraktur meist die Erstuntersuchung?',
    '["Konventionelles Roentgen","CT","MRT","Ultraschall"]'::jsonb,
    'Konventionelles Roentgen',
    'Konventionelles Roentgen ist bei Frakturverdacht meist die erste Wahl, weil es schnell verfuegbar, guenstig und sehr gut fuer die Beurteilung knoecherner Strukturen geeignet ist.',
    'Which imaging modality is usually the first study when a bone fracture is suspected?',
    '["Plain radiography","CT","MRI","Ultrasound"]'::jsonb,
    'Plain radiography',
    'Plain radiography is usually the first study when fracture is suspected because it is fast, widely available, and well suited for evaluating bony structures.'
  );

update public.questions q
set
  question = lu.de_question,
  options = lu.de_options,
  correct_answer = lu.de_correct_answer,
  explanation = lu.de_explanation,
  updated_at = timezone('utc', now())
from legacy_updates lu
where q.slug = lu.slug;

update public.question_translations qt
set
  question = case when qt.language = 'de' then lu.de_question else lu.en_question end,
  options = case when qt.language = 'de' then lu.de_options else lu.en_options end,
  correct_answer = case when qt.language = 'de' then lu.de_correct_answer else lu.en_correct_answer end,
  explanation = case when qt.language = 'de' then lu.de_explanation else lu.en_explanation end,
  updated_at = timezone('utc', now())
from public.questions q
join legacy_updates lu on lu.slug = q.slug
where qt.question_id = q.id
  and qt.language in ('de', 'en');
