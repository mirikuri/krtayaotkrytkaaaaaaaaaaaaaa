/**
 * Short vibration feedback for phones. Silently does nothing when the Vibration API is
 * missing, when the user prefers reduced motion, or when the browser refuses the call.
 */
export function buzz(pattern: number | number[] = 10): void {
  try {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}
