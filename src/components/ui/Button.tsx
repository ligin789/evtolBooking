import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'accent' | 'glass' | 'ghost' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-graphite text-ivory hover:bg-graphite-2 shadow-[0_10px_30px_-12px_rgba(23,24,27,.7)]',
  accent: 'bg-electric text-white hover:bg-[#2f6cf0] shadow-[0_12px_30px_-10px_rgba(61,123,255,.75)]',
  glass: 'glass text-graphite hover:bg-white/90',
  ghost: 'text-graphite hover:bg-graphite/5',
  dark: 'glass-dark text-ivory hover:bg-graphite/80',
};
const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px] gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-7 text-[15px] gap-2.5',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = 'primary', size = 'md', className = '', ...rest }, ref) {
  return (
    <button
      ref={ref}
      className={`inline-flex cursor-pointer items-center justify-center rounded-full font-medium tracking-tight transition-all duration-300 ease-[var(--ease-cine)] active:scale-[.98] disabled:pointer-events-none disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    />
  );
});
