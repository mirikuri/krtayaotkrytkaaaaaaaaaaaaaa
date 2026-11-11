import type { Markup } from './types';

export interface MarkupSegment {
  text: string;
  /** True for text that was wrapped in [[ ]]. */
  kw: boolean;
}

const KEYWORD_RE = /\[\[(.+?)\]\]/g;

/** Splits markup into plain and keyword segments, preserving order. */
export function parseMarkup(text: Markup): MarkupSegment[] {
  const out: MarkupSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(KEYWORD_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push({ text: text.slice(last, idx), kw: false });
    out.push({ text: m[1], kw: true });
    last = idx + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), kw: false });
  return out;
}

/** Visible text with the [[ ]] brackets removed. */
export function stripMarkup(text: Markup): string {
  return text.replace(KEYWORD_RE, '$1');
}

/** Number of visible characters (code points), ignoring the markup brackets. */
export function plainLength(text: Markup): number {
  return Array.from(stripMarkup(text)).length;
}
