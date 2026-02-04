import { ENERGY_RECHARGE_MS, MAX_ENERGY } from './constants';
import { sanitizeStatNumber } from './sanitize';

export function recalcEnergy(currentEnergy, lastTimestamp, maxEnergy = MAX_ENERGY) {
  const safeEnergy = sanitizeStatNumber(currentEnergy);
  const safeTs = Number.isFinite(lastTimestamp) ? lastTimestamp : Date.now();
  const safeMax = Number.isFinite(maxEnergy) && maxEnergy > 0 ? maxEnergy : MAX_ENERGY;

  if (safeEnergy >= safeMax) {
    return { energy: safeMax, ts: safeTs, nextAt: null };
  }

  const now = Date.now();
  const elapsed = Math.max(0, now - safeTs);
  const gained = Math.floor(elapsed / ENERGY_RECHARGE_MS);
  const nextEnergy = Math.min(safeMax, safeEnergy + gained);

  if (nextEnergy >= safeMax) {
    return { energy: safeMax, ts: now, nextAt: null };
  }

  const nextAt = safeTs + (gained + 1) * ENERGY_RECHARGE_MS;

  return { energy: nextEnergy, ts: safeTs, nextAt };
}
