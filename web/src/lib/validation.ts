/** Mirrors the backend rules (backend/src/common/phone.ts and name.ts). The server re-validates everything. */
export function normalizeIndianPhone(input: string): string | null {
  let digits = (input ?? '').replace(/[\s\-().]/g, '');
  if (!/^\+?\d+$/.test(digits)) return null;
  digits = digits.replace(/^\+/, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

export function cleanName(input: string): string {
  return (input ?? '').replace(/\s+/g, ' ').trim();
}

export function isValidName(name: string): boolean {
  return name.length >= 2 && name.length <= 80 && /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u.test(name) && /\p{L}{2}/u.test(name);
}

export type FormErrors = { fullName?: 'INVALID_NAME'; phone?: 'INVALID_PHONE' };

export function validateForm(fullName: string, phone: string): FormErrors {
  const errors: FormErrors = {};
  if (!isValidName(cleanName(fullName))) errors.fullName = 'INVALID_NAME';
  if (!normalizeIndianPhone(phone)) errors.phone = 'INVALID_PHONE';
  return errors;
}
