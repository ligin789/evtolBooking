export function Logo({ className = '', tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
  const fg = tone === 'dark' ? '#17181B' : '#F7F3EC';
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="18" fill={fg} />
        <path d="M14 38c6-3 12-4.5 18-4.5S44 35 50 38" stroke="#C9A86A" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <path d="M20 27h24M32 18v9" stroke={tone === 'dark' ? '#F7F3EC' : '#17181B'} strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="32" cy="45" r="3.2" fill="#3D7BFF" />
      </svg>
      <span className="font-display text-[17px] font-semibold tracking-[0.18em]" style={{ color: fg }}>
        AERIS
      </span>
    </span>
  );
}
