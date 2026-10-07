const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(endpoint, { token, ...options } = {}) {
  let response;
  try {
    response = await fetch(`${apiBaseUrl}${endpoint}`, {
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new Error('Unable to connect to the server. Please try again.');
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || 'Authentication request failed');
  return payload?.data ?? payload;
}

export function loginRequest({ email, password, role }) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  });
}

export function getCurrentUser(token) {
  return request('/api/auth/me', { token });
}
