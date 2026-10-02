"use client";

import { m } from "framer-motion";
import { track } from "@/lib/analytics";
import { ArrowButton } from "./ArrowButton";
import { EASE } from "./Reveal";
import { scrollToWaitlist } from "./scroll";

const enter = (delay: number, y = 20) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: EASE },
});

export function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__inner">
        <m.p className="eyebrow hero__eyebrow" data-reveal {...enter(0.25, 10)}>
          A new fitness experience
        </m.p>

        <h1 id="hero-title" className="display">
          <m.span className="line" data-reveal {...enter(0.45)}>
            Não criamos
          </m.span>
          <m.span className="line" data-reveal {...enter(0.6)}>
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
      </div>
    </section>
  );
}
