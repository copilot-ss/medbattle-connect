-- Tighten wording of curated questions so the stem is more explicit and less ambiguous.

with revisions (
  slug,
  question_de,
  question_en,
  options_de,
  options_en
) as (
  values
    (
      'anatomie-supraspinatus-abduktion',
      'Welcher Muskel initiiert beim Erwachsenen die ersten 0 bis 15 Grad der Armabduktion im Schultergelenk?',
      'Which muscle initiates the first 0 to 15 degrees of arm abduction at the shoulder in an adult?',
      null::jsonb,
      null::jsonb
    ),
    (
      'anatomie-ductus-thoracicus-venenwinkel',
      'In welchen Venenwinkel muendet der Ductus thoracicus beim Erwachsenen typischerweise?',
      'Into which venous angle does the thoracic duct typically drain in an adult?',
      null::jsonb,
      null::jsonb
    ),
    (
      'anatomie-hiatus-aorticus-t12',
      'Auf Hoehe welchen Wirbelkoerpers durchtritt die Aorta den Hiatus aorticus des Zwerchfells?',
      'At the level of which vertebral body does the aorta pass through the aortic hiatus of the diaphragm?',
      null::jsonb,
      null::jsonb
    ),
    (
      'anatomie-ligamentum-hepatoduodenale',
      'Welche der folgenden Strukturen gehoert zur Portal-Trias im Ligamentum hepatoduodenale?',
      'Which of the following structures is part of the portal triad within the hepatoduodenal ligament?',
      null::jsonb,
      null::jsonb
    ),
    (
      'anatomie-testis-lymphabfluss',
      'In welche retroperitonealen Lymphknoten drainiert der Hoden primaer?',
      'To which retroperitoneal lymph nodes does the testis primarily drain?',
      null::jsonb,
      null::jsonb
    ),
    (
      'physiologie-macula-densa-nacl',
      'Welche luminale Groesse registriert die Macula densa fuer das tubuloglomerulaere Feedback?',
      'Which luminal variable is sensed by the macula densa for tubuloglomerular feedback?',
      null::jsonb,
      null::jsonb
    ),
    (
      'physiologie-frank-starling',
      'Welche Folge hat bei unveraenderter Kontraktilitaet eine erhoehte enddiastolische Fuellung auf das Schlagvolumen?',
      'With contractility unchanged, what effect does increased end-diastolic filling have on stroke volume?',
      null::jsonb,
      null::jsonb
    ),
    (
      'physiologie-pth-phosphat',
      'Wie veraendert Parathormon die renale Phosphatrueckresorption im proximalen Tubulus?',
      'How does parathyroid hormone change renal phosphate reabsorption in the proximal tubule?',
      '["Die renale Phosphatrueckresorption nimmt ab","Die renale Phosphatrueckresorption nimmt zu","Die renale Phosphatrueckresorption bleibt unveraendert","Die renale Phosphatrueckresorption steigt nur nachts"]'::jsonb,
      '["Renal phosphate reabsorption decreases","Renal phosphate reabsorption increases","Renal phosphate reabsorption remains unchanged","Renal phosphate reabsorption increases only at night"]'::jsonb
    ),
    (
      'physiologie-fetales-haemoglobin-links',
      'Welche Eigenschaft des fetalen Haemoglobins erklaert die Linksverschiebung seiner Sauerstoffbindungskurve gegenueber adultem Haemoglobin?',
      'Which property of fetal hemoglobin explains the left shift of its oxygen dissociation curve compared with adult hemoglobin?',
      null::jsonb,
      null::jsonb
    ),
    (
      'pathologie-aschoff-koerper',
      'Bei welcher Folgeerkrankung nach Streptokokkeninfektion finden sich klassisch Aschoff-Koerperchen im Herzen?',
      'In which post-streptococcal disease are Aschoff bodies classically found in the heart?',
      null::jsonb,
      null::jsonb
    ),
    (
      'pathologie-alpha1-antitrypsin-emphysem',
      'Welches Emphysem-Muster in der Lunge ist fuer einen Alpha-1-Antitrypsin-Mangel typisch?',
      'Which pulmonary emphysema pattern is typical of alpha-1 antitrypsin deficiency?',
      null::jsonb,
      null::jsonb
    ),
    (
      'pathologie-verkaseungsnekrose-tuberkulose',
      'Welche Infektion ist histologisch klassisch mit verkaesenden Granulomen assoziiert?',
      'Which infection is classically associated histologically with caseating granulomas?',
      null::jsonb,
      null::jsonb
    ),
    (
      'pharmakologie-ace-hemmer-bradykinin',
      'Welche Substanz akkumuliert unter ACE-Hemmern und erklaert dadurch den trockenen Husten am besten?',
      'Which substance accumulates during ACE inhibitor therapy and best explains the dry cough?',
      null::jsonb,
      null::jsonb
    ),
    (
      'pharmakologie-aminoglykoside-30s',
      'An welche bakterielle Ribosomenuntereinheit binden Aminoglykoside primaer?',
      'Which bacterial ribosomal subunit do aminoglycosides primarily bind?',
      null::jsonb,
      null::jsonb
    ),
    (
      'pharmakologie-makrolide-50s',
      'An welche bakterielle Ribosomenuntereinheit binden Makrolide primaer?',
      'Which bacterial ribosomal subunit do macrolides primarily bind?',
      null::jsonb,
      null::jsonb
    ),
    (
      'pharmakologie-metformin-glukoneogenese',
      'Welcher pharmakologische Haupteffekt von Metformin senkt den Blutzucker bei Typ-2-Diabetes am staerksten?',
      'Which main pharmacologic effect of metformin most strongly lowers blood glucose in type 2 diabetes?',
      null::jsonb,
      null::jsonb
    ),
    (
      'pharmakologie-warfarin-inr',
      'Welcher Gerinnungstest beziehungsweise Laborwert wird zur Kontrolle einer Warfarin-Therapie typischerweise verwendet?',
      'Which coagulation test or laboratory value is typically used to monitor warfarin therapy?',
      null::jsonb,
      null::jsonb
    ),
    (
      'pharmakologie-thiazide-kalzium',
      'Wie veraendert ein Thiazid die renale Kalziumausscheidung im Urin typischerweise?',
      'How does a thiazide typically change urinary renal calcium excretion?',
      '["Die renale Kalziumausscheidung nimmt ab","Die renale Kalziumausscheidung nimmt deutlich zu","Die renale Kalziumausscheidung bleibt unveraendert","Die renale Kalziumausscheidung steigt nur bei Azidose"]'::jsonb,
      '["Renal calcium excretion decreases","Renal calcium excretion increases markedly","Renal calcium excretion remains unchanged","Renal calcium excretion rises only in acidosis"]'::jsonb
    ),
    (
      'mikrobiologie-strep-gallolyticus-kolon',
      'Mit welchem malignen Tumor des Gastrointestinaltrakts ist eine Streptococcus-gallolyticus-Bakteriaemie besonders assoziiert?',
      'Bacteremia with Streptococcus gallolyticus is especially associated with which malignant gastrointestinal tumor?',
      null::jsonb,
      null::jsonb
    ),
    (
      'radiologie-fast-freie-fluessigkeit',
      'Welcher Zielbefund soll mit der FAST-Sonographie im Schockraum primaer erkannt werden?',
      'Which target finding is the FAST ultrasound in the trauma bay primarily intended to detect?',
      null::jsonb,
      null::jsonb
    ),
    (
      'chirurgie-courvoisier-zeichen',
      'Wofuer spricht das Courvoisier-Zeichen aus schmerzlosem Ikterus und palpabel vergroesserter Gallenblase am ehesten?',
      'What does Courvoisier sign, consisting of painless jaundice and a palpable enlarged gallbladder, most strongly suggest?',
      null::jsonb,
      null::jsonb
    )
)
update public.questions q
set question = r.question_de,
    options = coalesce(r.options_de, q.options),
    updated_at = now()
