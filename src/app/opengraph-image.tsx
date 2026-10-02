import { ImageResponse } from "next/og";
import { logoSvg } from "@/components/Logo";

export const alt = "NXU — NEXT YOU. Your Next Version.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Substitua por uma foto editorial (public/og.jpg + metadata) quando a sessão de fotos estiver pronta.
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 6 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="NXU"
            width={84}
            height={30}
            src={`data:image/svg+xml;base64,${Buffer.from(logoSvg("#fff")).toString("base64")}`}
          />
          <span style={{ color: "#777" }}>COMING SOON</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 120, lineHeight: 0.92, letterSpacing: -6 }}>
          <span>YOUR NEXT</span>
          <span>VERSION.</span>
        </div>
        <div style={{ fontSize: 20, letterSpacing: 10, color: "#777" }}>NXU — NEXT YOU</div>
      </div>
    ),
    size,
  );
}
