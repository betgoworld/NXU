import type { SupabaseClient } from "@supabase/supabase-js";

export type WaitlistFilters = {
  q?: string;
  source?: string;
  utm_source?: string;
  utm_campaign?: string;
  from?: string; // YYYY-MM-DD (horário de Brasília)
  to?: string;
};

export const WAITLIST_COLUMNS =
  "id,name,phone,country_code,source,utm_source,utm_medium,utm_campaign,utm_content,utm_term,landing_variant,device_type,referrer,created_at";

export type WaitlistRow = {
  id: string;
  name: string;
  phone: string;
  country_code: string;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  landing_variant: string | null;
  device_type: string | null;
  referrer: string | null;
  created_at: string;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim().slice(0, 120) || undefined;

export function parseFilters(sp: Record<string, string | string[] | undefined>): WaitlistFilters {
  const from = one(sp.from);
  const to = one(sp.to);
  return {
    q: one(sp.q),
    source: one(sp.source),
    utm_source: one(sp.utm_source),
    utm_campaign: one(sp.utm_campaign),
    from: from && DATE.test(from) ? from : undefined,
    to: to && DATE.test(to) ? to : undefined,
  };
}

export function toSearchParams(f: WaitlistFilters) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) if (v) p.set(k, v);
  return p;
}

/** Query filtrada da waitlist. A RLS garante que só admins recebem linhas. */
export function waitlistQuery(supabase: SupabaseClient, f: WaitlistFilters, withCount = false) {
  let q = supabase.from("nxu_waitlist").select(WAITLIST_COLUMNS, withCount ? { count: "exact" } : undefined);
  if (f.q) {
    const safe = f.q.replace(/[,()*%\\:"'.]/g, " ").trim();
    const digits = f.q.replace(/\D/g, "");
    const parts: string[] = [];
    if (safe) parts.push(`name.ilike.*${safe}*`);
    if (digits.length >= 3) parts.push(`phone.ilike.*${digits}*`);
    if (parts.length) q = q.or(parts.join(","));
  }
  for (const col of ["source", "utm_source", "utm_campaign"] as const) {
    const v = f[col];
    if (v) q = v === "—" ? q.is(col, null) : q.eq(col, v);
  }
  if (f.from) q = q.gte("created_at", `${f.from}T00:00:00-03:00`);
  if (f.to) {
    const end = new Date(`${f.to}T00:00:00-03:00`);
    end.setUTCDate(end.getUTCDate() + 1);
    q = q.lt("created_at", end.toISOString());
  }
  return q.order("created_at", { ascending: false });
}

export async function isAdmin(supabase: SupabaseClient) {
  const { data } = await supabase.rpc("nxu_is_admin");
  return data === true;
}

export function formatPhone(e164: string) {
  const m = e164.match(/^\+55(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `+55 (${m[1]}) ${m[2]}-${m[3]}` : e164;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
