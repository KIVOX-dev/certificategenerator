export class ApiError extends Error {
  constructor(public code: string, public status: number, message: string) {
    super(message);
  }
}

export async function api<T = any>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const res = await fetch(`/api/admin${path}`, {
    credentials: 'same-origin',
    ...init,
    headers: { ...(init?.json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...init?.headers },
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  if (res.status === 401 && !path.startsWith('/auth/login')) {
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') window.location.href = '/login';
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const fields = body.fields ? ` (${Object.entries(body.fields).map(([k, v]) => `${k}: ${v}`).join(', ')})` : '';
    throw new ApiError(body.code ?? 'ERROR', res.status, `${body.message ?? 'Request failed'}${fields}`);
  }
  return res.json();
}

export const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
export const fmtDateTime = (d?: string | null) => (d ? new Date(d).toLocaleString('en-GB') : '—');
