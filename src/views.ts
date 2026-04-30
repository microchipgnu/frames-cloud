import { html, raw } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";
import type { Dataset, Entity, Source } from "./types.ts";

const FONT_LINK = raw(`
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
`);

const STYLE = raw(`
  :root {
    --bg: #FFFFFF;
    --ink: #0A0A0A;
    --ink-2: #303030;
    --muted: #6B6B6B;
    --border: #E0E0E0;
    --border-soft: #F0F0F0;
    --row-hover: #FAFAFA;
    --link: #0F3CB7;

    --sans: 'Geist', 'SF Pro Display', system-ui, -apple-system, 'Helvetica Neue', sans-serif;
    --mono: 'Geist Mono', 'SF Mono', 'JetBrains Mono', ui-monospace, monospace;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: var(--bg); color: var(--ink);
    font-family: var(--sans); font-size: 14px; line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    font-feature-settings: 'tnum' on, 'cv11' on;
  }
  ::selection { background: var(--ink); color: var(--bg); }

  a { color: var(--ink); text-decoration: underline; text-underline-offset: 2px; text-decoration-thickness: 1px; text-decoration-color: var(--border); }
  a:hover { text-decoration-color: var(--ink); }
  a.plain { text-decoration: none; }
  a.plain:hover { text-decoration: underline; text-underline-offset: 2px; text-decoration-thickness: 1px; text-decoration-color: var(--ink); }

  /* Header — single hairline, no blur, no sticky */
  header.site {
    border-bottom: 1px solid var(--border);
    background: var(--bg);
  }
  header.site .row {
    max-width: 1280px; margin: 0 auto; padding: 14px 24px;
    display: flex; align-items: center; justify-content: space-between; gap: 32px;
    font-size: 12.5px;
  }
  header.site .brand {
    font-family: var(--mono); color: var(--ink); text-transform: uppercase;
    letter-spacing: 0.08em; font-weight: 500; text-decoration: none;
  }
  header.site .brand .dot { color: var(--muted); margin: 0 8px; }
  header.site nav { display: flex; gap: 18px; font-family: var(--mono); }
  header.site nav a { color: var(--muted); text-decoration: none; text-transform: uppercase; letter-spacing: 0.06em; font-size: 11.5px; }
  header.site nav a:hover { color: var(--ink); }

  main { max-width: 1280px; margin: 0 auto; padding: 32px 24px 96px; }

  /* Type primitives */
  .eyebrow {
    font-family: var(--mono); font-size: 11px; text-transform: uppercase;
    letter-spacing: 0.1em; color: var(--muted); margin: 0 0 10px;
  }
  h1 { margin: 0; font-family: var(--sans); font-weight: 600; letter-spacing: -0.022em; }
  h1.page { font-size: 32px; line-height: 1.15; margin-bottom: 8px; }
  h1.entity { font-size: 28px; line-height: 1.15; margin-bottom: 4px; }
  h1.home { font-size: 36px; line-height: 1.1; max-width: 22ch; }
  h2 { margin: 0; font-family: var(--mono); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); }
  p { color: var(--ink-2); max-width: 64ch; margin: 0; }
  p.muted { color: var(--muted); }
  .desc { color: var(--ink-2); font-size: 14px; line-height: 1.55; max-width: 76ch; margin-top: 8px; }

  code, .mono { font-family: var(--mono); font-size: 12.5px; }
  code.inline {
    background: var(--border-soft); padding: 1px 5px; font-size: 0.9em;
    color: var(--ink);
  }

  /* Masthead — newspaper rule meta strip */
  .masthead {
    margin: 24px 0 0;
    border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    display: grid; grid-auto-flow: column; grid-auto-columns: max-content;
    gap: 0; overflow-x: auto;
  }
  .masthead .cell {
    padding: 12px 20px; border-right: 1px solid var(--border);
    display: flex; flex-direction: column; gap: 4px;
    font-family: var(--mono);
  }
  .masthead .cell:first-child { padding-left: 0; }
  .masthead .cell:last-child { border-right: none; padding-right: 0; }
  .masthead .key { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); }
  .masthead .val { font-size: 13px; color: var(--ink); }
  .masthead .val a { color: var(--ink); text-decoration: none; }
  .masthead .val a:hover { text-decoration: underline; text-decoration-color: var(--ink); }

  /* Action row — bracketed mono links */
  .actions {
    display: flex; flex-wrap: wrap; gap: 12px; margin: 20px 0 40px;
    font-family: var(--mono); font-size: 12px;
  }
  .actions a {
    color: var(--ink); text-decoration: none; padding: 4px 10px;
    border: 1px solid var(--border); background: var(--bg);
    text-transform: lowercase;
  }
  .actions a:hover { border-color: var(--ink); }
  .actions a .arr { color: var(--muted); margin-left: 6px; }
  .actions a:hover .arr { color: var(--ink); }

  /* Filter row */
  .filter {
    display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
    font-family: var(--mono); font-size: 11.5px; margin: 0 0 12px;
    padding: 8px 0; border-top: 1px solid var(--border-soft); border-bottom: 1px solid var(--border-soft);
  }
  .filter .label { color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; font-size: 10.5px; margin-right: 8px; }
  .filter a {
    color: var(--ink); text-decoration: none;
    padding: 2px 8px; border: 1px solid var(--border);
  }
  .filter a:hover { border-color: var(--ink); }
  .filter a.on { background: var(--ink); color: var(--bg); border-color: var(--ink); }
  .filter a .n { color: var(--muted); margin-left: 5px; font-size: 10.5px; }
  .filter a.on .n { color: var(--bg); opacity: 0.6; }
  .filter .clear { color: var(--muted); margin-left: 6px; padding: 0 6px; text-decoration: none; font-size: 10.5px; }
  .filter .clear:hover { color: var(--ink); }

  /* Tables */
  table.data {
    width: 100%; border-collapse: collapse;
    border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    font-size: 13px;
  }
  table.data th, table.data td {
    padding: 10px 14px; text-align: left; vertical-align: top;
    border-bottom: 1px solid var(--border-soft);
    border-right: 1px solid var(--border-soft);
    white-space: nowrap;
  }
  table.data tr:last-child td { border-bottom: none; }
  table.data th:last-child, table.data td:last-child { border-right: none; }
  table.data th {
    font-family: var(--mono); font-weight: 500; font-size: 10.5px;
    text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted);
    background: var(--bg); padding-top: 12px; padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }
  table.data tr:hover td { background: var(--row-hover); }
  table.data td.name a { color: var(--ink); text-decoration: none; font-weight: 500; }
  table.data td.name a:hover { text-decoration: underline; text-underline-offset: 2px; text-decoration-thickness: 1px; }
  table.data td.id, table.data td.mono { font-family: var(--mono); font-size: 12px; color: var(--ink-2); }
  table.data td.mono.muted { color: var(--muted); }
  table.data td.num { font-family: var(--mono); text-align: right; font-variant-numeric: tabular-nums; }
  table.data .empty { color: var(--muted); }
  table.data .empty::before { content: "—"; }

  /* Source affordance — small, mono, links to entity page */
  .src-mark {
    display: inline; font-family: var(--mono); font-size: 10.5px;
    color: var(--muted); margin-left: 6px; vertical-align: super; line-height: 1;
    text-decoration: none;
  }
  .src-mark:hover { color: var(--ink); text-decoration: none; }

  /* Pager */
  .pager {
    margin-top: 16px; display: flex; gap: 18px; align-items: baseline;
    font-family: var(--mono); font-size: 11.5px; color: var(--muted);
  }
  .pager a { color: var(--ink); text-decoration: none; }
  .pager a:hover { text-decoration: underline; }

  /* Repo index — frame card list */
  .frames-list { border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin: 24px 0; }
  .frames-list a.card {
    display: grid; grid-template-columns: 1fr auto auto auto;
    gap: 24px; align-items: baseline;
    padding: 16px 4px; border-bottom: 1px solid var(--border-soft);
    text-decoration: none; color: var(--ink);
  }
  .frames-list a.card:last-child { border-bottom: none; }
  .frames-list a.card:hover { background: var(--row-hover); }
  .frames-list a.card .title { font-size: 16px; font-weight: 500; }
  .frames-list a.card .path { font-family: var(--mono); font-size: 11px; color: var(--muted); margin-top: 2px; }
  .frames-list a.card .desc { color: var(--ink-2); font-size: 13px; margin-top: 6px; max-width: 60ch; line-height: 1.45; }
  .frames-list a.card .col { font-family: var(--mono); font-size: 12px; color: var(--muted); white-space: nowrap; min-width: 7ch; text-align: right; }
  .frames-list a.card .col .k { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 2px; }
  .frames-list a.card .col .v { color: var(--ink); }

  /* Entity view */
  .breadcrumb { font-family: var(--mono); font-size: 11.5px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 18px; }
  .breadcrumb a { color: var(--muted); text-decoration: none; }
  .breadcrumb a:hover { color: var(--ink); }
  .entity-id { font-family: var(--mono); font-size: 12px; color: var(--muted); margin-bottom: 36px; }

  table.fields { width: 100%; border-collapse: collapse; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin-bottom: 48px; font-size: 13px; }
  table.fields td { padding: 10px 0; border-bottom: 1px solid var(--border-soft); vertical-align: top; }
  table.fields tr:last-child td { border-bottom: none; }
  table.fields td.k { width: 220px; font-family: var(--mono); font-size: 11.5px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; padding-top: 13px; }
  table.fields td.k .req { display: inline-block; margin-left: 6px; padding: 0 5px; font-size: 9.5px; letter-spacing: 0.06em; color: var(--muted); border: 1px solid var(--border); }
  table.fields td.v { color: var(--ink); }
  table.fields td.v a { color: var(--link); text-decoration: none; }
  table.fields td.v a:hover { text-decoration: underline; }
  table.fields td.v .mono { color: var(--ink-2); }
  table.fields td.s { width: 280px; text-align: right; font-family: var(--mono); font-size: 11.5px; color: var(--muted); white-space: nowrap; }
  table.fields td.s a { color: var(--ink-2); text-decoration: none; }
  table.fields td.s a:hover { text-decoration: underline; }
  table.fields td.t { width: 100px; text-align: right; font-family: var(--mono); font-size: 11px; color: var(--muted); white-space: nowrap; padding-top: 13px; }

  /* Evidence — mono transcript style */
  .evidence-list { border-top: 1px solid var(--border); }
  .evidence-list .item { padding: 20px 0; border-bottom: 1px solid var(--border-soft); }
  .evidence-list .item:last-child { border-bottom: none; }
  .evidence-list .item .head {
    display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap;
    margin-bottom: 12px;
  }
  .evidence-list .item .field {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.1em;
  }
  .evidence-list .item .value {
    font-family: var(--mono); font-size: 13.5px; color: var(--ink);
    background: var(--border-soft); padding: 1px 8px;
  }
  .evidence-list .item .meta {
    margin-left: auto; font-family: var(--mono); font-size: 11px; color: var(--muted);
  }
  .evidence-list .item .meta a { color: var(--ink-2); text-decoration: none; }
  .evidence-list .item .meta a:hover { text-decoration: underline; }
  .evidence-list .item blockquote {
    margin: 0; padding: 12px 16px;
    border-left: 2px solid var(--border);
    font-family: var(--sans); font-size: 14px; line-height: 1.55;
    color: var(--ink); max-width: 76ch;
  }
  .evidence-list .item blockquote::before { content: "“"; color: var(--muted); margin-right: 2px; }
  .evidence-list .item blockquote::after { content: "”"; color: var(--muted); margin-left: 2px; }

  /* Connect block */
  details.connect { margin: 64px 0 0; padding-top: 24px; border-top: 1px solid var(--border); }
  details.connect summary {
    list-style: none; cursor: pointer;
    font-family: var(--mono); font-size: 11px; text-transform: uppercase;
    letter-spacing: 0.1em; color: var(--ink); display: flex; align-items: center; gap: 10px;
  }
  details.connect summary::-webkit-details-marker { display: none; }
  details.connect summary::before { content: "[+]"; color: var(--muted); }
  details.connect[open] summary::before { content: "[−]"; color: var(--muted); }
  details.connect .body { padding-top: 16px; }
  details.connect pre {
    background: #0A0A0A; color: #E5E5E5;
    border: 1px solid var(--ink); padding: 16px 20px;
    font-family: var(--mono); font-size: 12px; line-height: 1.55;
    overflow-x: auto; margin: 12px 0;
  }
  details.connect .note { font-family: var(--mono); font-size: 10.5px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; }

  /* Section spacers */
  section { margin-bottom: 48px; }
  section:last-child { margin-bottom: 0; }
`);

