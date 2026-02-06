import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import bg from './locales/bg';
import en from './locales/en';

const SETTINGS_STORAGE_KEY = 'bulgarian-calendar-app-settings';

// Get saved language from app settings
const getSavedLanguage = (): string => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      const settings = JSON.parse(stored);
      if (settings.language) {
        return settings.language;
      }
    }
  } catch (e) {
    console.error('Failed to load language setting:', e);
  }
  return 'bg'; // Default to Bulgarian
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      bg: { translation: bg },
      en: { translation: en },
    },
    lng: getSavedLanguage(),
    fallbackLng: 'bg',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      caches: [],
    },
  });

export default i18n;
