-- Replace placeholder quiz explanations with contextual fallbacks and manual overrides.

create or replace function public.build_fallback_question_explanation(
  p_correct_answer text,
  p_language text default 'de'
)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  normalized_language text := lower(coalesce(trim(p_language), 'de'));
  normalized_answer text := nullif(trim(coalesce(p_correct_answer, '')), '');
begin
  if normalized_answer is null then
    if normalized_language = 'en' then
      return 'Review the stem again and focus on the key medical fact being tested.';
    end if;
    return 'Pruefe den Fragetext noch einmal und achte auf die medizinische Kernaussage.';
  end if;

  if normalized_language = 'en' then
    return format(
      '%s is correct because it best matches the key medical fact asked in this question.',
      normalized_answer
    );
  end if;

  return format(
    '%s ist richtig, weil diese Antwort die medizinische Kernaussage der Frage am besten trifft.',
    normalized_answer
  );
end;
$$;

create or replace function public.build_contextual_question_explanation(
  p_question text,
  p_correct_answer text,
  p_language text default 'de'
)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  normalized_language text := lower(coalesce(trim(p_language), 'de'));
  normalized_question text := lower(trim(coalesce(p_question, '')));
  normalized_answer text := nullif(trim(coalesce(p_correct_answer, '')), '');
  answer_or_placeholder text;
