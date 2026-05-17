const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const TOKEN_KEY = 'snapcook_token';

async function request(method, path, body = null, isFormData = false) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body && !isFormData) headers['Content-Type'] = 'application/json';

  const options = { method, headers };
  if (body) options.body = isFormData ? body : JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // Backend returns errors as { error: '...' }; some endpoints use { message: '...' }. Honour both.
    throw new Error(err.error || err.message || res.statusText || `Request failed: ${res.status}`);
  }

  return res.status === 204 ? null : res.json();
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
  upload: (path, formData) => request('POST', path, formData, true),
};
