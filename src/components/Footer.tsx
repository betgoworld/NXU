"use client";

import { site } from "@/config/site";
import { track } from "@/lib/analytics";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__brand">
        <strong>NXU</strong>
        <span>Next You</span>
      </div>
      <nav className="footer__links" aria-label="Rodapé">
        <a
          href={site.instagramUrl}
          className="link"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("instagram_click", { location: "footer" })}
        >
          Instagram
        </a>
        <a href="/privacidade" className="link">
          Privacidade
        </a>
      </nav>
      <div className="footer__copy">© 2026 NXU</div>
    </footer>
  );
}
