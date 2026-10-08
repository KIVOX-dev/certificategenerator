/**
 * Indian mobile number normalisation. Accepts 9876543210, +919876543210,
 * +91 98765 43210, 09876543210, 91-9876543210. Returns "+919876543210" or null.
 */
export function normalizeIndianPhone(input: string): string | null {
  if (typeof input !== 'string') return null;
  let digits = input.replace(/[\s\-().]/g, '');
  if (!/^\+?\d+$/.test(digits)) return null;
  digits = digits.replace(/^\+/, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return `+91${digits}`;
}

/** "+919876543210" -> "******3210" (safe to show publicly). */
export function maskPhone(normalized: string): string {
  const d = normalized.replace(/\D/g, '');
  return `${'*'.repeat(6)}${d.slice(-4)}`;
}
