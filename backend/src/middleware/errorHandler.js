import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, _res, next) => next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));

export const errorHandler = (err, req, res, _next) => {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong';
  let details = err.details;

  if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = 'Validation failed';
    details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, [v.message]]));
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
    details = { [field]: [message] };
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON body';
  }

  if (status >= 500) console.error(`[${req.id}]`, err);

  res.status(status).json({
    success: false,
    message: status >= 500 && env.isProd ? 'Internal server error' : message,
    requestId: req.id,
    ...(details && { errors: details }),
    ...(!env.isProd && status >= 500 && { stack: err.stack }),
  });
};

export { ApiError };
