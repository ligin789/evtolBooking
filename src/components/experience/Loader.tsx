import { AnimatePresence, motion } from 'motion/react';
import { useExperience } from '../../store/experienceStore';
import { Logo } from '../ui/Logo';

export function Loader({ force = false }: { force?: boolean }) {
  const ready = useExperience((s) => s.sceneReady);
  return (
    <AnimatePresence>
      {(!ready || force) && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-50 grid place-items-center bg-graphite"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] } }}
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center">
            <Logo tone="light" />
            <div className="mt-8 h-px w-48 overflow-hidden bg-ivory/10">
              <motion.div className="h-full w-1/3 bg-champagne" animate={{ x: ['-100%', '300%'] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }} />
            </div>
            <p className="eyebrow mt-4 text-ivory/50">Preparing aircraft</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
