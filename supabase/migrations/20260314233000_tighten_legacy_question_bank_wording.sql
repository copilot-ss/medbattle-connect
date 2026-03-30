-- Tighten wording and explanations for older legacy questions that were still
-- phrased too generically or had placeholder-style explanations.

with legacy_updates(slug, question, options, correct_answer, explanation) as (
  values
    (
      'leicht-1',
      'Welches Organ ist die muskulaere Pumpe des Lungen- und Koerperkreislaufs?',
      '["Leber","Herz","Lunge","Niere"]'::jsonb,
      'Herz',
      'Das Herz ist die muskulaere Pumpe des Kreislaufs. Es befoerdert venoeses Blut in den Lungenkreislauf und oxygeniertes Blut in den Koerperkreislauf.'
    ),
    (
      'leicht-2',
      'Wie viele Lungenfluegel besitzt der Mensch anatomisch?',
      '["Einen","Zwei","Drei","Vier"]'::jsonb,
      'Zwei',
      'Der Mensch besitzt zwei Lungenfluegel, einen rechten und einen linken. Die rechte Lunge hat drei Lappen, die linke wegen der Herzlage nur zwei.'
    ),
    (
      'leicht-3',
      'Welches Vitamin kann der menschliche Koerper in der Haut unter UV-B-Strahlung selbst bilden?',
      '["Vitamin A","Vitamin B12","Vitamin C","Vitamin D"]'::jsonb,
      'Vitamin D',
      'Vitamin D wird in der Haut aus Vorstufen gebildet, wenn UV-B-Strahlung einwirkt. Es ist zentral fuer die Kalziumhomoeostase und die Knochenmineralisation.'
    ),
    (
      'leicht-4',
      'Welcher zellulaere Blutbestandteil transportiert den groessten Teil des Sauerstoffs ueber Haemoglobin?',
      '["Leukozyten (weisse Blutkoerperchen)","Erythrozyten (rote Blutkoerperchen)","Thrombozyten (Blutplaettchen)","Blutplasma"]'::jsonb,
      'Erythrozyten (rote Blutkoerperchen)',
      'Erythrozyten enthalten Haemoglobin und transportieren so den groessten Teil des Sauerstoffs im Blut. Leukozyten dienen der Immunabwehr, Thrombozyten der Gerinnung.'
    ),
    (
      'leicht-5',
      'Ab welcher Koerperkerntemperatur spricht man klinisch in der Regel von Fieber?',
      '["Ab 37,0 C","Ab 37,5 C","Ab 38,0 C","Ab 39,0 C"]'::jsonb,
      'Ab 38,0 C',
      'Ab einer Koerperkerntemperatur von 38,0 C spricht man in der Regel von Fieber. Die Temperaturerhoehung beruht meist auf einer Sollwertanhebung im Hypothalamus.'
    ),
    (
      'leicht-6',
      'Wie viele bleibende Zaehne hat ein Erwachsener typischerweise einschliesslich aller vier Weisheitszaehne?',
      '["28","30","32","34"]'::jsonb,
      '32',
      'Ein vollstaendiges bleibendes Gebiss umfasst 32 Zaehne, wenn alle vier Weisheitszaehne vorhanden sind. Ohne Weisheitszaehne sind es meist 28.'
    ),
    (
      'leicht-7',
      'Welche ABO/Rhesus-Blutgruppe gilt bei Erythrozytentransfusionen als Universalempfaenger?',
      '["0-","A+","B-","AB+"]'::jsonb,
      'AB+',
      'Menschen mit AB+ koennen Erythrozyten aller ABO-Gruppen und beider Rhesusmerkmale empfangen. Deshalb gilt AB+ fuer Erythrozytentransfusionen als Universalempfaenger.'
    ),
    (
      'leicht-8',
      'Welches Mineral ist mengenmaessig am wichtigsten fuer die Mineralisation des menschlichen Knochens?',
      '["Zink","Kalzium","Jod","Eisen"]'::jsonb,
      'Kalzium',
      'Kalzium ist der wichtigste Mineralbestandteil des Knochens und wird zusammen mit Phosphat in die Hydroxylapatit-Struktur eingebaut. Dadurch erhaelt der Knochen seine Haerte.'
    ),
    (
      'leicht-9',
      'Aus wie vielen anatomischen Herzkammern besteht das menschliche Herz?',
      '["Zwei","Drei","Vier","Fuenf"]'::jsonb,
      'Vier',
      'Das Herz besteht aus zwei Vorhoefen und zwei Ventrikeln. Diese vier Hohlraeume trennen Lungen- und Koerperkreislauf funktionell voneinander.'
    ),
    (
      'leicht-10',
      'Welches paarige Organ filtert Blut im Glomerulus und bildet daraus Urin?',
      '["Milz","Nieren","Leber","Magen"]'::jsonb,
      'Nieren',
      'Die Nieren filtern das Blut ueber die Glomeruli und erzeugen so den Primaerharn. Durch tubulaere Rueckresorption und Sekretion entsteht daraus der endgueltige Urin.'
    ),
    (
      'leicht-11',
      'Wie viele Halswirbel umfasst die menschliche Halswirbelsaeule normalerweise?',
      '["Fuenf","Sieben","Acht","Zehn"]'::jsonb,
      'Sieben',
      'Die Halswirbelsaeule besteht regelhaft aus sieben Halswirbeln von C1 bis C7. Besonders Atlas und Axis ermoeglichen die hohe Beweglichkeit des Kopfes.'
    ),
    (
      'leicht-12',
      'Welches Sinnesorgan enthaelt das Riechepithel fuer den Geruchssinn?',
      '["Zunge","Auge","Nase","Ohr"]'::jsonb,
      'Nase',
      'Die Nase enthaelt im oberen Bereich der Nasenhoehle das Riechepithel mit den Geruchsrezeptoren. Deren Signale werden ueber den N. olfactorius weitergeleitet.'
    ),
    (
      'leicht-13',
      'In welcher Einheit wird der arterielle Blutdruck klassisch angegeben?',
      '["Millimeter Quecksilber (mmHg)","Milligramm (mg)","Liter (L)","Volt (V)"]'::jsonb,
      'Millimeter Quecksilber (mmHg)',
      'Der arterielle Blutdruck wird klassisch in Millimeter Quecksilber, also mmHg, angegeben. Die Einheit geht auf die Hoehe einer Quecksilbersaeule in aelteren Messgeraeten zurueck.'
    ),
    (
      'leicht-14',
      'Welches der genannten Organe zaehlt zu den akzessorischen Organen des Verdauungssystems?',
      '["Lunge","Leber","Herz","Milz"]'::jsonb,
      'Leber',
      'Die Leber gehoert als akzessorisches Organ zum Verdauungssystem, weil sie Galle bildet und zentrale Stoffwechselfunktionen uebernimmt. Sie ist aber kein Abschnitt des Darmlumens.'
    ),
    (
      'leicht-15',
      'Wie heisst der zellfreie fluessige Anteil des Blutes vor der Gerinnung?',
      '["Serum","Plasma","Lymphe","Rheuma"]'::jsonb,
      'Plasma',
      'Plasma ist der zellfreie fluessige Anteil des Blutes vor der Gerinnung. Im Gegensatz zum Serum enthaelt Plasma noch die Gerinnungsfaktoren.'
    ),
    (
      'anatomie-herz-01',
      'Welche Herzklappe liegt zwischen linkem Vorhof und linkem Ventrikel?',
      '["Mitralklappe (Bikuspidalklappe)","Aortenklappe","Trikuspidalklappe","Pulmonalklappe"]'::jsonb,
      'Mitralklappe (Bikuspidalklappe)',
      'Die Mitralklappe, auch Bikuspidalklappe genannt, liegt zwischen linkem Vorhof und linkem Ventrikel. Sie verhindert in der Systole den Rueckstrom von Blut in den linken Vorhof.'
    ),
    (
      'physiologie-lunge-02',
      'Welches Lungenvolumen verbleibt auch nach maximaler forcierter Ausatmung in der Lunge?',
      '["Residualvolumen","Atemzugvolumen","Vitalkapazitaet","Inspiratorisches Reservevolumen"]'::jsonb,
      'Residualvolumen',
      'Das Residualvolumen ist die Luftmenge, die selbst nach maximaler Ausatmung in der Lunge verbleibt. Es verhindert unter anderem einen Kollaps der Alveolen.'
    ),
    (
      'anatomie-neuro-02',
      'Welcher Hirnabschnitt ist vor allem fuer Koordination und Feinabstimmung willkuerlicher Bewegungen zustaendig?',
      '["Kleinhirn","Thalamus","Hirnstamm","Hypothalamus"]'::jsonb,
      'Kleinhirn',
      'Das Kleinhirn koordiniert Bewegungsablaeufe, Gleichgewicht und Feinmotorik. Laesionen fuehren typischerweise zu Ataxie, Dysmetrie und Intentionstremor.'
    ),
    (
      'physiologie-haema-01',
      'Welche kernlosen Blutzellen transportieren Sauerstoff ueber Haemoglobin?',
      '["Erythrozyten","Leukozyten","Thrombozyten","Monozyten"]'::jsonb,
      'Erythrozyten',
      'Erythrozyten transportieren Sauerstoff ueber Haemoglobin und besitzen beim Menschen keinen Zellkern. Leukozyten und Monozyten gehoeren zur Immunabwehr, Thrombozyten zur Gerinnung.'
    ),
    (
      'anatomie-oph-01',
      'Welche Augenstruktur steuert ueber die Pupillenweite den Lichteinfall?',
      '["Iris (Regenbogenhaut)","Linse","Netzhaut","Aderhaut"]'::jsonb,
      'Iris (Regenbogenhaut)',
      'Die Iris reguliert ueber den Musculus sphincter und dilatator pupillae die Pupillenweite. Damit bestimmt sie, wie viel Licht in das Auge einfaellt.'
    ),
    (
      'physiologie-herz-02',
      'Mit welcher Formel berechnet man das Herzzeitvolumen (HZV)?',
      '["Schlagvolumen x Herzfrequenz","Herzfrequenz / Schlagvolumen","Blutdruck x Pulsdruck","Atemfrequenz x Blutdruck"]'::jsonb,
      'Schlagvolumen x Herzfrequenz',
      'Das Herzzeitvolumen ergibt sich aus Schlagvolumen mal Herzfrequenz. Es beschreibt, welche Blutmenge das Herz pro Minute in den Kreislauf pumpt.'
    ),
    (
      'pathologie-neuro-01',
      'Was ist bei Erwachsenen die haeufigste Ursache einer spontanen Subarachnoidalblutung?',
      '["Ruptur eines sakkulaeren Aneurysmas","Thrombose der A. carotis","Sinusvenenthrombose","Hirnabszess"]'::jsonb,
      'Ruptur eines sakkulaeren Aneurysmas',
      'Die haeufigste Ursache einer spontanen Subarachnoidalblutung bei Erwachsenen ist die Ruptur eines sakkulaeren Aneurysmas im Circulus arteriosus Willisii. Traumatische Blutungen sind davon abzugrenzen.'
    ),
    (
      'anatomie-oph-02',
      'Welche Stelle der Netzhaut ermoeglicht das schaerfste Sehen?',
      '["Fovea centralis","Papille","Glaskoerper","Ziliarkoerper"]'::jsonb,
      'Fovea centralis',
      'Die Fovea centralis ist der Ort des schaerfsten Sehens, weil dort die Zapfendichte am hoechsten ist. Deshalb ist sie fuer hochaufgeloestes Farb- und Detailsehen entscheidend.'
    ),
    (
      'anatomie-extra-2026-02',
      'Welche Nervenstruktur verlaeuft zusammen mit den Beugesehnen durch den Karpaltunnel (Canalis carpi)?',
      '["N. medianus","N. ulnaris","N. radialis","N. musculocutaneus"]'::jsonb,
      'N. medianus',
      'Durch den Karpaltunnel ziehen der N. medianus und die Beugesehnen der Finger. Eine Einengung in diesem Tunnel fuehrt typischerweise zum Karpaltunnelsyndrom.'
    ),
    (
      'physiologie-extra-2026-03',
      'Welcher insulinabhaengige Glukosetransporter ist fuer die Glukoseaufnahme in Skelettmuskel- und Fettzellen entscheidend?',
      '["GLUT4","GLUT1","GLUT2","SGLT1"]'::jsonb,
      'GLUT4',
      'GLUT4 ist der insulinabhaengige Glukosetransporter von Muskel- und Fettzellen. Nach Insulinwirkung wird GLUT4 in die Zellmembran eingebaut und erhoeht dort die Glukoseaufnahme.'
    )
)
update public.questions q
set
  question = legacy_updates.question,
  options = legacy_updates.options,
  correct_answer = legacy_updates.correct_answer,
  explanation = legacy_updates.explanation,
  updated_at = timezone('utc', now())