begin
  answer_or_placeholder := coalesce(normalized_answer, case when normalized_language = 'en' then 'This option' else 'Diese Antwort' end);

  if normalized_question = '' then
    return public.build_fallback_question_explanation(normalized_answer, normalized_language);
  end if;

  if normalized_language = 'en' then
    if normalized_question like 'how many %' then
      return format(
        '%s is correct because that is the usual number in normal human anatomy or physiology.',
        answer_or_placeholder
      );
    elsif normalized_question like 'which organ %' or normalized_question like 'what organ %' then
      return 'This option is correct because the named organ performs the main function described in the stem.';
    elsif normalized_question like 'which structure %'
      or normalized_question like 'what structure %' then
      return 'This option is correct because that structure fulfills the anatomical role asked for in the question.';
    elsif normalized_question like 'which nerve %'
      or normalized_question like 'what nerve %' then
      return 'This option is correct because that nerve supplies the structure or function named in the stem.';
    elsif normalized_question like 'which artery %'
      or normalized_question like 'what artery %' then
      return 'This option is correct because that artery supplies the region asked for in the question.';
    elsif normalized_question like 'which score %'
      or normalized_question like 'what score %' then
      return 'This option is correct because that score is used for the risk stratification or severity assessment mentioned in the stem.';
    elsif normalized_question like 'which medicine %'
      or normalized_question like 'which medication %'
      or normalized_question like 'which anticoagulant %'
      or normalized_question like 'which inhaled medication %'
      or normalized_question like 'what medicine %'
      or normalized_question like 'what medication %'
      or normalized_question like 'which antidote %' then
      return 'This option is correct because it is the standard drug or antidote for the clinical situation asked about here.';
    elsif normalized_question like 'which mutation %'
      or normalized_question like 'what mutation %'
      or normalized_question like 'which genetic %'
      or normalized_question like 'what genetic %' then
      return 'This option is correct because that genetic change is classically associated with the disease named in the stem.';
    elsif normalized_question like 'which hormone %'
      or normalized_question like 'what hormone %' then
      return 'This option is correct because that hormone is the key regulator asked for in the question.';
    elsif normalized_question like 'which vitamin %'
      or normalized_question like 'what vitamin %' then
      return 'This option is correct because that vitamin is essential for the physiologic function described in the stem.';
    elsif normalized_question like 'which mineral %'
      or normalized_question like 'what mineral %' then
      return 'This option is correct because that mineral is especially important for the function named in the question.';
    elsif normalized_question like 'which blood group %'
      or normalized_question like 'what blood group %' then
      return 'This option is correct because that blood group can receive red cells from all ABO groups under standard transfusion rules.';
    elsif normalized_question like 'which cells %'
      or normalized_question like 'which cell %'
      or normalized_question like 'what cells %'
      or normalized_question like 'what cell %' then
      return 'This option is correct because those cells carry out the immune or pathologic role asked about here.';
    elsif normalized_question like 'which pathogen %'
      or normalized_question like 'which bacterium %'
      or normalized_question like 'which fungus %'
      or normalized_question like 'which virus %'
      or normalized_question like 'which fungal %'
      or normalized_question like 'what bacterium %'
      or normalized_question like 'what fungus %'
      or normalized_question like 'what virus %'
      or normalized_question like 'what fungal infection %' then
      return 'This option is correct because it is the classic pathogen or infection associated with the condition named in the stem.';
    elsif normalized_question like 'what is a %'
      or normalized_question like 'what is an %' then
      return 'This option is correct because it best matches the definition asked for in the question.';
    elsif normalized_question like 'what is the fluid portion %' then
      return 'This option is correct because it names the liquid component that remains when the cellular elements are excluded.';
    else
      return public.build_fallback_question_explanation(normalized_answer, normalized_language);
    end if;
  end if;

  if normalized_question like 'wie viele %' then
    return format(
      '%s ist richtig, weil dies die normale Anzahl in der menschlichen Anatomie oder Physiologie ist.',
      answer_or_placeholder
    );
  elsif normalized_question like 'welches organ %' then
    return 'Diese Antwort ist richtig, weil das genannte Organ die im Fragetext beschriebene Hauptaufgabe uebernimmt.';
  elsif normalized_question like 'welche struktur %' then
    return 'Diese Antwort ist richtig, weil die genannte Struktur die in der Frage gesuchte anatomische Funktion erfuellt.';
  elsif normalized_question like 'welcher nerv %' then
    return 'Diese Antwort ist richtig, weil der genannte Nerv die gesuchte Struktur oder Funktion versorgt.';
  elsif normalized_question like 'welche arterie %' then
    return 'Diese Antwort ist richtig, weil die genannte Arterie das in der Frage beschriebene Gebiet versorgt.';
  elsif normalized_question like 'welcher score %' then
    return 'Diese Antwort ist richtig, weil dieser Score fuer die im Fragetext genannte Risiko- oder Schwereeinschaetzung verwendet wird.';
  elsif normalized_question like 'welches medikament %'
    or normalized_question like 'welches antikoagulans %'
    or normalized_question like 'welches inhalative medikament %'
    or normalized_question like 'welches antidot %' then
    return 'Diese Antwort ist richtig, weil das genannte Medikament oder Antidot klassisch fuer die beschriebene Situation eingesetzt wird.';
  elsif normalized_question like 'welche mutation %'
    or normalized_question like 'welche genetische veraenderung %' then
    return 'Diese Antwort ist richtig, weil diese genetische Veraenderung typisch mit dem genannten Krankheitsbild verbunden ist.';
  elsif normalized_question like 'welches hormon %' then
    return 'Diese Antwort ist richtig, weil das genannte Hormon die in der Frage beschriebene Regulationsfunktion uebernimmt.';
  elsif normalized_question like 'welches vitamin %' then
    return 'Diese Antwort ist richtig, weil dieses Vitamin fuer die genannte physiologische Funktion wichtig ist.';
  elsif normalized_question like 'welches mineral %' then
    return 'Diese Antwort ist richtig, weil dieses Mineral fuer die angesprochene Koerperfunktion besonders relevant ist.';
  elsif normalized_question like 'welche zellen %'
    or normalized_question like 'welche zellart %' then
    return 'Diese Antwort ist richtig, weil die genannten Zellen die im Fragetext beschriebene immunologische oder pathologische Rolle haben.';
  elsif normalized_question like 'welcher erreger %'
    or normalized_question like 'welches bakterium %'
    or normalized_question like 'welcher pilz %'
    or normalized_question like 'welcher virustyp %'
    or normalized_question like 'welche pilzinfektion %' then
    return 'Diese Antwort ist richtig, weil sie den typischen Erreger oder die typische Infektion fuer das genannte Krankheitsbild bezeichnet.';
  elsif normalized_question like 'wie nennt man %' then
    return 'Diese Antwort ist richtig, weil sie den passenden medizinischen Fachbegriff fuer den beschriebenen Sachverhalt nennt.';
  elsif normalized_question like 'was ist ein %'
    or normalized_question like 'was ist eine %' then
    return 'Diese Antwort ist richtig, weil sie die gesuchte medizinische Definition am besten trifft.';
  else
    return public.build_fallback_question_explanation(normalized_answer, normalized_language);
  end if;
