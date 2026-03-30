-- Replace remaining generic question explanations with stronger contextual ones.

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
      return 'Focus on the core medical association in the stem and note which organ, mechanism, pathogen, mutation, or test is actually being asked for.';
    end if;
    return 'Achte auf die medizinische Kernassoziation im Fragetext und darauf, welches Organ, welcher Mechanismus, Erreger, Test oder welche Mutation wirklich abgefragt wird.';
  end if;

  if normalized_language = 'en' then
    return format(
      'The key point is that %s is the option most classically associated with the medical fact tested in the stem.',
      normalized_answer
    );
  end if;

  return format(
    'Entscheidend ist, dass %s die Antwort ist, die klassisch mit dem im Fragetext getesteten medizinischen Sachverhalt verbunden ist.',
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
  answer_or_placeholder := coalesce(
    normalized_answer,
    case when normalized_language = 'en' then 'this option' else 'diese Option' end
  );

  if normalized_question = '' then
    return public.build_fallback_question_explanation(normalized_answer, normalized_language);
  end if;

  if normalized_language = 'en' then
    if normalized_question like 'how many %'
      or normalized_question like 'what percentage %'
      or normalized_question like 'how long %'
      or normalized_question like 'when %'
      or normalized_question like 'which phase %'
      or normalized_question like 'what phase %' then
      return format(
        'The key fact is that %s gives the usual reference value, timing, duration, or physiologic phase tested in the stem.',
        answer_or_placeholder
      );
    elsif normalized_question like 'which organ %'
      or normalized_question like 'what organ %'
      or normalized_question like 'which sense organ %'
      or normalized_question like 'what sense organ %' then
      return format(
        'The key fact is that %s performs the main organ-level function or location-based role named in the question.',
        answer_or_placeholder
      );
    elsif normalized_question like 'which structure %'
      or normalized_question like 'what structure %'
      or normalized_question like 'which muscle %'
      or normalized_question like 'what muscle %'
      or normalized_question like 'which bone %'
      or normalized_question like 'what bone %'
      or normalized_question like 'which vein %'
      or normalized_question like 'what vein %'
      or normalized_question like 'which vessel %'
      or normalized_question like 'what vessel %' then
      return format(
        'The key fact is that %s is the structure with the anatomic position or function described in the stem.',
        answer_or_placeholder
      );
    elsif normalized_question like 'which nerve %'
      or normalized_question like 'what nerve %' then
      return format(
        'The key fact is that %s classically supplies the muscle, region, or reflex component asked about in the question.',
        answer_or_placeholder
      );
    elsif normalized_question like 'which artery %'
      or normalized_question like 'what artery %' then
      return format(
        'The key fact is that %s is the artery that classically supplies the region or organ named in the stem.',
        answer_or_placeholder
      );
    elsif normalized_question like 'which score %'
      or normalized_question like 'what score %' then
      return format(
        'The key fact is that %s is the established score for the risk or severity assessment described here.',
        answer_or_placeholder
      );
    elsif normalized_question like 'which medicine %'
      or normalized_question like 'which medication %'
      or normalized_question like 'which anticoagulant %'
      or normalized_question like 'which antidote %'
      or normalized_question like 'which active ingredient %'
      or normalized_question like 'what medicine %'
      or normalized_question like 'what medication %'
      or normalized_question like 'what antidote %'
      or normalized_question like 'what active ingredient %' then
      return format(
        'The key fact is that %s is the standard drug, active ingredient, or antidote for the clinical situation or mechanism described in the stem.',
        answer_or_placeholder
      );
    elsif normalized_question like 'which mutation %'
      or normalized_question like 'what mutation %'
      or normalized_question like 'which genetic %'
      or normalized_question like 'what genetic %'
      or normalized_question like 'which gene %'
      or normalized_question like 'what gene %'
      or normalized_question like 'which translocation %'
      or normalized_question like 'what translocation %'
      or normalized_question like 'which karyotype %'
      or normalized_question like 'what karyotype %'
      or normalized_question like 'which chromosomal %'
      or normalized_question like 'what chromosomal %'
      or normalized_question like 'which repeat %'
      or normalized_question like 'what repeat %' then
      return format(
        'The key fact is that %s is the classic gene, mutation, repeat, karyotype, or chromosomal change associated with the disease in the stem.',
        answer_or_placeholder
      );
    elsif normalized_question like 'which hormone %'
      or normalized_question like 'what hormone %' then
      return format(
        'The key fact is that %s is the hormone that regulates the physiologic process named in the question.',
        answer_or_placeholder
      );
    elsif normalized_question like 'which vitamin %'
      or normalized_question like 'what vitamin %' then
      return format(
        'The key fact is that %s is the vitamin required for the biologic function or pathway being tested here.',
        answer_or_placeholder
      );
    elsif normalized_question like 'which mineral %'
      or normalized_question like 'what mineral %'
      or normalized_question like 'which ion %'
      or normalized_question like 'what ion %'
      or normalized_question like 'which electrolyte %'
      or normalized_question like 'what electrolyte %' then
      return format(
        'The key fact is that %s is the ion, mineral, or electrolyte central to the body function named in the stem.',
        answer_or_placeholder
      );
    elsif normalized_question like 'which blood group %'
      or normalized_question like 'what blood group %' then
      return format(
        'The key fact is that %s has the transfusion property described in the question under standard ABO and Rh rules.',
        answer_or_placeholder
      );
    elsif normalized_question like 'which cells %'
      or normalized_question like 'which cell %'
      or normalized_question like 'what cells %'
      or normalized_question like 'what cell %'
      or normalized_question like 'what kind of cell %' then
      return format(
        'The key fact is that %s are the cells that carry out the immune, histologic, or pathophysiologic role named in the stem.',
        answer_or_placeholder
      );
    elsif normalized_question like 'which pathogen %'
      or normalized_question like 'what pathogen %'
      or normalized_question like 'which bacterium %'
      or normalized_question like 'what bacterium %'
      or normalized_question like 'which fungus %'
      or normalized_question like 'what fungus %'
      or normalized_question like 'which fungal infection %'
      or normalized_question like 'what fungal infection %'
      or normalized_question like 'which virus %'
      or normalized_question like 'what virus %'
      or normalized_question like 'which parasite %'
      or normalized_question like 'what parasite %' then
      return format(
        'The key fact is that %s is the classic pathogen or parasite linked to the disease, syndrome, or test finding named in the question.',
        answer_or_placeholder
      );
    elsif normalized_question like 'which enzyme %'
      or normalized_question like 'what enzyme %' then
      return format(
        'The key fact is that %s is the enzyme that catalyzes the metabolic step or defect described in the stem.',
        answer_or_placeholder
      );
    elsif normalized_question like 'which receptor %'
      or normalized_question like 'what receptor %' then
      return format(
        'The key fact is that %s is the receptor mediating the signal or drug effect described in the question.',
        answer_or_placeholder
      );
    elsif normalized_question like 'which test %'
      or normalized_question like 'what test %'
      or normalized_question like 'which diagnostic %'
      or normalized_question like 'what diagnostic %'
      or normalized_question like 'which imaging %'
      or normalized_question like 'what imaging %'
      or normalized_question like 'which study %'
      or normalized_question like 'what study %'
      or normalized_question like 'which examination %'
      or normalized_question like 'what examination %' then
      return format(
        'The key fact is that %s is the standard test or imaging method for the clinical problem named in the stem.',
        answer_or_placeholder
      );
    elsif normalized_question like 'which tumor marker %'
      or normalized_question like 'what tumor marker %' then
      return format(
        'The key fact is that %s is the marker classically associated with the tumor entity named in the question.',
        answer_or_placeholder
      );
    elsif normalized_question like 'what is a %'
      or normalized_question like 'what is an %'
      or normalized_question like 'what does % describe%'
      or normalized_question like 'how do you call %' then
      return 'The key fact is that this option states the defining feature of the medical term or process described in the stem.';
    else
      return public.build_fallback_question_explanation(normalized_answer, normalized_language);
    end if;
  end if;

  if normalized_question like 'wie viele %'
    or normalized_question like 'welcher prozentsatz %'
    or normalized_question like 'wie lange %'
    or normalized_question like 'wann %'
    or normalized_question like 'welche phase %' then
    return format(
      'Entscheidend ist, dass %s den ueblichen Referenzwert, Zeitpunkt, die Dauer oder die physiologische Phase des im Fragetext getesteten Vorgangs angibt.',
      answer_or_placeholder
    );
  elsif normalized_question like 'welches organ %'
    or normalized_question like 'welches sinnesorgan %' then
    return format(
      'Entscheidend ist, dass %s die im Fragetext genannte Organfunktion oder ortsbezogene Aufgabe uebernimmt.',
      answer_or_placeholder
    );
  elsif normalized_question like 'welche struktur %'
    or normalized_question like 'welcher muskel %'
    or normalized_question like 'welcher knochen %'
    or normalized_question like 'welche vene %'
    or normalized_question like 'welches gefaess %' then
    return format(
      'Entscheidend ist, dass %s genau die anatomische Struktur mit der beschriebenen Lage oder Funktion ist.',
      answer_or_placeholder
    );
  elsif normalized_question like 'welcher nerv %' then
    return format(
      'Entscheidend ist, dass %s die im Fragetext genannte Struktur, Region oder Reflexfunktion klassisch versorgt.',
      answer_or_placeholder
    );
  elsif normalized_question like 'welche arterie %' then
    return format(
      'Entscheidend ist, dass %s das in der Frage genannte Gebiet oder Organ klassisch arteriell versorgt.',
      answer_or_placeholder
    );
  elsif normalized_question like 'welcher score %' then
    return format(
      'Entscheidend ist, dass %s der etablierte Score fuer die im Fragetext beschriebene Risiko- oder Schwereeinschaetzung ist.',
      answer_or_placeholder
    );
  elsif normalized_question like 'welches medikament %'
    or normalized_question like 'welcher wirkstoff %'
    or normalized_question like 'welches antikoagulans %'
    or normalized_question like 'welches antidot %' then
    return format(
      'Entscheidend ist, dass %s als Standardmedikament, Wirkstoff oder Antidot fuer die beschriebene klinische Situation gilt.',
      answer_or_placeholder
    );
  elsif normalized_question like 'welche mutation %'
    or normalized_question like 'welche genetische %'
    or normalized_question like 'welches gen %'
    or normalized_question like 'welche translokation %'
    or normalized_question like 'welcher karyotyp %'
    or normalized_question like 'welche chromosomen%'
    or normalized_question like 'welche mikrodel%'
    or normalized_question like 'welche repeat%' then
    return format(
      'Entscheidend ist, dass %s die klassische genetische Veraenderung, das Gen oder die Chromosomenanomalie hinter dem genannten Krankheitsbild ist.',
      answer_or_placeholder
    );
  elsif normalized_question like 'welches hormon %' then
    return format(
      'Entscheidend ist, dass %s die im Fragetext angesprochene physiologische Regulation uebernimmt.',
      answer_or_placeholder
    );
  elsif normalized_question like 'welches vitamin %' then
    return format(
      'Entscheidend ist, dass %s fuer die angesprochene Stoffwechsel-, Gerinnungs- oder Organfunktion benoetigt wird.',
      answer_or_placeholder
    );
  elsif normalized_question like 'welches mineral %'
    or normalized_question like 'welches ion %'
    or normalized_question like 'welcher elektrolyt %' then
    return format(
      'Entscheidend ist, dass %s das fuer die beschriebene Koerperfunktion zentrale Ion, Mineral oder Elektrolyt ist.',
      answer_or_placeholder
    );
  elsif normalized_question like 'welche blutgruppe %' then
    return format(
      'Entscheidend ist, dass %s unter Standardregeln genau die im Fragetext beschriebene Transfusionseigenschaft besitzt.',
      answer_or_placeholder
    );
  elsif normalized_question like 'welche zellen %'
    or normalized_question like 'welche zellart %'
    or normalized_question like 'welcher zelltyp %' then
    return format(
      'Entscheidend ist, dass %s die im Fragetext abgefragte immunologische, histologische oder pathophysiologische Rolle uebernehmen.',
      answer_or_placeholder
    );
  elsif normalized_question like 'welcher erreger %'
    or normalized_question like 'welches bakterium %'
    or normalized_question like 'welcher pilz %'
    or normalized_question like 'welches virus %'
    or normalized_question like 'welcher parasit %'
    or normalized_question like 'welche pilzinfektion %' then
    return format(
      'Entscheidend ist, dass %s der klassische Erreger oder Parasit hinter dem genannten Krankheitsbild oder Befund ist.',
      answer_or_placeholder
    );
  elsif normalized_question like 'welches enzym %' then
    return format(
      'Entscheidend ist, dass %s das Enzym ist, das den im Fragetext genannten Stoffwechselschritt oder Defekt bestimmt.',
      answer_or_placeholder
    );
  elsif normalized_question like 'welcher rezeptor %' then
    return format(
      'Entscheidend ist, dass %s den im Fragetext beschriebenen Signalweg oder Arzneimitteleffekt vermittelt.',
      answer_or_placeholder
    );
  elsif normalized_question like 'welcher test %'
    or normalized_question like 'welche diagnostik %'
    or normalized_question like 'welche bildgebung %'
    or normalized_question like 'welche untersuchung %' then
    return format(
      'Entscheidend ist, dass %s das Standardverfahren fuer das im Fragetext beschriebene diagnostische Problem ist.',
      answer_or_placeholder
    );
  elsif normalized_question like 'welcher tumormarker %' then
    return format(
      'Entscheidend ist, dass %s der klassisch mit dem genannten Tumor assoziierte Marker ist.',
      answer_or_placeholder
    );
  elsif normalized_question like 'was ist ein %'
    or normalized_question like 'was ist eine %'
    or normalized_question like 'wie nennt man %'
    or normalized_question like 'was beschreibt %' then
    return 'Entscheidend ist, dass diese Option die definierende Eigenschaft des im Fragetext beschriebenen medizinischen Begriffs oder Prozesses nennt.';
  else
    return public.build_fallback_question_explanation(normalized_answer, normalized_language);
  end if;
end;
$$;

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
  lowered_explanation text := lower(normalized_explanation);
  normalized_answer text := lower(btrim(coalesce(p_correct_answer, '')));
begin
  if normalized_explanation = '' then
    return true;
  end if;

  if lowered_explanation like 'richtige antwort:%'
    or lowered_explanation like 'correct answer:%'
    or lowered_explanation like 'the correct answer is%'
    or lowered_explanation = 'review the stem again and focus on the key medical fact being tested.'
    or lowered_explanation = 'pruefe den fragetext noch einmal und achte auf die medizinische kernaussage.'
    or lowered_explanation like '% is correct because it best matches the key medical fact asked in this question.'
    or lowered_explanation like '% ist richtig, weil diese antwort die medizinische kernaussage der frage am besten trifft.'
    or lowered_explanation like 'this option is correct because %'
    or lowered_explanation like 'diese antwort ist richtig, weil %' then
    return true;
  end if;

  if normalized_answer <> ''
    and lowered_explanation = normalized_answer then
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