from legacy_updates
where q.slug = legacy_updates.slug;

with legacy_updates(slug, question, options, correct_answer, explanation) as (
  values
    (
      'leicht-1',
      'Welches Organ ist die muskulaere Pumpe des Lungen- und Koerperkreislaufs?',
      '["Leber","Herz","Lunge","Niere"]'::jsonb,
      'Herz',
      'Das Herz ist die muskulaere Pumpe des Kreislaufs. Es befoerdert venoeses Blut in den Lungenkreislauf und oxygeniertes Blut in den Koerperkreislauf.'
    ),
    (
      'leicht-2',
      'Wie viele Lungenfluegel besitzt der Mensch anatomisch?',
      '["Einen","Zwei","Drei","Vier"]'::jsonb,
      'Zwei',
      'Der Mensch besitzt zwei Lungenfluegel, einen rechten und einen linken. Die rechte Lunge hat drei Lappen, die linke wegen der Herzlage nur zwei.'
    ),
    (
      'leicht-3',
      'Welches Vitamin kann der menschliche Koerper in der Haut unter UV-B-Strahlung selbst bilden?',
      '["Vitamin A","Vitamin B12","Vitamin C","Vitamin D"]'::jsonb,
      'Vitamin D',
      'Vitamin D wird in der Haut aus Vorstufen gebildet, wenn UV-B-Strahlung einwirkt. Es ist zentral fuer die Kalziumhomoeostase und die Knochenmineralisation.'
    ),
    (
      'leicht-4',
      'Welcher zellulaere Blutbestandteil transportiert den groessten Teil des Sauerstoffs ueber Haemoglobin?',
      '["Leukozyten (weisse Blutkoerperchen)","Erythrozyten (rote Blutkoerperchen)","Thrombozyten (Blutplaettchen)","Blutplasma"]'::jsonb,
      'Erythrozyten (rote Blutkoerperchen)',
      'Erythrozyten enthalten Haemoglobin und transportieren so den groessten Teil des Sauerstoffs im Blut. Leukozyten dienen der Immunabwehr, Thrombozyten der Gerinnung.'
    ),
    (
      'leicht-5',
      'Ab welcher Koerperkerntemperatur spricht man klinisch in der Regel von Fieber?',
      '["Ab 37,0 C","Ab 37,5 C","Ab 38,0 C","Ab 39,0 C"]'::jsonb,
      'Ab 38,0 C',
      'Ab einer Koerperkerntemperatur von 38,0 C spricht man in der Regel von Fieber. Die Temperaturerhoehung beruht meist auf einer Sollwertanhebung im Hypothalamus.'
    ),
    (
      'leicht-6',
      'Wie viele bleibende Zaehne hat ein Erwachsener typischerweise einschliesslich aller vier Weisheitszaehne?',
      '["28","30","32","34"]'::jsonb,
      '32',
      'Ein vollstaendiges bleibendes Gebiss umfasst 32 Zaehne, wenn alle vier Weisheitszaehne vorhanden sind. Ohne Weisheitszaehne sind es meist 28.'
    ),
    (
      'leicht-7',
      'Welche ABO/Rhesus-Blutgruppe gilt bei Erythrozytentransfusionen als Universalempfaenger?',
      '["0-","A+","B-","AB+"]'::jsonb,
      'AB+',
      'Menschen mit AB+ koennen Erythrozyten aller ABO-Gruppen und beider Rhesusmerkmale empfangen. Deshalb gilt AB+ fuer Erythrozytentransfusionen als Universalempfaenger.'
    ),
    (
      'leicht-8',
      'Welches Mineral ist mengenmaessig am wichtigsten fuer die Mineralisation des menschlichen Knochens?',
      '["Zink","Kalzium","Jod","Eisen"]'::jsonb,
      'Kalzium',
      'Kalzium ist der wichtigste Mineralbestandteil des Knochens und wird zusammen mit Phosphat in die Hydroxylapatit-Struktur eingebaut. Dadurch erhaelt der Knochen seine Haerte.'
    ),
    (
      'leicht-9',
      'Aus wie vielen anatomischen Herzkammern besteht das menschliche Herz?',
      '["Zwei","Drei","Vier","Fuenf"]'::jsonb,
      'Vier',
      'Das Herz besteht aus zwei Vorhoefen und zwei Ventrikeln. Diese vier Hohlraeume trennen Lungen- und Koerperkreislauf funktionell voneinander.'
    ),
    (
      'leicht-10',
      'Welches paarige Organ filtert Blut im Glomerulus und bildet daraus Urin?',
      '["Milz","Nieren","Leber","Magen"]'::jsonb,
      'Nieren',
      'Die Nieren filtern das Blut ueber die Glomeruli und erzeugen so den Primaerharn. Durch tubulaere Rueckresorption und Sekretion entsteht daraus der endgueltige Urin.'
    ),
    (
      'leicht-11',
      'Wie viele Halswirbel umfasst die menschliche Halswirbelsaeule normalerweise?',
      '["Fuenf","Sieben","Acht","Zehn"]'::jsonb,
      'Sieben',
      'Die Halswirbelsaeule besteht regelhaft aus sieben Halswirbeln von C1 bis C7. Besonders Atlas und Axis ermoeglichen die hohe Beweglichkeit des Kopfes.'
    ),
    (
      'leicht-12',
      'Welches Sinnesorgan enthaelt das Riechepithel fuer den Geruchssinn?',
      '["Zunge","Auge","Nase","Ohr"]'::jsonb,
      'Nase',
      'Die Nase enthaelt im oberen Bereich der Nasenhoehle das Riechepithel mit den Geruchsrezeptoren. Deren Signale werden ueber den N. olfactorius weitergeleitet.'
    ),
    (
      'leicht-13',
      'In welcher Einheit wird der arterielle Blutdruck klassisch angegeben?',
      '["Millimeter Quecksilber (mmHg)","Milligramm (mg)","Liter (L)","Volt (V)"]'::jsonb,
      'Millimeter Quecksilber (mmHg)',
      'Der arterielle Blutdruck wird klassisch in Millimeter Quecksilber, also mmHg, angegeben. Die Einheit geht auf die Hoehe einer Quecksilbersaeule in aelteren Messgeraeten zurueck.'
    ),
    (
      'leicht-14',
      'Welches der genannten Organe zaehlt zu den akzessorischen Organen des Verdauungssystems?',
      '["Lunge","Leber","Herz","Milz"]'::jsonb,
      'Leber',
      'Die Leber gehoert als akzessorisches Organ zum Verdauungssystem, weil sie Galle bildet und zentrale Stoffwechselfunktionen uebernimmt. Sie ist aber kein Abschnitt des Darmlumens.'
    ),
    (
      'leicht-15',
      'Wie heisst der zellfreie fluessige Anteil des Blutes vor der Gerinnung?',
      '["Serum","Plasma","Lymphe","Rheuma"]'::jsonb,
      'Plasma',
      'Plasma ist der zellfreie fluessige Anteil des Blutes vor der Gerinnung. Im Gegensatz zum Serum enthaelt Plasma noch die Gerinnungsfaktoren.'
    ),
    (
      'anatomie-herz-01',
      'Welche Herzklappe liegt zwischen linkem Vorhof und linkem Ventrikel?',
      '["Mitralklappe (Bikuspidalklappe)","Aortenklappe","Trikuspidalklappe","Pulmonalklappe"]'::jsonb,
      'Mitralklappe (Bikuspidalklappe)',
      'Die Mitralklappe, auch Bikuspidalklappe genannt, liegt zwischen linkem Vorhof und linkem Ventrikel. Sie verhindert in der Systole den Rueckstrom von Blut in den linken Vorhof.'
    ),
    (
      'physiologie-lunge-02',
      'Welches Lungenvolumen verbleibt auch nach maximaler forcierter Ausatmung in der Lunge?',
      '["Residualvolumen","Atemzugvolumen","Vitalkapazitaet","Inspiratorisches Reservevolumen"]'::jsonb,
      'Residualvolumen',
      'Das Residualvolumen ist die Luftmenge, die selbst nach maximaler Ausatmung in der Lunge verbleibt. Es verhindert unter anderem einen Kollaps der Alveolen.'
    ),
    (
      'anatomie-neuro-02',
      'Welcher Hirnabschnitt ist vor allem fuer Koordination und Feinabstimmung willkuerlicher Bewegungen zustaendig?',
      '["Kleinhirn","Thalamus","Hirnstamm","Hypothalamus"]'::jsonb,
      'Kleinhirn',
      'Das Kleinhirn koordiniert Bewegungsablaeufe, Gleichgewicht und Feinmotorik. Laesionen fuehren typischerweise zu Ataxie, Dysmetrie und Intentionstremor.'
    ),
    (
      'physiologie-haema-01',
      'Welche kernlosen Blutzellen transportieren Sauerstoff ueber Haemoglobin?',
      '["Erythrozyten","Leukozyten","Thrombozyten","Monozyten"]'::jsonb,
      'Erythrozyten',
      'Erythrozyten transportieren Sauerstoff ueber Haemoglobin und besitzen beim Menschen keinen Zellkern. Leukozyten und Monozyten gehoeren zur Immunabwehr, Thrombozyten zur Gerinnung.'
    ),
    (
      'anatomie-oph-01',
      'Welche Augenstruktur steuert ueber die Pupillenweite den Lichteinfall?',
      '["Iris (Regenbogenhaut)","Linse","Netzhaut","Aderhaut"]'::jsonb,
      'Iris (Regenbogenhaut)',
      'Die Iris reguliert ueber den Musculus sphincter und dilatator pupillae die Pupillenweite. Damit bestimmt sie, wie viel Licht in das Auge einfaellt.'
    ),
    (
      'physiologie-herz-02',
      'Mit welcher Formel berechnet man das Herzzeitvolumen (HZV)?',
      '["Schlagvolumen x Herzfrequenz","Herzfrequenz / Schlagvolumen","Blutdruck x Pulsdruck","Atemfrequenz x Blutdruck"]'::jsonb,
      'Schlagvolumen x Herzfrequenz',
      'Das Herzzeitvolumen ergibt sich aus Schlagvolumen mal Herzfrequenz. Es beschreibt, welche Blutmenge das Herz pro Minute in den Kreislauf pumpt.'
    ),
    (
      'pathologie-neuro-01',
      'Was ist bei Erwachsenen die haeufigste Ursache einer spontanen Subarachnoidalblutung?',
      '["Ruptur eines sakkulaeren Aneurysmas","Thrombose der A. carotis","Sinusvenenthrombose","Hirnabszess"]'::jsonb,
      'Ruptur eines sakkulaeren Aneurysmas',
      'Die haeufigste Ursache einer spontanen Subarachnoidalblutung bei Erwachsenen ist die Ruptur eines sakkulaeren Aneurysmas im Circulus arteriosus Willisii. Traumatische Blutungen sind davon abzugrenzen.'
    ),
    (
      'anatomie-oph-02',
      'Welche Stelle der Netzhaut ermoeglicht das schaerfste Sehen?',
      '["Fovea centralis","Papille","Glaskoerper","Ziliarkoerper"]'::jsonb,
      'Fovea centralis',
      'Die Fovea centralis ist der Ort des schaerfsten Sehens, weil dort die Zapfendichte am hoechsten ist. Deshalb ist sie fuer hochaufgeloestes Farb- und Detailsehen entscheidend.'
    ),
    (
      'anatomie-extra-2026-02',
      'Welche Nervenstruktur verlaeuft zusammen mit den Beugesehnen durch den Karpaltunnel (Canalis carpi)?',
      '["N. medianus","N. ulnaris","N. radialis","N. musculocutaneus"]'::jsonb,
      'N. medianus',
      'Durch den Karpaltunnel ziehen der N. medianus und die Beugesehnen der Finger. Eine Einengung in diesem Tunnel fuehrt typischerweise zum Karpaltunnelsyndrom.'
    ),
    (
      'physiologie-extra-2026-03',
      'Welcher insulinabhaengige Glukosetransporter ist fuer die Glukoseaufnahme in Skelettmuskel- und Fettzellen entscheidend?',
      '["GLUT4","GLUT1","GLUT2","SGLT1"]'::jsonb,
      'GLUT4',
      'GLUT4 ist der insulinabhaengige Glukosetransporter von Muskel- und Fettzellen. Nach Insulinwirkung wird GLUT4 in die Zellmembran eingebaut und erhoeht dort die Glukoseaufnahme.'
    )
)
update public.question_translations qt
set
  question = legacy_updates.question,
  options = legacy_updates.options,
  correct_answer = legacy_updates.correct_answer,
  explanation = legacy_updates.explanation,
  updated_at = timezone('utc', now())
from public.questions q
join legacy_updates on legacy_updates.slug = q.slug
where qt.question_id = q.id
  and qt.language = 'de';
