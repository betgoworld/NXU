"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";
import { track } from "@/lib/analytics";

export function PageTracker() {
  useEffect(() => {
    const a = captureAttribution();
    track("page_view", { utm_source: a.utm_source, utm_campaign: a.utm_campaign });
  }, []);
  return null;
}
