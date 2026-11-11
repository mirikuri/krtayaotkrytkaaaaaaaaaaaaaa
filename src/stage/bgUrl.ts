import type { BgId } from '../engine/types';

/** Width threshold (CSS px) at or below which the 960w variant is used. */
export const SMALL_BG_MAX_WIDTH = 960;

export function bgUrl(id: BgId, small: boolean): string {
  return `/bg/${id}${small ? '-sm' : ''}.webp`;
}
