export class ApiError extends Error {
  constructor(public code: string, public status: number) {
    super(code);
  }
}

export interface PublicEvent {
  eventCode: string;
  name: string;
  description: string;
  organizationName: string;
  open: boolean;
}
export interface PublicCertificate {
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  certificateNumber: string;
  certificateId: string;
  recipientName: string | null;
  eventName: string | null;
  organizationName: string | null;
  certificateTitle: string | null;
  issueDate: string | null;
  downloadable: boolean;
}
export type RegisterOutcome = 'CREATED' | 'EXISTING' | 'PROCESSING';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  } catch {
    throw new ApiError('NETWORK', 0);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.code ?? 'GENERIC', res.status);
  }
  return res.json();
}

export const getEvent = (code: string) => request<PublicEvent>(`/api/events/${encodeURIComponent(code)}`);

export const registerForEvent = (code: string, fullName: string, phone: string) =>
  request<{ outcome: RegisterOutcome; certificate: PublicCertificate }>(`/api/events/${encodeURIComponent(code)}/register`, {
    method: 'POST',
    body: JSON.stringify({ fullName, phone }),
  });

export const getCertificate = (ref: string) => request<PublicCertificate>(`/api/certificates/${encodeURIComponent(ref)}`);
export const pdfUrl = (id: string) => `/api/certificates/${encodeURIComponent(id)}/pdf`;
export const previewUrl = (id: string) => `/api/certificates/${encodeURIComponent(id)}/preview`;

/** Maps any error to a plain-language message key. */
export function errorKey(e: unknown): string {
  const code = e instanceof ApiError ? e.code : 'GENERIC';
  if (code === 'NETWORK') return 'error.network';
  const known = ['INVALID_NAME', 'INVALID_PHONE', 'EVENT_NOT_FOUND', 'EVENT_CLOSED', 'CERTIFICATE_ERROR', 'TOO_MANY_REQUESTS'];
  return known.includes(code) ? `error.${code}` : 'error.generic';
}

export function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
}
