/** Escape user input before using it inside a RegExp. */
export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Prefix search on a lowercase-normalised field.
 * An anchored, case-sensitive regex (^term) lets MongoDB use a tight index range scan,
 * unlike /term/i which forces a full index or collection scan.
 */
export const prefix = (term) => new RegExp('^' + escapeRegex(term.toLowerCase()));

/** Build a { $gte, $lte } date range; `to` is inclusive of the whole day. */
export function dateRange(from, to) {
  if (!from && !to) return undefined;
  const range = {};
  if (from) range.$gte = new Date(from);
  if (to) {
    const end = new Date(to);
    end.setUTCHours(23, 59, 59, 999);
    range.$lte = end;
  }
  return range;
}

/** Run the page query and the count in parallel and return a standard envelope. */
export async function paginate(model, filter, { page, limit, sort, projection, populate }) {
  let q = model.find(filter, projection).sort(sort).skip((page - 1) * limit).limit(limit).lean();
  if (populate) q = q.populate(populate);
  const [items, total] = await Promise.all([q, model.countDocuments(filter)]);
  return {
    items,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}
