import { useTranslation } from 'react-i18next';

export function useI18n(namespace?: string | string[]) {
  const { t, i18n } = useTranslation(namespace);

  const language = i18n.language || 'en';
  const dir = language === 'he' ? 'rtl' : 'ltr';

  return {
    t,
    i18n,
    language,
    dir,
    isHebrew: language === 'he',
    isEnglish: language === 'en',
  };
}
