// Forwards rejected promises to Express' error middleware (Express 4 does not do this natively).
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
