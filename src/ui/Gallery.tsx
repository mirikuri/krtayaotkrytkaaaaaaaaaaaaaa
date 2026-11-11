import { useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useGame } from '../engine/store';
import { gallery } from '../content/profile';
import Modal from './Modal';
import { fadeUp } from './fx';

export default function Gallery() {
  const reduce = !!useReducedMotion();
  const goMenu = useGame((s) => s.goMenu);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const current = openIdx === null ? null : gallery[openIdx];

  return (
    <div className="gallery">
      <div className="screen-bar">
        <button type="button" className="btn-pill" onClick={goMenu}>
          ← В меню
        </button>
        <h1 className="screen-title">Галерея</h1>
      </div>

      <ul className="gallery-grid">
        {gallery.map((g, i) => (
          <motion.li key={`${g.src}-${i}`} {...fadeUp(reduce, 0.05 * i)}>
            <button
              type="button"
              className="polaroid"
              style={{ '--tilt': `${i % 2 ? 1.5 : -1.5}deg` } as CSSProperties}
              onClick={() => setOpenIdx(i)}
            >
              <span className="polaroid-frame">
                <img
                  src={g.src}
                  alt={g.alt}
                  width={400}
                  height={500}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </span>
              <span className="polaroid-cap">{g.caption}</span>
            </button>
          </motion.li>
        ))}
      </ul>

      <AnimatePresence>
        {current && (
          <Modal key="lightbox" title={current.caption} className="modal--lightbox" onClose={() => setOpenIdx(null)}>
            <img
              className="lightbox-img"
              src={current.src}
              alt={current.alt}
              referrerPolicy="no-referrer"
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
