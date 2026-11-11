import { useEffect, useRef } from 'react';
import { useGame } from '../engine/store';
import Modal from './Modal';
import RichText from './RichText';

export default function Backlog() {
  const backlog = useGame((s) => s.backlog);
  const setOverlay = useGame((s) => s.setOverlay);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Newest line sits at the bottom; keep it in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [backlog.length]);

  return (
    <Modal title="История" onClose={() => setOverlay(null)} className="modal--wide">
      <div className="backlog-scroll" ref={scrollRef}>
        {backlog.length === 0 ? (
          <p className="empty">Пока пусто — начни читать</p>
        ) : (
          <ol className="backlog-list">
            {backlog.map((entry, i) => (
              <li key={i} className="backlog-item">
                {entry.who && <span className="backlog-who">{entry.who}</span>}
                <p>
                  <RichText text={entry.text} />
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Modal>
  );
}
