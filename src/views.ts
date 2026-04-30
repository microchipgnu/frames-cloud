import { html, raw } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";
import type { Dataset, Entity, Source } from "./types.ts";

const STYLE = raw(`
  :root {
    --bg: #fafaf9;
    --fg: #1a1a1a;
    --muted: #666;
    --border: #e5e5e3;
    --accent: #0f3a82;
    --accent-soft: #eaf0fb;
    --code-bg: #f4f4f1;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    background: var(--bg); color: var(--fg);
    font: 15px/1.55 ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
  }
  body { padding: 0 24px 96px; }
  header.site {
    display: flex; align-items: baseline; gap: 24px;
    padding: 18px 0; border-bottom: 1px solid var(--border);
    margin-bottom: 32px;
  }
  header.site .brand { font-weight: 700; letter-spacing: -0.01em; font-size: 16px; }
  header.site nav { color: var(--muted); font-size: 13px; }
  header.site nav a { color: var(--muted); margin-left: 16px; }
  main { max-width: 1080px; margin: 0 auto; }
  h1 { font-size: 26px; letter-spacing: -0.015em; margin: 0 0 6px; }
  h2 { font-size: 16px; letter-spacing: 0; margin: 32px 0 12px; }
  p.lead { color: var(--muted); margin: 0 0 24px; max-width: 64ch; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  code, .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
  .meta {
    display: flex; flex-wrap: wrap; gap: 16px; row-gap: 6px;
    padding: 12px 16px; background: white; border: 1px solid var(--border);
    border-radius: 8px; margin: 0 0 24px; font-size: 13px;
  }
  .meta dt { color: var(--muted); margin-right: 6px; }
  .meta dt, .meta dd { display: inline; margin: 0; }
  .meta dd { font-weight: 500; }
  .actions { display: flex; gap: 8px; flex-wrap: wrap; margin: 0 0 24px; }
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 12px; border: 1px solid var(--border); border-radius: 6px;
    background: white; color: var(--fg); font-size: 13px;
  }
  .btn:hover { background: var(--accent-soft); text-decoration: none; }
  .btn.primary { background: var(--accent); color: white; border-color: var(--accent); }
  .btn.primary:hover { background: #0a2d6a; }
  table.entities {
    width: 100%; border-collapse: collapse; background: white;
    border: 1px solid var(--border); border-radius: 8px; overflow: hidden;
    font-size: 14px;
  }
  table.entities th, table.entities td {
    padding: 10px 14px; text-align: left; vertical-align: top;
    border-bottom: 1px solid var(--border);
  }
  table.entities tr:last-child td { border-bottom: none; }
  table.entities th {
    background: var(--code-bg); font-weight: 600; font-size: 12px;
    text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted);
  }
  table.entities td .id { color: var(--muted); font-size: 12px; }
  .chip {
    display: inline-block; padding: 1px 8px; border-radius: 999px;
    background: var(--accent-soft); color: var(--accent); font-size: 12px;
    font-family: inherit;
  }
  .src {
    display: inline; cursor: help; position: relative;
    color: var(--muted); font-size: 11px; margin-left: 4px;
    border-bottom: 1px dotted var(--muted);
  }
  .src::after {
    content: attr(data-tip);
    position: absolute; left: 0; top: 100%; margin-top: 6px;
    width: 360px; max-width: 80vw;
    padding: 10px 12px; background: #1a1a1a; color: #f5f5f5;
    border-radius: 6px; font-size: 12px; line-height: 1.45;
    box-shadow: 0 4px 16px rgba(0,0,0,0.18);
    white-space: pre-wrap; z-index: 10; pointer-events: none;
    opacity: 0; transform: translateY(-4px);
    transition: opacity 90ms ease, transform 90ms ease;
  }
  .src:hover::after { opacity: 1; transform: translateY(0); pointer-events: auto; }
  .pager { display: flex; gap: 12px; margin-top: 16px; font-size: 13px; }
  .empty { color: var(--muted); font-style: italic; }
  .schema-table { width: 100%; border-collapse: collapse; font-size: 13px; background: white; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
  .schema-table th, .schema-table td { padding: 8px 12px; text-align: left; border-bottom: 1px solid var(--border); }
  .schema-table tr:last-child td { border-bottom: none; }
  .schema-table th { background: var(--code-bg); font-weight: 600; font-size: 12px; text-transform: uppercase; color: var(--muted); }
  .badge-required { display: inline-block; padding: 0 6px; background: #fff3e0; color: #aa5b00; border-radius: 4px; font-size: 11px; }
  .filter-bar { margin: 0 0 16px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; font-size: 13px; }
  .filter-bar a.chip { color: var(--muted); background: white; border: 1px solid var(--border); }
  .filter-bar a.chip.active { background: var(--accent); color: white; border-color: var(--accent); }
  details.connect { margin: 32px 0 0; padding: 16px; border: 1px solid var(--border); border-radius: 8px; background: white; }
  details.connect summary { cursor: pointer; font-weight: 600; }
  details.connect pre { background: var(--code-bg); padding: 12px; border-radius: 6px; overflow-x: auto; font-size: 12px; }
`);