function shell(titleText: string, body: HtmlEscapedString | string): HtmlEscapedString {
  return html`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${titleText}</title>
${FONT_LINK}
<style>${STYLE}</style>
</head>
<body>
<header class="site">
  <div class="row">
    <a href="/" class="brand">frames<span class="dot">·</span>cloud</a>
    <nav>
      <a href="/microchipgnu/ai-agent-wallets-eu">example</a>
      <a href="/microchipgnu/ai-agent-wallets">multi</a>
      <a href="https://github.com/microchipgnu/frames-cloud">source</a>
    </nav>
  </div>
</header>
<main>
${body}
</main>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function host(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function fieldCellPlain(value: unknown): HtmlEscapedString {
  if (value === undefined || value === null) {
    return html`<span class="empty"></span>`;
  }
  if (typeof value === "string" && value.startsWith("http")) {
    return html`<a class="plain" href="${value}" target="_blank" rel="noopener">${host(value)}</a>`;
  }
  return html`<span>${String(value)}</span>`;
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

export function renderHome(): HtmlEscapedString {
  const body = html`
<section>
  <div class="eyebrow">frames-cloud · github-resolver runtime for evidence-backed datasets</div>
  <h1 class="home">Live datasets from any public GitHub repo.</h1>
  <p class="desc">A frame is a directory containing <code class="inline">schema.yml</code> and <code class="inline">events.ndjson</code>. Push the repo and the URL works — paginated JSON API plus a public table view, with verbatim source provenance per cell. URL = filesystem path inside the repo.</p>
</section>

<section>
  <h2>endpoints</h2>
  <table class="data" style="margin-top: 12px;">
    <thead><tr>
      <th>method</th><th>path</th><th>response</th>
    </tr></thead>
    <tbody>
      <tr><td class="mono">GET</td><td class="mono">/&lt;user&gt;/&lt;repo&gt;[/&lt;frame_path&gt;]</td><td>html — entity table view</td></tr>
      <tr><td class="mono">GET</td><td class="mono">/&lt;user&gt;/&lt;repo&gt;[/&lt;frame_path&gt;]/entities/&lt;id&gt;</td><td>html — entity detail with evidence</td></tr>
      <tr><td class="mono">GET</td><td class="mono">/api/v1/&lt;user&gt;/&lt;repo&gt;[/&lt;frame_path&gt;]/entities</td><td>json — paginated, cursor on entity_id</td></tr>
      <tr><td class="mono">GET</td><td class="mono">/api/v1/&lt;user&gt;/&lt;repo&gt;[/&lt;frame_path&gt;]/entities/&lt;id&gt;</td><td>json — full entity + all evidence</td></tr>
      <tr><td class="mono">GET</td><td class="mono">/api/v1/&lt;user&gt;/&lt;repo&gt;[/&lt;frame_path&gt;]/schema</td><td>json — schema.yml as JSON</td></tr>
      <tr><td class="mono">GET</td><td class="mono">/api/v1/&lt;user&gt;/&lt;repo&gt;[/&lt;frame_path&gt;]/readme</td><td>md — README.md</td></tr>
      <tr><td class="mono">GET</td><td class="mono">/api/v1/&lt;user&gt;/&lt;repo&gt;/_frames</td><td>json — list every schema.yml in the repo</td></tr>
    </tbody>
  </table>
</section>

<section>
  <h2>live datasets</h2>
  <div class="frames-list">
    <a class="card" href="/microchipgnu/ai-agent-wallets-eu">
      <div>
        <div class="title">ai_agent_wallets_eu</div>
        <div class="path">microchipgnu / ai-agent-wallets-eu</div>
        <div class="desc">EU-headquartered companies building programmable wallets and payment infrastructure for AI agents. Every fact verbatim-sourced.</div>
      </div>
      <div class="col"><span class="k">entities</span><span class="v">13</span></div>
      <div class="col"><span class="k">countries</span><span class="v">9</span></div>
      <div class="col"><span class="k">type</span><span class="v">single-frame</span></div>
    </a>
    <a class="card" href="/microchipgnu/ai-agent-wallets">
      <div>
        <div class="title">ai-agent-wallets</div>
        <div class="path">microchipgnu / ai-agent-wallets</div>
        <div class="desc">Multi-frame repo: <code class="inline">eu/</code> + <code class="inline">us/</code> sibling datasets sharing field shape but differing on hq_country enum.</div>
      </div>
      <div class="col"><span class="k">frames</span><span class="v">2</span></div>
      <div class="col"><span class="k">scope</span><span class="v">EU + US</span></div>
      <div class="col"><span class="k">type</span><span class="v">multi-frame</span></div>
    </a>
  </div>
</section>
`;
  return shell("frames-cloud", body);
}

// ---------------------------------------------------------------------------
// Repo index
// ---------------------------------------------------------------------------

export type RepoFrameSummary = {
  slug: string;
  frame_path: string;
  schema_name?: string;
  description?: string;
  entity_count?: number;
  max_ts?: string;
  error?: string;
};

export function renderRepoIndex(
  user: string,
  repo: string,
  sha: string,
  frames: RepoFrameSummary[],
): HtmlEscapedString {
  const githubUrl = `https://github.com/${user}/${repo}`;
  const cards = frames.map((f) => {
    const url = `/${user}/${repo}${f.frame_path ? "/" + f.frame_path : ""}`;
    return html`<a class="card" href="${url}">
      <div>
        <div class="title">${f.schema_name ?? f.slug}</div>
        <div class="path">${f.frame_path || "(root)"}</div>
        ${f.description ? html`<div class="desc">${f.description.split("\n")[0]}</div>` : ""}
      </div>
      <div class="col"><span class="k">entities</span><span class="v">${f.entity_count ?? "—"}</span></div>
      <div class="col"><span class="k">updated</span><span class="v">${f.max_ts ? f.max_ts.split("T")[0] : "—"}</span></div>
      <div class="col"><span class="k">path</span><span class="v">${f.frame_path || "."}</span></div>
    </a>`;
  });

  const body = html`
<section>
  <div class="eyebrow">multi-frame repository</div>
  <h1 class="page">${user}/${repo}</h1>
  <p class="desc">${frames.length} ${frames.length === 1 ? "frame" : "frames"}. Each is a directory with its own schema.yml and events.ndjson.</p>
</section>

<div class="masthead">
  <div class="cell"><span class="key">repo</span><span class="val"><a href="${githubUrl}">${user}/${repo}</a></span></div>
  <div class="cell"><span class="key">commit</span><span class="val">${sha.slice(0, 7)}</span></div>
  <div class="cell"><span class="key">frames</span><span class="val">${frames.length}</span></div>
</div>

<section>
  <h2>frames</h2>
  <div class="frames-list">${cards}</div>
</section>

<section>
  <h2>api</h2>
  <p class="muted" style="font-family: var(--mono); font-size: 12px;">GET /api/v1/${user}/${repo}/_frames &nbsp;·&nbsp; GET /api/v1/${user}/${repo}/&lt;frame_path&gt;/entities</p>
</section>
`;
  return shell(`${user}/${repo} — frames-cloud`, body);
}

