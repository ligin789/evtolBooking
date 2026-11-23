import React from "react";
import { ArrowUpRight } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "dark" | "outline-dark" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  showArrow?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  showArrow = false,
  className = "",
  children,
  onClick,
  ...props
}: ButtonProps) {
  const baseStyles =
    "group relative inline-flex items-center justify-center gap-2.5 rounded-full font-medium tracking-[-0.01em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-velos-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-velos-navy disabled:opacity-50 disabled:pointer-events-none select-none";

  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3.5 text-sm",
    lg: "px-8 py-4 text-sm sm:text-base",
  }[size];

  const variantStyles = {
    primary:
      "bg-velos-cyan text-velos-navy hover:bg-velos-white hover:shadow-[0_0_28px_rgba(102,217,242,0.45)] active:scale-[0.98]",
    secondary:
      "bg-velos-white/10 text-velos-white border border-velos-white/25 backdrop-blur-md hover:bg-velos-white/18 hover:border-velos-white/50 active:scale-[0.98]",
    dark: "bg-velos-navy text-velos-white hover:bg-velos-blue hover:shadow-lg active:scale-[0.98]",
    "outline-dark":
      "bg-transparent text-velos-navy border border-velos-navy/25 hover:border-velos-navy hover:bg-velos-navy/5 active:scale-[0.98]",
    ghost:
      "bg-transparent text-velos-silver hover:text-velos-white hover:bg-velos-white/5",
  }[variant];

  const combinedClassName = `${baseStyles} ${sizeStyles} ${variantStyles} ${className}`;

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href && href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  if (href) {
    return (
      <a
        href={href}
        onClick={handleAnchorClick}
        className={combinedClassName}
      >
        <span>{children}</span>
        {showArrow && (
          <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        )}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={combinedClassName} {...props}>
      <span>{children}</span>
      {showArrow && (
        <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      )}
    </button>
  );
}