function shell(titleText: string, body: HtmlEscapedString | string): HtmlEscapedString {
  return html`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${titleText}</title>
<style>${STYLE}</style>
</head>
<body>
<header class="site">
  <div class="brand">frames.dev</div>
  <nav>
    <a href="/">home</a>
    <a href="https://github.com/microchipgnu/ai-agent-wallets-eu">example repo</a>
  </nav>
</header>
<main>
${body}
</main>
</body>
</html>`;
}

function srcTip(src: Source | undefined): HtmlEscapedString | "" {
  if (!src) return "";
  const tip = `${src.url}\n\n"${src.excerpt ?? ""}"\n\nretrieved ${src.retrieved_at}`;
  return html`<span class="src" data-tip="${tip}">↗</span>`;
}

function fieldCell(value: unknown, src: Source | undefined): HtmlEscapedString {
  if (value === undefined || value === null) {
    return html`<span class="empty">—</span>`;
  }
  if (typeof value === "string" && value.startsWith("http")) {
    const host = (() => { try { return new URL(value).host; } catch { return value; } })();
    return html`<a href="${value}" target="_blank" rel="noopener">${host}</a>${srcTip(src)}`;
  }
  if (typeof value === "string" && value.length === 2 && value === value.toUpperCase()) {
    return html`<span class="chip">${value}</span>${srcTip(src)}`;
  }
  return html`<span>${String(value)}</span>${srcTip(src)}`;
}

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
    return html`<a href="${url}" class="frame-card">
  <div class="frame-card-title">${f.schema_name ?? f.slug}</div>
  <div class="frame-card-path mono">${f.frame_path || "(root)"}</div>
  ${f.description ? html`<div class="frame-card-desc">${f.description.split("\n")[0]}</div>` : ""}
  <div class="frame-card-meta">
    ${f.entity_count !== undefined ? html`<span>${f.entity_count} entities</span>` : ""}
    ${f.max_ts ? html`<span>· updated ${f.max_ts.split("T")[0]}</span>` : ""}
    ${f.error ? html`<span style="color:#a00">${f.error}</span>` : ""}
  </div>
</a>`;
  });
  const body = html`
<h1>${user}/${repo}</h1>
<p class="lead">This repo contains ${frames.length} frame${frames.length === 1 ? "" : "s"}. Each is a directory with its own <code>schema.yml</code> and <code>events.ndjson</code>.</p>

<dl class="meta">
  <span><dt>repo:</dt> <dd><a href="${githubUrl}">github.com/${user}/${repo}</a></dd></span>
  <span><dt>commit:</dt> <dd class="mono">${sha.slice(0, 7)}</dd></span>
  <span><dt>frames:</dt> <dd>${frames.length}</dd></span>
</dl>

<style>
  .frame-card {
    display: block; padding: 18px 20px; margin-bottom: 12px;
    background: white; border: 1px solid var(--border); border-radius: 8px;
    color: var(--fg); text-decoration: none;
    transition: border-color 90ms ease, transform 90ms ease;
  }
  .frame-card:hover { border-color: var(--accent); text-decoration: none; }
  .frame-card-title { font-weight: 600; font-size: 16px; margin-bottom: 2px; color: var(--accent); }
  .frame-card-path { font-size: 12px; color: var(--muted); margin-bottom: 8px; }
  .frame-card-desc { font-size: 14px; color: var(--fg); margin-bottom: 8px; line-height: 1.5; }
  .frame-card-meta { font-size: 12px; color: var(--muted); }
  .frame-card-meta span { margin-right: 8px; }
</style>

<h2>Frames</h2>
${cards}

<h2>API</h2>
<p class="lead"><code>GET /api/v1/${user}/${repo}/_frames</code> — list as JSON. Each frame's data: <code>/api/v1/${user}/${repo}/&lt;frame_path&gt;/entities</code></p>
`;
  return shell(`${user}/${repo} — frames.dev`, body);
}

