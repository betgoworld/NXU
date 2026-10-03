import Link from "next/link";
import { Logo } from "@/components/Logo";
import { formatDate, formatPhone, toSearchParams, type WaitlistFilters, type WaitlistRow } from "@/lib/admin-query";
import { signOut } from "../actions";
import { CopyButton } from "./CopyButton";

export type Breakdown = { label: string; total: number }[];
export type Stats = {
  total: number;
  today: number;
  last_7: number;
  by_source: Breakdown;
  by_utm_source: Breakdown;
  by_utm_campaign: Breakdown;
};

type Props = {
  email: string;
  stats: Stats;
  rows: WaitlistRow[];
  filters: WaitlistFilters;
  page: number;
  pages: number;
  filteredTotal: number;
  error?: string | null;
};

const BASE = "/admin/waitlist";

const FILTER_LABELS: Record<keyof WaitlistFilters, string> = {
  q: "Busca",
  source: "Origem",
  utm_source: "UTM Source",
  utm_campaign: "Campanha",
  from: "De",
  to: "Até",
};

const fmt = (n: number) => Number(n).toLocaleString("pt-BR");

function relative(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  if (diff < 172800) return "ontem";
  if (diff < 604800) return `há ${Math.floor(diff / 86400)} dias`;
  return formatDate(iso).split(",")[0];
}

const DEVICE: Record<string, string> = { mobile: "Celular", tablet: "Tablet", desktop: "Computador" };

