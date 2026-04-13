/** @type {import('next-i18next').Config} */
const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'he'],
  },
  localePath: path.resolve('./locales'),
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
  defaultNS: 'common',
  returnObjects: true,
};
