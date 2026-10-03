"use client";

import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={`admin-btn${copied ? " is-done" : ""}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard indisponível */
        }
      }}
      aria-live="polite"
    >
      {copied ? "Copiado ✓" : "Copiar"}
    </button>
  );
}
