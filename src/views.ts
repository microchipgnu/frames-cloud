import { html, raw } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";
import type { Dataset, Entity, Source } from "./types.ts";

const FONT_LINK = raw(`
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
`);

const STYLE = raw(`
  :root {
    --canvas: #FBFBFA;
    --surface: #FFFFFF;
    --surface-soft: #F7F6F3;
    --ink: #111111;
    --ink-2: #2F3437;
    --muted: #787774;
    --border: #EAEAEA;
    --border-soft: rgba(0,0,0,0.04);

    --blue-bg: #E1F3FE;   --blue-fg: #1F6C9F;
    --green-bg: #EDF3EC;  --green-fg: #346538;
    --yellow-bg: #FBF3DB; --yellow-fg: #956400;
    --red-bg: #FDEBEC;    --red-fg: #9F2F2D;

    --serif: 'Instrument Serif', 'Newsreader', 'Lyon Text', Georgia, serif;
    --sans: 'Geist', 'SF Pro Display', system-ui, -apple-system, 'Helvetica Neue', sans-serif;
    --mono: 'Geist Mono', 'SF Mono', 'JetBrains Mono', ui-monospace, monospace;

    --easeOut: cubic-bezier(0.16, 1, 0.3, 1);
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: var(--canvas); color: var(--ink);
    font-family: var(--sans); font-size: 15.5px; line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  ::selection { background: var(--yellow-bg); color: var(--ink); }

  /* ambient drift, fixed under everything */
  .ambient {
    position: fixed; inset: 0; z-index: -1; pointer-events: none;
    background:
      radial-gradient(800px 600px at 80% 5%, rgba(225, 243, 254, 0.35), transparent 60%),
      radial-gradient(700px 500px at 5% 90%, rgba(251, 243, 219, 0.25), transparent 60%);
  }

  a { color: var(--ink); text-decoration: none; }
  a:hover { text-decoration: underline; text-underline-offset: 3px; }
  a.muted { color: var(--muted); }

  /* Headings — editorial serif, tight tracking */
  h1, h2, h3 { font-family: var(--serif); font-weight: 400; color: var(--ink); margin: 0; line-height: 1.1; letter-spacing: -0.02em; }
  .display { font-size: clamp(48px, 6vw, 72px); letter-spacing: -0.035em; line-height: 1.02; }
  h1.page { font-size: clamp(36px, 4.4vw, 56px); letter-spacing: -0.03em; }
  h1.entity { font-size: clamp(40px, 5vw, 64px); letter-spacing: -0.035em; }
  h2 { font-size: clamp(22px, 2.4vw, 30px); letter-spacing: -0.02em; }

  /* Tiny uppercase section label */
  .eyebrow {
    font-family: var(--mono); font-size: 11px; text-transform: uppercase;
    letter-spacing: 0.1em; color: var(--muted); margin: 0 0 12px;
  }

  /* Layout */
  header.site {
    position: sticky; top: 0; z-index: 20;
    background: rgba(251, 251, 250, 0.85);
    backdrop-filter: saturate(140%) blur(12px);
    -webkit-backdrop-filter: saturate(140%) blur(12px);
    border-bottom: 1px solid var(--border);
  }
  header.site .row {
    max-width: 1180px; margin: 0 auto; padding: 16px 32px;
    display: flex; align-items: baseline; justify-content: space-between; gap: 32px;
  }
  header.site .brand {
    font-family: var(--serif); font-size: 22px; letter-spacing: -0.02em;
    color: var(--ink);
  }
  header.site nav { display: flex; gap: 24px; font-size: 13px; }
  header.site nav a { color: var(--muted); }
  header.site nav a:hover { color: var(--ink); text-decoration: none; }

  main { max-width: 1180px; margin: 0 auto; padding: 64px 32px 128px; }
  main.narrow { max-width: 940px; }

  .lead {
    font-family: var(--serif); font-size: clamp(20px, 2.1vw, 26px);
    line-height: 1.4; color: var(--ink-2); letter-spacing: -0.015em;
    max-width: 38em; margin: 0 0 32px;
  }
  p { color: var(--ink-2); max-width: 56ch; }
  p.muted { color: var(--muted); }

  code, .mono { font-family: var(--mono); font-size: 0.92em; }
  code.inline {
    background: var(--surface-soft); border: 1px solid var(--border);
    padding: 1px 6px; border-radius: 4px; font-size: 0.85em;
  }

  /* Masthead meta — newspaper style */
  .masthead {
    display: flex; flex-wrap: wrap; gap: 0; margin: 0 0 56px;
    border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    padding: 14px 0; font-family: var(--mono); font-size: 12px;
  }
  .masthead .cell { padding: 0 20px; border-right: 1px solid var(--border); display: flex; gap: 8px; align-items: baseline; }
  .masthead .cell:first-child { padding-left: 0; }
  .masthead .cell:last-child { border-right: none; }
  .masthead .key { color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; font-size: 10.5px; }
  .masthead .val { color: var(--ink); }

  /* Action row — text links, no button blob */
  .actions {
    display: flex; flex-wrap: wrap; gap: 24px; margin: 0 0 64px;
    font-size: 14px;
  }
  .actions a {
    color: var(--ink); display: inline-flex; align-items: center; gap: 6px;
    border-bottom: 1px solid var(--border); padding-bottom: 2px;
    transition: border-color 200ms var(--easeOut);
  }
  .actions a:hover { text-decoration: none; border-color: var(--ink); }
  .actions a .arrow { font-family: var(--mono); }

  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--ink); color: #FFFFFF !important;
    padding: 12px 20px; border-radius: 6px;
    font-size: 14px; font-weight: 500; letter-spacing: -0.005em;
    transition: transform 120ms var(--easeOut), background 200ms var(--easeOut);
  }
  .btn-primary:hover { background: #2A2A2A; text-decoration: none; }
  .btn-primary:active { transform: scale(0.98); }

  /* Pastel chips */
  .chip {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 10px; border-radius: 9999px;
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    letter-spacing: 0.06em; text-transform: uppercase;
    background: var(--surface-soft); color: var(--ink-2);
    border: 1px solid var(--border);
  }
  .chip.blue   { background: var(--blue-bg);   color: var(--blue-fg);   border-color: transparent; }
  .chip.green  { background: var(--green-bg);  color: var(--green-fg);  border-color: transparent; }
  .chip.yellow { background: var(--yellow-bg); color: var(--yellow-fg); border-color: transparent; }
  .chip.red    { background: var(--red-bg);    color: var(--red-fg);    border-color: transparent; }
  .chip .count { font-weight: 400; opacity: 0.6; letter-spacing: 0; }

  /* Filter bar */
  .filter-bar {
    display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
    margin: 16px 0 24px; font-size: 12px;
  }
  .filter-bar .label {
    font-family: var(--mono); font-size: 11px; text-transform: uppercase;
    letter-spacing: 0.08em; color: var(--muted); margin-right: 8px;
  }
  .filter-bar a.chip { color: var(--muted); }
  .filter-bar a.chip:hover { text-decoration: none; color: var(--ink); }
  .filter-bar a.chip.active { background: var(--ink); color: #FFFFFF; border-color: var(--ink); }
  .filter-bar a.chip.active .count { color: #FFFFFF; opacity: 0.7; }
  .filter-bar a.clear { color: var(--muted); margin-left: 8px; font-family: var(--mono); font-size: 11px; }

  /* Faux-OS window chrome around the entity table */
  .frame-window {
    background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
    overflow: hidden; transition: border-color 200ms var(--easeOut);
  }
  .frame-window .chrome {
    display: flex; align-items: center; gap: 6px;
    padding: 12px 16px; border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  .frame-window .chrome .dot { width: 9px; height: 9px; border-radius: 50%; background: #E5E5E2; }
  .frame-window .chrome .filename {
    margin-left: 12px; font-family: var(--mono); font-size: 11px; color: var(--muted);
    text-transform: lowercase;
  }

  /* Entity table */
  table.entities { width: 100%; border-collapse: collapse; font-size: 14px; }
  table.entities th, table.entities td {
    padding: 16px 20px; text-align: left; vertical-align: top;
    border-bottom: 1px solid var(--border);
  }
  table.entities tr:last-child td { border-bottom: none; }
  table.entities th {
    background: transparent; font-family: var(--mono); font-weight: 500;
    font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--muted); padding-top: 14px; padding-bottom: 14px;
  }
  table.entities tr:hover td { background: var(--surface-soft); }
  table.entities td.name a { font-weight: 500; color: var(--ink); }
  table.entities td.name a:hover { text-decoration: none; color: var(--blue-fg); }
  table.entities td .id { display: block; font-family: var(--mono); font-size: 11.5px; color: var(--muted); margin-top: 2px; }
  .empty { color: var(--muted); }
  .empty::before { content: "—"; }

  /* Source provenance — refined hover card */
  .src {
    display: inline-block; cursor: help; position: relative;
    font-family: var(--mono); color: var(--muted); margin-left: 6px;
    font-size: 11px; vertical-align: super; line-height: 1; opacity: 0.6;
  }
  .src:hover { opacity: 1; color: var(--ink); }
  .src .tip {
    position: absolute; left: 0; top: calc(100% + 8px);
    width: 380px; max-width: 80vw; padding: 16px 18px;
    background: var(--surface); color: var(--ink);
    border: 1px solid var(--border); border-radius: 8px;
    box-shadow: 0 1px 0 rgba(0,0,0,0.02), 0 8px 24px rgba(17, 17, 17, 0.06);
    z-index: 30; pointer-events: none;
    opacity: 0; transform: translateY(-4px);
    transition: opacity 140ms var(--easeOut), transform 140ms var(--easeOut);
  }
  .src:hover .tip { opacity: 1; transform: translateY(0); pointer-events: auto; }
  .src .tip .url {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    word-break: break-all; margin-bottom: 10px; letter-spacing: 0;
  }
  .src .tip .quote {
    font-family: var(--serif); font-style: italic; font-size: 15px;
    color: var(--ink); line-height: 1.5; letter-spacing: -0.005em;
    margin-bottom: 10px;
  }
  .src .tip .meta {
    font-family: var(--mono); font-size: 10.5px; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.08em;
  }

  /* Pager */
  .pager { display: flex; gap: 16px; align-items: center; margin-top: 32px; font-size: 13px; font-family: var(--mono); }
  .pager a { color: var(--ink); border-bottom: 1px solid var(--border); padding-bottom: 2px; }
  .pager a:hover { text-decoration: none; border-color: var(--ink); }
  .pager span.end { color: var(--muted); }

  /* Repo index frame cards */
  .frame-grid { display: grid; gap: 12px; margin-bottom: 56px; }
  .frame-card {
    display: block; padding: 28px 32px;
    background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
    color: var(--ink); transition: border-color 200ms var(--easeOut), box-shadow 200ms var(--easeOut);
  }
  .frame-card:hover {
    text-decoration: none; border-color: var(--ink-2);
    box-shadow: 0 1px 0 rgba(0,0,0,0.02), 0 8px 24px rgba(17,17,17,0.04);
  }
  .frame-card .name { font-family: var(--serif); font-size: 28px; letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 4px; }
  .frame-card .path { font-family: var(--mono); font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px; }
  .frame-card .desc { color: var(--ink-2); font-size: 15px; line-height: 1.5; max-width: 60ch; margin-bottom: 16px; }
  .frame-card .row { display: flex; gap: 18px; font-family: var(--mono); font-size: 11.5px; color: var(--muted); }
  .frame-card .row .err { color: var(--red-fg); }

  /* Home — bento */
  .bento { display: grid; gap: 16px; grid-template-columns: 2fr 1fr; margin: 0 0 80px; }
  .bento .cell {
    background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
    padding: 36px;
  }
  .bento .cell .eyebrow { margin-bottom: 16px; }
  .bento .cell h2 { margin-bottom: 16px; }
  .bento .cell p { color: var(--ink-2); margin: 0 0 18px; max-width: none; }
  .bento .cell.tall { grid-row: span 2; }
  @media (max-width: 760px) {
    .bento { grid-template-columns: 1fr; }
    .bento .cell.tall { grid-row: auto; }
  }

  /* Entity view */
  .breadcrumb { font-family: var(--mono); font-size: 12px; color: var(--muted); margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.08em; }
  .breadcrumb a { color: var(--muted); }
  .breadcrumb a:hover { color: var(--ink); text-decoration: none; }
  .entity-id { font-family: var(--mono); font-size: 13px; color: var(--muted); margin-bottom: 56px; }

  .field-grid { display: grid; grid-template-columns: 200px 1fr auto; gap: 0; margin-bottom: 64px; border-top: 1px solid var(--border); }
  .field-grid > div { padding: 16px 0; border-bottom: 1px solid var(--border); display: flex; align-items: baseline; }
  .field-grid .key { font-family: var(--mono); font-size: 11.5px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; padding-right: 24px; }
  .field-grid .key .req { display: inline-block; margin-left: 6px; padding: 1px 6px; background: var(--yellow-bg); color: var(--yellow-fg); border-radius: 9999px; font-size: 9.5px; letter-spacing: 0.04em; }
  .field-grid .val { color: var(--ink); }
  .field-grid .ts { font-family: var(--mono); font-size: 11px; color: var(--muted); padding-left: 24px; white-space: nowrap; }

  /* Evidence cards — editorial pull-quote */
  .evidence { display: grid; gap: 16px; }
  .evidence article {
    background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
    padding: 32px; position: relative;
  }
  .evidence article::before {
    content: ""; position: absolute; left: 0; top: 24px; bottom: 24px;
    width: 3px; background: var(--surface-soft); border-radius: 0 2px 2px 0;
  }
  .evidence article.blue::before { background: var(--blue-bg); }
  .evidence article.green::before { background: var(--green-bg); }
  .evidence article.yellow::before { background: var(--yellow-bg); }
  .evidence article .field-name {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;
  }
  .evidence article .field-value {
    font-family: var(--serif); font-size: 26px; line-height: 1.15;
    letter-spacing: -0.02em; color: var(--ink); margin-bottom: 18px;
  }
  .evidence article blockquote {
    margin: 0 0 16px; font-family: var(--serif); font-style: italic;
    font-size: 19px; line-height: 1.45; letter-spacing: -0.01em; color: var(--ink-2);
  }
  .evidence article blockquote::before { content: "\\201C"; margin-right: 2px; }
  .evidence article blockquote::after { content: "\\201D"; margin-left: 2px; }
  .evidence article .source-meta {
    display: flex; align-items: baseline; justify-content: space-between; gap: 16px;
    padding-top: 14px; border-top: 1px solid var(--border);
    font-family: var(--mono); font-size: 11.5px; color: var(--muted);
  }
  .evidence article .source-meta a { color: var(--ink); }

  /* Connect details — accordion, no card */
  details.connect {
    margin: 80px 0 0; padding-top: 24px; border-top: 1px solid var(--border);
  }
  details.connect summary {
    list-style: none; cursor: pointer; display: flex; align-items: baseline;
    gap: 12px; font-family: var(--serif); font-size: 22px; letter-spacing: -0.02em; color: var(--ink);
  }
  details.connect summary::-webkit-details-marker { display: none; }
  details.connect summary::before {
    content: "+"; font-family: var(--mono); color: var(--muted); font-size: 18px;
    transition: transform 200ms var(--easeOut);
  }
  details.connect[open] summary::before { content: "−"; }
  details.connect .body { padding-top: 20px; }
  details.connect pre {
    background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
    padding: 16px 20px; overflow-x: auto; font-family: var(--mono); font-size: 12.5px;
    line-height: 1.55; color: var(--ink-2); margin: 12px 0;
  }
  details.connect .note { font-family: var(--mono); font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 16px; }

  /* Scroll-fade — only what we mark */
  [data-fade] {
    opacity: 0; transform: translateY(12px);
    transition: opacity 600ms var(--easeOut) calc(var(--idx, 0) * 80ms),
                transform 600ms var(--easeOut) calc(var(--idx, 0) * 80ms);
  }
  [data-fade].in-view { opacity: 1; transform: translateY(0); }
  @media (prefers-reduced-motion: reduce) {
    [data-fade] { opacity: 1; transform: none; transition: none; }
  }
`);

