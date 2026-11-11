import { parseMarkup } from '../engine/markup';

interface Props {
  text: string;
  /** Visible plain characters; the rest are rendered but invisible (stable layout). */
  shown?: number;
  className?: string;
}

export default function RichText({ text, shown, className }: Props) {
  const parts = parseMarkup(text);

  if (shown === undefined) {
    return (
      <span className={className}>
        {parts.map((p, i) =>
          p.kw ? (
            <mark key={i} className="kw">
              {p.text}
            </mark>
          ) : (
            <span key={i}>{p.text}</span>
          ),
        )}
      </span>
    );
  }

  let offset = 0;
  return (
    <span className={className}>
      {parts.map((p, i) => {
        const start = offset;
        offset += p.text.length;
        const visibleLen = Math.max(0, Math.min(p.text.length, shown - start));
        const content = (
          <>
            {p.text.slice(0, visibleLen)}
            {visibleLen < p.text.length && (
              <span className="ghost">{p.text.slice(visibleLen)}</span>
            )}
          </>
        );
        if (p.kw) {
          return (
            <mark key={i} className={visibleLen === 0 ? 'kw kw--ghost' : 'kw'}>
              {content}
            </mark>
          );
        }
        return <span key={i}>{content}</span>;
      })}
    </span>
  );
}
