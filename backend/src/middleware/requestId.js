import { randomUUID } from 'node:crypto';

const VALID = /^[a-zA-Z0-9-]{8,64}$/;

/** Correlation id for logs, audit entries and error responses. */
export function requestId(req, res, next) {
  const incoming = req.get('x-request-id');
  req.id = incoming && VALID.test(incoming) ? incoming : randomUUID();
  res.set('X-Request-Id', req.id);
  next();
}
