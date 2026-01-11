import { Pressable, Text, View } from 'react-native';
import styles from '../styles/SettingsScreen.styles';

const TABS = [
  { key: 'profile', label: 'Profil' },
  { key: 'settings', label: 'Einstellungen' },
];

export default function SettingsTabs({ activeTab, onChange }) {
  return (
    <View style={styles.tabRow}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[
              styles.tabButton,
              isActive ? styles.tabButtonActive : null,
            ]}
          >
            <Text
              style={[
                styles.tabButtonText,
                isActive ? styles.tabButtonTextActive : null,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
