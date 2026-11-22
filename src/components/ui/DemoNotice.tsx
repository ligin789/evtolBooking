export function DemoNotice({ className = '' }: { className?: string }) {
  return (
    <p className={`text-[11px] leading-relaxed text-mist ${className}`}>
      Demonstration only. AERIS, Port Meridian, its vertiports, routes, aircraft and fares are fictional. No real flight is booked and no payment is taken.
    </p>
  );
}
