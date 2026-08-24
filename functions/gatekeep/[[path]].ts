/**
 * `/gatekeep/*` → the GATEKEEP Pages project.
 *
 * This is the whole of the two-repo domain split. Cloudflare Pages binds a
 * *hostname* to a project and has no native way to hand one path prefix to a
 * different project, so this repo owns dryasstudio.com and forwards the
 * prefix to a second deployment built from promprit/one-lane.
 *
 * `public/_routes.json` confines the Functions runtime to `/gatekeep*`.
 * Without it Pages would invoke a Worker for every request to the site.
 *
 * See docs/superpowers/specs/2026-08-24-dryasstudio-site-design.md §4.
 */

interface Env {
  /**
   * Origin of the GATEKEEP Pages deployment, e.g.
   * `https://gatekeep.pages.dev`. An environment variable rather than a
   * literal so preview and production can point at different deployments.
   *
   * Unbound is a defined state: the holding page below, not a 500. That is
   * what the site serves until the GATEKEEP project exists.
   */
  GATEKEEP_ORIGIN?: string;
}

const PREFIX = '/gatekeep';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // `/gatekeep` → `/gatekeep/`. one-lane sets `trailingSlash: true`, so every
  // real URL under the prefix ends in a slash; redirecting here keeps the
  // origin from having to answer for both shapes.
  if (url.pathname === PREFIX) {
    url.pathname = `${PREFIX}/`;
    return Response.redirect(url.toString(), 308);
  }

  if (!env.GATEKEEP_ORIGIN) return holdingPage();

  let origin: URL;
  try {
    origin = new URL(env.GATEKEEP_ORIGIN);
  } catch {
    // A malformed binding is an operator error, not a visitor's problem.
    console.error(`GATEKEEP_ORIGIN is not a valid URL: ${env.GATEKEEP_ORIGIN}`);
    return holdingPage();
  }

  /*
   * Strip the prefix before fetching.
   *
   * With `basePath: "/gatekeep"` and `output: "export"`, Next writes an
   * `out/` directory whose ROOT corresponds to the base path — `out/index.html`
   * is the page served at `/gatekeep/` — while the links and asset URLs
   * *inside* those files carry the prefix. So the origin is addressed without
   * it and the browser sees it everywhere.
   */
  const upstream = new URL(url.pathname.slice(PREFIX.length) || '/', origin);
  upstream.search = url.search;

  // Preserve method and headers so the origin can answer conditional requests
  // (If-None-Match) and range requests normally. `redirect: 'manual'` keeps an
  // origin-issued redirect visible to the browser rather than followed here.
  const response = await fetch(
    new Request(upstream, {
      method: request.method,
      headers: request.headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
    }),
  );

  /*
   * The response body is passed through UNMODIFIED. The HTML already carries
   * `/gatekeep`-prefixed links because of `basePath`; rewriting it here would
   * make this Function a second, invisible source of truth for the prefix.
   *
   * One header does need adjusting: a Location from the origin is relative to
   * the origin's root, so it needs the prefix put back.
   */
  const headers = new Headers(response.headers);
  const location = headers.get('location');
  if (location) {
    try {
      const target = new URL(location, upstream);
      if (target.origin === origin.origin) {
        headers.set('location', `${PREFIX}${target.pathname}${target.search}${target.hash}`);
      }
    } catch {
      // A Location we cannot parse is left exactly as the origin sent it.
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

/**
 * Served while `GATEKEEP_ORIGIN` is unbound — before the GATEKEEP Pages
 * project exists, and on a misconfigured binding. On-brand and honest rather
 * than an error page: the studio site links here prominently from day one.
 *
 * Inline styles, because a Function response is not part of the Astro build
 * and cannot reach its stylesheets. The palette is duplicated here and
 * nowhere else; `scripts/check-literals.mjs` scans `src/`, not `functions/`.
 */
function holdingPage(): Response {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gatekeep — Dryas Studio</title>
<meta name="robots" content="noindex">
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
       background:#10201B;color:#C9CFC4;font-family:Archivo,system-ui,sans-serif;padding:24px}
  .box{max-width:520px}
  .kicker{font:400 11px 'JetBrains Mono',monospace;letter-spacing:.18em;color:#7C8A83;
          text-transform:uppercase;margin:0 0 16px}
  h1{margin:0;font:500 56px/1 Archivo,system-ui,sans-serif;letter-spacing:.08em;color:#EFEEE8}
  p{margin:20px 0 28px;font:400 15px/1.7 Archivo,system-ui,sans-serif;color:#C9CFC4}
  a{display:inline-block;font:500 13px 'JetBrains Mono',monospace;letter-spacing:.1em;
    color:#EFEEE8;border:1px solid #4A5D53;padding:13px 24px;border-radius:2px;
    text-decoration:none}
  a:hover{border-color:#EFEEE8}
</style>
</head>
<body>
  <div class="box">
    <p class="kicker">A game by Dryas Studio — in development</p>
    <h1>GATEKEEP</h1>
    <p>Decide what gets through — and live with what you let in. This page is not live yet.
       Follow the build on the devlog in the meantime.</p>
    <a href="/devlog">← Read the devlog</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 503,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