export function renderHome(): HtmlEscapedString {
  const body = html`
<h1>frames.dev</h1>
<p class="lead">A live, evidence-backed dataset hosted from any public GitHub repo. Drop a <code>schema.yml</code> + <code>events.ndjson</code> in a repo and you get a typed JSON API and a public page automatically — no signup, no deploy step.</p>

<h2>Try it</h2>
<p><a class="btn primary" href="/microchipgnu/ai-agent-wallets-eu">View example: ai-agent-wallets-eu →</a></p>

<h2>How it works</h2>
<p class="lead">URL = filesystem path inside the repo. <code>frames.dev/&lt;user&gt;/&lt;repo&gt;/&lt;dir&gt;</code> resolves to the frame at that directory. Single-frame repos use the root.</p>

<h2>API</h2>
<p class="lead">Same paths, prefixed with <code>/api/v1/</code>, return JSON. Cursor pagination, ETag caching, filters via <code>?filter[field]=...</code>.</p>
`;
  return shell("frames.dev", body);
}

export function renderFrame(
  ds: Dataset,
  entities: Entity[],
  page: { limit: number; next_cursor: string | null; has_more: boolean },
  filters: Record<string, string[]>,
  countryCounts: Map<string, number>,
): HtmlEscapedString {
  const fieldOrder = Object.keys(ds.schema.fields);
  const visibleFields = fieldOrder.slice(0, Math.min(6, fieldOrder.length));
  const githubUrl = `https://github.com/${ds.user}/${ds.repo}${
    ds.frame_path ? `/tree/main/${ds.frame_path}` : ""
  }`;
  const apiUrl = `/api/v1/${ds.user}/${ds.repo}${ds.frame_path ? "/" + ds.frame_path : ""}/entities`;
  const mcpUrl = `/mcp/${ds.user}/${ds.repo}${ds.frame_path ? "/" + ds.frame_path : ""}`;
  const activeCountries = filters.hq_country ?? [];
  const countryRow = ds.schema.fields.hq_country?.values ?? [];
  const path = `/${ds.user}/${ds.repo}${ds.frame_path ? "/" + ds.frame_path : ""}`;

  const filterChip = (val: string, count: number, isActive: boolean) => {
    let next = activeCountries.slice();
    if (isActive) next = next.filter((v) => v !== val);
    else next.push(val);
    const qs = next.length > 0 ? `?filter[hq_country]=${next.join(",")}` : "";
    return html`<a class="chip ${isActive ? "active" : ""}" href="${path + qs}">${val} <span style="opacity:.6">${count}</span></a>`;
  };

  const filterBar = countryRow.length > 0 ? html`
<div class="filter-bar">
  <span style="color:var(--muted)">filter:</span>
  ${countryRow
    .filter((c) => (countryCounts.get(c) ?? 0) > 0)
    .map((c) => filterChip(c, countryCounts.get(c) ?? 0, activeCountries.includes(c)))}
  ${activeCountries.length > 0 ? html` <a href="${path}" style="color:var(--muted)">clear</a>` : ""}
</div>
  ` : "";

  const rows = entities.map((e) => {
    const cells = visibleFields.map((f) => html`<td>${fieldCell(e.fields[f], e.evidence[f])}</td>`);
    return html`<tr>
      <td><a href="${path}/entities/${e.entity_id}"><strong>${String(e.fields.name ?? e.entity_id)}</strong></a><br><span class="id mono">${e.entity_id}</span></td>
      ${cells.slice(1)}
    </tr>`;
  });

  const colHeaders = visibleFields.map((f, i) =>
    i === 0 ? html`<th>${f}</th>` : html`<th>${f}</th>`,
  );

  const body = html`
<h1>${ds.schema.name}</h1>
<p class="lead">${ds.schema.description ?? ""}</p>

<dl class="meta">
  <span><dt>repo:</dt> <dd><a href="${githubUrl}">${ds.user}/${ds.repo}${ds.frame_path ? "/" + ds.frame_path : ""}</a></dd></span>
  <span><dt>commit:</dt> <dd class="mono">${ds.sha.slice(0, 7)}</dd></span>
  <span><dt>entities:</dt> <dd>${[...ds.entities.values()].filter((e) => !e.removed).length}</dd></span>
  <span><dt>updated:</dt> <dd>${ds.max_ts.split("T")[0]}</dd></span>
</dl>

<div class="actions">
  <a class="btn primary" href="${apiUrl}">JSON API</a>
  <a class="btn" href="/api/v1${path}/schema">Schema</a>
  <a class="btn" href="${githubUrl}">View on GitHub</a>
  <a class="btn" href="#connect">Connect to AI agent</a>
</div>

<h2>Entities</h2>
${filterBar}

<table class="entities">
  <thead><tr>${colHeaders}</tr></thead>
  <tbody>${rows}</tbody>
</table>

<div class="pager">
  ${page.next_cursor
    ? html`<a class="btn" href="${path}?cursor=${page.next_cursor}${
        activeCountries.length > 0 ? `&filter[hq_country]=${activeCountries.join(",")}` : ""
      }">next →</a>`
    : html`<span style="color:var(--muted)">end of results</span>`}
