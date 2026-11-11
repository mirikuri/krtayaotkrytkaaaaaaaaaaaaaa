export const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export const ENTER = { duration: 0.22, ease: EASE_OUT };
export const EXIT = { duration: 0.14, ease: EASE_OUT };

/** Fade + small upward slide; with reduced motion only the fade remains. */
export function fadeUp(reduce: boolean, delay = 0, dist = 8) {
  return {
    initial: { opacity: 0, y: reduce ? 0 : dist },
    animate: { opacity: 1, y: 0, transition: { ...ENTER, delay } },
    exit: { opacity: 0, transition: EXIT },
  };
}
