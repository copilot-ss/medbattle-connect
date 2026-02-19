import { useMemo } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { colors, fonts, radii } from '../styles/theme';
import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_DOCS,
  LEGAL_EXTERNAL_URLS,
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
  footerHint: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});

const resolveUrl = (url) => {
  if (!url) {
    return null;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

export default function LegalScreen({ navigation, route }) {
  const requestedDoc = route?.params?.doc;
  const docKey = typeof requestedDoc === 'string' ? requestedDoc : 'privacy';
  const legalDoc = LEGAL_DOCS[docKey] || LEGAL_DOCS.privacy;
  const externalUrl = useMemo(
    () => resolveUrl(LEGAL_EXTERNAL_URLS[legalDoc.id]),
    [legalDoc.id]
  );

  const handleOpenExternal = async () => {
    if (!externalUrl) {
      return;
    }

    try {
      await WebBrowser.openBrowserAsync(externalUrl, {
        enableBarCollapsing: true,
        showInRecents: true,
      });
    } catch (error) {
      try {
        const supported = await Linking.canOpenURL(externalUrl);
        if (supported) {
          await Linking.openURL(externalUrl);
        }
      } catch (fallbackError) {
        console.warn('Legal link konnte nicht geoeffnet werden:', fallbackError);
      }
    }
  };

  const handleContact = async () => {
    const mailto = `mailto:${LEGAL_CONTACT_EMAIL}`;
    try {
      const canOpen = await Linking.canOpenURL(mailto);
      if (canOpen) {
        await Linking.openURL(mailto);
      }
    } catch (error) {
      console.warn('Kontakt-Mail konnte nicht geoeffnet werden:', error);
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
              accessibilityLabel="Zurueck"
            >
              <Text style={styles.backText}>Zurueck</Text>
            </Pressable>
          </View>
          <Text style={styles.title}>{legalDoc.title}</Text>
          <Text style={styles.meta}>Stand: {legalDoc.updatedAt}</Text>
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
              accessibilityLabel="Support E-Mail"
            >
              <Text style={styles.browserButtonText}>Support per E-Mail</Text>
            </Pressable>
          ) : null}

          {externalUrl ? (
            <>
              <Pressable
                style={styles.browserButton}
                onPress={handleOpenExternal}
                accessibilityRole="link"
                accessibilityLabel="Im Browser oeffnen"
              >
                <Text style={styles.browserButtonText}>Im Browser oeffnen</Text>
              </Pressable>
              <Text style={styles.footerHint}>{externalUrl}</Text>
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

