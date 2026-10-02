"use client";

export const WAITLIST_ID = "acesso";

export function scrollToWaitlist() {
  const el = document.getElementById(WAITLIST_ID);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  // Foco no primeiro campo após a rolagem, sem saltar a página.
  window.setTimeout(() => el.querySelector<HTMLInputElement>("input[name='name']")?.focus({ preventScroll: true }), reduce ? 0 : 900);
}
