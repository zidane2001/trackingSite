import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import en from './locales/en.json';

const savedLang = localStorage.getItem('youms_lang') || navigator.language.slice(0, 2) || 'fr';

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
});

// Persist language choice
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('youms_lang', lng);
});

export default i18n;
