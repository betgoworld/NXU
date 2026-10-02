"use client";

export const WAITLIST_ID = "acesso";

const easeInOutQuint = (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2);

/**
 * Rolagem com curva própria (acelera e desacelera de forma suave),
 * mais fluida e previsível que o `smooth` nativo. Interrompe se a pessoa rolar.
 */
export function smoothScrollTo(targetY: number, onDone?: () => void) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const startY = window.scrollY;
  const distance = targetY - startY;
  if (reduce || Math.abs(distance) < 2) {
    window.scrollTo({ top: targetY, behavior: "instant" });
    onDone?.();
    return;
  }

  const duration = Math.min(1600, Math.max(700, Math.abs(distance) * 0.35));
  const start = performance.now();
  let cancelled = false;
  const cancel = () => (cancelled = true);
  const opts = { passive: true, once: true } as const;
  window.addEventListener("wheel", cancel, opts);
  window.addEventListener("touchstart", cancel, opts);
  window.addEventListener("keydown", cancel, opts);

  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";

  const step = (now: number) => {
    if (cancelled) return finish();
    const t = Math.min(1, (now - start) / duration);
    window.scrollTo(0, startY + distance * easeInOutQuint(t));
    if (t < 1) requestAnimationFrame(step);
    else finish(true);
  };
  const finish = (completed = false) => {
    html.style.scrollBehavior = prev;
    window.removeEventListener("wheel", cancel);
    window.removeEventListener("touchstart", cancel);
    window.removeEventListener("keydown", cancel);
    if (completed) onDone?.();
  };
  requestAnimationFrame(step);
}

export function scrollToWaitlist() {
  const el = document.getElementById(WAITLIST_ID);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY;
  // Foco no primeiro campo só quando a rolagem termina, sem saltar a página.
  smoothScrollTo(y, () => el.querySelector<HTMLInputElement>("input[name='name']")?.focus({ preventScroll: true }));
}
