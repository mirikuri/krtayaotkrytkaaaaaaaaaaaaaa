import { useEffect, useRef } from 'react';

const SEQUENCE = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];

/** Calls `cb` when ↑↑↓↓←→←→ B A is typed on the keyboard (case-insensitive). */
export function useKonami(cb: () => void): void {
  const cbRef = useRef(cb);

  useEffect(() => {
    cbRef.current = cb;
  });

  useEffect(() => {
    let i = 0;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === SEQUENCE[i]) {
        i++;
        if (i === SEQUENCE.length) {
          i = 0;
          cbRef.current();
        }
      } else {
        i = 0;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
