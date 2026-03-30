import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { APP_DEFAULT_LOCALE, getLocale } from './index';

export function useTranslation() {
  const { t } = useI18nextTranslation(undefined, { useSuspense: false });
  const locale = getLocale() || APP_DEFAULT_LOCALE;

  return { t, locale };
}
