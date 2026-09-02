import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AppImage from '../components/media/AppImage';

import AvatarView from '../components/avatar/AvatarView';
import GameBackground from '../components/game/GameBackground';
import { usePreferences } from '../context/PreferencesContext';
import { useTranslation } from '../i18n/useTranslation';
import {
  syncProfileAvatar,
  uploadProfileAvatarPhoto,
} from '../services/userService';
import {
  loadUserContentPolicyAccepted,
  saveUserContentPolicyAccepted,
} from '../utils/userContentPolicyConsent';
import SettingsHeader from './settings/SettingsHeader';
import useSettingsStats from './settings/useSettingsStats';
import useSettingsUser from './settings/useSettingsUser';
import AVATARS from './settings/avatars';
import styles from './styles/SettingsScreen.styles';

export default function AvatarEditScreen({ navigation }) {
  const { t } = useTranslation();
  const {
    streaks,
    userStats,
    avatarId,
    setAvatarId,
    avatarUri,
    setAvatarUri,
  } = usePreferences();
  const { userName, authUserId, isGuest } = useSettingsUser();
  const { userLevel, currentAvatar, avatarInitials } = useSettingsStats({
    streaks,
    userStats,
    avatarId,
    userName,
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectingAvatarId, setSelectingAvatarId] = useState(null);
  const [userContentPolicyAccepted, setUserContentPolicyAccepted] = useState(false);
  const [userContentPolicyResolved, setUserContentPolicyResolved] = useState(false);

  const isCustomSelected = Boolean(avatarUri);
  const busy = uploadingPhoto || Boolean(selectingAvatarId);

  useEffect(() => {
    let active = true;

    loadUserContentPolicyAccepted()
      .then((accepted) => {
        if (!active) {
          return;
        }
        setUserContentPolicyAccepted(accepted);
      })
      .finally(() => {
        if (active) {
          setUserContentPolicyResolved(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSelectAvatar = useCallback(async (item) => {
    if (!item || userLevel < item.level) {
      return;
    }

    setSelectingAvatarId(item.id);
    try {
      await setAvatarId(item.id);
      if (avatarUri) {
        await setAvatarUri(null);
      }

      if (authUserId && !isGuest) {
        const syncResult = await syncProfileAvatar(authUserId, {
          avatarUrl: null,
          avatarIcon: item.icon ?? null,
          avatarColor: item.color ?? null,
        });
        if (!syncResult.ok) {
          console.warn('Konnte Profil-Avatar nicht synchronisieren:', syncResult.error);
        }
      }
    } catch (err) {
      console.warn('Konnte Avatar nicht speichern:', err);
    } finally {
      setSelectingAvatarId(null);
    }
  }, [authUserId, avatarUri, isGuest, setAvatarId, setAvatarUri, userLevel]);

  const showAvatarSyncWarning = useCallback(() => {
    Alert.alert(
      t('Foto konnte nicht gespeichert werden.'),
      t('Bitte versuche es noch einmal.')
    );
  }, [t]);

  const openAvatarImagePicker = useCallback(async (source) => {
    setUploadingPhoto(true);
    try {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          t('Berechtigung erforderlich'),
          source === 'camera'
            ? t('Bitte erlaube Zugriff auf die Kamera.')
            : t('Bitte erlaube Zugriff auf deine Fotos.')
        );
        return;
      }

      const picker =
        source === 'camera'
          ? ImagePicker.launchCameraAsync
          : ImagePicker.launchImageLibraryAsync;

      if (typeof picker !== 'function') {
        Alert.alert(t('Kamera nicht verfügbar.'));
        return;
      }

      const mediaTypes = ImagePicker.MediaType?.Images
        ? [ImagePicker.MediaType.Images]
        : ImagePicker.MediaTypeOptions?.Images;

      const result = await picker({
        mediaTypes,
        allowsEditing: source !== 'camera',
        aspect: [1, 1],
        base64: true,
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      const asset = Array.isArray(result.assets) ? result.assets[0] : null;
      if (!asset?.uri) {
        return;
      }

      const previousAvatarUri = avatarUri ?? null;
      await setAvatarUri(asset.uri);
      if (!authUserId || isGuest) {
        return;
      }

      const uploadResult = await uploadProfileAvatarPhoto(authUserId, asset.uri, {
        base64Data: asset.base64 ?? null,
        mimeType: asset.mimeType ?? null,
      });
      if (!uploadResult.ok || !uploadResult.publicUrl) {
        console.warn('Konnte Avatar-Foto nicht hochladen:', uploadResult.error);
        await setAvatarUri(previousAvatarUri);
        showAvatarSyncWarning();
        return;
      }

      await setAvatarUri(uploadResult.publicUrl);
      const syncResult = await syncProfileAvatar(authUserId, {
        avatarUrl: uploadResult.publicUrl,
        avatarIcon: null,
        avatarColor: null,
      });
      if (!syncResult.ok) {
        console.warn('Konnte Profil-Avatar nach Upload nicht speichern:', syncResult.error);
        await setAvatarUri(previousAvatarUri);
        showAvatarSyncWarning();
      }
    } catch (err) {
      console.warn('Konnte Avatar-Foto nicht auswählen:', err);
      showAvatarSyncWarning();
    } finally {
      setUploadingPhoto(false);
    }
  }, [authUserId, avatarUri, isGuest, setAvatarUri, showAvatarSyncWarning, t]);

  const handlePickAvatarPhoto = useCallback(() => {
    if (!userContentPolicyAccepted) {
      Alert.alert(
        t('Bitte akzeptiere zuerst AGB und Datenschutz.'),
        t('Bevor du ein Profilfoto hochlaedst, musst du die AGB akzeptieren und die Datenschutzerklaerung lesen.')
      );
      return;
    }

    Alert.alert(
      t('Foto wählen'),
      t('Quelle auswählen'),
      [
        { text: t('Abbrechen'), style: 'cancel' },
        { text: t('Galerie'), onPress: () => openAvatarImagePicker('library') },
        { text: t('Kamera'), onPress: () => openAvatarImagePicker('camera') },
      ],
      { cancelable: true }
    );
  }, [openAvatarImagePicker, t, userContentPolicyAccepted]);

  const handleAcceptUserContentPolicy = useCallback(async () => {
    const ok = await saveUserContentPolicyAccepted(true);
    if (ok) {
      setUserContentPolicyAccepted(true);
      return;
    }

    Alert.alert(
      t('Fehler'),
      t('Zustimmung konnte nicht gespeichert werden.')
    );
  }, [t]);

  return (
    <View style={styles.container}>
      <GameBackground intensity="subtle" />
      <View style={styles.backgroundGlowTop} pointerEvents="none" />
      <View style={styles.backgroundGlowBottom} pointerEvents="none" />
      <SettingsHeader
        title={t('Profilbild')}
        onClose={() => navigation.goBack()}
        showClose
        actionType="back"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, styles.profileCard]}>
          {userContentPolicyResolved && !userContentPolicyAccepted ? (
            <View style={localStyles.policyCard}>
              <Text style={localStyles.policyTitle}>
                {t('AGB und Datenschutz vor UGC-Upload bestaetigen')}
              </Text>
              <Text style={localStyles.policyText}>
                {t('Bevor du ein Profilfoto hochlaedst, musst du die AGB akzeptieren und die Datenschutzerklaerung lesen.')}
              </Text>
              <Text style={localStyles.policyHint}>
                {t('Nutzernamen, Profilbilder und soziale Interaktionen muessen unsere App-Regeln beachten.')}
              </Text>
              <View style={localStyles.policyActions}>
                <Pressable
                  onPress={() => navigation.navigate('Legal', { doc: 'terms' })}
                  style={localStyles.policySecondaryButton}
                >
                  <Text style={localStyles.policySecondaryButtonText}>{t('AGB')}</Text>
                </Pressable>
                <Pressable
                  onPress={() => navigation.navigate('Legal', { doc: 'privacy' })}
                  style={localStyles.policySecondaryButton}
                >
                  <Text style={localStyles.policySecondaryButtonText}>{t('Datenschutz')}</Text>
                </Pressable>
              </View>
              <Pressable
                onPress={() => {
                  void handleAcceptUserContentPolicy();
                }}
                style={localStyles.policyPrimaryButton}
              >
                <Text style={localStyles.policyPrimaryButtonText}>
                  {t('Akzeptieren und fortfahren')}
                </Text>
              </Pressable>
            </View>
          ) : null}

          <View style={[styles.profileRow, styles.profileRowNoTitle]}>
            <AvatarView
              uri={avatarUri}
              source={currentAvatar?.source ?? null}
              icon={currentAvatar?.icon ?? null}
              color={currentAvatar?.color ?? null}
              initials={avatarInitials}
              frameStyle={[
                styles.avatarFrame,
                currentAvatar?.color
                  ? { borderColor: currentAvatar.color, shadowColor: currentAvatar.color }
                  : null,
              ]}
              circleStyle={[
                styles.avatarCircle,
                currentAvatar?.color ? { backgroundColor: `${currentAvatar.color}30` } : null,
              ]}
              imageStyle={styles.avatarImage}
              iconSize={30}
              iconColor={currentAvatar?.color || '#9EDCFF'}
              textStyle={styles.avatarText}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userName || t('Profil')}</Text>
              <Text style={styles.profileTitleHint}>{t('Tippe unten, um dein Bild zu ändern.')}</Text>
            </View>
          </View>

          <View style={styles.avatarGrid}>
            <Pressable
              onPress={handlePickAvatarPhoto}
              disabled={busy || !userContentPolicyAccepted}
              style={[
                styles.avatarTile,
                styles.avatarTileCustom,
                isCustomSelected ? styles.avatarTileSelected : null,
                busy || !userContentPolicyAccepted ? { opacity: 0.75 } : null,
              ]}
              accessibilityLabel={t('Foto aus Galerie')}
            >
              {avatarUri ? (
                <AppImage
                  source={{ uri: avatarUri }}
                  style={styles.avatarTileImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.avatarTilePlaceholder}>
                  <Ionicons name="image" size={22} color="#93C5FD" />
                  <Text style={styles.avatarTilePlaceholderText}>{t('Foto')}</Text>
                </View>
              )}
              {uploadingPhoto ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(8, 12, 20, 0.45)',
                  }}
                >
                  <ActivityIndicator color="#CBEAFF" />
                </View>
              ) : null}
            </Pressable>

            {AVATARS.map((item) => {
              const locked = userLevel < item.level;
              const selected =
                !avatarUri && (avatarId === item.id || (!avatarId && item.id === currentAvatar?.id));
              const selectingThisAvatar = selectingAvatarId === item.id;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleSelectAvatar(item)}
                  disabled={locked || busy}
                  style={[
                    styles.avatarTile,
                    selected ? styles.avatarTileSelected : null,
                    locked ? styles.avatarTileLocked : null,
                    busy && !selected ? { opacity: 0.75 } : null,
                  ]}
                >
                  {item.source ? (
                    <AppImage
                      source={item.source}
                      style={styles.avatarTileImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.avatarTileIconWrap}>
                      <Ionicons
                        name={item.icon || 'person-outline'}
                        size={30}
                        color={item.color || '#9EDCFF'}
                      />
                    </View>
                  )}
                  {selectingThisAvatar ? (
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(8, 12, 20, 0.45)',
                      }}
                    >
                      <ActivityIndicator color="#CBEAFF" />
                    </View>
                  ) : null}
                  {locked ? (
                    <View style={styles.avatarTileLockBanner}>
                      <Text style={styles.avatarTileLevel}>
                        {t('Level {level}', { level: item.level })}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  policyCard: {
    marginBottom: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.26)',
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  policyTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  policyText: {
    color: '#D9E7F5',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  policyHint: {
    color: '#9FB4C8',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
  policyActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  policySecondaryButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.26)',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  policySecondaryButtonText: {
    color: '#D8ECFF',
    fontSize: 13,
    fontWeight: '600',
  },
  policyPrimaryButton: {
    marginTop: 10,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: '#60A5FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  policyPrimaryButtonText: {
    color: '#081019',
    fontSize: 14,
    fontWeight: '700',
  },
});
