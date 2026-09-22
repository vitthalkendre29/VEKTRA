export class ApiError extends Error {}

export async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : null;
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new ApiError(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export const fetcher = (url) => apiFetch(url);
export const post = (url, body) => apiFetch(url, { method: 'POST', body: JSON.stringify(body) });
export const patch = (url, body) => apiFetch(url, { method: 'PATCH', body: JSON.stringify(body) });
export const put = (url, body) => apiFetch(url, { method: 'PUT', body: JSON.stringify(body) });
export const del = (url) => apiFetch(url, { method: 'DELETE' });
