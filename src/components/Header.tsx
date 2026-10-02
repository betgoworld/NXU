"use client";

import { m } from "framer-motion";
import { track } from "@/lib/analytics";
import { scrollToWaitlist, WAITLIST_ID } from "./scroll";
import { EASE } from "./Reveal";

export function Header() {
  return (
    <m.header
      className="header"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: EASE }}
    >
      <a href="#top" className="brand" aria-label="NXU — Next You, início">
        <span className="brand__mark">NXU</span>
        <span className="brand__sub">Next You</span>
      </a>
      <a
        href={`#${WAITLIST_ID}`}
        className="header__cta"
        data-cursor="join"
        onClick={(e) => {
          e.preventDefault();
          track("hero_cta_click", { location: "header" });
          scrollToWaitlist();
        }}
      >
        <span className="btn__label">
          <span className="only-desktop">Acesso antecipado</span>
          <span className="only-mobile">Entrar</span>
        </span>
        <span className="btn__arrow" aria-hidden="true">
          →
        </span>
      </a>
    </m.header>
  );
}
