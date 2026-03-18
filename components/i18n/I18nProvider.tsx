'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n.config';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const language = typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en';

    i18n.changeLanguage(language).then(() => {
      // Update HTML attributes for RTL
      const html = document.documentElement;
      html.lang = language;
      html.dir = language === 'he' ? 'rtl' : 'ltr';
      html.setAttribute('data-theme', language === 'he' ? 'rtl' : 'ltr');

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
