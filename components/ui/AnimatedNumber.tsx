"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function AnimatedNumber({
  value,
  duration = 900,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
  style,
}: Props) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const startVal = useRef(0);

  useEffect(() => {
    const from  = startVal.current;
    const to    = value;
    startRef.current = null;

    cancelAnimationFrame(frameRef.current);

    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed  = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // spring-like easing: ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        startVal.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  const formatted = display.toFixed(decimals);

  return (
    <span className={className} style={style}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
