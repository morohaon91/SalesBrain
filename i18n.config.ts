import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import all translation files
import commonEn from './locales/en/common.json';
import commonHe from './locales/he/common.json';
import authEn from './locales/en/auth.json';
import authHe from './locales/he/auth.json';
import dashboardEn from './locales/en/dashboard.json';
import dashboardHe from './locales/he/dashboard.json';
import conversationsEn from './locales/en/conversations.json';
import conversationsHe from './locales/he/conversations.json';
import leadsEn from './locales/en/leads.json';
import leadsHe from './locales/he/leads.json';
import simulationsEn from './locales/en/simulations.json';
import simulationsHe from './locales/he/simulations.json';
import analyticsEn from './locales/en/analytics.json';
import analyticsHe from './locales/he/analytics.json';
import profileEn from './locales/en/profile.json';
import profileHe from './locales/he/profile.json';
import settingsEn from './locales/en/settings.json';
import settingsHe from './locales/he/settings.json';
import errorsEn from './locales/en/errors.json';
import errorsHe from './locales/he/errors.json';
import validationEn from './locales/en/validation.json';
import validationHe from './locales/he/validation.json';

const resources = {
  en: {
    common: commonEn,
    auth: authEn,
    dashboard: dashboardEn,
    conversations: conversationsEn,
    leads: leadsEn,
    simulations: simulationsEn,
    analytics: analyticsEn,
    profile: profileEn,
    settings: settingsEn,
    errors: errorsEn,
    validation: validationEn,
  },
  he: {
    common: commonHe,
    auth: authHe,
    dashboard: dashboardHe,
    conversations: conversationsHe,
    leads: leadsHe,
    simulations: simulationsHe,
    analytics: analyticsHe,
    profile: profileHe,
    settings: settingsHe,
    errors: errorsHe,
    validation: validationHe,
  },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: [
      'common',
      'auth',
      'dashboard',
      'conversations',
      'leads',
      'simulations',
      'analytics',
      'profile',
      'settings',
      'errors',
      'validation',
    ],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

export default i18n;
