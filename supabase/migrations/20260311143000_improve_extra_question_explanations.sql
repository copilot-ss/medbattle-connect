-- Replace terse extra question explanations with short, reasoned explanations.

with de_updates (slug, explanation) as (
  values
    ('anatomie-extra-2026-01', 'Der Radius liegt in anatomischer Grundstellung auf der Daumenseite des Unterarms. Die Ulna liegt dagegen auf der Kleinfingerseite.'),
    ('anatomie-extra-2026-02', 'Durch den Canalis carpi ziehen der N. medianus und mehrere Beugesehnen. Wird der Nerv dort eingeengt, entsteht das typische Karpaltunnelsyndrom.'),
    ('anatomie-extra-2026-03', 'Die A. splenica entspringt aus dem Truncus coeliacus und zieht entlang des Pankreas zur Milz. Sie ist die arterielle Hauptversorgung der Milz.'),
    ('physiologie-extra-2026-01', 'Adrenalin aktiviert am Herzen vor allem Beta-1-Rezeptoren. Dadurch steigen Herzfrequenz und Kontraktilitaet innerhalb kurzer Zeit an.'),
    ('physiologie-extra-2026-02', 'ADH wird im Hypothalamus gebildet, aber in der Neurohypophyse gespeichert und von dort freigesetzt. Genau nach diesem Speicher- und Freisetzungsort fragt die Aufgabe.'),
    ('physiologie-extra-2026-03', 'GLUT4 ist der insulinabhaengige Glukosetransporter in Muskel- und Fettzellen. Nach Insulinwirkung wird er in die Zellmembran eingebaut und steigert dort die Glukoseaufnahme.'),
    ('pathologie-extra-2026-01', 'Die Endung -itis bezeichnet eine Entzuendung. Zusammen mit Pankreas ergibt sich deshalb Pankreatitis als korrekter Fachbegriff.'),
    ('pathologie-extra-2026-02', 'Im Gehirn entsteht nach einem Infarkt typischerweise eine Kolliquationsnekrose. Das Gewebe wird enzymatisch verfluessigt, statt seine Architektur wie bei der Koagulationsnekrose zu behalten.'),
    ('pathologie-extra-2026-03', 'Das Li-Fraumeni-Syndrom beruht meist auf Keimbahnmutationen in TP53. Faellt p53 aus, gehen wichtige Kontrollen von DNA-Schaeden und Zellzyklus verloren.'),
    ('pharmakologie-extra-2026-01', 'Enalapril gehoert an der Endung -pril zur Gruppe der ACE-Hemmer. Diese blockieren die Umwandlung von Angiotensin I in Angiotensin II.'),
    ('pharmakologie-extra-2026-02', 'Doxycyclin ist ein Tetracyclin und bindet an die 30S-Untereinheit bakterieller Ribosomen. Dadurch wird die Proteinsynthese gehemmt.'),
    ('pharmakologie-extra-2026-03', 'Protamin ist stark positiv geladen und bindet dadurch das negativ geladene Heparin. So wird die antikoagulatorische Wirkung rasch neutralisiert.'),
    ('mikrobiologie-extra-2026-01', 'Scharlach wird durch toxinbildende Staemme von Streptococcus pyogenes verursacht. Das erythrogene Toxin erklaert Exanthem und Himbeerzunge.'),
    ('mikrobiologie-extra-2026-02', 'Chlamydia trachomatis ist obligat intrazellulaer, weil der Erreger fuer seinen Stoffwechsel auf die Wirtszelle angewiesen ist. Deshalb kann er sich nicht frei ausserhalb von Zellen vermehren.'),
    ('mikrobiologie-extra-2026-03', 'Das Diphtherietoxin hemmt den Elongationsfaktor 2 und stoppt so die Proteinsynthese. Lokal fuehrt das zu Nekrosen und den typischen Pseudomembranen.'),
    ('biochemie-extra-2026-01', 'Die ATP-Synthase nutzt den Protonengradienten der inneren Mitochondrienmembran, um ADP und anorganisches Phosphat zu ATP zusammenzufuegen. Genau diese Reaktion katalysiert sie.'),
    ('biochemie-extra-2026-02', 'Der Citratzyklus oxidiert Acetyl-CoA zu CO2 und liefert dabei NADH und FADH2 fuer die Atmungskette. Deshalb ist er das zentrale oxidative Stoffwechselrad.'),
    ('biochemie-extra-2026-03', 'Die Glykolyse endet mit Pyruvat. Laktat entsteht erst anschliessend aus Pyruvat, wenn der Stoffwechsel auf anaerobe Bedingungen ausweicht.'),
    ('immunologie-extra-2026-01', 'Dendritische Zellen sind professionelle antigenpraesentierende Zellen. Sie praesentieren Peptide ueber MHC II und aktivieren dadurch naive CD4-T-Zellen.'),
    ('immunologie-extra-2026-02', 'CD8-T-Zellen erkennen Antigene ueber MHC I und toeten infizierte oder entartete Zellen. Damit tragen sie die klassische zytotoxische Abwehr.'),
    ('immunologie-extra-2026-03', 'IFN-gamma aktiviert Makrophagen und foerdert die zellulaere Immunantwort. Deshalb ist es ein Schluesselzytokin der Th1-Antwort.'),
    ('genetik-extra-2026-01', 'Der Mensch besitzt in somatischen Zellen 46 Chromosomen, also 23 Paare. Je ein Chromosom eines Paares stammt von jedem Elternteil.'),
    ('genetik-extra-2026-02', 'Bei einer Monosomie fehlt ein Chromosom aus einem normalen Paar. Im Gegensatz dazu liegt bei einer Trisomie eines zu viel vor.'),
    ('genetik-extra-2026-03', 'Die Sichelzellanamie entsteht klassisch durch einen Austausch von Glutamat gegen Valin im Beta-Globin. Dadurch polymerisiert desoxygeniertes HbS leichter und verformt Erythrozyten sichelfoermig.'),
    ('radiologie-extra-2026-01', 'Roentgen ist bei Frakturverdacht meist die erste Wahl, weil es schnell verfuegbar, guenstig und sehr gut fuer die Beurteilung knoecherner Strukturen geeignet ist.'),
    ('radiologie-extra-2026-02', 'Beim CT werden meist iodhaltige Kontrastmittel verwendet, weil Iod als Element mit hoher Ordnungszahl Roentgenstrahlen stark abschwaecht. Dadurch heben sich Gefaesse und gut durchblutete Gewebe im CT deutlich besser ab.'),
    ('radiologie-extra-2026-03', 'In T1-Sequenzen erscheint Fett hell, weil es eine kurze T1-Relaxationszeit hat. Fluessigkeit ist in T1 dagegen eher dunkel und in T2 signalreicher.'),
    ('chirurgie-extra-2026-01', 'Die Endung -ektomie bedeutet operative Entfernung. Bei einer Appendektomie wird also der Appendix vermiformis entfernt.'),
    ('chirurgie-extra-2026-02', 'Groessere Bauchoperationen erfolgen meist in Allgemeinanaesthesie, weil sie sichere Atemwegskontrolle, ausreichende Analgesie und Muskelrelaxation erlaubt.'),
    ('chirurgie-extra-2026-03', 'Der N. recurrens innerviert die Stimmlippenmuskulatur. Wird er bei einer Schilddruesenoperation verletzt, drohen Heiserkeit oder sogar relevante Atemprobleme.')
)
update public.questions q
set explanation = de_updates.explanation
from de_updates
where q.slug = de_updates.slug;

