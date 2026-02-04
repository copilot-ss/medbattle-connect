import { useMemo, useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import styles from './styles/ShopScreen.styles';
import { colors } from '../styles/theme';
import { useConnectivity } from '../context/ConnectivityContext';
import { usePreferences } from '../context/PreferencesContext';
import { MAX_ENERGY, MAX_ENERGY_CAP_BONUS } from '../context/preferences/constants';
import useSupabaseUserId from '../hooks/useSupabaseUserId';
import { useTranslation } from '../i18n/useTranslation';
import { syncUserProgressDelta } from '../services/userProgressService';

const sanitizeStatNumber = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return 0;
};

export default function ShopScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isOnline } = useConnectivity();
  const userId = useSupabaseUserId();
  const {
    userStats,
    energy,
    energyMax,
    addEnergy,
    refreshEnergy,
    updateUserStats,
  } = usePreferences();
  const [shopMessage, setShopMessage] = useState(null);
  const [purchasingId, setPurchasingId] = useState(null);
  const coinsAvailable = sanitizeStatNumber(userStats?.coins);
  const maxEnergyLimit = MAX_ENERGY + MAX_ENERGY_CAP_BONUS;
  const remainingCap = Math.max(0, maxEnergyLimit - energyMax);
  const isEnergyFull = energy >= energyMax;
  const isOffline = isOnline === false;
  const contentPaddingTop = Math.max(insets.top + 16, 56);
  const contentPaddingBottom = Math.max(insets.bottom + 120, 140);

  const syncCoins = async (cost) => {
    if (!userId || !Number.isFinite(cost) || cost <= 0) {
      return;
    }
    try {
      await syncUserProgressDelta(userId, { coins: -cost }, { offline: isOffline });
    } catch (err) {
      console.warn('Konnte Coins nicht synchronisieren:', err);
    }
  };

  const handleBuyEnergy = async (item) => {
    if (purchasingId) {
      return;
    }
    if (isEnergyFull) {
      setShopMessage(t('Energie ist bereits voll.'));
      return;
    }
    if (coinsAvailable < item.price) {
      setShopMessage(t('Nicht genug Coins.'));
      return;
    }

    setShopMessage(null);
    setPurchasingId(item.id);

    try {
      await updateUserStats((current) => {
        const currentCoins = sanitizeStatNumber(current?.coins);
        return {
          ...current,
          coins: Math.max(0, currentCoins - item.price),
        };
      });
      const result = await addEnergy(item.amount);
      if (result.ok) {
        setShopMessage(t('+{energy} Energie erhalten!', { energy: item.amount }));
      } else {
        setShopMessage(t('Energie konnte nicht aufgef\u00fcllt werden.'));
      }
    } catch (err) {
      setShopMessage(t('Energie konnte nicht aufgef\u00fcllt werden.'));
    } finally {
      setPurchasingId(null);
    }

    await syncCoins(item.price);
  };

  const handleBuyEnergyCap = async (item) => {
    if (purchasingId) {
      return;
    }
    if (remainingCap <= 0 || remainingCap < item.amount) {
      setShopMessage(t('Maximale Energie erreicht.'));
      return;
    }
    if (coinsAvailable < item.price) {
      setShopMessage(t('Nicht genug Coins.'));
      return;
    }

    setShopMessage(null);
    setPurchasingId(item.id);

    try {
      await updateUserStats((current) => {
        const currentCoins = sanitizeStatNumber(current?.coins);
        const currentBonus = sanitizeStatNumber(current?.energyCapBonus);
        const nextBonus = Math.min(MAX_ENERGY_CAP_BONUS, currentBonus + item.amount);
        return {
          ...current,
          coins: Math.max(0, currentCoins - item.price),
          energyCapBonus: nextBonus,
        };
      });
      refreshEnergy();
      setShopMessage(t('Max Energie +{amount} freigeschaltet!', { amount: item.amount }));
    } catch (err) {
      setShopMessage(t('Upgrade konnte nicht gekauft werden.'));
    } finally {
      setPurchasingId(null);
    }

    await syncCoins(item.price);
  };

  const sections = useMemo(
    () => [
      {
        key: 'energy',
        title: t('Energie'),
        subtitle: t('Mehr Energie f\u00fcr l\u00e4ngere Sessions.'),
        items: [
          {
            id: 'energy-1',
            title: t('+1 Energie'),
            description: t('Schneller Mini-Boost.'),
            price: 2,
            icon: 'flash',
            accent: colors.accent,
            kind: 'energy',
            amount: 1,
          },
          {
            id: 'energy-10',
            title: t('+10 Energie'),
            description: t('Solider Boost f\u00fcr mehrere Runden.'),
            price: 20,
            icon: 'flash',
            accent: colors.accentWarm,
            kind: 'energy',
            amount: 10,
          },
          {
            id: 'energy-20',
            title: t('+20 Energie'),
            description: t('Gro\u00dfer Boost f\u00fcr lange Sessions.'),
            price: 40,
            icon: 'flash',
            accent: colors.highlight,
            kind: 'energy',
            amount: 20,
          },
        ],
      },
      {
        key: 'energy-cap',
        title: t('Max Energie'),
        subtitle: t('Erh\u00f6ht dein Energielimit dauerhaft.'),
        items: [
          {
            id: 'energy-cap-5',
            title: t('Max Energie +5'),
            description: t('F\u00fcr Power-User: dauerhaft mehr Energie.'),
            price: 150,
            icon: 'battery-charging',
            accent: colors.accentGreen,
            kind: 'cap',
            amount: 5,
          },
          {
            id: 'energy-cap-10',
            title: t('Max Energie +10'),
            description: t('F\u00fcr Power-User: dauerhaft mehr Energie.'),
            price: 280,
            icon: 'battery-charging',
            accent: colors.accentGreen,
            kind: 'cap',
            amount: 10,
          },
        ],
      },
      {
        key: 'boosts',
        title: t('Boosts'),
        subtitle: t('Kurzfristige Power für harte Runden.'),
        items: [
          {
            id: 'streak_shield',
            title: t('Streak-Schild'),
            description: t('Schützt eine Streak, wenn du einmal verlierst.'),
            price: 30,
            icon: 'shield-checkmark',
            accent: colors.accentWarm,
          },
          {
            id: 'freeze_time',
            title: t('Zeit einfrieren'),
            description: t('Stoppt den Timer einmal für 10 Sekunden.'),
            price: 25,
            icon: 'time',
            accent: colors.accent,
          },
          {
            id: 'double_xp',
            title: t('Doppel-XP'),
            description: t('2x XP für die nächsten 3 Quiz.'),
            price: 40,
            icon: 'flash',
            accent: colors.accentGreen,
          },
          {
            id: 'joker_5050',
            title: t('Joker 50/50'),
            description: t('Entfernt zwei falsche Antworten.'),
            price: 20,
            icon: 'help-circle',
            accent: colors.highlight,
          },
        ],
      },
      {
        key: 'style',
        title: t('Style'),
        subtitle: t('Cosmetics, Rahmen und Skins.'),
        items: [
          {
            id: 'avatar_neon',
            title: t('Avatar-Pack Neon'),
            description: t('Neue Avatare + bunte Rahmen.'),
            price: 35,
            icon: 'color-palette',
            accent: colors.accentPink,
          },
          {
            id: 'skin_midnight',
            title: t('Quiz-Skin "Midnight"'),
            description: t('Neues Farbschema für Karten & Buttons.'),
            price: 50,
            icon: 'moon',
            accent: colors.accent,
          },
          {
            id: 'title_legend',
            title: t('Profil-Titel "Legend"'),
            description: t('Exklusiver Titel im Profil.'),
            price: 60,
            icon: 'star',
            accent: colors.accentWarm,
          },
        ],
      },
    ],
    [t]
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: contentPaddingTop, paddingBottom: contentPaddingBottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{t('Shop')}</Text>
            <View style={styles.coinsBadge}>
              <Text style={styles.coinsEmoji}>🪙</Text>
              <Text style={styles.coinsText}>
                {coinsAvailable} {t('Coins')}
              </Text>
            </View>
          </View>
          <Text style={styles.subtitle}>{t('Hol dir Upgrades und Style mit Coins.')}</Text>
        </View>

        {shopMessage ? (
          <View style={styles.message}>
            <Text style={styles.messageText}>{shopMessage}</Text>
          </View>
        ) : null}

        {sections.map((section) => (
          <View key={section.key} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
            </View>
            <View style={styles.cardList}>
              {section.items.map((item) => {
                const isBuying = purchasingId === item.id;
                const isEnergyItem = item.kind === 'energy';
                const isCapItem = item.kind === 'cap';
                const isComingSoon = item.comingSoon ?? !item.kind;
                const canAfford = coinsAvailable >= item.price;
                const energyLocked = isEnergyItem && isEnergyFull;
                const capLocked = isCapItem && remainingCap < item.amount;
                const canBuy =
                  !isComingSoon &&
                  !isBuying &&
                  canAfford &&
                  !energyLocked &&
                  !capLocked;

                const handlePress = () => {
                  if (isComingSoon || isBuying) {
                    return;
                  }
                  if (isEnergyItem) {
                    handleBuyEnergy(item);
                    return;
                  }
                  if (isCapItem) {
                    handleBuyEnergyCap(item);
                    return;
                  }
                  setShopMessage(t('Kommt bald'));
                };

                return (
                  <View key={item.id} style={styles.itemCard}>
                    <View style={[styles.itemIconWrap, { backgroundColor: item.accent }]}>
                      <Ionicons name={item.icon} size={20} color="#0A0A12" />
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemDescription}>{item.description}</Text>
                    </View>
                    <View style={styles.itemAction}>
                      <View style={styles.pricePill}>
                        <Text style={styles.priceText}>
                          {item.price} {t('Coins')}
                        </Text>
                      </View>
                      <Pressable
                        style={[
                          styles.buyButton,
                          canBuy ? styles.buyButtonActive : styles.buyButtonDisabled,
                        ]}
                        disabled={isComingSoon || isBuying}
                        onPress={handlePress}
                      >
                        <Text
                          style={[
                            styles.buyButtonText,
                            canBuy ? styles.buyButtonTextActive : null,
                          ]}
                        >
                          {isComingSoon ? t('Kommt bald') : t('Kaufen')}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <Text style={styles.footerNote}>{t('Mehr Items kommen mit den nächsten Updates.')}</Text>
      </ScrollView>
    </View>
  );
}
