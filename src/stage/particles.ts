import { Container, Sprite, Texture } from 'pixi.js';
import type { Mood } from '../engine/types';

// ---------------------------------------------------------------------------
// Shared radial textures, generated once.
// ---------------------------------------------------------------------------

export type TexName = 'soft' | 'warm' | 'gold' | 'bokeh' | 'firefly' | 'pinkwhite';

const TEX_SIZE = 64;
let textureCache: Record<TexName, Texture> | null = null;

function radialTexture(stops: Array<[number, string]>): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const c = TEX_SIZE / 2;
    const g = ctx.createRadialGradient(c, c, 0, c, c, c);
    for (const [offset, color] of stops) g.addColorStop(offset, color);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
  }
  return Texture.from(canvas);
}

export function getTextures(): Record<TexName, Texture> {
  if (!textureCache) {
    textureCache = {
      soft: radialTexture([[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']]),
      warm: radialTexture([[0, 'rgba(255,250,220,1)'], [0.3, 'rgba(255,244,200,0.55)'], [1, 'rgba(255,244,200,0)']]),
      gold: radialTexture([[0, 'rgba(255,200,110,1)'], [0.3, 'rgba(255,160,70,0.5)'], [1, 'rgba(255,140,50,0)']]),
      // Bokeh: soft disc with a faint brighter rim.
      bokeh: radialTexture([[0, 'rgba(255,220,170,0.35)'], [0.8, 'rgba(255,200,140,0.7)'], [0.92, 'rgba(255,220,170,0.9)'], [1, 'rgba(255,200,140,0)']]),
      firefly: radialTexture([[0, 'rgba(240,255,140,1)'], [0.25, 'rgba(200,255,80,0.6)'], [1, 'rgba(160,255,60,0)']]),
      pinkwhite: radialTexture([[0, 'rgba(255,245,250,1)'], [0.3, 'rgba(255,200,220,0.55)'], [1, 'rgba(255,180,205,0)']]),
    };
  }
  return textureCache;
}

// ---------------------------------------------------------------------------
// Ambient motes (day / sunset / night / dawn).
// Each mote drifts its anchor with a constant velocity and wobbles around it
// on a Lissajous-like path; alpha twinkles. All state is plain numbers.
// ---------------------------------------------------------------------------

interface Recipe {
  count: number;
  tex: TexName;
  size: [number, number];
  /** Sprite diameter = size * halo (soft halo for tiny motes). */
  halo: number;
  alpha: [number, number];
  vx: [number, number];
  vy: [number, number];
  amp: [number, number];
  wobbleHz: [number, number];
  twinkleHz: [number, number];
  blend: 'normal' | 'add';
}

const RECIPES: Record<Mood, Recipe[]> = {
  day: [
    { count: 40, tex: 'warm', size: [2, 6], halo: 2.2, alpha: [0.15, 0.5], vx: [8, 20], vy: [-18, -6], amp: [3, 8], wobbleHz: [0.2, 0.5], twinkleHz: [0.6, 1.4], blend: 'normal' },
  ],
  sunset: [
    { count: 35, tex: 'gold', size: [2, 5], halo: 2.2, alpha: [0.2, 0.5], vx: [-4, 6], vy: [-14, -6], amp: [4, 10], wobbleHz: [0.2, 0.5], twinkleHz: [0.6, 1.4], blend: 'normal' },
    { count: 8, tex: 'bokeh', size: [20, 50], halo: 1, alpha: [0.05, 0.12], vx: [-3, 3], vy: [-4, -1], amp: [6, 14], wobbleHz: [0.05, 0.12], twinkleHz: [0.1, 0.3], blend: 'normal' },
  ],
  night: [
    { count: 45, tex: 'firefly', size: [3, 7], halo: 1.8, alpha: [0.1, 0.9], vx: [-6, 6], vy: [-6, 6], amp: [18, 40], wobbleHz: [0.2, 0.6], twinkleHz: [0.8, 1.6], blend: 'add' },
  ],
  dawn: [
    { count: 30, tex: 'pinkwhite', size: [2, 5], halo: 2.2, alpha: [0.15, 0.45], vx: [-6, 6], vy: [-22, -10], amp: [4, 10], wobbleHz: [0.2, 0.5], twinkleHz: [0.6, 1.4], blend: 'normal' },
  ],
};

const REF_AREA = 1920 * 1080;
const TAU = Math.PI * 2;
const FADE_MS = 500;

interface Mote {
  s: Sprite;
  ax: number;
  ay: number;
  vx: number;
  vy: number;
  amp: number;
  wobbleW: number;
  wobblePh: number;
  twinkleW: number;
  twinklePh: number;
  lo: number;
  hi: number;
  half: number;
}

interface Field {
  root: Container;
  motes: Mote[];
  alpha: number;
  target: 0 | 1;
}

function rnd(a: number, b: number): number {
  return a + (b - a) * Math.random();
}

export class AmbientParticles {
  private root = new Container();
  private fields: Field[] = [];
  private mood: Mood | null = null;

  constructor(parent: Container) {
    parent.addChild(this.root);
  }

  /** Switch to a mood (cross-fades over 500 ms) or, when `enabled` is false, fade everything out. */
  setMood(mood: Mood, enabled: boolean, w: number, h: number): void {
    if (!enabled) {
      this.mood = null;
      for (const f of this.fields) f.target = 0;
      return;
    }
    if (mood === this.mood) return;
    this.mood = mood;
    for (const f of this.fields) f.target = 0;
    this.fields.push(this.buildField(mood, w, h));
    // Keep the list short if moods change rapidly.
    while (this.fields.length > 3) {
      const old = this.fields.shift();
      if (old) this.destroyField(old);
    }
  }

  update(dtMs: number, t: number, w: number, h: number): void {
    for (let i = this.fields.length - 1; i >= 0; i--) {
      const f = this.fields[i];
      const step = dtMs / FADE_MS;
      if (f.alpha < f.target) f.alpha = Math.min(f.target, f.alpha + step);
      else if (f.alpha > f.target) f.alpha = Math.max(f.target, f.alpha - step);

      if (f.target === 0 && f.alpha <= 0) {
        this.fields.splice(i, 1);
        this.destroyField(f);
        continue;
      }
      f.root.alpha = f.alpha;

      const motes = f.motes;
      const dt = dtMs / 1000;
      for (let j = 0; j < motes.length; j++) {
        const m = motes[j];
        m.ax += m.vx * dt;
        m.ay += m.vy * dt;
        const margin = m.amp + m.half + 10;
        const spanX = w + margin * 2;
        const spanY = h + margin * 2;
        if (m.ax < -margin) m.ax += spanX;
        else if (m.ax > w + margin) m.ax -= spanX;
        if (m.ay < -margin) m.ay += spanY;
        else if (m.ay > h + margin) m.ay -= spanY;

        m.s.position.set(
          m.ax + m.amp * Math.sin(t * m.wobbleW + m.wobblePh),
          m.ay + m.amp * 0.7 * Math.cos(t * m.wobbleW * 0.8 + m.wobblePh),
        );
        const tw = 0.5 + 0.5 * Math.sin(t * m.twinkleW + m.twinklePh);
        m.s.alpha = m.lo + (m.hi - m.lo) * tw;
      }
    }
  }

  destroy(): void {
    for (const f of this.fields) this.destroyField(f);
    this.fields.length = 0;
    this.root.destroy({ children: true });
  }

  private buildField(mood: Mood, w: number, h: number): Field {
    const areaScale = Math.min(1, Math.max(0.4, (w * h) / REF_AREA));
    const root = new Container();
    const textures = getTextures();
    const motes: Mote[] = [];

    for (const r of RECIPES[mood]) {
      const count = Math.round(r.count * areaScale);
      for (let i = 0; i < count; i++) {
        const s = new Sprite(textures[r.tex]);
        s.anchor.set(0.5);
        const size = rnd(r.size[0], r.size[1]);
        const diam = size * r.halo;
        s.scale.set(diam / TEX_SIZE);
        s.blendMode = r.blend;
        root.addChild(s);
        motes.push({
          s,
          ax: Math.random() * w,
          ay: Math.random() * h,
          vx: rnd(r.vx[0], r.vx[1]),
          vy: rnd(r.vy[0], r.vy[1]),
          amp: rnd(r.amp[0], r.amp[1]),
          wobbleW: TAU * rnd(r.wobbleHz[0], r.wobbleHz[1]),
          wobblePh: rnd(0, TAU),
          twinkleW: TAU * rnd(r.twinkleHz[0], r.twinkleHz[1]),
          twinklePh: rnd(0, TAU),
          lo: r.alpha[0],
          hi: r.alpha[1],
          half: diam / 2,
        });
      }
    }

    this.root.addChild(root);
    root.alpha = 0;
    return { root, motes, alpha: 0, target: 1 };
  }

  private destroyField(f: Field): void {
    f.root.destroy({ children: true });
  }
}

// ---------------------------------------------------------------------------
// Fireworks for `celebrate`. Sparks are pooled in a flat array; sprites are
// created on burst spawn only, not per frame.
// ---------------------------------------------------------------------------

const BURST_INTERVAL_MS = 450;
const BURST_SPARKS = 40;
const SPARK_LIFE_MS = 1200;
const GRAVITY = 260; // px/s^2
const PALETTE = [0xffd27a, 0xffb347, 0xff7eb6, 0xff9ac9, 0x7fe7ff, 0x9ff0ff];

interface Spark {
  s: Sprite;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  baseScale: number;
}

export class Fireworks {
  private root = new Container();
  private sparks: Spark[] = [];
  private spawnTimer = BURST_INTERVAL_MS; // spawn immediately on first tick

  constructor(parent: Container) {
    this.root.blendMode = 'add';
    parent.addChild(this.root);
  }

  /** Call every frame. `spawning` false = let existing bursts finish. */
  update(dtMs: number, spawning: boolean, w: number, h: number): void {
    if (spawning) {
      this.spawnTimer += dtMs;
      if (this.spawnTimer >= BURST_INTERVAL_MS) {
        this.spawnTimer -= BURST_INTERVAL_MS;
        this.burst(w, h);
      }
    } else {
      this.spawnTimer = BURST_INTERVAL_MS;
    }

    const dt = dtMs / 1000;
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const p = this.sparks[i];
      p.life += dtMs;
      if (p.life >= SPARK_LIFE_MS) {
        p.s.destroy();
        // swap-remove keeps this allocation-free
        const last = this.sparks.length - 1;
        this.sparks[i] = this.sparks[last];
        this.sparks.length = last;
        continue;
      }
      p.vy += GRAVITY * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.s.position.set(p.x, p.y);
      const k = p.life / SPARK_LIFE_MS;
      p.s.alpha = 1 - k;
      p.s.scale.set(p.baseScale * (1 - 0.5 * k));
    }
  }

  destroy(): void {
    for (const p of this.sparks) p.s.destroy();
    this.sparks.length = 0;
    this.root.destroy({ children: true });
  }

  private burst(w: number, h: number): void {
    const tex = getTextures().soft;
    const cx = w * rnd(0.1, 0.9);
    const cy = h * rnd(0.05, 0.6); // upper 60% of the screen
    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    for (let i = 0; i < BURST_SPARKS; i++) {
      const s = new Sprite(tex);
      s.anchor.set(0.5);
      const d = rnd(4, 8);
      const baseScale = d / 64;
      s.scale.set(baseScale);
      s.tint = Math.random() < 0.7 ? color : PALETTE[Math.floor(Math.random() * PALETTE.length)];
      s.blendMode = 'add';
      s.position.set(cx, cy);
      this.root.addChild(s);
      const a = rnd(0, TAU);
      const speed = rnd(120, 320);
      this.sparks.push({
        s, x: cx, y: cy, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 0, baseScale,
      });
    }
  }
}
