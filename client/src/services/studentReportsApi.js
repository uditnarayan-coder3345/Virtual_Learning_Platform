const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getAuthToken() {
  return localStorage.getItem('vlp-auth-token') ?? sessionStorage.getItem('vlp-auth-token') ?? null;
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const payload = response.headers.get('content-type')?.includes('application/json') ? await response.json() : {};
  if (!response.ok) throw new Error(payload?.message || 'Request failed');
  return payload?.data ?? payload;
}

export function getStudentReports() {
  return request('/api/student/reports');
}

export function createStudentReport(payload) {
  return request('/api/student/reports', { method: 'POST', body: JSON.stringify(payload) });
}
