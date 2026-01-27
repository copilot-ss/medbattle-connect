import { Pressable, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/SettingsScreen.styles';

const LANGUAGE_OPTIONS = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'Englisch' },
];

export default function LanguageSettingsCard({ language, onSelectLanguage }) {
  const { t } = useTranslation();

  return (
    <View style={[styles.card, styles.languageCard]}>
      <Text style={styles.cardLabel}>{t('Sprache')}</Text>
      <View style={styles.languageRow}>
        {LANGUAGE_OPTIONS.map((option) => {
          const isActive = option.value === language;
          return (
            <Pressable
              key={option.value}
              onPress={() => onSelectLanguage(option.value)}
              style={[
                styles.languageButton,
                isActive ? styles.languageButtonActive : null,
              ]}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  isActive ? styles.languageButtonTextActive : null,
                ]}
              >
                {t(option.label)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
