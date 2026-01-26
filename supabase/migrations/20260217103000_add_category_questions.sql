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
  ('Welche Klappe trennt linken Vorhof und linken Ventrikel?', 'Mitralklappe', '["Mitralklappe","Aortenklappe","Trikuspidalklappe","Pulmonalklappe"]'::jsonb, 'Anatomie', 'leicht', 'anatomie-herz-01', 'Die Mitralklappe liegt zwischen linkem Vorhof und linkem Ventrikel.'),
  ('Welche EKG-Welle repräsentiert die Vorhoferregung?', 'P-Welle', '["P-Welle","QRS-Komplex","T-Welle","U-Welle"]'::jsonb, 'Physiologie', 'leicht', 'physiologie-herz-01', 'Die P-Welle steht für die Depolarisation der Vorhöfe.'),
  ('Wie berechnet man das Herzzeitvolumen?', 'Schlagvolumen x Herzfrequenz', '["Schlagvolumen x Herzfrequenz","Herzfrequenz / Schlagvolumen","Blutdruck x Pulsdruck","Atemfrequenz x Blutdruck"]'::jsonb, 'Physiologie', 'mittel', 'physiologie-herz-02', 'Herzzeitvolumen ist Schlagvolumen multipliziert mit der Herzfrequenz.'),

  ('Wo findet der Gasaustausch in der Lunge statt?', 'Alveolen', '["Alveolen","Bronchien","Pleura","Trachea"]'::jsonb, 'Physiologie', 'leicht', 'physiologie-lunge-01', 'In den Alveolen diffundieren Sauerstoff und Kohlendioxid.'),
  ('Welcher Muskel ist der wichtigste Atemmuskel?', 'Zwerchfell', '["Zwerchfell","Interkostalmuskeln","M. sternocleidomastoideus","Bauchmuskeln"]'::jsonb, 'Anatomie', 'leicht', 'anatomie-lunge-01', 'Das Zwerchfell ist der wichtigste Atemmuskel.'),
  ('Welches Volumen bleibt nach maximaler Ausatmung in der Lunge?', 'Residualvolumen', '["Residualvolumen","Atemzugvolumen","Vitalkapazität","Inspiratorisches Reservevolumen"]'::jsonb, 'Physiologie', 'mittel', 'physiologie-lunge-02', 'Das Residualvolumen bleibt auch nach maximaler Ausatmung bestehen.'),

  ('Wo findet die Ultrafiltration in der Niere statt?', 'Glomerulus', '["Glomerulus","Henle-Schleife","Sammelrohr","Distaler Tubulus"]'::jsonb, 'Physiologie', 'leicht', 'physiologie-niere-01', 'Die Ultrafiltration erfolgt im Glomerulus.'),
  ('Welches Hormon wird in der Niere gebildet und fördert die Erythropoese?', 'Erythropoetin', '["Erythropoetin","Insulin","Aldosteron","ADH"]'::jsonb, 'Physiologie', 'mittel', 'physiologie-niere-02', 'Erythropoetin wird in der Niere gebildet und stimuliert die Erythropoese.'),
  ('Welche Struktur ist entscheidend für die Gegenstrommultiplikation?', 'Henle-Schleife', '["Henle-Schleife","Bowman-Kapsel","Proximaler Tubulus","Glomerulus"]'::jsonb, 'Physiologie', 'mittel', 'physiologie-niere-03', 'Die Henle-Schleife ermöglicht die Gegenstrommultiplikation.'),

  ('Welches Protein wird hauptsächlich in der Leber gebildet und hält den kolloidosmotischen Druck?', 'Albumin', '["Albumin","Fibrinogen","Immunglobulin","Transferrin"]'::jsonb, 'Physiologie', 'leicht', 'physiologie-leber-01', 'Albumin ist das wichtigste Plasmaprotein für den kolloidosmotischen Druck.'),
  ('Welches Enzym ist typisch erhöht bei cholestatischem Leberschaden?', 'Alkalische Phosphatase', '["Alkalische Phosphatase","Amylase","Troponin","CK-MB"]'::jsonb, 'Pathologie', 'mittel', 'pathologie-leber-01', 'ALP ist ein typischer Marker für Cholestase.'),
  ('Welches Toxin wird in der Leber zu Harnstoff entgiftet?', 'Ammoniak', '["Ammoniak","Laktat","Glukose","Bilirubin"]'::jsonb, 'Physiologie', 'mittel', 'physiologie-leber-02', 'Ammoniak wird im Harnstoffzyklus entgiftet.'),

  ('Welcher Hirnnerv innerviert den M. rectus lateralis?', 'N. abducens (VI)', '["N. abducens (VI)","N. oculomotorius (III)","N. trochlearis (IV)","N. trigeminus (V)"]'::jsonb, 'Anatomie', 'leicht', 'anatomie-neuro-01', 'Der N. abducens innerviert den M. rectus lateralis.'),
  ('Welcher Hirnabschnitt koordiniert Bewegungen?', 'Kleinhirn', '["Kleinhirn","Thalamus","Hirnstamm","Hypothalamus"]'::jsonb, 'Anatomie', 'mittel', 'anatomie-neuro-02', 'Das Kleinhirn ist für Koordination und Feinabstimmung zuständig.'),
  ('Häufigste Ursache einer Subarachnoidalblutung?', 'Ruptur eines Aneurysmas', '["Ruptur eines Aneurysmas","Thrombose der A. carotis","Sinusvenenthrombose","Hirnabszess"]'::jsonb, 'Pathologie', 'mittel', 'pathologie-neuro-01', 'Meistens entsteht die SAB durch Ruptur eines sakkulären Aneurysmas.'),

  ('Welche Drüsenstruktur produziert TSH?', 'Adenohypophyse', '["Adenohypophyse","Neurohypophyse","Nebennierenmark","Schilddrüse"]'::jsonb, 'Physiologie', 'leicht', 'physiologie-endo-01', 'TSH wird im Hypophysenvorderlappen gebildet.'),
  ('Welches Hormon wird in der Nebennierenrinde gebildet und erhöht den Blutdruck?', 'Aldosteron', '["Aldosteron","Adrenalin","Insulin","Glukagon"]'::jsonb, 'Physiologie', 'leicht', 'physiologie-endo-02', 'Aldosteron steigert die Natrium- und Wasserretention.'),
  ('Welches Hormon fördert die Aufnahme von Glukose in Zellen?', 'Insulin', '["Insulin","Glukagon","Cortisol","Adrenalin"]'::jsonb, 'Physiologie', 'mittel', 'physiologie-endo-03', 'Insulin erhöht die Glukoseaufnahme in die Zellen.'),

  ('Welche Struktur speichert Galle?', 'Gallenblase', '["Gallenblase","Pankreas","Milz","Duodenum"]'::jsonb, 'Anatomie', 'leicht', 'anatomie-gastro-01', 'Die Gallenblase speichert und konzentriert die Galle.'),
  ('Welcher Erreger verursacht häufig peptische Ulzera?', 'Helicobacter pylori', '["Helicobacter pylori","E. coli","Salmonella enterica","Campylobacter jejuni"]'::jsonb, 'Mikrobiologie', 'mittel', 'mikrobiologie-gastro-01', 'Helicobacter pylori ist eine häufige Ursache von Ulzera.'),
  ('Wo wird Vitamin B12 hauptsächlich resorbiert?', 'Terminales Ileum', '["Terminales Ileum","Duodenum","Jejunum","Colon"]'::jsonb, 'Physiologie', 'mittel', 'physiologie-gastro-01', 'Vitamin B12 wird im terminalen Ileum resorbiert.'),

  ('Welche Zellen transportieren Sauerstoff?', 'Erythrozyten', '["Erythrozyten","Leukozyten","Thrombozyten","Monozyten"]'::jsonb, 'Physiologie', 'leicht', 'physiologie-haema-01', 'Erythrozyten enthalten Hämoglobin und transportieren Sauerstoff.'),
  ('Welche Gerinnungszeit prüft vor allem die extrinsische Kaskade?', 'Quick/INR', '["Quick/INR","aPTT","Thrombinzeit","Blutungszeit"]'::jsonb, 'Physiologie', 'mittel', 'physiologie-haema-02', 'Quick/INR testet vorrangig die extrinsische Gerinnung.'),
  ('Welches Vitamin ist bei perniziöser Anämie vermindert?', 'Vitamin B12', '["Vitamin B12","Vitamin C","Vitamin D","Vitamin K"]'::jsonb, 'Pathologie', 'mittel', 'pathologie-haema-01', 'Perniziöse Anämie entsteht durch Vitamin-B12-Mangel.'),

  ('Welcher UV-Bereich verursacht Sonnenbrand am ehesten?', 'UVB', '["UVB","UVA","UVC","Infrarot"]'::jsonb, 'Pathologie', 'leicht', 'pathologie-derm-01', 'UVB ist hauptsächlich für den Sonnenbrand verantwortlich.'),
  ('Wie heisst die oberste Hautschicht?', 'Epidermis', '["Epidermis","Dermis","Subkutis","Faszie"]'::jsonb, 'Anatomie', 'leicht', 'anatomie-derm-01', 'Die Epidermis ist die oberste Hautschicht.'),
  ('Welcher Erreger verursacht häufig Impetigo contagiosa?', 'Staphylococcus aureus', '["Staphylococcus aureus","Escherichia coli","Candida albicans","Mycoplasma pneumoniae"]'::jsonb, 'Mikrobiologie', 'mittel', 'mikrobiologie-derm-01', 'Impetigo wird häufig durch Staphylococcus aureus verursacht.'),

  ('Welche Struktur reguliert den Lichteinfall ins Auge?', 'Iris', '["Iris","Linse","Netzhaut","Aderhaut"]'::jsonb, 'Anatomie', 'leicht', 'anatomie-oph-01', 'Die Iris steuert die Pupillenweite und damit den Lichteinfall.'),
  ('Welche Struktur sorgt für das scharfe Sehen?', 'Fovea centralis', '["Fovea centralis","Papille","Glaskörper","Ziliarkörper"]'::jsonb, 'Anatomie', 'mittel', 'anatomie-oph-02', 'Die Fovea centralis ist der Ort des schärfsten Sehens.'),
  ('Welcher Druck ist bei Glaukom typischerweise erhöht?', 'Augeninnendruck', '["Augeninnendruck","Blutdruck","Liquordruck","Pulsdruck"]'::jsonb, 'Pathologie', 'mittel', 'pathologie-oph-01', 'Beim Glaukom ist der Augeninnendruck oft erhöht.');
