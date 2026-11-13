import { useEffect, useRef } from 'react';
import { useGame } from '../engine/store';
import { useTypewriter } from '../engine/useTypewriter';
import { plainLength } from '../engine/markup';
import { useSwipe } from '../engine/useSwipe';
import TextBox from './TextBox';
import QuickBar from './QuickBar';

export default function Play() {
  const line = useGame((s) => s.currentLine());
  const sceneId = useGame((s) => s.sceneId);
  const lineIndex = useGame((s) => s.lineIndex);
  const textSpeed = useGame((s) => s.settings.textSpeed);
  const auto = useGame((s) => s.auto);
  const skipping = useGame((s) => s.skipping);
  const overlay = useGame((s) => s.overlay);
  const next = useGame((s) => s.next);
  const back = useGame((s) => s.back);
  const goMenu = useGame((s) => s.goMenu);
  const setOverlay = useGame((s) => s.setOverlay);
  const sceneRef = useRef<HTMLDivElement>(null);

  const total = plainLength(line.text);
  const instant = skipping || textSpeed === 0;
  const tw = useTypewriter(line.text, instant ? 0 : textSpeed, `${sceneId}:${lineIndex}`);
  const done = instant || tw.done;
  const shown = instant ? total : tw.shown;
  const { finish } = tw;

  // Keyboard: Space/Enter/ArrowRight advance, ArrowLeft/Backspace go back, Escape to menu.
  useEffect(() => {
    if (overlay) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        goMenu();
        return;
      }
      const target = e.target as Element | null;
      const onControl = !!target?.closest?.('button, a, input, select, textarea, [role="switch"]');
      const advanceKey = e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight';
      if (advanceKey) {
        if ((e.key !== 'ArrowRight' && onControl) || e.repeat) return;
        e.preventDefault();
        if (done) next();
        else finish();
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [overlay, done, finish, next, back, goMenu]);

  // Touch: swipe right = previous line, left = advance, up = backlog.
  useSwipe(sceneRef, {
    onRight: back,
    onLeft: () => {
      if (done) next();
      else finish();
    },
    onUp: () => setOverlay('backlog'),
  });

  // Auto mode: wait for the line to be read, then advance.
  useEffect(() => {
    if (!auto || !done) return;
    const id = window.setTimeout(() => next(), 1400 + 30 * total);
    return () => window.clearTimeout(id);
  }, [auto, done, total, sceneId, lineIndex, next]);

  // Skip mode: advance quickly with instant text.
  useEffect(() => {
    if (!skipping) return;
    const id = window.setInterval(() => next(), 90);
    return () => window.clearInterval(id);
  }, [skipping, next]);

  return (
    <div
      ref={sceneRef}
      className="play"
      onClick={() => {
        if (done) next();
        else finish();
      }}
    >
      <div className="play-shade" aria-hidden="true" />
      <div className="play-ui">
        <QuickBar />
        <TextBox
          key={sceneId}
          who={line.who}
          text={line.text}
          shown={shown}
          done={done}
        />
      </div>
    </div>
  );
}
