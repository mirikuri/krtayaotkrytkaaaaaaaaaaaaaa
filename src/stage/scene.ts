import 'pixi.js/unsafe-eval';
import { Application, Assets, Container, Graphics, Sprite, Texture, type Ticker } from 'pixi.js';
import type { BgId, Mood } from '../engine/types';
import { bgUrl, SMALL_BG_MAX_WIDTH } from './bgUrl';
import { AmbientParticles, Fireworks } from './particles';
import { tilt } from './tilt';

const TAU = Math.PI * 2;
const OVERSCAN = 1.04;
const BG_FIRST_MS = 600;
const BG_CROSS_MS = 900;
const BG_REDUCED_MS = 200;
const DRIFT_AMOUNT = 0.006;
const DRIFT_PERIOD_S = 24;
const PARALLAX_BG_PX = 12;
const PARALLAX_PARTICLE_PX = 24;
const PARALLAX_LERP = 0.06;
const MOOD_MS = 900;

/** [tint colour, overlay alpha] per mood. */
const MOOD_STYLE: Record<Mood, { color: number; alpha: number }> = {
  day: { color: 0xfff2cc, alpha: 0.05 },
  sunset: { color: 0xff8a3d, alpha: 0.1 },
  night: { color: 0x0b1b4d, alpha: 0.16 },
  dawn: { color: 0xffb3c7, alpha: 0.08 },
};

const noDestroyTexture = { children: false, texture: false, textureSource: false } as const;

interface Transition {
  sprite: Sprite;
  old: Sprite | null;
  elapsed: number;
  duration: number;
  zoom: boolean;
}

/**
 * PixiJS scene behind the VN UI. Create with `StageScene.create(host)`;
 * the instance is only usable after the promise resolves.
 */
export class StageScene {
  private readonly bgLayer = new Container();
  private readonly particleLayer = new Container();
  private readonly moodRect = new Graphics().rect(0, 0, 1, 1).fill(0xffffff);
  private readonly fxLayer = new Container();
  private readonly particles: AmbientParticles;
  private readonly fireworks: Fireworks;
  private readonly reducedMql: MediaQueryList;
  private readonly coarse: boolean;

  private current: Sprite | null = null;
  private transition: Transition | null = null;
  private bgId: BgId | null = null;
  private bgToken = 0;
  private smallVariant: boolean;

  private effects = true;
  private celebrate = false;
  private reduced: boolean;
  private mood: Mood = 'day';

  // Mood tween (colour + alpha of the overlay rect).
  private mR = 0;
  private mG = 0;
  private mB = 0;
  private mA = 0;
  private fR = 0;
  private fG = 0;
  private fB = 0;
  private fA = 0;
  private tR = 0;
  private tG = 0;
  private tB = 0;
  private tA = 0;
  private moodElapsed = MOOD_MS;

  // Parallax.
  private pointerX = 0;
  private pointerY = 0;
  private parX = 0;
  private parY = 0;

  private time = 0;
  private destroyed = false;

  private constructor(private readonly app: Application) {
    this.smallVariant = Math.max(app.renderer.width, (app.renderer.height * 16) / 9) <= SMALL_BG_MAX_WIDTH;
    this.reducedMql = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reduced = this.reducedMql.matches;
    this.coarse = window.matchMedia('(pointer: coarse)').matches;

    const day = MOOD_STYLE.day;
    this.setRgbFromColor(day.color, day.alpha);
    this.fR = this.tR = this.mR;
    this.fG = this.tG = this.mG;
    this.fB = this.tB = this.mB;
    this.fA = this.tA = this.mA;
    this.moodRect.tint = day.color;
    this.moodRect.alpha = day.alpha;

    this.particles = new AmbientParticles(this.particleLayer);
    this.fireworks = new Fireworks(this.fxLayer);

    app.stage.addChild(this.bgLayer, this.moodRect, this.particleLayer, this.fxLayer);
    this.onResize();

    app.ticker.add(this.tick);
    app.renderer.on('resize', this.onResize);
    document.addEventListener('visibilitychange', this.onVisibility);
    if (document.hidden) app.ticker.stop();
    if (!this.coarse) window.addEventListener('pointermove', this.onPointer, { passive: true });
    this.reducedMql.addEventListener('change', this.onReducedChange);
  }

