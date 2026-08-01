"use client";

import { useState, type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface Spark {
  id: number;
  x: number;
  y: number;
}

export function ShineButton({
  children,
  className,
  variant = "solid",
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "outline" }) {
  const [sparks, setSparks] = useState<Spark[]>([]);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setSparks((s) => [...s, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    window.setTimeout(() => {
      setSparks((s) => s.filter((sp) => sp.id !== id));
    }, 600);
    onClick?.(e);
  }

  return (
    <button
      onClick={handleClick}
      className={clsx(
        "relative isolate overflow-hidden rounded-full px-6 py-3 font-medium",
        "transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]",
        "before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r",
        "before:from-transparent before:via-white/35 before:to-transparent",
        "before:transition-transform before:duration-700 hover:before:translate-x-full",
        variant === "solid" &&
          "bg-gradient-to-r from-gold to-gold-soft text-black shadow-[0_4px_20px_color-mix(in_srgb,var(--gold)_35%,transparent)]",
        variant === "outline" &&
          "border border-border bg-surface text-foreground hover:border-gold/40",
        className
      )}
      {...props}
    >
      {sparks.map((s) => (
        <span
          key={s.id}
          className="animate-spark pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-white"
          style={{ left: s.x, top: s.y }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
