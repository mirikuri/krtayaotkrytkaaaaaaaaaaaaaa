import { useEffect, useState, type CSSProperties } from 'react';
import type { BgId } from '../engine/types';
import { bgUrl, SMALL_BG_MAX_WIDTH } from './bgUrl';

interface FallbackStageProps {
  bg: BgId;
}

const ROOT_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
};

const IMG_BASE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'opacity 900ms ease-in-out',
};

function isSmallViewport(): boolean {
  return typeof window !== 'undefined' && window.innerWidth <= SMALL_BG_MAX_WIDTH;
}

/**
 * No-WebGL fallback: two stacked images that cross-fade via CSS opacity.
 * The incoming image is decoded before it becomes visible.
 */
export default function FallbackStage({ bg }: FallbackStageProps) {
  const [state, setState] = useState<{ slots: [BgId, BgId]; top: 0 | 1 }>(() => ({
    slots: [bg, bg],
    top: 0,
  }));

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.src = bgUrl(bg, isSmallViewport());

    const show = () => {
      if (cancelled) return;
      setState((s) => {
        if (s.slots[s.top] === bg) return s;
        const top: 0 | 1 = s.top === 0 ? 1 : 0;
        const slots: [BgId, BgId] = top === 1 ? [s.slots[0], bg] : [bg, s.slots[1]];
        return { slots, top };
      });
    };
    img.decode().then(show, show);

    return () => {
      cancelled = true;
    };
  }, [bg]);

  const small = isSmallViewport();

  return (
    <div className="stage" aria-hidden="true" style={ROOT_STYLE}>
      {([0, 1] as const).map((i) => (
        <img
          key={i}
          src={bgUrl(state.slots[i], small)}
          alt=""
          draggable={false}
          style={{ ...IMG_BASE, opacity: state.top === i ? 1 : 0 }}
        />
      ))}
    </div>
  );
}
