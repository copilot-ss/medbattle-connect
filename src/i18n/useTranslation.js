import { useEffect, useMemo } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { DEFAULT_LOCALE, setLocale, t as translate } from './index';

export function useTranslation() {
  const { language } = usePreferences();
  const locale = (language || DEFAULT_LOCALE).toLowerCase();

  useEffect(() => {
    setLocale(locale);
  }, [locale]);

  const t = useMemo(() => {
    return (key, params) => translate(key, params, locale);
  }, [locale]);

  return { t, locale };
}