  /** Creates the Pixi app inside `host`. Rejects if WebGL/Pixi init fails. */
  static async create(host: HTMLElement): Promise<StageScene> {
    Assets.setPreferences({ preferWorkers: false });
    const app = new Application();
    try {
      await app.init({
        resizeTo: host,
        preference: 'webgl',
        antialias: false,
        backgroundAlpha: 0,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      });
      app.canvas.style.display = 'block';
      host.appendChild(app.canvas);
      return new StageScene(app);
    } catch (err) {
      try {
        app.destroy(true, { children: true });
      } catch {
        /* ignore: app may not have finished init */
      }
      throw err;
    }
  }

  setBackground(id: BgId): void {
    if (this.destroyed || id === this.bgId) return;
    this.bgId = id;
    const token = ++this.bgToken;
    const small = Math.max(this.app.renderer.width, (this.app.renderer.height * 16) / 9) <= SMALL_BG_MAX_WIDTH;
    this.smallVariant = small;
    Assets.load<Texture>(bgUrl(id, small))
      .then((tex) => {
        if (this.destroyed || token !== this.bgToken) return;
        this.startTransition(tex);
      })
      .catch((err) => console.warn('[stage] background failed to load', id, err));
  }

  setMood(mood: Mood): void {
    if (this.destroyed) return;
    if (mood !== this.mood) {
      this.mood = mood;
      const style = MOOD_STYLE[mood];
      this.fR = this.mR;
      this.fG = this.mG;
      this.fB = this.mB;
      this.fA = this.mA;
      this.setTargetFromColor(style.color, style.alpha);
      this.moodElapsed = 0;
    }
    // Particles dedupe internally, so this also builds them on the first sync.
    this.particles.setMood(mood, this.motion, this.app.screen.width, this.app.screen.height);
  }

  setEffects(on: boolean): void {
    if (this.destroyed) return;
    this.effects = on;
    this.applyMotion();
  }

  setCelebrate(on: boolean): void {
    if (this.destroyed) return;
    this.celebrate = on;
  }

