/**
 * Thin logger. In production (`__DEV__ === false`) warnings are suppressed so
 * non-fatal storage/AI errors don't spam the device console.
 */
declare const __DEV__: boolean | undefined;

function devMode(): boolean {
  try {
    if (typeof __DEV__ !== 'undefined') return Boolean(__DEV__);
  } catch {
    /* ignore */
  }
  return process.env.NODE_ENV !== 'production';
}

export const log = {
  warn: (...args: unknown[]): void => {
    if (devMode()) {
      // eslint-disable-next-line no-console
      console.warn('[lattttice]', ...args);
    }
  },
  error: (...args: unknown[]): void => {
    // eslint-disable-next-line no-console
    console.error('[lattttice]', ...args);
  },
};
