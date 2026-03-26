/**
 * Authenticated fetch helper
 * Reads the JWT from localStorage and adds Authorization header.
 * Automatically refreshes the token on 401 (same logic as the axios interceptor).
 */

let isRefreshing = false;
let refreshCallbacks: Array<(token: string) => void> = [];

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function setStoredToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem('token', token);
}

function removeStoredToken() {
  if (typeof window !== 'undefined') localStorage.removeItem('token');
}

function buildHeaders(token: string | null, extra?: HeadersInit): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra as Record<string, string> | undefined),
  };
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include', // sends the refreshToken cookie
    });
    if (!res.ok) return null;
    const data = await res.json();
    const newToken = data?.data?.token ?? null;
    if (newToken) setStoredToken(newToken);
    return newToken;
  } catch {
    return null;
  }
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredToken();

  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(token, options.headers as HeadersInit),
  });

  // If not 401, return as-is
  if (response.status !== 401) return response;

  // --- 401: attempt token refresh ---
  if (isRefreshing) {
    // Another call is already refreshing — queue this retry
    return new Promise((resolve) => {
      refreshCallbacks.push(async (newToken) => {
        const retried = await fetch(url, {
          ...options,
          headers: buildHeaders(newToken, options.headers as HeadersInit),
        });
        resolve(retried);
      });
    });
  }

  isRefreshing = true;
  const newToken = await refreshAccessToken();
  isRefreshing = false;

  if (!newToken) {
    // Refresh failed — clear auth and redirect to login
    removeStoredToken();
    if (
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/login') &&
      !window.location.pathname.startsWith('/register')
    ) {
      window.location.href = '/login';
    }
    // Drain queue with no token (they will also 401)
    refreshCallbacks.forEach((cb) => cb(''));
    refreshCallbacks = [];
    return response;
  }

  // Drain the queue with the new token
  refreshCallbacks.forEach((cb) => cb(newToken));
  refreshCallbacks = [];

  // Retry the original request with the new token
  return fetch(url, {
    ...options,
    headers: buildHeaders(newToken, options.headers as HeadersInit),
  });
}

export function getAuthToken(): string | null {
  return getStoredToken();
}

export function authHeaders(extra?: Record<string, string>): HeadersInit {
  return buildHeaders(getStoredToken(), extra);
}
