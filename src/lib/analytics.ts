"use client";

export type AnalyticsEvent =
  | "page_view"
  | "hero_cta_click"
  | "waitlist_view"
  | "whatsapp_input_started"
  | "waitlist_submit"
  | "waitlist_success"
  | "instagram_click"
  | "whatsapp_confirmation_click";

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (event: string, params?: Params) => void };
  }
}

/**
 * Dispara um evento para qualquer ferramenta instalada (GTM/dataLayer, gtag, Meta Pixel, TikTok).
 * Nunca envia nome ou telefone — apenas metadados do evento.
 */
export function track(event: AnalyticsEvent, params: Params = {}) {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...params });
    window.gtag?.("event", event, params);
    if (event === "waitlist_success") {
      window.fbq?.("track", "Lead", params);
      window.ttq?.track("SubmitForm", params);
    }
    if (process.env.NODE_ENV !== "production") console.debug("[track]", event, params);
  } catch {
    /* analytics nunca deve quebrar a página */
  }
}
