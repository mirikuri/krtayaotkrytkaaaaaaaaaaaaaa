import { useGame } from '../engine/store';
import { credits, creditsUrl } from '../content/profile';
import Modal from './Modal';

export default function Credits() {
  const setOverlay = useGame((s) => s.setOverlay);
  return (
    <Modal title="Титры" onClose={() => setOverlay(null)}>
      <div className="credits">
        <p>
          <a href={creditsUrl} target="_blank" rel="noopener noreferrer">
            {credits}
          </a>
        </p>
        <p>сделано с NixOS, btw</p>
        <p className="credits-copy">© 2026 metaxxd</p>
      </div>
    </Modal>
  );
}