export function Dashboard({ email, stats, rows, filters, page, pages, filteredTotal, error }: Props) {
  const qs = toSearchParams(filters);
  const href = (p: URLSearchParams) => `${BASE}${p.size ? `?${p}` : ""}`;
  const pageHref = (n: number) => {
    const x = new URLSearchParams(qs);
    if (n > 1) x.set("page", String(n));
    return href(x);
  };
  const without = (key: string) => {
    const x = new URLSearchParams(qs);
    x.delete(key);
    return href(x);
  };
  const active = (Object.keys(FILTER_LABELS) as (keyof WaitlistFilters)[]).filter((k) => filters[k]);
  const panelFilters = active.filter((k) => k !== "q").length;
  const exportHref = `${BASE}/export${qs.size ? `?${qs}` : ""}`;

  return (
    <div className="adm">
      <header className="adm-bar">
        <div className="adm-bar__inner">
          <Link href={BASE} className="admin-brand" aria-label="Waitlist — início">
            <Logo className="admin-logo" /> <span>Waitlist</span>
          </Link>
          <div className="adm-bar__right">
            <span className="adm-email">{email}</span>
            <form action={signOut}>
              <button className="admin-btn admin-btn--sm">Sair</button>
            </form>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <section className="adm-kpis" aria-label="Resumo">
          <div className="adm-kpi adm-kpi--main">
            <span className="adm-kpi__label">Total na lista</span>
            <strong className="adm-kpi__value">{fmt(stats.total)}</strong>
          </div>
          <div className="adm-kpi">
            <span className="adm-kpi__label">Hoje</span>
            <strong className="adm-kpi__value">{fmt(stats.today)}</strong>
          </div>
          <div className="adm-kpi">
            <span className="adm-kpi__label">7 dias</span>
            <strong className="adm-kpi__value">{fmt(stats.last_7)}</strong>
          </div>
        </section>

        <section className="adm-rail" aria-label="Origens">
          <BreakdownCard title="Origem dos leads" data={stats.by_source} param="source" />
          <BreakdownCard title="UTM Source" data={stats.by_utm_source} param="utm_source" />
          <BreakdownCard title="UTM Campaign" data={stats.by_utm_campaign} param="utm_campaign" />
        </section>

        <form className="adm-tools" method="get" action={BASE}>
          <div className="adm-search">
            <svg className="adm-search__icon" viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              name="q"
              type="search"
              inputMode="search"
              enterKeyHint="search"
              placeholder="Buscar nome ou telefone"
              defaultValue={filters.q}
              aria-label="Buscar nome ou telefone"
            />
          </div>

          <details className="adm-filters">
            <summary className="admin-btn">
              Filtros
              {panelFilters ? <span className="adm-badge">{panelFilters}</span> : null}
            </summary>
            <div className="adm-filters__panel">
              <label>
                Origem
                <select name="source" defaultValue={filters.source ?? ""}>
                  <option value="">Todas</option>
                  {stats.by_source.map((b) => (
                    <option key={b.label} value={b.label}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                UTM Source
                <select name="utm_source" defaultValue={filters.utm_source ?? ""}>
                  <option value="">Todos</option>
                  {stats.by_utm_source.map((b) => (
                    <option key={b.label} value={b.label}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                UTM Campaign
                <select name="utm_campaign" defaultValue={filters.utm_campaign ?? ""}>
                  <option value="">Todas</option>
                  {stats.by_utm_campaign.map((b) => (
                    <option key={b.label} value={b.label}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="adm-dates">
                <label>
                  De
                  <input type="date" name="from" defaultValue={filters.from} />
                </label>
                <label>
                  Até
                  <input type="date" name="to" defaultValue={filters.to} />
                </label>
              </div>
              <div className="adm-filters__actions">
                {active.length ? (
                  <Link className="admin-btn" href={BASE}>
                    Limpar
                  </Link>
                ) : null}
                <button className="admin-btn admin-btn--primary">Aplicar</button>
              </div>
            </div>
          </details>

          <a className="admin-btn adm-export" href={exportHref} download>
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
              <path
                d="M10 3v10m0 0l-4-4m4 4l4-4M4 16h12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>CSV</span>
          </a>
        </form>

        {active.length ? (
          <div className="adm-chips" aria-label="Filtros ativos">
            {active.map((k) => (
              <Link key={k} href={without(k)} className="adm-chip" aria-label={`Remover filtro ${FILTER_LABELS[k]}`}>
                <span className="admin-muted">{FILTER_LABELS[k]}:</span> {filters[k]}
                <span aria-hidden="true" className="adm-chip__x">
                  ×
                </span>
              </Link>
            ))}
          </div>
        ) : null}

        <p className="admin-muted admin-count">
          {fmt(filteredTotal)} {filteredTotal === 1 ? "resultado" : "resultados"}
          {error ? ` · erro: ${error}` : ""}
        </p>

        {rows.length === 0 ? (
          <div className="adm-empty">
            <p>Nenhum cadastro encontrado.</p>
            {active.length ? (
              <Link className="admin-btn" href={BASE}>
                Limpar filtros
              </Link>
            ) : null}
          </div>
        ) : (
          <>
            {/* Celular: cartões */}
            <ul className="adm-cards">
              {rows.map((r) => {
                const digits = r.phone.replace(/\D/g, "");
                return (
                  <li key={r.id} className="adm-card">
                    <div className="adm-card__head">
                      <strong className="adm-card__name">{r.name}</strong>
                      <time className="admin-muted" dateTime={r.created_at} title={formatDate(r.created_at)}>
                        {relative(r.created_at)}
                      </time>
                    </div>
                    <div className="adm-card__phone">{formatPhone(r.phone)}</div>
                    <div className="adm-tags">
                      {r.source ? <span className="adm-tag">{r.source}</span> : null}
                      {r.utm_campaign ? <span className="adm-tag">{r.utm_campaign}</span> : null}
                      {r.utm_source && r.utm_source !== r.source ? (
                        <span className="adm-tag">{r.utm_source}</span>
                      ) : null}
                      {r.device_type && DEVICE[r.device_type] ? (
                        <span className="adm-tag adm-tag--quiet">{DEVICE[r.device_type]}</span>
                      ) : null}
                    </div>
                    <div className="adm-card__actions">
                      <a
                        className="admin-btn admin-btn--primary"
                        href={`https://wa.me/${digits}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp
                      </a>
                      <CopyButton value={r.phone} />
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Desktop: tabela */}
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
                  {rows.map((r) => (
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
                      <td>{(r.device_type && DEVICE[r.device_type]) ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {pages > 1 ? (
          <nav className="adm-pager" aria-label="Paginação">
            {page > 1 ? (
              <Link className="admin-btn" href={pageHref(page - 1)}>
                ← Anterior
              </Link>
            ) : (
              <span className="admin-btn is-disabled" aria-hidden="true">
                ← Anterior
              </span>
            )}
            <span className="admin-muted">
              {page} / {pages}
            </span>
            {page < pages ? (
              <Link className="admin-btn" href={pageHref(page + 1)}>
                Próxima →
              </Link>
            ) : (
              <span className="admin-btn is-disabled" aria-hidden="true">
                Próxima →
              </span>
            )}
          </nav>
        ) : null}
      </main>
    </div>
  );
}

function BreakdownCard({ title, data, param }: { title: string; data: Breakdown; param: string }) {
  const max = Math.max(1, ...data.map((d) => Number(d.total)));
  return (
    <div className="adm-break">
      <h2>{title}</h2>
      {data.length === 0 ? (
        <p className="admin-muted">Sem dados ainda.</p>
      ) : (
        <ul>
          {data.slice(0, 6).map((d) => (
            <li key={d.label}>
              <Link href={`${BASE}?${new URLSearchParams({ [param]: d.label })}`}>
                <span className="adm-break__label">{d.label}</span>
                <span className="adm-break__value">{fmt(d.total)}</span>
                <span className="adm-break__bar" style={{ width: `${(Number(d.total) / max) * 100}%` }} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
