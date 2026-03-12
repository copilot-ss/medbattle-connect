/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_PRIVACY_URL?: string;
  readonly VITE_TERMS_URL?: string;
  readonly VITE_SUPPORT_URL?: string;
  readonly VITE_DELETE_ACCOUNT_URL?: string;
  readonly EXPO_PUBLIC_SUPABASE_URL?: string;
  readonly EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly EXPO_PUBLIC_PRIVACY_URL?: string;
  readonly EXPO_PUBLIC_TERMS_URL?: string;
  readonly EXPO_PUBLIC_SUPPORT_URL?: string;
  readonly EXPO_PUBLIC_DELETE_ACCOUNT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
