import { NextResponse, type NextRequest } from "next/server";
import { createSessionClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { isAdmin, parseFilters, waitlistQuery, type WaitlistRow } from "@/lib/admin-query";

export const dynamic = "force-dynamic";

const HEADERS: (keyof WaitlistRow)[] = [
  "created_at",
  "name",
  "phone",
  "country_code",
  "source",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "landing_variant",
  "device_type",
  "referrer",
];

/** Escapa para CSV e neutraliza injeção de fórmula em planilhas (=, +, -, @). */
function cell(v: unknown, key: keyof WaitlistRow) {
  let s = v == null ? "" : String(v);
  if (key !== "phone" && key !== "country_code" && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) return new NextResponse("Not configured", { status: 503 });
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(supabase))) return new NextResponse("Unauthorized", { status: 401 });

  const filters = parseFilters(Object.fromEntries(req.nextUrl.searchParams));
  const lines = [HEADERS.join(";")];
  const BATCH = 1000;

  for (let from = 0; ; from += BATCH) {
    const { data, error } = await waitlistQuery(supabase, filters).range(from, from + BATCH - 1);
    if (error) return new NextResponse(error.message, { status: 500 });
    const rows = (data as WaitlistRow[] | null) ?? [];
    for (const r of rows) lines.push(HEADERS.map((h) => cell(r[h], h)).join(";"));
    if (rows.length < BATCH) break;
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nxu-waitlist-${stamp}.csv"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
