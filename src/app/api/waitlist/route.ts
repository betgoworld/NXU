import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { createAnonClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { normalizeBrPhone, isValidName, BR_COUNTRY_CODE } from "@/lib/phone";
import { deriveSource } from "@/lib/source";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  name?: unknown;
  phone?: unknown;
  website?: unknown; // honeypot
  elapsed?: unknown; // ms entre abrir o formulário e enviar
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  utm_content?: unknown;
  utm_term?: unknown;
  referrer?: unknown;
  device_type?: unknown;
  landing_variant?: unknown;
};

const str = (v: unknown, max = 200) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

// Limitador em memória (best-effort, por instância). O limite real fica no banco.
const hits = new Map<string, number[]>();
function locallyLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 6;
}

const ok = () => NextResponse.json({ ok: true });
const fail = (status: number, error: string) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: NextRequest) {
  // Mesma origem apenas.
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (origin) {
    try {
      if (new URL(origin).host !== host) return fail(403, "forbidden");
    } catch {
      return fail(403, "forbidden");
    }
  }

  if (Number(req.headers.get("content-length") || 0) > 4000) return fail(413, "too_large");

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return fail(400, "invalid");
  }

  // Bots: honeypot preenchido ou envio rápido demais → resposta de sucesso silenciosa.
  if (str(body.website) || (typeof body.elapsed === "number" && body.elapsed < 1500)) return ok();

  const name = str(body.name, 80);
  const phone = typeof body.phone === "string" ? normalizeBrPhone(body.phone) : null;
  if (!name || !isValidName(name)) return fail(422, "invalid_name");
  if (!phone) return fail(422, "invalid_phone");

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  const ipHash = createHash("sha256").update(`${process.env.RATE_LIMIT_SALT || "nxu"}:${ip}`).digest("hex");
  if (locallyLimited(ipHash)) return fail(429, "rate_limited");

  if (!isSupabaseConfigured() || !process.env.WAITLIST_API_SECRET) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[waitlist] Supabase não configurado — cadastro simulado:", { name, phone });
      return ok();
    }
    return fail(503, "unavailable");
  }

  const utm_source = str(body.utm_source);
  const referrer = str(body.referrer, 500);
  const { data, error } = await createAnonClient().rpc("nxu_join_waitlist", {
    p_secret: process.env.WAITLIST_API_SECRET,
    p_ip_hash: ipHash,
    p_name: name,
    p_phone: phone,
    p_country_code: BR_COUNTRY_CODE,
    p_source: deriveSource(utm_source, referrer),
    p_utm_source: utm_source,
    p_utm_medium: str(body.utm_medium),
    p_utm_campaign: str(body.utm_campaign),
    p_utm_content: str(body.utm_content),
    p_utm_term: str(body.utm_term),
    p_landing_variant: str(body.landing_variant, 40),
    p_device_type: str(body.device_type, 20) || "unknown",
    p_referrer: referrer,
  });

  if (error) {
    console.error("[waitlist] rpc error", error.message);
    return fail(500, "server_error");
  }

  switch (data) {
    case "created":
    case "exists": // não revelamos se o número já estava cadastrado
      return ok();
    case "rate_limited":
      return fail(429, "rate_limited");
    case "invalid":
      return fail(422, "invalid");
    default:
      console.error("[waitlist] unexpected rpc result", data);
      return fail(500, "server_error");
  }
}
