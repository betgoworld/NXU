"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { site } from "@/config/site";
import { track } from "@/lib/analytics";
import { deviceType, getAttribution } from "@/lib/attribution";
import { isValidName, maskBrPhone, normalizeBrPhone } from "@/lib/phone";
import { ArrowButton } from "./ArrowButton";
import { Countdown } from "./Countdown";
import { EASE, Reveal } from "./Reveal";
import { WAITLIST_ID } from "./scroll";

type Status = "idle" | "loading" | "success";
type Errors = { name?: string; phone?: string; form?: string };

const ERRORS: Record<string, string> = {
  invalid_name: "Digite seu nome.",
  invalid_phone: "Confira o número de WhatsApp.",
  rate_limited: "Muitas tentativas. Tente novamente em alguns minutos.",
  default: "Não foi possível concluir agora. Tente novamente.",
};

export function Waitlist({ count }: { count: number | null }) {
  const sectionRef = useRef<HTMLElement>(null);
  const openedAt = useRef<number>(0);
  const phoneStarted = useRef(false);
  const [status, setStatus] = useState<Status>("idle");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    openedAt.current = Date.now();
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          track("waitlist_view");
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;

    const next: Errors = {};
    if (!isValidName(name)) next.name = ERRORS.invalid_name;
    if (!normalizeBrPhone(phone)) next.phone = ERRORS.invalid_phone;
    setErrors(next);
    if (next.name || next.phone) return;

    track("waitlist_submit");
    setStatus("loading");

    const a = getAttribution();
    const honeypot = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value || "";

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          website: honeypot,
          elapsed: Date.now() - openedAt.current,
          ...a,
          device_type: deviceType(),
          landing_variant: site.landingVariant,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        const code = json.error as string;
        setErrors(
          code === "invalid_name"
            ? { name: ERRORS.invalid_name }
            : code === "invalid_phone"
              ? { phone: ERRORS.invalid_phone }
              : { form: ERRORS[code] || ERRORS.default },
        );
        setStatus("idle");
        return;
      }
      track("waitlist_success", { utm_source: a.utm_source, utm_campaign: a.utm_campaign });
      setStatus("success");
    } catch {
      setErrors({ form: ERRORS.default });
      setStatus("idle");
    }
  }

  const waHref = site.whatsappNumber
    ? `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(site.whatsappMessage)}`
    : null;

  return (
    <section ref={sectionRef} id={WAITLIST_ID} className="section section--dark waitlist" aria-labelledby="waitlist-title">
      <div className="waitlist__inner">
        <AnimatePresence mode="wait" initial={false}>
          {status !== "success" ? (
            <m.div
              key="form"
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: EASE }}
              style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              <Reveal as="p" className="eyebrow waitlist__eyebrow">
                Be first.
              </Reveal>
              <Reveal as="h2" className="title" delay={0.1}>
                <span id="waitlist-title">
                  <span className="line">Conheça a NXU</span>
                  <span className="line">antes de todo mundo.</span>
                </span>
              </Reveal>
              <Reveal as="p" className="waitlist__sub" delay={0.2}>
                Entre para a lista privada de lançamento e receba o acesso antes da abertura oficial.
              </Reveal>

              {count !== null ? (
                <p className="waitlist__count">
                  <strong>{count.toLocaleString("pt-BR")}</strong> pessoas já estão esperando.
                </p>
              ) : null}

              {site.countdown.enabled ? <Countdown launchDate={site.countdown.launchDate} /> : null}

              <Reveal className="form-wrap" delay={0.3} amount={0.2}>
                <form className="form" onSubmit={onSubmit} noValidate>
                  <div className="field" data-invalid={!!errors.name}>
                    <label htmlFor="wl-name" className="sr-only">
                      Seu nome
                    </label>
                    <input
                      id="wl-name"
                      name="name"
                      type="text"
                      placeholder="Seu nome"
                      autoComplete="given-name"
                      autoCapitalize="words"
                      enterKeyHint="next"
                      maxLength={80}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((x) => ({ ...x, name: undefined }));
                      }}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "wl-name-err" : undefined}
                      required
                    />
                  </div>
                  {errors.name ? (
                    <p id="wl-name-err" className="form__error" role="alert">
                      {errors.name}
                    </p>
                  ) : null}

                  <div className="field" data-invalid={!!errors.phone}>
                    <span className="field__prefix" aria-hidden="true">
                      <span>🇧🇷</span> +55
                    </span>
                    <label htmlFor="wl-phone" className="sr-only">
                      WhatsApp (com DDD)
                    </label>
                    <input
                      id="wl-phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="(00) 00000-0000"
                      autoComplete="tel-national"
                      enterKeyHint="send"
                      value={phone}
                      onChange={(e) => {
                        if (!phoneStarted.current) {
                          phoneStarted.current = true;
                          track("whatsapp_input_started");
                        }
                        // Aceita colagem com +55
                        const digits = e.target.value.replace(/\D/g, "");
                        const local = digits.length > 11 && digits.startsWith("55") ? digits.slice(2) : digits;
                        setPhone(maskBrPhone(local));
                        if (errors.phone) setErrors((x) => ({ ...x, phone: undefined }));
                      }}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? "wl-phone-err" : undefined}
                      required
                    />
                  </div>
                  {errors.phone ? (
                    <p id="wl-phone-err" className="form__error" role="alert">
                      {errors.phone}
                    </p>
                  ) : null}

                  {/* honeypot anti-spam */}
                  <div className="hp" aria-hidden="true">
                    <label htmlFor="wl-website">Website</label>
                    <input id="wl-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                  </div>

                  {errors.form ? (
                    <p className="form__error" role="alert" style={{ textAlign: "center" }}>
                      {errors.form}
                    </p>
                  ) : null}

                  <ArrowButton type="submit" variant="light" block className="form__submit" disabled={status === "loading"}>
                    {status === "loading" ? "Entrando…" : "Quero acesso antecipado"}
                  </ArrowButton>

                  <p className="form__note">Sem spam. Apenas o que realmente importa sobre o lançamento.</p>

                  <p className="form__consent">
                    Ao se cadastrar, você concorda em receber comunicações da NXU pelo WhatsApp sobre o lançamento.
                    Você pode pedir para parar a qualquer momento respondendo “SAIR”. Seus dados são tratados conforme a
                    LGPD e a nossa{" "}
                    <a href="/privacidade" className="link link--underlined">
                      Política de Privacidade
                    </a>
                    .
                  </p>
                </form>
              </Reveal>
            </m.div>
          ) : (
            <m.div
              key="success"
              className="success"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
              role="status"
              aria-live="polite"
            >
              <m.span
                className="success__check"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
                aria-hidden="true"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <m.path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
                  />
                </svg>
              </m.span>
              <h2 className="title" id="waitlist-title">
                Você está dentro.
              </h2>
              <p className="success__text">Quando chegar a hora, você vai saber primeiro.</p>

              <span className="signature success__signature">
                <span className="signature__mark">NXU</span>
                <span className="signature__sub">Next You</span>
              </span>

              <div className="success__actions">
                <ArrowButton
                  href={site.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="light"
                  block
                  onClick={() => track("instagram_click", { location: "success" })}
                >
                  Seguir a NXU no Instagram
                </ArrowButton>
                {waHref ? (
                  <ArrowButton
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="ghost-light"
                    block
                    onClick={() => track("whatsapp_confirmation_click")}
                  >
                    Receber confirmação no WhatsApp
                  </ArrowButton>
                ) : null}
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
