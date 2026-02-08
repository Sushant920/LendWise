const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/** Message shown when fetch fails (e.g. backend not running). */
export const API_CONNECTION_ERROR =
  'Could not reach the server. Make sure the backend is running (e.g. cd backend && npm run start:dev).';

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
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      body,
    });
  } catch (e) {
    throw new Error(
      e instanceof TypeError && e.message === 'Failed to fetch'
        ? API_CONNECTION_ERROR
        : e instanceof Error
          ? e.message
          : 'Request failed',
    );
  }
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
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch (e) {
    throw new Error(
      e instanceof TypeError && e.message === 'Failed to fetch'
        ? API_CONNECTION_ERROR
        : e instanceof Error
          ? e.message
          : 'Upload failed',
    );
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message || 'Upload failed');
  }
  return res.json();
}

/** Download a file from the API (e.g. admin document download). */
export async function apiDownload(path: string, filename: string): Promise<void> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  a.click();
  URL.revokeObjectURL(url);
}

export function setToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem('lendwise_token', token);
}
export function clearToken() {
  if (typeof window !== 'undefined') localStorage.removeItem('lendwise_token');
}
