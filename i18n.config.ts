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
import onboardingEn from './locales/en/onboarding.json';
import onboardingHe from './locales/he/onboarding.json';
import widgetEn from './locales/en/widget.json';
import widgetHe from './locales/he/widget.json';
import adminEn from './locales/en/admin.json';
import adminHe from './locales/he/admin.json';

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
    onboarding: onboardingEn,
    widget: widgetEn,
    admin: adminEn,
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
    onboarding: onboardingHe,
    widget: widgetHe,
    admin: adminHe,
  },
};

if (!i18n.isInitialized) {
  // Always start with 'en' so SSR and the first client render match (avoids hydration errors).
  // I18nProvider applies localStorage language in useEffect after mount.
  i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
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
      'onboarding',
      'widget',
      'admin',
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
