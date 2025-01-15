// src/lib/logger.ts
type LogData = unknown;

const LOG_PREFIX = '🔐 [Auth]';

export const authLogger = {
  info: (component: string, message: string, data?: LogData) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${LOG_PREFIX} [${component}] ${message}`, data ? data : '');
    }
  },
  
  error: (component: string, message: string, error?: Error | unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`${LOG_PREFIX} [${component}] ❌ ${message}`, error ? error : '');
    }
  },

  warn: (component: string, message: string, data?: LogData) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`${LOG_PREFIX} [${component}] ⚠️ ${message}`, data ? data : '');
    }
  }
};