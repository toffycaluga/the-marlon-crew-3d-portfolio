// src/three/utils/logger.js

const LEVELS = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

// DEV: debug | PROD: warn
const CURRENT_LEVEL = import.meta.env.DEV ? LEVELS.debug : LEVELS.warn;

function emit(level, emoji, ...args) {
  if (level <= CURRENT_LEVEL) console.log(emoji, ...args);
}

export const logger = {
  error: (...args) => emit(LEVELS.error, "❌", ...args),
  warn: (...args) => emit(LEVELS.warn, "⚠️", ...args),
  info: (...args) => emit(LEVELS.info, "ℹ️", ...args),
  debug: (...args) => emit(LEVELS.debug, "🛠️", ...args),
};
