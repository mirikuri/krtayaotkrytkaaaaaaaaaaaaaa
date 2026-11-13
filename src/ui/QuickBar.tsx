import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useGame } from '../engine/store';
import { swallowNextClick } from '../engine/useSwipe';
import { EASE_OUT } from './fx';

const stop = (e: MouseEvent) => e.stopPropagation();

/**
 * Two variants, switched by CSS (no JS breakpoint, so no layout flash):
 * - desktop (>= 640px): the full quick bar, unchanged;
 * - phones (< 640px): «Назад», «Авто» and a «☰» popover with the rest.
 */
export default function QuickBar() {
  const auto = useGame((s) => s.auto);
  const skipping = useGame((s) => s.skipping);
  const back = useGame((s) => s.back);
  const toggleAuto = useGame((s) => s.toggleAuto);
  const toggleSkip = useGame((s) => s.toggleSkip);
  const setOverlay = useGame((s) => s.setOverlay);
  const openScreen = useGame((s) => s.openScreen);
  const goMenu = useGame((s) => s.goMenu);
  const reduce = !!useReducedMotion();

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const items: { label: string; onClick: () => void; pressed?: boolean }[] = [
    { label: 'Назад', onClick: back },
    { label: 'История', onClick: () => setOverlay('backlog') },
    { label: 'Авто', onClick: toggleAuto, pressed: auto },
    { label: 'Пропуск', onClick: toggleSkip, pressed: skipping },
    { label: 'Настройки', onClick: () => setOverlay('settings') },
    { label: 'Резюме', onClick: () => openScreen('cv') },
    { label: 'Меню', onClick: goMenu },
  ];

  // Phone popover: everything except «Назад» and «Авто», which stay on the row.
  const extra: { label: string; onClick: () => void; pressed?: boolean }[] = [
    { label: 'История', onClick: () => setOverlay('backlog') },
    { label: 'Пропуск', onClick: toggleSkip, pressed: skipping },
    { label: 'Настройки', onClick: () => setOverlay('settings') },
    { label: 'Резюме', onClick: () => openScreen('cv') },
    { label: 'В меню', onClick: goMenu },
  ];

  // Focus the first action when the popover opens.
  useEffect(() => {
    if (open) popRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
  }, [open]);

  // Escape closes the popover and stays inside it (does not reach the scene's Escape-to-menu).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      menuBtnRef.current?.focus();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open]);

  // Tap outside closes the popover; that tap does not also advance the text.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return;
      swallowNextClick();
      setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  return (
    <>
      {/* Clicks on the bar must not reach the scene (which advances the text). */}
      <nav className="quickbar quickbar--full" aria-label="Быстрые действия" onClick={stop}>
        {items.map((it) => (
          <button
            key={it.label}
            type="button"
            className="qb"
            onClick={it.onClick}
            aria-pressed={it.pressed}
          >
            {it.label}
          </button>
        ))}
      </nav>

      <div className="qb-mini" ref={wrapRef} data-noswipe="" onClick={stop}>
        <AnimatePresence>
          {open && (
            <motion.div
              key="pop"
              id="qb-pop"
              ref={popRef}
              className="qb-pop"
              role="group"
              aria-label="Остальные действия"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: EASE_OUT } }}
              exit={
                reduce
                  ? { opacity: 0, transition: { duration: 0.12, ease: EASE_OUT } }
                  : { opacity: 0, y: 8, scale: 0.97, transition: { duration: 0.12, ease: EASE_OUT } }
              }
            >
              {extra.map((it) => (
                <button
                  key={it.label}
                  type="button"
                  className="qb-pop-item"
                  aria-pressed={it.pressed}
                  onClick={() => {
                    setOpen(false);
                    menuBtnRef.current?.focus();
                    it.onClick();
                  }}
                >
                  {it.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="quickbar quickbar--mini" aria-label="Быстрые действия">
          <button type="button" className="qb" onClick={back}>
            Назад
          </button>
          <button type="button" className="qb" onClick={toggleAuto} aria-pressed={auto}>
            Авто
          </button>
          <button
            ref={menuBtnRef}
            type="button"
            className="qb qb-menu"
            aria-label="Меню действий"
            aria-expanded={open}
            aria-controls={open ? 'qb-pop' : undefined}
            onClick={() => setOpen((o) => !o)}
          >
            ☰
          </button>
        </nav>
      </div>
    </>
  );
}
