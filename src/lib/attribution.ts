"use client";

const KEY = "nxu_attribution";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_path?: string;
};

/**
 * Captura UTMs e referrer na primeira visita da sessão (first-touch)
 * e mantém em sessionStorage para não perder ao navegar por âncoras.
 */
export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  let stored: Attribution = {};
  try {
    stored = JSON.parse(sessionStorage.getItem(KEY) || "{}");
  } catch {}

  const params = new URLSearchParams(window.location.search);
  const fresh: Attribution = {};
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) fresh[k] = v.slice(0, 200);
  }

  const ref = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : "";
  const hasFreshUtm = Object.keys(fresh).length > 0;
  const next: Attribution = hasFreshUtm
    ? { ...fresh, referrer: ref || stored.referrer, landing_path: window.location.pathname }
    : { ...stored, referrer: stored.referrer || ref || undefined, landing_path: stored.landing_path || window.location.pathname };

  try {
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function deviceType(): "mobile" | "tablet" | "desktop" | "unknown" {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "tablet";
  if (/Mobi|iPhone|Android/i.test(ua)) return "mobile";
  return "desktop";
}
