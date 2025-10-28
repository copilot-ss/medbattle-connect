import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import { fetchQuestions, submitScore } from '../services/quizService';

export default function QuizScreen({ navigation }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        const data = await fetchQuestions(10);
        if (!data.length) {
          setError(
            'Keine Fragen verfuegbar. Bitte kontrolliere die Supabase-Daten oder verwende die Platzhalter.'
          );
          setQuestions([]);
        } else {
          setError(null);
          setQuestions(data);
        }
      } catch (err) {
        console.error('Fehler beim Laden der Fragen', err);
        setError(
          'Die Fragen konnten nicht geladen werden. Bitte versuche es spaeter erneut.'
        );
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) {
        return;
      }
      if (error) {
        console.warn('Konnte Nutzer nicht abrufen:', error.message);
      }
      setUserId(data?.user?.id ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) {
          return;
        }
        setUserId(session?.user?.id ?? null);
      }
    );

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10 }}>Fragen werden geladen ...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 24 }}>
          {error}
        </Text>
        <Pressable
          onPress={() => navigation.navigate('Home')}
          style={{
            backgroundColor: '#2563EB',
            paddingVertical: 12,
            paddingHorizontal: 28,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500' }}>
            Zurueck
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!questions.length) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text>Keine Fragen gefunden.</Text>
        <Pressable
          onPress={() => navigation.navigate('Home')}
          style={{
            marginTop: 20,
            backgroundColor: '#2563EB',
            padding: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: 'white' }}>Zurueck</Text>
        </Pressable>
      </View>
    );
  }

  const currentQuestion = questions[index];

  if (!currentQuestion) {
    return null;
  }

  function answer(option) {
    const isCorrect = option === currentQuestion.correct_answer;
    const nextScore = isCorrect ? score + 1 : score;

    setScore(nextScore);

    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
    } else {
      if (userId) {
        submitScore(userId, nextScore).then((result) => {
          if (!result?.ok) {
            console.warn(
              'Score konnte nicht gespeichert werden:',
              result?.error?.message ?? result?.error ?? 'Unbekannter Fehler'
            );
          }
        });
      }
      navigation.navigate('Result', {
        score: nextScore,
        total: questions.length,
        userId,
      });
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 8,
          color: '#2563EB',
        }}
      >
        Frage {index + 1} von {questions.length}
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: '#4B5563',
          marginBottom: 16,
        }}
      >
        Punkte: {score}
      </Text>

      <Text
        style={{
          fontSize: 20,
          marginBottom: 20,
          color: '#111827',
        }}
      >
        {currentQuestion.question}
      </Text>

      {currentQuestion.options.map((opt, i) => (
        <Pressable
          key={`${i}-${opt}`}
          onPress={() => answer(opt)}
          style={{
            backgroundColor: '#E5E7EB',
            padding: 12,
            borderRadius: 10,
            marginVertical: 6,
          }}
        >
          <Text style={{ fontSize: 16, color: '#1F2937' }}>{opt}</Text>
        </Pressable>
      ))}
    </View>
  );
}
