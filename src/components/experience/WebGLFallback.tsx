/** Static backdrop used when WebGL is unavailable. The booking flow keeps working via the 2D seat map. */
export function WebGLFallback() {
  return (
    <div className="fixed inset-0 -z-0 overflow-hidden bg-gradient-to-b from-[#f3d9b4] via-[#efe3d1] to-[#9fb4bf]" aria-hidden="true">
      <svg viewBox="0 0 800 400" className="absolute top-[18%] left-1/2 w-[min(900px,120vw)] -translate-x-1/2 opacity-90">
        <g fill="none" stroke="#17181b" strokeWidth="3" strokeLinecap="round">
          <path d="M120 150h220M460 150h220" />
          <path d="M230 150v30M570 150v30" />
          <path d="M60 200h680" stroke="#17181b" strokeOpacity=".5" />
        </g>
        <path d="M250 230c50-40 130-60 200-60s110 20 140 50c-30 30-100 50-170 50s-130-15-170-40z" fill="#f7f3ec" stroke="#17181b" strokeWidth="3" />
        <path d="M400 186c40 0 80 10 110 30H360c10-20 20-30 40-30z" fill="#9fb7c9" />
        <circle cx="400" cy="258" r="4" fill="#3d7bff" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#2e6274]/50 to-transparent" />
    </div>
  );
}
