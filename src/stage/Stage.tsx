import 'pixi.js/unsafe-eval';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { BgId, Mood } from '../engine/types';
import FallbackStage from './FallbackStage';
import { StageScene } from './scene';

export interface StageProps {
  bg: BgId;
  mood: Mood;
  effects: boolean;
  celebrate: boolean;
}

const STAGE_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
};

export default function Stage({ bg, mood, effects, celebrate }: StageProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<StageScene | null>(null);
  const latest = useRef({ bg, mood, effects, celebrate });
  const [fallback, setFallback] = useState(false);

  // Declared first so later effects in this render see up-to-date props.
  useEffect(() => {
    latest.current = { bg, mood, effects, celebrate };
  });

  // Create / destroy the Pixi scene. StrictMode mounts twice: the first init
  // may resolve after cleanup, in which case it is destroyed as soon as it lands.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;

    StageScene.create(host).then(
      (scene) => {
        if (cancelled) {
          scene.destroy();
          return;
        }
        sceneRef.current = scene;
        const p = latest.current;
        scene.setBackground(p.bg);
        scene.setMood(p.mood);
        scene.setEffects(p.effects);
        scene.setCelebrate(p.celebrate);
      },
      (err: unknown) => {
        if (cancelled) return;
        console.warn('[stage] Pixi unavailable, using image fallback', err);
        setFallback(true);
      },
    );

    return () => {
      cancelled = true;
      const scene = sceneRef.current;
      sceneRef.current = null;
      scene?.destroy();
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.setBackground(bg);
  }, [bg]);

  useEffect(() => {
    sceneRef.current?.setMood(mood);
  }, [mood]);

  useEffect(() => {
    sceneRef.current?.setEffects(effects);
  }, [effects]);

  useEffect(() => {
    sceneRef.current?.setCelebrate(celebrate);
  }, [celebrate]);

  if (fallback) return <FallbackStage bg={bg} />;

  return <div ref={hostRef} className="stage" aria-hidden="true" style={STAGE_STYLE} />;
}