const SCROLL_JS = raw(`
  <script>
    (function() {
      var els = document.querySelectorAll('[data-fade]');
      els.forEach(function(el, i) { el.style.setProperty('--idx', String(i)); });
      if (!('IntersectionObserver' in window)) {
        els.forEach(function(el) { el.classList.add('in-view'); });
        return;
      }
      var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
      els.forEach(function(el) { io.observe(el); });
    })();
  </script>
`);

function shell(
  titleText: string,
  body: HtmlEscapedString | string,
  opts: { narrow?: boolean } = {},
): HtmlEscapedString {
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
<div class="ambient" aria-hidden="true"></div>
<header class="site">
  <div class="row">
    <a href="/" class="brand">frames</a>
    <nav>
      <a href="/microchipgnu/ai-agent-wallets-eu">example</a>
      <a href="/microchipgnu/ai-agent-wallets">multi-frame</a>
      <a href="https://github.com/microchipgnu/frames-cloud">source</a>
    </nav>
  </div>
</header>
<main${opts.narrow ? raw(' class="narrow"') : ""}>
${body}
</main>
${SCROLL_JS}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function chipForValue(value: string): "blue" | "green" | "yellow" | "" {
  if (value.length === 2 && value === value.toUpperCase()) return "blue";
  if (/^(payment_infra|wallet|key_management|custody)$/.test(value)) return "green";
  if (/^(preseed|seed|series_[a-c])$/.test(value)) return "yellow";
  return "";
}

function srcTip(src: Source | undefined): HtmlEscapedString | "" {
  if (!src) return "";
  return html`<span class="src" tabindex="0" aria-label="source">↗
  <span class="tip">
    <span class="url">${src.url}</span>
    <span class="quote">${src.excerpt ?? "(no excerpt)"}</span>
    <span class="meta">retrieved ${src.retrieved_at}</span>
  </span>
</span>`;
}

function fieldCell(value: unknown, src: Source | undefined): HtmlEscapedString {
  if (value === undefined || value === null) {
    return html`<span class="empty"></span>`;
  }
  if (typeof value === "string" && value.startsWith("http")) {
    const host = (() => {
      try {
        return new URL(value).host;
      } catch {
        return value;
      }
    })();
    return html`<a href="${value}" target="_blank" rel="noopener">${host}</a>${srcTip(src)}`;
  }
  if (typeof value === "string") {
    const tone = chipForValue(value);
    if (tone) return html`<span class="chip ${tone}">${value}</span>${srcTip(src)}`;
    return html`<span>${value}</span>${srcTip(src)}`;
  }
  return html`<span>${String(value)}</span>${srcTip(src)}`;
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

export function renderHome(): HtmlEscapedString {
  const body = html`
<section data-fade style="margin-bottom: 96px;">
  <div class="eyebrow">frames.dev — runtime for evidence-backed datasets</div>
  <h1 class="display">A typed Wikipedia<br/>your agents can't fake.</h1>
  <p class="lead" style="margin-top: 28px;">
    Drop a <code class="inline">schema.yml</code> + <code class="inline">events.ndjson</code> into a public GitHub repo. A paginated JSON API and a public page come live at the matching URL — no signup, no deploy, no dashboard. Every cell in every dataset carries a verbatim quote from the source it came from.
  </p>
  <div style="margin-top: 36px;">
    <a class="btn-primary" href="/microchipgnu/ai-agent-wallets-eu">Open example dataset <span style="font-family: var(--mono);">→</span></a>
  </div>
</section>

<section data-fade>
  <div class="eyebrow">how it works</div>
  <div class="bento">
    <div class="cell tall">
      <h2>URL = filesystem path.</h2>
      <p>A frame is just a directory containing <code class="inline">schema.yml</code>. <code class="inline">frames.dev/&lt;user&gt;/&lt;repo&gt;</code> resolves to the frame at the repo root; sub-paths resolve to nested frames. Repos with multiple frames just put each one in its own folder — there is no manifest file, no registration step, no protocol change.</p>
      <p>Cache key is the commit SHA, so once a request lands, the projection is immutable forever. Pushes invalidate via webhook in under two seconds.</p>
    </div>
    <div class="cell">
      <div class="eyebrow">api</div>
      <h2 style="font-size: 22px;">Mirror at <code class="inline" style="font-size: 0.85em;">/api/v1</code></h2>
      <p>Cursor pagination, ETag/304, range filters, sparse fieldsets, evidence inline. Same paths, JSON output.</p>
    </div>
    <div class="cell">
      <div class="eyebrow">agents</div>
      <h2 style="font-size: 22px;">MCP HTTP runtime</h2>
      <p>Connect <code class="inline" style="font-size: 0.85em;">/mcp/&lt;user&gt;/&lt;repo&gt;</code> to your agent via HTTP MCP. Read with the same seven verbs the local server exposes today.</p>
    </div>
  </div>
</section>

<section data-fade>
  <div class="eyebrow">live datasets</div>
  <h2 style="margin-bottom: 24px;">Examples on this host</h2>
  <div class="frame-grid">
    <a class="frame-card" href="/microchipgnu/ai-agent-wallets-eu">
      <div class="name">ai_agent_wallets_eu</div>
      <div class="path">microchipgnu / ai-agent-wallets-eu</div>
      <div class="desc">EU-headquartered companies building programmable wallets and payment infrastructure for AI agents. 13 entities, every fact sourced from a verbatim web excerpt.</div>
      <div class="row"><span>13 entities</span><span>9 countries</span><span>single-frame repo</span></div>
    </a>
    <a class="frame-card" href="/microchipgnu/ai-agent-wallets">
      <div class="name">ai-agent-wallets</div>
      <div class="path">microchipgnu / ai-agent-wallets</div>
      <div class="desc">Multi-frame repo with sibling <code class="inline" style="font-size: 0.85em;">eu/</code> and <code class="inline" style="font-size: 0.85em;">us/</code> datasets sharing a field shape but differing on the <code class="inline" style="font-size: 0.85em;">hq_country</code> enum.</div>
      <div class="row"><span>2 frames</span><span>same schema, different scope</span></div>
    </a>
  </div>
</section>
`;
  return shell("frames.dev", body);
}

// ---------------------------------------------------------------------------
// Repo index (multi-frame, no root schema)
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
    return html`<a href="${url}" class="frame-card" data-fade>
  <div class="name">${f.schema_name ?? f.slug}</div>
  <div class="path">${f.frame_path || "(root)"}</div>
  ${f.description ? html`<div class="desc">${f.description.split("\n")[0]}</div>` : ""}
  <div class="row">
    ${f.entity_count !== undefined ? html`<span>${f.entity_count} ${f.entity_count === 1 ? "entity" : "entities"}</span>` : ""}
    ${f.max_ts ? html`<span>updated ${f.max_ts.split("T")[0]}</span>` : ""}
    ${f.error ? html`<span class="err">${f.error}</span>` : ""}
  </div>
</a>`;
  });

  const body = html`
<section data-fade>
  <div class="eyebrow">multi-frame repository</div>
  <h1 class="page">${user} / ${repo}</h1>
  <p class="lead">${frames.length} ${frames.length === 1 ? "frame" : "frames"} in this repo. Each is a directory with its own <code class="inline">schema.yml</code> and <code class="inline">events.ndjson</code>.</p>
</section>

<div class="masthead" data-fade>
  <span class="cell"><span class="key">repo</span><a class="val" href="${githubUrl}">github.com/${user}/${repo}</a></span>
  <span class="cell"><span class="key">commit</span><span class="val">${sha.slice(0, 7)}</span></span>
  <span class="cell"><span class="key">frames</span><span class="val">${frames.length}</span></span>
</div>

<div class="frame-grid">
  ${cards}
</div>

<section data-fade>
  <div class="eyebrow">api</div>
  <p class="muted" style="font-family: var(--mono); font-size: 13px;">GET /api/v1/${user}/${repo}/_frames &nbsp;·&nbsp; GET /api/v1/${user}/${repo}/&lt;frame_path&gt;/entities</p>
</section>
`;
  return shell(`${user}/${repo} — frames.dev`, body);
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
  const visibleFields = fieldOrder.slice(0, Math.min(6, fieldOrder.length));
  const githubUrl = `https://github.com/${ds.user}/${ds.repo}${
    ds.frame_path ? `/tree/main/${ds.frame_path}` : ""
  }`;
  const apiUrl = `/api/v1/${ds.user}/${ds.repo}${ds.frame_path ? "/" + ds.frame_path : ""}/entities`;
  const mcpUrl = `/mcp/${ds.user}/${ds.repo}${ds.frame_path ? "/" + ds.frame_path : ""}`;
  const activeCountries = filters.hq_country ?? [];
  const countryRow = ds.schema.fields.hq_country?.values ?? [];
  const path = `/${ds.user}/${ds.repo}${ds.frame_path ? "/" + ds.frame_path : ""}`;
  const totalEntities = [...ds.entities.values()].filter((e) => !e.removed).length;

  const filterChip = (val: string, count: number, isActive: boolean) => {
    let next = activeCountries.slice();
    if (isActive) next = next.filter((v) => v !== val);
    else next.push(val);
    const qs = next.length > 0 ? `?filter[hq_country]=${next.join(",")}` : "";
    return html`<a class="chip ${isActive ? "active" : ""}" href="${path + qs}">${val}<span class="count">${count}</span></a>`;
  };

  const filterBar =
    countryRow.length > 0
      ? html`<div class="filter-bar">
  <span class="label">hq_country</span>
  ${countryRow
    .filter((c) => (countryCounts.get(c) ?? 0) > 0)
    .map((c) => filterChip(c, countryCounts.get(c) ?? 0, activeCountries.includes(c)))}
  ${activeCountries.length > 0 ? html`<a class="clear" href="${path}">clear ↻</a>` : ""}
</div>`
      : "";

  const colHeaders = visibleFields.map((f) => html`<th>${f}</th>`);

  const rows = entities.map((e) => {
    const cells = visibleFields.slice(1).map((f) => html`<td>${fieldCell(e.fields[f], e.evidence[f])}</td>`);
    return html`<tr>
  <td class="name">
    <a href="${path}/entities/${e.entity_id}">${String(e.fields.name ?? e.entity_id)}</a>
    <span class="id">${e.entity_id}</span>
  </td>
  ${cells}
</tr>`;
  });

  const filename = ds.frame_path
    ? `${ds.repo}/${ds.frame_path}/events.ndjson`
    : `${ds.repo}/events.ndjson`;

  const body = html`
<section data-fade>
  <div class="eyebrow">${ds.entity_type ?? "entity"} · ${ds.user} / ${ds.repo}${ds.frame_path ? " / " + ds.frame_path : ""}</div>
  <h1 class="page">${ds.schema.name}</h1>
  <p class="lead">${(ds.schema.description ?? "").split("\n").join(" ").trim()}</p>
</section>

<div class="masthead" data-fade>
  <span class="cell"><span class="key">repo</span><a class="val" href="${githubUrl}">github.com/${ds.user}/${ds.repo}${ds.frame_path ? "/" + ds.frame_path : ""}</a></span>
  <span class="cell"><span class="key">commit</span><span class="val">${ds.sha.slice(0, 7)}</span></span>
  <span class="cell"><span class="key">entities</span><span class="val">${totalEntities}</span></span>
  <span class="cell"><span class="key">updated</span><span class="val">${ds.max_ts ? ds.max_ts.split("T")[0] : "—"}</span></span>
</div>

<div class="actions" data-fade>
  <a href="${apiUrl}">JSON API <span class="arrow">↗</span></a>
  <a href="/api/v1${path}/schema">Schema <span class="arrow">↗</span></a>
  <a href="${githubUrl}">GitHub <span class="arrow">↗</span></a>
  <a href="#connect">Connect to AI agent <span class="arrow">↓</span></a>
</div>

<section data-fade>
  <div class="eyebrow">entities · ${entities.length} of ${totalEntities}</div>
  ${filterBar}
  <div class="frame-window">
    <div class="chrome">
      <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      <span class="filename">${filename}</span>
    </div>
    <table class="entities">
      <thead><tr>${colHeaders}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  <div class="pager">
    ${page.next_cursor
      ? html`<a href="${path}?cursor=${page.next_cursor}${
          activeCountries.length > 0 ? `&filter[hq_country]=${activeCountries.join(",")}` : ""
        }">next page →</a>`
      : html`<span class="end">end of results</span>`}
  </div>
