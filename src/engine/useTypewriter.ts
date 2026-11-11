import { useCallback, useEffect, useRef, useState } from 'react';
import { plainLength } from './markup';
import type { Markup } from './types';

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Reveals `text` one visible character at a time (markup brackets are not counted).
 * `shown` is the number of visible characters to display. Resets when `key` changes.
 * cps <= 0 or reduced motion shows everything immediately.
 */
export function useTypewriter(
  text: Markup,
  cps: number,
  key: string | number,
): { shown: number; done: boolean; finish: () => void } {
  const total = plainLength(text);
  const instant = cps <= 0 || prefersReducedMotion();
  const token = `${typeof key}:${String(key)}`;

  const [progress, setProgress] = useState<{ token: string; n: number }>({
    token,
    n: instant ? total : 0,
  });

  // Set by finish() so the running rAF loop stops instead of overwriting the full reveal.
  const finished = useRef(false);

  // Mismatched token means the key changed this render; show the fresh start value.
  const shown =
    progress.token === token ? Math.min(progress.n, total) : instant ? total : 0;

  useEffect(() => {
    finished.current = false;
    if (instant) {
      setProgress({ token, n: total });
      return;
    }
    setProgress({ token, n: 0 });
    let raf = 0;
    let last = -1;
    const start = performance.now();
    const tick = (now: number) => {
      if (finished.current) return;
      const n = Math.min(total, Math.floor(((now - start) / 1000) * cps));
      if (n !== last) {
        last = n;
        setProgress({ token, n });
      }
      if (n < total) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [token, text, total, cps, instant]);

  const finish = useCallback(() => {
    finished.current = true;
    setProgress({ token, n: total });
  }, [token, total]);

  return { shown, done: shown >= total, finish };
}
