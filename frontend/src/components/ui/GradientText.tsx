import type { ReactNode } from "react";
import clsx from "clsx";

export function GradientText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "animate-gradient-x bg-[length:200%_auto] bg-clip-text text-transparent",
        "bg-gradient-to-r from-gold via-gold-soft to-emerald",
        className
      )}
    >
      {children}
    </span>
  );
}
