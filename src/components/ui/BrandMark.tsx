import { useState, type ReactNode } from 'react';
import { BRAND_LOGO_URL, BRAND_NAME } from '../../config/brand';

/**
 * Shows the brand logo image, falling back to `fallback` (a vector mark)
 * if the image file is missing or fails to load.
 */
export function BrandMark({ size = 28, fallback, className = '', backing }: { size?: number; fallback: ReactNode; className?: string; backing?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return (
    <span
      className={`inline-grid shrink-0 place-items-center overflow-hidden rounded-[30%] ${className}`}
      style={{ width: size, height: size, background: backing }}
    >
      <img src={BRAND_LOGO_URL} alt={`${BRAND_NAME} logo`} width={size} height={size} className="h-full w-full object-contain" onError={() => setFailed(true)} draggable={false} />
    </span>
  );
}