// ---------------------------------------------------------------------------
// Frame view (the headline page)
// ---------------------------------------------------------------------------

export function renderFrame(
  ds: Dataset,
  entities: Entity[],
  page: { limit: number; next_cursor: string | null; has_more: boolean },
  filters: Record<string, string[]>,
  countryCounts: Map<string, number>,
): HtmlEscapedString {
  const fieldOrder = Object.keys(ds.schema.fields);
  // skip "name" — we render it as the row header. include up to 6 more.
  const visibleFields = fieldOrder.filter((f) => f !== "name").slice(0, 6);
  const githubUrl = `https://github.com/${ds.user}/${ds.repo}${
    ds.frame_path ? `/tree/main/${ds.frame_path}` : ""
  }`;
  const apiUrl = `/api/v1/${ds.user}/${ds.repo}${ds.frame_path ? "/" + ds.frame_path : ""}/entities`;
  const mcpUrl = `/mcp/${ds.user}/${ds.repo}${ds.frame_path ? "/" + ds.frame_path : ""}`;
  const activeCountries = filters.hq_country ?? [];
  const countryRow = ds.schema.fields.hq_country?.values ?? [];
  const path = `/${ds.user}/${ds.repo}${ds.frame_path ? "/" + ds.frame_path : ""}`;
  const totalEntities = [...ds.entities.values()].filter((e) => !e.removed).length;

  const filterLink = (val: string, count: number, isActive: boolean) => {
    let next = activeCountries.slice();
    if (isActive) next = next.filter((v) => v !== val);
    else next.push(val);
    const qs = next.length > 0 ? `?filter[hq_country]=${next.join(",")}` : "";
    return html`<a class="${isActive ? "on" : ""}" href="${path + qs}">${val}<span class="n">${count}</span></a>`;
  };

  const filterBar =
    countryRow.length > 0
      ? html`<div class="filter">
  <span class="label">hq_country</span>
  ${countryRow
    .filter((c) => (countryCounts.get(c) ?? 0) > 0)
    .map((c) => filterLink(c, countryCounts.get(c) ?? 0, activeCountries.includes(c)))}
  ${activeCountries.length > 0 ? html`<a class="clear" href="${path}">[clear]</a>` : ""}
</div>`
      : "";

  const colHeaders = html`
    <th>name</th>
    <th>id</th>
    ${visibleFields.map((f) => html`<th>${f}</th>`)}
  `;

  const rows = entities.map((e) => {
    const cells = visibleFields.map((f) => {
      const v = e.fields[f];
      const isMonoField = ["hq_country", "founded_year", "category", "funding_stage", "last_news_date"].includes(f);
      const isLink = typeof v === "string" && v.startsWith("http");
      if (v === undefined || v === null) return html`<td><span class="empty"></span></td>`;
      if (isLink) return html`<td class="mono"><a class="plain" href="${v as string}" target="_blank" rel="noopener">${host(v as string)}</a></td>`;
      if (isMonoField) return html`<td class="mono">${String(v)}</td>`;
      return html`<td>${String(v)}</td>`;
    });
    return html`<tr>
      <td class="name"><a href="${path}/entities/${e.entity_id}">${String(e.fields.name ?? e.entity_id)}</a></td>
      <td class="id mono muted">${e.entity_id}</td>
      ${cells}
    </tr>`;
  });

  const body = html`
<section>
  <div class="eyebrow">${ds.entity_type ?? "entity"} · ${ds.user}/${ds.repo}${ds.frame_path ? "/" + ds.frame_path : ""}</div>
  <h1 class="page">${ds.schema.name}</h1>
  <p class="desc">${(ds.schema.description ?? "").split("\n").join(" ").trim()}</p>
</section>

<div class="masthead">
  <div class="cell"><span class="key">repo</span><span class="val"><a href="${githubUrl}">${ds.user}/${ds.repo}${ds.frame_path ? "/" + ds.frame_path : ""}</a></span></div>
  <div class="cell"><span class="key">commit</span><span class="val">${ds.sha.slice(0, 7)}</span></div>
  <div class="cell"><span class="key">entities</span><span class="val">${totalEntities}</span></div>
  <div class="cell"><span class="key">updated</span><span class="val">${ds.max_ts ? ds.max_ts.split("T")[0] : "—"}</span></div>
  <div class="cell"><span class="key">protocol</span><span class="val">${ds.schema.frame_protocol}</span></div>
</div>

<div class="actions">
  <a href="${apiUrl}">json<span class="arr">↗</span></a>
  <a href="/api/v1${path}/schema">schema<span class="arr">↗</span></a>
  <a href="${githubUrl}">github<span class="arr">↗</span></a>
  <a href="#mcp">mcp<span class="arr">↓</span></a>
</div>

<section>
  <h2>entities · ${entities.length} of ${totalEntities}</h2>
  ${filterBar}
  <table class="data">
    <thead><tr>${colHeaders}</tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="pager">
    <span>showing ${entities.length}</span>
    ${page.next_cursor
      ? html`<a href="${path}?cursor=${page.next_cursor}${
          activeCountries.length > 0 ? `&filter[hq_country]=${activeCountries.join(",")}` : ""
        }">next →</a>`
      : html`<span>end of results</span>`}
  </div>
