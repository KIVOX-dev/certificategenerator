import { randomBytes } from 'crypto';

const EVENT_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I

function random(alphabet: string, length: number): string {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export const generateEventCode = () => random(EVENT_ALPHABET, 8);
/** Unguessable public identifier used in certificate verification URLs (~80 bits). */
export const generateCertificateId = () => random('abcdefghjkmnpqrstuvwxyz23456789', 16);

export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
