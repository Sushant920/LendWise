const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lendwise_token');
}

type ApiOptions = Omit<RequestInit, 'body'> & { body?: Record<string, unknown> };

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const body = options.body !== undefined ? JSON.stringify(options.body) : undefined;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message || 'Request failed');
  }
  return res.json() as Promise<T>;
}

export async function apiUpload(
  path: string,
  formData: FormData,
): Promise<{ id: string; type: string; fileName: string }> {
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message || 'Upload failed');
  }
  return res.json();
}

export function setToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem('lendwise_token', token);
}
export function clearToken() {
  if (typeof window !== 'undefined') localStorage.removeItem('lendwise_token');
}
