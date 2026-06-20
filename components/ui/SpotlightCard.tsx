"use client";

import { useRef, MouseEvent, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function SpotlightCard({ children, className = "", style }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el   = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x    = ((e.clientX - rect.left) / rect.width)  * 100;
    const y    = ((e.clientY - rect.top)  / rect.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
  }

  return (
    <div
      ref={ref}
      className={`card-spotlight ${className}`}
      style={style}
      onMouseMove={onMouseMove}
    >
      {children}
    </div>
  );
}
