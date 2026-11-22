import { ArrowLeft, ArrowRight, Wind } from 'lucide-react';
import { motion } from 'motion/react';
import { getAircraft } from '../../config/aircraft';
import { useExperience, type ExteriorView } from '../../store/experienceStore';
import { Button } from '../ui/Button';

const VIEWS: { id: ExteriorView; label: string }[] = [
  { id: 'hero', label: 'Three-quarter' },
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Profile' },
  { id: 'top', label: 'Top' },
  { id: 'rear', label: 'Rear' },
  { id: 'rotor', label: 'Rotors' },
];

/** Exterior configurator: preset camera angles, flight mode and specs. */
export function AircraftExplorer() {
  const { exteriorView, setExteriorView, flightMode, setFlightMode, setStage } = useExperience();
  const ac = getAircraft(null);
  return (
    <motion.section className="pointer-events-none fixed inset-0 z-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-graphite/60 to-transparent" />
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-24 left-5 max-w-[300px] sm:left-10 lg:left-14"
      >
        <button type="button" onClick={() => setStage('hero')} className="pointer-events-auto mb-6 inline-flex cursor-pointer items-center gap-2 text-[12px] font-medium text-graphite/70 hover:text-graphite">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back
        </button>
        <div className="eyebrow text-graphite/60">Exterior · 01</div>
        <h2 className="font-display mt-2 text-4xl font-semibold tracking-tight text-graphite sm:text-5xl">{ac.name}</h2>
        <p className="mt-2 text-[13.5px] text-graphite/70">{ac.tagline}. Four lift rotors on carbon booms and two tilting wing-tip propellers.</p>
        <dl className="glass mt-6 hidden grid-cols-2 overflow-hidden rounded-2xl sm:grid">
          {ac.specs.map((s, i) => (
            <div key={s.label} className={`px-4 py-3 ${i % 2 ? 'border-l border-graphite/8' : ''} ${i > 1 ? 'border-t border-graphite/8' : ''}`}>
              <dt className="eyebrow text-[9.5px] text-mist">{s.label}</dt>
              <dd className="font-display mt-0.5 text-lg font-semibold">{s.value}</dd>
            </div>
          ))}
        </dl>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-3 pb-[max(20px,env(safe-area-inset-bottom))] sm:pb-8">
        <div className="pointer-events-auto glass scrollbar-none flex max-w-full gap-1 overflow-x-auto rounded-full p-1" role="tablist" aria-label="Camera angle">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={exteriorView === v.id}
              onClick={() => setExteriorView(v.id)}
              className={`shrink-0 cursor-pointer rounded-full px-3.5 py-2 text-[12.5px] font-medium transition ${exteriorView === v.id ? 'bg-graphite text-ivory' : 'text-graphite/70 hover:text-graphite'}`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setFlightMode(flightMode === 'hover' ? 'cruise' : 'hover')}
            className="glass-dark inline-flex h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-[13px] text-ivory"
            aria-pressed={flightMode === 'hover'}
          >
            <Wind className="h-4 w-4 text-champagne" aria-hidden="true" />
            {flightMode === 'hover' ? 'Hover mode' : 'Cruise mode'}
            <span className="text-ivory/50">· switch</span>
          </button>
          <Button variant="glass" onClick={() => setStage('cabin')}>
            Explore cabin
          </Button>
          <Button variant="accent" onClick={() => setStage('route')}>
            Plan flight <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
