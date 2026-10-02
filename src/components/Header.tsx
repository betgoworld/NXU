"use client";

import { useEffect, useState } from "react";
import { m } from "framer-motion";
import { track } from "@/lib/analytics";
import { scrollToWaitlist, WAITLIST_ID } from "./scroll";
import { EASE } from "./Reveal";
import { Logo } from "./Logo";

/** Verifica se há uma área escura (data-tone="dark") atrás do header. */
function useOnDark() {
  const [onDark, setOnDark] = useState(false);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const y = 36; // meio do header
      const dark = Array.from(document.querySelectorAll<HTMLElement>("[data-tone='dark']")).some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= y && r.bottom > y;
      });
      setOnDark(dark);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return onDark;
}

export function Header() {
  const onDark = useOnDark();
  return (
    <m.header
      className={`header${onDark ? " header--on-dark" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: EASE }}
    >
      <a href="#top" className="brand" aria-label="NXU — Next You, início">
        <Logo className="brand__mark" title={null} />
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