</section>

<details class="connect" id="connect">
  <summary>Connect this dataset to your AI agent</summary>
  <div class="body">
    <p class="muted">Add to your <code class="inline">.mcp.json</code>. Anonymous reads are free; writes will require an OAuth-scoped token (coming with the write API).</p>
    <pre><code>{
  "mcpServers": {
    "${ds.schema.name}": {
      "type": "http",
      "url": "${mcpUrl}"
    }
  }
}</code></pre>
    <p class="note">MCP HTTP runtime — coming next. JSON API works today.</p>
  </div>
</details>
`;
  return shell(`${ds.schema.name} — frames.dev`, body);
}

// ---------------------------------------------------------------------------
// Entity view (the evidence story)
// ---------------------------------------------------------------------------

function toneForField(field: string, value: unknown): string {
  if (typeof value !== "string") return "";
  if (field === "hq_country") return "blue";
  if (field === "category") return "green";
  if (field === "funding_stage") return "yellow";
  return "";
}

export function renderEntity(ds: Dataset, ent: Entity): HtmlEscapedString {
  const path = `/${ds.user}/${ds.repo}${ds.frame_path ? "/" + ds.frame_path : ""}`;

  const fieldGrid = Object.keys(ds.schema.fields).map((f) => {
    const v = ent.fields[f];
    const fact = ent.facts[f];
    const required = ds.schema.fields[f]?.required;
    const valueRender =
      v === undefined || v === null
        ? html`<span class="empty"></span>`
        : typeof v === "string" && v.startsWith("http")
          ? html`<a href="${v}" target="_blank" rel="noopener">${v}</a>`
          : typeof v === "string"
            ? (() => {
                const tone = toneForField(f, v);
                return tone ? html`<span class="chip ${tone}">${v}</span>` : html`<span>${v}</span>`;
              })()
            : html`<span>${String(v)}</span>`;
    return html`
      <div class="key">${f}${required ? html`<span class="req">REQ</span>` : ""}</div>
      <div class="val">${valueRender}</div>
      <div class="ts">${fact?.ts.split("T")[0] ?? "—"}</div>
    `;
  });

  const evidenceCards = Object.entries(ent.evidence).map(([f, src]) => {
    const v = ent.fields[f];
    const tone = toneForField(f, v);
    const valueDisplay = typeof v === "string" ? v : String(v);
    let host = src.url;
    try {
      host = new URL(src.url).host;
    } catch {}
    return html`<article class="${tone}" data-fade>
  <div class="field-name">${f}</div>
  <div class="field-value">${valueDisplay}</div>
  <blockquote>${src.excerpt ?? "(no excerpt)"}</blockquote>
  <div class="source-meta">
    <a href="${src.url}" target="_blank" rel="noopener">${host}</a>
    <span>retrieved ${src.retrieved_at}</span>
  </div>
</article>`;
  });

  const body = html`
<section data-fade>
  <div class="breadcrumb"><a href="${path}">← ${ds.schema.name}</a></div>
  <h1 class="entity">${String(ent.fields.name ?? ent.entity_id)}</h1>
  <div class="entity-id">${ent.entity_id}</div>
</section>

<section data-fade>
  <div class="eyebrow">fields</div>
  <div class="field-grid">
    ${fieldGrid}
  </div>
</section>

<section data-fade>
  <div class="eyebrow">evidence</div>
  <h2 style="margin-bottom: 24px;">Every field, sourced.</h2>
  <p class="muted" style="font-family: var(--sans); margin-bottom: 32px;">Each cell above came from a page on the open web. The verbatim excerpt that supports it appears below, alongside the URL and the date the page was read.</p>
  <div class="evidence">
    ${evidenceCards}
  </div>
</section>
`;
  return shell(`${ent.fields.name ?? ent.entity_id} — frames.dev`, body, { narrow: true });
}
