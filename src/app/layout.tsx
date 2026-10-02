import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";
import { site } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "NXU — NEXT YOU | Em breve",
  description:
    "A próxima geração de fitness wear está chegando. Conheça a NXU — NEXT YOU e tenha acesso antecipado ao lançamento.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "NXU — NEXT YOU",
    title: "Your Next Version.",
    description: "NXU — NEXT YOU. Coming soon.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Next Version.",
    description: "NXU — NEXT YOU. Coming soon.",
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F5F5F3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={GeistSans.variable}>
      <body>
        {/* Sem JavaScript, o conteúdo animado aparece normalmente. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {children}
        {site.gtmId ? (
          <Script id="gtm" strategy="lazyOnload">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${site.gtmId}');`}
          </Script>
        ) : null}
      </body>
    </html>
  );
}
