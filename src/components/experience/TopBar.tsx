import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useExperience } from '../../store/experienceStore';
import { Logo } from '../ui/Logo';

const STEPS = ['Aircraft', 'Route', 'Seat', 'Details', 'Confirm'] as const;

function currentStep(path: string, stage: string): number {
  if (path.startsWith('/confirmation')) return 5;
  if (path.startsWith('/review')) return 4;
  if (path.startsWith('/passengers')) return 3;
  if (stage === 'cabin' || stage === 'seat') return 2;
  if (stage === 'route') return 1;
  return 0;
}

export function TopBar() {
  const { pathname } = useLocation();
  const stage = useExperience((s) => s.stage);
  const setStage = useExperience((s) => s.setStage);
  const step = currentStep(pathname, stage);
  // Over the navy landing sections (scrolled past the hero) the bar switches to its dark style.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const onDarkPage = pathname !== '/' || scrolled;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 pt-[max(14px,env(safe-area-inset-top))] sm:px-8 sm:pt-6">
      <Link
        to="/"
        onClick={() => {
          setStage('hero');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`pointer-events-auto rounded-full transition-all duration-300 ${scrolled ? 'glass-dark px-3 py-1.5' : ''}`}
        aria-label="VIBE home">
        <Logo tone={onDarkPage ? 'light' : 'dark'} />
      </Link>
      <nav aria-label="Booking progress" className="pointer-events-auto hidden md:block">
        <ol className={`flex items-center gap-1 rounded-full px-2 py-1.5 ${onDarkPage ? 'glass-dark' : 'glass'}`}>
          {STEPS.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={label} className="flex items-center">
                <span
                  aria-current={active ? 'step' : undefined}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition ${
                    active ? (onDarkPage ? 'bg-ivory text-graphite' : 'bg-graphite text-ivory') : done ? (onDarkPage ? 'text-ivory/80' : 'text-graphite') : onDarkPage ? 'text-ivory/40' : 'text-mist'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-electric' : done ? 'bg-champagne' : 'bg-current opacity-40'}`} />
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>
      <span className={`pointer-events-auto rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase ${onDarkPage ? 'glass-dark text-champagne-soft' : 'glass text-graphite'}`}>
        Demo
      </span>
    </header>
  );
}
