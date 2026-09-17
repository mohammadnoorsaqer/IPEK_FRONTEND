import { apiUrl } from './site';
import type { AuthTokens } from './types';

const ACCESS_KEY = 'ipek-access-token';
const REFRESH_KEY = 'ipek-refresh-token';

export class ApiError extends Error {
  status: number;
  messageAr?: string;

  constructor(status: number, message: string, messageAr?: string) {
    super(message);
    this.status = status;
    this.messageAr = messageAr;
  }
}

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(tokens: AuthTokens) {
  localStorage.setItem(ACCESS_KEY, tokens.access.token);
  localStorage.setItem(REFRESH_KEY, tokens.refresh.token);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

type Envelope<T> = {
  success?: boolean;
  data?: T;
  token?: AuthTokens;
  message?: string | { en?: string; ar?: string };
  message_ar?: string;
  code?: number;
};

let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const res = await fetch(`${apiUrl}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return false;
    }
    const json = (await res.json()) as Envelope<AuthTokens>;
    const tokens = json.token || json.data;
    if (!tokens?.access?.token) {
      clearTokens();
      return false;
    }
    setTokens(tokens);
    return true;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  { auth = false, retry = true }: { auth?: boolean; retry?: boolean } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getAccessToken();
  if (auth && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers,
    ...(typeof window === 'undefined' && !auth ? { next: { revalidate: 300 } } : {}),
    cache: auth ? 'no-store' : init.cache,
  });

  if (res.status === 401 && auth && retry) {
    const ok = await refreshTokens();
    if (ok) return apiRequest<T>(path, init, { auth, retry: false });
  }

  const json = (await res.json().catch(() => ({}))) as Envelope<T>;
  if (!res.ok) {
    const message =
      typeof json.message === 'string'
        ? json.message
        : json.message?.en || `API ${path} failed with ${res.status}`;
    const messageAr =
      typeof json.message === 'object' ? json.message?.ar : json.message_ar;
    throw new ApiError(res.status, message, messageAr);
  }

  return (json.data as T) ?? (json as T);
}

export function publicGet<T>(path: string) {
  return apiRequest<T>(path);
}

export function publicSend<T>(path: string, method: string, body?: unknown) {
  return apiRequest<T>(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function authGet<T>(path: string) {
  return apiRequest<T>(path, {}, { auth: true });
}

export function authSend<T>(path: string, method: string, body?: unknown) {
  return apiRequest<T>(
    path,
    {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
    },
    { auth: true },
  );
}
