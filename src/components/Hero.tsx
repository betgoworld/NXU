"use client";

import { useRef } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { track } from "@/lib/analytics";
import { ArrowButton } from "./ArrowButton";
import { EASE_APPLE } from "./Reveal";
import { scrollToWaitlist } from "./scroll";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Ao rolar, o conteúdo recua e se dissolve (como as aberturas de produto da Apple).
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const enter = (delay: number, dy = 20) => ({
    initial: { opacity: 0, y: dy, ...(reduce ? {} : { filter: "blur(12px)" }) },
    animate: { opacity: 1, y: 0, ...(reduce ? {} : { filter: "blur(0px)" }) },
    transition: { duration: 1.2, delay, ease: EASE_APPLE },
  });

  return (
    <section ref={ref} className="hero" id="top" aria-labelledby="hero-title">
      <m.div className="hero__inner" style={reduce ? undefined : { scale, opacity, y }}>
        <m.p className="eyebrow hero__eyebrow" data-reveal {...enter(0.25, 10)}>
          A new fitness experience
        </m.p>

        <h1 id="hero-title" className="display">
          <m.span className="line" data-reveal {...enter(0.45, 28)}>
            Não criamos
          </m.span>
          <m.span className="line" data-reveal {...enter(0.62, 28)}>
            para quem você é hoje.
          </m.span>
        </h1>

        <m.p className="lead hero__second" data-reveal {...enter(1.7, 14)}>
          Criamos para quem você está se tornando.
        </m.p>

        <m.p className="hero__signature" data-reveal {...enter(2.4, 0)}>
          NXU — Next You
        </m.p>

        <m.div className="hero__cta" data-reveal {...enter(2.7, 12)}>
          <ArrowButton
            onClick={() => {
              track("hero_cta_click", { location: "hero" });
              scrollToWaitlist();
            }}
          >
            Quero acesso antecipado
          </ArrowButton>
          <p className="hero__note">Seja uma das primeiras a conhecer a NXU.</p>
        </m.div>
      </m.div>
    </section>
  );
}
