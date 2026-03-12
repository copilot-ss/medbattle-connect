-- Upgrade future weak explanations and improve the remaining terse curated entries.

create or replace function public.should_rebuild_question_explanation(
  p_explanation text,
  p_correct_answer text
)
returns boolean
language plpgsql
immutable
set search_path = public
as $$
declare
  normalized_explanation text := btrim(coalesce(p_explanation, ''));
  normalized_answer text := lower(btrim(coalesce(p_correct_answer, '')));
begin
  if normalized_explanation = '' then
    return true;
  end if;

  if normalized_explanation like 'Richtige Antwort:%'
    or normalized_explanation like 'Correct answer:%' then
    return true;
  end if;

  if normalized_answer <> ''
    and position(normalized_answer in lower(normalized_explanation)) > 0
    and char_length(normalized_explanation) <= greatest(char_length(normalized_answer) + 45, 72) then
    return true;
  end if;

  return false;
end;
$$;

create or replace function public.ensure_questions_explanation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.should_rebuild_question_explanation(new.explanation, new.correct_answer) then
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
  if public.should_rebuild_question_explanation(new.explanation, new.correct_answer) then
    new.explanation := public.build_contextual_question_explanation(
      new.question,
      new.correct_answer,
      new.language
    );
  end if;
  return new;
end;
$$;

update public.questions q
set explanation = public.build_contextual_question_explanation(
  q.question,
  q.correct_answer,
  'de'
)
where public.should_rebuild_question_explanation(q.explanation, q.correct_answer);

update public.question_translations qt
set explanation = public.build_contextual_question_explanation(
  qt.question,
  coalesce(nullif(btrim(qt.correct_answer), ''), q.correct_answer),
  qt.language
)
from public.questions q
where q.id = qt.question_id
  and public.should_rebuild_question_explanation(
    qt.explanation,
    coalesce(nullif(btrim(qt.correct_answer), ''), q.correct_answer)
  );

