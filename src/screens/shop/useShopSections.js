import { useMemo } from 'react';
import { colors } from '../../styles/theme';
import { DAILY_FREE_COINS } from '../../services/dailyRewardsService';
import {
  COIN_EMOJI,
  ENERGY_EMOJI,
  COIN_PACKS,
  SHOP_PRICES,
  getCoinIconCount,
  getSavingsPercent,
} from './shopConfig';

export default function useShopSections({
  showDailySection,
  iapPriceLabelsByProductId,
  t,
}) {
  return useMemo(
    () => [
      ...(showDailySection
        ? [
            {
              key: 'daily',
              title: t('Gratis Coins'),
              items: [
                {
                  id: 'daily-coins',
                  title: t(`5 ${COIN_EMOJI}`),
                  priceLabel: t('Gratis'),
                  icon: 'gift',
                  accent: colors.accentGreen,
                  kind: 'daily',
                  amount: DAILY_FREE_COINS,
                },
              ],
            },
          ]
        : []),
      {
        key: 'energy',
        title: t('Energie'),
        items: [
          {
            id: 'energy-1',
            title: t(`+1 ${ENERGY_EMOJI}`),
            description: t('Schneller Mini-Boost.'),
            price: SHOP_PRICES.energy.one,
            icon: 'flash',
            accent: colors.accent,
            kind: 'energy',
            amount: 1,
          },
          {
            id: 'energy-10',
            title: t(`+10 ${ENERGY_EMOJI}`),
            description: t('Solider Boost für mehrere Runden.'),
            price: SHOP_PRICES.energy.ten,
            savingsPercent: Math.max(
              0,
              Math.round((1 - SHOP_PRICES.energy.ten / (SHOP_PRICES.energy.one * 10)) * 100)
            ),
            icon: 'flash',
            accent: colors.accentWarm,
            kind: 'energy',
            amount: 10,
          },
          {
            id: 'energy-20',
            title: t(`+20 ${ENERGY_EMOJI}`),
            description: t('Großer Boost für lange Sessions.'),
            price: SHOP_PRICES.energy.twenty,
            savingsPercent: Math.max(
              0,
              Math.round((1 - SHOP_PRICES.energy.twenty / (SHOP_PRICES.energy.one * 20)) * 100)
            ),
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
        items: [
          {
            id: 'energy-cap-5',
            title: t(`Max ${ENERGY_EMOJI} +5`),
            description: t('Für Power-User: dauerhaft mehr Energie.'),
            price: SHOP_PRICES.energyCap.plus5,
            icon: 'battery-charging',
            accent: colors.accentGreen,
            kind: 'cap',
            amount: 5,
          },
          {
            id: 'energy-cap-10',
            title: t(`Max ${ENERGY_EMOJI} +10`),
            description: t('Für Power-User: dauerhaft mehr Energie.'),
            price: SHOP_PRICES.energyCap.plus10,
            savingsPercent: Math.max(
              0,
              Math.round(
                (1 -
                  SHOP_PRICES.energyCap.plus10 /
                    (SHOP_PRICES.energyCap.plus5 * 2)) *
                  100
              )
            ),
            icon: 'battery-charging',
            accent: colors.accentGreen,
            kind: 'cap',
            amount: 10,
          },
        ],
      },
      {
        key: 'boosts',
        title: t('Items'),
        items: [
          {
            id: 'streak_shield',
            title: t('Streak-Schild'),
            description: t('Schützt deine Streak einmal.'),
            price: SHOP_PRICES.boosts.streakShield,
            icon: 'shield-checkmark',
            accent: colors.accentWarm,
            kind: 'boost',
            amount: 1,
          },
          {
            id: 'freeze_time',
            title: t('Zeit einfrieren'),
            description: t('Stoppt den Timer für 5 Sekunden.'),
            price: SHOP_PRICES.boosts.freezeTime,
            icon: 'time',
            accent: colors.accent,
            kind: 'boost',
            amount: 1,
          },
          {
            id: 'double_xp',
            title: t('Doppel-XP'),
            description: t('2x XP für 6 Stunden.'),
            price: SHOP_PRICES.boosts.doubleXp,
            icon: 'flash',
            accent: colors.accentGreen,
            kind: 'boost',
            amount: 1,
          },
          {
            id: 'joker_5050',
            title: t('Joker 50/50'),
            description: t('Entfernt 2 falsche Antworten.'),
            price: SHOP_PRICES.boosts.joker5050,
            icon: 'help-circle',
            accent: colors.highlight,
            kind: 'boost',
            amount: 1,
          },
        ],
      },
      {
        key: 'coins',
        title: t('Coins'),
        items: COIN_PACKS.map((pack) => ({
          id: pack.id,
          title: t(pack.title),
          priceLabel:
            iapPriceLabelsByProductId?.[pack.productId] ?? pack.priceLabel,
          savingsPercent: getSavingsPercent(pack),
          coinIconCount: getCoinIconCount(pack.amount),
          icon: 'cash',
          accent: colors.highlight,
          kind: 'iap',
          productId: pack.productId,
          amount: pack.amount,
        })),
      },
    ],
    [iapPriceLabelsByProductId, showDailySection, t]
  );
}
