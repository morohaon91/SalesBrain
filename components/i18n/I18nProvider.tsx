'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n.config';
import { isHebrewLocale } from '@/lib/i18n/locale';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const language =
      typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en';

    const rtl = isHebrewLocale(language);

    // Set document direction before async i18n so RTL CSS (arrows, layout) applies immediately.
    const html = document.documentElement;
    html.lang = language;
    html.dir = rtl ? 'rtl' : 'ltr';
    html.setAttribute('data-theme', rtl ? 'rtl' : 'ltr');

    i18n.changeLanguage(language).then(() => {
      setIsInitialized(true);
    });
  }, []);

  if (!isInitialized) {
    return <>{children}</>;
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
