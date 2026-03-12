import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import AvatarView from '../components/avatar/AvatarView';
import { usePreferences } from '../context/PreferencesContext';
import { useTranslation } from '../i18n/useTranslation';
import {
  syncProfileAvatar,
  uploadProfileAvatarPhoto,
} from '../services/userService';
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

  const isCustomSelected = Boolean(avatarUri);
  const busy = uploadingPhoto || Boolean(selectingAvatarId);

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
        Alert.alert(t('Kamera nicht verf\u00fcgbar.'));
        return;
      }

      const mediaTypes = ImagePicker.MediaType?.Images
        ? [ImagePicker.MediaType.Images]
        : ImagePicker.MediaTypeOptions?.Images;

      const result = await picker({
        mediaTypes,
        allowsEditing: source !== 'camera',
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      const asset = Array.isArray(result.assets) ? result.assets[0] : null;
      if (!asset?.uri) {
        return;
      }

      await setAvatarUri(asset.uri);
      if (!authUserId || isGuest) {
        return;
      }

      const uploadResult = await uploadProfileAvatarPhoto(authUserId, asset.uri);
      if (!uploadResult.ok || !uploadResult.publicUrl) {
        console.warn('Konnte Avatar-Foto nicht hochladen:', uploadResult.error);
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
      }
    } catch (err) {
      console.warn('Konnte Avatar-Foto nicht ausw\u00e4hlen:', err);
    } finally {
      setUploadingPhoto(false);
    }
  }, [authUserId, isGuest, setAvatarUri, t]);

  const handlePickAvatarPhoto = useCallback(() => {
    Alert.alert(
      t('Foto w\u00e4hlen'),
      t('Quelle ausw\u00e4hlen'),
      [
        { text: t('Abbrechen'), style: 'cancel' },
        { text: t('Galerie'), onPress: () => openAvatarImagePicker('library') },
        { text: t('Kamera'), onPress: () => openAvatarImagePicker('camera') },
      ],
      { cancelable: true }
    );
  }, [openAvatarImagePicker, t]);

  return (
    <View style={styles.container}>
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
              <Text style={styles.profileTitleHint}>{t('Tippe unten, um dein Bild zu \u00e4ndern.')}</Text>
            </View>
          </View>

          <View style={styles.avatarGrid}>
            <Pressable
              onPress={handlePickAvatarPhoto}
              disabled={busy}
              style={[
                styles.avatarTile,
                styles.avatarTileCustom,
                isCustomSelected ? styles.avatarTileSelected : null,
                busy ? { opacity: 0.75 } : null,
              ]}
              accessibilityLabel={t('Foto aus Galerie')}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatarTileImage}
                  resizeMode="cover"
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
                    <Image
                      source={item.source}
                      style={styles.avatarTileImage}
                      resizeMode="cover"
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
