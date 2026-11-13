import { useEffect, useRef, type RefObject } from 'react';

export interface SwipeHandlers {
  onLeft?: () => void;
  onRight?: () => void;
  onUp?: () => void;
  onDown?: () => void;
}

const MIN_DISTANCE = 48;
const MAX_DURATION = 800;
const AXIS_RATIO = 1.5;
const CLICK_SWALLOW_MS = 400;
/** Gestures that start on controls are left to the control (no swipe). */
const NO_SWIPE = 'button, a, input, select, textarea, [data-noswipe]';

/** Drops the click that a recognised swipe may leave behind, so it does not also act as a tap. */
export function swallowNextClick(): void {
  const stop = (e: Event) => {
    e.stopPropagation();
    e.preventDefault();
  };
  window.addEventListener('click', stop, { capture: true, once: true });
  window.setTimeout(() => window.removeEventListener('click', stop, true), CLICK_SWALLOW_MS);
}

/** Touch-only swipe detection on `ref`. Handlers may change every render without re-binding. */
export function useSwipe(ref: RefObject<HTMLElement | null>, handlers: SwipeHandlers): void {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let pointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let startT = 0;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' || !e.isPrimary) return;
      if ((e.target as Element | null)?.closest?.(NO_SWIPE)) return;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      startT = performance.now();
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      if (performance.now() - startT > MAX_DURATION) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      const h = handlersRef.current;
      let fire: (() => void) | undefined;

      if (ax >= MIN_DISTANCE && ax >= ay * AXIS_RATIO) fire = dx < 0 ? h.onLeft : h.onRight;
      else if (ay >= MIN_DISTANCE && ay >= ax * AXIS_RATIO) fire = dy < 0 ? h.onUp : h.onDown;
      else return;

      swallowNextClick();
      fire?.();
    };

    const onCancel = (e: PointerEvent) => {
      if (e.pointerId === pointerId) pointerId = null;
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onCancel);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onCancel);
    };
  }, [ref]);
}