from revisions r
where q.slug = r.slug;

with revisions (
  slug,
  question_en,
  options_en
) as (
  values
    (
      'anatomie-supraspinatus-abduktion',
      'Which muscle initiates the first 0 to 15 degrees of arm abduction at the shoulder in an adult?',
      null::jsonb
    ),
    (
      'anatomie-ductus-thoracicus-venenwinkel',
      'Into which venous angle does the thoracic duct typically drain in an adult?',
      null::jsonb
    ),
    (
      'anatomie-hiatus-aorticus-t12',
      'At the level of which vertebral body does the aorta pass through the aortic hiatus of the diaphragm?',
      null::jsonb
    ),
    (
      'anatomie-ligamentum-hepatoduodenale',
      'Which of the following structures is part of the portal triad within the hepatoduodenal ligament?',
      null::jsonb
    ),
    (
      'anatomie-testis-lymphabfluss',
      'To which retroperitoneal lymph nodes does the testis primarily drain?',
      null::jsonb
    ),
    (
      'physiologie-macula-densa-nacl',
      'Which luminal variable is sensed by the macula densa for tubuloglomerular feedback?',
      null::jsonb
    ),
    (
      'physiologie-frank-starling',
      'With contractility unchanged, what effect does increased end-diastolic filling have on stroke volume?',
      null::jsonb
    ),
    (
      'physiologie-pth-phosphat',
      'How does parathyroid hormone change renal phosphate reabsorption in the proximal tubule?',
      '["Renal phosphate reabsorption decreases","Renal phosphate reabsorption increases","Renal phosphate reabsorption remains unchanged","Renal phosphate reabsorption increases only at night"]'::jsonb
    ),
    (
      'physiologie-fetales-haemoglobin-links',
      'Which property of fetal hemoglobin explains the left shift of its oxygen dissociation curve compared with adult hemoglobin?',
      null::jsonb
    ),
    (
      'pathologie-aschoff-koerper',
      'In which post-streptococcal disease are Aschoff bodies classically found in the heart?',
      null::jsonb
    ),
    (
      'pathologie-alpha1-antitrypsin-emphysem',
      'Which pulmonary emphysema pattern is typical of alpha-1 antitrypsin deficiency?',
      null::jsonb
    ),
    (
      'pathologie-verkaseungsnekrose-tuberkulose',
      'Which infection is classically associated histologically with caseating granulomas?',
      null::jsonb
    ),
    (
      'pharmakologie-ace-hemmer-bradykinin',
      'Which substance accumulates during ACE inhibitor therapy and best explains the dry cough?',
      null::jsonb
    ),
    (
      'pharmakologie-aminoglykoside-30s',
      'Which bacterial ribosomal subunit do aminoglycosides primarily bind?',
      null::jsonb
    ),
    (
      'pharmakologie-makrolide-50s',
      'Which bacterial ribosomal subunit do macrolides primarily bind?',
      null::jsonb
    ),
    (
      'pharmakologie-metformin-glukoneogenese',
      'Which main pharmacologic effect of metformin most strongly lowers blood glucose in type 2 diabetes?',
      null::jsonb
    ),
    (
      'pharmakologie-warfarin-inr',
      'Which coagulation test or laboratory value is typically used to monitor warfarin therapy?',
      null::jsonb
    ),
    (
      'pharmakologie-thiazide-kalzium',
      'How does a thiazide typically change urinary renal calcium excretion?',
      '["Renal calcium excretion decreases","Renal calcium excretion increases markedly","Renal calcium excretion remains unchanged","Renal calcium excretion rises only in acidosis"]'::jsonb
    ),
    (
      'mikrobiologie-strep-gallolyticus-kolon',
      'Bacteremia with Streptococcus gallolyticus is especially associated with which malignant gastrointestinal tumor?',
      null::jsonb
    ),
    (
      'radiologie-fast-freie-fluessigkeit',
      'Which target finding is the FAST ultrasound in the trauma bay primarily intended to detect?',
      null::jsonb
    ),
    (
      'chirurgie-courvoisier-zeichen',
      'What does Courvoisier sign, consisting of painless jaundice and a palpable enlarged gallbladder, most strongly suggest?',
      null::jsonb
    )
)
update public.question_translations qt
set question = r.question_en,
    options = coalesce(r.options_en, qt.options),
    updated_at = now()
from revisions r
join public.questions q on q.slug = r.slug
where qt.question_id = q.id
  and qt.language = 'en';
