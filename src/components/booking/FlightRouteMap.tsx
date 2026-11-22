import { motion } from 'motion/react';
import { VERTIPORTS, getVertiport, routeKm } from '../../config/vertiports';
import { useBooking } from '../../store/bookingStore';

const W = 40;
const H = 20;

/**
 * Stylised map of the demonstration network with the selected corridor drawn
 * as an animated arc. Tapping a vertiport sets it as departure / destination.
 */
export function FlightRouteMap({ className = '' }: { className?: string }) {
  const { search, setTo } = useBooking();
  const a = getVertiport(search.fromId);
  const b = getVertiport(search.toId);
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const bend = Math.min(4, len * 0.22);
  const cx = mx + (-dy / len) * bend;
  const cy = my + (dx / len) * bend;
  const path = `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;

  return (
    <figure className={`relative overflow-hidden rounded-2xl border border-graphite/8 bg-[#eaf0f2] ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Route map from ${a.name} to ${b.name}`}>
        <defs>
          <pattern id="grid" width="2" height="2" patternUnits="userSpaceOnUse">
            <path d="M 2 0 L 0 0 0 2" fill="none" stroke="#17181b" strokeOpacity=".04" strokeWidth=".05" />
          </pattern>
          <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6f2ea" />
            <stop offset="1" stopColor="#ece5d8" />
          </linearGradient>
        </defs>
        {/* land mass with an indented bay */}
        <path
          d="M0 0 H40 V13.5 C37 14.5 35.5 18 33 18.6 C29 19.4 26 16.8 22 15.9 C19 15.2 17 17.6 14 17.4 C10.5 17.2 8.8 18.8 5.6 18.9 C3 19 1.4 17 0 16.5 Z"
          fill="url(#land)"
        />
        <rect width={W} height={H} fill="url(#grid)" />
        {/* downtown block */}
        <circle cx="18.5" cy="9" r="3.4" fill="#17181b" fillOpacity=".05" />
        {/* corridor */}
        <motion.path
          key={path}
          d={path}
          fill="none"
          stroke="#3d7bff"
          strokeWidth=".22"
          strokeLinecap="round"
          strokeDasharray=".6 .45"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.circle
          key={`dot-${path}`}
          r=".42"
          fill="#3d7bff"
          initial={{ offsetDistance: '0%' }}
          animate={{ offsetDistance: '100%' }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.6 }}
          style={{ offsetPath: `path('${path}')` }}
        />
        {VERTIPORTS.map((v) => {
          const isFrom = v.id === a.id;
          const isTo = v.id === b.id;
          const active = isFrom || isTo;
          return (
            <g
              key={v.id}
              transform={`translate(${v.x} ${v.y})`}
              className="cursor-pointer"
              onClick={() => !active && setTo(v.id)}
            >
              <title>{`${v.name} (${v.code}) · ${v.district}`}</title>
              {active && <circle r="1.1" fill={isFrom ? '#17181b' : '#3d7bff'} fillOpacity=".12" />}
              <circle r={active ? 0.55 : 0.38} fill={isFrom ? '#17181b' : isTo ? '#3d7bff' : '#fff'} stroke={active ? 'none' : '#17181b'} strokeOpacity=".35" strokeWidth=".1" />
              <text y={-1} textAnchor="middle" fontSize=".95" fontWeight={active ? 700 : 500} fill="#17181b" fillOpacity={active ? 0.95 : 0.55} fontFamily="Inter Tight, sans-serif">
                {v.code}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="absolute right-3 bottom-2 left-3 flex justify-between text-[10.5px] text-slate">
        <span>Tap a vertiport to fly there</span>
        <span className="font-medium text-graphite">{routeKm(a.id, b.id)} km</span>
      </figcaption>
    </figure>
  );
}
