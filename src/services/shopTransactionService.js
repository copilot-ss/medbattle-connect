import { supabase } from '../lib/supabaseClient';
import { runSupabaseRequest } from './supabaseRequest';

function sanitizeCoins(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
}

export function createShopOperationKey(itemId) {
  const safeItemId = typeof itemId === 'string' ? itemId : 'item';
  return `shop:${safeItemId}:${Date.now()}:${Math.random().toString(36).slice(2, 12)}`;
}

export async function spendShopCoins(itemId, operationKey) {
  try {
    const { data, error } = await runSupabaseRequest(
      () =>
        supabase.rpc('spend_shop_coins', {
          p_item_id: itemId,
          p_operation_key: operationKey,
        }),
      { label: 'shopTransactionService.spendShopCoins' }
    );
    if (error) {
      throw error;
    }
    const row = Array.isArray(data) ? data[0] : data;
    return {
      ok: true,
      alreadyProcessed: row?.already_processed === true,
      coins: sanitizeCoins(row?.coins),
    };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function claimServerDailyCoins() {
  try {
    const { data, error } = await runSupabaseRequest(
      () => supabase.rpc('claim_daily_coins'),
      { label: 'shopTransactionService.claimDailyCoins' }
    );
    if (error) {
      throw error;
    }
    const row = Array.isArray(data) ? data[0] : data;
    return {
      ok: true,
      claimedAt: row?.claimed_at ?? null,
      coins: sanitizeCoins(row?.coins),
    };
  } catch (error) {
    return { ok: false, error };
  }
}
