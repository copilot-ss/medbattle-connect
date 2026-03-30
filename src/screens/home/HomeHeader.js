import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import AvatarView from '../../components/avatar/AvatarView';
import styles from '../styles/HomeScreen.styles';

export default function HomeHeader({
  coins = 0,
  energy = 0,
  energyMax = null,
  energyGainFx = null,
  avatarInitials = '?',
  avatarUri = null,
  avatarSource = null,
  avatarIcon = null,
  avatarColor = null,
  level = 1,
  progress = 0,
  hasClaimableAchievements = false,
  onProfilePress,
  onEnergyPress,
}) {
  const { t } = useTranslation();
  const energyPulseScale = useRef(new Animated.Value(1)).current;
  const energyPulseX = useRef(new Animated.Value(0)).current;
  const energyPulseGlow = useRef(new Animated.Value(0)).current;
  const energyBurstY = useRef(new Animated.Value(0)).current;
  const energyBurstOpacity = useRef(new Animated.Value(0)).current;
  const resolvedEnergy = Number.isFinite(energy) ? energy : 0;
  const resolvedEnergyMax =
    Number.isFinite(energyMax) && energyMax > 0 ? energyMax : null;
  const energyLabel = resolvedEnergyMax
    ? `${resolvedEnergy}/${resolvedEnergyMax}`
    : `${resolvedEnergy}`;
  const energyGainAmount =
    Number.isFinite(energyGainFx?.amount) && energyGainFx.amount > 0
      ? energyGainFx.amount
      : 0;
  const energyActionable = typeof onEnergyPress === 'function';
  const safeProgress = Number.isFinite(progress) ? Math.min(Math.max(progress, 0), 1) : 0;
  const progressWidth = `${Math.round(safeProgress * 100)}%`;

  useEffect(() => {
    if (!energyGainFx?.key || energyGainAmount <= 0) {
      return undefined;
    }

    energyPulseScale.setValue(0.92);
    energyPulseX.setValue(0);
    energyPulseGlow.setValue(0);
    energyBurstY.setValue(10);
    energyBurstOpacity.setValue(0);

    const animation = Animated.parallel([
      Animated.sequence([
        Animated.timing(energyPulseGlow, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(energyPulseGlow, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.spring(energyPulseScale, {
          toValue: 1.12,
          speed: 18,
          bounciness: 11,
          useNativeDriver: true,
        }),
        Animated.spring(energyPulseScale, {
          toValue: 1,
          speed: 16,
          bounciness: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(energyPulseX, {
          toValue: -5,
          duration: 55,
          useNativeDriver: true,
        }),
        Animated.timing(energyPulseX, {
          toValue: 5,
          duration: 55,
          useNativeDriver: true,
        }),
        Animated.timing(energyPulseX, {
          toValue: -3,
          duration: 55,
          useNativeDriver: true,
        }),
        Animated.timing(energyPulseX, {
          toValue: 0,
          duration: 55,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(energyBurstOpacity, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(energyBurstOpacity, {
          toValue: 0,
          duration: 520,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(energyBurstY, {
          toValue: -8,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(energyBurstY, {
          toValue: -24,
          duration: 440,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start();
    return () => animation.stop();
  }, [
    energyBurstOpacity,
    energyBurstY,
    energyGainAmount,
    energyGainFx?.key,
    energyPulseGlow,
    energyPulseScale,
    energyPulseX,
  ]);

  return (
    <View style={styles.header}>
      <Pressable
        onPress={onProfilePress}
        disabled={!onProfilePress}
        style={({ pressed }) => [
          styles.profileQuickAccess,
          hasClaimableAchievements ? styles.profileQuickAccessClaimReady : null,
          pressed ? styles.profileQuickAccessPressed : null,
        ]}
        accessibilityRole="button"
        accessibilityLabel={t('Profil')}
      >
        <AvatarView
          uri={avatarUri}
          source={avatarSource}
          icon={avatarIcon}
          color={avatarColor}
          initials={avatarInitials}
          frameStyle={[
            styles.profileAvatarFrame,
            avatarColor ? { borderColor: avatarColor } : null,
          ]}
          circleStyle={[
            styles.profileAvatarCircle,
            avatarColor ? { backgroundColor: `${avatarColor}33` } : null,
          ]}
          imageStyle={styles.profileAvatarImage}
          iconSize={18}
          iconColor={avatarColor || '#CBEAFF'}
          textStyle={styles.profileAvatarInitials}
        />
        <View style={styles.profileProgressBlock}>
          <Text style={styles.profileLevelText}>
            {t('Level {level}', { level })}
          </Text>
          <View style={styles.profileProgressTrack}>
            <View
              style={[
                styles.profileProgressFill,
                { width: progressWidth },
                avatarColor ? { backgroundColor: avatarColor } : null,
              ]}
            />
          </View>
        </View>
        {hasClaimableAchievements ? (
          <View style={styles.profileQuickAccessClaimBadge}>
            <Ionicons
              name="checkmark"
              size={14}
              color="#F8FAFC"
            />
          </View>
        ) : null}
      </Pressable>

      <View style={styles.quickActions}>
        <View style={styles.coinBadge}>
          <Text style={styles.coinEmoji}>{'\u{1FA99}'}</Text>
          <Text style={styles.coinBadgeText}>{coins}</Text>
        </View>
        {energyActionable ? (
          <Pressable
            onPress={onEnergyPress}
            accessibilityRole="button"
            accessibilityLabel={t('Energie')}
          >
            {({ pressed }) => (
              <Animated.View
                style={[
                  styles.energyTopBadge,
                  pressed ? styles.energyTopBadgePressed : null,
                  {
                    transform: [
                      { translateX: energyPulseX },
                      { scale: energyPulseScale },
                    ],
                  },
                ]}
              >
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.energyTopBadgeGlow,
                    { opacity: energyPulseGlow },
                  ]}
                />
                <Text style={styles.energyTopEmoji}>{'\u26A1'}</Text>
                <Text style={styles.energyTopBadgeText}>{energyLabel}</Text>
                <Animated.Text
                  pointerEvents="none"
                  style={[
                    styles.energyTopBurst,
                    {
                      opacity: energyBurstOpacity,
                      transform: [{ translateY: energyBurstY }],
                    },
                  ]}
                >
                  {`+${energyGainAmount}`}
                </Animated.Text>
              </Animated.View>
            )}
          </Pressable>
        ) : (
          <Animated.View
            style={[
              styles.energyTopBadge,
              {
                transform: [
                  { translateX: energyPulseX },
                  { scale: energyPulseScale },
                ],
              },
            ]}
          >
            <Animated.View
              pointerEvents="none"
              style={[
                styles.energyTopBadgeGlow,
                { opacity: energyPulseGlow },
              ]}
            />
            <Text style={styles.energyTopEmoji}>{'\u26A1'}</Text>
            <Text style={styles.energyTopBadgeText}>{energyLabel}</Text>
            <Animated.Text
              pointerEvents="none"
              style={[
                styles.energyTopBurst,
                {
                  opacity: energyBurstOpacity,
                  transform: [{ translateY: energyBurstY }],
                },
              ]}
            >
              {`+${energyGainAmount}`}
            </Animated.Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
