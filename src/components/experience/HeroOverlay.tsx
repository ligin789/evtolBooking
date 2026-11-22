import { ArrowRight, Move3d } from 'lucide-react';
import { motion } from 'motion/react';
import { getAircraft } from '../../config/aircraft';
import { CITY_NAME } from '../../config/vertiports';
import { useExperience } from '../../store/experienceStore';
import { Button } from '../ui/Button';

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroOverlay() {
  const setStage = useExperience((s) => s.setStage);
  const ac = getAircraft(null);
  return (
    <motion.section className="pointer-events-none fixed inset-0 z-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.5 } }}>
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-graphite/75 via-graphite/25 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full px-5 pb-[max(28px,env(safe-area-inset-bottom))] sm:px-10 sm:pb-12 lg:px-14">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease, delay: 0.15 }} className="max-w-[760px]">
          <div className="eyebrow flex items-center gap-3 text-champagne-soft">
            <span className="h-px w-8 bg-champagne" /> Urban air mobility · {CITY_NAME}
          </div>
          <h1 className="font-display mt-4 text-[44px] leading-[0.95] font-light tracking-[-0.035em] text-ivory sm:text-[76px] lg:text-[96px]">
            The city,
            <br />
            <span className="font-semibold">from above.</span>
          </h1>
          <p className="mt-5 max-w-[440px] text-[15px] leading-relaxed text-ivory/75">
            Electric vertical flights between city vertiports. Step inside the aircraft, choose your window, and fly in minutes, not hours.
          </p>
          <div className="pointer-events-auto mt-7 flex flex-wrap items-center gap-3">
            <Button variant="accent" size="lg" onClick={() => setStage('route')}>
              Book a flight <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button variant="glass" size="lg" onClick={() => setStage('explore')}>
              Explore aircraft
            </Button>
            <Button variant="dark" size="lg" onClick={() => setStage('cabin')} className="hidden sm:inline-flex">
              Explore cabin
            </Button>
          </div>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 1 }}
        className="absolute right-6 bottom-12 hidden text-right text-ivory lg:block lg:right-14"
      >
        <div className="eyebrow text-champagne-soft">Aircraft 01 / 02</div>
        <div className="font-display mt-1 text-2xl font-semibold">{ac.name}</div>
        <div className="mt-0.5 text-[13px] text-ivory/65">
          {ac.model} · {ac.tagline}
        </div>
        <div className="mt-4 inline-flex items-center gap-2 text-[11px] text-ivory/55">
          <Move3d className="h-3.5 w-3.5" aria-hidden="true" /> Drag to orbit · scroll to zoom
        </div>
      </motion.div>
    </motion.section>
  );
}
