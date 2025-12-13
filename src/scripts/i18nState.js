// src/scripts/i18nState.js
import es from '../i18n/es.json';
import en from '../i18n/en.json';

const messagesByLang = { es, en };

let currentLang = 'es';
let currentView = 'center';

export function initI18nState() {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('fc_lang');
    if (stored && messagesByLang[stored]) {
      currentLang = stored;
    }
  }
}

export function getMessages() {
  return messagesByLang[currentLang];
}

export function getCurrentLang() {
  return currentLang;
}

export function getCurrentView() {
  return currentView;
}

export function setLang(lang) {
  if (!messagesByLang[lang]) return;
  currentLang = lang;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('fc_lang', lang);
  }
}

export function setView(view) {
  currentView = view;
}