end;
$$;

create or replace function public.ensure_questions_explanation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.explanation is null or btrim(new.explanation) = '' then
    new.explanation := public.build_contextual_question_explanation(
      new.question,
      new.correct_answer,
      'de'
    );
  end if;
  return new;
end;
$$;

create or replace function public.ensure_question_translations_explanation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.explanation is null or btrim(new.explanation) = '' then
    new.explanation := public.build_contextual_question_explanation(
      new.question,
      new.correct_answer,
      new.language
    );
  end if;
  return new;
end;
$$;

update public.questions
set question = case slug
  when 'cf61219aed42d992b729f1fdd951329d' then 'Welcher Pilz bildet verzweigte, filamentoese Hyphen und verursacht opportunistische Infektionen?'
  when 'schwer-3' then 'Welches Antikoagulans wird initial bei akuter Lungenembolie mit Schock bevorzugt?'
  when 'schwer-12' then 'Welches inhalative Medikament wird initial beim Status asthmaticus bevorzugt?'
  else question
end
where slug in (
  'cf61219aed42d992b729f1fdd951329d',
  'schwer-3',
  'schwer-12'
);

update public.question_translations qt
set
  question = case q.slug
    when 'cf61219aed42d992b729f1fdd951329d' then case
      when lower(coalesce(trim(qt.language), 'de')) = 'en' then 'Which fungus forms branching, filamentous hyphae and causes opportunistic infections?'
      else q.question
    end
    when 'schwer-3' then case
      when lower(coalesce(trim(qt.language), 'de')) = 'en' then 'Which anticoagulant is preferred initially in acute pulmonary embolism with shock?'
      else q.question
    end
    when 'schwer-12' then case
      when lower(coalesce(trim(qt.language), 'de')) = 'en' then 'Which inhaled medication is preferred initially in status asthmaticus?'
      else q.question
    end
    else qt.question
  end
from public.questions q
where q.id = qt.question_id
  and q.slug in (
    'cf61219aed42d992b729f1fdd951329d',
    'schwer-3',
    'schwer-12'
  );

update public.question_translations qt
set
  correct_answer = case q.slug
    when 'mittel-1' then 'Insulin'
    when 'mikrobiologie-leicht-04' then 'Tinea'
    else qt.correct_answer
  end,
  options = case q.slug
    when 'mittel-1' then '["Adrenaline","Insulin","Cortisol","Thyroxine"]'::jsonb
    when 'mikrobiologie-leicht-04' then '["Tinea","Malaria","Leprosy","Zoster"]'::jsonb
    else qt.options
  end
from public.questions q
where q.id = qt.question_id
  and lower(coalesce(trim(qt.language), 'de')) = 'en'
  and q.slug in ('mittel-1', 'mikrobiologie-leicht-04');

update public.questions q
set explanation = public.build_contextual_question_explanation(
  q.question,
  q.correct_answer,
  'de'
)
where q.explanation is null
  or btrim(q.explanation) = ''
  or q.explanation like 'Richtige Antwort:%'
  or q.explanation like 'Correct answer:%';

