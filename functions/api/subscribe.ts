/**
 * POST /api/subscribe — email signup for the studio list.
 *
 * Same-origin, so any form on the site can reach it with no CORS and no
 * third-party script on any page. The provider credential never leaves
 * this Function.
 *
 * See docs/superpowers/specs/2026-08-24-dryasstudio-site-design.md §5.
 */

interface Env {
  /** Buttondown API key. Unbound is a defined state — see below. */
  BUTTONDOWN_API_KEY?: string;
}

const LISTS = {
  updates: 'updates',
} as const;

type List = keyof typeof LISTS;

// Deliberately permissive. Real validation is the confirmation email; a
// stricter pattern only rejects addresses that are in fact valid.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Dispatch on method explicitly.
 *
 * Exporting only `onRequestPost` looks equivalent but is not: Pages then
 * lets a GET fall through to the ASSET handler, which answers /api/subscribe
 * with the home page and a 200. Verified against `wrangler pages dev`. An
 * endpoint must never answer a wrong-method request with a page.
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== 'POST') {
    return new Response('Method not allowed.', {
      status: 405,
      headers: { allow: 'POST', 'content-type': 'text/plain; charset=utf-8' },
    });
  }
  return subscribe(context);
};

const subscribe: PagesFunction<Env> = async ({ request, env }) => {
  const submission = await read(request);
  if (!submission) return json(400, { error: 'Malformed request body.' });

  const { email, list, company, viaForm } = submission;

  // Honeypot. A filled `company` is a bot, and a bot should not learn that
  // it was caught — the response is byte-identical to a real success.
  if (company) return done(viaForm);

  if (!EMAIL.test(email)) {
    return viaForm
      ? page(400, 'That does not look like an email address.')
      : json(400, { error: 'That does not look like an email address.' });
  }

  if (!(list in LISTS)) return json(400, { error: 'Unknown list.' });

  /*
   * Unconfigured is a DEFINED state, not a crash: 501, and the form says
   * "not wired up yet". Local dev and preview deploys work without a
   * credential, which is the point.
   */
  if (!env.BUTTONDOWN_API_KEY) {
    return viaForm
      ? page(501, 'Signup is not wired up yet. Try again soon.')
      : json(501, { error: 'No list provider configured.' });
  }

  try {
    const ok = await subscribeViaButtondown(env.BUTTONDOWN_API_KEY, email, list as List);
    if (!ok) {
      return viaForm
        ? page(502, 'That did not go through. Try again.')
        : json(502, { error: 'The list provider rejected that.' });
    }
  } catch (error) {
    console.error('subscribe failed', error);
    return viaForm
      ? page(502, 'That did not go through. Try again.')
      : json(502, { error: 'The list provider is unreachable.' });
  }

  return done(viaForm);
};

/**
 * The provider adapter. Swapping Buttondown for something else is this
 * function and the env var name — nothing above it changes.
 *
 * An already-subscribed address counts as success: from the visitor's side
 * "you're on the list" is true, and surfacing a 400 here would leak who is
 * already subscribed.
 */
async function subscribeViaButtondown(
  apiKey: string,
  email: string,
  list: List,
): Promise<boolean> {
  const response = await fetch('https://api.buttondown.com/v1/subscribers', {
    method: 'POST',
    headers: {
      authorization: `Token ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ email_address: email, tags: [LISTS[list]] }),
  });

  if (response.ok) return true;
  if (response.status === 400) {
    const body = await response.text();
    return /already/i.test(body);
  }
  return false;
}

/** Reads either a JSON body (the fetch path) or a form post (the no-JS path). */
async function read(request: Request): Promise<
  { email: string; list: string; company: string; viaForm: boolean } | null
> {
  const type = request.headers.get('content-type') ?? '';

  try {
    if (type.includes('application/json')) {
      const body = (await request.json()) as Record<string, unknown>;
      return {
        email: String(body.email ?? '').trim(),
        list: String(body.list ?? ''),
        company: String(body.company ?? '').trim(),
        viaForm: false,
      };
    }

    const form = await request.formData();
    return {
      email: String(form.get('email') ?? '').trim(),
      list: String(form.get('list') ?? ''),
      company: String(form.get('company') ?? '').trim(),
      viaForm: true,
    };
  } catch {
    return null;
  }
}

function done(viaForm: boolean) {
  const message = "You're on the list. Check your inbox to confirm.";
  return viaForm ? page(200, message) : json(200, { ok: true });
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

/**
 * The no-JS response. The form posts natively when scripting is off, so it
 * needs somewhere to land that is not raw JSON.
 */
function page(status: number, message: string) {
  const safe = message.replace(/[<>&]/g, (c) => `&#${c.charCodeAt(0)};`);
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Studio news by email — Dryas Studio</title>
<meta name="robots" content="noindex">
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
       background:#1B342C;color:#C9CFC4;font-family:Archivo,system-ui,sans-serif;padding:24px}
  .box{max-width:460px}
  p{margin:0 0 24px;font:400 14px/1.7 'JetBrains Mono',monospace;letter-spacing:.06em;
     color:#EFEEE8}
  a{display:inline-block;font:500 13px 'JetBrains Mono',monospace;letter-spacing:.1em;
    color:#EFEEE8;border:1px solid #4A5D53;padding:13px 24px;border-radius:2px;
    text-decoration:none}
  a:hover{border-color:#EFEEE8}
</style>
</head>
<body><div class="box"><p>${safe}</p><a href="/">← Back to the studio</a></div></body>
</html>`;

  return new Response(html, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}
