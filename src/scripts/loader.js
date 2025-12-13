// src/scripts/loader.js
import { getMessages } from './i18nState.js';

export function initLoader() {
  const overlay = document.getElementById('loading-overlay');
  const barFill = document.getElementById('loading-bar-fill');
  const percent = document.getElementById('loading-percent');
  const text = document.getElementById('loading-text');

  if (!overlay || !barFill || !percent || !text) return;

  const T = getMessages();

  overlay.classList.remove('hidden');
  overlay.classList.remove('fade-out');
  text.textContent = T.loader.loading;

  let value = 0;

  const interval = setInterval(() => {
    value += Math.random() * 20;

    if (value >= 100) {
      value = 100;
      barFill.style.width = '100%';
      percent.textContent = '100%';
      text.textContent = T.loader.ready;

      clearInterval(interval);

      setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.classList.add('hidden'), 600);
      }, 300);
    } else {
      barFill.style.width = `${value}%`;
      percent.textContent = `${Math.round(value)}%`;
    }
  }, 200);
}
