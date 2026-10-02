import Link from "next/link";
import { redirect } from "next/navigation";
import { createSessionClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  formatDate,
  formatPhone,
  isAdmin,
  parseFilters,
  toSearchParams,
  waitlistQuery,
  type WaitlistRow,
} from "@/lib/admin-query";
import { signOut } from "../actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type Breakdown = { label: string; total: number }[];
type Stats = {
  total: number;
  today: number;
  last_7: number;
  by_source: Breakdown;
  by_utm_source: Breakdown;
  by_utm_campaign: Breakdown;
};

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
  const rows = (listRes.data as WaitlistRow[] | null) ?? [];
  const filteredTotal = listRes.count ?? 0;
  const pages = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const qs = toSearchParams(filters);
  const pageHref = (p: number) => {
    const x = new URLSearchParams(qs);
    if (p > 1) x.set("page", String(p));
    return `/admin/waitlist${x.size ? `?${x}` : ""}`;
  };
  const hasFilters = qs.size > 0;

  return (
    <main className="admin-main">
      <header className="admin-top">
        <div className="admin-brand">
          <strong>NXU</strong> <span>Waitlist</span>
        </div>
        <div className="admin-top__right">
          <span className="admin-muted">{user.email}</span>
          <form action={signOut}>
            <button className="admin-btn">Sair</button>
          </form>
        </div>
      </header>

      <section className="admin-kpis">
        <Kpi label="Total de cadastrados" value={stats.total} />
        <Kpi label="Cadastros hoje" value={stats.today} />
        <Kpi label="Últimos 7 dias" value={stats.last_7} />
      </section>

      <section className="admin-breakdowns">
        <BreakdownList title="Origem dos leads" data={stats.by_source} param="source" />
        <BreakdownList title="UTM Source" data={stats.by_utm_source} param="utm_source" />
        <BreakdownList title="UTM Campaign" data={stats.by_utm_campaign} param="utm_campaign" />
      </section>

      <form className="admin-filters" method="get">
        <input name="q" placeholder="Buscar nome ou telefone" defaultValue={filters.q} />
        <select name="source" defaultValue={filters.source ?? ""}>
          <option value="">Toda origem</option>
          {stats.by_source.map((b) => (
            <option key={b.label} value={b.label}>
              {b.label}
            </option>
          ))}
        </select>
        <select name="utm_source" defaultValue={filters.utm_source ?? ""}>
          <option value="">Todo utm_source</option>
          {stats.by_utm_source.map((b) => (
            <option key={b.label} value={b.label}>
              {b.label}
            </option>
          ))}
        </select>
        <select name="utm_campaign" defaultValue={filters.utm_campaign ?? ""}>
          <option value="">Toda utm_campaign</option>
          {stats.by_utm_campaign.map((b) => (
            <option key={b.label} value={b.label}>
              {b.label}
            </option>
          ))}
        </select>
        <label className="admin-date">
          De <input type="date" name="from" defaultValue={filters.from} />
        </label>
        <label className="admin-date">
          Até <input type="date" name="to" defaultValue={filters.to} />
        </label>
        <button className="admin-btn admin-btn--primary">Filtrar</button>
        {hasFilters ? (
          <Link className="admin-btn" href="/admin/waitlist">
            Limpar
          </Link>
        ) : null}
        <a className="admin-btn" href={`/admin/waitlist/export${qs.size ? `?${qs}` : ""}`}>
          Exportar CSV
        </a>
      </form>

      <p className="admin-muted admin-count">
        {filteredTotal.toLocaleString("pt-BR")} {filteredTotal === 1 ? "resultado" : "resultados"}
        {listRes.error ? ` · erro: ${listRes.error.message}` : ""}
      </p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Data/hora</th>
              <th>Nome</th>
              <th>WhatsApp</th>
              <th>Origem</th>
              <th>UTM Source</th>
              <th>UTM Campaign</th>
              <th>Dispositivo</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-empty">
                  Nenhum cadastro encontrado.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td className="admin-nowrap">{formatDate(r.created_at)}</td>
                  <td>{r.name}</td>
                  <td className="admin-nowrap">
                    <a href={`https://wa.me/${r.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                      {formatPhone(r.phone)}
                    </a>
                  </td>
                  <td>{r.source ?? "—"}</td>
                  <td>{r.utm_source ?? "—"}</td>
                  <td>{r.utm_campaign ?? "—"}</td>
                  <td>{r.device_type ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 ? (
        <nav className="admin-pager" aria-label="Paginação">
          {page > 1 ? <Link href={pageHref(page - 1)}>← Anterior</Link> : <span />}
          <span className="admin-muted">
            Página {page} de {pages}
          </span>
          {page < pages ? <Link href={pageHref(page + 1)}>Próxima →</Link> : <span />}
        </nav>
      ) : null}
    </main>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="admin-kpi">
      <span className="admin-muted">{label}</span>
      <strong>{Number(value).toLocaleString("pt-BR")}</strong>
    </div>
  );
}

function BreakdownList({ title, data, param }: { title: string; data: Breakdown; param: string }) {
  const max = Math.max(1, ...data.map((d) => Number(d.total)));
  return (
    <div className="admin-breakdown">
      <h2>{title}</h2>
      {data.length === 0 ? (
        <p className="admin-muted">Sem dados.</p>
      ) : (
        <ul>
          {data.map((d) => (
            <li key={d.label}>
              <Link href={`/admin/waitlist?${new URLSearchParams({ [param]: d.label })}`}>
                <span className="admin-breakdown__label">{d.label}</span>
                <span className="admin-breakdown__value">{Number(d.total).toLocaleString("pt-BR")}</span>
                <span className="admin-breakdown__bar" style={{ width: `${(Number(d.total) / max) * 100}%` }} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
