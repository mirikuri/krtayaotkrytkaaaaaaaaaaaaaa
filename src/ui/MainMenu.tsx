import { useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useGame } from '../engine/store';
import { buzz } from '../engine/haptics';
import { requestTilt } from '../stage/tilt';
import { contacts } from '../content/profile';
import { fadeUp } from './fx';

/** Taps on the title that unlock the secret scene: 7 within 3 seconds. */
const SECRET_TAPS = 7;
const SECRET_WINDOW_MS = 3000;

export default function MainMenu() {
  const reduce = !!useReducedMotion();
  const startGame = useGame((s) => s.startGame);
  const openScreen = useGame((s) => s.openScreen);
  const setOverlay = useGame((s) => s.setOverlay);
  const tapTimes = useRef<number[]>([]);

  const onTitlePress = () => {
    const now = performance.now();
    tapTimes.current = tapTimes.current.filter((t) => now - t < SECRET_WINDOW_MS);
    tapTimes.current.push(now);
    const n = tapTimes.current.length;
    if (n === 5) buzz(6); // subtle "getting warmer"
    if (n >= SECRET_TAPS) {
      tapTimes.current = [];
      buzz([30, 40, 30, 40, 80]);
      useGame.getState().triggerSecret();
    }
  };

  const items: { label: string; hint?: string; quick?: boolean; onClick: () => void }[] = [
    {
      label: 'Начать',
      onClick: () => {
        requestTilt();
        startGame();
      },
    },
    {
      label: 'Резюме',
      hint: 'всё на одной странице',
      quick: true,
      onClick: () => openScreen('cv'),
    },
    { label: 'Галерея', onClick: () => openScreen('gallery') },
    { label: 'Настройки', onClick: () => setOverlay('settings') },
    { label: 'Титры', onClick: () => setOverlay('credits') },
  ];

  return (
    <div className="menu">
      <div className="menu-shade" aria-hidden="true" />
      <motion.img
        className="menu-sprite"
        src="/img/lena.webp"
        alt=""
        aria-hidden="true"
        width={317}
        height={1500}
        draggable={false}
        {...fadeUp(reduce, 0.12, 10)}
      />
      <motion.header className="menu-title" {...fadeUp(reduce, 0, 14)}>
        <h1 className="title" onPointerDown={onTitlePress}>
          Добро пожаловать
        </h1>
        <p className="subtitle">на мою страничку ♡</p>
      </motion.header>

      <nav className="menu-nav" aria-label="Главное меню">
        <ul>
          {items.map((it, i) => (
            <motion.li key={it.label} {...fadeUp(reduce, 0.05 * (i + 1))}>
              <button
                type="button"
                className={`menu-btn${it.quick ? ' is-quick' : ''}`}
                onClick={() => {
                  buzz(8);
                  it.onClick();
                }}
              >
                <span className="menu-btn-label">{it.label}</span>
                {it.hint && <small>{it.hint}</small>}
              </button>
            </motion.li>
          ))}
        </ul>
      </nav>

      <motion.footer className="menu-contacts" {...fadeUp(reduce, 0.35)}>
        {contacts.map((c) => (
          <a
            key={c.label}
            href={c.href}
            {...(/^https?:/.test(c.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {c.label}
          </a>
        ))}
      </motion.footer>
    </div>
  );
}
