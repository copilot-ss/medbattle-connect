import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AvatarView from './avatar/AvatarView';
import { styles } from './publicProfileSheet/publicProfileSheetStyles';
import { usePublicProfileSheet } from './publicProfileSheet/usePublicProfileSheet';

export default function PublicProfileSheet({
  visible,
  onClose,
  profile,
  primaryActionLabel = null,
  onPrimaryAction = null,
  primaryActionIcon = null,
  primaryActionLoading = false,
  primaryActionDisabled = false,
  footerActionLabel = null,
  onFooterAction = null,
  footerActionLoading = false,
  footerActionDisabled = false,
  onBlockChange = null,
}) {
  const {
    t,
    shouldRender,
    resolvedProfile,
    loading,
    blockingUser,
    initials,
    name,
    subtitle,
    levelLabel,
    localizedTitle,
    isOnlineStatus,
    presetAvatarSource,
    showPrimaryAction,
    showFooterAction,
    showModerationActions,
    showActionStack,
    userBlocked,
    statCards,
    handleReportUser,
    handleToggleBlock,
  } = usePublicProfileSheet({
    visible,
    profile,
    primaryActionLabel,
    onPrimaryAction,
    footerActionLabel,
    onFooterAction,
    onBlockChange,
  });

  if (!shouldRender) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeading}>
            <Text style={styles.headerTitle}>{t('Profil')}</Text>
          </View>
          <View style={styles.headerActions}>
            {loading ? (
              <ActivityIndicator size="small" color="#57C7FF" />
            ) : null}
            {showPrimaryAction ? (
              <Pressable
                onPress={() => onPrimaryAction(resolvedProfile)}
                disabled={loading || primaryActionDisabled || primaryActionLoading}
                style={[
                  styles.headerIconButton,
                  (loading || primaryActionDisabled || primaryActionLoading)
                    ? styles.footerActionButtonDisabled
                    : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel={primaryActionLabel}
              >
                {primaryActionLoading ? (
                  <ActivityIndicator size="small" color="#D8ECFF" />
                ) : (
                  <Ionicons
                    name={primaryActionIcon || 'person-add'}
                    size={16}
                    color="#D8ECFF"
                  />
                )}
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.profileRow}>
          <AvatarView
            uri={resolvedProfile.avatarUrl}
            source={presetAvatarSource}
            icon={resolvedProfile.avatarIcon}
            color={resolvedProfile.avatarColor ?? '#9EDCFF'}
            initials={initials}
            frameStyle={styles.avatarFrame}
            circleStyle={styles.avatarCircle}
            imageStyle={styles.avatarImage}
            iconSize={26}
            textStyle={styles.avatarText}
          />
          <View style={styles.profileInfo}>
            <View style={styles.profileNameRow}>
              <Text style={styles.profileName}>{name}</Text>
              {isOnlineStatus ? (
                <View style={styles.profileNameOnlineDotWrap}>
                  <View style={styles.profileNameOnlineDot} />
                </View>
              ) : null}
            </View>
            {subtitle ? (
              <Text style={styles.profileSubtitle}>{subtitle}</Text>
            ) : null}
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{levelLabel}</Text>
            </View>
            <View style={styles.profileTitleRow}>
              <Text style={styles.profileTitleLabel}>{t('Titel')}</Text>
              <Text style={styles.profileTitleValue}>{localizedTitle}</Text>
            </View>
          </View>
        </View>

        <View style={styles.profileStatsRow}>
          {statCards.map((item) => (
            <View key={item.key} style={styles.profileStatCard}>
              <Text style={styles.profileStatLabel}>{item.label}</Text>
              <Text style={styles.profileStatValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {resolvedProfile.bio ? (
          <View style={styles.bioWrap}>
            <Text style={styles.bioText}>{resolvedProfile.bio}</Text>
          </View>
        ) : null}

        {showActionStack ? (
          <View style={styles.actionStack}>
            {showModerationActions ? (
              <View style={styles.secondaryActionRow}>
                <Pressable
                  onPress={() => {
                    void handleReportUser();
                  }}
                  style={styles.secondaryActionButton}
                  accessibilityRole="button"
                  accessibilityLabel={t('Nutzer/Inhalt melden')}
                >
                  <Text style={styles.secondaryActionText}>{t('Nutzer/Inhalt melden')}</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    void handleToggleBlock();
                  }}
                  disabled={blockingUser}
                  style={[
                    styles.secondaryActionButton,
                    styles.secondaryActionDangerButton,
                    userBlocked ? styles.secondaryActionNeutralButton : null,
                    blockingUser ? styles.footerActionButtonDisabled : null,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={userBlocked ? t('Blockierung aufheben') : t('Blockieren')}
                >
                  {blockingUser ? (
                    <ActivityIndicator size="small" color="#FFE7E7" />
                  ) : (
                    <Text
                      style={[
                        styles.secondaryActionDangerText,
                        userBlocked ? styles.secondaryActionNeutralText : null,
                      ]}
                    >
                      {userBlocked ? t('Blockierung aufheben') : t('Blockieren')}
                    </Text>
                  )}
                </Pressable>
              </View>
            ) : null}
            {showFooterAction ? (
              <Pressable
                onPress={() => onFooterAction(resolvedProfile)}
                disabled={footerActionDisabled || footerActionLoading}
                style={[
                  styles.footerActionButton,
                  (footerActionDisabled || footerActionLoading)
                    ? styles.footerActionButtonDisabled
                    : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel={footerActionLabel}
              >
                {footerActionLoading ? (
                  <ActivityIndicator size="small" color="#FFD1D1" />
                ) : (
                  <Text style={styles.footerActionText}>{footerActionLabel}</Text>
                )}
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
