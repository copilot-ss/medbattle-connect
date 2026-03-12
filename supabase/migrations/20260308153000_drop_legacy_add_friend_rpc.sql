-- Remove deprecated RPC that still references the old friends schema.
-- The mobile app uses send_friend_request/respond_friend_request/remove_friend.

drop function if exists public.add_friend(text);
