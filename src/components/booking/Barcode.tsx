import { useMemo } from 'react';
import { hashString } from '../../lib/random';

/** Decorative barcode generated deterministically from a string. */
export function Barcode({ value, className = '', height = 34 }: { value: string; className?: string; height?: number }) {
  const bars = useMemo(() => {
    const out: { x: number; w: number }[] = [];
    let h = hashString(value || 'VIBE');
    let x = 0;
    while (x < 118) {
      h = Math.imul(h ^ (h >>> 13), 0x5bd1e995) >>> 0;
      const w = 1 + (h % 3);
      const gap = 1 + ((h >>> 4) % 2);
      out.push({ x, w });
      x += w + gap;
    }
    return out;
  }, [value]);
  return (
    <svg viewBox={`0 0 120 ${height}`} preserveAspectRatio="none" className={className} aria-hidden="true">
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={height} fill="currentColor" />
      ))}
    </svg>
  );
}