  resize(): void {
    this.onResize();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.app.ticker.remove(this.tick);
    this.app.renderer.off('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibility);
    window.removeEventListener('pointermove', this.onPointer);
    this.reducedMql.removeEventListener('change', this.onReducedChange);
    this.particles.destroy();
    this.fireworks.destroy();
    this.transition = null;
    this.current = null;
    this.app.destroy(true, { children: true });
  }

  // -------------------------------------------------------------------------

  private get motion(): boolean {
    return this.effects && !this.reduced;
  }

  private applyMotion(): void {
    this.particles.setMood(this.mood, this.motion, this.app.screen.width, this.app.screen.height);
  }

  private readonly tick = (ticker: Ticker): void => {
    this.update(Math.min(ticker.deltaMS, 100));
  };

  private update(dtMs: number): void {
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    const dt = dtMs / 1000;
    this.time += dt;

    this.updateTransition(dtMs);
    this.updateMood(dtMs);

    const motion = this.motion;

    // Breathing drift on the background layer.
    const drift = motion ? 1 + DRIFT_AMOUNT * Math.sin((TAU * this.time) / DRIFT_PERIOD_S) : 1;
    this.bgLayer.scale.set(drift);

    // Parallax: opposite to pointer, smoothed.
    // Mouse on desktop; device tilt on phones once the user has allowed it.
    const useTilt = this.coarse && tilt.active;
    const useParallax = motion && (!this.coarse || useTilt);
    const inX = useTilt ? tilt.x : this.pointerX;
    const inY = useTilt ? tilt.y : this.pointerY;
    const tx = useParallax ? -inX * PARALLAX_BG_PX : 0;
    const ty = useParallax ? -inY * PARALLAX_BG_PX : 0;
    this.parX += (tx - this.parX) * PARALLAX_LERP;
    this.parY += (ty - this.parY) * PARALLAX_LERP;
    this.bgLayer.position.set(w / 2 + this.parX, h / 2 + this.parY);
    const px = (this.parX / PARALLAX_BG_PX) * PARALLAX_PARTICLE_PX;
    const py = (this.parY / PARALLAX_BG_PX) * PARALLAX_PARTICLE_PX;
    this.particleLayer.position.set(px, py);

    this.particles.update(dtMs, this.time, w, h);
    this.fireworks.update(dtMs, this.celebrate && !this.reduced, w, h);
  }

  private updateTransition(dtMs: number): void {
    const tr = this.transition;
    if (!tr) return;
    tr.elapsed += dtMs;
    const t = Math.min(1, tr.elapsed / tr.duration);
    const e = t * t * (3 - 2 * t);
    tr.sprite.alpha = e;
    this.fitSprite(tr.sprite, tr.zoom ? OVERSCAN - (OVERSCAN - 1) * e : 1);
    if (t >= 1) this.finishTransition();
  }

  private updateMood(dtMs: number): void {
    if (this.moodElapsed >= MOOD_MS) return;
    this.moodElapsed = Math.min(MOOD_MS, this.moodElapsed + dtMs);
    const t = this.moodElapsed / MOOD_MS;
    const e = t * t * (3 - 2 * t);
    this.mR = this.fR + (this.tR - this.fR) * e;
    this.mG = this.fG + (this.tG - this.fG) * e;
    this.mB = this.fB + (this.tB - this.fB) * e;
    this.mA = this.fA + (this.tA - this.fA) * e;
    this.moodRect.tint = (Math.round(this.mR) << 16) | (Math.round(this.mG) << 8) | Math.round(this.mB);
    this.moodRect.alpha = this.mA;
  }

  private startTransition(tex: Texture): void {
    // A new change mid-transition: finish the running one instantly first.
    if (this.transition) this.finishTransition();

    const old = this.current;
    const sprite = new Sprite(tex);
    sprite.anchor.set(0.5);
    sprite.alpha = 0;
    this.bgLayer.addChild(sprite);
    this.current = sprite;

    const reduced = this.reduced;
    const duration = reduced ? BG_REDUCED_MS : old ? BG_CROSS_MS : BG_FIRST_MS;
    this.transition = { sprite, old, elapsed: 0, duration, zoom: !reduced };
    this.fitSprite(sprite, reduced ? 1 : OVERSCAN);
    this.updateTransition(0);
  }

  private finishTransition(): void {
    const tr = this.transition;
    if (!tr) return;
    this.transition = null;
    tr.sprite.alpha = 1;
    this.fitSprite(tr.sprite, 1);
    if (tr.old && tr.old !== tr.sprite) tr.old.destroy(noDestroyTexture);
  }

  /** Cover-scale the sprite (with overscan) around the screen centre, times an extra zoom factor. */
  private fitSprite(s: Sprite, zoom: number): void {
    const tex = s.texture;
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    const cover = Math.max(w / tex.width, h / tex.height) * OVERSCAN;
    s.scale.set(cover * zoom);
    s.position.set(w / 2, h / 2);
  }

  private readonly onResize = (): void => {
    if (this.destroyed) return;
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    this.moodRect.scale.set(w, h);
    this.bgLayer.pivot.set(w / 2, h / 2);
    for (const child of this.bgLayer.children) {
      if (child instanceof Sprite) this.fitSprite(child, 1);
    }
    if (this.transition) this.updateTransition(0);

    // Crossing the 960 px threshold swaps to the other variant of the current background.
    const small = Math.max(this.app.renderer.width, (this.app.renderer.height * 16) / 9) <= SMALL_BG_MAX_WIDTH;
    if (small !== this.smallVariant && this.bgId && this.current) {
      this.smallVariant = small;
      const id = this.bgId;
      Assets.load<Texture>(bgUrl(id, small))
        .then((tex) => {
          if (this.destroyed || this.bgId !== id || !this.current) return;
          this.current.texture = tex;
          this.fitSprite(this.current, 1);
        })
        .catch(() => undefined);
    }
  };

  private readonly onPointer = (e: PointerEvent): void => {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    this.pointerX = Math.max(-1, Math.min(1, (e.clientX / w) * 2 - 1));
    this.pointerY = Math.max(-1, Math.min(1, (e.clientY / h) * 2 - 1));
  };

  private readonly onVisibility = (): void => {
    if (this.destroyed) return;
    if (document.hidden) this.app.ticker.stop();
    else this.app.ticker.start();
  };

  private readonly onReducedChange = (e: MediaQueryListEvent): void => {
    if (this.destroyed) return;
    this.reduced = e.matches;
    this.applyMotion();
  };

  private setRgbFromColor(color: number, alpha: number): void {
    this.mR = (color >> 16) & 0xff;
    this.mG = (color >> 8) & 0xff;
    this.mB = color & 0xff;
    this.mA = alpha;
  }

  private setTargetFromColor(color: number, alpha: number): void {
    this.tR = (color >> 16) & 0xff;
    this.tG = (color >> 8) & 0xff;
    this.tB = color & 0xff;
    this.tA = alpha;
  }
}
