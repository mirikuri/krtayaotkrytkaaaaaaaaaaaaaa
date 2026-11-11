import { motion, useReducedMotion } from 'motion/react';
import { stripMarkup } from '../engine/markup';
import RichText from './RichText';
import { EASE_OUT } from './fx';

interface Props {
  who?: string;
  text: string;
  shown: number;
  done: boolean;
}

const AVATAR = '/img/avatar.webp';

/** Parent keys this component by scene id, so the slide-in plays only on scene start. */
export default function TextBox({ who, text, shown, done }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="tb"
      initial={{ opacity: 0, y: reduce ? 0 : 12 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.24, ease: EASE_OUT } }}
    >
      {who && (
        <div className="portrait" aria-hidden="true">
          <img src={AVATAR} alt="" width={640} height={640} />
        </div>
      )}
      <div className="tb-panel">
        {who && (
          <div className="plate" aria-hidden="true">
            <img className="plate-avatar" src={AVATAR} alt="" width={28} height={28} />
            <span>{who}</span>
          </div>
        )}
        <p className="tb-text" aria-hidden="true">
          <RichText text={text} shown={shown} />
        </p>
        <span className={`tb-next${done ? ' is-on' : ''}`} aria-hidden="true">
          ▼
        </span>
      </div>
      <div className="sr-only" aria-live="polite">
        {done ? (who ? `${who}: ` : '') + stripMarkup(text) : ''}
      </div>
    </motion.div>
  );
}
