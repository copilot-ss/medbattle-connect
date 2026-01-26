insert into public.questions (
  question,
  correct_answer,
  options,
  category,
  difficulty,
  slug,
  explanation
)
values
  ('Wie heisst der Knochen des Unterarms auf der Daumenseite?', 'Radius', '["Radius","Ulna","Humerus","Fibula"]'::jsonb, 'Anatomie', 'leicht', 'anatomie-extra-2026-01', 'Der Radius liegt lateral auf der Daumenseite.'),
  ('Welche Struktur verläuft durch den Canalis carpi?', 'N. medianus', '["N. medianus","N. ulnaris","N. radialis","N. musculocutaneus"]'::jsonb, 'Anatomie', 'mittel', 'anatomie-extra-2026-02', 'Der N. medianus verläuft durch den Karpaltunnel.'),
  ('Welche Arterie versorgt die Milz?', 'A. splenica', '["A. splenica","A. hepatica","A. renalis","A. mesenterica inferior"]'::jsonb, 'Anatomie', 'schwer', 'anatomie-extra-2026-03', 'Die A. splenica (lienalis) versorgt die Milz.'),

  ('Welches Hormon erhöht die Herzfrequenz akut?', 'Adrenalin', '["Adrenalin","Insulin","Cortisol","Prolaktin"]'::jsonb, 'Physiologie', 'leicht', 'physiologie-extra-2026-01', 'Adrenalin steigert Herzfrequenz und Kontraktilität.'),
  ('Wo wird ADH gespeichert und freigesetzt?', 'Neurohypophyse', '["Neurohypophyse","Adenohypophyse","Nebennierenrinde","Schilddrüse"]'::jsonb, 'Physiologie', 'mittel', 'physiologie-extra-2026-02', 'ADH wird in der Neurohypophyse gespeichert und freigesetzt.'),
  ('Welcher Transporter ist für Glukoseaufnahme in Muskel insulinabhängig?', 'GLUT4', '["GLUT4","GLUT1","GLUT2","SGLT1"]'::jsonb, 'Physiologie', 'schwer', 'physiologie-extra-2026-03', 'GLUT4 wird durch Insulin in die Membran eingebaut.'),

  ('Wie nennt man eine Entzündung der Bauchspeicheldrüse?', 'Pankreatitis', '["Pankreatitis","Hepatitis","Appendizitis","Gastritis"]'::jsonb, 'Pathologie', 'leicht', 'pathologie-extra-2026-01', 'Pankreatitis ist die Entzündung des Pankreas.'),
  ('Welche Nekroseform ist typisch beim Hirninfarkt?', 'Kolliquationsnekrose', '["Kolliquationsnekrose","Koagulationsnekrose","Fettgewebsnekrose","Fibrinoidnekrose"]'::jsonb, 'Pathologie', 'mittel', 'pathologie-extra-2026-02', 'Im Gehirn dominiert die Kolliquationsnekrose.'),
  ('Welche Mutation ist typisch beim Li-Fraumeni-Syndrom?', 'p53', '["p53","BRCA1","APC","RB1"]'::jsonb, 'Pathologie', 'schwer', 'pathologie-extra-2026-03', 'Li-Fraumeni ist mit p53-Mutationen assoziiert.'),

  ('Welcher Wirkstoff ist ein ACE-Hemmer?', 'Enalapril', '["Enalapril","Amlodipin","Bisoprolol","Furosemid"]'::jsonb, 'Pharmakologie', 'leicht', 'pharmakologie-extra-2026-01', 'Enalapril gehört zu den ACE-Hemmern.'),
  ('Welches Antibiotikum hemmt die bakterielle Proteinsynthese an der 30S-Untereinheit?', 'Doxycyclin', '["Doxycyclin","Erythromycin","Vancomycin","Ceftriaxon"]'::jsonb, 'Pharmakologie', 'mittel', 'pharmakologie-extra-2026-02', 'Tetracycline wie Doxycyclin binden an 30S.'),
  ('Welches Antidot wird bei Heparin-Überdosierung gegeben?', 'Protamin', '["Protamin","Naloxon","Flumazenil","Vitamin K"]'::jsonb, 'Pharmakologie', 'schwer', 'pharmakologie-extra-2026-03', 'Protamin neutralisiert Heparin.'),

  ('Welcher Erreger verursacht typischerweise Scharlach?', 'Streptococcus pyogenes', '["Streptococcus pyogenes","Staphylococcus aureus","Haemophilus influenzae","Neisseria meningitidis"]'::jsonb, 'Mikrobiologie', 'leicht', 'mikrobiologie-extra-2026-01', 'Scharlach wird durch Streptococcus pyogenes verursacht.'),
  ('Welcher Erreger ist obligat intrazellulär?', 'Chlamydia trachomatis', '["Chlamydia trachomatis","Escherichia coli","Staphylococcus aureus","Pseudomonas aeruginosa"]'::jsonb, 'Mikrobiologie', 'mittel', 'mikrobiologie-extra-2026-02', 'Chlamydien sind obligat intrazellulär.'),
  ('Welches Toxin verursacht Pseudomembranen bei Diphtherie?', 'Diphtherietoxin', '["Diphtherietoxin","Tetanustoxin","Botulinumtoxin","Exotoxin A"]'::jsonb, 'Mikrobiologie', 'schwer', 'mikrobiologie-extra-2026-03', 'Das Diphtherietoxin führt zu Pseudomembranen.'),

  ('Welche Reaktion katalysiert die ATP-Synthase?', 'ADP + Pi -> ATP', '["ADP + Pi -> ATP","ATP -> ADP + Pi","Glukose -> Pyruvat","Pyruvat -> Laktat"]'::jsonb, 'Biochemie', 'leicht', 'biochemie-extra-2026-01', 'Die ATP-Synthase bildet ATP aus ADP und Phosphat.'),
  ('Welcher Zyklus oxidiert Acetyl-CoA?', 'Citratzyklus', '["Citratzyklus","Harnstoffzyklus","Glykolyse","Pentosephosphatweg"]'::jsonb, 'Biochemie', 'mittel', 'biochemie-extra-2026-02', 'Im Citratzyklus wird Acetyl-CoA oxidiert.'),
  ('Welches Molekül ist Endprodukt der Glykolyse?', 'Pyruvat', '["Pyruvat","Laktat","Acetyl-CoA","Oxalacetat"]'::jsonb, 'Biochemie', 'schwer', 'biochemie-extra-2026-03', 'Die Glykolyse endet mit Pyruvat.'),

  ('Welche Zellen präsentieren Antigen über MHC II?', 'Dendritische Zellen', '["Dendritische Zellen","Erythrozyten","Thrombozyten","Neurone"]'::jsonb, 'Immunologie', 'leicht', 'immunologie-extra-2026-01', 'Dendritische Zellen sind professionelle APCs.'),
  ('Welche Zellen vermitteln zytotoxische Abwehr?', 'CD8 T-Zellen', '["CD8 T-Zellen","B-Zellen","Neutrophile","Makrophagen"]'::jsonb, 'Immunologie', 'mittel', 'immunologie-extra-2026-02', 'CD8 T-Zellen töten virusinfizierte Zellen.'),
  ('Welches Zytokin ist zentral für die Th1-Antwort?', 'IFN-gamma', '["IFN-gamma","IL-4","IL-10","TGF-beta"]'::jsonb, 'Immunologie', 'schwer', 'immunologie-extra-2026-03', 'IFN-gamma fördert die Th1-Antwort.'),

  ('Wie viele Chromosomen hat der Mensch?', '46', '["46","44","48","52"]'::jsonb, 'Genetik', 'leicht', 'genetik-extra-2026-01', 'Der Mensch hat 46 Chromosomen.'),
  ('Wie nennt man das Fehlen eines Chromosoms?', 'Monosomie', '["Monosomie","Trisomie","Deletion","Duplikation"]'::jsonb, 'Genetik', 'mittel', 'genetik-extra-2026-02', 'Monosomie bedeutet fehlendes Chromosom.'),
  ('Welche Mutation führt zur Sichelzellanämie?', 'Glu->Val in beta-Globin', '["Glu->Val in beta-Globin","Trinukleotid-Expansion","Frameshift in BRCA1","Deletion von Exon 7"]'::jsonb, 'Genetik', 'schwer', 'genetik-extra-2026-03', 'Sichelzellanämie entsteht durch eine Punktmutation im beta-Globin.'),

  ('Welche Bildgebung ist erste Wahl bei Verdacht auf Fraktur?', 'Röntgen', '["Röntgen","CT","MRI","Ultraschall"]'::jsonb, 'Radiologie', 'leicht', 'radiologie-extra-2026-01', 'Röntgen ist die Erstbildgebung bei Frakturen.'),
  ('Welches Kontrastmittel wird beim CT häufig verwendet?', 'Iodhaltiges Kontrastmittel', '["Iodhaltiges Kontrastmittel","Gadolinium","Barium für MRI","Luft"]'::jsonb, 'Radiologie', 'mittel', 'radiologie-extra-2026-02', 'CT nutzt meist iodhaltige Kontrastmittel.'),
  ('Welche MRT-Sequenz zeigt Fett hell?', 'T1', '["T1","T2","STIR","DWI"]'::jsonb, 'Radiologie', 'schwer', 'radiologie-extra-2026-03', 'In T1-Sequenzen erscheint Fett hell.'),

  ('Wie nennt man das Entfernen des Blinddarms?', 'Appendektomie', '["Appendektomie","Cholezystektomie","Gastrektomie","Nephrektomie"]'::jsonb, 'Chirurgie', 'leicht', 'chirurgie-extra-2026-01', 'Bei der Appendektomie wird der Appendix entfernt.'),
  ('Welche Narkoseform wird für grosse Bauchoperationen typischerweise genutzt?', 'Allgemeinanästhesie', '["Allgemeinanästhesie","Lokalanästhesie","Regionalanästhesie","Sedierung ohne Analgesie"]'::jsonb, 'Chirurgie', 'mittel', 'chirurgie-extra-2026-02', 'Grosse OPs erfolgen meist in Allgemeinanästhesie.'),
  ('Welche Struktur muss bei Schilddrüsen-OP besonders geschont werden?', 'N. recurrens', '["N. recurrens","N. opticus","N. tibialis","N. phrenicus"]'::jsonb, 'Chirurgie', 'schwer', 'chirurgie-extra-2026-03', 'Der N. recurrens steuert die Stimmlippen.');