with manual_updates (slug, explanation) as (
  values
    ('274e59afa67a65701b70b0f622d84d32', 'Die Bauchspeicheldruese produziert Insulin in den Beta-Zellen der Langerhans-Inseln. Das Hormon senkt den Blutzucker, indem es die Glukoseaufnahme in Gewebe foerdert.'),
    ('6d70b123daf1cd31bf73e4abe7e49dbe', 'Das Sternum bildet die Vorderwand des Thorax. Ueber Knorpelverbindungen sind dort die meisten Rippenpaare befestigt.'),
    ('leicht-1', 'Das Herz ist die muskulaere Pumpe des Kreislaufs. Es befoerdert Blut sowohl durch den Lungen- als auch durch den Koerperkreislauf.'),
    ('leicht-10', 'Die Nieren filtern das Blut im Glomerulus und bilden daraus Primaerharn. Durch Rueckresorption und Sekretion entsteht schliesslich der Urin.'),
    ('leicht-11', 'Der Mensch hat sieben Halswirbel von C1 bis C7. Sie tragen den Kopf und ermoeglichen die grosse Beweglichkeit der Halswirbelsaeule.'),
    ('leicht-12', 'Die Nase enthaelt das Riechepithel mit den Rezeptoren fuer Geruchsstoffe. Diese Signale werden ueber den N. olfactorius weitergeleitet.'),
    ('leicht-14', 'Die Leber gehoert zum Verdauungssystem, weil sie Galle produziert und Nahrungsbestandteile verstoffwechselt. Zusaetzlich uebernimmt sie Entgiftungs- und Speicherfunktionen.'),
    ('leicht-2', 'Der Mensch hat zwei Lungenfluegel, einen rechts und einen links. Rechts gibt es drei Lappen, links wegen des Herzens nur zwei.'),
    ('leicht-4', 'Erythrozyten transportieren Sauerstoff ueber ihr Haemoglobin. Dieses bindet O2 in der Lunge und gibt ihn im Gewebe wieder ab.'),
    ('leicht-6', 'Ein erwachsener Mensch hat typischerweise 32 Zaehne, wenn alle Weisheitszaehne vorhanden sind. Ohne Weisheitszaehne sind es oft weniger.'),
    ('leicht-9', 'Das menschliche Herz hat vier Kammern: zwei Vorhoefe und zwei Ventrikel. So bleiben Lungen- und Koerperkreislauf voneinander getrennt.'),
    ('a85a3df16daf010f74680b5784e6a88d', 'Das Diaphragma beziehungsweise Zwerchfell trennt Brust- und Bauchhoehle. Gleichzeitig ist es der wichtigste Atemmuskel.'),
    ('mittel-10', 'Der N. facialis innerviert die mimische Muskulatur motorisch. Eine Laesion fuehrt typischerweise zu einer Fazialisparese.'),
    ('mittel-13', 'Die Brustwirbelsaeule besteht aus 12 Wirbeln, bezeichnet als Th1 bis Th12. An ihnen artikulieren auch die Rippen.'),
    ('mittel-2', 'Sehnen verbinden Muskel mit Knochen und uebertragen die Muskelkraft auf das Skelett. Baender verbinden dagegen Knochen mit Knochen.'),
    ('88f79f192028b8afd3b7c6c3f8d0e23c', 'Die A. cerebri media versorgt grosse Teile des lateralen Frontal-, Parietal- und Temporallappens. Ein Verschluss fuehrt haeufig zu Sprach- und Motorikdefiziten.'),
    ('schwer-13', 'Die CT-Angiografie ist bei stabilen Patientinnen und Patienten der Standard zur Sicherung einer Lungenembolie. Sie kann Fuellungsdefekte in den Pulmonalarterien direkt darstellen.'),
    ('schwer-7', 'CRB-65 bewertet Confusion, Respiratory rate, Blood pressure und Alter ab 65 Jahren. Der Score hilft, das Risiko einer ambulant erworbenen Pneumonie einzuschaetzen.'),
    ('mittel-15', 'Die Amylase im Speichel beginnt bereits im Mund mit der Spaltung von Staerke zu kleineren Kohlenhydraten. Deshalb startet die Verdauung von Kohlenhydraten schon vor dem Magen.'),
    ('schwer-8', 'Acetylcystein fuellt die Glutathionspeicher wieder auf und entgiftet den toxischen Paracetamol-Metaboliten NAPQI. Es ist besonders wirksam, wenn es frueh gegeben wird.'),
    ('schwer-12', 'Schnell wirksame Beta-2-Agonisten sind die wichtigste initiale Bronchodilatation beim Status asthmaticus. Sie werden hoch dosiert inhalativ oder vernebelt gegeben und haeufig mit weiteren Eskalationsmassnahmen kombiniert.'),
    ('schwer-4', 'Die haeufigste Mutation bei Mukoviszidose ist F508del im CFTR-Gen. Dadurch wird der Chloridkanal fehlgefaltet und es entsteht zaehes Sekret.'),
    ('schwer-5', 'Der CHA2DS2-VASc-Score schaetzt das Schlaganfallrisiko bei Vorhofflimmern ab. Er hilft bei der Entscheidung, ob eine orale Antikoagulation noetig ist.'),
    ('schwer-9', 'BCR-ABL entsteht durch die Translokation t(9;22), das Philadelphia-Chromosom. Das Fusionsprotein wirkt als dauerhaft aktive Tyrosinkinase und ist typisch fuer CML.'),
    ('mittel-8', 'Antikoerper werden letztlich von Plasmazellen gebildet, die aus aktivierten B-Lymphozyten hervorgehen. In einfachen Fragen wird deshalb oft die B-Lymphozyten-Linie als Ursprung gesucht.'),
    ('schwer-11', 'ANA sind haeufig bei Autoimmunhepatitis Typ 1 nachweisbar. Daneben koennen auch SMA auftreten, waehrend LKM-1 eher fuer Typ 2 spricht.'),
    ('schwer-2', 'Beim Guillain-Barre-Syndrom richtet sich die Immunreaktion gegen die Myelinscheide peripherer Nerven. Das fuehrt zu aufsteigender schlaffer Laehmung und Areflexie.'),
    ('schwer-6', 'TRAK sind Antikoerper gegen den TSH-Rezeptor und typisch fuer Morbus Basedow. Sie stimulieren die Schilddruese und verursachen die Hyperthyreose.'),
    ('ff8723d35dd026a3c5f5f700c4a1612a', 'Mycobacterium tuberculosis ist der klassische Erreger der Tuberkulose. Das saeurefeste Stabchen wird meist aerogen uebertragen und befaellt vor allem die Lunge.'),
    ('leicht-13', 'Der Blutdruck wird klassisch in Millimeter Quecksilber gemessen, abgekuerzt mmHg. Die Einheit geht auf die Hoehe einer Quecksilbersaeule im Messgeraet zurueck.'),
    ('6fe7e16001d97ba62942102fbf896b00', 'Rhinoviren sind unbehuelte, einzelstraengige RNA-Viren und der haeufigste Ausloeser der gewoehnlichen Erkaeltung. Sie vermehren sich besonders gut in den oberen Atemwegen.'),
    ('cf61219aed42d992b729f1fdd951329d', 'Aspergillus fumigatus ist kein Bakterium, sondern ein Schimmelpilz. Er verursacht vor allem bei immunsupprimierten Personen opportunistische Infektionen wie die invasive Aspergillose.'),
    ('a729d83fa47c8f50bec2a67376efab03', 'Eosinophile sind bei allergischen Reaktionen und parasitaeren Erkrankungen haeufig erhoeht. Sie enthalten Granula mit toxischen Proteinen und Entzuendungsmediatoren.'),
    ('0711ce6c8d266ceb9966b08ff5c1dd2e', 'Chronische Entzuendung ist durch mononukleaere Zellen wie Makrophagen, Lymphozyten und Plasmazellen gekennzeichnet. Oft kommen Gewebszerstoerung und Reparaturprozesse hinzu.'),
    ('86430368402cda51e337a319513d61d3', 'BRAF V600E aktiviert die MAP-Kinase-Signalkaskade dauerhaft und findet sich haeufig bei malignen Melanomen. Die Mutation ist therapeutisch relevant, weil es gezielte BRAF-Inhibitoren gibt.'),
    ('schwer-10', 'CA 125 ist ein Tumormarker, der bei Ovarialkarzinomen oft erhoeht ist. Er eignet sich eher zur Verlaufskontrolle als zum Screening.'),
    ('cc0e6a8c78b4ef8d09496b8e3ece20ca', 'Amoxicillin ist ein haeufig eingesetztes Beta-Laktam-Antibiotikum fuer viele bakterielle Infektionen. Es hemmt die bakterielle Zellwandsynthese.'),
    ('15342c2813de192a8da9dd6463bc4ab7', 'Protonenpumpenhemmer wie Omeprazol hemmen die H+/K+-ATPase der Belegzellen irreversibel. Dadurch sinkt die Magensaeureproduktion deutlich.'),
    ('95decb43077f9b1729f7bcbb18156619', 'Beta-Blocker blockieren beta-adrenerge Rezeptoren und senken dadurch Herzfrequenz, Kontraktilitaet und Blutdruck. Sie werden unter anderem bei Hypertonie und tachykarden Rhythmusstoerungen eingesetzt.'),
    ('mittel-11', 'Penicillin wirkt gegen viele empfindliche bakterielle Erreger, zum Beispiel Pneumokokken. Ob es geeignet ist, haengt aber immer vom vermuteten Erreger und Resistenzmuster ab.'),
    ('mittel-12', 'Tachykardie ist ein typisches Zeichen der Hyperthyreose, weil Schilddruesenhormone die Empfindlichkeit fuer Katecholamine steigern. Dadurch schlagen Herz und Kreislauf schneller.'),
    ('mittel-4', 'Faktor II, also Prothrombin, gehoert zu den Vitamin-K-abhaengigen Gerinnungsfaktoren. Ebenfalls dazu zaehlen VII, IX und X sowie Protein C und S.'),
    ('04d5a7ef0124cf304c904996a945df8d', 'Statine hemmen die HMG-CoA-Reduktase, das Schluesselenzym der Cholesterinsynthese. Dadurch sinkt vor allem das LDL-Cholesterin.'),
    ('schwer-14', 'Ciprofloxacin deckt Pseudomonas aeruginosa als eines der wenigen oral verfuegbaren Antibiotika typischerweise ab. Die konkrete Therapie richtet sich aber immer nach Fokus und Resistenzlage.'),
    ('schwer-15', 'Vor Amiodaron sollte insbesondere Kalium im Normbereich liegen, weil Hypokaliaemie proarrhythmisch wirkt und das Risiko fuer QT-vermittelte Rhythmusstoerungen erhoeht.'),
    ('f4f93696564acb52bfa4c9f60e9b4b93', 'Die Bauchspeicheldruese produziert Insulin in ihren Beta-Zellen. Das Hormon senkt den Blutzucker und ist zentral fuer den Glukosestoffwechsel.'),
    ('leicht-15', 'Plasma ist der fluessige Anteil des Blutes ohne Blutzellen. Es enthaelt Wasser, Elektrolyte, Proteine und Gerinnungsfaktoren.'),
    ('leicht-3', 'Vitamin D wird in der Haut unter UV-B-Strahlung aus Vorstufen gebildet. Es ist wichtig fuer Kalziumhaushalt und Knochengesundheit.'),
    ('leicht-5', 'Ab 38,0 C spricht man von Fieber. Ursache ist meist eine Sollwerterhoehung im Hypothalamus durch pyrogene Mediatoren.'),
    ('leicht-7', 'AB+ gilt als Universalempfaenger fuer Erythrozyten, weil keine Anti-A- oder Anti-B-Antikoerper vorliegen und Rh-positives Blut vertragen wird.'),
    ('leicht-8', 'Kalzium ist zentral fuer den Knochenaufbau und wird zusammen mit Phosphat in die Knochenmatrix eingebaut. Vitamin D erleichtert seine Aufnahme.'),
    ('0d7baf735110d06a97bf1e8b69768a77', 'Sauerstoff wird im Blut vor allem ueber die Bindung an Haemoglobin transportiert. So kann wesentlich mehr O2 mitgefuehrt werden als nur in geloester Form.'),
    ('mittel-1', 'Insulin ist das zentrale blutzuckersenkende Hormon. Es foerdert die Aufnahme von Glukose in Zellen und die Speicherung als Glykogen.'),
    ('mittel-14', 'Der schnelle Aufstrich des Aktionspotenzials in Muskel- und Nervenzellen beruht vor allem auf Natriumeinstrom. Kalium ist dagegen wichtig fuer die Repolarisation.'),
    ('mittel-3', 'Das Kleinhirn koordiniert Gleichgewicht, Haltung und fein abgestimmte Bewegungen. Schaedigungen fuehren zu Ataxie und Dysmetrie.'),
    ('mittel-5', 'Ein niedriger Haemoglobinwert spricht fuer eine moegliche Anaemie, weil Haemoglobin den Sauerstofftransport der Erythrozyten bestimmt.'),
    ('mittel-6', 'Das Pankreas produziert Insulin in seinen Beta-Zellen. Das Hormon senkt den Blutzucker und ist fuer den Glukosestoffwechsel zentral.'),
    ('mittel-7', 'Die Filtration findet im Nierenkoerperchen statt, also im Glomerulus mit Bowman-Kapsel. Dort wird aus Blutplasma der Primaerharn gebildet.'),
    ('mittel-9', 'Vitamin K ist noetig fuer die Gamma-Carboxylierung mehrerer Gerinnungsfaktoren. Ohne diesen Schritt koennen die Faktoren Calcium schlechter binden und weniger wirksam arbeiten.'),
    ('477efe8985a76ec28a28138b180111d9', 'Der Wnt/beta-Catenin-Signalweg reguliert Proliferation, Differenzierung und Zellschicksal. Fehlregulationen foerdern unkontrolliertes Wachstum und spielen bei vielen Tumoren eine Rolle.'),
    ('schwer-1', 'Der Schilling-Test pruefte historisch die Vitamin-B12-Aufnahme und half so bei der Diagnose einer pernizioesen Anaemie durch Intrinsic-Factor-Mangel. Heute wird er nur noch selten verwendet.'),
    ('schwer-3', 'Unfraktioniertes Heparin wird bei massiver Lungenembolie mit Schock initial bevorzugt, weil es sofort wirkt und bei instabilen Patientinnen und Patienten gut steuerbar ist. Parallel muss eine rasche Reperfusionsstrategie geprueft werden.')
)
update public.questions q
set explanation = manual_updates.explanation
from manual_updates
where q.slug = manual_updates.slug;

update public.question_translations qt
set explanation = q.explanation
from public.questions q
where q.id = qt.question_id
  and lower(coalesce(trim(qt.language), 'de')) = 'de';

update public.question_translations qt
set explanation = public.build_contextual_question_explanation(
  qt.question,
  coalesce(nullif(trim(qt.correct_answer), ''), q.correct_answer),
  qt.language
)
from public.questions q
where q.id = qt.question_id
  and lower(coalesce(trim(qt.language), 'de')) <> 'de'
  and (
    qt.explanation is null
    or btrim(qt.explanation) = ''
    or qt.explanation like 'Correct answer:%'
    or qt.explanation like 'Richtige Antwort:%'
  );