</div>

<details class="connect" id="connect">
  <summary>Connect this dataset to your AI agent</summary>
  <p style="color:var(--muted); margin: 12px 0;">Add to your <code>.mcp.json</code> for read-only access:</p>
  <pre><code>${html`{
  "mcpServers": {
    "${ds.schema.name}": {
      "type": "http",
      "url": "${mcpUrl}"
    }
  }
}`}</code></pre>
  <p style="color:var(--muted); font-size:12px;">MCP HTTP runtime — coming next. JSON API works today.</p>
</details>
`;
  return shell(`${ds.schema.name} — frames.dev`, body);
}

export function renderEntity(ds: Dataset, ent: Entity): HtmlEscapedString {
  const fieldRows = Object.keys(ds.schema.fields).map((f) => {
    const v = ent.fields[f];
    const ev = ent.evidence[f];
    const fact = ent.facts[f];
    const required = ds.schema.fields[f]?.required;
    return html`<tr>
      <td><strong>${f}</strong>${required ? html` <span class="badge-required">required</span>` : ""}</td>
      <td>${fieldCell(v, ev)}</td>
      <td>${ev ? html`<a href="${ev.url}" target="_blank" rel="noopener">${(() => { try { return new URL(ev.url).host; } catch { return ev.url; } })()}</a>` : html`<span class="empty">—</span>`}</td>
      <td><span class="mono" style="color:var(--muted)">${fact?.ts.split("T")[0] ?? ""}</span></td>
    </tr>`;
  });

  const evidenceList = Object.entries(ent.evidence).map(([f, src]) => html`
    <div style="margin-bottom: 16px; padding: 12px 14px; background: white; border: 1px solid var(--border); border-radius: 6px;">
      <div style="font-weight: 600; font-size: 13px; margin-bottom: 6px;">${f} = ${html`<code>${typeof ent.fields[f] === "string" ? `"${String(ent.fields[f])}"` : String(ent.fields[f])}</code>`}</div>
      <div style="font-size: 12px; color: var(--muted); margin-bottom: 8px;">
        <a href="${src.url}" target="_blank" rel="noopener">${src.url}</a> · retrieved ${src.retrieved_at}
      </div>
      <blockquote style="margin: 0; padding-left: 12px; border-left: 3px solid var(--accent-soft); color: var(--fg); font-size: 13px; line-height: 1.55;">"${src.excerpt ?? "(no excerpt)"}"</blockquote>
    </div>
  `);

  const path = `/${ds.user}/${ds.repo}${ds.frame_path ? "/" + ds.frame_path : ""}`;

  const body = html`
<p style="margin: 0 0 8px; font-size: 13px; color: var(--muted);">
  <a href="${path}">← ${ds.schema.name}</a>
</p>
<h1>${String(ent.fields.name ?? ent.entity_id)}</h1>
<p class="lead"><span class="mono">${ent.entity_id}</span></p>

<h2>Fields</h2>
<table class="schema-table">
  <thead><tr><th>field</th><th>value</th><th>source</th><th>set</th></tr></thead>
  <tbody>${fieldRows}</tbody>
</table>

<h2>Evidence</h2>
<p class="lead">Every field is backed by a verbatim excerpt from the source. Click through to the original.</p>
${evidenceList}
`;
  return shell(`${ent.fields.name ?? ent.entity_id} — frames.dev`, body);
}
