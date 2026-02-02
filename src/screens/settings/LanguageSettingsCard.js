import { Pressable, Text, View } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import styles from '../styles/SettingsScreen.styles';

const LANGUAGE_OPTIONS = [
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'en', label: 'Englisch', flag: '🇺🇸' },
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
              <View style={styles.languageButtonContent}>
                <Text style={[styles.languageFlag, isActive ? styles.languageFlagActive : null]}>
                  {option.flag}
                </Text>
                <Text
                  style={[
                    styles.languageButtonText,
                    isActive ? styles.languageButtonTextActive : null,
                  ]}
                >
                  {t(option.label)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
