import { Animated, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  COIN_EMOJI,
  PURCHASE_SPIN_DEGREES_PER_CYCLE,
  PURCHASE_SPIN_ROTATIONS_PER_CYCLE,
  formatThousands,
} from './shopConfig';

export default function ShopSections({
  sections,
  styles,
  registerHorizontalRef,
  cardWidth,
  purchasingId,
  coinsAvailable,
  isEnergyFull,
  remainingEnergySpace,
  remainingCap,
  availableIapProductIds,
  isOffline,
  canClaimDaily,
  dailyClaimLoading,
  dailyTimerLabel,
  purchaseButtonSpin,
  onBuyEnergy,
  onBuyEnergyCap,
  onBuyBoost,
  onBuyIap,
  onClaimDailyCoins,
  onShowComingSoon,
  t,
}) {
  return sections.map((section) => (
    <View key={section.key} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardList}
        ref={registerHorizontalRef(section.key)}
      >
        {section.items.map((item) => {
          const isBuying = purchasingId === item.id;
          const isEnergyItem = item.kind === 'energy';
          const isCapItem = item.kind === 'cap';
          const isIapItem = item.kind === 'iap';
          const isDailyItem = item.kind === 'daily';
          const isBoostItem = item.kind === 'boost';
          const isStreakShield = item.id === 'streak_shield';
          const isFreezeTime = item.id === 'freeze_time';
          const isComingSoon = item.comingSoon ?? !item.kind;
          const canAfford =
            isIapItem || isDailyItem ? true : coinsAvailable >= item.price;
          const energyLocked =
            isEnergyItem && (isEnergyFull || remainingEnergySpace < item.amount);
          const capLocked = isCapItem && remainingCap < item.amount;
          const hasLoadedIapProducts =
            Array.isArray(availableIapProductIds) && availableIapProductIds.length > 0;
          const iapProductAvailable =
            !isIapItem ||
            !hasLoadedIapProducts ||
            availableIapProductIds.includes(item.productId);
          const iapLocked =
            isIapItem && (isOffline || !iapProductAvailable);
          const dailyLocked = isDailyItem && (!canClaimDaily || dailyClaimLoading);
          const canBuy =
            !isComingSoon &&
            !isBuying &&
            canAfford &&
            !energyLocked &&
            !capLocked &&
            !iapLocked &&
            !dailyLocked;
          const buttonDisabled =
            isComingSoon ||
            isBuying ||
            (isEnergyItem && energyLocked);
          const itemCardSpinStyle = isBuying
            ? {
                transform: [
                  { perspective: 900 },
                  {
                    rotateY: purchaseButtonSpin.interpolate({
                      inputRange: [0, PURCHASE_SPIN_ROTATIONS_PER_CYCLE],
                      outputRange: ['0deg', PURCHASE_SPIN_DEGREES_PER_CYCLE],
                    }),
                  },
                ],
              }
            : null;
          const coinIconCount = isIapItem ? item.coinIconCount : null;
          const iconImage = item.image;
          const priceLabel = isIapItem
            ? item.priceLabel
            : isDailyItem
              ? null
              : `${formatThousands(item.price)} ${COIN_EMOJI}`;
          const savingsLabel =
            item.savingsPercent > 0
              ? `-${item.savingsPercent}%`
              : null;
          const buttonLabel = isComingSoon
            ? t('Kommt bald')
            : isDailyItem
              ? canClaimDaily
                ? t('Gratis')
                : dailyTimerLabel || t('Morgen wieder')
              : isIapItem && !iapProductAvailable
                ? t('Nicht verf\u00fcgbar')
              : t('Kaufen');

          const handlePress = () => {
            if (isComingSoon || isBuying) {
              return;
            }
            if (isEnergyItem) {
              onBuyEnergy(item);
              return;
            }
            if (isCapItem) {
              onBuyEnergyCap(item);
              return;
            }
            if (isBoostItem) {
              onBuyBoost(item);
              return;
            }
            if (isIapItem) {
              onBuyIap(item);
              return;
            }
            if (isDailyItem) {
              onClaimDailyCoins(item);
              return;
            }
            onShowComingSoon();
          };

          return (
            <View key={item.id} style={[styles.itemWrap, { width: cardWidth }]}>
              <Animated.View
                style={[
                  styles.itemCard,
                  isDailyItem ? styles.itemCardDaily : null,
                  itemCardSpinStyle,
                ]}
              >
                {savingsLabel ? (
                  <View style={styles.itemBadge} pointerEvents="none">
                    <Text style={styles.itemBadgeText}>{savingsLabel}</Text>
                  </View>
                ) : null}
                <View style={[styles.itemIconWrap, { backgroundColor: item.accent }]}>
                  {iconImage ? (
                    <Image
                      source={iconImage}
                      style={styles.itemIconImage}
                      resizeMode="contain"
                    />
                  ) : coinIconCount ? (
                    <View style={styles.coinStack}>
                      {Array.from({ length: coinIconCount }, (_, index) => (
                        <Text
                          key={`${item.id}-coin-${index}`}
                          style={[
                            styles.coinStackEmoji,
                            index > 0 ? styles.coinStackEmojiOffset : null,
                          ]}
                        >
                          {COIN_EMOJI}
                        </Text>
                      ))}
                    </View>
                  ) : (
                    <Ionicons name={item.icon} size={20} color="#0A0A12" />
                  )}
                </View>
                <View style={styles.itemInfo}>
                  <Text
                    style={[
                      styles.itemTitle,
                      isStreakShield ? styles.itemTitleSingleLine : null,
                      isFreezeTime ? styles.itemTitleFreezeTime : null,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    {item.title}
                  </Text>
                </View>
                {priceLabel ? (
                  <View style={styles.itemAction}>
                    <Text
                      style={styles.priceText}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}
                    >
                      {priceLabel}
                    </Text>
                  </View>
                ) : null}
              </Animated.View>
              <Pressable
                style={[
                  styles.buyButton,
                  styles.buyButtonOutside,
                  isDailyItem ? styles.buyButtonDailyCompact : null,
                  canBuy ? styles.buyButtonActive : styles.buyButtonDisabled,
                  isDailyItem && canBuy ? styles.buyButtonDailyActive : null,
                ]}
                disabled={buttonDisabled}
                onPress={handlePress}
              >
                <Text
                  style={[
                    styles.buyButtonText,
                    canBuy ? styles.buyButtonTextActive : null,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  {buttonLabel}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  ));
}
