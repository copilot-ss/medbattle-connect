import { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from '../i18n/useTranslation';
import styles from './styles/SettingsScreen.styles';
import SettingsHeader from './settings/SettingsHeader';
import useSettingsAuth from './settings/useSettingsAuth';
import useSettingsUser from './settings/useSettingsUser';

const HELP_ITEMS = [
  {
    key: 'forgotPassword',
    labelKey: 'Passwort vergessen',
    icon: 'mail-open-outline',
    kind: 'reset',
  },
  {
    key: 'privacy',
    labelKey: 'Datenschutz',
    icon: 'shield-checkmark-outline',
    doc: 'privacy',
  },
  {
    key: 'terms',
    labelKey: 'AGB',
    icon: 'document-text-outline',
    doc: 'terms',
  },
  {
    key: 'support',
    labelKey: 'Support',
    icon: 'headset-outline',
    doc: 'support',
  },
  {
    key: 'deleteAccount',
    labelKey: 'Konto löschen',
    icon: 'trash-outline',
    doc: 'deleteAccount',
    danger: true,
  },
];

export default function SettingsHelpScreen({ navigation }) {
  const { t } = useTranslation();
  const { authUserId, isGuest } = useSettingsUser();
  const {
    feedback,
    loadingReset,
    resetEmail,
    setResetEmail,
    showResetForm,
    handleToggleResetForm,
    handlePasswordReset,
  } = useSettingsAuth({
    navigation,
    onClearSession: null,
    authUserId,
    isGuest,
  });

  const handleBack = useCallback(() => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('MainTabs', { screen: 'Settings' });
  }, [navigation]);

  const handlePressItem = useCallback(
    (item) => {
      if (item.kind === 'reset') {
        handleToggleResetForm();
        return;
      }
      if (item.doc) {
        navigation.navigate('Legal', { doc: item.doc });
      }
    },
    [handleToggleResetForm, navigation]
  );

  return (
    <View style={styles.screenRoot}>
      <View style={[styles.container, styles.helpContainer]}>
        <View style={styles.backgroundGlowTop} pointerEvents="none" />
        <View style={styles.backgroundGlowBottom} pointerEvents="none" />
        <SettingsHeader
          onClose={handleBack}
          showClose
          actionType="back"
          title={t('Info')}
        />

        <ScrollView
          contentContainerStyle={styles.helpScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {feedback ? (
            <View style={styles.banner}>
              <Text style={styles.bannerText}>{feedback}</Text>
            </View>
          ) : null}

          <View style={[styles.card, styles.settingsCard]}>
            {HELP_ITEMS.map((item, index) => {
              const isLast = index === HELP_ITEMS.length - 1;
              const isResetItem = item.kind === 'reset';
              const resetExpanded = isResetItem && showResetForm;

              return (
                <View key={item.key}>
                  <Pressable
                    onPress={() => handlePressItem(item)}
                    style={[
                      styles.helpOptionButton,
                      isLast ? styles.helpOptionButtonLast : null,
                    ]}
                  >
                    <View style={styles.helpOptionContent}>
                      <View
                        style={[
                          styles.helpOptionIconWrap,
                          item.danger ? styles.helpOptionIconWrapDanger : null,
                        ]}
                      >
                        <Ionicons
                          name={item.icon}
                          size={17}
                          color={item.danger ? '#FFD5DB' : '#D8F2FF'}
                        />
                      </View>
                      <Text
                        style={[
                          styles.helpOptionLabel,
                          item.danger ? styles.helpOptionLabelDanger : null,
                        ]}
                      >
                        {t(item.labelKey)}
                      </Text>
                    </View>
                    <Ionicons
                      name={resetExpanded ? 'chevron-up' : 'chevron-forward'}
                      size={18}
                      color={item.danger ? '#FF9AAA' : '#7DD3FC'}
                    />
                  </Pressable>

                  {resetExpanded ? (
                    <View style={styles.helpResetBlock}>
                      <TextInput
                        value={resetEmail}
                        onChangeText={setResetEmail}
                        placeholder={t('deine@email.com')}
                        placeholderTextColor="#64748B"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={styles.input}
                      />
                      <Text style={styles.helperText}>{t('Passwort vergessen?')}</Text>
                      <Pressable
                        onPress={handlePasswordReset}
                        disabled={loadingReset}
                        style={[
                          styles.actionButton,
                          styles.warningButton,
                          loadingReset ? styles.warningButtonDisabled : null,
                        ]}
                      >
                        {loadingReset ? (
                          <ActivityIndicator color="#0F172A" />
                        ) : (
                          <Text style={styles.warningButtonText}>{t('Link senden')}</Text>
                        )}
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
