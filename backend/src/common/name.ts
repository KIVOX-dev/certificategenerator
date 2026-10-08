/**
 * Trim, collapse whitespace, validate. If the name is plain ASCII typed all in
 * lower or upper case it is converted to Title Case; otherwise it is preserved.
 * Returns null when invalid.
 */
export function normalizeName(input: string): string | null {
  if (typeof input !== 'string') return null;
  let name = input.replace(/\s+/g, ' ').trim();
  if (name.length < 2 || name.length > 80) return null;
  if (!/^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u.test(name)) return null;
  if (!/\p{L}{2}/u.test(name)) return null;
  const ascii = /^[\x20-\x7E]+$/.test(name);
  if (ascii && (name === name.toLowerCase() || name === name.toUpperCase())) {
    name = name.toLowerCase().replace(/(^|[\s.'’-])([a-z])/g, (_m, p, c) => p + c.toUpperCase());
  }
  return name;
}
