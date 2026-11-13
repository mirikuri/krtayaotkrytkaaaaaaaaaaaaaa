/**
 * Device-tilt input for the stage parallax on phones.
 * `tilt.x` / `tilt.y` are in -1..1 relative to the pose the phone had when tilt started.
 */
export const tilt = { x: 0, y: 0, active: false };

const RANGE_DEG = 18;
let started = false;
let baseBeta: number | null = null;
let baseGamma: number | null = null;

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

function onOrientation(e: DeviceOrientationEvent): void {
  if (e.beta == null || e.gamma == null) return;
  if (baseBeta == null || baseGamma == null) {
    baseBeta = e.beta;
    baseGamma = e.gamma;
  }
  tilt.x = clamp((e.gamma - baseGamma) / RANGE_DEG);
  tilt.y = clamp((e.beta - baseBeta) / RANGE_DEG);
  tilt.active = true;
}

/**
 * Starts listening to device orientation. Must be called from a user gesture (tap):
 * iOS only shows its motion-permission prompt in that case. Safe to call repeatedly;
 * does nothing on devices without the sensor or when permission is denied.
 */
export function requestTilt(): void {
  if (started || typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return;
  if (!window.matchMedia('(pointer: coarse)').matches) return;
  started = true;

  const listen = () => window.addEventListener('deviceorientation', onOrientation, { passive: true });
  const ctor = DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  };

  if (typeof ctor.requestPermission === 'function') {
    ctor
      .requestPermission()
      .then((state) => {
        if (state === 'granted') listen();
      })
      .catch(() => undefined);
  } else {
    listen();
  }
}
