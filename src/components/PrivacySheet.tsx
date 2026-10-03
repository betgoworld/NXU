"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useDragControls, type PanInfo } from "framer-motion";
import { PRIVACY_UPDATED, PrivacyContent } from "./PrivacyContent";

const Ctx = createContext<() => void>(() => {});

/** Abre a Política de Privacidade como bottom sheet. */
export const useOpenPrivacy = () => useContext(Ctx);

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openSheet = useCallback(() => setOpen(true), []);
  return (
    <Ctx.Provider value={openSheet}>
      {children}
      <PrivacySheet open={open} onClose={() => setOpen(false)} />
    </Ctx.Provider>
  );
}

/** Celular/tablet abrem o modal; desktop (ponteiro fino e tela larga) vai para a página. */
const isDesktop = () => window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)").matches;

/**
 * Link para /privacidade. No celular abre o modal; no desktop abre a página.
 * Sem JavaScript, ou com Ctrl/Cmd+clique, sempre abre a página.
 */
export function PrivacyLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const openSheet = useOpenPrivacy();
  return (
    <a
      href="/privacidade"
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || isDesktop()) return;
        e.preventDefault();
        openSheet();
      }}
    >
      {children}
    </a>
  );
}

const SPRING = { type: "spring", stiffness: 380, damping: 38, mass: 0.9 } as const;

function PrivacySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const drag = useDragControls();
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  // Trava o scroll da página, Esc fecha, foco entra e volta para quem abriu.
  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 50);
    return () => {
      html.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
      returnFocus.current?.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose();
  };

  // Mantém o Tab dentro do modal.
  const trap = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const items = e.currentTarget.querySelectorAll<HTMLElement>("a[href], button, [tabindex]:not([tabindex='-1'])");
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <div className="sheet-root" key="privacy">
          <m.div
            className="sheet-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.28, 0.11, 0.32, 1] }}
            aria-hidden="true"
          />
          <m.div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-title"
            onKeyDown={trap}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={SPRING}
            drag="y"
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.9 }}
            onDragEnd={onDragEnd}
          >
            <div className="sheet__head" onPointerDown={(e) => drag.start(e)}>
              <span className="sheet__grabber" aria-hidden="true" />
              <div className="sheet__titlebar">
                <div>
                  <p className="eyebrow muted sheet__eyebrow">NXU — Next You</p>
                  <h2 id="privacy-title" className="sheet__title">
                    Política de Privacidade
                  </h2>
                </div>
                <button ref={closeRef} type="button" className="sheet__close" onClick={onClose} aria-label="Fechar">
                  <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
                    <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="sheet__body prose-sheet">
              <p className="muted">{PRIVACY_UPDATED}</p>
              <PrivacyContent />
              <button type="button" className="btn btn--block sheet__done" onClick={onClose}>
                <span className="btn__label">Entendi</span>
              </button>
            </div>
          </m.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
