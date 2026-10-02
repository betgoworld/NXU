"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

function parts(target: number, now: number) {
  const s = Math.max(0, Math.floor((target - now) / 1000));
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
}

/** Ativado apenas via NEXT_PUBLIC_COUNTDOWN_ENABLED + NEXT_PUBLIC_LAUNCH_DATE. */
export function Countdown({ launchDate }: { launchDate: string }) {
  const target = Date.parse(launchDate);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (Number.isNaN(target) || (now !== null && now >= target)) return null;
  const [d, h, mi, s] = now === null ? [0, 0, 0, 0] : parts(target, now);

  return (
    <div className="countdown" role="timer" aria-label="Contagem regressiva para o lançamento">
      <p className="eyebrow countdown__label">The next you begins in</p>
      <div className="countdown__value" aria-hidden={now === null}>
        {pad(d)}
        <span>:</span>
        {pad(h)}
        <span>:</span>
        {pad(mi)}
        <span>:</span>
        {pad(s)}
      </div>
      <div className="countdown__units">DAYS / HOURS / MIN / SEC</div>
    </div>
  );
}