</section>

<details class="connect" id="mcp">
  <summary>connect via mcp http</summary>
  <div class="body">
    <p class="muted" style="font-family: var(--mono); font-size: 11.5px;">add to .mcp.json — anonymous reads, oauth-gated writes (coming).</p>
    <pre><code>{
  "mcpServers": {
    "${ds.schema.name}": {
      "type": "http",
      "url": "${mcpUrl}"
    }
  }
}</code></pre>
    <p class="note">mcp http runtime — coming. json api works today.</p>
  </div>
</details>
`;
  return shell(`${ds.schema.name} — frames-cloud`, body);
}

// ---------------------------------------------------------------------------
// Entity view
// ---------------------------------------------------------------------------

export function renderEntity(ds: Dataset, ent: Entity): HtmlEscapedString {
  const path = `/${ds.user}/${ds.repo}${ds.frame_path ? "/" + ds.frame_path : ""}`;

  const fieldRows = Object.keys(ds.schema.fields).map((f) => {
    const v = ent.fields[f];
    const ev = ent.evidence[f];
    const fact = ent.facts[f];
    const required = ds.schema.fields[f]?.required;
    const valueRender =
      v === undefined || v === null
        ? html`<span class="empty"></span>`
        : typeof v === "string" && v.startsWith("http")
          ? html`<a href="${v}" target="_blank" rel="noopener">${v}</a>`
          : typeof v === "string"
            ? html`<span>${v}</span>`
            : html`<span class="mono">${String(v)}</span>`;
    return html`<tr>
      <td class="k">${f}${required ? html`<span class="req">REQ</span>` : ""}</td>
      <td class="v">${valueRender}</td>
      <td class="s">${ev ? html`<a href="${ev.url}" target="_blank" rel="noopener">${host(ev.url)}</a>` : ""}</td>
      <td class="t">${fact?.ts.split("T")[0] ?? ""}</td>
    </tr>`;
  });

  const evidenceItems = Object.entries(ent.evidence).map(([f, src]) => {
    const v = ent.fields[f];
    const valueDisplay = typeof v === "string" ? v : String(v);
    return html`<div class="item">
      <div class="head">
        <span class="field">${f}</span>
        <span class="value">${valueDisplay}</span>
        <span class="meta"><a href="${src.url}" target="_blank" rel="noopener">${host(src.url)}</a> · retrieved ${src.retrieved_at}</span>
      </div>
      <blockquote>${src.excerpt ?? "(no excerpt)"}</blockquote>
    </div>`;
  });

  const body = html`
<div class="breadcrumb"><a href="${path}">← ${ds.schema.name}</a></div>
<h1 class="entity">${String(ent.fields.name ?? ent.entity_id)}</h1>
<div class="entity-id">${ent.entity_id}</div>

<section>
  <h2>fields</h2>
  <table class="fields" style="margin-top: 12px;">
    <tbody>${fieldRows}</tbody>
  </table>
</section>

<section>
  <h2>evidence · ${Object.keys(ent.evidence).length}</h2>
  <div class="evidence-list" style="margin-top: 12px;">
    ${evidenceItems}
  </div>
</section>
`;
  return shell(`${ent.fields.name ?? ent.entity_id} — frames-cloud`, body);
}
