"use client";

import { m, useReducedMotion } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1] as const;
/** Curva usada pela Apple: começa decidida e pousa macio. */
export const EASE_APPLE = [0.28, 0.11, 0.32, 1] as const;

type Props = {
  children: React.ReactNode;
  as?: "div" | "p" | "span" | "h2" | "h3" | "figure";
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
  amount?: number;
  /** Desfoque inicial que vira foco (estilo Apple). Desligue em blocos grandes de imagem. */
  blur?: boolean;
};

/** Fade + translateY + foco suave quando entra na viewport. Uma única vez. */
export function Reveal({
  children,
  as = "div",
  delay = 0,
  y = 24,
  duration = 1.1,
  className,
  amount = 0.4,
  blur = true,
}: Props) {
  const Tag = m[as];
  const reduce = useReducedMotion();
  const soft = blur && !reduce;
  return (
    <Tag
      className={className}
      data-reveal
      initial={{ opacity: 0, y, ...(soft ? { filter: "blur(10px)" } : {}) }}
      whileInView={{ opacity: 1, y: 0, ...(soft ? { filter: "blur(0px)" } : {}) }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: EASE_APPLE }}
    >
      {children}
    </Tag>
  );
}
