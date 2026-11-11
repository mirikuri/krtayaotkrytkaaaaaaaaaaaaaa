import { motion, useReducedMotion } from 'motion/react';
import { useGame } from '../engine/store';
import { sectionOrder, scenes } from '../script/scenes';
import { fadeUp } from './fx';

export default function Hub() {
  const reduce = !!useReducedMotion();
  const visited = useGame((s) => s.visited);
  const playScene = useGame((s) => s.playScene);
  const openScreen = useGame((s) => s.openScreen);
  const goMenu = useGame((s) => s.goMenu);

  const allVisited = sectionOrder.every((id) => visited.includes(id));

  return (
    <div className="hub">
      <motion.h1 className="hub-title" {...fadeUp(reduce, 0, 12)}>
        О чём рассказать?
      </motion.h1>

      <ul className="hub-list">
        {sectionOrder.map((id, i) => {
          const isVisited = visited.includes(id);
          return (
            <motion.li key={id} {...fadeUp(reduce, 0.05 * (i + 1))}>
              <button
                type="button"
                className={`choice${isVisited ? ' is-visited' : ''}`}
                onClick={() => playScene(id)}
              >
                <span>{scenes[id].title}</span>
                {isVisited && <span className="choice-check" aria-label="прочитано">✓</span>}
              </button>
            </motion.li>
          );
        })}
        {allVisited && (
          <motion.li {...fadeUp(reduce, 0.05 * (sectionOrder.length + 1))}>
            <button type="button" className="choice is-final" onClick={() => playScene('ending')}>
              <span>Финал</span>
            </button>
          </motion.li>
        )}
      </ul>

      <div className="hub-links">
        <button type="button" className="link-btn" onClick={() => openScreen('cv')}>
          Резюме целиком
        </button>
        <button type="button" className="link-btn" onClick={goMenu}>
          В меню
        </button>
      </div>
    </div>
  );
}
