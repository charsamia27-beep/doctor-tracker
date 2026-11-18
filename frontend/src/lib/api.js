export class ApiError extends Error {
  constructor(message, status, errors, requestId) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.requestId = requestId;
  }
}

const CSRF_COOKIE = 'dt_csrf';
const UNSAFE = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);
// Requests that are safe to send twice: reads, and auth calls (a login/logout that never
// reached the API can simply be repeated). Creates/updates/deletes are never auto-retried.
const isRetryable = (method, path) => method === 'GET' || path.startsWith('/auth/');

function toQuery(params) {
  if (!params) return '';
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

let csrfPromise = null;
/** Double-submit CSRF token: read from cookie, or ask the API to issue one (deduplicated). */
async function getCsrfToken() {
  const existing = readCookie(CSRF_COOKIE);
  if (existing) return existing;
  csrfPromise ??= request('/auth/csrf')
    .then((j) => j.data.csrfToken)
    .finally(() => {
      csrfPromise = null;
    });
  return csrfPromise;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Thin fetch wrapper. Requests go to the same origin (/api/*) and Next.js rewrites
 * them to the Express server, so the httpOnly auth cookie is sent automatically.
 */
export async function request(path, { method = 'GET', body, params, signal, _retried, _attempt = 0 } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (UNSAFE.has(method)) headers['X-CSRF-Token'] = await getCsrfToken();

  let res;
  try {
    res = await fetch(`/api${path}${toQuery(params)}`, {
      method,
      signal,
      credentials: 'same-origin',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    // Network-level failure (offline, connection reset): retry safe requests once.
    if (_attempt === 0 && isRetryable(method, path)) {
      await wait(400);
      return request(path, { method, body, params, signal, _retried, _attempt: 1 });
    }
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }

  const json = await res.json().catch(() => null);

  // A 5xx without our JSON body means the request died in the proxy before reaching the API
  // (e.g. a stale keep-alive socket). Safe requests get one quiet retry.
  if (!json && res.status >= 500 && _attempt === 0 && isRetryable(method, path)) {
    await wait(400);
    return request(path, { method, body, params, signal, _retried, _attempt: 1 });
  }

  // CSRF cookie expired/rotated → fetch a fresh one and retry once.
  if (res.status === 403 && /csrf/i.test(json?.message || '') && !_retried) {
    document.cookie = `${CSRF_COOKIE}=; Max-Age=0; path=/`;
    return request(path, { method, body, params, signal, _retried: true, _attempt });
  }

  if (res.status === 401 && typeof window !== 'undefined' && !path.startsWith('/auth/')) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.assign(`/login?next=${next}`);
  }

  if (!res.ok) {
    const fallback = res.status >= 500 ? 'Server is not responding right now. Please try again.' : 'Something went wrong';
    throw new ApiError(json?.message || fallback, res.status, json?.errors, json?.requestId);
  }
  return json ?? {};
}

export const api = {
  get: (path, params, signal) => request(path, { params, signal }),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
