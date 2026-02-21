import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, fonts, radii } from '../styles/theme';
import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_DOCS,
} from './legal/legalContent';

const SECTION_SPACING = 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 36,
    gap: SECTION_SPACING,
  },
  card: {
    borderRadius: radii.lg,
    backgroundColor: 'rgba(36, 36, 58, 0.82)',
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  backText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 24,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  intro: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  paragraph: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  bullet: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  browserButton: {
    marginTop: 6,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    alignItems: 'center',
  },
  browserButtonText: {
    color: '#001018',
    fontFamily: fonts.bold,
    fontSize: 14,
  },
});

export default function LegalScreen({ navigation, route }) {
  const requestedDoc = route?.params?.doc;
  const docKey = typeof requestedDoc === 'string' ? requestedDoc : 'privacy';
  const legalDoc = LEGAL_DOCS[docKey] || LEGAL_DOCS.privacy;

  const handleContact = async () => {
    const mailto = `mailto:${LEGAL_CONTACT_EMAIL}`;
    try {
      const canOpen = await Linking.canOpenURL(mailto);
      if (canOpen) {
        await Linking.openURL(mailto);
      }
    } catch (error) {
      console.warn('Support email could not be opened:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          </View>
          <Text style={styles.title}>{legalDoc.title}</Text>
          <Text style={styles.meta}>Updated: {legalDoc.updatedAt}</Text>
          <Text style={styles.intro}>{legalDoc.intro}</Text>
        </View>

        <View style={styles.card}>
          {legalDoc.sections.map((section) => (
            <View key={section.heading} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.heading}</Text>
              {section.paragraphs
                ? section.paragraphs.map((paragraph) => (
                    <Text key={paragraph} style={styles.paragraph}>
                      {paragraph}
                    </Text>
                  ))
                : null}
              {section.bullets
                ? section.bullets.map((bullet) => (
                    <Text key={bullet} style={styles.bullet}>
                      {'\u2022'} {bullet}
                    </Text>
                  ))
                : null}
            </View>
          ))}

          {legalDoc.id === 'support' ? (
            <Pressable
              style={styles.browserButton}
              onPress={handleContact}
              accessibilityRole="button"
              accessibilityLabel="Support email"
            >
              <Text style={styles.browserButtonText}>Contact support</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
