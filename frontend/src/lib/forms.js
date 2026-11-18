/** Map API validation errors ({ field: [msg] }) onto react-hook-form fields. Returns true if any were applied. */
export function applyServerErrors(error, setError) {
  const errs = error?.errors;
  if (!errs) return false;
  let applied = false;
  Object.entries(errs).forEach(([field, msgs]) => {
    if (field === '_form') return;
    setError(field, { type: 'server', message: Array.isArray(msgs) ? msgs[0] : String(msgs) });
    applied = true;
  });
  return applied;
}
