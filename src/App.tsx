import { useEffect, useRef, type ReactElement } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useShallow } from 'zustand/react/shallow';
import { useGame } from './engine/store';
import { useKonami } from './engine/useKonami';
import Stage from './stage/Stage';
import MainMenu from './ui/MainMenu';
import Play from './ui/Play';
import Hub from './ui/Hub';
import Resume from './ui/Resume';
import Gallery from './ui/Gallery';
import Backlog from './ui/Backlog';
import SettingsPanel from './ui/SettingsPanel';
import Credits from './ui/Credits';
import { EASE_OUT } from './ui/fx';

export default function App() {
  const screen = useGame((s) => s.screen);
  const overlay = useGame((s) => s.overlay);
  const effects = useGame((s) => s.settings.effects);
  const celebrate = useGame((s) => s.hackMode);
  const { bg, mood } = useGame(useShallow((s) => s.stageView()));
  const openScreen = useGame((s) => s.openScreen);
  const triggerSecret = useGame((s) => s.triggerSecret);
  const reduce = !!useReducedMotion();
  const booted = useRef(false);

  useKonami(triggerSecret);

  // Deep link: #cv opens the résumé on load.
  useEffect(() => {
    if (location.hash === '#cv') openScreen('cv');
  }, [openScreen]);

  // Keep the hash in sync with the résumé screen (skip the first run so the
  // deep link above is not wiped before the store update lands).
  useEffect(() => {
    if (!booted.current) {
      booted.current = true;
      return;
    }
    if (screen === 'cv') {
      if (location.hash !== '#cv') history.replaceState(null, '', '#cv');
    } else if (location.hash === '#cv') {
      history.replaceState(null, '', location.pathname + location.search);
    }
  }, [screen]);

  let content: ReactElement;
  switch (screen) {
    case 'play':
      content = <Play />;
      break;
    case 'hub':
      content = <Hub />;
      break;
    case 'cv':
      content = <Resume />;
      break;
    case 'gallery':
      content = <Gallery />;
      break;
    default:
      content = <MainMenu />;
  }

  return (
    <main className="vn">
      <div className="vn-stage">
        <Stage bg={bg} mood={mood} effects={effects} celebrate={celebrate} />
      </div>

      <div className="vn-ui">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            className={`vn-screen vn-screen--${screen}`}
            initial={{ opacity: 0, y: reduce ? 0 : 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE_OUT } }}
            exit={{ opacity: 0, transition: { duration: 0.14, ease: EASE_OUT } }}
          >
            {content}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {overlay === 'backlog' && <Backlog key="backlog" />}
        {overlay === 'settings' && <SettingsPanel key="settings" />}
        {overlay === 'credits' && <Credits key="credits" />}
      </AnimatePresence>
    </main>
  );
}
