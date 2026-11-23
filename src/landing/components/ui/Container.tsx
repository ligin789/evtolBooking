import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer";
  size?: "default" | "wide" | "narrow";
}

export function Container({
  children,
  className = "",
  as: Component = "div",
  size = "default",
}: ContainerProps) {
  const maxWidthClass =
    size === "wide"
      ? "max-w-[1480px]"
      : size === "narrow"
      ? "max-w-5xl"
      : "max-w-[1360px]";

  return (
    <Component
      className={`mx-auto w-full px-5 sm:px-8 lg:px-12 ${maxWidthClass} ${className}`}
    >
      {children}
    </Component>
  );
}
