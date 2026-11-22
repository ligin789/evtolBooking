import { motion } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * Side panel on desktop, bottom sheet on mobile. Keeps the 3D scene visible
 * and interactive beside it.
 */
export function Sheet({ children, side = 'right', className = '', label }: { children: ReactNode; side?: 'right' | 'left'; className?: string; label: string }) {
  return (
    <motion.aside
      aria-label={label}
      initial={{ opacity: 0, x: side === 'right' ? 40 : -40, y: 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: side === 'right' ? 40 : -40 }}
      transition={{ type: 'spring', stiffness: 140, damping: 22 }}
      className={`glass pointer-events-auto fixed inset-x-2 bottom-2 z-30 max-h-[64vh] overflow-y-auto rounded-[28px] px-5 pt-5 text-graphite md:inset-x-auto md:top-24 md:bottom-6 md:max-h-none md:w-[440px] sm:px-6 ${
        side === 'right' ? 'md:right-6' : 'md:left-6'
      } ${className}`}
    >
      {children}
    </motion.aside>
  );
}