with de_updates (slug, explanation) as (
  values
    ('physiologie-herz-01', 'Die P-Welle repraesentiert die Depolarisation der Vorhoefe. Erst danach folgt im QRS-Komplex die Erregung der Ventrikel.'),
    ('physiologie-lunge-01', 'Der Gasaustausch findet in den Alveolen statt, weil dort eine extrem duenne Blut-Luft-Schranke besteht. So kann Sauerstoff ins Blut diffundieren und Kohlendioxid in die Ausatemluft uebertreten.'),
    ('anatomie-lunge-01', 'Das Zwerchfell ist der wichtigste Atemmuskel, weil seine Kontraktion den Thorax nach kaudal erweitert. Dadurch sinkt der intrathorakale Druck und Luft stroemt in die Lunge.'),
    ('physiologie-niere-01', 'Die Ultrafiltration findet im Glomerulus statt, wo Blut durch die Filtrationsbarriere in den Kapselraum gepresst wird. So entsteht der Primaerharn.'),
    ('physiologie-niere-03', 'Die Henle-Schleife ist entscheidend fuer die Gegenstrommultiplikation, weil ab- und aufsteigender Schenkel unterschiedliche Permeabilitaeten fuer Wasser und Salz besitzen. Dadurch entsteht der osmotische Gradient im Nierenmark.'),
    ('pathologie-leber-01', 'Die alkalische Phosphatase steigt bei cholestatischem Leberschaden an, weil sie vor allem im Bereich der Gallenwege vorkommt. Eine Cholestase fuehrt deshalb typischerweise zu erhoehten ALP-Werten.'),
    ('physiologie-leber-02', 'Ammoniak wird in der Leber im Harnstoffzyklus entgiftet. Das ist wichtig, weil freies Ammoniak neurotoxisch ist und daher rasch in besser ausscheidbaren Harnstoff umgewandelt werden muss.'),
    ('anatomie-neuro-01', 'Der N. abducens innerviert den M. rectus lateralis und ermoeglicht damit die Abduktion des Auges. Bei einer Laesion kann das betroffene Auge nicht mehr richtig nach aussen bewegt werden.'),
    ('physiologie-endo-01', 'TSH wird in der Adenohypophyse gebildet. Von dort stimuliert es die Schilddruese zur Bildung und Freisetzung von T3 und T4.'),
    ('physiologie-endo-02', 'Aldosteron wird in der Zona glomerulosa der Nebennierenrinde gebildet. Es steigert die Natrium- und Wasserretention in der Niere und kann so den Blutdruck erhoehen.'),
    ('physiologie-endo-03', 'Insulin foerdert die Aufnahme von Glukose in Zellen, vor allem in Muskel- und Fettgewebe. Dazu bewirkt es unter anderem die Einlagerung von GLUT4 in die Zellmembran.'),
    ('anatomie-gastro-01', 'Die Gallenblase speichert und konzentriert die in der Leber gebildete Galle zwischen den Mahlzeiten. Nach Nahrungsaufnahme wird sie in das Duodenum abgegeben.'),
    ('mikrobiologie-gastro-01', 'Helicobacter pylori kolonisiert die Magenschleimhaut und foerdert dort chronische Entzuendung. Dadurch entstehen haeufig Gastritis und peptische Ulzera.'),
    ('physiologie-gastro-01', 'Vitamin B12 wird hauptsaechlich im terminalen Ileum resorbiert. Voraussetzung dafuer ist die Bindung an Intrinsic Factor aus dem Magen.'),
    ('physiologie-haema-02', 'Quick/INR prueft vor allem die extrinsische Gerinnungskaskade, insbesondere den Faktor VII. Deshalb wird der Wert auch zur Kontrolle einer Vitamin-K-Antagonisten-Therapie genutzt.'),
    ('pathologie-haema-01', 'Bei pernizioeser Anaemie ist Vitamin B12 vermindert, weil durch Intrinsic-Factor-Mangel die Aufnahme im terminalen Ileum gestoert ist. Dadurch entsteht eine megaloblaestaere Anaemie.'),
    ('pathologie-derm-01', 'UVB verursacht Sonnenbrand am ehesten, weil diese Strahlung vor allem die Epidermis erreicht und dort direkte DNA-Schaeden ausloest. UVA dringt tiefer ein, ist aber weniger typisch fuer den akuten Sonnenbrand.'),
    ('anatomie-derm-01', 'Die Epidermis ist die oberste Hautschicht und bildet die aeussere Barriere des Koerpers. Sie schuetzt vor Keimen, Austrocknung und mechanischen Reizen.'),
    ('mikrobiologie-derm-01', 'Staphylococcus aureus ist ein haeufiger Erreger der Impetigo contagiosa. Der Keim verursacht eine oberflaechliche eitrige Hautinfektion mit typischen honiggelben Krusten.'),
    ('anatomie-oph-02', 'Die Fovea centralis ist der Ort des schaerfsten Sehens, weil dort die Dichte der Zapfen am hoechsten ist. Sie ist fuer hochaufgeloestes Farb- und Detailsehen entscheidend.'),
    ('pathologie-oph-01', 'Beim Glaukom ist der Augeninnendruck haeufig erhoeht, was den Sehnerv langfristig schaedigen kann. Unbehandelt drohen Gesichtsfeldausfaelle bis zur Erblindung.')
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
  and q.slug in (
    'physiologie-herz-01',
    'physiologie-lunge-01',
    'anatomie-lunge-01',
    'physiologie-niere-01',
    'physiologie-niere-03',
    'pathologie-leber-01',
    'physiologie-leber-02',
    'anatomie-neuro-01',
    'physiologie-endo-01',
    'physiologie-endo-02',
    'physiologie-endo-03',
    'anatomie-gastro-01',
    'mikrobiologie-gastro-01',
    'physiologie-gastro-01',
    'physiologie-haema-02',
    'pathologie-haema-01',
    'pathologie-derm-01',
    'anatomie-derm-01',
    'mikrobiologie-derm-01',
    'anatomie-oph-02',
    'pathologie-oph-01'
  );

with en_updates (slug, explanation) as (
  values
    ('physiologie-herz-01', 'The P wave represents atrial depolarization. Ventricular depolarization follows later in the QRS complex.'),
    ('physiologie-lunge-01', 'Gas exchange takes place in the alveoli because their blood-air barrier is extremely thin. This allows oxygen to diffuse into blood and carbon dioxide to diffuse into exhaled air.'),
    ('anatomie-lunge-01', 'The diaphragm is the main respiratory muscle because its contraction expands the thoracic cavity downward. This lowers intrathoracic pressure and draws air into the lungs.'),
    ('physiologie-niere-01', 'Ultrafiltration occurs in the glomerulus, where blood is filtered across the glomerular barrier into Bowman''s space. This is how primary urine is formed.'),
    ('physiologie-niere-03', 'The loop of Henle is essential for countercurrent multiplication because its descending and ascending limbs handle water and salt differently. This creates the osmotic gradient in the renal medulla.'),
    ('pathologie-leber-01', 'Alkaline phosphatase rises in cholestatic liver disease because it is associated mainly with the biliary system. Cholestasis therefore typically leads to elevated ALP levels.'),
    ('physiologie-leber-02', 'Ammonia is detoxified in the liver through the urea cycle. This is crucial because free ammonia is neurotoxic and must be converted into more easily excreted urea.'),
    ('anatomie-neuro-01', 'The abducens nerve innervates the lateral rectus muscle and therefore abducts the eye. A lesion prevents proper outward movement of the affected eye.'),
    ('physiologie-endo-01', 'TSH is produced in the anterior pituitary. From there it stimulates the thyroid gland to synthesize and release T3 and T4.'),
    ('physiologie-endo-02', 'Aldosterone is produced in the zona glomerulosa of the adrenal cortex. It increases renal sodium and water retention and can therefore raise blood pressure.'),
    ('physiologie-endo-03', 'Insulin promotes glucose uptake into cells, especially muscle and adipose tissue. One important mechanism is insertion of GLUT4 transporters into the cell membrane.'),
    ('anatomie-gastro-01', 'The gallbladder stores and concentrates bile produced by the liver between meals. After food intake, bile is released into the duodenum.'),
    ('mikrobiologie-gastro-01', 'Helicobacter pylori colonizes the gastric mucosa and promotes chronic inflammation there. This is why it commonly causes gastritis and peptic ulcers.'),
    ('physiologie-gastro-01', 'Vitamin B12 is absorbed mainly in the terminal ileum. This requires binding to intrinsic factor produced in the stomach.'),
    ('physiologie-haema-02', 'PT/INR mainly tests the extrinsic coagulation pathway, especially factor VII. It is therefore also used to monitor vitamin K antagonist therapy.'),
    ('pathologie-haema-01', 'In pernicious anemia, vitamin B12 is low because lack of intrinsic factor impairs absorption in the terminal ileum. This leads to a megaloblastic anemia.'),
    ('pathologie-derm-01', 'UVB is most strongly associated with sunburn because it primarily reaches the epidermis and causes direct DNA damage there. UVA penetrates deeper but is less typical for acute sunburn.'),
    ('anatomie-derm-01', 'The epidermis is the outermost layer of the skin and forms the body''s external barrier. It protects against pathogens, dehydration, and mechanical stress.'),
    ('mikrobiologie-derm-01', 'Staphylococcus aureus is a common cause of impetigo contagiosa. It produces a superficial purulent skin infection with the classic honey-colored crusts.'),
    ('anatomie-oph-02', 'The fovea centralis is the point of sharpest vision because cone density is highest there. It is crucial for fine detail and color vision.'),
    ('pathologie-oph-01', 'In glaucoma, intraocular pressure is often elevated and can progressively damage the optic nerve. Without treatment this can cause visual field loss and blindness.')
)
update public.question_translations qt
set explanation = en_updates.explanation
from public.questions q
join en_updates on en_updates.slug = q.slug
where q.id = qt.question_id
  and lower(coalesce(trim(qt.language), 'de')) = 'en';
