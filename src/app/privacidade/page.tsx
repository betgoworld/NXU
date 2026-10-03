import type { Metadata } from "next";
import Link from "next/link";
import { PRIVACY_UPDATED, PrivacyContent } from "@/components/PrivacyContent";

export const metadata: Metadata = {
  title: "Política de Privacidade | NXU — NEXT YOU",
  description: "Como a NXU coleta, usa e protege seus dados na lista de acesso antecipado.",
  alternates: { canonical: "/privacidade" },
};

export default function Privacidade() {
  return (
    <main className="prose">
      <p className="eyebrow muted">
        <Link href="/" className="link">
          ← NXU
        </Link>
      </p>
      <h1 className="title">Política de Privacidade</h1>
      <p className="muted">{PRIVACY_UPDATED}</p>
      <PrivacyContent />
    </main>
  );
}
