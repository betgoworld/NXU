/**
 * Configuração central da landing NXU.
 * Tudo que muda entre pré-lançamento e lançamento fica aqui (via variáveis de ambiente).
 */
const bool = (v: string | undefined) => v === "true" || v === "1";

export const site = {
  name: "NXU — NEXT YOU",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/",
  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, ""),
  whatsappMessage: "Quero fazer parte do lançamento da NXU — NEXT YOU.",
  landingVariant: process.env.NEXT_PUBLIC_LANDING_VARIANT || "a",
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || "",

  /** Contador regressivo — desativado até existir data oficial. */
  countdown: {
    enabled: bool(process.env.NEXT_PUBLIC_COUNTDOWN_ENABLED) && !!process.env.NEXT_PUBLIC_LAUNCH_DATE,
    launchDate: process.env.NEXT_PUBLIC_LAUNCH_DATE || "",
  },
} as const;

/** Configuração de prova social — lida apenas no servidor. */
export function waitlistCountConfig() {
  return {
    show_waitlist_count: bool(process.env.SHOW_WAITLIST_COUNT),
    min: Number(process.env.WAITLIST_COUNT_MIN ?? 500) || 0,
    waitlist_count_offset: Number(process.env.WAITLIST_COUNT_OFFSET ?? 0) || 0,
  };
}

/**
 * Imagens editoriais. Coloque os arquivos em /public/images (AVIF ou WebP)
 * e preencha `src`. Enquanto `src` for null, um placeholder neutro é exibido.
 */
export const images = {
  hero: {
    src: "/images/nxu-01.webp" as string | null,
    alt: "Modelo com top e calça flare rosa NXU sentada em uma arquibancada ao sol",
    width: 1086,
    height: 1448,
  },
  details: [
    {
      src: "/images/nxu-detail-tecido.webp" as string | null,
      alt: "Mão puxando o tecido verde-oliva da legging NXU, mostrando a elasticidade",
      width: 1086,
      height: 1448,
      label: "Tecido",
    },
    {
      src: "/images/nxu-detail-cos.webp" as string | null,
      alt: "Cós de cintura alta da legging NXU verde-oliva, com costura em V",
      width: 963,
      height: 1284,
      label: "Cós",
    },
    {
      src: "/images/nxu-detail-acabamento.webp" as string | null,
      alt: "Bolso lateral e costuras de acabamento da legging NXU verde-oliva",
      width: 1086,
      height: 1448,
      label: "Acabamento",
    },
  ],
};
