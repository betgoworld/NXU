import { waitlistCountConfig } from "@/config/site";
import { createAnonClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { MotionProvider } from "@/components/MotionProvider";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Manifesto } from "@/components/Manifesto";
import { ProductReveal } from "@/components/ProductReveal";
import { Details } from "@/components/Details";
import { Statement } from "@/components/Statement";
import { Waitlist } from "@/components/Waitlist";
import { Footer } from "@/components/Footer";
import { Cursor } from "@/components/Cursor";
import { PageTracker } from "@/components/PageTracker";
import { PrivacyProvider } from "@/components/PrivacySheet";

// Página estática, revalidada a cada 5 min (apenas para a contagem opcional).
export const revalidate = 300;

/**
 * Prova social: só aparece quando SHOW_WAITLIST_COUNT=true E o número REAL de cadastros
 * atinge WAITLIST_COUNT_MIN. O offset existe apenas para somar cadastros reais
 * coletados fora deste banco (ou descontar testes) — nunca para inflar a contagem.
 */
async function getWaitlistCount(): Promise<number | null> {
  const cfg = waitlistCountConfig();
  if (!cfg.show_waitlist_count || !isSupabaseConfigured()) return null;
  try {
    const { data, error } = await createAnonClient().rpc("nxu_waitlist_count");
    if (error || typeof data !== "number") return null;
    const total = data + cfg.waitlist_count_offset;
    return data >= cfg.min && total > 0 ? total : null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const count = await getWaitlistCount();
  return (
    <MotionProvider>
      <PrivacyProvider>
        <PageTracker />
        <Header />
        <main>
          <Hero />
          <Manifesto />
          <ProductReveal />
          <Details />
          <Statement />
          <Waitlist count={count} />
        </main>
        <Footer />
        <Cursor />
      </PrivacyProvider>
    </MotionProvider>
  );
}
