"use client";

import { useRef } from "react";
import { m, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * Efeito de apple.com: o bloco cresce e ganha nitidez acompanhando o scroll,
 * em vez de simplesmente "aparecer". Ligado ao dedo/rolagem, com mola para suavizar.
 */
export function ScrollScale({
  children,
  className,
  from = 0.82,
}: {
  children: React.ReactNode;
  className?: string;
  from?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const scale = useTransform(progress, [0, 1], [from, 1]);
  const opacity = useTransform(progress, [0, 0.55, 1], [0, 0.6, 1]);

  return (
    <m.div ref={ref} className={className} style={reduce ? undefined : { scale, opacity }}>
      {children}
    </m.div>
  );
}
