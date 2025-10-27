import { View, Text, Pressable } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20 }}>
        🩺 MedBattle
      </Text>

      <Pressable
        onPress={() => navigation.navigate('Quiz')}
        style={{
          backgroundColor: '#2563EB',
          paddingVertical: 14,
          paddingHorizontal: 30,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '500' }}>
          Quiz starten
        </Text>
      </Pressable>
    </View>
  );
}
