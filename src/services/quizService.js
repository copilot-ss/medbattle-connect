import { supabase } from '../lib/supabaseClient';

// 🔹 Fragen aus der Supabase-Datenbank laden
export async function fetchQuestions(limit = 10) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('❌ Fehler beim Laden der Fragen:', error.message);
    return [];
  }

  // Sicherstellen, dass Optionen als Array vorliegen
  return data.map((q) => ({
    ...q,
    options: Array.isArray(q.options)
      ? q.options
      : typeof q.options === 'string'
      ? JSON.parse(q.options)
      : [],
  }));
}

// 🔹 Spielergebnis speichern
export async function submitScore(userId, points, difficulty = 'mittel') {
  const { error } = await supabase.from('scores').insert([
    {
      user_id: userId,
      points,
      difficulty,
    },
  ]);

  if (error) {
    console.error('❌ Fehler beim Speichern des Scores:', error.message);
  } else {
    console.log('✅ Score erfolgreich gespeichert');
  }
}