update public.question_translations qt
set explanation = q.explanation
from public.questions q
where q.id = qt.question_id
  and lower(coalesce(trim(qt.language), 'de')) = 'de'
  and q.slug like '%-extra-2026-%';

with en_updates (slug, explanation) as (
  values
    ('anatomie-extra-2026-01', 'The radius lies on the thumb side of the forearm in anatomic position. The ulna lies on the little-finger side.'),
    ('anatomie-extra-2026-02', 'The carpal tunnel contains the median nerve together with several flexor tendons. Compression there causes the typical carpal tunnel syndrome.'),
    ('anatomie-extra-2026-03', 'The splenic artery arises from the celiac trunk and runs along the pancreas to the spleen. It is the main arterial supply of the spleen.'),
    ('physiologie-extra-2026-01', 'Adrenaline mainly stimulates beta-1 receptors in the heart. That acutely increases heart rate and contractility.'),
    ('physiologie-extra-2026-02', 'ADH is produced in the hypothalamus but stored and released from the posterior pituitary. The question specifically asks for that storage and release site.'),
    ('physiologie-extra-2026-03', 'GLUT4 is the insulin-dependent glucose transporter in muscle and adipose tissue. Insulin moves it into the cell membrane and thereby increases glucose uptake.'),
    ('pathologie-extra-2026-01', 'The suffix -itis means inflammation. Combined with pancreas, the correct medical term is pancreatitis.'),
    ('pathologie-extra-2026-02', 'Cerebral infarction typically causes liquefactive necrosis. Brain tissue is enzymatically digested rather than preserving its architecture as in coagulative necrosis.'),
    ('pathologie-extra-2026-03', 'Li-Fraumeni syndrome is usually caused by germline TP53 mutations. Loss of p53 removes an important checkpoint for DNA damage and the cell cycle.'),
    ('pharmakologie-extra-2026-01', 'Enalapril belongs to the ACE inhibitor class, which is often recognized by the suffix -pril. These drugs block the conversion of angiotensin I to angiotensin II.'),
    ('pharmakologie-extra-2026-02', 'Doxycycline is a tetracycline that binds the bacterial 30S ribosomal subunit. That inhibits bacterial protein synthesis.'),
    ('pharmakologie-extra-2026-03', 'Protamine is strongly positively charged and binds negatively charged heparin. This rapidly neutralizes heparin''s anticoagulant effect.'),
    ('mikrobiologie-extra-2026-01', 'Scarlet fever is caused by toxin-producing strains of Streptococcus pyogenes. The erythrogenic toxin explains the rash and strawberry tongue.'),
    ('mikrobiologie-extra-2026-02', 'Chlamydia trachomatis is obligately intracellular because it depends on the host cell for key metabolic functions. It cannot replicate freely outside cells.'),
    ('mikrobiologie-extra-2026-03', 'Diphtheria toxin inhibits elongation factor 2 and blocks protein synthesis. Locally this causes necrosis and the characteristic pseudomembranes.'),
    ('biochemie-extra-2026-01', 'ATP synthase uses the proton gradient across the inner mitochondrial membrane to join ADP and inorganic phosphate into ATP. That is the reaction it catalyzes.'),
    ('biochemie-extra-2026-02', 'The citric acid cycle oxidizes acetyl-CoA to CO2 and generates NADH and FADH2 for the electron transport chain. That is why it is the central oxidative cycle of metabolism.'),
    ('biochemie-extra-2026-03', 'Glycolysis ends with pyruvate. Lactate is formed only afterward from pyruvate when metabolism shifts toward anaerobic conditions.'),
    ('immunologie-extra-2026-01', 'Dendritic cells are professional antigen-presenting cells. They present peptides on MHC II and activate naive CD4 T cells.'),
    ('immunologie-extra-2026-02', 'CD8 T cells recognize antigen on MHC I and kill infected or malignant cells. That makes them the classic cytotoxic effector cells.'),
    ('immunologie-extra-2026-03', 'IFN-gamma activates macrophages and promotes cell-mediated immunity. It is therefore a key cytokine of the Th1 response.'),
    ('genetik-extra-2026-01', 'Humans have 46 chromosomes in somatic cells, arranged as 23 pairs. One chromosome of each pair comes from each parent.'),
    ('genetik-extra-2026-02', 'Monosomy means that one chromosome of a normal pair is missing. In contrast, trisomy means one extra chromosome is present.'),
    ('genetik-extra-2026-03', 'Sickle cell disease classically results from replacement of glutamate by valine in beta-globin. This promotes polymerization of deoxygenated HbS and sickling of red cells.'),
    ('radiologie-extra-2026-01', 'X-ray is usually the first test for suspected fracture because it is fast, widely available, and very good for showing bone injury.'),
    ('radiologie-extra-2026-02', 'CT commonly uses iodinated contrast because iodine has a high atomic number and strongly attenuates X-rays. That makes vessels and perfused tissues stand out much more clearly on CT images.'),
    ('radiologie-extra-2026-03', 'Fat appears bright on T1-weighted MRI because it has a short T1 relaxation time. Fluid is relatively dark on T1 and brighter on T2.'),
    ('chirurgie-extra-2026-01', 'The suffix -ectomy means surgical removal. An appendectomy therefore removes the vermiform appendix.'),
    ('chirurgie-extra-2026-02', 'Major abdominal operations usually require general anesthesia because it provides airway control, analgesia, and muscle relaxation.'),
    ('chirurgie-extra-2026-03', 'The recurrent laryngeal nerve innervates the vocal cord muscles. Injury during thyroid surgery can therefore cause hoarseness or significant airway problems.')
)
update public.question_translations qt
set explanation = en_updates.explanation
from public.questions q
join en_updates on en_updates.slug = q.slug
where q.id = qt.question_id
  and lower(coalesce(trim(qt.language), 'de')) = 'en';
