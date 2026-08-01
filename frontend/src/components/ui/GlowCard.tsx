"use client";

import { useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

export function GlowCard({
  children,
  className,
  glow = "gold",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  glow?: "gold" | "emerald";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  const glowColor = glow === "gold" ? "var(--gold)" : "var(--emerald)";

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={clsx(
        "group relative overflow-hidden rounded-2xl border border-border bg-surface backdrop-blur-xl",
        "p-6 transition-transform duration-300 hover:-translate-y-1",
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(420px circle at ${pos.x}% ${pos.y}%, color-mix(in srgb, ${glowColor} 16%, transparent), transparent 60%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
