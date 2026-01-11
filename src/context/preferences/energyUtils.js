import { ENERGY_RECHARGE_MS, MAX_ENERGY } from './constants';
import { sanitizeStatNumber } from './sanitize';

export function recalcEnergy(currentEnergy, lastTimestamp) {
  const safeEnergy = sanitizeStatNumber(currentEnergy);
  const safeTs = Number.isFinite(lastTimestamp) ? lastTimestamp : Date.now();

  if (safeEnergy >= MAX_ENERGY) {
    return { energy: MAX_ENERGY, ts: safeTs, nextAt: null };
  }

  const now = Date.now();
  const elapsed = Math.max(0, now - safeTs);
  const gained = Math.floor(elapsed / ENERGY_RECHARGE_MS);
  const nextEnergy = Math.min(MAX_ENERGY, safeEnergy + gained);

  if (nextEnergy >= MAX_ENERGY) {
    return { energy: MAX_ENERGY, ts: now, nextAt: null };
  }

  const nextAt = safeTs + (gained + 1) * ENERGY_RECHARGE_MS;

  return { energy: nextEnergy, ts: safeTs, nextAt };
}
