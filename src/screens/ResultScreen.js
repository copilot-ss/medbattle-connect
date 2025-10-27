import { View, Text, Pressable } from 'react-native';

export default function ResultScreen({ route, navigation }) {
  const { score } = route.params;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 10 }}>
        Ergebnis
      </Text>

      <Text style={{ fontSize: 18, marginBottom: 30 }}>
        Du hast {score} Punkte erzielt!
      </Text>

      <Pressable
        onPress={() => navigation.navigate('Home')}
        style={{
          backgroundColor: '#2563EB',
          paddingVertical: 14,
          paddingHorizontal: 30,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '500' }}>
          Zurück
        </Text>
      </Pressable>
    </View>
  );
}
