import { redirect } from "next/navigation";
import { createSessionClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { isAdmin, parseFilters, waitlistQuery, type WaitlistRow } from "@/lib/admin-query";
import { signOut } from "../actions";
import { Dashboard, type Stats } from "./Dashboard";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;


export default async function AdminWaitlist({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!isSupabaseConfigured()) {
    return <main className="admin-main">Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.</main>;
  }

  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  if (!(await isAdmin(supabase))) {
    return (
      <main className="admin-main admin-denied">
        <p>
          A conta <strong>{user.email}</strong> não tem acesso a este painel.
        </p>
        <form action={signOut}>
          <button className="admin-btn">Sair</button>
        </form>
      </main>
    );
  }

  const sp = await searchParams;
  const filters = parseFilters(sp);
  const page = Math.max(1, Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1);
  const fromRow = (page - 1) * PAGE_SIZE;

  const [statsRes, listRes] = await Promise.all([
    supabase.rpc("nxu_admin_stats"),
    waitlistQuery(supabase, filters, true).range(fromRow, fromRow + PAGE_SIZE - 1),
  ]);

  const stats = (statsRes.data as Stats | null) ?? {
    total: 0,
    today: 0,
    last_7: 0,
    by_source: [],
    by_utm_source: [],
    by_utm_campaign: [],
  };
  const filteredTotal = listRes.count ?? 0;

  return (
    <Dashboard
      email={user.email ?? ""}
      stats={stats}
      rows={(listRes.data as WaitlistRow[] | null) ?? []}
      filters={filters}
      page={page}
      pages={Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE))}
      filteredTotal={filteredTotal}
      error={listRes.error?.message}
    />
  );
}
