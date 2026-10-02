"use client";

import { m } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1] as const;

type Props = {
  children: React.ReactNode;
  as?: "div" | "p" | "span" | "h2" | "h3" | "figure";
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
  amount?: number;
};

/** Fade + translateY sutil quando entra na viewport. Uma única vez. */
export function Reveal({ children, as = "div", delay = 0, y = 20, duration = 0.9, className, amount = 0.4 }: Props) {
  const Tag = m[as];
  return (
    <Tag
      className={className}
      data-reveal
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}
