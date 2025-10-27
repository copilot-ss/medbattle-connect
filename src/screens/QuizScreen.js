import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { fetchQuestions } from '../services/quizService';

export default function QuizScreen({ navigation }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fragen aus Supabase laden
  useEffect(() => {
    async function loadQuestions() {
      const data = await fetchQuestions(10);
      setQuestions(data);
      setLoading(false);
    }
    loadQuestions();
  }, []);

  // Ladezustand anzeigen
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
        <Text style={{ marginTop: 10 }}>Fragen werden geladen...</Text>
      </View>
    );
  }

  // Wenn keine Fragen geladen werden konnten
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
          <Text style={{ color: 'white' }}>Zurück</Text>
        </Pressable>
      </View>
    );
  }

  const q = questions[index];

  function answer(option) {
    if (option === q.correct_answer) {
      setScore((s) => s + 1);
    }
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
    } else {
      navigation.navigate('Result', { score });
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
          marginBottom: 10,
        }}
      >
        Frage {index + 1} von {questions.length}
      </Text>

      <Text
        style={{
          fontSize: 20,
          marginBottom: 20,
        }}
      >
        {q.question}
      </Text>

      {q.options.map((opt, i) => (
        <Pressable
          key={i}
          onPress={() => answer(opt)}
          style={{
            backgroundColor: '#E5E7EB',
            padding: 12,
            borderRadius: 10,
            marginVertical: 6,
          }}
        >
          <Text style={{ fontSize: 16 }}>{opt}</Text>
        </Pressable>
      ))}
    </View>
  );
}
