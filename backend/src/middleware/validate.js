import { ApiError } from '../utils/ApiError.js';

/**
 * Validate request parts against zod schemas.
 * Parsed (coerced + stripped) values are written to req.valid so controllers
 * never touch raw, untrusted input.
 *
 * Query strings are validated in STRICT mode: any unknown parameter is rejected with 400.
 * With the 'simple' query parser, `?specialization[$ne]=x` arrives as a literal key named
 * "specialization[$ne]" — it could never become a Mongo operator, but silently ignoring it
 * would hide probing attempts and client bugs, so we refuse it explicitly.
 */
export const validate = (schemas) => (req, _res, next) => {
  req.valid = req.valid || {};
  for (const part of ['params', 'query', 'body']) {
    let schema = schemas[part];
    if (!schema) continue;
    if (part === 'query' && typeof schema.strict === 'function') schema = schema.strict();

    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const { fieldErrors, formErrors } = result.error.flatten();
      return next(ApiError.badRequest('Validation failed', { ...fieldErrors, ...(formErrors.length && { _form: formErrors }) }));
    }
    req.valid[part] = result.data;
  }
  next();
};
