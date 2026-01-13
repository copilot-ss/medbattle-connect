import { memo, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/HomeScreen.styles';

const ENERGY_BADGE_COLOR = '#FACC15';
const ENERGY_BADGE_EMPTY_COLOR = '#FCA5A5';

function formatCountdown(target) {
  const diff = Math.max(0, target - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function EnergyBadge({
  energy,
  energyMax,
  nextEnergyAt,
  isPremium,
  isLocked,
  onRefreshEnergy,
}) {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (isPremium || !nextEnergyAt) {
      setCountdown('');
      return undefined;
    }

    let active = true;

    const tick = () => {
      const diff = nextEnergyAt - Date.now();
      if (diff <= 0) {
        if (typeof onRefreshEnergy === 'function') {
          onRefreshEnergy();
        }
        if (active) {
          setCountdown('');
        }
        return false;
      }
      if (active) {
        setCountdown(formatCountdown(nextEnergyAt));
      }
      return true;
    };

    tick();
    const timerId = setInterval(() => {
      if (!tick()) {
        clearInterval(timerId);
      }
    }, 1000);

    return () => {
      active = false;
      clearInterval(timerId);
    };
  }, [isPremium, nextEnergyAt, onRefreshEnergy]);

  const label = useMemo(() => {
    if (isPremium) {
      return `${energyMax}/${energyMax}`;
    }
    const suffix = countdown ? ` - ${countdown}` : '';
    return `${energy}/${energyMax}${suffix}`;
  }, [countdown, energy, energyMax, isPremium]);

  const energyBadgeStyle = isLocked ? styles.energyBadgeEmpty : null;
  const energyBadgeTextStyle = isLocked ? styles.energyBadgeTextEmpty : null;
  const energyBadgeIconColor = isLocked
    ? ENERGY_BADGE_EMPTY_COLOR
    : ENERGY_BADGE_COLOR;

  return (
    <View style={[styles.energyBadge, energyBadgeStyle]}>
      <Ionicons
        name="flash"
        size={12}
        color={energyBadgeIconColor}
        style={styles.energyBadgeIcon}
      />
      <Text
        style={[styles.energyBadgeText, energyBadgeTextStyle]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
      </Text>
    </View>
  );
}

export default memo(EnergyBadge);
